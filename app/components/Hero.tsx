import type { CSSProperties } from 'react';
import Link from "next/link";
import { LogoMark } from "@/app/components/Logo";
import { ArrowDownRight, ArrowRight, Search } from 'lucide-react';

/* ------------------------------------------------------------------
 * Sample data for the interface preview.
 * It shows what a SmartPOS customer would see in their own workspace;
 * none of it represents SmartPOS company results.
 * ------------------------------------------------------------------ */

const modules = ['Overview', 'Sales', 'Stock', 'Staff', 'Reports'];

const kpis = [
  { label: 'Net sales today', value: '1,284,500', unit: 'RWF', note: '+9.4% vs yesterday' },
  { label: 'Transactions', value: '412', note: '38 in the last hour' },
  { label: 'Average ticket', value: '3,118', unit: 'RWF', note: 'Across all tills' },
];

// Hourly sales index, 08:00 → 20:00. Today runs until "now" (14:35).
const hours = ['08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20'];
const yesterday = [10, 22, 30, 48, 62, 58, 44, 40, 46, 58, 72, 66, 50];
const today = [12, 26, 36, 55, 74, 70, 52];

const transactions = [
  { time: '14:32', ref: 'Table 4', method: 'MoMo', amount: '30,500' },
  { time: '14:27', ref: 'Counter 2', method: 'Cash', amount: '8,000' },
  { time: '14:19', ref: 'Room 12', method: 'Card', amount: '56,200' },
  { time: '14:05', ref: 'Takeaway', method: 'MoMo', amount: '12,500' },
];

const onShift = ['AM', 'JC', 'EN', 'DU'];

/* Chart geometry */
const W = 640;
const H = 200;
const BASE = 188;
const x = (i: number) => (i * W) / (hours.length - 1);
const y = (v: number) => BASE - v * 2.2;
const linePath = (values: number[]) =>
  values.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');

const todayLine = linePath(today);
const todayArea = `${todayLine} L${x(today.length - 1).toFixed(1)},${BASE} L0,${BASE} Z`;
const yesterdayLine = linePath(yesterday);
const nowX = x(today.length - 1);
const nowY = y(today[today.length - 1]);

const delay = (ms: number) => ({ '--delay': `${ms}ms` }) as CSSProperties;

