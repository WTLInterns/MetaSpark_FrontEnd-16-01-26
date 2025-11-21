

'use client'

import { useEffect, useState } from 'react';
import Sidebar from '@/app/AdminUser/components/Sidebar';

export default function ProductsPage() {
  const [showModal, setShowModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(null); // product code of open menu
  const [editingCode, setEditingCode] = useState(null);
  const [rows, setRows] = useState([
    { code: 'VK-ES', name: 'Voight-Kampff machine empathy sensors', status: 'Active', date: 'Oct 20, 2025' },
    { code: 'T800-EF-P1', name: 'T-800 endoskeleton fingers (prototype)', status: 'Active', date: 'Oct 18, 2025' },
    { code: 'GC-BAP', name: 'Graphene-composite body armor plates', status: 'Active', date: 'Oct 15, 2025' },
    { code: 'ARC-PI', name: 'Custom arc reactor casings', status: 'Active', date: 'Oct 12, 2025' },
    { code: 'HG-S316', name: 'High-precision gear shafts', status: 'Active', date: 'Oct 10, 2025' },
  ]);

  const [form, setForm] = useState({
    name: '',
    code: '',
  });

  useEffect(() => {
    const close = () => setMenuOpen(null);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  const saveProduct = () => {
    const options = { month: 'short', day: '2-digit', year: 'numeric' };
    const dateStr = new Date().toLocaleDateString('en-US', options);

    if (editingCode) {
      setRows(prev => prev.map(r => r.code === editingCode ? { ...r, name: form.name, code: form.code } : r));
    } else {
      const newRow = {
        code: form.code || `P-${Math.floor(Math.random()*9000+1000)}`,
        name: form.name || 'Untitled Product',
        status: 'Active',
        date: dateStr,
      };
      setRows(prev => [newRow, ...prev]);
    }

    setShowModal(false);
    setEditingCode(null);
    setForm({ name: '', code: '' });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />

      <main className="flex-1 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-black">Product Management</h1>
            <p className="text-sm text-black/70">View, manage, and add new products.</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-md"
          >
            <span>＋</span> Add Product
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-black">
                  <th className="py-3 px-4">Product Code</th>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date Added</th>
                  <th className="py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.code} className={i % 2 ? 'bg-gray-50' : ''}>
                    <td className="py-3 px-4 font-medium text-indigo-600">{r.code}</td>
                    <td className="py-3 px-4 text-black">{r.name}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-indigo-50 text-indigo-700 border border-indigo-200">Active</span>
                    </td>
                    <td className="py-3 px-4 text-black">{r.date}</td>
                    <td className="py-3 px-4 text-black relative" onClick={(e)=>e.stopPropagation()}>
                      <button
                        className="px-2 py-1 rounded hover:bg-gray-100"
                        onClick={(e)=>{ e.stopPropagation(); setMenuOpen(prev => prev === r.code ? null : r.code); }}
                        aria-haspopup="menu"
                        aria-expanded={menuOpen === r.code}
                      >
                        ⋯
                      </button>
                      {menuOpen === r.code && (
                        <div className="absolute right-2 mt-1 w-28 bg-white border border-gray-200 rounded-md shadow-md z-10" role="menu">
                          <button
                            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                            onClick={() => { setShowModal(true); setEditingCode(r.code); setForm({ name: r.name, code: r.code }); setMenuOpen(null); }}
                          >Edit</button>
                          <button
                            className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-gray-50"
                            onClick={() => { setRows(prev => prev.filter(x => x.code !== r.code)); setMenuOpen(null); }}
                          >Delete</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {showModal && (
          <div className="fixed inset-0 z-50">
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowModal(false)}
            />
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div className="w-full max-w-md bg-white rounded-lg shadow-xl border border-gray-200">
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <div>
                    <h3 className="text-lg font-semibold text-black">{editingCode ? 'Edit Product' : 'Add New Product'}</h3>
                    <p className="text-sm text-black/70">Enter the details for the new product.</p>
                  </div>
                  <button onClick={() => setShowModal(false)} className="text-black">×</button>
                </div>

                <div className="p-4 space-y-4">
                  <div>
                    <label className="block text-xs font-medium mb-1 text-black">Product Name</label>
                    <input value={form.name} onChange={(e)=>setForm(f=>({...f, name:e.target.value}))} type="text" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-black">Product Code</label>
                    <input value={form.code} onChange={(e)=>setForm(f=>({...f, code:e.target.value}))} type="text" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black" />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-200">
                  <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-md border border-gray-300 text-black">Cancel</button>
                  <button onClick={saveProduct} className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white">Save Product</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
