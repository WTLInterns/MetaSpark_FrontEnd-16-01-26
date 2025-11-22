"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

const mockInspections = [
  {
    id: "SF1002",
    customer: "Stark Industries",
    products: "Custom arc reactor casings",
    address: "10880 Malibu Point, 90265",
    addressTypes: ["Billing", "Shipping"],
    status: "Inspection",
  },
  {
    id: "SF1003",
    customer: "Wayne Enterprises",
    products: "Carbon fiber chassis components",
    address: "1007 Mountain Drive, Gotham",
    addressTypes: ["Billing"],
    status: "Pending",
  },
];

export default function InspectionQueuePage() {
  const [search, setSearch] = useState("");

  const filteredItems = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return mockInspections;
    return mockInspections.filter((item) =>
      [item.id, item.customer, item.products]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [search]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
            Inspection Queue
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Review and inspect finished products before completion.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          {/* Search */}
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="relative w-full">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 text-sm">
                🔍
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by Order ID or Customer..."
                className="block w-full rounded-md border border-gray-300 pl-9 pr-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product(s)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Address Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[110px]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-indigo-600 font-medium text-sm">
                      <Link href="#">{item.id}</Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 text-sm">
                      {item.customer}
                    </td>
                    <td className="px-6 py-4 text-gray-700 text-sm">
                      {item.products}
                    </td>
                    <td className="px-6 py-4 text-gray-700 text-sm whitespace-nowrap">
                      {item.address}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-1">
                      {item.addressTypes.map((type) => (
                        <span
                          key={type}
                          className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs text-gray-700"
                        >
                          {type}
                        </span>
                      ))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="inline-flex items-center rounded-full border border-indigo-100 bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-indigo-600">
                      <button className="inline-flex items-center gap-1 hover:text-indigo-700 whitespace-nowrap">
                        <span>View Details</span>
                        <span>→</span>
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredItems.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-6 text-center text-sm text-gray-500"
                    >
                      No orders found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile card list */}
          <div className="md:hidden divide-y divide-gray-200">
            {filteredItems.map((item) => (
              <div key={item.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs text-gray-500">Order ID</div>
                    <div className="text-sm font-medium text-indigo-600">
                      <Link href="#">{item.id}</Link>
                    </div>
                    <div className="mt-1 text-sm text-gray-900">{item.customer}</div>
                    <div className="mt-1 text-xs text-gray-600">
                      {item.products}
                    </div>
                  </div>
                  <span className="inline-flex items-center rounded-full border border-indigo-100 bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
                    {item.status}
                  </span>
                </div>

                <div className="mt-3 text-xs text-gray-600 space-y-1">
                  <div className="font-medium text-gray-700">Address</div>
                  <div>{item.address}</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {item.addressTypes.map((type) => (
                      <span
                        key={type}
                        className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[11px] text-gray-700"
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-3 flex justify-end">
                  <button className="text-sm text-indigo-600 font-medium inline-flex items-center gap-1">
                    <span>View Details</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            ))}

            {filteredItems.length === 0 && (
              <div className="p-6 text-center text-sm text-gray-500">
                No orders found matching your search.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

