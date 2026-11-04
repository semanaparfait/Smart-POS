"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Check, Link2, Plus, Search, X } from "lucide-react";
import { ownerRequest } from "@/stores/owner/api";
import type { AuditEntry, ImageResult, Product, StockMovement } from "@/app/owner/types";
import { timeAgo, toNumber } from "@/app/owner/components/ui";
import { Button } from "@/app/owner/components/forms";
import {
  AUDIT_ACTION,
  AUDIT_FIELD,
  MONEY_UNIT,
  MOVEMENT_REASON,
  formatQty,
  recipeMeasures,
  shownValue,
  type RecipeMeasure,
} from "@/app/owner/inventory/stock";

// `quantity` is text while it is typed, e.g. "0.".
export type RecipeRow = { ingredientId: string; quantity: string };

const PORTIONS = [
  { label: "¼", value: 0.25 },
  { label: "½", value: 0.5 },
  { label: "1", value: 1 },
  { label: "2", value: 2 },
];

const round = (value: number) => Math.round(value * 1000) / 1000;

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`h-8 min-w-10 rounded-lg px-2.5 text-xs font-semibold transition-colors ${
        active ? "bg-ink text-white" : "bg-white text-ink ring-1 ring-inset ring-ink/12 hover:bg-ivory"
      }`}
    >
      {label}
    </button>
  );
}

// One line of a recipe. It is typed in whichever measure is easiest and saved in
// the ingredient's own unit, so 150 g of rice is kept as 0.15 Kg.
function RecipeAmount({
  name,
  unit,
  quantity,
  onChange,
  onRemove,
}: {
  name: string;
  unit: string;
  quantity: string;
  onChange: (quantity: string) => void;
  onRemove: () => void;
}) {
  const measures = recipeMeasures(unit);
  const [measure, setMeasure] = useState<RecipeMeasure>(measures[0]);
  const shown = (value: string, per: number) => (value === "" ? "" : String(round(Number(value) / per)));
  const [typed, setTyped] = useState(() => shown(quantity, measure.per));

  const type = (value: string) => {
    const clean = value.replace(/[^0-9.]/g, "");
    setTyped(clean);
    onChange(clean === "" ? "" : String(round(Number(clean) * measure.per)));
  };
  // Liquids and weights pick a measure; counted things are often split.
  const counted = measures.length === 1 && unit !== MONEY_UNIT;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <p className="min-w-0 flex-1 truncate text-sm font-semibold text-ink">{name}</p>
        <div className="relative w-36">
          <input
            inputMode="decimal"
            value={typed}
            onChange={(e) => type(e.target.value)}
            placeholder="0"
            aria-label={`Amount of ${name}`}
            className="h-10 w-full rounded-xl border border-ink/12 bg-white pl-3 pr-12 text-sm text-ink outline-none focus:border-ink focus:ring-4 focus:ring-lime/40"
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-ink/45">{measure.label}</span>
        </div>
        <button type="button" onClick={onRemove} aria-label={`Remove ${name}`} className="flex h-9 w-9 items-center justify-center rounded-lg text-ink/50 hover:bg-ivory hover:text-ink">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="flex flex-wrap justify-end gap-1.5 pr-11">
        {measures.length > 1 &&
          measures.map((option) => (
            <Chip
              key={option.label}
              label={option.label}
              active={option.label === measure.label}
              onClick={() => {
                setMeasure(option);
                setTyped(shown(quantity, option.per));
              }}
            />
          ))}
        {counted && PORTIONS.map((p) => <Chip key={p.label} label={p.label} active={Number(quantity) === p.value} onClick={() => type(String(p.value))} />)}
      </div>
      {measures.length > 1 && Number(quantity) > 0 && (
        <p className="pr-11 text-right text-[11px] text-ink/45">
          {measure.note ? `1 ${measure.label} = ${measure.note} · ` : ""}Takes {formatQty(quantity)} {unit} from stock
        </p>
      )}
    </div>
  );
}