export default function Hero() {
  return (
    <section aria-labelledby="hero-heading" className="relative overflow-hidden bg-ivory">

      {/* ===== Editorial headline ===== */}
      <div className="mx-auto max-w-7xl px-4 pt-14 sm:px-6 sm:pt-20 lg:px-8 lg:pt-24">
        <p className="hero-rise flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.28em] text-ink/60 sm:text-xs">
          <span className="h-2 w-2 bg-lime ring-1 ring-ink/20" aria-hidden="true" />
          Business management, reimagined
        </p>

        <h1
          id="hero-heading"
          className="hero-rise mt-7 text-[clamp(2.75rem,6.6vw,6rem)] font-extrabold leading-[0.98] tracking-[-0.032em] text-ink"
          style={delay(80)}
        >
          <span className="block">Your entire business.</span>
          <span className="block lg:pl-[16.666%]">
            In better{' '}
            <span className="underline decoration-lime decoration-[0.14em] underline-offset-[0.12em] [text-decoration-skip-ink:none]">
              control
            </span>
            .
          </span>
        </h1>

        {/* Editorial rule + three-column row */}
        <div
          className="hero-rise mt-12 grid grid-cols-1 gap-8 border-t border-ink/15 pt-8 md:grid-cols-12 md:gap-6 lg:mt-14"
          style={delay(180)}
        >
          <p className="order-3 text-xs font-semibold uppercase leading-relaxed tracking-[0.16em] text-ink/55 md:order-1 md:col-span-3">
            Built for retail, restaurants, hospitality &amp; growing businesses.
          </p>

          <p className="order-1 max-w-xl text-lg leading-relaxed text-ink/75 md:order-2 md:col-span-5 lg:text-xl">
            From the counter to your inventory, SmartPOS brings sales, stock, staff, and
            business performance into one connected workspace.
          </p>

          <div className="order-2 flex flex-col gap-3 sm:flex-row md:order-3 md:col-span-4 md:flex-col md:items-end lg:flex-row lg:items-start lg:justify-end">
            <Link
              href="/request-installation"
              className="group inline-flex items-center justify-center gap-2 rounded-md bg-lime px-6 py-3.5 text-sm font-bold text-ink transition-colors duration-200 hover:bg-lime-dark focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ink/25"
            >
              Get Started
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
            <a
              href="#how-it-works"
              className="group inline-flex items-center justify-center gap-2 rounded-md px-6 py-3.5 text-sm font-bold text-ink ring-1 ring-inset ring-ink/20 transition-colors duration-200 hover:bg-white hover:ring-ink/40 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ink/25"
            >
              See How It Works
              <ArrowDownRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:translate-y-0.5" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>

      {/* ===== Product stage: straddles ivory → white ===== */}
      <div className="relative mt-14 lg:mt-16">
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-white" aria-hidden="true" />

        <div className="relative mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8 lg:pb-20">
          <figure
            role="img"
            aria-label="Preview of the SmartPOS workspace: today's sales, an hourly sales chart compared with yesterday, recent payments, a low stock alert and staff on shift"
            className="hero-rise overflow-hidden rounded-xl bg-ink text-white shadow-[0_50px_100px_-40px_rgba(32,40,59,0.55)]"
            style={delay(280)}
          >
            <div aria-hidden="true">
              {/* Top bar: workspace + module tabs (the copy's nouns, as navigation) */}
              <div className="flex items-center justify-between gap-4 border-b border-white/10 px-4 sm:px-6">
                <div className="flex min-w-0 items-center gap-6">
                  <span className="flex shrink-0 items-center gap-1 py-4 text-sm font-extrabold tracking-tight">
                    <LogoMark tone="dark" className="h-5 w-5" />
                    SmartPOS
                  </span>
                  <nav className="flex min-w-0 items-center gap-5 overflow-hidden text-[13px] font-semibold">
                    {modules.map((m, i) => (
                      <span
                        key={m}
                        className={`relative shrink-0 py-4 ${i === 0 ? 'text-white' : 'text-white/45'} ${i > 2 ? 'hidden sm:inline' : ''}`}
                      >
                        {m}
                        {i === 0 && <span className="absolute inset-x-0 -bottom-px h-0.5 bg-lime" />}
                      </span>
                    ))}
                  </nav>
                </div>
                <div className="hidden shrink-0 items-center gap-3 md:flex">
                  <span className="flex items-center gap-2 rounded-md bg-white/5 px-3 py-1.5 text-[12px] text-white/45 ring-1 ring-inset ring-white/10">
                    <Search className="h-3.5 w-3.5" />
                    Search products, orders…
                  </span>
                  <span className="rounded-md px-2.5 py-1.5 text-[12px] font-semibold text-white/70 ring-1 ring-inset ring-white/10">
                    Main branch
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12">
                {/* ---- Left: KPIs + chart ---- */}
                <div className="p-4 sm:p-6 lg:col-span-8 lg:border-r lg:border-white/10 lg:p-8">
                  <div className="flex items-baseline justify-between">
                    <p className="text-[13px] font-semibold text-white/55">Today · Sunday</p>
                    <p className="flex items-center gap-2 text-[12px] font-semibold text-white/55">
                      <span className="h-1.5 w-1.5 rounded-full bg-lime" />
                      Live · updated 14:35
                    </p>
                  </div>

                  <dl className="mt-5 grid grid-cols-2 gap-y-5 sm:grid-cols-3 sm:divide-x sm:divide-white/10">
                    {kpis.map((k, i) => (
                      <div key={k.label} className={`${i === 0 ? 'col-span-2 sm:col-span-1' : ''} sm:px-6 sm:first:pl-0`}>
                        <dt className="text-[12px] font-medium text-white/55">{k.label}</dt>
                        <dd className="mt-1.5 flex items-baseline gap-1.5">
                          {k.unit && <span className="text-xs font-semibold text-white/45">{k.unit}</span>}
                          <span className="text-2xl font-extrabold tracking-tight tabular-nums sm:text-[1.75rem]">{k.value}</span>
                        </dd>
                        <dd className={`mt-1 text-[12px] ${i === 0 ? 'font-semibold text-lime' : 'text-white/45'}`}>{k.note}</dd>
                      </div>
                    ))}
                  </dl>

                  {/* Chart */}
                  <div className="mt-8">
                    <div className="flex items-center justify-between text-[12px]">
                      <p className="font-semibold text-white/80">Sales by hour</p>
                      <div className="flex items-center gap-4 text-white/50">
                        <span className="flex items-center gap-1.5">
                          <span className="h-0.5 w-4 bg-lime" /> Today
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="w-4 border-t border-dashed border-white/40" /> Yesterday
                        </span>
                      </div>
                    </div>

                    <svg viewBox={`0 0 ${W} ${H}`} className="mt-4 block h-auto w-full overflow-visible">
                      {[0.25, 0.5, 0.75].map((t) => (
                        <line key={t} x1="0" x2={W} y1={BASE * t} y2={BASE * t} stroke="white" strokeOpacity="0.07" />
                      ))}
                      <line x1="0" x2={W} y1={BASE} y2={BASE} stroke="white" strokeOpacity="0.15" />

                      <path d={yesterdayLine} fill="none" stroke="white" strokeOpacity="0.3" strokeWidth="1.5" strokeDasharray="4 5" />

                      <path d={todayArea} className="hero-fade fill-lime" fillOpacity="0.1" style={delay(1500)} />
                      <path
                        d={todayLine}
                        pathLength={1}
                        className="hero-draw stroke-lime"
                        fill="none"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={delay(600)}
                      />

                      {/* "Now" marker */}
                      <g className="hero-fade" style={delay(1900)}>
                        <line x1={nowX} x2={nowX} y1={nowY} y2={BASE} stroke="#d0e66b" strokeOpacity="0.4" strokeDasharray="2 3" />
                        <circle cx={nowX} cy={nowY} r="9" className="fill-lime" fillOpacity="0.2" />
                        <circle cx={nowX} cy={nowY} r="4.5" className="fill-lime stroke-ink" strokeWidth="2" />
                      </g>
                    </svg>

                    <div className="mt-2 flex justify-between text-[11px] tabular-nums text-white/40">
                      {hours.map((h, i) => (
                        <span key={h} className={i % 2 === 1 ? 'hidden sm:inline' : ''}>{h}:00</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ---- Right: payments, stock, staff ---- */}
                <div className="hidden border-t border-white/10 md:grid md:grid-cols-2 lg:col-span-4 lg:block lg:border-t-0">
                  <div className="p-6 lg:p-8 lg:pb-6">
                    <p className="text-[13px] font-semibold text-white/80">Recent payments</p>
                    <ul className="mt-4 divide-y divide-white/10">
                      {transactions.map((t) => (
                        <li key={t.time} className="flex items-center justify-between py-3 text-[13px]">
                          <div>
                            <p className="font-semibold">{t.ref}</p>
                            <p className="mt-0.5 text-[11px] text-white/45">
                              {t.time} · {t.method}
                            </p>
                          </div>
                          <p className="font-bold tabular-nums">
                            <span className="mr-1 text-[11px] font-semibold text-white/45">RWF</span>
                            {t.amount}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="border-white/10 p-6 md:border-l lg:border-l-0 lg:border-t lg:p-8 lg:pt-6">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-lime">Stock alert</p>
                        <p className="mt-1.5 text-[13px] font-semibold">Fanta 33cl · 6 left</p>
                        <p className="mt-0.5 text-[11px] text-white/45">Below reorder level of 24</p>
                      </div>
                      <span className="shrink-0 rounded-md bg-lime px-2.5 py-1.5 text-[11px] font-bold text-ink">Reorder</span>
                    </div>

                    <div className="mt-6 flex items-center justify-between">
                      <p className="text-[12px] text-white/55">On shift now</p>
                      <div className="flex gap-1">
                        {onShift.map((n) => (
                          <span
                            key={n}
                            className="flex h-7 w-7 items-center justify-center rounded-full bg-ink-soft text-[10px] font-bold text-white/85 ring-2 ring-ink"
                          >
                            {n}
                          </span>
                        ))}
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[10px] font-bold text-ink ring-2 ring-ink">
                          +1
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </figure>

          <p className="mt-4 text-right text-[11px] font-medium text-ink/45">
            Interface preview · sample data
          </p>
        </div>
      </div>
    </section>
  );
}
