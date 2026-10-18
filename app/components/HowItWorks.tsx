import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ClipboardList, Rocket, Settings } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: ClipboardList,
    title: "Request installation",
    description: "Fill out a simple form with your business details. No account needed.",
  },
  {
    number: "02",
    icon: Settings,
    title: "Setup & configuration",
    description: "We configure your system, devices and settings.",
  },
  {
    number: "03",
    icon: Rocket,
    title: "Start selling",
    description: "We train your team and you start managing your business.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" aria-labelledby="how-heading" className="scroll-mt-20 bg-ink py-20 text-white lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col gap-4 border-b border-white/15 pb-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.28em] text-white/60 sm:text-xs">
              <span className="h-2 w-2 bg-lime" aria-hidden="true" />
              How it works
            </p>
            <h2
              id="how-heading"
              className="mt-5 text-[clamp(2rem,4vw,3.25rem)] font-extrabold leading-[1.05] tracking-[-0.03em]"
            >
              Up and running
              <br />
              in three steps.
            </h2>
          </div>
          <p className="text-base text-white/60 sm:text-right sm:text-lg">Setting up SmartPOS is quick and easy.</p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-10">

          {/* Steps */}
          <div className="lg:col-span-7">
            <ol className="divide-y divide-white/10 border-y border-white/10">
              {steps.map(({ number, icon: Icon, title, description }) => (
                <li key={number} className="group flex gap-6 py-7 sm:gap-8">
                  <span className="w-12 shrink-0 text-3xl font-extrabold tabular-nums text-white/20 transition-colors group-hover:text-lime sm:text-4xl">
                    {number}
                  </span>
                  <div className="flex-1">
                    <h3 className="flex items-center gap-3 text-xl font-bold">
                      {title}
                      <Icon className="h-5 w-5 text-lime" aria-hidden="true" />
                    </h3>
                    <p className="mt-2 max-w-md text-white/60">{description}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/request-installation"
                className="group inline-flex items-center justify-center gap-2 rounded-md bg-lime px-6 py-3.5 text-sm font-bold text-ink transition-colors hover:bg-lime-dark"
              >
                Request installation
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-md px-6 py-3.5 text-sm font-bold text-white ring-1 ring-inset ring-white/20 transition-colors hover:bg-white/5"
              >
                Talk to our team
              </Link>
            </div>
          </div>

          {/* Photo */}
          <figure className="lg:col-span-5">
            <div className="relative overflow-hidden rounded-xl">
              <Image
                src="/images/step-woman.png"
                alt="A café owner standing at her counter next to a SmartPOS terminal"
                width={1200}
                height={896}
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="h-full w-full object-cover"
              />
            </div>
            <figcaption className="mt-3 flex items-center gap-2 text-xs text-white/45">
              <span className="h-px w-6 bg-lime" aria-hidden="true" />
              From request to first sale, our team sets everything up.
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
