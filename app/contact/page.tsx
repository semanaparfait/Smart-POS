import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock, Mail, MapPin, MessageCircle, Phone, type LucideIcon } from "lucide-react";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import ContactForm from "./ContactForm";
import { CONTACT_TOPICS, SITE_CONTACT, phoneLink, whatsappLink } from "@/app/data/site";

export const metadata: Metadata = {
  title: "Contact Us | SmartPOS",
  description: "Questions about SmartPOS, pricing or support? Send us a message and our team will get back to you.",
};

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { topic } = await searchParams;
  const initialTopic =
    CONTACT_TOPICS.find((t) => t.value === String(topic ?? "").toLowerCase())?.value ?? "general";

  // Only details that are filled in app/data/site.ts are shown
  const channels: { icon: LucideIcon; label: string; value: string; href?: string; external?: boolean }[] = [
    { icon: MessageCircle, label: "WhatsApp", value: "Chat with our team", href: whatsappLink(), external: true },
    { icon: Phone, label: "Phone", value: SITE_CONTACT.phone, href: phoneLink() },
    { icon: Mail, label: "Email", value: SITE_CONTACT.email, href: SITE_CONTACT.email ? `mailto:${SITE_CONTACT.email}` : "" },
    { icon: MapPin, label: "Office", value: SITE_CONTACT.address },
    { icon: Clock, label: "Hours", value: SITE_CONTACT.hours },
  ].filter((c) => (c.label === "WhatsApp" ? Boolean(c.href) : Boolean(c.value)));

  return (
    <div className="site flex min-h-screen flex-col bg-ivory text-ink">
      <Navbar />

      <main className="flex-1">
        {/* Header */}
        <section className="mx-auto max-w-7xl px-4 pt-14 sm:px-6 sm:pt-20 lg:px-8">
          <p className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.28em] text-ink/60 sm:text-xs">
            <span className="h-2 w-2 bg-lime ring-1 ring-ink/20" aria-hidden="true" />
            Contact
          </p>
          <h1 className="mt-5 max-w-3xl text-[clamp(2.25rem,5vw,4rem)] font-extrabold leading-[1.04] tracking-[-0.035em]">
            Talk to the SmartPOS team.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink/70">
            Questions about features, pricing or support? Send us a message and we&apos;ll get back to you.
          </p>
        </section>

        <section className="mx-auto mt-12 max-w-7xl px-4 pb-20 sm:px-6 lg:px-8 lg:pb-28">
          <div className="grid grid-cols-1 gap-10 border-t border-ink/15 pt-10 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <ContactForm initialTopic={initialTopic} />
          </div>

          <aside className="space-y-6 lg:col-span-4">
            {channels.length > 0 && (
              <div className="rounded-xl bg-white p-6 ring-1 ring-inset ring-ink/10 sm:p-8">
                <h2 className="text-[11px] font-bold uppercase tracking-[0.22em] text-ink/50">Reach us directly</h2>
                <ul className="mt-5 divide-y divide-ink/10">
                  {channels.map(({ icon: Icon, label, value, href, external }) => {
                    const content = (
                      <>
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-ivory text-ink">
                          <Icon className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <span>
                          <span className="block text-xs font-semibold text-ink/50">{label}</span>
                          <span className="block font-bold">{value}</span>
                        </span>
                      </>
                    );
                    return (
                      <li key={label} className="py-4 first:pt-0 last:pb-0">
                        {href ? (
                          <a
                            href={href}
                            {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                            className="flex items-center gap-4 hover:underline"
                          >
                            {content}
                          </a>
                        ) : (
                          <div className="flex items-center gap-4">{content}</div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            <div className="rounded-xl bg-ink p-6 text-white sm:p-8">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-lime">Ready to start?</p>
              <h2 className="mt-3 text-2xl font-extrabold leading-tight">Get SmartPOS installed in your business.</h2>
              <p className="mt-2 text-sm text-white/60">No account needed. Our team handles the setup.</p>
              <Link
                href="/request-installation"
                className="group mt-6 inline-flex items-center gap-2 rounded-md bg-lime px-5 py-3 text-sm font-bold text-ink hover:bg-lime-dark"
              >
                Request installation
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
            </div>
          </aside>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
