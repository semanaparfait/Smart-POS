import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Home, MessageCircle } from "lucide-react";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import { LogoMark } from "@/app/components/Logo";

export const metadata: Metadata = {
  title: "Page not found | SmartPOS",
  description: "The page you are looking for does not exist or has moved.",
};

const popularPages = [
  { label: "Features", note: "Everything SmartPOS can do", href: "/#features" },
  { label: "Pricing", note: "Plans for every business size", href: "/#pricing" },
  { label: "Request installation", note: "Get SmartPOS set up", href: "/request-installation" },
  { label: "Contact", note: "Talk to our team", href: "/contact" },
];

/** Zig-zag torn edge at the bottom of the receipt */
const tornEdge = {
  WebkitMask:
    "conic-gradient(from -45deg at bottom, #0000, #000 1deg 89deg, #0000 90deg) 50% / 18px 100%",
  mask: "conic-gradient(from -45deg at bottom, #0000, #000 1deg 89deg, #0000 90deg) 50% / 18px 100%",
} as const;

export default function NotFound() {
  return (
    <div className="site flex min-h-screen flex-col bg-ivory text-ink">
      <Navbar />

      <main className="dot-grid flex-1">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-12 lg:gap-10 lg:px-8">
          {/* Message */}
          <section className="lg:col-span-7">
            <p className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.28em] text-ink/60 sm:text-xs">
              <span className="h-2 w-2 bg-lime ring-1 ring-ink/20" aria-hidden="true" />
              Error 404
            </p>

            <h1 className="mt-5 max-w-2xl text-[clamp(2.5rem,6vw,4.75rem)] font-extrabold leading-[1.02] tracking-[-0.04em]">
              This page didn&apos;t make it to the <span className="lime-mark">receipt</span>.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink/70">
              The page you&apos;re looking for doesn&apos;t exist, has moved, or the link has a typo. Let&apos;s get you
              back to business.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/"
                className="group inline-flex items-center justify-center gap-2 rounded-md bg-lime px-6 py-3.5 text-sm font-bold text-ink transition-colors hover:bg-lime-dark focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ink/25"
              >
                <Home className="h-4 w-4" aria-hidden="true" />
                Back to home
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-md px-6 py-3.5 text-sm font-bold text-ink ring-1 ring-inset ring-ink/20 transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ink/25"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                Contact support
              </Link>
            </div>

            {/* Helpful links */}
            <div className="mt-14 border-t border-ink/15 pt-8">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-ink/50">Popular pages</p>
              <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {popularPages.map((page) => (
                  <li key={page.href}>
                    <Link
                      href={page.href}
                      className="group flex items-center justify-between gap-4 rounded-lg bg-white px-4 py-3.5 ring-1 ring-inset ring-ink/10 transition-all hover:-translate-y-0.5 hover:shadow-md hover:ring-ink/20"
                    >
                      <span>
                        <span className="block text-sm font-bold">{page.label}</span>
                        <span className="block text-xs text-ink/55">{page.note}</span>
                      </span>
                      <ArrowUpRight
                        className="h-4 w-4 shrink-0 text-ink/40 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink"
                        aria-hidden="true"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Receipt illustration */}
          <section className="flex justify-center lg:col-span-5" aria-hidden="true">
            <div className="relative w-full max-w-sm">
              <div className="absolute inset-x-6 -bottom-6 h-10 rounded-[50%] bg-ink/15 blur-xl" />

              <div className="relative rotate-2 bg-white px-7 pb-12 pt-8 shadow-2xl shadow-ink/15" style={tornEdge}>
                {/* Header */}
                <div className="flex flex-col items-center text-center">
                  <LogoMark className="h-12 w-12" />
                  <p className="mt-1 text-lg font-extrabold tracking-[-0.04em]">SmartPOS</p>
                  <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink/45">Order #404</p>
                </div>

                <div className="my-6 border-t-2 border-dashed border-ink/15" />

                <p className="text-center text-[5.5rem] font-extrabold leading-none tracking-[-0.06em]">404</p>
                <p className="mt-2 text-center text-xs font-bold uppercase tracking-[0.24em] text-ink/50">
                  Page not found
                </p>

                <div className="my-6 border-t-2 border-dashed border-ink/15" />

                <dl className="space-y-2.5 font-mono text-[13px]">
                  {[
                    ["Requested page", "1 × ?"],
                    ["Found", "0"],
                    ["Status", "Missing"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-4">
                      <dt className="text-ink/55">{k}</dt>
                      <dd className="font-semibold">{v}</dd>
                    </div>
                  ))}
                </dl>

                <div className="mt-5 flex items-baseline justify-between border-t-2 border-ink pt-4">
                  <span className="text-sm font-extrabold uppercase tracking-wider">Total</span>
                  <span className="text-xl font-extrabold tracking-[-0.02em]">RWF 0</span>
                </div>

                {/* Stamp */}
                <div className="absolute right-6 top-[42%] -rotate-12 rounded-md border-[3px] border-ink bg-lime/90 px-3 py-1.5 text-center shadow-sm">
                  <span className="block text-sm font-extrabold uppercase tracking-[0.18em]">Void</span>
                </div>

                <p className="mt-7 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-ink/40">
                  Thank you for visiting
                </p>
              </div>
            </div>
          </section>
        </div>

        <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
          <Link
            href="/request-installation"
            className="group flex flex-col items-start justify-between gap-4 rounded-xl bg-ink px-6 py-6 text-white sm:flex-row sm:items-center sm:px-8"
          >
            <span>
              <span className="block text-lg font-extrabold tracking-[-0.02em]">Looking to get SmartPOS for your business?</span>
              <span className="mt-1 block text-sm text-white/60">We handle the setup, devices and training.</span>
            </span>
            <span className="inline-flex shrink-0 items-center gap-2 rounded-md bg-lime px-5 py-3 text-sm font-bold text-ink transition-colors group-hover:bg-lime-dark">
              Request installation
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </span>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
