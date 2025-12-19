'use client';
import { useMemo, useState, useEffect } from 'react';
import { getAllCommunications, addCommunication, markAsRead } from './api';

export default function CommunicationsPage() {
  const [activeTab, setActiveTab] = useState('inbox'); // inbox | sent
  const [showModal, setShowModal] = useState(false);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [inbox, setInbox] = useState([]);
  const [sent, setSent] = useState([]);

  const [form, setForm] = useState({ dept: '', orderId: '', priority: 'Medium', body: '' });

  // Fetch communications when component mounts
  useEffect(() => {
    fetchCommunications();
  }, []);

  const fetchCommunications = async () => {
    try {
      setLoading(true);
      const data = await getAllCommunications();
      // Convert backend response to frontend format
      const formattedMessages = data.map(msg => ({
        id: `MSG-${msg.id}`,
        dept: msg.department,
        orderId: '', // Not provided in backend
        priority: msg.priority || 'Medium',
        read: msg.isRead === '1',
        timestamp: `${msg.date} at ${msg.time}`,
        body: msg.message
      }));
      setInbox(formattedMessages);
      setError('');
    } catch (err) {
      console.error('Error fetching communications:', err);
      setError('Failed to load communications');
    } finally {
      setLoading(false);
    }
  };

  const list = activeTab === 'inbox' ? inbox : sent;
  const filtered = useMemo(() => {
    return list.filter(item =>
      `${item.dept} ${item.orderId} ${item.body}`.toLowerCase().includes(query.toLowerCase())
    );
  }, [list, query]);

  const priorityPill = (p) => (
    p === 'High' ? 'bg-red-100 text-red-700' : p === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-700'
  );

  const handleMarkAsRead = async (id) => {
    try {
      setLoading(true);
      // Find the message to get its data
      const message = inbox.find(m => m.id === id);
      if (message) {
        await markAsRead(id, {
          department: message.dept,
          message: message.body,
          priority: message.priority
        });
        // Update the local state
        setInbox(prev => prev.map(m => m.id === id ? { ...m, read: true } : m));
      }
      setError('');
    } catch (err) {
      console.error('Error marking message as read:', err);
      setError('Failed to mark message as read');
    } finally {
      setLoading(false);
    }
  };

  const createMessage = async () => {
    if (!form.dept || !form.body.trim()) return;
    
    try {
      setLoading(true);
      
      const communicationData = {
        department: form.dept,
        message: form.body.trim(),
        priority: form.priority
      };
      
      await addCommunication(communicationData);
      
      // Reset form and close modal
      setShowModal(false);
      setForm({ dept: '', orderId: '', priority: 'Medium', body: '' });
      setActiveTab('inbox');
      
      // Refresh the communications list
      await fetchCommunications();
      setError('');
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-3 py-2 lg:p-6">
      <div className="bg-white border border-gray-200 rounded-xl p-3 lg:p-6">
        {/* Header */}
        <div className="flex flex-col space-y-3 lg:flex-row lg:items-start lg:justify-between lg:space-y-0 lg:gap-4">
          <div className="text-center lg:text-left">
            <h1 className="text-xl lg:text-3xl font-bold text-gray-900">Communications Center</h1>
            <p className="text-sm text-gray-600 mt-1">Send and receive messages between departments.</p>
          </div>
          <button 
            onClick={() => setShowModal(true)} 
            disabled={loading}
            className={`w-full lg:w-auto inline-flex items-center justify-center gap-2 text-sm font-medium px-4 py-2 rounded-md ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
          >
            <span>＋</span> New Message
          </button>
        </div>
                
        {/* Loading and Error Messages */}
        {loading && (
          <div className="mt-4 text-center text-gray-600">Loading communications...</div>
        )}
        {error && (
          <div className="mt-4 text-center text-red-600 bg-red-50 p-2 rounded-md">{error}</div>
        )}

        {/* Tabs + Search */}
        <div className="mt-4 lg:mt-5 space-y-3 lg:space-y-0 lg:flex lg:items-center lg:gap-3">
          <div className="flex rounded-lg border border-gray-200 bg-gray-50 p-1 w-full">
            <button onClick={() => setActiveTab('inbox')} className={`flex-1 px-3 py-2 text-xs lg:text-sm lg:px-4 rounded-md ${activeTab==='inbox' ? 'bg-white shadow text-gray-900' : 'text-gray-600'}`}>Inbox ({inbox.length})</button>
            <button onClick={() => setActiveTab('sent')} className={`flex-1 px-3 py-2 text-xs lg:text-sm lg:px-4 rounded-md ${activeTab==='sent' ? 'bg-white shadow text-gray-900' : 'text-gray-600'}`}>Sent ({sent.length})</button>
          </div>
          <div className="w-full lg:flex-1 lg:min-w-[220px]">
            <input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search messages..." className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        {/* Message Cards */}
        <div className="mt-4 lg:mt-5 space-y-3 lg:space-y-4">
          {filtered.map(item => (
            <div key={item.id} className="rounded-lg border border-gray-200 bg-indigo-50/40">
              <div className="p-3 lg:p-4">
                {/* Message Header */}
                <div className="flex flex-col space-y-2 lg:flex-row lg:items-start lg:justify-between lg:space-y-0 lg:gap-3">
                  {/* Left Section - Department & Order */}
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`inline-block h-2.5 w-2.5 rounded-full flex-shrink-0 ${item.read ? 'bg-gray-300' : 'bg-red-500'}`} />
                      <p className="text-sm font-semibold text-gray-900 truncate">From: {item.dept}</p>
                    </div>
                    {item.orderId && (
                      <span className="text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded px-2 py-0.5 inline-block self-start">
                        #{item.orderId}
                      </span>
                    )}
                  </div>
                  
                  {/* Right Section - Priority & Actions */}
                  <div className="flex flex-col items-end space-y-2 lg:flex-row lg:items-center lg:space-y-0 lg:space-x-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${priorityPill(item.priority)}`}>
                      {item.priority}
                    </span>
                    {activeTab==='inbox' && !item.read && (
                      <button onClick={() => handleMarkAsRead(item.id)} className="text-xs font-medium px-3 py-1 rounded-md border border-gray-300 bg-white hover:bg-gray-50 whitespace-nowrap">
                        Mark as Read
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Message Content */}
                <div className="mt-2 lg:mt-3">
                  <p className="text-xs text-gray-500 mb-2">{item.timestamp}</p>
                  <p className="text-sm text-gray-800 break-words leading-relaxed">{item.body}</p>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center text-sm text-gray-500 py-8 lg:py-10">No messages found.</div>
          )}
        </div>
      </div>

        {/* New Message Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowModal(false)} />
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div className="w-full max-w-lg bg-white rounded-lg border border-gray-200 shadow max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between p-3 lg:p-4 border-b border-gray-200">
                  <h3 className="text-base lg:text-lg font-semibold text-gray-900">New Message</h3>
                  <button className="text-gray-400 hover:text-gray-600 text-lg lg:text-xl" onClick={() => setShowModal(false)}>✕</button>
                </div>
                <div className="p-4 lg:p-5 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                    <select value={form.dept} onChange={(e)=>setForm(f=>({...f, dept:e.target.value}))} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Select department...</option>
                      <option value="DESIGN">Design</option>
                      <option value="MACHINING">Machining</option>
                      <option value="PRODUCTION">Production</option>
                      <option value="INSPECTION">Inspection</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Related Order (optional)</label>
                    <input value={form.orderId} onChange={(e)=>setForm(f=>({...f, orderId:e.target.value}))} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. SF1002" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                      <select value={form.priority} onChange={(e)=>setForm(f=>({...f, priority:e.target.value}))} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option>Low</option>
                        <option>Medium</option>
                        <option>High</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                    <textarea value={form.body} onChange={(e)=>setForm(f=>({...f, body:e.target.value}))} rows={4} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="Type your message..." />
                  </div>
                </div>
                <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200">
                  <button 
                    type="button" 
                    onClick={()=>setShowModal(false)} 
                    disabled={loading}
                    className={`px-4 py-2 text-sm rounded-md ${loading ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'border border-gray-300 hover:bg-gray-50'}`}
                  >
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    onClick={createMessage} 
                    disabled={loading}
                    className={`px-4 py-2 text-sm rounded-md ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                  >
                    {loading ? 'Sending...' : 'Send Message'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

  );
}
