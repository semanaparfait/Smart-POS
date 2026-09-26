import { ArrowRight, Sparkles } from 'lucide-react';

export default function CtaBanner() {
  return (
    <section className="py-12 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#033f2d] via-[#044d37] to-[#022e21] px-8 py-12 sm:px-12 sm:py-16 shadow-2xl">
          
          {/* Subtle Background Pattern overlays */}
          <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 w-96 h-96 rounded-full bg-emerald-400/10 blur-3xl pointer-events-none" />

          {/* Banner Content Grid */}
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            
            {/* Left Column */}
            <div className="max-w-2xl">

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
                Take Your Business to the Next Level
              </h2>
              <p className="mt-4 text-base sm:text-lg text-emerald-100/80">
                Join hundreds of businesses already using SmartPOS.
              </p>
            </div>

            {/* Right Column Action Buttons */}
            <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-start sm:items-center gap-4 shrink-0">
              <a
                href="#request-installation"
                className="inline-flex items-center justify-center gap-2.5 rounded-full bg-white hover:bg-emerald-50 px-7 py-4 text-sm font-bold text-slate-900 shadow-xl transition-all duration-200 active:scale-95"
              >
                <span>Request Installation</span>
                <ArrowRight className="h-4 w-4 text-[#00a66c]" />
              </a>

              <a
                href="#contact"
                className="text-sm font-semibold text-emerald-100 hover:text-white underline underline-offset-4 transition-colors px-2 py-1"
              >
                Or contact us directly
              </a>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
