'use client';

import { useState } from 'react';
import Link from 'next/link';

const navLinks = [
  { name: 'Home', href: '#', active: true },
  { name: 'Features', href: '#features', active: false },
  { name: 'Industries', href: '#industries', active: false },
  { name: 'Pricing', href: '#pricing', active: false },
  { name: 'About', href: '#about', active: false },
  { name: 'Contact', href: '#contact', active: false },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-20">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00a66c] text-white shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform duration-200">
            {/* Geometric POS Hexagon Icon */}
            <svg className="w-6 h-6 fill-current text-white" viewBox="0 0 24 24">
              <path d="M12 2L3 7v10l9 5 9-5V7l-9-5zm0 2.24l6.75 3.75v7.5L12 19.24l-6.75-3.75v-7.5L12 4.24zM12 7a3 3 0 100 6 3 3 0 000-6z" />
            </svg>
          </div>
          <span className="text-2xl font-extrabold tracking-tight text-slate-900">
            Smart<span className="text-[#00a66c]">POS</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`relative px-4 py-2 text-sm font-semibold transition-colors duration-150 ${
                link.active
                  ? 'text-[#00a66c]'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {link.name}
              {link.active && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-1 bg-[#00a66c] rounded-full" />
              )}
            </Link>
          ))}
        </nav>

        {/* Desktop Action Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="#login"
            className="text-sm font-semibold text-slate-700 hover:text-[#00a66c] transition-colors"
          >
            Login
          </Link>
          <Link
            href="#request-installation"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white bg-[#00a66c] hover:bg-[#008f5d] shadow-sm hover:shadow-md transition-all active:scale-95"
          >
            <span>Request Installation</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
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
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
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
                  ? 'text-[#00a66c] bg-emerald-50 font-bold'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <Link
              href="#login"
              onClick={() => setIsOpen(false)}
              className="w-full text-center py-2.5 rounded-lg border border-slate-200 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Login
            </Link>
            <Link
              href="#request-installation"
              onClick={() => setIsOpen(false)}
              className="w-full text-center py-2.5 rounded-full bg-[#00a66c] text-white font-semibold shadow-sm"
            >
              Request Installation →
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}