"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <main className="min-h-screen bg-[#f4f8f5] px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-2.5rem)] max-w-6xl overflow-hidden rounded-[2rem] bg-white shadow-[0_24px_80px_rgba(5,24,18,0.12)] lg:grid-cols-[0.92fr_1.08fr]">
        <section className="relative hidden overflow-hidden bg-[#06251b] p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border-[32px] border-emerald-400/10" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-[#00a66c]/15 blur-2xl" />

          <Link
            href="/"
            className="relative flex items-center gap-2.5 text-xl font-extrabold tracking-tight"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00a66c] shadow-lg shadow-emerald-950/40">
              <svg
                className="h-6 w-6 fill-current"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M12 2 3 7v10l9 5 9-5V7l-9-5Zm0 2.24 6.75 3.75v7.5L12 19.24l-6.75-3.75v-7.5L12 4.24ZM12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
              </svg>
            </span>
            Smart<span className="text-[#54d6a3]">POS</span>
          </Link>

          <div className="relative max-w-md">
            <p className="mb-5 text-sm font-semibold uppercase tracking-[0.2em] text-[#54d6a3]">
              Welcome back
            </p>
            <h1 className="text-4xl font-extrabold leading-[1.08] tracking-tight xl:text-5xl">
              Run your business with clarity.
            </h1>
            <p className="mt-6 max-w-sm text-base leading-7 text-emerald-100/70">
              Keep every sale, shift, and decision moving in the right direction
              from one simple dashboard.
            </p>
          </div>

          <div className="relative flex items-center gap-3 text-sm text-emerald-100/70">
            <ShieldCheck
              className="h-5 w-5 text-[#54d6a3]"
              aria-hidden="true"
            />
            Secure access for your team
          </div>
        </section>

        <section className="flex items-center justify-center px-6 py-10 sm:px-12 lg:px-16 xl:px-24">
          <div className="w-full max-w-md">
            <Link
              href="/"
              className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-[#008f5d]"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to home
            </Link>

            <Link
              href="/"
              className="mb-12 flex items-center gap-2 text-lg font-extrabold tracking-tight text-slate-900 lg:hidden"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#00a66c] text-white">
                <svg
                  className="h-5 w-5 fill-current"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M12 2 3 7v10l9 5 9-5V7l-9-5Zm0 2.24 6.75 3.75v7.5L12 19.24l-6.75-3.75v-7.5L12 4.24ZM12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
                </svg>
              </span>
              Smart<span className="text-[#00a66c]">POS</span>
            </Link>

            <div className="mb-9">
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#00a66c]">
                Sign in
              </p>
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-950">
                Good to see you again.
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                Enter your details to access your SmartPOS workspace.
              </p>
            </div>

            <form
              className="space-y-5"
              onSubmit={(event) => event.preventDefault()}
            >
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Email address
                </label>
                <div className="relative">
                  <Mail
                    className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400"
                    aria-hidden="true"
                  />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="you@company.com"
                    className="h-13 w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#00a66c] focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Password
                  </label>
                  <Link
                    href="#forgot-password"
                    className="text-xs font-bold text-[#008f5d] transition hover:text-[#006b46]"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <LockKeyhole
                    className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400"
                    aria-hidden="true"
                  />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    placeholder="Enter your password"
                    className="h-13 w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-11 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#00a66c] focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  >
                    {showPassword ? (
                      <EyeOff className="h-[18px] w-[18px]" />
                    ) : (
                      <Eye className="h-[18px] w-[18px]" />
                    )}
                  </button>
                </div>
              </div>

              <label className="flex items-center gap-2.5 text-sm text-slate-500">
                <input
                  type="checkbox"
                  name="remember"
                  className="h-4 w-4 rounded border-slate-300 accent-[#00a66c]"
                />
                Keep me signed in
              </label>

              <button
                type="submit"
                className="group flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-[#00a66c] text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-[#008f5d] hover:shadow-xl hover:shadow-emerald-600/25 active:scale-[0.99]"
              >
                Sign in
                <ArrowRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-slate-500">
              Need an account?{" "}
              <Link
                href="#request-installation"
                className="font-bold text-[#008f5d] hover:text-[#006b46]"
              >
                Talk to our team
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
