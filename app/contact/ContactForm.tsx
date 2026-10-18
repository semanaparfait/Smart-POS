"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import useRequestStore from "@/stores/requests/requestStore";
import { choiceClass, fieldClass, labelClass } from "@/app/components/forms";
import { CONTACT_TOPICS } from "@/app/data/site";

type TopicValue = (typeof CONTACT_TOPICS)[number]["value"];

export default function ContactForm({ initialTopic }: { initialTopic: TopicValue }) {
  const submitContactMessage = useRequestStore((s) => s.submitContactMessage);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const get = (key: string) => String(data.get(key) ?? "").trim();

    setError(false);
    setSubmitting(true);
    try {
      await submitContactMessage({
        name: get("name"),
        email: get("email"),
        phone: get("phone") || undefined,
        topic: get("topic"),
        message: get("message"),
      });
      setSent(true);
      toast.success("Message sent. We'll get back to you soon.");
    } catch {
      setError(true);
      toast.error("We couldn't send your message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className="rounded-xl bg-white p-8 ring-1 ring-inset ring-ink/10 sm:p-12" role="status">
        <span className="flex h-14 w-14 items-center justify-center rounded-lg bg-lime text-ink">
          <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
        </span>
        <h2 className="mt-6 text-3xl font-extrabold tracking-[-0.02em]">Message sent.</h2>
        <p className="mt-3 max-w-lg text-ink/70">Thank you for reaching out. Our team will reply as soon as possible.</p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center justify-center rounded-md bg-ink px-6 py-3 text-sm font-bold text-white hover:bg-ink-soft"
        >
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-xl bg-white p-6 ring-1 ring-inset ring-ink/10 sm:p-10">
      <fieldset>
        <legend className={labelClass}>What can we help with?</legend>
        <div className="flex flex-wrap gap-2">
          {CONTACT_TOPICS.map((t) => (
            <label key={t.value} className={choiceClass}>
              <input type="radio" name="topic" value={t.value} defaultChecked={t.value === initialTopic} className="sr-only" />
              {t.label}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className={labelClass}>Full name *</label>
          <input id="name" name="name" required autoComplete="name" className={fieldClass} />
        </div>
        <div>
          <label htmlFor="email" className={labelClass}>Email *</label>
          <input id="email" name="email" type="email" required autoComplete="email" className={fieldClass} />
        </div>
      </div>

      <div className="sm:w-1/2 sm:pr-2.5">
        <label htmlFor="phone" className={labelClass}>
          Phone <span className="font-normal text-ink/50">(optional)</span>
        </label>
        <input id="phone" name="phone" type="tel" autoComplete="tel" placeholder="+250 7XX XXX XXX" className={fieldClass} />
      </div>

      <div>
        <label htmlFor="message" className={labelClass}>Message *</label>
        <textarea id="message" name="message" required rows={6} minLength={10} className={fieldClass} />
      </div>

      {error && (
        <div role="alert" className="rounded-md border border-ink/15 bg-ivory px-4 py-3 text-sm">
          <strong>Your message wasn&apos;t sent.</strong> Please check your connection and try again.
        </div>
      )}

      <div className="flex flex-col gap-4 border-t border-ink/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-ink/50">Fields marked * are required.</p>
        <button
          type="submit"
          disabled={submitting}
          className="group inline-flex items-center justify-center gap-2 rounded-md bg-lime px-7 py-3.5 text-sm font-bold text-ink transition-colors hover:bg-lime-dark focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ink/25 disabled:opacity-60"
        >
          {submitting ? "Sending…" : "Send message"}
          {!submitting && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />}
        </button>
      </div>
    </form>
  );
}
