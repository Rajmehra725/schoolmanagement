'use client';

import { useEffect, useState } from 'react';
import { db } from '@/firebase/config';
import { collection, onSnapshot, Timestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';

interface Notification {
  id: string;
  message: string;
  type: 'info' | 'alert' | 'success';
  createdAt: Timestamp;
  read?: boolean;
  source: 'admin' | 'student';
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'info' | 'alert' | 'success'>('all');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'admin' | 'student'>('all');
  const [searchText, setSearchText] = useState('');
  const [sortAsc, setSortAsc] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'notifications'), snapshot => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<Notification, 'id'>),
      }));
      setNotifications(data);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    let data = [...notifications];

    if (sourceFilter !== 'all') {
      data = data.filter(n => n.source === sourceFilter);
    }

    if (filterType !== 'all') {
      data = data.filter(n => n.type === filterType);
    }

    if (searchText.trim()) {
      data = data.filter(n =>
        n.message.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    data.sort((a, b) =>
      sortAsc
        ? a.createdAt.seconds - b.createdAt.seconds
        : b.createdAt.seconds - a.createdAt.seconds
    );

    setFilteredNotifications(data);
  }, [notifications, filterType, sourceFilter, searchText, sortAsc]);

  const formatDate = (ts?: Timestamp) => {
    if (!ts) return 'No date';
    const d = new Date(ts.seconds * 1000);
    return d.toLocaleString();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Notification copied to clipboard!');
  };

  const isNew = (ts?: Timestamp) => {
    if (!ts) return false;
    const now = Date.now();
    return now - ts.seconds * 1000 < 24 * 60 * 60 * 1000;
  };

  if (loading) {
    return <div className="p-6 text-center animate-pulse">Loading notifications...</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold mb-6 animate-fade-in">🔔 Notifications</h1>

      <div className="flex flex-wrap gap-4 items-center mb-4">
        <select
          className="border p-2 rounded"
          value={sourceFilter}
          onChange={e => setSourceFilter(e.target.value as any)}
        >
          <option value="all">All Sources</option>
          <option value="admin">Admin</option>
          <option value="student">Student</option>
        </select>

        <select
          className="border p-2 rounded"
          value={filterType}
          onChange={e => setFilterType(e.target.value as any)}
        >
          <option value="all">All Types</option>
          <option value="info">Info</option>
          <option value="alert">Alert</option>
          <option value="success">Success</option>
        </select>

        <input
          type="text"
          className="border p-2 rounded flex-grow min-w-[200px]"
          placeholder="Search notifications"
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
        />

        <button
          className="bg-gray-200 hover:bg-gray-300 px-3 py-2 rounded"
          onClick={() => setSortAsc(!sortAsc)}
          title="Toggle sort order"
        >
          Sort: {sortAsc ? 'Oldest First' : 'Newest First'}
        </button>
      </div>

      {filteredNotifications.length === 0 ? (
        <p className="text-center text-gray-500">No notifications found.</p>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {filteredNotifications.map(n => (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className={`border-l-4 p-4 rounded shadow cursor-pointer select-none
                  ${
                    n.type === 'alert'
                      ? 'border-red-600 bg-red-50'
                      : n.type === 'success'
                      ? 'border-green-600 bg-green-50'
                      : 'border-blue-600 bg-blue-50'
                  }`
                }
                onClick={() => copyToClipboard(n.message)}
                title="Click to copy message"
              >
                <div className="flex justify-between items-center">
                  <p className="font-semibold text-lg">{n.message}</p>
                  {isNew(n.createdAt) && (
                    <span className="bg-yellow-300 text-yellow-900 px-2 py-0.5 text-xs rounded-full font-semibold">
                      NEW
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-600 mt-1">{formatDate(n.createdAt)}</p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
