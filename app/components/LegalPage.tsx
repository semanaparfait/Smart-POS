import Link from "next/link";
import type { ReactNode } from "react";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import { SITE_CONTACT, SITE_LEGAL } from "@/app/data/site";

export type LegalSection = { id: string; title: string; body: ReactNode };

/** How people can reach us about legal / privacy matters */
export function ContactLine() {
  return SITE_CONTACT.email ? (
    <>
      by email at{" "}
      <a href={`mailto:${SITE_CONTACT.email}`} className="font-semibold text-ink underline decoration-lime decoration-2 underline-offset-4">
        {SITE_CONTACT.email}
      </a>{" "}
      or through our{" "}
      <Link href="/contact" className="font-semibold text-ink underline decoration-lime decoration-2 underline-offset-4">
        contact page
      </Link>
    </>
  ) : (
    <>
      through our{" "}
      <Link href="/contact" className="font-semibold text-ink underline decoration-lime decoration-2 underline-offset-4">
        contact page
      </Link>
    </>
  );
}

export default function LegalPage({
  eyebrow,
  title,
  intro,
  sections,
  otherDoc,
}: {
  eyebrow: string;
  title: string;
  intro: ReactNode;
  sections: LegalSection[];
  otherDoc: { label: string; href: string };
}) {
  return (
    <div className="site flex min-h-screen flex-col bg-ivory text-ink">
      <Navbar />

      <main className="flex-1">
        {/* Header */}
        <header className="mx-auto max-w-7xl px-4 pt-14 sm:px-6 sm:pt-20 lg:px-8">
          <p className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.28em] text-ink/60 sm:text-xs">
            <span className="h-2 w-2 bg-lime ring-1 ring-ink/20" aria-hidden="true" />
            {eyebrow}
          </p>
          <h1 className="mt-5 max-w-3xl text-[clamp(2.25rem,5vw,4rem)] font-extrabold leading-[1.04] tracking-[-0.035em]">
            {title}
          </h1>
          <p className="mt-5 text-sm font-semibold text-ink/55">Last updated: {SITE_LEGAL.lastUpdated}</p>
        </header>

        <div className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8 lg:pb-28">
          <div className="mt-10 grid grid-cols-1 gap-10 border-t border-ink/15 pt-10 lg:grid-cols-12">

            {/* Table of contents */}
            <nav aria-label="On this page" className="lg:col-span-4">
              <div className="rounded-xl bg-white p-6 ring-1 ring-inset ring-ink/10 lg:sticky lg:top-28">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-ink/50">On this page</p>
                <ol className="mt-4 space-y-2.5 text-sm">
                  {sections.map((s, i) => (
                    <li key={s.id} className="flex gap-3">
                      <span className="w-5 shrink-0 font-bold tabular-nums text-ink/35">{i + 1}.</span>
                      <a href={`#${s.id}`} className="font-semibold text-ink/75 hover:text-ink hover:underline">
                        {s.title}
                      </a>
                    </li>
                  ))}
                </ol>
                <div className="mt-6 border-t border-ink/10 pt-5 text-sm">
                  <Link href={otherDoc.href} className="font-bold underline decoration-lime decoration-2 underline-offset-4 hover:decoration-ink">
                    {otherDoc.label} →
                  </Link>
                </div>
              </div>
            </nav>

            {/* Document */}
            <article className="lg:col-span-8">
              <div className="max-w-2xl text-lg leading-relaxed text-ink/75">{intro}</div>

              <div className="mt-10 space-y-12">
                {sections.map((s, i) => (
                  <section key={s.id} id={s.id} aria-labelledby={`${s.id}-title`} className="scroll-mt-28">
                    <h2 id={`${s.id}-title`} className="flex gap-3 text-2xl font-extrabold tracking-[-0.02em] text-ink">
                      <span className="tabular-nums text-ink/30">{String(i + 1).padStart(2, "0")}</span>
                      {s.title}
                    </h2>
                    <div className="legal-body mt-4 max-w-2xl space-y-4 leading-relaxed text-ink/75">{s.body}</div>
                  </section>
                ))}
              </div>
            </article>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
