"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import logo from "@/public/smartpos_logo.png"
export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const isJobsPage = pathname?.includes("/jobs");

  const navLinks = [
    { name: "Home", href: "/", active: pathname === "/" },
    { name: "Features", href: isJobsPage ? "/#features" : "#features", active: false },
    { name: "Industries", href: isJobsPage ? "/#industries" : "#industries", active: false },
    { name: "Pricing", href: isJobsPage ? "/#pricing" : "#pricing", active: false },
    { name: "About", href: isJobsPage ? "/#about" : "#about", active: false },
    { name: "Jobs", href: "/pages/jobs", active: Boolean(isJobsPage) },
    { name: "Contact", href: isJobsPage ? "/#contact" : "#contact", active: false },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-20">
        {/* Brand Logo */}
        <Link href="/" className="">
          <Image src={logo} alt="Logo" className="w-32" />

        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`relative px-4 py-2 text-sm font-semibold transition-colors duration-150 ${
                link.active
                  ? "text-(--emerald-primary)"
                  : "text-(--foreground) hover:text-(--foreground)/10"
              }`}
            >
              {link.name}
              {link.active && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-1 bg-(--emerald-primary) rounded-full" />
              )}
            </Link>
          ))}
        </nav>

        {/* Desktop Action Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/pages/Login"
            className="text-sm font-semibold text-slate-700 hover:text-[#00a66c] transition-colors"
          >
            Login
          </Link>
          <Link
            href="#request-installation"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold  bg-(--emerald-primary) hover:bg-(--emerald-dark) shadow-sm hover:shadow-md transition-all active:scale-95"
          >
            <span>Request Installation</span>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          type="button"
          aria-label="Toggle Navigation Menu"
          className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg focus:outline-none"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden border-b border-slate-100 bg-white px-4 py-4 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={`block px-3 py-2 rounded-lg text-base font-medium ${
                link.active
                  ? "text-(--emerald-primary) bg-emerald-50 font-bold"
                  : "text-(--foreground) hover:bg-(--foreground)/10"
              }`}
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <Link
              href="/pages/Login"
              onClick={() => setIsOpen(false)}
              className="w-full text-center py-2.5 rounded-lg border border-slate-200 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Login
            </Link>
            <Link
              href="#request-installation"
              onClick={() => setIsOpen(false)}
              className="w-full text-center py-2.5 rounded-full bg-(--emerald-primary) text-white font-semibold shadow-sm"
            >
              Request Installation →
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
