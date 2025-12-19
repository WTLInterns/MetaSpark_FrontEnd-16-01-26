'use client';

import { useState, useEffect } from 'react';
import { getAllCommunications, addCommunication, markAsRead } from './api';

const inboxMessages = [];

export default function CommunicationsPage() {
  const [activeTab, setActiveTab] = useState('inbox');
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [form, setForm] = useState({
    orderId: '',
    department: '',
    body: '',
    priority: 'Medium',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [inboxMessages, setInboxMessages] = useState([]);
  const [sentMessages, setSentMessages] = useState([]);

  const messages = activeTab === 'inbox' ? inboxMessages : sentMessages;

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
        id: `MSG${msg.id}`,
        from: msg.department,
        subject: msg.message.substring(0, 50) + (msg.message.length > 50 ? '...' : ''),
        preview: msg.message,
        priority: msg.priority || 'Medium',
        date: `${msg.date} at ${msg.time}`,
        status: msg.isRead === '1' ? 'Read' : 'Unread',
      }));
      setInboxMessages(formattedMessages.filter(msg => msg.status === 'Unread'));
      setSentMessages(formattedMessages.filter(msg => msg.status === 'Read'));
      setError('');
    } catch (err) {
      console.error('Error fetching communications:', err);
      setError('Failed to load communications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (msgId) => {
    try {
      setLoading(true);
      // Extract the numeric ID from MSG{id} format
      const numericId = msgId.replace('MSG', '');
      // Find the message to get its data
      const allMessages = [...inboxMessages, ...sentMessages];
      const message = allMessages.find(msg => msg.id === msgId);
      if (message) {
        await markAsRead(numericId, {
          department: message.from,
          message: message.preview,
          priority: message.priority
        });
        // Update the local state
        setInboxMessages(prev => prev.filter(msg => msg.id !== msgId));
        // Move the message to sent/read messages
        setSentMessages(prev => [...prev, { ...message, status: 'Read' }]);
      }
      setError('');
    } catch (err) {
      console.error('Error marking message as read:', err);
      setError('Failed to mark message as read');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!form.orderId || !form.department || !form.body.trim()) return;
    
    try {
      setLoading(true);
      
      const communicationData = {
        department: form.department,
        message: form.body.trim(),
        priority: form.priority
      };
      
      await addCommunication(communicationData);
      
      // Close modal and reset form
      setShowNewMessage(false);
      setForm({ orderId: '', department: '', body: '', priority: 'Medium' });
      
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
    <div className="w-full">
      <main className="w-full p-0">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Communications Center</h1>
            <p className="mt-1 text-sm text-gray-600">
              Send and receive messages between departments.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowNewMessage(true)}
            disabled={loading}
            className={`inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white shadow-sm w-full sm:w-auto ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
          >
            <span className="text-base">✉</span>
            <span>New Message</span>
          </button>
        </div>
                  
        {/* Loading and Error Messages */}
        {loading && (
          <div className="mb-4 text-center text-gray-600">Loading communications...</div>
        )}
        {error && (
          <div className="mb-4 text-center text-red-600 bg-red-50 p-2 rounded-md">{error}</div>
        )}

        <section className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="border-b border-gray-200 px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex gap-2 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => setActiveTab('inbox')}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border ${
                  activeTab === 'inbox'
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
              >
                Inbox ({inboxMessages.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('sent')}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border ${
                  activeTab === 'sent'
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
              >
                Sent
              </button>
            </div>
          </div>

          <div className="px-4 py-4 space-y-3">
            {messages.length === 0 && (
              <div className="py-10 text-center text-sm text-gray-500">
                No messages in this tab.
              </div>
            )}

            {messages.map((msg) => (
              <article
                key={msg.id}
                className="rounded-lg border border-gray-200 bg-slate-50 px-4 py-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 inline-block" />
                    <p className="text-sm font-semibold text-gray-900">
                      From: {msg.from}
                    </p>
                    <span className="ml-2 inline-flex items-center rounded-full bg-gray-900 px-2 py-0.5 text-[11px] font-medium text-white">
                      {msg.id}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-900 mb-0.5">
                    {msg.subject}
                  </p>
                  <p className="text-xs text-gray-500 mb-1">{msg.date}</p>
                  <p className="text-sm text-gray-600 line-clamp-2">{msg.preview}</p>
                </div>

                <div className="mt-3 md:mt-0 md:ml-4 flex flex-col items-end gap-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      msg.priority === 'Medium'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {msg.priority}
                  </span>
                  <button 
                    onClick={() => msg.status === 'Unread' ? handleMarkAsRead(msg.id) : null}
                    className="inline-flex items-center rounded-full border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
                    disabled={msg.status !== 'Unread'}
                  >
                    {msg.status === 'Unread' ? 'Mark as Read' : 'View'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        {showNewMessage && (
          <div className="fixed inset-0 z-50">
            <div
              className="absolute inset-0 bg-black/30 backdrop-blur-sm"
              onClick={() => setShowNewMessage(false)}
            />
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div className="w-full max-w-lg rounded-xl bg-white shadow-2xl border border-gray-200">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">New Department Message</h2>
                    <p className="mt-1 text-xs text-gray-500">
                      Create a report, comment, or raise an issue with another department.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowNewMessage(false)}
                    className="text-gray-400 hover:text-gray-600 text-lg"
                  >
                    ×
                  </button>
                </div>

                <div className="px-5 py-4 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Order ID</label>
                      <select
                        value={form.orderId}
                        onChange={(e) => setForm({ ...form, orderId: e.target.value })}
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="">Select Order...</option>
                        <option value="SF1003">SF1003</option>
                        <option value="SF1001">SF1001</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">To Department</label>
                      <select
                        value={form.department}
                        onChange={(e) => setForm({ ...form, department: e.target.value })}
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="">Select Department...</option>
                        <option value="DESIGN">Design</option>
                        <option value="PRODUCTION">Production</option>
                        <option value="MACHINING">Machining</option>
                        <option value="INSPECTION">Inspection</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Message / Report</label>
                    <textarea
                      rows={5}
                      value={form.body}
                      onChange={(e) => setForm({ ...form, body: e.target.value })}
                      placeholder="Write your report, comments, or issue details here..."
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Priority</label>
                    <select
                      value={form.priority}
                      onChange={(e) => setForm({ ...form, priority: e.target.value })}
                      className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-gray-200 bg-gray-50">
                  <button
                    type="button"
                    onClick={() => setShowNewMessage(false)}
                    disabled={loading}
                    className={`px-4 py-2 text-sm font-medium rounded-md ${loading ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'text-gray-700 border border-gray-300 bg-white hover:bg-gray-100'}`}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={!form.orderId || !form.department || !form.body || loading}
                    className={`px-4 py-2 text-sm font-medium text-white rounded-md ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'} disabled:opacity-60`}
                  >
                    {loading ? 'Sending...' : 'Send Message'}
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
