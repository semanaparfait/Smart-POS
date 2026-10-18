import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function CtaBanner() {
  return (
    <section aria-labelledby="cta-heading" className="bg-white py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-end gap-10 rounded-xl bg-lime px-6 py-12 sm:px-12 sm:py-16 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-ink/60 sm:text-xs">Get started</p>
            <h2
              id="cta-heading"
              className="mt-4 text-[clamp(2rem,4.5vw,3.75rem)] font-extrabold leading-[1.02] tracking-[-0.035em] text-ink"
            >
              Take your business
              <br />
              to the next level.
            </h2>
            <p className="mt-4 max-w-lg text-lg text-ink/70">
              Tell us about your business and our team will handle the setup. No sign-up needed.
            </p>
          </div>

          <div className="flex flex-col gap-3 lg:col-span-4 lg:items-end">
            <Link
              href="/request-installation"
              className="group inline-flex items-center justify-center gap-2 rounded-md bg-ink px-7 py-4 text-sm font-bold text-white transition-colors hover:bg-ink-soft"
            >
              Request installation
              <ArrowRight className="h-4 w-4 text-lime transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-2 py-1 text-sm font-bold text-ink underline decoration-ink/30 decoration-2 underline-offset-4 hover:decoration-ink"
            >
              Or contact us directly
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