// What one of a product is made from, and what that costs at today's prices.
export function RecipeEditor({
  rows,
  ingredients,
  sellingPrice,
  onChange,
}: {
  rows: RecipeRow[];
  ingredients: Product[];
  sellingPrice: number;
  onChange: (rows: RecipeRow[]) => void;
}) {
  const find = (id: string) => ingredients.find((p) => p.id === id);
  const left = ingredients.filter((p) => p.active && !rows.some((r) => r.ingredientId === p.id));
  const cost = rows.reduce((sum, row) => sum + Number(row.quantity || 0) * toNumber(find(row.ingredientId)?.buyingPrice), 0);

  if (!ingredients.length)
    return (
      <p className="text-xs text-ink/55">
        No ingredients yet. Add them under{" "}
        <Link href="/owner/inventory/ingredients" className="font-semibold text-ink underline">
          Inventory, Ingredients
        </Link>
        , then choose them here.
      </p>
    );

  return (
    <div className="space-y-3">
      {rows.map((row) => (
        <RecipeAmount
          key={row.ingredientId}
          name={find(row.ingredientId)?.name ?? "Ingredient"}
          unit={find(row.ingredientId)?.unit ?? ""}
          quantity={row.quantity}
          onChange={(quantity) => onChange(rows.map((r) => (r.ingredientId === row.ingredientId ? { ...r, quantity } : r)))}
          onRemove={() => onChange(rows.filter((r) => r !== row))}
        />
      ))}
      {left.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {left.map((ingredient) => (
            <button
              key={ingredient.id}
              type="button"
              onClick={() => onChange([...rows, { ingredientId: ingredient.id, quantity: "" }])}
              className="inline-flex h-9 items-center gap-1 rounded-xl px-3 text-xs font-semibold text-ink ring-1 ring-inset ring-ink/12 hover:bg-ivory"
            >
              <Plus className="h-3.5 w-3.5" />
              {ingredient.name}
            </button>
          ))}
        </div>
      )}
      {rows.length > 0 && (
        <div className="flex items-center justify-between rounded-xl bg-ivory px-4 py-3">
          <span className="text-xs font-semibold text-ink/60">Cost to make one</span>
          <span className="text-sm font-semibold text-ink">
            {Math.round(cost).toLocaleString()} RWF
            {sellingPrice > 0 ? ` · ${Math.round(sellingPrice - cost).toLocaleString()} RWF profit` : ""}
          </span>
        </div>
      )}
    </div>
  );
}

// The picture's own address. A Google Images page link carries it inside `imgurl`.
const pictureLink = (value: string) => {
  const link = value.trim();
  const inner = link.match(/[?&]imgurl=([^&]+)/);
  const url = inner ? decodeURIComponent(inner[1]) : link;
  return /^https?:\/\//i.test(url) ? url : null;
};

