import React from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Building2,
  GitBranch,
  Monitor,
  Users,
  Package,
  ShoppingCart,
  CreditCard,
  BarChart3,
  ClipboardList,
  Headphones,
  Bell,
  ShieldCheck,
  Settings,
  LogOut,
} from "lucide-react";

const menuItems = [
  {
    title: "Overview",
    items: [{ name: "Dashboard", icon: LayoutDashboard, href: "/admin" }],
  },
  {
    title: "Business",
    items: [
      { name: "Companies", icon: Building2, href: "/admin/tabs/companies" },
      { name: "Branches", icon: GitBranch },
      { name: "Installation Requests", icon: ClipboardList },
    ],
  },
  {
    title: "POS Management",
    items: [
      { name: "POS Devices", icon: Monitor },
      { name: "Activation Keys", icon: ShieldCheck },
    ],
  },
  {
    title: "Users & Access",
    items: [
      { name: "Users", icon: Users },
      { name: "Roles & Permissions", icon: ShieldCheck },
    ],
  },
  {
    title: "Operations",
    items: [
      { name: "Products", icon: Package },
      { name: "Orders", icon: ShoppingCart },
      { name: "Payments", icon: CreditCard },
    ],
  },
  {
    title: "Analytics",
    items: [{ name: "Sales Analytics", icon: BarChart3 }],
  },
  {
    title: "System",
    items: [
      { name: "Notifications", icon: Bell },
      { name: "Support", icon: Headphones },
      { name: "Settings", icon: Settings },
    ],
  },
];

export default function SiderBar() {
  return (
    <aside className="w-64 min-h-screen bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="h-20 px-6 flex items-center border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-600 flex items-center justify-center">
            <span className="text-white font-bold text-lg">S</span>
          </div>

          <div>
            <h1 className="font-bold text-xl text-gray-900">SmartPOS</h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">
              Super Admin
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-5">
        {menuItems.map((section) => (
          <div key={section.title} className="mb-6">
            <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              {section.title}
            </p>

            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;

                if (item.href) {
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-green-50 hover:text-green-700 transition"
                    >
                      <Icon size={18} />
                      <span>{item.name}</span>
                    </Link>
                  );
                }

                return (
                  <button
                    key={item.name}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-green-50 hover:text-green-700 transition"
                  >
                    <Icon size={18} />
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-100">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50 transition">
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
