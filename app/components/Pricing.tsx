import { Check, Tag } from 'lucide-react';

export default function Pricing() {
  const plans = [
    {
      name: 'Starter',
      popular: false,
      subtitle: 'Perfect for small businesses',
      price: '$29',
      period: '/month',
      features: [
        '1 POS device',
        'Basic reports',
        'Inventory tracking',
        'Email support',
      ],
      ctaText: 'Get Started',
      ctaStyle: 'outline',
    },
    {
      name: 'Business',
      popular: true,
      subtitle: 'For growing businesses',
      price: '$59',
      period: '/month',
      features: [
        'Up to 3 POS devices',
        'Advanced reports',
        'Employee management',
        'Priority support',
      ],
      ctaText: 'Get Started',
      ctaStyle: 'filled',
    },
    {
      name: 'Enterprise',
      popular: false,
      subtitle: 'For large businesses',
      price: 'Custom Pricing',
      period: '',
      features: [
        'Multiple locations',
        'Full customization',
        'Advanced analytics',
        '24/7 dedicated support',
      ],
      ctaText: 'Contact Sales',
      ctaStyle: 'outline',
    },
  ];

  return (
    <section id="pricing" className="py-16 lg:py-24 bg-[#f8faf8]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-left mb-12">

          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Simple & Transparent Pricing
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-600">
            Choose the plan that fits your business. No hidden fees.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col justify-between rounded-3xl p-8 bg-white transition-all duration-200 ${
                plan.popular
                  ? 'border-2 border-[#00a66c] shadow-xl shadow-emerald-600/10 scale-102'
                  : 'border border-slate-200/80 shadow-sm hover:shadow-md'
              }`}
            >
              {/* Popular Top Pill Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#00a66c] text-white text-xs font-bold tracking-wide uppercase shadow-sm">
                  Most Popular
                </div>
              )}

              <div>
                <h3 className="text-2xl font-bold text-slate-900">
                  {plan.name}
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  {plan.subtitle}
                </p>

                {/* Price Display */}
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl sm:text-5xl font-extrabold text-slate-900">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-sm font-medium text-slate-500">
                      {plan.period}
                    </span>
                  )}
                </div>

                {/* Features List */}
                <ul className="mt-8 space-y-3.5">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm text-slate-700">
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#e6f4ed] text-[#00a66c]">
                        <Check className="h-3.5 w-3.5 stroke-[3]" />
                      </div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Call to Action Button */}
              <div className="mt-8 pt-6 border-t border-slate-100">
                {plan.ctaStyle === 'filled' ? (
                  <a
                    href="#get-started"
                    className="w-full inline-flex items-center justify-center py-3 px-6 rounded-full bg-[#00a66c] hover:bg-[#008f5d] text-white font-bold text-sm shadow-md transition-all active:scale-95"
                  >
                    {plan.ctaText}
                  </a>
                ) : (
                  <a
                    href="#get-started"
                    className="w-full inline-flex items-center justify-center py-3 px-6 rounded-full border border-emerald-300 hover:border-[#00a66c] bg-white text-[#00a66c] hover:bg-emerald-50 font-bold text-sm transition-all"
                  >
                    {plan.ctaText}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
