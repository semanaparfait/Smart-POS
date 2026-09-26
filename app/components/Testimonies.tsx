import Image from 'next/image';
import { Star, Heart } from 'lucide-react';

export default function Testimonies() {
  const testimonials = [
    {
      name: 'Jean Claude',
      role: 'Restaurant Owner',
      image: '/images/avatar-jean.jpg',
      quote: `"SmartPOS has completely changed the way we manage our restaurant. It's fast, reliable and easy to use."`,
    },
    {
      name: 'Aline Mukamana',
      role: 'Shop Owner',
      image: '/images/avatar-aline.jpg',
      quote: `"Inventory and sales tracking is now so simple. We save time and focus more on our customers."`,
    },
    {
      name: 'Emmanuel Niyonzima',
      role: 'Hotel Manager',
      image: '/images/avatar-emmanuel.jpg',
      quote: `"The support team is amazing! They helped us set up everything in just a few hours."`,
    },
  ];

  return (
    <section id="testimonials" className="py-16 lg:py-24 bg-white border-t border-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-left mb-12">

          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Trusted by Businesses Across Rwanda
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-600">
            See what our customers say about SmartPOS.
          </p>
        </div>

        {/* Testimonial Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((item) => (
            <div
              key={item.name}
              className="flex flex-col justify-between p-6 sm:p-8 rounded-3xl bg-[#f8faf8] border border-slate-100 hover:border-emerald-200 hover:bg-white hover:shadow-lg transition-all duration-200"
            >
              <div>
                {/* User Info Header */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-emerald-500/20">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {item.name}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {item.role}
                    </p>
                  </div>
                </div>

                {/* Quote Text */}
                <p className="text-sm leading-relaxed text-slate-700 italic">
                  {item.quote}
                </p>
              </div>

              {/* Star Rating Footer */}
              <div className="mt-6 pt-4 flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-[#00a66c] text-[#00a66c]" />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Dots */}
        <div className="mt-10 flex items-center justify-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#00a66c]" />
          <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
        </div>

      </div>
    </section>
  );
}
