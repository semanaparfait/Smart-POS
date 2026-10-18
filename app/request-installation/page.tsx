import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Mail, MessageCircle, Phone } from "lucide-react";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import InstallationForm from "./InstallationForm";
import { PLANS, SITE_CONTACT, phoneLink, whatsappLink } from "@/app/data/site";

export const metadata: Metadata = {
  title: "Request Installation | SmartPOS",
  description:
    "Request a SmartPOS installation for your restaurant, bar, hotel, shop or pharmacy. No account needed — our team will contact you to set everything up.",
};

const steps = [
  { title: "Send your request", text: "Tell us about your business. It takes about two minutes." },
  { title: "We set everything up", text: "Our team configures your system, devices and settings." },
  { title: "Start selling", text: "We train your team and you start managing your business." },
];

export default async function RequestInstallationPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { plan } = await searchParams;
  const initialPlan =
    PLANS.find((p) => p.toLowerCase() === String(plan ?? "").toLowerCase()) ?? "Not sure yet";

  const whatsapp = whatsappLink("Hello SmartPOS, I would like to request an installation.");
  const phone = phoneLink();

  return (
    <div className="site flex min-h-screen flex-col bg-ivory text-ink">
      <Navbar />

      <main className="flex-1">
        {/* Header */}
        <section className="mx-auto max-w-7xl px-4 pt-14 sm:px-6 sm:pt-20 lg:px-8">
          <p className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.28em] text-ink/60 sm:text-xs">
            <span className="h-2 w-2 bg-lime ring-1 ring-ink/20" aria-hidden="true" />
            Request installation
          </p>
          <h1 className="mt-5 max-w-3xl text-[clamp(2.25rem,5vw,4rem)] font-extrabold leading-[1.04] tracking-[-0.035em]">
            Let&apos;s set up SmartPOS for your business.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink/70">
            Tell us a little about your business. No account or sign-up needed — our team will
            contact you to plan the installation.
          </p>
        </section>

        <section className="mx-auto mt-12 max-w-7xl px-4 pb-20 sm:px-6 lg:px-8 lg:pb-28">
          <div className="grid grid-cols-1 gap-10 border-t border-ink/15 pt-10 lg:grid-cols-12">
          {/* Form */}
          <div className="lg:col-span-8">
            <InstallationForm initialPlan={initialPlan} />
          </div>

          {/* Aside */}
          <aside className="space-y-6 lg:col-span-4">
            <div className="rounded-xl bg-ink p-6 text-white sm:p-8">
              <h2 className="text-[11px] font-bold uppercase tracking-[0.22em] text-lime">What happens next</h2>
              <ol className="mt-6 space-y-6">
                {steps.map((step, i) => (
                  <li key={step.title} className="flex gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-lime text-sm font-extrabold text-ink">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-bold">{step.title}</p>
                      <p className="mt-1 text-sm text-white/60">{step.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="rounded-xl bg-white p-6 ring-1 ring-inset ring-ink/10 sm:p-8">
              <h2 className="font-bold">Prefer to talk first?</h2>
              <ul className="mt-4 space-y-3 text-sm">
                {whatsapp && (
                  <li>
                    <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 font-semibold hover:underline">
                      <MessageCircle className="h-4 w-4" aria-hidden="true" /> Chat on WhatsApp
                    </a>
                  </li>
                )}
                {phone && (
                  <li>
                    <span className="flex flex-wrap items-center gap-x-3 gap-y-1 font-semibold">
                      <Phone className="h-4 w-4" aria-hidden="true" />
                      <a href={phone} className="hover:underline">{SITE_CONTACT.phone}</a>
                      {SITE_CONTACT.phoneAlt && (
                        <a href={phoneLink(SITE_CONTACT.phoneAlt)} className="hover:underline">{SITE_CONTACT.phoneAlt}</a>
                      )}
                    </span>
                  </li>
                )}
                {SITE_CONTACT.email && (
                  <li>
                    <a href={`mailto:${SITE_CONTACT.email}`} className="flex items-center gap-3 font-semibold hover:underline">
                      <Mail className="h-4 w-4" aria-hidden="true" /> {SITE_CONTACT.email}
                    </a>
                  </li>
                )}
                <li>
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 font-bold underline decoration-lime decoration-2 underline-offset-4 hover:decoration-ink"
                  >
                    Contact us <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </li>
              </ul>
            </div>
          </aside>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
