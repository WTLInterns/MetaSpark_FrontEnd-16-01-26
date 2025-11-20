'use client'

import React, { useMemo, useState } from 'react';
import Link from 'next/link';

const DEFAULT_ROWS = [
  { id: 'SF1005', customer: 'Tyrell Corporation', products: 'Voight-Kampff machine empathy sensors', date: 'Nov 20, 2025', status: 'Inquiry', dept: 'Design' },
  { id: 'SF1004', customer: 'Cyberdyne Systems', products: 'T-800 endoskeleton fingers (prototype)', date: 'Nov 18, 2025', status: 'Design', dept: 'Design' },
  { id: 'SF1003', customer: 'Wayne Enterprises', products: 'Graphene-composite body armor plates', date: 'Nov 17, 2025', status: 'Machining', dept: 'Machining' },
  { id: 'SF1002', customer: 'Stark Industries', products: 'Custom arc reactor casings', date: 'Nov 15, 2025', status: 'Inspection', dept: 'Inspection' },
  { id: 'SF1001', customer: 'ACME Corp', products: 'High-precision gear shafts', date: 'Nov 10, 2025', status: 'Completed', dept: 'Production' },
];

export default function AllOrdersPage() {
  const [rows, setRows] = useState(DEFAULT_ROWS);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ customer: '', products: '', custom: '', units: '', material: '', dept: '' });

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    let out = rows;
    if (statusFilter !== 'All') out = out.filter(r => r.status === statusFilter);
    if (q) out = out.filter(r => r.id.toLowerCase().includes(q) || r.customer.toLowerCase().includes(q));
    return out;
  }, [rows, query, statusFilter]);

  const createOrder = () => {
    const nextNum = Math.max(1000, ...rows.map(r => Number(String(r.id).replace(/\D/g, '')))) + 1;
    const id = `SF${nextNum}`;
    const productText = form.custom?.trim() ? form.custom.trim() : (form.products || '—');
    const options = { month: 'short', day: '2-digit', year: 'numeric' };
    const dateStr = new Date().toLocaleDateString('en-US', options);
    const newRow = {
      id,
      customer: form.customer || 'Unknown Customer',
      products: productText,
      date: dateStr,
      status: 'Inquiry',
      dept: form.dept || 'Design',
    };
    setRows(prev => [newRow, ...prev]);
    setShowModal(false);
    setForm({ customer: '', products: '', custom: '', units: '', material: '', dept: '' });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar (match dashboard) */}
      <aside className="w-64 bg-white border-r border-gray-200 p-4 hidden md:flex flex-col">
        <div className="flex items-center gap-2 px-2 py-3">
          <div className="h-6 w-6 rounded-md bg-blue-600" />
          <span className="text-lg font-semibold text-black">SwiftFlow</span>
        </div>
        <nav className="mt-4 space-y-1 text-sm">
          <SideItem href="/dashboard">Dashboard</SideItem>
          <SideItem href="/communications">Communications</SideItem>
          <SideItem href="/orders" active>All Orders</SideItem>
          <SideItem href="/customers">Customers</SideItem>
          <SideItem href="/products">Products</SideItem>
          <SideItem href="/inventory">Inventory</SideItem>
          <SideItem href="/machines">Machines</SideItem>
          <SideItem href="/hrm">HRM</SideItem>
          <div className="px-3 py-2 text-black">Accountant</div>
          <div className="ml-2 pl-1 border-l border-gray-200 space-y-1">
            <SideItem href="/accountant/invoices">Invoices</SideItem>
            <SideItem href="/accountant/expenses">Expenses</SideItem>
            <SideItem href="/accountant/reports">Reports</SideItem>
          </div>
          <SideItem href="/design-queue">Design Queue</SideItem>
          <SideItem href="/production-line">Production Line</SideItem>
          <SideItem href="/machining-jobs">Machining Jobs</SideItem>
          <SideItem href="/inspection-queue">Inspection Queue</SideItem>
          <SideItem href="/users">User Management</SideItem>
        </nav>
        <div className="mt-auto flex items-center gap-3 px-2 py-3">
          <div className="h-9 w-9 rounded-full bg-gray-900 text-white flex items-center justify-center">N</div>
          <div className="text-sm">
            <div className="font-medium text-black">Nexus User</div>
            <div className="text-black">admin@swiftflow.com</div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-2xl font-semibold text-black">All Orders</h1>
              <p className="text-black text-sm">Oversee and manage all active and completed orders.</p>
            </div>
            <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-md">
              <span>＋</span> Create Order
            </button>
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1">
              <input
                value={query}
                onChange={(e)=>setQuery(e.target.value)}
                type="text"
                placeholder="Search by Order ID or Customer..."
                className="w-full border border-gray-200 rounded-md px-3 py-2 pl-9 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔎</span>
            </div>
            <select
              value={statusFilter}
              onChange={(e)=>setStatusFilter(e.target.value)}
              className="border border-gray-200 rounded-md px-2 py-2 text-sm text-black"
            >
              <option value="All">All</option>
              <option value="Inquiry">Inquiry</option>
              <option value="Design">Design</option>
              <option value="Production">Production</option>
              <option value="Machining">Machining</option>
              <option value="Inspection">Inspection</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <OrdersTable rows={filtered} />
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={()=>setShowModal(false)} />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-white rounded-lg shadow-xl border border-gray-200">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-black">Create New Order</h3>
                <button onClick={()=>setShowModal(false)} className="text-black">×</button>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-xs font-medium mb-1 text-black">Customer</label>
                  <select value={form.customer} onChange={(e)=>setForm(f=>({...f, customer:e.target.value}))} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black">
                    <option value="">Select Customer...</option>
                    <option value="Tyrell Corporation">Tyrell Corporation</option>
                    <option value="Acme Corp">Acme Corp</option>
                    <option value="Wayne Tech">Wayne Tech</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-black">Products</label>
                  <select value={form.products} onChange={(e)=>setForm(f=>({...f, products:e.target.value}))} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black">
                    <option value="">Select Products...</option>
                    <option value="Custom brackets">Custom brackets</option>
                    <option value="Titanium shafts">Titanium shafts</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-black">Or Enter Custom Product Details</label>
                  <textarea value={form.custom} onChange={(e)=>setForm(f=>({...f, custom:e.target.value}))} placeholder="For custom, one-off products, describe them here..." className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm min-h-[90px] text-black" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-1 text-black">Units</label>
                    <input value={form.units} onChange={(e)=>setForm(f=>({...f, units:e.target.value}))} type="number" placeholder="e.g. 500" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-black">Material</label>
                    <input value={form.material} onChange={(e)=>setForm(f=>({...f, material:e.target.value}))} type="text" placeholder="e.g. Stainless Steel 316" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-black">Assign to Department</label>
                  <select value={form.dept} onChange={(e)=>setForm(f=>({...f, dept:e.target.value}))} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black">
                    <option value="">Select initial department...</option>
                    <option value="Design">Design</option>
                    <option value="Production">Production</option>
                    <option value="Machining">Machining</option>
                    <option value="Inspection">Inspection</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-200">
                <button onClick={()=>setShowModal(false)} className="px-4 py-2 rounded-md border border-gray-300 text-black">Cancel</button>
                <button onClick={createOrder} className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white">Create Order</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function OrdersTable({ rows = [] }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left text-black">
            <th className="py-2 px-3">Order ID</th>
            <th className="py-2 px-3">Customer</th>
            <th className="py-2 px-3">Product(s)</th>
            <th className="py-2 px-3">Date Created</th>
            <th className="py-2 px-3">Status</th>
            <th className="py-2 px-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.id} className={i % 2 ? 'bg-gray-50' : ''}>
              <td className="py-2 px-3 font-medium text-indigo-600">
                <Link href={`/orders/${r.id}`} className="underline">{r.id}</Link>
              </td>
              <td className="py-2 px-3 text-black">{r.customer}</td>
              <td className="py-2 px-3 text-black">{r.products}</td>
              <td className="py-2 px-3 text-black">{r.date}</td>
              <td className="py-2 px-3">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-blue-50 text-blue-700 border border-blue-200">
                  {r.status}
                </span>
              </td>
              <td className="py-2 px-3">
                <Link href={`/orders/${r.id}`} className="text-black underline">View Details</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SideItem({ href = '#', active = false, children }) {
  const Comp = href ? Link : 'div';
  return (
    <Comp href={href} className={`block px-3 py-2 rounded-md ${active ? 'bg-gray-100 text-black font-medium' : 'text-black hover:bg-gray-50'}`}>
      {children}
    </Comp>
  );
}
