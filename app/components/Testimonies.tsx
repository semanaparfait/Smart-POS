'use client';

import { useState, type CSSProperties } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Pause, Play, Star } from 'lucide-react';

// TODO: confirm these are real customers who agreed to be featured, or replace them.
const testimonials = [
  {
    name: 'Jean Claude',
    role: 'Restaurant Owner',
    image: '/images/avatar-jean.jpg',
    quote: "SmartPOS has completely changed the way we manage our restaurant. It's fast, reliable and easy to use.",
  },
  {
    name: 'Aline Mukamana',
    role: 'Shop Owner',
    image: '/images/avatar-aline.jpg',
    quote: 'Inventory and sales tracking is now so simple. We save time and focus more on our customers.',
  },
  {
    name: 'Emmanuel Niyonzima',
    role: 'Hotel Manager',
    image: '/images/avatar-emmanuel.jpg',
    quote: 'The support team is amazing! They helped us set up everything in just a few hours.',
  },
];

const SLIDE_SECONDS = 6;

const controlButton =
  'flex h-10 w-10 items-center justify-center rounded-md text-white ring-1 ring-inset ring-white/20 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime';

export default function Testimonies() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false); // paused by the visitor (button)
  const [hovered, setHovered] = useState(false); // paused while hovering / focused

  const isRunning = !paused && !hovered;
  const current = testimonials[active];

  const goTo = (index: number) => setActive((index + testimonials.length) % testimonials.length);

  return (
    <section id="testimonials" aria-labelledby="testimonials-heading" className="scroll-mt-20 bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col gap-4 border-b border-ink/15 pb-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.28em] text-ink/60 sm:text-xs">
              <span className="h-2 w-2 bg-lime ring-1 ring-ink/20" aria-hidden="true" />
              Customers
            </p>
            <h2
              id="testimonials-heading"
              className="mt-5 text-[clamp(2rem,4vw,3.25rem)] font-extrabold leading-[1.05] tracking-[-0.03em] text-ink"
            >
              Trusted by businesses
              <br />
              across Rwanda.
            </h2>
          </div>
          <p className="text-base text-ink/60 sm:text-right sm:text-lg">What our customers say about SmartPOS.</p>
        </div>

        <div
          className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-12"
          role="region"
          aria-roledescription="carousel"
          aria-label="Customer testimonials"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onFocus={() => setHovered(true)}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setHovered(false);
          }}
        >

          {/* Featured (rotating) quote */}
          <div className="relative flex flex-col justify-between overflow-hidden rounded-xl bg-ink p-8 text-white sm:p-10 lg:col-span-7">
            {/* Progress bar — its animation end moves to the next quote */}
            <div className="absolute inset-x-0 top-0 h-1 bg-white/10" aria-hidden="true">
              <div
                key={active}
                className="slide-progress h-full bg-lime"
                style={{
                  '--slide-duration': `${SLIDE_SECONDS}s`,
                  animationPlayState: isRunning ? 'running' : 'paused',
                } as CSSProperties}
                onAnimationEnd={() => goTo(active + 1)}
              />
            </div>

            <figure
              key={active}
              className="quote-in flex flex-1 flex-col justify-between"
              aria-roledescription="slide"
              aria-label={`${active + 1} of ${testimonials.length}`}
            >
              <div aria-live={isRunning ? 'off' : 'polite'}>
                <span className="block font-serif text-7xl leading-none text-lime" aria-hidden="true">&ldquo;</span>
                <blockquote className="mt-2 min-h-[6.5em] text-2xl font-bold leading-snug tracking-[-0.01em] sm:min-h-[4.5em] sm:text-3xl">
                  {current.quote}
                </blockquote>
              </div>
              <figcaption className="mt-8 flex items-center gap-4 border-t border-white/10 pt-6">
                <Image src={current.image} alt="" width={56} height={56} className="h-14 w-14 rounded-full object-cover ring-2 ring-lime" />
                <div>
                  <p className="font-bold">{current.name}</p>
                  <p className="text-sm text-white/55">{current.role}</p>
                </div>
                <div className="ml-auto hidden gap-0.5 sm:flex" role="img" aria-label="Rated 5 out of 5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-lime text-lime" aria-hidden="true" />
                  ))}
                </div>
              </figcaption>
            </figure>

            {/* Controls */}
            <div className="mt-8 flex items-center justify-between">
              <p className="text-sm font-semibold tabular-nums text-white/50">
                <span className="text-white">{String(active + 1).padStart(2, '0')}</span> / {String(testimonials.length).padStart(2, '0')}
              </p>
              <div className="flex gap-2">
                <button type="button" onClick={() => goTo(active - 1)} aria-label="Previous testimonial" className={controlButton}>
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => setPaused((p) => !p)}
                  aria-label={paused ? 'Resume auto-play' : 'Pause auto-play'}
                  aria-pressed={paused}
                  className={controlButton}
                >
                  {paused ? <Play className="h-4 w-4" aria-hidden="true" /> : <Pause className="h-4 w-4" aria-hidden="true" />}
                </button>
                <button type="button" onClick={() => goTo(active + 1)} aria-label="Next testimonial" className={controlButton}>
                  <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>

          {/* List of all customers — the active one is highlighted, click to switch */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:col-span-5 lg:grid-cols-1" aria-label="Choose a testimonial">
            {testimonials.map((t, i) => {
              const selected = i === active;
              return (
                <button
                  key={t.name}
                  type="button"
                  aria-current={selected ? "true" : undefined}
                  aria-label={`Show testimonial from ${t.name}`}
                  onClick={() => goTo(i)}
                  className={`group relative flex flex-col justify-between overflow-hidden rounded-xl p-6 text-left transition-colors duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-lime/50 ${
                    selected ? 'bg-ivory ring-2 ring-inset ring-ink' : 'bg-ivory/60 ring-1 ring-inset ring-ink/5 hover:bg-ivory'
                  }`}
                >
                  <span
                    className={`absolute left-0 top-0 h-full w-1 bg-lime transition-opacity duration-300 ${selected ? 'opacity-100' : 'opacity-0'}`}
                    aria-hidden="true"
                  />
                  <span className={`line-clamp-2 text-sm leading-relaxed transition-colors ${selected ? 'text-ink' : 'text-ink/55'}`}>
                    &ldquo;{t.quote}&rdquo;
                  </span>
                  <span className="mt-5 flex items-center gap-3">
                    <Image
                      src={t.image}
                      alt=""
                      width={40}
                      height={40}
                      className={`h-10 w-10 rounded-full object-cover transition-all duration-300 ${selected ? '' : 'grayscale'}`}
                    />
                    <span>
                      <span className="block text-sm font-bold text-ink">{t.name}</span>
                      <span className="block text-xs text-ink/55">{t.role}</span>
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
