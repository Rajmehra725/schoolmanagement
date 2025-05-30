// app/admin/notifications/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { db } from '@/firebase/config'; // Adjust the import path as necessary
import {
  collection,
  addDoc,
  getDocs,
  Timestamp,
  onSnapshot,
  deleteDoc,
  doc,
} from 'firebase/firestore';

interface Notification {
  id: string;
  message: string;
  type: string;
  createdAt: any;
}

export default function NotificationsPage() {
  const [message, setMessage] = useState('');
  const [type, setType] = useState('info');
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'notifications'), snapshot => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Notification[];
      setNotifications(data.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds));
    });
    return () => unsub();
  }, []);

  const sendNotification = async () => {
    if (!message) return;
    await addDoc(collection(db, 'notifications'), {
      message,
      type,
      createdAt: Timestamp.now(),
    });
    setMessage('');
  };

  const deleteNotification = async (id: string) => {
    await deleteDoc(doc(db, 'notifications', id));
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">🔔 Notifications Panel</h1>

      <div className="space-y-2">
        <input
          type="text"
          value={message}
          onChange={e => setMessage(e.target.value)}
          className="w-full border p-2 rounded"
          placeholder="Enter notification message"
        />
        <select
          value={type}
          onChange={e => setType(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="info">Info</option>
          <option value="alert">Alert</option>
          <option value="success">Success</option>
        </select>
        <button
          onClick={sendNotification}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Send Notification
        </button>
      </div>

      <div className="space-y-4">
        {notifications.map(n => (
          <div
            key={n.id}
            className={`border-l-4 p-4 rounded shadow ${
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
                <p className="text-xs text-gray-500">
                  {new Date(n.createdAt?.seconds * 1000).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => deleteNotification(n.id)}
                className="text-red-600 hover:underline text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
