import Image from 'next/image';
import { 
  CreditCard, 
  LayoutGrid, 
  Package, 
  Monitor, 
  Users, 
  Receipt, 
  BarChart3, 
  Bot, 
  ArrowRight,
  Key
} from 'lucide-react';

export default function Features() {
  const featuresList = [
    {
      icon: CreditCard,
      title: 'Sales & Checkout',
      description: 'Fast and flexible payment options',
    },
    {
      icon: LayoutGrid,
      title: 'Table & Floor Management',
      description: 'Create floor maps and manage tables',
    },
    {
      icon: Package,
      title: 'Inventory Management',
      description: 'Track stock and get low stock alerts',
    },
    {
      icon: Monitor,
      title: 'Kitchen Display System (KDS)',
      description: 'Real-time order tracking',
    },
    {
      icon: Users,
      title: 'Employee Management',
      description: 'Roles, payroll, attendance & performance tracking',
    },
    {
      icon: Receipt,
      title: 'Expenses Management',
      description: 'Control costs and reduce waste',
    },
    {
      icon: BarChart3,
      title: 'Reports & Analytics',
      description: 'Real-time insights for better decisions',
    },
    {
      icon: Bot,
      title: 'AI Assistant',
      description: 'Smart support, anytime',
    },
  ];

  return (
    <section id="features" className="py-16 lg:py-24 bg-[#f8faf8]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-left mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Everything You Need <br/> in One System
          </h2>
          <p className="mt-3 max-w-2xl text-base sm:text-lg text-slate-600">
            SmartPOS comes with powerful features to help you manage your business, track sales, control inventory and serve your customers better.
          </p>
        </div>

    
        <div className="grid grid-cols-1 lg:grid-cols-12  items-center">
          
          {/* Left Column: 8 Feature cards (2-column layout on md+) */}
          <div className="lg:col-span-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {featuresList.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div key={feature.title} className="flex gap-3.5 p-3.5 rounded-xl hover:bg-white transition-colors duration-150 border border-transparent hover:border-slate-100 hover:shadow-sm">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#e6f4ed] text-[#00a66c]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 leading-snug">
                        {feature.title}
                      </h3>
                      <p className="mt-0.5 text-xs text-slate-500 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Explore All Features Button */}
            <div className="mt-8">
              <a
                href="#all-features"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#00a66c] hover:bg-[#008f5d] px-6 py-3 text-sm font-semibold text-white shadow-md shadow-emerald-600/20 transition-all active:scale-95"
              >
                <span>Explore All Features</span>
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Right Column: Tablet & Smartphone Graphic Mockup with Hand-written note */}
          <div className="lg:col-span-6 relative flex flex-col items-center">
            
            {/* Hand-written annotation with curved pointer top-right */}
            <div className="w-full text-right mb-2 pr-4 z-20">
              <div className="inline-block">
                <p className="font-handwriting text-2xl sm:text-3xl text-slate-700 leading-none -rotate-2">
                  Manage your <br />
                  floor, tables and <br />
                  <span className="font-bold text-[#00a66c]">orders in real time.</span>
                </p>
                <svg className="w-16 h-10 text-[#00a66c] ml-auto mt-1 -rotate-6" viewBox="0 0 100 60" fill="none" stroke="currentColor">
                  <path d="M20,10 Q60,30 80,50" strokeWidth="2.5" strokeDasharray="4 2" strokeLinecap="round" />
                  <polygon points="80,50 68,46 76,58" fill="currentColor" />
                </svg>
              </div>
            </div>

            {/* Device Mockup */}
            <div className="relative w-full max-w-lg">
              <Image
                src="/images/features-devices.png"
                alt="SmartPOS floor management and order tracking interface"
                width={700}
                height={520}
                className="w-full h-auto object-contain rounded-2xl drop-shadow-xl"
              />
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