// Search free pictures by name, or paste a picture link, instead of uploading.
export function ImageSearch({
  name,
  selected,
  onPick,
  searchPath = "/products/image-search",
}: {
  name: string;
  selected: string | null;
  onPick: (url: string | null) => void;
  searchPath?: string;
}) {
  const [query, setQuery] = useState(name);
  const [results, setResults] = useState<ImageResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const edited = useRef(false);
  const [link, setLink] = useState("");
  const [linkError, setLinkError] = useState<string | null>(null);
  const linked = pictureLink(link);

  // Follows the name until the search box is typed in directly.
  useEffect(() => {
    if (!edited.current) setQuery(name);
  }, [name]);

  const pasteLink = (value: string) => {
    setLink(value);
    const url = pictureLink(value);
    setLinkError(
      !value.trim() || url ? null : value.trim().startsWith("data:") ? "Open the full picture first, then copy its image address." : "That is not a web link.",
    );
    onPick(url);
  };

  const search = async () => {
    const term = query.trim();
    if (term.length < 2) return setMessage("Type at least 2 letters.");
    setSearching(true);
    setMessage(null);
    try {
      const found = await ownerRequest<ImageResult[]>(`${searchPath}?q=${encodeURIComponent(term)}`);
      setResults(found);
      if (!found.length) setMessage(`No pictures found for "${term}". Try another word.`);
    } catch (err) {
      setResults([]);
      setMessage(err instanceof Error ? err.message : "Could not search");
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" />
          <input
            value={query}
            onChange={(e) => {
              edited.current = true;
              setQuery(e.target.value);
            }}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), search())}
            placeholder="Search a picture, e.g. tomatoes"
            className="h-11 w-full rounded-xl border border-ink/12 bg-white pl-10 pr-3.5 text-sm text-ink outline-none focus:border-ink focus:ring-4 focus:ring-lime/40"
          />
        </div>
        <Button onClick={search} busy={searching}>
          Search
        </Button>
      </div>
      {message && <p className="text-xs text-ink/55">{message}</p>}

      <div className="border-t border-ink/6 pt-3">
        <p className="mb-1.5 text-xs font-semibold text-ink">Or paste a picture link</p>
        <div className="relative">
          <Link2 className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" />
          <input
            value={link}
            onChange={(e) => pasteLink(e.target.value)}
            maxLength={2000}
            placeholder="https://..."
            className="h-11 w-full rounded-xl border border-ink/12 bg-white pl-10 pr-3.5 text-sm text-ink outline-none focus:border-ink focus:ring-4 focus:ring-lime/40"
          />
        </div>
        {linkError ? (
          <p className="mt-1.5 text-xs text-rose-600">{linkError}</p>
        ) : (
          <p className="mt-1.5 text-[11px] text-ink/50">Open the picture on any site, right-click it, and copy the image address.</p>
        )}
        {linked && (
          <div className="mt-3 flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element -- a picture from another site */}
            <img
              src={linked}
              alt=""
              className="h-26 w-26 rounded-xl object-cover"
              onError={() => {
                setLinkError("That link is a web page, not a picture. Copy the image address instead.");
                if (selected === linked) onPick(null);
              }}
            />
            {!linkError && selected === linked && <p className="text-xs font-semibold text-ink">This picture will be used.</p>}
          </div>
        )}
      </div>

      {results.length > 0 && (
        <>
          <div className="flex flex-wrap gap-2">
            {results.map((result) => {
              const active = selected === result.url;
              return (
                <button
                  key={result.url}
                  type="button"
                  onClick={() => onPick(active ? null : result.url)}
                  aria-label={`Use picture: ${result.title}`}
                  aria-pressed={active}
                  className={`relative h-26 w-26 overflow-hidden rounded-xl border-2 bg-ivory ${active ? "border-ink" : "border-transparent"}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- a free picture from Wikimedia */}
                  <img src={result.thumbnail} alt="" className="h-full w-full object-cover" />
                  {active && (
                    <span className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-ink text-lime">
                      <Check className="h-4 w-4" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-ink/50">Free pictures from Wikimedia Commons. Each has its own licence.</p>
        </>
      )}
    </div>
  );
}

export function MovementRow({ movement, unit }: { movement: StockMovement; unit: string }) {
  const change = toNumber(movement.change);
  return (
    <div className="flex items-center gap-3 border-b border-ink/6 py-3 last:border-0">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-ink">{MOVEMENT_REASON[movement.reason] ?? movement.reason}</p>
        <p className="mt-0.5 line-clamp-2 text-xs text-ink/55">{[movement.user?.name, timeAgo(movement.createdAt), movement.note].filter(Boolean).join(" · ")}</p>
      </div>
      <div className="text-right">
        <p className={`text-sm font-semibold ${change < 0 ? "text-rose-600" : "text-ink"}`}>
          {change > 0 ? "+" : ""}
          {formatQty(change)}
        </p>
        <p className="mt-0.5 text-xs text-ink/45">
          {formatQty(movement.quantityAfter)} {unit} left
        </p>
      </div>
    </div>
  );
}

// `name` is left out on the product's own history page.
export function AuditRow({ entry, name, href }: { entry: AuditEntry; name?: string; href?: string }) {
  // Only an edit lists field by field; the others hold the whole record.
  const changes =
    entry.action === "UPDATE" ? Object.entries(entry.changes ?? {}).filter(([field]) => AUDIT_FIELD[field]) : [];
  const body = (
    <>
      <p className="text-sm font-semibold text-ink">
        {AUDIT_ACTION[entry.action]}
        {name ? ` ${name}` : ""}
      </p>
      <p className="mt-0.5 text-xs text-ink/55">
        {entry.actor?.name ?? "System"} · {timeAgo(entry.createdAt)}
      </p>
      {changes.map(([field, change]) => {
        const c = (change ?? {}) as { from?: unknown; to?: unknown };
        return (
          <p key={field} className="mt-1 text-xs text-ink/70">
            {AUDIT_FIELD[field]}: {shownValue(c.from)} → {shownValue(c.to)}
          </p>
        );
      })}
    </>
  );
  const cls = "block border-b border-ink/6 py-3 last:border-0";
  return href ? (
    <Link href={href} className={`${cls} -mx-2 rounded-lg px-2 hover:bg-ivory/70`}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}
