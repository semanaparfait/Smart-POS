import { 
  Utensils, 
  Wine, 
  Bed, 
  ShoppingCart, 
  Pill, 
  Store, 
  Fuel, 
  Building2 
} from 'lucide-react';

export default function Industries() {
  const industries = [
    { name: 'Restaurants', icon: Utensils },
    { name: 'Bars', icon: Wine },
    { name: 'Hotels & Motels', icon: Bed },
    { name: 'Supermarkets', icon: ShoppingCart },
    { name: 'Pharmacies', icon: Pill },
    { name: 'Shops & Retail', icon: Store },
    { name: 'Malls & Many Areas', icon: Fuel },
  ];

  return (
    <section id="industries" className="py-16 lg:py-20 bg-white border-t border-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-left mb-12">

          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Built for Every Business
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-600">
            From small shops to large restaurants, SmartPOS fits your needs.
          </p>
        </div>

        {/* Industry Cards Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
          {industries.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.name}
                className="group flex flex-col items-center justify-center p-5 rounded-2xl bg-[#f8faf8] border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/40 hover:shadow-md transition-all duration-200 text-center"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e6f4ed] text-[#00a66c] group-hover:scale-110 transition-transform duration-200 mb-3">
                  <Icon className="h-7 w-7" />
                </div>
                <span className="text-xs sm:text-sm font-bold text-slate-800 leading-snug">
                  {item.name}
                </span>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
