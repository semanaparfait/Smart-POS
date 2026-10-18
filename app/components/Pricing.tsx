import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';

// TODO: prices are shown in USD as before. Update to RWF if that is what you charge.
const plans = [
  {
    name: 'Starter',
    subtitle: 'Perfect for small businesses',
    price: '$29',
    period: '/month',
    features: ['1 POS device', 'Basic reports', 'Inventory tracking', 'Email support'],
    cta: { label: 'Get started', href: '/request-installation?plan=starter' },
  },
  {
    name: 'Business',
    popular: true,
    subtitle: 'For growing businesses',
    price: '$59',
    period: '/month',
    features: ['Up to 3 POS devices', 'Advanced reports', 'Employee management', 'Priority support'],
    cta: { label: 'Get started', href: '/request-installation?plan=business' },
  },
  {
    name: 'Enterprise',
    subtitle: 'For large businesses',
    price: 'Custom',
    period: '',
    features: ['Multiple locations', 'Full customization', 'Advanced analytics', '24/7 dedicated support'],
    cta: { label: 'Contact sales', href: '/contact?topic=sales' },
  },
];

export default function Pricing() {
  return (
    <section id="pricing" aria-labelledby="pricing-heading" className="scroll-mt-20 bg-ivory py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col gap-4 border-b border-ink/15 pb-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.28em] text-ink/60 sm:text-xs">
              <span className="h-2 w-2 bg-lime ring-1 ring-ink/20" aria-hidden="true" />
              Pricing
            </p>
            <h2
              id="pricing-heading"
              className="mt-5 text-[clamp(2rem,4vw,3.25rem)] font-extrabold leading-[1.05] tracking-[-0.03em] text-ink"
            >
              Simple, transparent pricing.
            </h2>
          </div>
          <p className="text-base text-ink/60 sm:text-right sm:text-lg">No hidden fees. Choose what fits your business.</p>
        </div>

        {/* Plans */}
        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
          {plans.map((plan) => {
            const dark = Boolean(plan.popular);
            return (
              <div
                key={plan.name}
                className={`relative flex flex-col rounded-xl p-8 ${
                  dark ? 'bg-ink text-white' : 'bg-white text-ink ring-1 ring-inset ring-ink/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-extrabold">{plan.name}</h3>
                  {dark && (
                    <span className="rounded-md bg-lime px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider text-ink">
                      Most popular
                    </span>
                  )}
                </div>
                <p className={`mt-1 text-sm ${dark ? 'text-white/60' : 'text-ink/60'}`}>{plan.subtitle}</p>

                <div className="mt-8 flex items-baseline gap-1">
                  <span className={`text-5xl font-extrabold tracking-[-0.03em] ${dark ? 'text-lime' : 'text-ink'}`}>
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className={`text-sm font-medium ${dark ? 'text-white/55' : 'text-ink/50'}`}>{plan.period}</span>
                  )}
                </div>
                {!plan.period && <p className="mt-1 text-sm text-ink/50">Tailored to your operations</p>}

                <ul className={`mt-8 flex-1 divide-y border-t ${dark ? 'divide-white/10 border-white/10' : 'divide-ink/10 border-ink/10'}`}>
                  {plan.features.map((feature) => (
                    <li key={feature} className={`flex items-center gap-3 py-3.5 text-sm ${dark ? 'text-white/85' : 'text-ink/80'}`}>
                      <Check className={`h-4 w-4 shrink-0 ${dark ? 'text-lime' : 'text-ink'}`} strokeWidth={3} aria-hidden="true" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.cta.href}
                  className={`group mt-8 inline-flex items-center justify-center gap-2 rounded-md px-6 py-3.5 text-sm font-bold transition-colors ${
                    dark
                      ? 'bg-lime text-ink hover:bg-lime-dark'
                      : 'text-ink ring-1 ring-inset ring-ink/25 hover:bg-ink hover:text-white'
                  }`}
                >
                  {plan.cta.label}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
