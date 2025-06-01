'use client';

import { useEffect, useState } from 'react';
import { db } from '@/firebase/config';
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  Timestamp,
} from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';

interface Notification {
  id: string;
  message: string;
  type: string;
  target: string;
  createdAt: any;
}

export default function NotificationsPage() {
  const [message, setMessage] = useState('');
  const [type, setType] = useState('info');
  const [target, setTarget] = useState('student');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [sending, setSending] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'notifications'), snapshot => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Notification[];
      setNotifications(
        data.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds)
      );
    });
    return () => unsub();
  }, []);

  const sendNotification = async () => {
    if (!message) return;
    setSending(true);
    await addDoc(collection(db, 'notifications'), {
      message,
      type,
      target,
      createdAt: Timestamp.now(),
    });
    setMessage('');
    setTimeout(() => setSending(false), 800);
  };

  const deleteNotification = async (id: string) => {
    await deleteDoc(doc(db, 'notifications', id));
    setDeleteId(null); // close modal
  };

  return (
    <motion.div
      className="p-6 max-w-4xl mx-auto space-y-6 relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <motion.h1
        className="text-3xl font-bold text-center"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        🔔 Notifications Panel
      </motion.h1>

      {/* Form */}
      <motion.div
        className="space-y-4 bg-white p-4 rounded-xl shadow-xl border"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        <input
          type="text"
          value={message}
          onChange={e => setMessage(e.target.value)}
          className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Enter notification message"
        />

        <div className="flex gap-4 flex-wrap items-center">
          <select
            value={type}
            onChange={e => setType(e.target.value)}
            className="border border-gray-300 p-2 rounded-md"
          >
            <option value="info">Info</option>
            <option value="alert">Alert</option>
            <option value="success">Success</option>
          </select>

          <select
            value={target}
            onChange={e => setTarget(e.target.value)}
            className="border border-gray-300 p-2 rounded-md"
          >
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
          </select>

          <motion.button
            whileTap={{ scale: 0.95 }}
            animate={{
              scale: sending ? [1, 1.1, 1] : 1,
              boxShadow: sending
                ? '0 0 10px rgba(59,130,246,0.5)'
                : '0 0 0 rgba(0,0,0,0)',
            }}
            transition={{ duration: 0.4 }}
            onClick={sendNotification}
            className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition"
          >
            ➕ Send Notification
          </motion.button>
        </div>
      </motion.div>

      {/* Notifications List */}
      <div className="space-y-4">
        <AnimatePresence>
          {notifications.map(n => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.4 }}
              whileHover={{
                scale: 1.02,
                boxShadow: '0 6px 15px rgba(0,0,0,0.1)',
              }}
              className={`border-l-4 p-4 rounded-xl shadow-md relative cursor-pointer transition-all ${
                n.type === 'alert'
                  ? 'border-red-600 bg-red-50'
                  : n.type === 'success'
                  ? 'border-green-600 bg-green-50'
                  : 'border-blue-600 bg-blue-50'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">{n.message}</p>
                  <p className="text-sm text-gray-600 italic mt-1">
                    🎯 For: <span className="capitalize">{n.target}</span>
                  </p>
                  <p className="text-xs text-gray-500">
                    🕒 {new Date(n.createdAt?.seconds * 1000).toLocaleString()}
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, color: '#DC2626' }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setDeleteId(n.id)}
                  className="text-red-500 hover:underline text-sm"
                >
                  🗑️ Delete
                </motion.button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white p-6 rounded-xl shadow-2xl text-center space-y-4"
            >
              <h2 className="text-xl font-semibold text-red-600">Are you sure?</h2>
              <p className="text-gray-700">This will permanently delete the notification.</p>
              <div className="flex justify-center gap-4 mt-4">
                <button
                  onClick={() => deleteNotification(deleteId)}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition"
                >
                  Yes, Delete
                </button>
                <button
                  onClick={() => setDeleteId(null)}
                  className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
