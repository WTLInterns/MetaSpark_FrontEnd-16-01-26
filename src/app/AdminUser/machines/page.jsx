'use client';

import { useState, useEffect } from 'react';

const StatusBadge = ({ status }) => {
  const statusStyles = {
    Online: 'bg-green-100 text-green-800',
    Offline: 'bg-red-100 text-red-800',
    Maintenance: 'bg-yellow-100 text-yellow-800',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
      <span className={`w-2 h-2 rounded-full mr-2 ${status === 'Online' ? 'bg-green-500' : status === 'Offline' ? 'bg-red-500' : 'bg-yellow-500'}`}></span>
      {status}
    </span>
  );
};

export default function MachinesPage() {
  const [openMenu, setOpenMenu] = useState(null);
  const [showAddMachineModal, setShowAddMachineModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    status: 'Online',
    date: new Date().toISOString().split('T')[0]
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically make an API call to add the new machine
    console.log('New machine data:', formData);
    // For now, we'll just close the modal
    setShowAddMachineModal(false);
    // Reset form
    setFormData({
      name: '',
      status: 'Online',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const machines = [
    { id: 1, name: "3D Printer - Stratasys F900", status: "Offline", date: "Sep 30, 2025" },
    { id: 2, name: "CNC Lathe - Okuma LB3000", status: "Online", date: "Sep 30, 2025" },
    { id: 3, name: "CNC Mill - Haas VF-2", status: "Online", date: "Sep 30, 2025" },
    { id: 4, name: "Laser Cutter - Trumpf TruLaser 3030", status: "Maintenance", date: "Sep 30, 2025" },
    { id: 5, name: "Waterjet Cutter - Flow Mach 500", status: "Online", date: "Sep 30, 2025" }
  ];

  const toggleMenu = (id) => {
    setOpenMenu(openMenu === id ? null : id);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openMenu && !event.target.closest('.menu-container')) {
        setOpenMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenu]);

  return (
    <div className={`min-h-screen bg-gray-50 p-4 sm:p-6 ${showAddMachineModal ? 'overflow-hidden h-screen' : ''}`}>
      {/* Blur overlay */}
      {showAddMachineModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm z-40" onClick={() => setShowAddMachineModal(false)}></div>
      )}
      
      {/* Main content with conditional blur */}
      <div className={showAddMachineModal ? 'filter blur-sm pointer-events-none' : ''}>
        <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Machine Management</h1>
          <p className="text-gray-600 mt-1">View, manage, and add new machines to the workshop.</p>
        </div>
        <button 
          onClick={() => setShowAddMachineModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors mt-4 md:mt-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          <span>Add Machine</span>
        </button>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Machine Name
                </th>
                <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Added
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {machines.map((machine) => (
                <tr key={machine.id} className="hover:bg-gray-50">
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{machine.name}</div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={machine.status} />
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {machine.date}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                    <div className="menu-container">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleMenu(machine.id);
                        }}
                        className="text-gray-400 hover:text-gray-600 focus:outline-none p-1"
                        aria-label="Actions"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                        </svg>
                      </button>
                      
                      {openMenu === machine.id && (
                        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                          <div className="py-1" role="menu" aria-orientation="vertical">
                            <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">
                              <svg xmlns="http://www.w3.org/2000/svg" className="mr-3 h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                              </svg>
                              View Details
                            </button>
                            <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">
                              <svg xmlns="http://www.w3.org/2000/svg" className="mr-3 h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                              </svg>
                              Edit
                            </button>
                            <button className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100" role="menuitem">
                              <svg xmlns="http://www.w3.org/2000/svg" className="mr-3 h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3 mt-4">
        {machines.map((machine) => (
          <div key={`mobile-${machine.id}`} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-gray-900">{machine.name}</h3>
                <div className="mt-1">
                  <StatusBadge status={machine.status} />
                </div>
              </div>
              <div className="relative">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleMenu(`mobile-${machine.id}`);
                  }}
                  className="text-gray-400 hover:text-gray-600 p-1 -mr-2"
                  aria-label="Actions"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                  </svg>
                </button>
                
                {openMenu === `mobile-${machine.id}` && (
                  <div className="absolute right-0 mt-1 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                    <div className="py-1" role="menu" aria-orientation="vertical">
                      <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">
                        <svg xmlns="http://www.w3.org/2000/svg" className="mr-3 h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        View Details
                      </button>
                      <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">
                        <svg xmlns="http://www.w3.org/2000/svg" className="mr-3 h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                        Edit
                      </button>
                      <button className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100" role="menuitem">
                        <svg xmlns="http://www.w3.org/2000/svg" className="mr-3 h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              <div>Added: {machine.date}</div>
            </div>
          </div>
        ))}
      </div>
      </div>
      
      {/* Add Machine Modal */}
      {showAddMachineModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Add New Machine</h3>
                  <p className="text-sm text-gray-500 mt-1">Enter the details for the new machine</p>
                </div>
                <button 
                onClick={() => setShowAddMachineModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Machine Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Online">Online</option>
                  <option value="Offline">Offline</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddMachineModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Add Machine
                </button>
              </div>
            </form>
          </div>
            </div>
        // </div>
      )}
        </div>
      </div>
  );
}
