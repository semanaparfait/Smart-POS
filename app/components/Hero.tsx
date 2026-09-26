import Image from 'next/image';
import { 
  ShieldCheck, 
  Zap, 
  Cloud, 
  Headphones, 
  ArrowRight, 
  Play,
  Sparkles
} from 'lucide-react';

export default function Hero() {
  const trustFeatures = [
    {
      icon: ShieldCheck,
      title: 'Secure & Reliable',
      subtitle: 'Your data, always protected',
    },
    {
      icon: Zap,
      title: 'Fast & Easy',
      subtitle: 'Save time, serve more',
    },
    {
      icon: Cloud,
      title: 'Cloud Based',
      subtitle: 'Access from anywhere',
    },
    {
      icon: Headphones,
      title: '24/7 Support',
      subtitle: 'We are always here',
    },
  ];

  return (
    <section className="relative bg-[#f8faf8] overflow-hidden pt-10 pb-16 lg:pt-16 lg:pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Main Hero Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Side Copy */}
          <div className="lg:col-span-6 flex flex-col items-start">
            


            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold text-slate-900 tracking-tight leading-[1.12]">
              Smarter Business. <br />
              <span className="text-[#00a66c]">Easier Operations.</span>
            </h1>

            {/* Subtitle */}
            <p className="mt-6 max-w-xl text-base sm:text-lg leading-relaxed text-slate-600">
              SmartPOS is a modern point-of-sale system designed to help restaurants, bars, hotels, shops and more manage their business with speed, security and simplicity.
            </p>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="#request-installation"
                className="inline-flex items-center justify-center gap-2.5 rounded-full bg-[#00a66c] hover:bg-[#008f5d] px-7 py-3.5 text-sm font-semibold text-white shadow-md shadow-emerald-600/20 hover:shadow-lg transition-all duration-200 active:scale-95"
              >
                <span>Request Installation</span>
                <ArrowRight className="h-4 w-4" />
              </a>

              <a
                href="#watch-demo"
                className="inline-flex items-center justify-center gap-2.5 rounded-full border border-slate-300 bg-white hover:bg-slate-50 px-6 py-3.5 text-sm font-semibold text-slate-800 shadow-sm transition-all duration-200"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-[#00a66c] border border-emerald-200">
                  <Play className="h-3 w-3 fill-[#00a66c] translate-x-[0.5px]" />
                </div>
                <span>Watch Demo</span>
              </a>
            </div>
          </div>

          {/* Right Side Visual Mockup & Annotation */}
          <div className="lg:col-span-6 relative flex justify-center lg:justify-end">
            
            {/* Soft Ambient Radial Glow */}
            <div className="absolute -top-10 -right-10 h-80 w-80 rounded-full bg-emerald-200/50 blur-3xl -z-10" />

            {/* Handwritten Note Annotation top right */}
            <div className="absolute -top-4 right-4 md:right-8 z-20 pointer-events-none text-right">
              <div className="relative">
                <p className="font-handwriting text-2xl sm:text-3xl text-slate-700 leading-none -rotate-3">
                  More than just <br />
                  a POS, it&apos;s your <br />
                  <span className="font-bold text-[#00a66c]">business partner.</span>
                </p>
                {/* Curved Arrow pointer */}
                <svg className="w-16 h-12 text-[#00a66c] ml-auto mt-1 -rotate-12" viewBox="0 0 100 60" fill="none" stroke="currentColor">
                  <path d="M10,10 Q50,0 80,45" strokeWidth="2.5" strokeDasharray="4 2" strokeLinecap="round" />
                  <polygon points="80,45 70,40 75,52" fill="currentColor" />
                </svg>
              </div>
            </div>

            {/* Mockup Container */}
            <div className="relative w-full max-w-xl mt-8 lg:mt-0">
              <Image
                src="/images/hero-devices.png"
                alt="SmartPOS dashboard on laptop, dual terminal, and mobile app"
                width={800}
                height={520}
                priority
                className="w-full h-auto object-contain drop-shadow-2xl rounded-2xl"
              />
            </div>
          </div>
        </div>

        {/* Bottom Metrics Bar */}
        <div className="mt-16 border-t border-slate-200/60 pt-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
            {trustFeatures.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="flex items-center gap-3.5 bg-white sm:bg-transparent p-3 sm:p-0 rounded-xl shadow-sm sm:shadow-none border border-slate-100 sm:border-0">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#e6f4ed] text-[#00a66c]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 leading-snug">
                      {item.title}
                    </h4>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {item.subtitle}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}