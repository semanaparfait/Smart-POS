"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { ArrowLeft, Eye, EyeOff, KeyRound, Loader2, LockKeyhole, Mail, MessageCircle } from "lucide-react";
import Logo from "@/app/components/Logo";
import { postPublic } from "@/stores/requests/requestStore";

const MIN_LENGTH = 8;
const input =
  "h-13 w-full rounded-xl border border-ink/15 bg-ivory/60 pl-11 pr-4 text-sm text-ink outline-none transition placeholder:text-ink/40 focus:border-ink focus:bg-white focus:ring-4 focus:ring-lime/40";

type Step = "email" | "code" | "support";

function ForgotPassword() {
  const router = useRouter();
  const params = useSearchParams();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState(params.get("email") ?? "");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  const askForCode = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!email.trim()) return toast.error("Enter the email you sign in with.");
    setBusy(true);
    try {
      const res = (await postPublic("/api/v1/auth/forgot-password", { email: email.trim() })) as { data?: { way?: string }; way?: string };
      const way = res.data?.way ?? res.way;
      setStep(way === "email" ? "code" : "support");
      if (way === "email") toast.success("If that email has an account, a code is on its way.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send the code");
    } finally {
      setBusy(false);
    }
  };

  const reset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(code)) return toast.error("The code is the 6 digits from the email.");
    if (password.length < MIN_LENGTH) return toast.error(`Use at least ${MIN_LENGTH} characters.`);
    if (password !== confirm) return toast.error("The two passwords are not the same.");
    setBusy(true);
    try {
      await postPublic("/api/v1/auth/reset-password", { email: email.trim(), code, newPassword: password });
      toast.success("Password changed. Sign in with your new password.");
      router.push(`/pages/Login`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not change the password");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-ivory px-6 py-12">
      <div className="w-full max-w-md rounded-3xl border border-ink/10 bg-white p-8 shadow-xl shadow-ink/5 sm:p-10">
        <Link href="/" className="mb-8 block">
          <Logo />
        </Link>

        {step === "email" && (
          <>
            <h1 className="text-2xl font-bold tracking-tight text-ink">Forgot your password?</h1>
            <p className="mt-2 text-sm leading-6 text-ink/60">Enter the email you sign in with. We&apos;ll send you a code to choose a new password.</p>
            <form onSubmit={askForCode} className="mt-7 space-y-5">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-ink">Email address</span>
                <span className="relative block">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-ink/40" />
                  <input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" className={input} />
                </span>
              </label>
              <button type="submit" disabled={busy} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-ink text-sm font-semibold text-white transition hover:bg-ink-soft disabled:opacity-60">
                {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                Send me a code
              </button>
            </form>
            <p className="mt-5 text-xs leading-5 text-ink/50">Workers sign in with their PIN in the SmartPOS app. If you forgot your PIN, ask your owner for a new one.</p>
          </>
        )}

        {step === "code" && (
          <>
            <h1 className="text-2xl font-bold tracking-tight text-ink">Check your email</h1>
            <p className="mt-2 text-sm leading-6 text-ink/60">
              We sent a 6-digit code to <span className="font-semibold text-ink">{email}</span>. It works for 30 minutes. Look in your spam folder too.
            </p>
            <form onSubmit={reset} className="mt-7 space-y-5">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-ink">Code</span>
                <span className="relative block">
                  <KeyRound className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-ink/40" />
                  <input
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="123456"
                    className={`${input} font-mono tracking-[0.3em]`}
                  />
                </span>
              </label>
              <label className="block">
                <span className="mb-2 flex items-center justify-between text-sm font-semibold text-ink">
                  New password
                  <button type="button" onClick={() => setShow((v) => !v)} className="inline-flex items-center gap-1 text-xs font-semibold text-ink/55 hover:text-ink">
                    {show ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    {show ? "Hide" : "Show"}
                  </button>
                </span>
                <span className="relative block">
                  <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-ink/40" />
                  <input type={show ? "text" : "password"} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={`At least ${MIN_LENGTH} characters`} className={input} />
                </span>
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-ink">Type it again</span>
                <span className="relative block">
                  <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-ink/40" />
                  <input type={show ? "text" : "password"} autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={input} />
                </span>
              </label>
              <button type="submit" disabled={busy} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-ink text-sm font-semibold text-white transition hover:bg-ink-soft disabled:opacity-60">
                {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                Change my password
              </button>
            </form>
            <button type="button" disabled={busy} onClick={() => askForCode()} className="mt-4 text-xs font-semibold text-ink/60 underline underline-offset-4 hover:text-ink">
              Send a new code
            </button>
          </>
        )}

        {step === "support" && (
          <>
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lime text-ink">
              <MessageCircle className="h-6 w-6" />
            </span>
            <h1 className="mt-5 text-2xl font-bold tracking-tight text-ink">We&apos;ll help you sign in</h1>
            <p className="mt-2 text-sm leading-6 text-ink/60">
              If <span className="font-semibold text-ink">{email}</span> has a SmartPOS account, our team has your request. We&apos;ll call you with a new password, which you change after signing in.
            </p>
            <Link href="/contact" className="mt-6 inline-flex h-11 items-center rounded-xl bg-white px-4 text-sm font-semibold text-ink ring-1 ring-inset ring-ink/15 hover:bg-ivory">
              Contact us
            </Link>
          </>
        )}

        <Link href="/pages/Login" className="mt-8 inline-flex items-center gap-1.5 text-sm font-semibold text-ink/60 hover:text-ink">
          <ArrowLeft className="h-4 w-4" /> Back to sign in
        </Link>
      </div>
    </main>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense>
      <ForgotPassword />
    </Suspense>
  );
}
