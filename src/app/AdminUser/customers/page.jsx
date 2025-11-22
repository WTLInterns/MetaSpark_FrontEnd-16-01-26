'use client'

import { useState, useEffect } from 'react';
import Sidebar from '@/app/AdminUser/components/Sidebar';

export default function CustomersPage() {
  const [showModal, setShowModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [customers, setCustomers] = useState([
    { 
      id: 'CUST-001', 
      customerName: 'John Doe',
      companyName: 'ABC Corp',
      email: 'john@example.com',
      customerNumber: 'CUST-001',
      gstNumber: '22AAAAA0000A1Z5',
      phoneNumber: '+1 (555) 123-4567',
      primaryAddress: '123 Main St, New York, NY',
      useAsBilling: true,
      useAsShipping: true,
      status: 'Active',
      date: 'Oct 20, 2025',
    },
  ]);

  const [form, setForm] = useState({
    customerName: '',
    companyName: '',
    email: '',
    customerNumber: `CUST-${Math.floor(100 + Math.random() * 900)}`,
    gstNumber: '',
    phoneNumber: '',
    primaryAddress: '',
    useAsBilling: true,
    useAsShipping: true,
  });

  useEffect(() => {
    const close = () => setMenuOpen(null);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  const saveCustomer = () => {
    const options = { month: 'short', day: '2-digit', year: 'numeric' };
    const dateStr = new Date().toLocaleDateString('en-US', options);

    if (editingId) {
      setCustomers(prev => prev.map(c => 
        c.id === editingId ? { 
          ...form, 
          id: editingId, 
          date: c.date,
          status: 'Active'
        } : c
      ));
    } else {
      const newCustomer = {
        id: form.customerNumber,
        ...form,
        date: dateStr,
        status: 'Active'
      };
      setCustomers(prev => [newCustomer, ...prev]);
    }

    setShowModal(false);
    setEditingId(null);
    setForm({
      customerName: '',
      companyName: '',
      email: '',
      customerNumber: `CUST-${Math.floor(100 + Math.random() * 900)}`,
      gstNumber: '',
      phoneNumber: '',
      primaryAddress: '',
      useAsBilling: true,
      useAsShipping: true,
    });
  };
  const handleEdit = (customer) => {
    setForm({
      customerName: customer.customerName,
      companyName: customer.companyName || '',
      email: customer.email,
      customerNumber: customer.id,
      gstNumber: customer.gstNumber || '',
      phoneNumber: customer.phoneNumber || '',
      primaryAddress: customer.primaryAddress || '',
      useAsBilling: customer.useAsBilling !== false,
      useAsShipping: customer.useAsShipping !== false,
    });
    setEditingId(customer.id);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this customer?')) {
      setCustomers(prev => prev.filter(c => c.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 overflow-x-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-black">Customer Management</h1>
            <p className="text-xs sm:text-sm text-black/70">View, manage, and add new customers.</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-md w-full sm:w-auto"
          >
            <span>＋</span> Add Customer
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            {/* Desktop Table */}
            <div className="hidden md:block">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-black bg-gray-50">
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer ID</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Company</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell">Phone</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell">GST No</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Date Added</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer, i) => (
                    <tr key={customer.id} className={i % 2 ? 'bg-gray-50' : ''}>
                      <td className="py-3 px-4 text-indigo-600 font-medium">{customer.id}</td>
                      <td className="py-3 px-4 text-black font-medium">{customer.customerName}</td>
                      <td className="py-3 px-4 text-black hidden lg:table-cell">{customer.companyName || '-'}</td>
                      <td className="py-3 px-4 text-black hidden xl:table-cell">{customer.phoneNumber || '-'}</td>
                      <td className="py-3 px-4 text-black hidden xl:table-cell">{customer.gstNumber || '-'}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${customer.status === 'Active' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-700 border border-gray-200'}`}>
                          {customer.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-black hidden lg:table-cell whitespace-nowrap">{customer.date}</td>
                      <td className="py-3 px-4 text-black relative">
                      <div className="relative">
                        <button
                          className="px-2 py-1 rounded hover:bg-gray-100 text-sm md:text-base"
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            setMenuOpen(prev => prev === customer.id ? null : customer.id);
                          }}
                          aria-haspopup="true"
                          aria-expanded={menuOpen === customer.id}
                          aria-label="Actions"
                        >
                          <span className="md:hidden">⋮</span>
                          <span className="hidden md:inline">Actions</span>
                        </button>
                        {menuOpen === customer.id && (
                          <div 
                            className="absolute right-0 mt-1 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-10"
                            style={{ top: '100%' }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                              onClick={(e) => { 
                                e.stopPropagation();
                                handleEdit(customer); 
                                setMenuOpen(null); 
                              }}
                            >
                              <span>✏️</span> Edit
                            </button>
                            <button
                              type="button"
                              className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2"
                              onClick={(e) => { 
                                e.stopPropagation();
                                handleDelete(customer.id); 
                                setMenuOpen(null); 
                              }}
                            >
                              <span>🗑️</span> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                </tbody>
              </table>
            </div>
            
            {/* Mobile List View */}
            <div className="md:hidden mt-4 space-y-3 p-4">
              {customers.map((customer) => (
                <div key={customer.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-black">{customer.customerName}</h3>
                      <p className="text-sm text-indigo-600">{customer.id}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${customer.status === 'Active' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-700 border border-gray-200'}`}>
                      {customer.status}
                    </span>
                  </div>
                  
                  <div className="mt-2 text-sm text-gray-600 space-y-1">
                    {customer.companyName && <p>Company: {customer.companyName}</p>}
                    {customer.phoneNumber && <p>Phone: {customer.phoneNumber}</p>}
                    <p className="text-xs text-gray-500">Added: {customer.date}</p>
                  </div>
                  
                  <div className="mt-3 flex justify-end space-x-2">
                    <button
                      onClick={() => handleEdit(customer)}
                      className="text-sm px-3 py-1 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(customer.id)}
                      className="text-sm px-3 py-1 bg-red-50 text-red-600 rounded-md hover:bg-red-100"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {showModal && (
          <div className="fixed inset-0 z-50">
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => { setShowModal(false); setEditingId(null); setForm({ name: '', email: '', phone: '', address: '', status: 'Active' }); }}
            />
            <div className="absolute inset-0 flex items-start md:items-center justify-center p-2 sm:p-4 overflow-y-auto">
              <div className="w-full max-w-2xl bg-white rounded-lg shadow-xl border border-gray-200 my-4">
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <div>
                    <h3 className="text-lg font-semibold text-black">{editingId ? 'Edit Customer' : 'Add New Customer'}</h3>
                    <p className="text-sm text-black/70">Enter the customer details below.</p>
                  </div>
                  <button 
                    onClick={() => { setShowModal(false); setEditingId(null); setForm({ name: '', email: '', phone: '', address: '', status: 'Active' }); }} 
                    className="text-black hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>

                <div className="p-4 sm:p-6 space-y-4 overflow-y-auto max-h-[calc(100vh-200px)]">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-black">Customer Name <span className="text-red-500">*</span></label>
                      <input 
                        type="text" 
                        value={form.customerName}
                        onChange={(e) => setForm({...form, customerName: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black"
                        placeholder="Enter customer name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-black">Company Name</label>
                      <input 
                        type="text" 
                        value={form.companyName}
                        onChange={(e) => setForm({...form, companyName: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black"
                        placeholder="Enter company name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-black">Email Address</label>
                      <input 
                        type="email" 
                        value={form.email}
                        onChange={(e) => setForm({...form, email: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black"
                        placeholder="Enter email address"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-black">Customer Number</label>
                      <input 
                        type="text" 
                        value={form.customerNumber}
                        onChange={(e) => setForm({...form, customerNumber: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black"
                        placeholder="Enter customer number"
                        readOnly={!!editingId}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-black">GST Number</label>
                      <input 
                        type="text" 
                        value={form.gstNumber}
                        onChange={(e) => setForm({...form, gstNumber: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black"
                        placeholder="Enter GST number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-black">Phone Number</label>
                      <input 
                        type="tel" 
                        value={form.phoneNumber}
                        onChange={(e) => setForm({...form, phoneNumber: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black"
                        placeholder="Enter phone number"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-1 text-black">Primary Address</label>
                      <textarea
                        value={form.primaryAddress}
                        onChange={(e) => setForm({...form, primaryAddress: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black"
                        placeholder="Enter primary address"
                        rows="3"
                      />
                    </div>
                    <div className="md:col-span-2 flex space-x-4">
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          checked={form.useAsBilling}
                          onChange={(e) => setForm({...form, useAsBilling: e.target.checked})}
                          className="form-checkbox h-4 w-4 text-indigo-600"
                        />
                        <span className="ml-2 text-sm text-gray-700">Use as Billing Address</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          checked={form.useAsShipping}
                          onChange={(e) => setForm({...form, useAsShipping: e.target.checked})}
                          className="form-checkbox h-4 w-4 text-indigo-600"
                        />
                        <span className="ml-2 text-sm text-gray-700">Use as Shipping Address</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4 border-t border-gray-200">
                  <button 
                    type="button"
                    onClick={() => { setShowModal(false); setEditingId(null); setForm({ name: '', email: '', phone: '', address: '', status: 'Active' }); }}
                    className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button 
                    type="button"
                    onClick={saveCustomer}
                    className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
                  >
                    {editingId ? 'Update' : 'Save'} Customer
                  </button>
                </div>
              </div>
            </div>
          </div>
          
        )}
      </main>
    </div>
  );
}
