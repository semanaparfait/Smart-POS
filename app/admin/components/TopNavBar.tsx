"use client";

import { Bell, Search } from "lucide-react";
import React, { useEffect } from "react";
import useAuthStore from "@/stores/auth/authstore";

export default function TopNavBar() {
  const { user, fetchMe } = useAuthStore();

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  return (
    <header className="w-full h-20 bg-white border-b border-gray-200 px-6 flex items-center justify-between">
      <div className="relative w-full max-w-md">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />

        <input
          type="text"
          placeholder="Search anything..."
          className="w-full h-11 pl-10 pr-4 rounded-lg border border-gray-200 
                     bg-gray-50 text-sm outline-none
                     focus:border-green-500 focus:ring-2 focus:ring-green-100"
        />
      </div>

      <div className="flex items-center gap-6 ml-6">
        <button className="relative p-2 rounded-lg hover:bg-gray-100 transition">
          <Bell size={21} className="text-gray-600" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
        </button>

        <div className="flex items-center gap-3">
          <img
            src="https://images.unsplash.com/photo-1633332755192-727a05c4013d"
            alt="Admin Avatar"
            className="h-10 w-10 rounded-full object-cover"
          />

          <div className="hidden sm:block">
            <h1 className="font-semibold text-sm text-gray-900">
              {user?.name ?? "Guest"}
            </h1>

            <p className="text-xs text-gray-500">
              {user?.email ?? "No email"}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}