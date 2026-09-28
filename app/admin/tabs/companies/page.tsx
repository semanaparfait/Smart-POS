"use client";
import React from "react";
import useCompaniesStore from "@/stores/companies/companystore";
import {
  BadgeCheck,
  Building2,
  TriangleAlert,
  Clock9,
  MapPin,
  Hotel,
  Wine,
  Utensils,
  Coffee,
  ShoppingBag,
} from "lucide-react";

export default function CompaniesPage() {
  const companies = useCompaniesStore((state) => state.companies);
  const fetchCompanies = useCompaniesStore((state) => state.fetchCompanies);

  React.useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);
  console.log("Companies:", companies);
  const counts = [
    {
      icon: Building2,
      name: "Total Companies",
      count: 10,
      color: "text-green-500",
    },
    {
      icon: BadgeCheck,
      name: "Active Companies",
      count: 8,
      color: "text-blue-500",
    },
    {
      icon: Clock9,
      name: "Pending Companies",
      count: 2,
      color: "text-yellow-500",
    },
    {
      icon: TriangleAlert,
      name: "Inactive Companies",
      count: 2,
      color: "text-red-500",
    },
  ];
  return (
    <main>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Companies</h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage all businesses using the SmartPOS platform.
          </p>
        </div>

        <button className="rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700">
          + Add Company
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {counts.map((item) => (
          <div
            key={item.name}
            className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-gray-100 p-3 rounded-full">
                {item.icon && <item.icon className={`h-6 w-6 ${item.color}`} />}
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-700 whitespace-nowrap truncate">
                  {item.name}
                </p>
                <p className="text-2xl font-bold text-gray-900">{item.count}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="text"
          placeholder="Search companies..."
          className="block w-1/2 rounded-md border-0 py-1.5 pl-3 text-gray-900 shadow-sm ring-1 outline-none ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-900 sm:text-sm sm:leading-6"
        />
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <select className="block w-full rounded-md border-0 py-1.5  text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6">
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="inactive">Inactive</option>
          </select>

          <select className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6">
            <option value="">All Industries</option>
            <option value="hotel">Hotel</option>
            <option value="bar">Bar</option>
            <option value="retail">Retail</option>
            <option value="restaurant">Restaurant</option>
            <option value="cafe">Cafe</option>
            <option value="supermarket">Supermarket</option>
          </select>
        </div>
      </div>

      <div className="mt-6">
        <p className="text-sm text-gray-500">
          Showing <span className="font-medium">1</span> to{" "}
          <span className="font-medium">10</span> of{" "}
          <span className="font-medium">100</span> results
        </p>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {companies.map((company, index) => (
            <div
              key={company.id}
              className="mt-4 rounded-lg bg-white px-4 py-5 shadow sm:p-6  "
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {company.logo === null || company.logo === undefined ? (
                      <img
                        src={company.logo}
                        alt={company.name}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-between justify-center rounded-full bg-green-100 text-lg font-bold text-green-700 uppercase">
                        {company.name ? company.name.charAt(0) : "C"}
                      </div>
                    )}

                    <div>
                      <h1 className="text-lg font-bold text-gray-900">
                        {company.name}
                      </h1>
                      <p className="text-sm text-gray-500">
                        COMP - {index + 1}
                      </p>
                    </div>
                  </div>
                  <p className="text-[10px] text-green-500 bg-green-200 rounded-2xl px-2 py-1">
                    Active
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex flex-col gap-2">
                      <div className="flex fl items-center gap-2">
                        {(() => {
                          if (company.type === "HOTEL") {
                            return <Hotel className="h-4 w-4 text-blue-600" />;
                          } else if (company.type === "BAR") {
                            return <Wine className="h-4 w-4 text-yellow-600" />;
                          } else if (company.type === "RESTAURANT") {
                            return (
                              <Utensils className="h-4 w-4 text-red-600" />
                            );
                          } else if (company.type === "CAFE") {
                            return (
                              <Coffee className="h-4 w-4 text-purple-600" />
                            );
                          } else if (company.type === "SUPERMARKET") {
                            return (
                              <ShoppingBag className="h-4 w-4 text-pink-600" />
                            );
                          }
                        })()}
                        <span className="ml-1 text-sm text-gray-500">
                          {company.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-green-600" />
                        <span className="ml-1 text-sm text-gray-500">
                          {company.location}
                        </span>
                      </div>
                    </div>

                    <div>
                      <img
                        src={(() => {
                          if (company.type === "HOTEL") {
                            return "/https://i.pinimg.com/736x/8b/12/3f/8b123f3ec3afe8b513d340a8bb7c090d.jpg";
                          } else if (company.type === "BAR") {
                            return "https://i.pinimg.com/1200x/9f/6b/71/9f6b7166720dec2afecb1c6b58a076b6.jpg";
                          } else if (company.type === "RESTAURANT") {
                            return "https://i.pinimg.com/736x/59/54/ad/5954ad7e10bec0c3153ae92ac71b47a3.jpg";
                          } else if (company.type === "CAFE") {
                            return "/images/caffe.png";
                          } else if (company.type === "SUPERMARKET") {
                            return "https://i.pinimg.com/1200x/de/21/03/de2103fe44c04157076ae9a17611a7d6.jpg";
                          }
                        })()}
                        alt={company.name}
                        className="h-16 w-16 object-cover rounded-lg"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mt-4">
                    <div>
                      <h1 className="font-bold">3</h1>
                      <p className="text-sm text-gray-500">Brances</p>
                    </div>
                    <div>
                      <h1 className="font-bold">12</h1>
                      <p className="text-sm text-gray-500">Devices</p>
                    </div>
                    <div>
                      <h1 className="font-bold">3</h1>
                      <p className="text-sm text-gray-500"> Users</p>
                    </div>
                    <div>
                      <h1 className="font-bold">RWF 50 M</h1>
                      <p className="text-sm text-gray-500">Revenue(30d)</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-4 w-full">
                    <button className="w-1/2 rounded-lg border border-gray-300 px-3 py-1 text-sm font-semibold  transition ">
                      Edit
                    </button>
                    <button className="w-1/2 rounded-lg bg-green-600 px-3 py-1 text-sm font-semibold text-white transition hover:bg-green-700">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
