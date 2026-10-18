"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Menu, X } from "lucide-react";
import Logo from "@/app/components/Logo";

const INSTALL_HREF = "/request-installation";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const isJobsPage = pathname?.includes("/jobs");

  // Close the mobile menu with Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setIsOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  // Section links are absolute ("/#…") so they work from every page
  const navLinks = [
    { name: "Home", href: "/", active: pathname === "/" },
    { name: "Features", href: "/#features", active: false },
    { name: "Industries", href: "/#industries", active: false },
    { name: "Pricing", href: "/#pricing", active: false },
    { name: "Jobs", href: "/pages/jobs", active: Boolean(isJobsPage) },
    { name: "Contact", href: "/contact", active: pathname === "/contact" },
  ];

  return (
    <header className="site sticky top-0 z-50 w-full border-b border-ink/10 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" aria-label="SmartPOS home" className="shrink-0">
          <Logo />
        </Link>

        {/* Desktop Navigation Links */}
        <nav aria-label="Main" className="hidden lg:flex items-center gap-1 rounded-full bg-ivory p-1.5">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              aria-current={link.active ? "page" : undefined}
              className={`rounded-full px-3.5 xl:px-4 py-2 text-sm font-semibold transition-colors duration-150 ${
                link.active
                  ? "bg-ink text-lime shadow-sm"
                  : "text-ink/70 hover:bg-white hover:text-ink"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Desktop Action Buttons */}
        <div className="hidden lg:flex items-center gap-2 xl:gap-3">
          <Link
            href="/pages/Login"
            className="rounded-full px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-ivory"
          >
            Login
          </Link>
          <Link
            href={INSTALL_HREF}
            className="group inline-flex items-center justify-center gap-2 rounded-full bg-lime px-5 py-2.5 text-sm font-bold text-ink shadow-sm transition-all hover:bg-lime-dark hover:shadow-md active:scale-95"
          >
            <span className="hidden xl:inline">Request Installation</span>
            <span className="xl:hidden">Get Started</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          type="button"
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
          aria-controls="mobile-menu"
          className="lg:hidden flex h-10 w-10 items-center justify-center rounded-xl bg-ivory text-ink transition-colors hover:bg-ink hover:text-lime"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <nav
          id="mobile-menu"
          aria-label="Mobile"
          className="lg:hidden border-t border-ink/10 bg-white px-4 py-4 space-y-1 shadow-lg sm:px-6"
        >
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              aria-current={link.active ? "page" : undefined}
              onClick={() => setIsOpen(false)}
              className={`block rounded-xl px-4 py-2.5 text-base font-semibold ${
                link.active
                  ? "bg-ink text-lime"
                  : "text-ink hover:bg-ivory"
              }`}
            >
              {link.name}
            </Link>
          ))}
          <div className="mt-3 flex flex-col gap-2 border-t border-ink/10 pt-4 sm:flex-row">
            <Link
              href="/pages/Login"
              onClick={() => setIsOpen(false)}
              className="w-full rounded-full border border-ink/15 py-2.5 text-center font-semibold text-ink hover:bg-ivory"
            >
              Login
            </Link>
            <Link
              href={INSTALL_HREF}
              onClick={() => setIsOpen(false)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-lime py-2.5 text-center font-bold text-ink shadow-sm hover:bg-lime-dark"
            >
              Request Installation
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
