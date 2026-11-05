"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Check, Clock, Folder, PackagePlus, TrendingDown, TrendingUp } from "lucide-react";
import { ownerRequest } from "@/stores/owner/api";
import type { Category, Product, RecipeLine } from "@/app/owner/types";
import { toNumber } from "@/app/owner/components/ui";
import { BackButton, Button, Field, FormPage, FormSection, MoneyInput, PhotoPicker, Switch, TextArea, TextInput } from "@/app/owner/components/forms";
import { RecipeEditor, type RecipeRow } from "@/app/owner/inventory/StockParts";
import { CUSTOM_UNITS, PRODUCTS, UNIT_GROUPS, historyOf, quantityOnly, unitGroupOf, whoLine } from "@/app/owner/inventory/stock";

export { PRODUCTS };
export type { Category };

// Prices that make the ingredients this share of the price, rounded up to 100 RWF.
const FOOD_COST_TARGETS = [0.25, 0.3, 0.35];
const suggestedPrice = (cost: number, share: number) => Math.ceil(cost / share / 100) * 100;

function ChoiceRow({ options, value, onChange }: { options: string[]; value: string; onChange: (value: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const on = option === value;
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            aria-pressed={on}
            className={`h-9 rounded-xl px-3 text-xs font-semibold transition-colors ${on ? "bg-ink text-white" : "bg-white text-ink ring-1 ring-inset ring-ink/12 hover:bg-ivory"}`}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}

// The page for adding or changing a product. Same fields and rules as the app.
export function ProductForm({ product, categories, products }: { product: Product | null; categories: Category[]; products: Product[] }) {
  const router = useRouter();
  const [name, setName] = useState(product?.name ?? "");
  const [categoryId, setCategoryId] = useState(product?.category?.id ?? "");
  const [buyingPrice, setBuyingPrice] = useState(product && toNumber(product.buyingPrice) ? String(Math.round(toNumber(product.buyingPrice))) : "");
  const [sellingPrice, setSellingPrice] = useState(product && toNumber(product.sellingPrice) ? String(Math.round(toNumber(product.sellingPrice))) : "");
  const [unit, setUnit] = useState(product?.unit ?? "Piece");
  const [unitGroup, setUnitGroup] = useState(() => unitGroupOf(product?.unit ?? "Piece"));
  const [isIngredient, setIsIngredient] = useState(product?.isIngredient ?? false);
  const [active, setActive] = useState(product?.active ?? true);
  const [trackStock, setTrackStock] = useState(product?.trackStock ?? true);
  const [stockQuantity, setStockQuantity] = useState(product ? String(toNumber(product.stockQuantity)) : "");
  const [lowStockLevel, setLowStockLevel] = useState(product?.lowStockLevel != null ? String(toNumber(product.lowStockLevel)) : "");
  const [sendToKitchen, setSendToKitchen] = useState(product?.sendToKitchen ?? false);
  const [barCode, setBarCode] = useState(product?.barCode ?? "");
  const [sku, setSku] = useState(product?.sku ?? "");
  const [ingredientsText, setIngredientsText] = useState(product?.ingredients ?? "");
  const [supplier, setSupplier] = useState(product?.supplier ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [expiryDate, setExpiryDate] = useState(product?.expiryDate?.slice(0, 10) ?? "");
  const [photo, setPhoto] = useState<File | null>(null);
  const [recipe, setRecipe] = useState<RecipeRow[]>([]);
  // What the server has, so an unchanged recipe isn't saved again.
  const [savedRecipe, setSavedRecipe] = useState("[]");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!product || product.isIngredient) return;
    ownerRequest<RecipeLine[]>(`/products/${product.id}/recipe`)
      .then((lines) => {
        const rows = lines.map((line) => ({ ingredientId: line.ingredientId, quantity: String(line.quantity) }));
        setRecipe(rows);
        setSavedRecipe(JSON.stringify(rows));
      })
      .catch(() => toast.error("Could not load the recipe"));
  }, [product]);

  const ingredients = products.filter((p) => p.isIngredient);
  const showRecipe = sendToKitchen && !isIngredient;
  // A dish is never bought or kept on a shelf: its cost comes from its recipe.
  const recipeCost = recipe.reduce((sum, row) => sum + Number(row.quantity || 0) * toNumber(ingredients.find((p) => p.id === row.ingredientId)?.buyingPrice), 0);
  const dish = showRecipe && recipe.length > 0;
  const buy = dish ? Math.round(recipeCost) : Number(buyingPrice) || 0;
  const sell = Number(sellingPrice) || 0;
  const profit = sell - buy;
  const marginPct = sell > 0 ? Math.round((profit / sell) * 100) : 0;
  // For products with no barcode; one that already has a code keeps showing it.
  const showSku = !barCode.trim() || !!product?.sku;
  const currentPhoto = product?.images?.[0]?.thumbnailUrl ?? product?.images?.[0]?.url ?? null;

  const save = async () => {
    if (!name.trim() || (!categoryId && !isIngredient))
      return toast.error(isIngredient ? "Please fill in the name." : "Please fill in the product name and choose a category.");
    if (!photo && !currentPhoto && !isIngredient) return toast.error("Please choose a product photo.");
    if (showRecipe && recipe.some((row) => !(Number(row.quantity) > 0))) return toast.error("Enter how much of each ingredient one is made with.");
    if (sell <= 0 && !isIngredient) return toast.error("The sell price must be above 0.");
    if (!unit.trim()) return toast.error("Choose or type a unit.");
    setSaving(true);
    try {
      const form = new FormData();
      form.append("name", name.trim());
      // A dish keeps its recipe cost, so margins and reports use it.
      form.append("buyingPrice", String(buy));
      form.append("sellingPrice", String(isIngredient ? 0 : sell));
      if (categoryId && !isIngredient) form.append("categoryId", categoryId);
      form.append("isIngredient", String(isIngredient));
      // When editing they are always sent, so emptying a field clears it.
      if (product || barCode.trim()) form.append("barCode", barCode.trim());
      if (product || ingredientsText.trim()) form.append("ingredients", ingredientsText.trim());
      form.append("unit", unit.trim());
      // A dish's stock is its ingredients'.
      form.append("trackStock", String(dish ? false : trackStock));
      form.append("sendToKitchen", String(!isIngredient && sendToKitchen));
      form.append("sku", showSku ? sku.trim() : "");
      form.append("supplier", supplier.trim());
      form.append("description", description.trim());
      form.append("expiryDate", expiryDate);
      form.append("lowStockLevel", lowStockLevel);
      // It replaces the count, so an unchanged number isn't sent: a sale made
      // while the page was open would be undone.
      if (trackStock && !dish && stockQuantity !== "" && (!product || Number(stockQuantity) !== toNumber(product.stockQuantity)))
        form.append("stockQuantity", stockQuantity);
      if (photo) form.append("picture", photo, photo.name);

      let productId = product?.id;
      if (product) {
        await ownerRequest(`/products/${product.id}`, { method: "PATCH", body: form });
        if (active !== product.active) await ownerRequest(`/products/${product.id}/${active ? "activate" : "deactivate"}`, { method: "PATCH" });
      } else {
        productId = (await ownerRequest<Product>("/products", { method: "POST", body: form })).id;
      }
      if (showRecipe && JSON.stringify(recipe) !== savedRecipe) {
        try {
          await ownerRequest(`/products/${productId}/recipe`, {
            method: "PUT",
            body: JSON.stringify({ items: recipe.map((row) => ({ ingredientId: row.ingredientId, quantity: Number(row.quantity) })) }),
          });
        } catch (err) {
          // Saving the product again would add a duplicate, so it isn't retried.
          toast.error(`Product saved, but not its recipe: ${err instanceof Error ? err.message : ""}`);
          router.push(PRODUCTS);
          return;
        }
      }
      toast.success(product ? `${name.trim()} saved` : `${name.trim()} added`);
      router.push(PRODUCTS);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save the product");
      setSaving(false);
    }
  };

  return (
    <FormPage
      back={PRODUCTS}
      backLabel="Products"
      eyebrow="Inventory"
      title={product ? `Edit ${product.name}` : "Add a new product"}
      description={product ? "Your changes reach the till once you save." : "Fill in the details below. It is on the till right away."}
      actions={
        <>
          <BackButton href={PRODUCTS} />
          <Button onClick={save} busy={saving} icon={product ? Check : PackagePlus}>
            {product ? "Save" : "Add product"}
          </Button>
        </>
      }
    >
      {product && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-ink/10 bg-white px-5 py-3.5">
          <Clock className="h-4 w-4 text-ink/45" />
          <p className="flex-1 text-xs text-ink/60">{whoLine(product)}</p>
          <Link href={historyOf(product.id)} className="text-xs font-bold text-ink hover:underline">
            History
          </Link>
        </div>
      )}

      <FormSection title="Product photo" description={isIngredient ? "Optional for ingredients" : "Square image, shown on the till"}>
        <PhotoPicker current={currentPhoto} file={photo} onChange={setPhoto} />
      </FormSection>

      <FormSection title="Basic information">
        <Field label="Product name">
          <TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Organic Coffee" autoFocus={!product} />
        </Field>
        {!isIngredient && (
          <div>
            <p className="mb-1.5 text-xs font-semibold text-ink">Category</p>
            {categories.length === 0 ? (
              <p className="text-xs text-ink/55">
                No categories yet.{" "}
                <Link href={`${PRODUCTS}/categories`} className="font-semibold text-ink underline">
                  Add one first
                </Link>
                .
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {categories.map((c) => {
                  const on = categoryId === c.id;
                  const img = c.image?.thumbnailUrl ?? c.image?.url;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCategoryId(c.id)}
                      aria-pressed={on}
                      className={`inline-flex items-center gap-2 rounded-xl py-1.5 pl-1.5 pr-3.5 text-xs font-semibold transition-colors ${
                        on ? "bg-ink text-white" : "bg-white text-ink ring-1 ring-inset ring-ink/12 hover:bg-ivory"
                      }`}
                    >
                      <span className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-lg bg-ivory">
                        {img ? (
                          // eslint-disable-next-line @next/next/no-img-element -- the API's storage
                          <img loading="lazy" decoding="async" src={img} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <Folder className="h-3.5 w-3.5 text-ink/45" />
                        )}
                      </span>
                      {c.name}
                      {on && <Check className="h-3.5 w-3.5 text-lime" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
        <Switch
          checked={isIngredient}
          onChange={(on) => {
            setIsIngredient(on);
            if (on) {
              setTrackStock(true);
              setSendToKitchen(false);
            }
          }}
          label="Ingredient"
          hint="Used to make other products, like beef or cooking oil. Never sold on the till."
        />
        {product && <Switch checked={active} onChange={setActive} label="Active" hint="Turn off to stop selling this product." />}
      </FormSection>

      <FormSection title="Pricing" description="Prices in Rwandan francs">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {dish ? (
            <Field label="Cost to make one" hint="From the recipe below">
              <div className="flex h-11 items-center rounded-xl bg-ivory px-3.5 text-sm font-semibold text-ink ring-1 ring-inset ring-ink/10">{buy.toLocaleString()} RWF</div>
            </Field>
          ) : (
            <Field label={isIngredient ? `Cost per ${unit || "unit"}` : "Buy price"}>
              <MoneyInput value={buyingPrice} onChange={setBuyingPrice} />
            </Field>
          )}
          {!isIngredient && (
            <Field label="Sell price">
              <MoneyInput value={sellingPrice} onChange={setSellingPrice} />
            </Field>
          )}
        </div>
        {(buy > 0 || sell > 0) && !isIngredient && (
          <div className={`flex items-center justify-between rounded-xl px-4 py-3 ${profit < 0 ? "bg-rose-50" : "bg-ink"}`}>
            <span className={`inline-flex items-center gap-2 text-xs font-semibold ${profit < 0 ? "text-rose-600" : "text-white/70"}`}>
              {profit < 0 ? <TrendingDown className="h-4 w-4" /> : <TrendingUp className="h-4 w-4 text-lime" />}
              {profit < 0 ? "Selling below cost" : "Profit per unit"}
            </span>
            <span className={`text-sm font-extrabold ${profit < 0 ? "text-rose-600" : "text-lime"}`}>
              {profit >= 0 ? "+" : ""}
              {profit.toLocaleString()} RWF · {marginPct}%
            </span>
          </div>
        )}
        {dish && buy > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-ink/60">A common rule for kitchens is that ingredients cost about 30% of the price. Click a price to use it, or type your own.</p>
            <div className="flex flex-wrap gap-2">
              {FOOD_COST_TARGETS.map((share) => {
                const price = suggestedPrice(buy, share);
                const on = sell === price;
                return (
                  <button
                    key={share}
                    type="button"
                    onClick={() => setSellingPrice(String(price))}
                    aria-pressed={on}
                    className={`rounded-xl px-3 py-2 text-left transition-colors ${on ? "bg-ink text-white" : "bg-white text-ink ring-1 ring-inset ring-ink/12 hover:bg-ivory"}`}
                  >
                    <span className="block text-sm font-bold">{price.toLocaleString()} RWF</span>
                    <span className={`block text-[11px] ${on ? "text-white/60" : "text-ink/50"}`}>Ingredients {Math.round(share * 100)}% of price</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </FormSection>

      {!dish && (
        <FormSection title="Stock" description="How this product is counted">
          <div>
            <p className="mb-1.5 text-xs font-semibold text-ink">Unit · {unit || "Not chosen"}</p>
            <ChoiceRow
              options={[...UNIT_GROUPS.map((g) => g.label), CUSTOM_UNITS]}
              value={unitGroup}
              onChange={(group) => {
                setUnitGroup(group);
                if (group === CUSTOM_UNITS) setUnit("");
              }}
            />
            <div className="mt-3 border-t border-ink/6 pt-3">
              {unitGroup === CUSTOM_UNITS ? (
                <TextInput value={unit} maxLength={20} onChange={(e) => setUnit(e.target.value)} placeholder="Type your own unit" />
              ) : (
                <ChoiceRow options={UNIT_GROUPS.find((g) => g.label === unitGroup)?.units ?? []} value={unit} onChange={setUnit} />
              )}
            </div>
          </div>
          <Switch checked={trackStock} onChange={setTrackStock} label="Track stock" hint="Turn off for cooked meals and services." />
          {trackStock && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Quantity in stock" hint={product ? "Change only after a count" : undefined}>
                <TextInput inputMode="decimal" value={stockQuantity} onChange={(e) => setStockQuantity(quantityOnly(e.target.value))} placeholder="0" />
              </Field>
              <Field label="Low-stock alert at">
                <TextInput inputMode="decimal" value={lowStockLevel} onChange={(e) => setLowStockLevel(quantityOnly(e.target.value))} placeholder="0" />
              </Field>
            </div>
          )}
        </FormSection>
      )}

      {showRecipe && (
        <FormSection title="Recipe" description="What one is made from. Each sale takes these out of stock.">
          <p className="rounded-xl bg-ivory px-3.5 py-3 text-xs text-ink/70">
            {product?.canMake !== null && product?.canMake !== undefined ? `Enough ingredients to make ${product.canMake.toLocaleString()} now. ` : ""}
            Dishes have no stock of their own. What you can sell depends on the ingredients left, and each sale takes them out.
          </p>
          <RecipeEditor rows={recipe} ingredients={ingredients} sellingPrice={sell} onChange={setRecipe} />
        </FormSection>
      )}

      <FormSection title="Details" description="Optional">
        <Field label="Barcode / QR code" hint="Type it, or scan it with a barcode reader into this box.">
          <TextInput value={barCode} onChange={(e) => setBarCode(e.target.value)} placeholder="Scan or enter code" />
        </Field>
        {showSku && (
          <Field label="SKU / product code">
            <TextInput value={sku} onChange={(e) => setSku(e.target.value)} placeholder="For products without a barcode" />
          </Field>
        )}
        <Field label="Ingredients">
          <TextArea value={ingredientsText} onChange={(e) => setIngredientsText(e.target.value)} placeholder="e.g. Sugar, Milk, Coffee" />
        </Field>
        {!isIngredient && <Switch checked={sendToKitchen} onChange={setSendToKitchen} label="Show in kitchen" hint="Off means the kitchen never sees this product." />}
        <details className="border-t border-ink/6 pt-3" open={!!(expiryDate || supplier || description)}>
          <summary className="cursor-pointer text-sm font-semibold text-ink">More details</summary>
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Expiry date">
                <TextInput type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
              </Field>
              <Field label="Supplier">
                <TextInput value={supplier} onChange={(e) => setSupplier(e.target.value)} placeholder="Who you reorder from" />
              </Field>
            </div>
            <Field label="Short description">
              <TextArea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="A short note about this product" />
            </Field>
          </div>
        </details>
      </FormSection>
    </FormPage>
  );
}
