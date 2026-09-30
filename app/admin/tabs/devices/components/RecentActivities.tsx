"use client";
import React from 'react'
import { ChevronRight, History, LogIn, MapPin, Settings, Smartphone } from 'lucide-react'
import Link from 'next/link'

export default function RecentActivities() {
  return (
            
        <div className="rounded-xl border border-slate-200/90 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-emerald-700" />
              <h2 className="text-sm font-semibold text-slate-900">Recent Activity</h2>
            </div>
            <Link
              href="#"
              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 hover:text-emerald-900"
            >
              View All <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-5 space-y-6">
            {/* Event 1 */}
            <div className="relative flex items-start gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                <Smartphone className="h-4 w-4" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-bold text-slate-900">Device registered</p>
                </div>
                <p className="text-[11px] text-slate-400">Sep 30, 2026 • 10:32 AM</p>
                <p className="text-xs text-slate-600 pt-0.5">
                  Device POS-  "NTC8ZD-001" was registered to Lex Corp Hotel.
                </p>
              </div>
            </div>

            {/* Event 2 */}
            <div className="relative flex items-start gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                <LogIn className="h-4 w-4" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-bold text-slate-900">Login successful</p>
                </div>
                <p className="text-[11px] text-slate-400">Sep 30, 2026 • 10:30 AM</p>
                <p className="text-xs text-slate-600 pt-0.5">
                  Device logged in by Shema Parfait.
                </p>
              </div>
            </div>

            {/* Event 3 */}
            <div className="relative flex items-start gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                <Settings className="h-4 w-4" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-bold text-slate-900">Configuration updated</p>
                </div>
                <p className="text-[11px] text-slate-400">Sep 29, 2026 • 06:42 PM</p>
                <p className="text-xs text-slate-600 pt-0.5">
                  POS settings were updated by Super Admin.
                </p>
              </div>
            </div>

            {/* Event 4 */}
            <div className="relative flex items-start gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                <MapPin className="h-4 w-4" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-bold text-slate-900">Device location changed</p>
                </div>
                <p className="text-[11px] text-slate-400">Sep 28, 2026 • 03:15 PM</p>
                <p className="text-xs text-slate-600 pt-0.5">
                  Location set to Main Restaurant.
                </p>
              </div>
            </div>
          </div>
        </div>
  )
}
