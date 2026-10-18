import Link from "next/link";
import { LogoMark } from "@/app/components/Logo";
import {
  CreditCard,
  LayoutGrid,
  Package,
  Monitor,
  Users,
  Receipt,
  BarChart3,
  Bot,
  ArrowRight,
} from 'lucide-react';

type BoardOrder = { table: string; items: string; time: string; highlight?: boolean; ready?: boolean; done?: boolean };

export default function Features() {
  const featuresList = [
    {
      icon: CreditCard,
      title: 'Sales & Checkout',
      description: 'Fast and flexible payment options',
    },
    {
      icon: LayoutGrid,
      title: 'Table & Floor Management',
      description: 'Create floor maps and manage tables',
    },
    {
      icon: Package,
      title: 'Inventory Management',
      description: 'Track stock and get low stock alerts',
    },
    {
      icon: Monitor,
      title: 'Kitchen Display System (KDS)',
      description: 'Real-time order tracking',
    },
    {
      icon: Users,
      title: 'Employee Management',
      description: 'Roles, payroll, attendance & performance tracking',
    },
    {
      icon: Receipt,
      title: 'Expenses Management',
      description: 'Control costs and reduce waste',
    },
    {
      icon: BarChart3,
      title: 'Reports & Analytics',
      description: 'Real-time insights for better decisions',
    },
    {
      icon: Bot,
      title: 'AI Assistant',
      description: 'Smart support, anytime',
    },
  ];

  return (
    <section id="features" className="py-20 lg:py-28 bg-ivory">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="text-left mb-12">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-ink/50">
            Features
          </span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-ink tracking-tight">
            Everything You Need <br/> in <span className="lime-mark">One System</span>
          </h2>
          <p className="mt-4 max-w-2xl text-base sm:text-lg text-ink/65">
            SmartPOS comes with powerful features to help you manage your business, track sales, control inventory and serve your customers better.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">

          {/* Left Column: 8 Feature cards (2-column layout on md+) */}
          <div className="lg:col-span-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {featuresList.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className="group flex gap-3.5 rounded-2xl border border-ink/5 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-ink/15 hover:shadow-md"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ivory text-ink transition-colors duration-200 group-hover:bg-ink group-hover:text-lime">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-ink leading-snug">
                        {feature.title}
                      </h3>
                      <p className="mt-1 text-xs text-ink/60 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Explore All Features Button */}
            <div className="mt-8">
              <Link
                href="/request-installation"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-lime px-6 py-3.5 text-sm font-bold text-ink shadow-sm transition-all hover:bg-lime-dark hover:shadow-md active:scale-95"
              >
                <span>Request Installation</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>

          {/* Right Column: Tablet & Smartphone Graphic Mockup with Hand-written note */}
          <div className="lg:col-span-6 relative flex flex-col items-center">

            {/* Hand-written annotation with curved pointer top-right */}
            <div className="w-full text-right mb-2 pr-4 z-20">
              <div className="inline-block">
                <p className="font-handwriting text-2xl sm:text-3xl text-ink leading-none -rotate-2">
                  Manage your <br />
                  floor, tables and <br />
                  <span className="lime-mark font-bold">orders in real time.</span>
                </p>
                <svg className="w-16 h-10 text-ink ml-auto mt-1 -rotate-6" viewBox="0 0 100 60" fill="none" stroke="currentColor">
                  <path d="M20,10 Q60,30 80,50" strokeWidth="2.5" strokeDasharray="4 2" strokeLinecap="round" />
                  <polygon points="80,50 68,46 76,58" fill="currentColor" />
                </svg>
              </div>
            </div>

            {/* Visual: live order board (built in brand colors) */}
            <div
              role="img"
              aria-label="SmartPOS live order board with orders moving from new to cooking, ready and served"
              className="relative w-full max-w-xl"
            >
              <div className="absolute inset-10 z-0 rounded-full bg-lime/40 blur-3xl" />

              <div aria-hidden="true" className="relative overflow-hidden rounded-2xl bg-ink shadow-2xl shadow-ink/30 ring-1 ring-ink">
                {/* Top bar */}
                <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 text-white">
                  <span className="text-xs font-extrabold">
                    <LogoMark tone="dark" className="-my-1 mr-0.5 inline h-4 w-4 align-middle" />SmartPOS
                    <span className="ml-2 font-semibold text-white/50">Orders · Today</span>
                  </span>
                  <span className="flex items-center gap-1.5 text-[10px] font-semibold text-white/60">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-lime motion-reduce:animate-none" /> Live
                  </span>
                </div>

                {/* Columns */}
                <div className="grid grid-cols-2 gap-2.5 p-3 sm:grid-cols-4 sm:p-4">
                  {[
                    {
                      label: 'New',
                      orders: [
                        { table: 'T-02', items: '2 items', time: 'now' },
                        { table: 'Takeaway', items: '1 item', time: '1 min' },
                      ],
                    },
                    {
                      label: 'Cooking',
                      orders: [
                        { table: 'T-04', items: '6 items', time: '8 min', highlight: true },
                        { table: 'T-01', items: '3 items', time: '12 min' },
                      ],
                    },
                    {
                      label: 'Ready',
                      orders: [{ table: 'T-06', items: '2 items', time: '15 min', ready: true }],
                    },
                    {
                      label: 'Served',
                      orders: [
                        { table: 'T-03', items: '4 items', time: '22 min', done: true },
                        { table: 'T-05', items: '2 items', time: '31 min', done: true },
                      ],
                    },
                  ].map((col, ci) => (
                    <div key={col.label} className={`rounded-xl bg-white/5 p-2.5 ${ci > 1 ? 'hidden sm:block' : ''}`}>
                      <div className="mb-2.5 flex items-center justify-between px-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-white/60">{col.label}</span>
                        <span className="rounded bg-white/10 px-1.5 text-[10px] font-bold text-white/70">{col.orders.length}</span>
                      </div>
                      <div className="space-y-2">
                        {(col.orders as BoardOrder[]).map((o) => (
                          <div
                            key={o.table}
                            className={`rounded-lg p-2.5 ${
                              o.ready
                                ? 'bg-lime text-ink'
                                : o.highlight
                                  ? 'bg-white text-ink ring-2 ring-lime'
                                  : o.done
                                    ? 'bg-white/5 text-white/45 ring-1 ring-inset ring-white/10'
                                    : 'bg-white text-ink'
                            }`}
                          >
                            <p className="text-xs font-extrabold">{o.table}</p>
                            <div className="mt-1 flex items-center justify-between text-[10px] font-semibold opacity-70">
                              <span>{o.items}</span>
                              <span className="tabular-nums">{o.time}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer summary */}
                <div className="flex items-center justify-between border-t border-white/10 px-4 py-3 text-[11px] font-semibold text-white/55">
                  <span>5 open orders</span>
                  <span>
                    Avg. prep time <span className="font-extrabold text-white">11 min</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
