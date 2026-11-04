// Shared rules of the stock pages, the same as the SmartPOS app's.
import type { AuditEntry, Product, StockMovement } from "@/app/owner/types";
import { timeAgo, toNumber } from "@/app/owner/components/ui";

export const PRODUCTS = "/owner/products";
export const INVENTORY = "/owner/inventory";
export const INGREDIENTS = "/owner/inventory/ingredients";
export const historyOf = (id: string) => `${INVENTORY}/${id}`;
// Stock pages opened from a list go back to that list.
export const restockOf = (id: string, back?: string) => `${PRODUCTS}/${id}/restock${back ? `?back=${encodeURIComponent(back)}` : ""}`;
export const wasteOf = (id: string, back?: string) => `${PRODUCTS}/${id}/waste${back ? `?back=${encodeURIComponent(back)}` : ""}`;

export const formatQty = (value: number | string | null | undefined) =>
  toNumber(value).toLocaleString(undefined, { maximumFractionDigits: 3 });

// "3 Tray + 12 Piece" for what is bought in bulk, otherwise "102 Piece".
export const formatStock = (quantity: number | string, product: Pick<Product, "unit" | "purchaseUnit" | "purchaseSize">) => {
  const stock = toNumber(quantity);
  const size = toNumber(product.purchaseSize);
  if (!product.purchaseUnit || !(size > 0) || stock < size) return `${formatQty(stock)} ${product.unit}`;
  const whole = Math.floor(stock / size);
  const rest = Math.round((stock - whole * size) * 1000) / 1000;
  return rest ? `${formatQty(whole)} ${product.purchaseUnit} + ${formatQty(rest)} ${product.unit}` : `${formatQty(whole)} ${product.purchaseUnit}`;
};

export const isLowStock = (p: Product) =>
  p.trackStock && p.lowStockLevel !== null && p.lowStockLevel !== undefined && toNumber(p.stockQuantity) <= toNumber(p.lowStockLevel);
export const isOut = (p: Product) => toNumber(p.stockQuantity) <= 0;

// "Added by Alice · Edited by Jean, 2 h ago"
export const whoLine = (product: Product) =>
  [
    product.createdBy?.name ? `Added by ${product.createdBy.name}` : product.createdAt ? `Added ${timeAgo(product.createdAt).toLowerCase()}` : "",
    product.updatedBy?.name && `Edited by ${product.updatedBy.name}, ${timeAgo(product.updatedAt).toLowerCase()}`,
  ]
    .filter(Boolean)
    .join(" · ");

export const daysUntil = (date: string) => Math.ceil((new Date(`${date.slice(0, 10)}T00:00:00`).getTime() - Date.now()) / 86_400_000);

export const expiryLabel = (date: string) => {
  const days = daysUntil(date);
  if (days < 0) return `Expired ${date.slice(0, 10)}`;
  if (days === 0) return "Expires today";
  return `Expires in ${days} day${days === 1 ? "" : "s"}`;
};

// Quantities can be parts of a unit, e.g. 1.5 kg.
export const quantityOnly = (value: string) => value.replace(/[^0-9.]/g, "");

// For things bought by value, like 500 RWF of spices with 100 RWF in each pot:
// the amount itself is money, so one unit always costs 1 RWF.
export const MONEY_UNIT = "RWF";

// The units an ingredient is kept in.
export const USE_UNITS = [
  { value: "Kg", how: "Weighed", examples: "Rice, sugar, beans, beef" },
  { value: "Gram", how: "Very small weights", examples: "Yeast, saffron" },
  { value: "Litre", how: "Poured", examples: "Oil, milk, sauce" },
  { value: "Millilitre", how: "Very small amounts poured", examples: "Vanilla, food colour" },
  { value: "Piece", how: "Counted one by one", examples: "Eggs, onions, whole chicken" },
  { value: "Bunch", how: "Tied together", examples: "Coriander, spring onions" },
  { value: "Bottle", how: "Used by the bottle", examples: "Soda, water, beer" },
  { value: MONEY_UNIT, how: "Bought by price", examples: "Spices, garlic, ginger" },
];

