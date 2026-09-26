import Image from "next/image";
import { ArrowRight, Workflow } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      number: "1",
      // SVG path matching the exact outlined POS terminal/card scanner icon
      icon: (
        <svg
          className="h-5 w-5 text-emerald-800"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect width="14" height="20" x="5" y="2" rx="2" />
          <path d="M9 6h6" />
          <path d="M12 18h.01" />
          <path d="M9 10h6" />
        </svg>
      ),
      title: "Request Installation",
      description: "Fill out a simple form with your business details.",
      hasArrow: true,
    },
    {
      number: "2",
      // SVG path matching the gear / configuration icon
      icon: (
        <svg
          className="h-5 w-5 text-emerald-800"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      ),
      title: "Setup & Configuration",
      description: "We configure your system, devices and settings.",
      hasArrow: true,
    },
    {
      number: "3",
      // SVG path matching the rocket launching icon
      icon: (
        <svg
          className="h-5 w-5 text-emerald-800"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
          <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
          <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
          <path d="M12 9v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
        </svg>
      ),
      title: "Start Selling",
      description: "Train your team and start managing your business.",
      hasArrow: false,
    },
  ];

  return (
    <section
      id="how-it-works"
      className=" bg-green-50 border-t border-slate-100"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-left mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-[#e6f4ed] px-3.5 py-1.5 text-xs font-semibold text-[#047857] mb-4">
            <Workflow className="h-3.5 w-3.5 text-[#00a66c]" />
            <span>HOW IT WORKS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Get Started in 3 Simple Steps
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-600">
            Setting up SmartPOS is quick and easy.
          </p>
        </div>

        {/* Content Grid: Left Steps, Right Staff Image */}
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          {/* Left Column: Three steps */}
          <div className="lg:col-span-7">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-6">
              {steps.map((step) => (
                <div
                  key={step.number}
                  className="relative flex flex-col items-start"
                >
                  {/* Top Row: Number Badge, Icon, and Connector Arrow */}
                  <div className="mb-5 flex w-full items-center gap-3">
                    {/* Dark Green Circle Badge */}
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-800 text-xs font-bold text-white shadow-sm">
                      {step.number}
                    </div>

                    {/* Step Icon */}
                    <div className="flex items-center justify-center">
                      {step.icon}
                    </div>

                    {/* Connector line with Arrow pointing to next step */}
                    {step.hasArrow && (
                      <div className="hidden sm:flex flex-1 items-center justify-end pl-2">
                        <div className="w-full border-b border-dashed border-slate-300 mr-2" />
                        <ArrowRight className="h-4 w-4 text-emerald-600 shrink-0" />
                      </div>
                    )}
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-sm font-bold text-slate-900 leading-snug">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-500">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Staff photo */}
          <div className="relative flex justify-center lg:col-span-5 lg:justify-end">
            <div className="relative w-full max-w-md overflow-hidden rounded-3xl border-4 border-white shadow-2xl">
              <Image
                src="/images/step-woman.png"
                alt="SmartPOS customer support and installation specialist"
                width={600}
                height={450}
                className="h-auto w-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
