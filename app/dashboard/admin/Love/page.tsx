'use client';

import { useEffect, useState } from 'react';
import { db } from '@/firebase/config';
import {
  collection,
  onSnapshot,
  deleteDoc,
  doc,
  query,
  orderBy
} from 'firebase/firestore';

export default function AdminPage() {
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'loveMessages'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(data);
    });

    return () => unsub();
  }, []);

  const deleteMessage = async (id: string) => {
    await deleteDoc(doc(db, 'loveMessages', id));
  };

  return (
    <main className="min-h-screen bg-rose-50 p-8 text-rose-800 font-sans">
      <h1 className="text-4xl font-bold mb-6">💌 Love Messages Admin Panel</h1>
      {messages.length === 0 ? (
        <p>No messages yet...</p>
      ) : (
        <ul className="space-y-4">
          {messages.map((msg) => (
            <li
              key={msg.id}
              className="bg-white p-4 rounded shadow border-l-4 border-pink-500"
            >
              <div className="mb-2">📩 <span className="italic">{msg.message}</span></div>
              <div className="text-sm text-gray-500">
                ⏱ {msg.createdAt ? new Date(msg.createdAt).toLocaleString() : 'No time'}
              </div>
              <button
                onClick={() => deleteMessage(msg.id)}
                className="mt-2 text-sm text-red-600 hover:underline"
              >
                Delete ❌
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
