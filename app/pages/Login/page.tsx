"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Package,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useState } from "react";
import useAuthStore from "@/stores/auth/authstore";
import toast from "react-hot-toast";
import logo from "@/public/smartpos_logo.png";
import logoLight from "@/public/footer_logo.png";

export default function LoginPage() {
  const router = useRouter();
  const deviceId = "string";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const login = useAuthStore((state: any) => state.login);

const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setLoading(true);

  try {
    const loggedUser = await login({
      deviceId,
      email,
      password,
    });

    // console.log("LOGGED USER:", loggedUser);
    // console.log("ROLE:", loggedUser.role);

    toast.success("Login successful!");

    if (loggedUser.role?.toUpperCase() === "SUPERADMIN") {
      router.push("/admin");
    } else {
      router.push("/");
    }
  } catch (error: any) {
    toast.error(error.message || "Login failed");
  } finally {
    setLoading(false);
  }
};

  const highlights = [
    { icon: BarChart3, label: "Real-time sales & reports" },
    { icon: Package, label: "Inventory with low-stock alerts" },
    { icon: Users, label: "Staff roles & permissions" },
  ];

  return (
    <main className="site min-h-screen bg-ivory px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-2.5rem)] max-w-6xl overflow-hidden rounded-4xl bg-white shadow-[0_24px_80px_rgba(32,40,59,0.14)] lg:grid-cols-[0.92fr_1.08fr]">
        <section className="relative hidden overflow-hidden bg-ink p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border-32 border-lime/10" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-lime/15 blur-2xl" />

          <Link href="/" className="relative">
            <Image src={logoLight} alt="SmartPOS" className="w-40" priority />
          </Link>

          <div className="relative max-w-md">
            <p className="mb-5 text-sm font-semibold uppercase tracking-[0.2em] text-lime">
              Welcome back
            </p>
            <h1 className="text-4xl font-extrabold leading-[1.08] tracking-tight xl:text-5xl">
              Run your business with <span className="text-lime">clarity.</span>
            </h1>
            <p className="mt-6 max-w-sm text-base leading-7 text-white/65">
              Keep every sale, shift, and decision moving in the right direction
              from one simple dashboard.
            </p>

            <ul className="mt-10 space-y-3">
              {highlights.map(({ icon: Icon, label }) => (
                <li
                  key={label}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white/85"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-lime text-ink">
                    <Icon className="h-4 w-4" />
                  </span>
                  {label}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative flex items-center gap-3 text-sm text-white/60">
            <ShieldCheck className="h-5 w-5 text-lime" aria-hidden="true" />
            Secure access for your team
          </div>
        </section>

        <section className="flex items-center justify-center px-6 py-10 sm:px-12 lg:px-16 xl:px-24">
          <div className="w-full max-w-md">
            <Link
              href="/"
              className="mb-8 inline-flex items-center gap-2 rounded-full bg-ivory px-4 py-2 text-sm font-semibold text-ink/70 transition hover:bg-ink hover:text-lime"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to home
            </Link>

            <Link href="/" className="mb-10 block lg:hidden">
              <Image src={logo} alt="SmartPOS" className="w-36" priority />
            </Link>

            <div className="mb-9">
              <span className="mb-4 inline-block rounded-full bg-lime px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-ink">
                Sign in
              </span>
              <h2 className="text-3xl font-extrabold tracking-tight text-ink">
                Good to see you again.
              </h2>
              <p className="mt-3 text-sm leading-6 text-ink/60">
                Enter your details to access your SmartPOS workspace.
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleLogin}>
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-ink"
                >
                  Email address
                </label>
                <div className="relative">
                  <Mail
                    className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-ink/40"
                    aria-hidden="true"
                  />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="h-13 w-full rounded-xl border border-ink/15 bg-ivory/60 pl-11 pr-4 text-sm text-ink outline-none transition placeholder:text-ink/40 focus:border-ink focus:bg-white focus:ring-4 focus:ring-lime/40"
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-sm font-semibold text-ink"
                  >
                    Password
                  </label>
                  <Link
                    href="#forgot-password"
                    className="text-xs font-bold text-ink underline decoration-lime decoration-2 underline-offset-4 transition hover:decoration-ink"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <LockKeyhole
                    className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-ink/40"
                    aria-hidden="true"
                  />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="h-13 w-full rounded-xl border border-ink/15 bg-ivory/60 pl-11 pr-12 text-sm text-ink outline-none transition placeholder:text-ink/40 focus:border-ink focus:bg-white focus:ring-4 focus:ring-lime/40"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-ink/40 transition hover:bg-ivory hover:text-ink"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4.5 w-4.5" />
                    ) : (
                      <Eye className="h-4.5 w-4.5" />
                    )}
                  </button>
                </div>
              </div>

              <label className="flex items-center gap-2.5 text-sm text-ink/60">
                <input
                  type="checkbox"
                  name="remember"
                  className="h-4 w-4 rounded border-ink/30 accent-ink"
                />
                Keep me signed in
              </label>

              <button
                type="submit"
                disabled={loading}
                className="group flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-ink text-sm font-bold text-white shadow-lg shadow-ink/20 transition hover:bg-ink-soft hover:shadow-xl active:scale-[0.99] disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Sign in"}
                <ArrowRight
                  className="h-4 w-4 text-lime transition-transform group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-ink/60">
              Need an account?{" "}
              <Link
                href="/contact"
                className="font-bold text-ink underline decoration-lime decoration-2 underline-offset-4 hover:decoration-ink"
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
