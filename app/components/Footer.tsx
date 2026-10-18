import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Clock, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import logo from "@/public/footer_logo.png"
import { SITE_CONTACT, SITE_SOCIAL, phoneLink, whatsappLink } from '@/app/data/site';

const socialIcons: Record<keyof typeof SITE_SOCIAL, { label: string; path: string }> = {
  facebook: {
    label: 'Facebook',
    path: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
  },
  twitter: {
    label: 'X (Twitter)',
    path: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z',
  },
  linkedin: {
    label: 'LinkedIn',
    path: 'M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z',
  },
  youtube: {
    label: 'YouTube',
    path: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z',
  },
};

const columns = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '/#features' },
      { label: 'Industries', href: '/#industries' },
      { label: 'How it works', href: '/#how-it-works' },
      { label: 'Pricing', href: '/#pricing' },
      { label: 'FAQ', href: '/#faq' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'Contact us', href: '/contact' },
      { label: 'Request installation', href: '/request-installation' },
      { label: 'Jobs', href: '/pages/jobs' },
      { label: 'Login', href: '/pages/Login' },
    ],
  },
];

export default function Footer() {
  const socials = (Object.keys(SITE_SOCIAL) as (keyof typeof SITE_SOCIAL)[]).filter((k) => SITE_SOCIAL[k]);
  const whatsapp = whatsappLink();
  const phone = phoneLink();
  const hasContactDetails = Boolean(whatsapp || phone || SITE_CONTACT.email || SITE_CONTACT.address || SITE_CONTACT.hours);

  return (
    <footer className="site bg-ink pt-16 pb-8 text-white/70">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        <div className="grid grid-cols-1 gap-10 border-b border-white/10 pb-12 sm:grid-cols-2 lg:grid-cols-12">

          {/* Brand */}
          <div className="space-y-4 lg:col-span-4">
            <Link href="/" className="inline-block">
              <Image src={logo} alt="SmartPOS" className="w-36" />
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-white/55">
              Smarter business. Easier operations. Point of sale and business management for businesses in Rwanda.
            </p>
            {socials.length > 0 && (
              <div className="flex items-center gap-2 pt-2">
                {socials.map((key) => (
                  <a
                    key={key}
                    href={SITE_SOCIAL[key]}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={socialIcons[key].label}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/70 transition-colors hover:border-lime hover:bg-lime hover:text-ink"
                  >
                    <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                      <path d={socialIcons[key].path} />
                    </svg>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <nav key={col.title} aria-label={col.title} className="lg:col-span-2">
              <h2 className="mb-4 text-sm font-bold text-white">{col.title}</h2>
              <ul className="space-y-2.5 text-sm">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-white/55 transition-colors hover:text-lime">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          {/* Get in touch */}
          <div className="sm:col-span-2 lg:col-span-4">
            <h2 className="mb-4 text-sm font-bold text-white">Get in touch</h2>
            {hasContactDetails && (
              <ul className="mb-6 space-y-3 text-sm">
                {whatsapp && (
                  <li>
                    <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-white/70 hover:text-lime">
                      <MessageCircle className="h-4 w-4 shrink-0" aria-hidden="true" /> WhatsApp
                    </a>
                  </li>
                )}
                {phone && (
                  <li>
                    <a href={phone} className="flex items-center gap-3 text-white/70 hover:text-lime">
                      <Phone className="h-4 w-4 shrink-0" aria-hidden="true" /> {SITE_CONTACT.phone}
                    </a>
                  </li>
                )}
                {SITE_CONTACT.email && (
                  <li>
                    <a href={`mailto:${SITE_CONTACT.email}`} className="flex items-center gap-3 text-white/70 hover:text-lime">
                      <Mail className="h-4 w-4 shrink-0" aria-hidden="true" /> {SITE_CONTACT.email}
                    </a>
                  </li>
                )}
                {SITE_CONTACT.address && (
                  <li className="flex items-center gap-3 text-white/70">
                    <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" /> {SITE_CONTACT.address}
                  </li>
                )}
                {SITE_CONTACT.hours && (
                  <li className="flex items-center gap-3 text-white/70">
                    <Clock className="h-4 w-4 shrink-0" aria-hidden="true" /> {SITE_CONTACT.hours}
                  </li>
                )}
              </ul>
            )}
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
              <Link
                href="/request-installation"
                className="group inline-flex items-center justify-center gap-2 rounded-md bg-lime px-5 py-3 text-sm font-bold text-ink transition-colors hover:bg-lime-dark"
              >
                Request installation
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-md px-5 py-3 text-sm font-bold text-white ring-1 ring-inset ring-white/20 transition-colors hover:bg-white/5"
              >
                Contact us
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 flex flex-col items-center justify-between gap-4 text-xs text-white/45 sm:flex-row">
          <p>© {new Date().getFullYear()} SmartPOS. All rights reserved.</p>
          <p>Made for businesses in Rwanda.</p>
        </div>
      </div>

      {/* Floating WhatsApp button (shown only when a WhatsApp number is configured) */}
      {whatsapp && (
        <a
          href={whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with SmartPOS on WhatsApp"
          className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-lime text-ink shadow-xl shadow-ink/30 transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ink/30"
        >
          <MessageCircle className="h-6 w-6" aria-hidden="true" />
        </a>
      )}
    </footer>
  );
}
