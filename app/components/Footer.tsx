import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#051812] text-slate-300 pt-16 pb-8 border-t border-emerald-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-emerald-900/40">
          
          {/* Column 1: Brand Info */}
          <div className="lg:col-span-1 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#00a66c] text-white shadow-md">
                <svg className="w-5 h-5 fill-current text-white" viewBox="0 0 24 24">
                  <path d="M12 2L3 7v10l9 5 9-5V7l-9-5zm0 2.24l6.75 3.75v7.5L12 19.24l-6.75-3.75v-7.5L12 4.24zM12 7a3 3 0 100 6 3 3 0 000-6z" />
                </svg>
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight">
                Smart<span className="text-[#00a66c]">POS</span>
              </span>
            </Link>
            
            <p className="text-xs text-slate-400 leading-relaxed">
              Smarter Business. Easier Operations.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-2.5 pt-2">
              {/* Facebook */}
              <a href="#" aria-label="Facebook" className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-950 hover:bg-[#00a66c] text-emerald-400 hover:text-white transition-colors">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>

              {/* Twitter / X */}
              <a href="#" aria-label="Twitter" className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-950 hover:bg-[#00a66c] text-emerald-400 hover:text-white transition-colors">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>

              {/* LinkedIn */}
              <a href="#" aria-label="LinkedIn" className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-950 hover:bg-[#00a66c] text-emerald-400 hover:text-white transition-colors">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>

              {/* YouTube */}
              <a href="#" aria-label="YouTube" className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-950 hover:bg-[#00a66c] text-emerald-400 hover:text-white transition-colors">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2.5 text-xs">
              {['Home', 'Features', 'Industries', 'Pricing', 'About', 'Contact'].map((item) => (
                <li key={item}>
                  <a href={`#${item.toLowerCase()}`} className="text-slate-400 hover:text-[#00a66c] transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Industries */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4">Industries</h4>
            <ul className="space-y-2.5 text-xs">
              {['Restaurants', 'Bars', 'Hotels & Motels', 'Supermarkets', 'Pharmacies', 'Shops & Retail'].map((item) => (
                <li key={item}>
                  <a href="#industries" className="text-slate-400 hover:text-[#00a66c] transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Support */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4">Support</h4>
            <ul className="space-y-2.5 text-xs">
              {['Help Center', 'Installation Guide', 'FAQs', 'Contact Us'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-slate-400 hover:text-[#00a66c] transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 5: Newsletter */}
          <div>
            <h4 className="text-sm font-bold text-white mb-2">Subscribe to our newsletter</h4>
            <p className="text-xs text-slate-400 mb-4">
              Get the latest updates and tips.
            </p>
            <form  className="flex items-center gap-2">
              <input
                type="email"
                placeholder="Your email address"
                className="w-full rounded-xl bg-emerald-950/60 border border-emerald-900/60 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00a66c]"
              />
              <button
                type="submit"
                aria-label="Subscribe"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#00a66c] hover:bg-[#008f5d] text-white transition-colors"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© 2026 SmartPOS. All rights reserved.</p>
          <p className="flex items-center gap-3">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Security Overview</span>

          </p>
        </div>

      </div>
    </footer>
  );
}
