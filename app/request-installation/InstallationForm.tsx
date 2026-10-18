"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import useRequestStore from "@/stores/requests/requestStore";
import { BUSINESS_TYPES, PLANS } from "@/app/data/site";
import { choiceClass, fieldClass, hintClass, labelClass } from "@/app/components/forms";

type Plan = (typeof PLANS)[number];

const sectionTitle = "text-[11px] font-bold uppercase tracking-[0.22em] text-ink/50";

export default function InstallationForm({ initialPlan }: { initialPlan: Plan }) {
  const submitInstallationRequest = useRequestStore((s) => s.submitInstallationRequest);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submittedName, setSubmittedName] = useState("");

  // Today's date (local) as the earliest selectable installation date
  const [today] = useState(() => {
    const now = new Date();
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const get = (key: string) => String(data.get(key) ?? "").trim();

    setError("");
    setSubmitting(true);
    try {
      await submitInstallationRequest({
        businessName: get("businessName"),
        businessType: get("businessType"),
        location: get("location"),
        branches: Number(get("branches")) || 1,
        plan: get("plan"),
        contactName: get("contactName"),
        phone: get("phone"),
        email: get("email") || undefined,
        preferredDate: get("preferredDate") || undefined,
        notes: get("notes") || undefined,
      });
      setSubmittedName(get("businessName"));
      toast.success("Request sent. Our team will contact you soon.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      toast.error("We couldn't send your request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedName) {
    return (
      <div className="rounded-xl bg-white p-8 ring-1 ring-inset ring-ink/10 sm:p-12" role="status">
        <span className="flex h-14 w-14 items-center justify-center rounded-lg bg-lime text-ink">
          <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
        </span>
        <h2 className="mt-6 text-3xl font-extrabold tracking-[-0.02em]">Request received.</h2>
        <p className="mt-3 max-w-lg text-ink/70">
          Thank you. We&apos;ve received the installation request for <strong className="text-ink">{submittedName}</strong>.
          Our team will contact you to plan the setup.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-ink px-6 py-3 text-sm font-bold text-white hover:bg-ink-soft"
          >
            Back to home
          </Link>
          <Link
            href="/#features"
            className="inline-flex items-center justify-center gap-2 rounded-md px-6 py-3 text-sm font-bold text-ink ring-1 ring-inset ring-ink/20 hover:bg-ivory"
          >
            Explore features
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-10 rounded-xl bg-white p-6 ring-1 ring-inset ring-ink/10 sm:p-10"
      aria-describedby={error ? "install-error" : undefined}
    >
      {/* 1. Business */}
      <fieldset className="space-y-5">
        <legend className={sectionTitle}>01 · Your business</legend>

        <div>
          <label htmlFor="businessName" className={labelClass}>Business name *</label>
          <input id="businessName" name="businessName" required autoComplete="organization" placeholder="e.g. Kigali Corner Restaurant" className={fieldClass} />
        </div>

        <div>
          <span id="businessType-label" className={labelClass}>Type of business *</span>
          <div role="radiogroup" aria-labelledby="businessType-label" className="flex flex-wrap gap-2">
            {BUSINESS_TYPES.map((type, i) => (
              <label key={type} className={choiceClass}>
                <input type="radio" name="businessType" value={type} required defaultChecked={i === 0} className="sr-only" />
                {type}
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <label htmlFor="location" className={labelClass}>Location *</label>
            <input id="location" name="location" required autoComplete="address-level2" placeholder="District, city — e.g. Nyarugenge, Kigali" className={fieldClass} />
          </div>
          <div>
            <label htmlFor="branches" className={labelClass}>Branches</label>
            <input id="branches" name="branches" type="number" min={1} max={500} defaultValue={1} inputMode="numeric" className={fieldClass} />
          </div>
        </div>
      </fieldset>

      {/* 2. Plan */}
      <fieldset className="space-y-3">
        <legend className={sectionTitle}>02 · Plan you&apos;re interested in</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {PLANS.map((plan) => (
            <label key={plan} className={`${choiceClass} text-center`}>
              <input type="radio" name="plan" value={plan} defaultChecked={plan === initialPlan} className="sr-only" />
              {plan}
            </label>
          ))}
        </div>
        <p className={hintClass}>
          Not sure? Compare the plans on our{" "}
          <Link href="/#pricing" className="font-semibold text-ink underline underline-offset-2">pricing section</Link>.
        </p>
      </fieldset>

      {/* 3. Contact */}
      <fieldset className="space-y-5">
        <legend className={sectionTitle}>03 · Contact person</legend>
        <div>
          <label htmlFor="contactName" className={labelClass}>Full name *</label>
          <input id="contactName" name="contactName" required autoComplete="name" className={fieldClass} />
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="phone" className={labelClass}>Phone number *</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              required
              autoComplete="tel"
              placeholder="+250 7XX XXX XXX"
              pattern="[+0-9 ()-]{9,}"
              title="Enter a valid phone number"
              className={fieldClass}
            />
          </div>
          <div>
            <label htmlFor="email" className={labelClass}>
              Email <span className="font-normal text-ink/50">(optional)</span>
            </label>
            <input id="email" name="email" type="email" autoComplete="email" className={fieldClass} />
          </div>
        </div>
      </fieldset>

      {/* 4. Details */}
      <fieldset className="space-y-5">
        <legend className={sectionTitle}>04 · Anything else</legend>
        <div className="sm:w-1/2">
          <label htmlFor="preferredDate" className={labelClass}>
            Preferred installation date <span className="font-normal text-ink/50">(optional)</span>
          </label>
          <input id="preferredDate" name="preferredDate" type="date" min={today} suppressHydrationWarning className={fieldClass} />
        </div>
        <div>
          <label htmlFor="notes" className={labelClass}>
            Notes <span className="font-normal text-ink/50">(optional)</span>
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={4}
            placeholder="Number of tills, devices you already have, opening hours…"
            className={fieldClass}
          />
        </div>
      </fieldset>

      {error && (
        <div id="install-error" role="alert" className="rounded-md border border-ink/15 bg-ivory px-4 py-3 text-sm text-ink">
          <strong>Your request wasn&apos;t sent.</strong> Please try again, or{" "}
          <Link href="/contact" className="font-semibold underline underline-offset-2">contact us</Link> directly.
        </div>
      )}

      <div className="flex flex-col gap-4 border-t border-ink/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-relaxed text-ink/50">
          Fields marked * are required. By sending this request you agree to our{" "}
          <Link href="/terms" className="font-semibold text-ink underline underline-offset-2">Terms</Link> and{" "}
          <Link href="/privacy" className="font-semibold text-ink underline underline-offset-2">Privacy Policy</Link>.
        </p>
        <button
          type="submit"
          disabled={submitting}
          className="group inline-flex items-center justify-center gap-2 rounded-md bg-lime px-7 py-3.5 text-sm font-bold text-ink transition-colors hover:bg-lime-dark focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ink/25 disabled:opacity-60"
        >
          {submitting ? "Sending…" : "Send request"}
          {!submitting && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />}
        </button>
      </div>
    </form>
  );
}
