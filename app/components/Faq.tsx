import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
import type { ReactNode } from "react";

// Answers only restate what the site already says (How it works, Pricing, Industries).
const faqs: { q: string; a: ReactNode }[] = [
  {
    q: "How do I get SmartPOS for my business?",
    a: (
      <>
        Send us an{" "}
        <Link href="/request-installation" className="font-semibold text-ink underline decoration-lime decoration-2 underline-offset-4">
          installation request
        </Link>
        . Our team contacts you, configures your system, devices and settings, then trains your team so you can start selling.
      </>
    ),
  },
  {
    q: "Do I need to create an account first?",
    a: "No. There is no sign-up. Send an installation request and our team sets up your SmartPOS workspace for you.",
  },
  {
    q: "What types of businesses can use SmartPOS?",
    a: "Restaurants, bars, hotels and motels, supermarkets, pharmacies, shops and retail stores, as well as businesses with several branches.",
  },
  {
    q: "How much does SmartPOS cost?",
    a: (
      <>
        There are three plans: Starter, Business and Enterprise. Each one is described in our{" "}
        <Link href="/#pricing" className="font-semibold text-ink underline decoration-lime decoration-2 underline-offset-4">
          pricing section
        </Link>
        , with no hidden fees.
      </>
    ),
  },
  {
    q: "Can I manage more than one branch?",
    a: "Yes. The Enterprise plan supports multiple locations, with advanced analytics across your business.",
  },
  {
    q: "What support do you offer?",
    a: "Every plan includes support: email support on Starter, priority support on Business, and 24/7 dedicated support on Enterprise.",
  },
];

export default function Faq() {
  return (
    <section id="faq" aria-labelledby="faq-heading" className="scroll-mt-20 bg-ivory py-20 lg:py-28">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">

        <div className="lg:col-span-4">
          <p className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.28em] text-ink/60 sm:text-xs">
            <span className="h-2 w-2 bg-lime ring-1 ring-ink/20" aria-hidden="true" />
            FAQ
          </p>
          <h2
            id="faq-heading"
            className="mt-5 text-[clamp(2rem,4vw,3.25rem)] font-extrabold leading-[1.05] tracking-[-0.03em] text-ink"
          >
            Questions, answered.
          </h2>
          <p className="mt-4 text-ink/60">Can&apos;t find what you&apos;re looking for?</p>
          <Link
            href="/contact"
            className="group mt-6 inline-flex items-center gap-2 rounded-md bg-ink px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-ink-soft"
          >
            Contact us
            <ArrowRight className="h-4 w-4 text-lime transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        </div>

        <div className="border-t border-ink/15 lg:col-span-8">
          {faqs.map(({ q, a }) => (
            <details key={q} className="group border-b border-ink/15">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-left text-lg font-bold text-ink marker:content-none focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-lime/40 [&::-webkit-details-marker]:hidden">
                {q}
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white text-ink transition-all duration-200 group-open:rotate-45 group-open:bg-lime">
                  <Plus className="h-4 w-4" aria-hidden="true" />
                </span>
              </summary>
              <p className="max-w-2xl pb-6 leading-relaxed text-ink/70">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
