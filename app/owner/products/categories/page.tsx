"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Folder, FolderCheck, FolderOpen, FolderX, Package, Plus } from "lucide-react";
import { ownerRequest, useOwnerData } from "@/stores/owner/api";
import { BackButton, Button, FormPage, FormPageState, FormSection, PhotoPicker, TextInput } from "@/app/owner/components/forms";
import { StatCard, formatDate } from "@/app/owner/components/ui";
import { PRODUCTS } from "@/app/owner/inventory/stock";
import type { Category, Product } from "@/app/owner/types";

const nameForm = (name?: string, picture?: File | null) => {
  const form = new FormData();
  if (name !== undefined) form.append("name", name.trim());
  if (picture) form.append("picture", picture, picture.name);
  return form;
};

function CategoryRow({ category, count, onSaved }: { category: Category; count: number; onSaved: () => void }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(category.name);
  const [busy, setBusy] = useState<string | null>(null);
  const img = category.image?.thumbnailUrl ?? category.image?.url;

  const run = async (key: string, path: string, init: RequestInit, done: string) => {
    setBusy(key);
    try {
      await ownerRequest(path, init);
      toast.success(done);
      onSaved();
      return true;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save");
      return false;
    } finally {
      setBusy(null);
    }
  };

  return (
    <li className="flex flex-wrap items-center gap-3 px-5 py-3">
      <label className="relative flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-xl bg-ivory ring-1 ring-inset ring-ink/10 hover:opacity-80" title="Change photo">
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element -- the API's storage
          <img loading="lazy" decoding="async" src={img} alt="" className="h-full w-full object-cover" />
        ) : (
          <Folder className="h-5 w-5 text-ink/40" />
        )}
        <input
          type="file"
          accept="image/*"
          className="sr-only"
          aria-label={`Change photo of ${category.name}`}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) run("photo", `/categories/${category.id}`, { method: "PATCH", body: nameForm(undefined, file) }, "Photo changed");
          }}
        />
      </label>
      {editing ? (
        <>
          <TextInput value={name} onChange={(e) => setName(e.target.value)} autoFocus className="h-9 min-w-40 flex-1" />
          <Button
            small
            busy={busy === "name"}
            onClick={async () => {
              if (name.trim() && (await run("name", `/categories/${category.id}`, { method: "PATCH", body: nameForm(name) }, "Category renamed"))) setEditing(false);
            }}
          >
            Save
          </Button>
          <Button small tone="quiet" onClick={() => (setEditing(false), setName(category.name))}>
            Cancel
          </Button>
        </>
      ) : (
        <>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-ink">{category.name}</p>
            <p className="text-xs text-ink/50">
              {count} {count === 1 ? "product" : "products"}
              {category.createdAt ? ` · Added ${formatDate(category.createdAt)}` : ""}
            </p>
          </div>
          <Button small tone="quiet" busy={busy === "photo"} onClick={() => setEditing(true)}>
            Rename
          </Button>
          <Button
            small
            tone="quiet"
            busy={busy === "delete"}
            disabled={count > 0}
            title={count > 0 ? "Move its products to another category first" : undefined}
            onClick={() => run("delete", `/categories/${category.id}/delete`, { method: "DELETE" }, `${category.name} removed`)}
          >
            Remove
          </Button>
        </>
      )}
    </li>
  );
}

// Group products the way the till shows them. Each group needs a photo: it is what
// cashiers tap on the till.
export default function CategoriesPage() {
  const categories = useOwnerData<Category[]>("/categories");
  const products = useOwnerData<Product[]>("/products");
  const [name, setName] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [adding, setAdding] = useState(false);
  const [search, setSearch] = useState("");

  if (!categories.data)
    return <FormPageState back={PRODUCTS} backLabel="Products" loading={categories.loading} error={categories.error} onRetry={categories.reload} />;

  const counts = (products.data ?? []).reduce<Record<string, number>>((acc, p) => {
    if (p.category) acc[p.category.id] = (acc[p.category.id] ?? 0) + 1;
    return acc;
  }, {});
  const all = [...categories.data].sort((a, b) => a.name.localeCompare(b.name));
  const inUse = all.filter((c) => (counts[c.id] ?? 0) > 0).length;
  const q = search.trim().toLowerCase();
  const shown = all.filter((c) => !q || c.name.toLowerCase().includes(q));
  const reload = () => {
    categories.reload();
    products.reload();
  };

  const add = async () => {
    if (!name.trim()) return toast.error("Please enter a category name.");
    if (!photo) return toast.error("Please choose a category photo.");
    setAdding(true);
    try {
      await ownerRequest("/categories", { method: "POST", body: nameForm(name, photo) });
      toast.success(`${name.trim()} added`);
      setName("");
      setPhoto(null);
      reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add category");
    } finally {
      setAdding(false);
    }
  };

  return (
    <FormPage
      back={PRODUCTS}
      backLabel="Products"
      eyebrow="Inventory"
      title="Categories"
      description="Group products the way your till shows them. Changes save as you make them."
      actions={<BackButton href={PRODUCTS}>Done</BackButton>}
    >
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard tone="dark" label="Total categories" value={all.length.toLocaleString()} icon={FolderOpen} hint="Product groups" />
        <StatCard label="In use" value={inUse.toLocaleString()} icon={FolderCheck} hint="Have at least one product" />
        <StatCard label="Empty" value={(all.length - inUse).toLocaleString()} icon={FolderX} hint="No products yet" />
        <StatCard label="Products" value={Object.values(counts).reduce((a, b) => a + b, 0).toLocaleString()} icon={Package} hint="In a category" />
      </div>

      <FormSection title="New category" description="Both a photo and a name are needed">
        <PhotoPicker file={photo} onChange={setPhoto} />
        <p className="text-xs text-ink/55">Use a clear, square photo that represents the whole group. It is what cashiers tap on the till.</p>
        <div className="flex gap-2">
          <TextInput value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} placeholder="e.g. Drinks, Snacks, Bakery" />
          <Button icon={Plus} onClick={add} busy={adding}>
            Add category
          </Button>
        </div>
      </FormSection>

      <section className="rounded-2xl border border-ink/10 bg-white shadow-[0_1px_2px_rgba(32,40,59,0.04)]">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/6 px-5 py-4">
          <div>
            <h2 className="text-sm font-bold text-ink">All categories</h2>
            <p className="mt-0.5 text-xs text-ink/55">Click a photo to change it. A category can be removed once it has no products.</p>
          </div>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories"
            className="h-9 w-full rounded-xl border border-ink/12 bg-white px-3 text-sm text-ink outline-none focus:border-ink focus:ring-4 focus:ring-lime/40 sm:w-56"
          />
        </header>
        <ul className="divide-y divide-ink/6">
          {shown.length === 0 && <li className="px-5 py-4 text-sm text-ink/55">{all.length ? "No matching categories." : "No categories yet."}</li>}
          {shown.map((c) => (
            <CategoryRow key={c.id} category={c} count={counts[c.id] ?? 0} onSaved={reload} />
          ))}
        </ul>
      </section>
    </FormPage>
  );
}
