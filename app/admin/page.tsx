import {
  Building2,
  Monitor,
  Users,
  CreditCard,
  ShoppingCart,
  ClipboardList,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
} from "lucide-react";

const stats = [
  {
    title: "Total Companies",
    value: "248",
    change: "+12%",
    description: "vs last month",
    icon: Building2,
    positive: true,
  },
  {
    title: "Active POS Devices",
    value: "1,172",
    change: "91%",
    description: "online",
    icon: Monitor,
    positive: true,
  },
  {
    title: "Platform Revenue",
    value: "24.8M RWF",
    change: "+14.8%",
    description: "vs last month",
    icon: CreditCard,
    positive: true,
  },
  {
    title: "Total Users",
    value: "4,892",
    change: "+10%",
    description: "vs last month",
    icon: Users,
    positive: true,
  },
  {
    title: "Transactions Today",
    value: "18,492",
    change: "+16.3%",
    description: "vs yesterday",
    icon: ShoppingCart,
    positive: true,
  },
  {
    title: "Pending Requests",
    value: "27",
    change: "-5%",
    description: "vs last week",
    icon: ClipboardList,
    positive: false,
  },
];

const installationRequests = [
  ["Lex Corp Hotel", "New Installation", "Pending", "Apr 29, 2026"],
  ["Pearl Shop", "Device Setup", "Review", "Apr 28, 2026"],
  ["Kigali Bar", "New Installation", "Approve", "Apr 28, 2026"],
  ["Downtown Hotel", "Device Setup", "Pending", "Apr 27, 2026"],
  ["Royal Restaurant", "Maintenance", "Review", "Apr 26, 2026"],
];

const recentTransactions = [
  ["Lex Hotel", "Downtown", "45,000 RWF", "10:22 AM"],
  ["Pearl Shop", "Kimihurura", "12,500 RWF", "10:18 AM"],
  ["Kigali Bar", "Kacyiru", "80,000 RWF", "09:54 AM"],
  ["Royal Restaurant", "Nyamirambo", "36,000 RWF", "09:32 AM"],
  ["Sky Lounge", "Remera", "22,500 RWF", "09:12 AM"],
];