// How an ingredient may arrive. Only a dozen is always the same size.
export const BUY_UNITS: { value: string; size?: number }[] = [
  { value: "Kg" },
  { value: "Litre" },
  { value: "Sack" },
  { value: "Bag" },
  { value: "Basin" },
  { value: "Bucket" },
  { value: "Tray" },
  { value: "Crate" },
  { value: "Carton" },
  { value: "Pack" },
  { value: "Jerrycan" },
  { value: "Dozen", size: 12 },
];

// How shops here really sell a product: by the crate, the heap, the jerrycan, the tot.
export const UNIT_GROUPS = [
  { label: "Count", units: ["Piece", "Pair", "Dozen", "Set", "Roll", "Sheet"] },
  { label: "Packs", units: ["Pack", "Box", "Carton", "Crate", "Bundle", "Bag", "Sachet"] },
  { label: "Drinks", units: ["Bottle", "Can", "Glass", "Cup", "Jug", "Tot", "Shot", "Jerrycan"] },
  { label: "Food", units: ["Plate", "Portion", "Bowl", "Slice", "Skewer", "Loaf", "Buffet"] },
  { label: "Market", units: ["Heap", "Bunch", "Basin", "Sack", "Tray", "Tin", "Bucket"] },
  { label: "Measure", units: ["Kg", "Gram", "Tonne", "Litre", "Millilitre", "Metre", "Square metre"] },
  { label: "Health", units: ["Tablet", "Strip", "Capsule", "Vial", "Tube", "Dose"] },
  { label: "Services", units: ["Hour", "Day", "Night", "Room", "Session", "Visit", "Trip", "Person"] },
];
export const CUSTOM_UNITS = "Custom";
export const unitGroupOf = (unit: string) => UNIT_GROUPS.find((g) => g.units.includes(unit))?.label ?? CUSTOM_UNITS;

// What a recipe can be typed in, as how much of the ingredient's unit one is.
// Cups and spoons are for liquids only: a cup of rice has no fixed weight.
const LITRE_MEASURES = [
  { label: "ml", per: 0.001 },
  { label: "Tsp", per: 0.005, note: "5 ml" },
  { label: "Tbsp", per: 0.015, note: "15 ml" },
  { label: "Cup", per: 0.25, note: "250 ml" },
];

export type RecipeMeasure = { label: string; per: number; note?: string };

export const recipeMeasures = (unit: string): RecipeMeasure[] => {
  if (unit === "Kg") return [{ label: "g", per: 0.001 }, { label: "Kg", per: 1 }];
  if (unit === "Gram") return [{ label: "g", per: 1 }, { label: "Kg", per: 1000 }];
  if (unit === "Litre") return [...LITRE_MEASURES, { label: "Litre", per: 1 }];
  if (unit === "Millilitre") return [...LITRE_MEASURES.map((m) => ({ ...m, per: m.per * 1000 })), { label: "Litre", per: 1000 }];
  return [{ label: unit, per: 1 }];
};

export const MOVEMENT_REASON: Record<StockMovement["reason"], string> = {
  SALE: "Sale",
  RESTOCK: "Restock",
  ADJUSTMENT: "Stock count",
  WASTE: "Waste",
  REFUND: "Refund",
};

export const AUDIT_ACTION: Record<AuditEntry["action"], string> = { CREATE: "Added", UPDATE: "Edited", DELETE: "Deleted" };

export const AUDIT_FIELD: Record<string, string> = {
  name: "Name",
  buyingPrice: "Buy price",
  sellingPrice: "Sell price",
  barCode: "Barcode",
  ingredients: "Ingredients",
  active: "Active",
  unit: "Unit",
  sku: "SKU",
  supplier: "Supplier",
  description: "Description",
  trackStock: "Track stock",
  lowStockLevel: "Low-stock alert",
  expiryDate: "Expiry date",
  sendToKitchen: "Show in kitchen",
};

export const shownValue = (value: unknown) => {
  if (value === null || value === undefined || value === "") return "empty";
  if (typeof value === "boolean") return value ? "on" : "off";
  return String(value);
};

export const WASTE_REASONS = ["Spoiled", "Expired", "Spilled", "Burnt", "Damaged"];
