"use client";

import { useState } from "react";

const initialUsers = [
  {
    id: 1,
    name: "Admin User",
    email: "admin@swiftflow.com",
    role: "Admin",
    status: "Active",
    dateAdded: "Nov 22, 2025",
  },
  {
    id: 2,
    name: "Dana Scully",
    email: "dana.s@swiftflow.com",
    role: "Design",
    status: "Active",
    dateAdded: "Nov 22, 2025",
  },
  {
    id: 3,
    name: "Peter Parker",
    email: "peter.p@swiftflow.com",
    role: "Production",
    status: "Active",
    dateAdded: "Nov 22, 2025",
  },
  {
    id: 4,
    name: "Tony Stark",
    email: "tony.s@swiftflow.com",
    role: "Machinists",
    status: "Active",
    dateAdded: "Nov 22, 2025",
  },
  {
    id: 5,
    name: "Walter White",
    email: "walter.w@swiftflow.com",
    role: "Inspection",
    status: "Active",
    dateAdded: "Nov 22, 2025",
  },
  {
    id: 6,
    name: "Fox Mulder",
    email: "fox.m@swiftflow.com",
    role: "Support",
    status: "Active",
    dateAdded: "Nov 22, 2025",
  },
];

function StatusBadge({ status }) {
  const base =
    "inline-flex items-center rounded-full px-3 py-0.5 text-xs font-medium";
  if (status === "Active") {
    return (
      <span className={`${base} bg-indigo-600 text-white`}>{status}</span>
    );
  }
  return (
    <span className={`${base} bg-gray-100 text-gray-700`}>{status}</span>
  );
}

function RoleBadge({ role }) {
  return (
    <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-3 py-0.5 text-xs font-medium text-gray-700">
      {role}
    </span>
  );
}

export default function UserManagementPage() {
  const [users] = useState(initialUsers);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "",
  });

  const closeModal = () => {
    setShowCreateModal(false);
    setForm({ name: "", email: "", role: "" });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send form data to your API
    console.log("Create user:", form);
    closeModal();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
              User Management
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Create, view, and manage user accounts.
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 self-start sm:self-auto"
          >
            <span className="text-base">👤</span>
            <span>Create User</span>
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          {/* Desktop list header */}
          <div className="hidden md:grid grid-cols-12 gap-4 pl-6 pr-10 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
            <div className="col-span-4">User</div>
            <div className="col-span-2">Role</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-3">Date Added</div>
            <div className="col-span-1 text-right">Actions</div>
          </div>

          {/* Desktop list rows */}
          <div className="hidden md:block">
            {users.map((user, idx) => (
              <div
                key={user.id}
                className={`grid grid-cols-12 gap-4 items-center pl-6 pr-10 py-4 text-sm ${
                  idx !== users.length - 1 ? "border-b border-gray-100" : ""
                }`}
              >
                {/* User */}
                <div className="col-span-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-700">
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{user.name}</div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                  </div>
                </div>

                {/* Role */}
                <div className="col-span-2">
                  <RoleBadge role={user.role} />
                </div>

                {/* Status */}
                <div className="col-span-2">
                  <StatusBadge status={user.status} />
                </div>

                {/* Date Added */}
                <div className="col-span-3 text-sm text-gray-700">
                  {user.dateAdded}
                </div>

                {/* Actions */}
                <div className="col-span-1 flex justify-end">
                  <button
                    className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-100"
                    type="button"
                  >
                    <span>🗑️</span>
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-gray-100">
            {users.map((user) => (
              <div key={user.id} className="p-4 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-700">
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 text-sm">{user.name}</div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <RoleBadge role={user.role} />
                  <StatusBadge status={user.status} />
                  <span className="text-gray-500 text-[11px] ml-auto">
                    {user.dateAdded}
                  </span>
                </div>

                <div className="flex justify-end">
                  <button className="px-3 py-1 rounded-full border border-gray-200 text-xs text-gray-600 hover:bg-gray-50">
                    Manage
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Create New User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 sm:py-8 bg-black/40">
          <div
            className="w-full max-w-lg rounded-lg bg-white shadow-xl border border-gray-200 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between px-5 py-4 border-b border-gray-200">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                  Create New User
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  Enter the details for the new user account.
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-5 py-4 sm:py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. John Doe"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="e.g. john.d@example.com"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                  required
                >
                  <option value="" disabled>
                    Select a role...
                  </option>
                  {/* <option value="Admin">Admin</option> */}
                  <option value="Design">Design</option>
                  <option value="Production">Production</option>
                  <option value="Machinists">Machinists</option>
                  <option value="Inspection">Inspection</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-md border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-indigo-600 text-sm font-medium text-white hover:bg-indigo-700"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

