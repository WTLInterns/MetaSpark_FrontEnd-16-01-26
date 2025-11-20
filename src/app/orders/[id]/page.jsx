'use client';

import React, { useMemo, useRef, useState } from 'react';
import Link from 'next/link';

const STEPS = ['Inquiry', 'Design', 'Production', 'Machining', 'Inspection', 'Completed'];

const MOCK_ORDERS = {
  SF1005: {
    id: 'SF1005',
    customer: 'Tyrell Corporation',
    products: 'Voight-Kampff machine empathy sensors',
    status: 'Inquiry',
    date: 'Nov 20, 2025',
  },
};

export default function OrderDetailsPage({ params }) {
  const { id } = params || {};
  const base = MOCK_ORDERS[id] || {
    id,
    customer: 'Unknown Customer',
    products: '—',
    status: 'Inquiry',
    date: '—',
  };

  const [currentStatus, setCurrentStatus] = useState(base.status);
  const [notes, setNotes] = useState('');
  const [fileName, setFileName] = useState('');
  const [history, setHistory] = useState([]);
  const fileRef = useRef();

  const order = useMemo(() => ({ ...base, status: currentStatus }), [base, currentStatus]);

  const onFileChange = (e) => {
    const f = e.target.files?.[0];
    setFileName(f ? f.name : '');
  };

  const handleUpdate = () => {
    if (!currentStatus) return;
    const prev = history.length ? history[history.length - 1].to : base.status;
    const entry = {
      id: `${Date.now()}`,
      user: 'Admin User',
      from: prev,
      to: currentStatus,
      notes: notes?.trim(),
      attachment: fileName,
      at: new Date(),
    };
    setHistory((h) => [...h, entry]);
    setNotes('');
    setFileName('');
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar (match dashboard) */}
      <aside className="w-64 bg-white border-r border-gray-200 p-4 hidden md:flex flex-col">
        <div className="flex items-center gap-2 px-2 py-3">
          <div className="h-6 w-6 rounded-md bg-blue-600" />
          <span className="text-lg font-semibold text-blue-700">SwiftFlow</span>
        </div>
        <nav className="mt-4 space-y-1 text-sm">
          <SideItem href="/dashboard" active>Dashboard</SideItem>
          <SideItem>Communications</SideItem>
          <SideItem href="/orders">All Orders</SideItem>
          <SideItem>Customers</SideItem>
          <SideItem>Products</SideItem>
          <SideItem>Inventory</SideItem>
          <SideItem>Machines</SideItem>
          <SideItem>HRM</SideItem>
          <div className="px-3 py-2 text-black">Accountant</div>
          <div className="ml-2 pl-1 border-l border-gray-200 space-y-1">
            <SideItem>Payables</SideItem>
            <SideItem>Receivables</SideItem>
            <SideItem>Reports</SideItem>
          </div>
          <SideItem>Design Queue</SideItem>
          <SideItem>Production Line</SideItem>
          <SideItem>Machining Jobs</SideItem>
          <SideItem>Inspection Queue</SideItem>
          <SideItem>User Management</SideItem>
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
      <main className="flex-1 p-4 md:p-6">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="p-2 rounded-md border border-gray-200 hover:bg-gray-50">←</Link>
            <h1 className="text-xl md:text-2xl font-semibold text-black">Order #{order.id}</h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-full hover:bg-gray-100">🔔</button>
            <div className="h-8 w-8 rounded-full bg-gray-800" />
          </div>
        </div>

        {/* Progress header with stepper */}
        <section className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
          <p className="text-black text-sm mb-4">Track the progress of the order from inquiry to completion.</p>
          <div className="flex items-center justify-between overflow-x-auto px-2">
            {STEPS.map((step, i) => {
              const activeIndex = STEPS.indexOf(currentStatus);
              const completed = i < activeIndex;
              const active = i === activeIndex;
              return (
                <div key={step} className="flex-1 min-w-[140px] flex items-center">
                  <div className="flex flex-col items-center -mt-1">
                    <div className={`flex items-center justify-center h-9 w-9 rounded-full border-2 ${completed ? 'bg-blue-600 border-blue-600 text-white' : active ? 'border-blue-600 text-blue-600' : 'border-gray-300 text-gray-400'}`}>
                      {completed ? '✓' : '•'}
                    </div>
                    <div className={`text-xs mt-2 ${active ? 'text-black font-medium' : 'text-black'}`}>{step}</div>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`flex-1 h-1 mx-2 rounded ${i < activeIndex ? 'bg-blue-600' : 'bg-gray-200'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Project Details */}
            <section className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-black">Project Details</h3>
                <button className="text-black hover:text-black">✎</button>
              </div>
              <div className="text-sm text-black mb-3">View and edit the project specifications.</div>
              <div className="mb-4">
                <div className="text-xs text-black mb-1">Products</div>
                <div className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-black">{order.products}</div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t pt-4">
                <div>
                  <div className="text-xs text-black mb-1">Units</div>
                  <div className="text-black">20</div>
                </div>
                <div>
                  <div className="text-xs text-black mb-1">Material</div>
                  <div className="text-black">Bi-metallic film</div>
                </div>
                <div className="sm:col-span-2">
                  <div className="text-xs text-black mb-1">Customer</div>
                  <div className="text-black">{order.customer}</div>
                </div>
                <div className="sm:col-span-2">
                  <div className="text-xs text-black mb-1">Address</div>
                  <div className="text-black">Nexus Building, Los Angeles</div>
                </div>
              </div>
            </section>

            {/* Update Status */}
            <section className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-black mb-3">Update Order Status</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <select
                  className="border border-gray-200 rounded-md px-2 py-2 text-sm"
                  value={currentStatus}
                  onChange={(e) => setCurrentStatus(e.target.value)}
                >
                  <option>Select next status...</option>
                  {STEPS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <div>
                  <label className="text-xs text-black block mb-1">Attach Documents / Designs</label>
                  <input ref={fileRef} onChange={onFileChange} type="file" className="block w-full text-sm text-black" />
                </div>
                <div className="sm:col-span-2">
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add comments about the status change..."
                    className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm min-h-[90px] text-black"
                  />
                </div>
                <div className="sm:col-span-2">
                  <button onClick={handleUpdate} className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded-md">Update Status</button>
                </div>
              </div>
            </section>

            {/* Status History */}
            <section className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-black mb-2">Status History</h3>
              {history.length === 0 ? (
                <div className="border border-dashed border-gray-300 rounded-md p-8 text-center text-black">No History</div>
              ) : (
                <div className="space-y-4">
                  {history.map((h) => (
                    <div key={h.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gray-800" />
                          <div>
                            <div className="font-semibold text-black">{h.user}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="px-2 py-0.5 text-xs rounded-full bg-blue-50 text-blue-700 border border-blue-200">{h.from}</span>
                              <span className="text-black">→</span>
                              <span className="px-2 py-0.5 text-xs rounded-full bg-orange-50 text-orange-700 border border-orange-200">{h.to}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-black">{h.at.toLocaleString()}</div>
                      </div>
                      {h.notes && (
                        <p className="text-black mt-3 whitespace-pre-wrap">{h.notes}</p>
                      )}
                      {h.attachment && (
                        <div className="mt-3">
                          <div className="text-xs text-black mb-1">ATTACHMENTS</div>
                          <div className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-black text-xs border border-gray-200">{h.attachment}</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            <section className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-black">Assigned Team</h3>
                <button className="text-black hover:text-black">✎</button>
              </div>
              {['Design','Production','Machinists','Inspection'].map(team => (
                <div key={team} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center">?</div>
                    <div>
                      <div className="text-black">Unassigned</div>
                      <div className="text-xs text-black">{team}</div>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">✎</button>
                </div>
              ))}
            </section>

            <section className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-black mb-3">Reports</h3>
              {['Notes Summary','Design Report','Production Report','Machinists Report','Inspection Report'].map((r, i) => (
                <div key={r} className={`flex items-center justify-between px-3 py-2 rounded-md ${i===0 ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-gray-50'}`}>
                  <span className="text-black">{r}</span>
                  <button className="text-black hover:text-black">⬇</button>
                </div>
              ))}
            </section>
          </div>
        </div>
      </main>
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
