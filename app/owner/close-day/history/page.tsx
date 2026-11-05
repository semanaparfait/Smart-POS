"use client";

import Link from "next/link";
import { ChevronRight, Lock } from "lucide-react";
import { useOwnerData } from "@/stores/owner/api";
import { EmptyState, ErrorState, PageHeader, Skeleton, rwf } from "@/app/owner/components/ui";
import { LinkButton } from "@/app/owner/components/forms";
import { when, type Closing } from "../closing";

// Every closed day, newest first.
export default function ClosingHistoryPage() {
  const list = useOwnerData<Closing[]>("/day-closings");
  if (list.error && !list.data) return <ErrorState message={list.error} onRetry={list.reload} />;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        eyebrow="Finance"
        title="Past closings"
        description="Each closed day: sales, money and stock as counted."
        actions={
          <LinkButton href="/owner/close-day" tone="lime" icon={Lock}>
            Close the day
          </LinkButton>
        }
      />
      {!list.data ? (
        <Skeleton className="h-64" />
      ) : list.data.length ? (
        <ul className="divide-y divide-ink/6 rounded-2xl border border-ink/10 bg-white">
          {list.data.map((c) => {
            const off = c.stock.filter((s) => s.counted !== null && s.difference !== 0).length;
            const short = Math.round(c.money.difference) < 0;
            return (
              <li key={c.id}>
                <Link href={`/owner/close-day/${c.id}`} className="flex flex-wrap items-center gap-3 px-5 py-3.5 hover:bg-ivory/60">
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-ink">
                      {new Date(`${c.businessDay}T12:00:00`).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
                    </span>
                    <span className="block text-xs text-ink/55">
                      Closed {when(c.closedAt)} by {c.closedByName}
                    </span>
                  </span>
                  <span className="text-sm font-semibold text-ink">{rwf(c.orders.paidTotal)}</span>
                  <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${short ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"}`}>
                    {short ? `${rwf(-c.money.difference)} missing` : "Money OK"}
                  </span>
                  <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${off ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"}`}>
                    {off ? `${off} stock off` : "Stock OK"}
                  </span>
                  <ChevronRight className="h-4 w-4 text-ink/30" />
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <EmptyState title="No day closed yet" text="Close the day at the end of business to send the owners the summary." icon={Lock} />
      )}
    </div>
  );
}