export default function Page() {
  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Good morning, Shema 👋
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Here's your complete SmartPOS platform overview.
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
                  <Icon className="text-green-600" size={20} />
                </div>

                <ArrowUpRight
                  size={17}
                  className="text-gray-400"
                />
              </div>

              <p className="mt-4 text-sm text-gray-500">
                {stat.title}
              </p>

              <h2 className="mt-1 text-2xl font-bold text-gray-900">
                {stat.value}
              </h2>

              <div className="mt-2 flex items-center gap-2 text-xs">
                {stat.positive ? (
                  <TrendingUp size={14} className="text-green-600" />
                ) : (
                  <TrendingDown size={14} className="text-red-500" />
                )}

                <span
                  className={
                    stat.positive
                      ? "font-medium text-green-600"
                      : "font-medium text-red-500"
                  }
                >
                  {stat.change}
                </span>

                <span className="text-gray-400">
                  {stat.description}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Revenue + Platform Status */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

        {/* Revenue */}
        <div className="xl:col-span-2 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">
                Revenue Overview
              </h2>

              <p className="text-sm text-gray-500">
                Total platform revenue
              </p>
            </div>

            <select className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 12 months</option>
            </select>
          </div>

          {/* Simple chart */}
          <div className="mt-8 flex h-64 items-end gap-4 border-b border-gray-100 px-4">
            {[35, 48, 42, 65, 58, 75, 88].map((height, index) => (
              <div
                key={index}
                className="flex flex-1 flex-col items-center justify-end gap-2"
              >
                <div
                  className="w-full max-w-12 rounded-t-md bg-green-500"
                  style={{ height: `${height}%` }}
                />

                <span className="text-xs text-gray-400">
                  Apr {23 + index}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Platform Status */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">
                Platform Status
              </h2>

              <p className="mt-1 text-xs text-green-600">
                ● All systems operational
              </p>
            </div>

            <CheckCircle2
              className="text-green-500"
              size={22}
            />
          </div>

          <div className="mt-6 space-y-4">
            {[
              "API Server",
              "Database",
              "POS Service",
              "Mobile App",
              "Payment Gateway",
            ].map((service) => (
              <div
                key={service}
                className="flex items-center justify-between border-b border-gray-100 pb-3"
              >
                <span className="text-sm text-gray-600">
                  {service}
                </span>

                <span className="flex items-center gap-2 text-xs font-medium text-green-600">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  Healthy
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Requests + Device Health */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

        {/* Installation Requests */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 p-5">
            <div>
              <h2 className="font-semibold text-gray-900">
                Installation Requests
              </h2>

              <p className="text-sm text-gray-500">
                Recent requests from businesses
              </p>
            </div>

            <button className="text-sm font-medium text-green-600">
              View all
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-400">
                <tr>
                  <th className="px-5 py-3">Business</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Date</th>
                </tr>
              </thead>

              <tbody>
                {installationRequests.map((request) => (
                  <tr
                    key={request[0]}
                    className="border-t border-gray-100"
                  >
                    <td className="px-5 py-4 font-medium text-gray-800">
                      {request[0]}
                    </td>

                    <td className="px-5 py-4 text-gray-500">
                      {request[1]}
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-600">
                        {request[2]}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-gray-500">
                      {request[3]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Device Health */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 p-5">
            <div>
              <h2 className="font-semibold text-gray-900">
                POS Device Health
              </h2>

              <p className="text-sm text-gray-500">
                Current device status
              </p>
            </div>

            <button className="text-sm font-medium text-green-600">
              View all
            </button>
          </div>

          <div className="divide-y divide-gray-100">
            {[
              ["POS-001", "Lex Hotel", "Downtown", true],
              ["POS-002", "Pearl Shop", "Kimihurura", true],
              ["POS-003", "Kigali Bar", "Kacyiru", false],
              ["POS-004", "Royal Restaurant", "Nyamirambo", true],
              ["POS-005", "Sky Lounge", "Remera", true],
            ].map(([device, business, branch, online]) => (
              <div
                key={String(device)}
                className="grid grid-cols-4 items-center px-5 py-4 text-sm"
              >
                <span className="font-medium text-gray-800">
                  {device}
                </span>

                <span className="text-gray-500">
                  {business}
                </span>

                <span className="text-gray-500">
                  {branch}
                </span>

                <span
                  className={
                    online
                      ? "flex items-center gap-2 text-xs font-medium text-green-600"
                      : "flex items-center gap-2 text-xs font-medium text-red-500"
                  }
                >
                  <span
                    className={
                      online
                        ? "h-2 w-2 rounded-full bg-green-500"
                        : "h-2 w-2 rounded-full bg-red-500"
                    }
                  />

                  {online ? "Online" : "Offline"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Transactions + Quick Activity */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

        {/* Transactions */}
        <div className="xl:col-span-2 rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 p-5">
            <div>
              <h2 className="font-semibold text-gray-900">
                Recent Transactions
              </h2>

              <p className="text-sm text-gray-500">
                Latest transactions across the platform
              </p>
            </div>

            <button className="text-sm font-medium text-green-600">
              View all
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-400">
                <tr>
                  <th className="px-5 py-3">Business</th>
                  <th className="px-5 py-3">Branch</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Time</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>

              <tbody>
                {recentTransactions.map((transaction) => (
                  <tr
                    key={`${transaction[0]}-${transaction[3]}`}
                    className="border-t border-gray-100"
                  >
                    <td className="px-5 py-4 font-medium text-gray-800">
                      {transaction[0]}
                    </td>

                    <td className="px-5 py-4 text-gray-500">
                      {transaction[1]}
                    </td>

                    <td className="px-5 py-4 font-medium text-gray-800">
                      {transaction[2]}
                    </td>

                    <td className="px-5 py-4 text-gray-500">
                      {transaction[3]}
                    </td>

                    <td className="px-5 py-4">
                      <span className="flex w-fit items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-600">
                        <CheckCircle2 size={12} />
                        Paid
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">
              Recent Activity
            </h2>

            <button className="text-sm font-medium text-green-600">
              View all
            </button>
          </div>

          <div className="mt-5 space-y-5">
            {[
              ["New company registered", "Lex Corp Hotel", "2 min ago"],
              ["POS device went offline", "POS-003", "12 min ago"],
              ["Installation approved", "Kigali Bar", "24 min ago"],
              ["New user created", "John Doe", "1 hour ago"],
              ["Payment received", "80,000 RWF", "2 hours ago"],
            ].map(([title, detail, time]) => (
              <div key={title} className="flex gap-3">
                <div className="mt-1 h-2.5 w-2.5 rounded-full bg-green-500" />

                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">
                    {title}
                  </p>

                  <p className="text-xs text-gray-500">
                    {detail}
                  </p>
                </div>

                <span className="whitespace-nowrap text-[11px] text-gray-400">
                  {time}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Warning */}
      <div className="flex items-center gap-3 rounded-xl border border-orange-200 bg-orange-50 p-4">
        <AlertCircle className="text-orange-500" size={20} />

        <div>
          <p className="text-sm font-semibold text-orange-800">
            3 POS devices require attention
          </p>

          <p className="text-xs text-orange-700">
            Check device health to review offline or inactive devices.
          </p>
        </div>
      </div>
    </div>
  );
}