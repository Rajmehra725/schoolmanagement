'use client';

import { useEffect, useState } from 'react';
import { collection, doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';

interface ChatListProps {
  onSelectUser: (user: any) => void;
  currentUserId: string;
}

interface ChatSummary {
  id: string;
  name: string;
  photoURL?: string;
  lastMessage: string;
  timestamp?: any;
  unread?: boolean;
}

export default function ChatList({ onSelectUser, currentUserId }: ChatListProps) {
  const [chatSummaries, setChatSummaries] = useState<ChatSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const summaryRef = collection(db, 'chatSummaries', currentUserId, 'threads');

    const unsub = onSnapshot(summaryRef, async (snapshot) => {
      const summaries: ChatSummary[] = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const userId = docSnap.id;
          const data = docSnap.data();
          const userRef = doc(db, 'users', userId);
          const userDoc = await getDoc(userRef);
          return {
            id: userId,
            name: userDoc.exists() ? userDoc.data().name : 'Unknown User',
            photoURL: userDoc.exists() ? userDoc.data().photoURL : '',
            lastMessage: data.lastMessage || '',
            timestamp: data.timestamp,
            unread: data.unread,
          };
        })
      );

      setChatSummaries(
        summaries.sort(
          (a, b) => b.timestamp?.toMillis?.() - a.timestamp?.toMillis?.()
        )
      );
      setLoading(false);
    });

    return () => unsub();
  }, [currentUserId]);

  return (
    <div className="p-4 space-y-2 bg-white h-screen overflow-y-auto border-r">
      <h2 className="text-xl font-bold text-blue-600 mb-4">Chats</h2>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 bg-gray-100 animate-pulse rounded" />
          ))}
        </div>
      ) : (
        <AnimatePresence>
          {chatSummaries.map((chat) => (
            <motion.div
              key={chat.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectUser({ id: chat.id, name: chat.name, photoURL: chat.photoURL })}
              className={`flex items-center p-3 rounded-lg cursor-pointer transition border gap-3 ${
                chat.unread ? 'bg-yellow-50 font-semibold border-yellow-300' : 'hover:bg-gray-100 border-transparent'
              }`}
            >
              <Image
                src={chat.photoURL || '/default-profile.png'}
                alt={chat.name}
                width={40}
                height={40}
                className="rounded-full object-cover"
              />
              <div className="flex flex-col w-full">
                <div className="flex justify-between items-center">
                  <span className="text-md truncate">{chat.name}</span>
                  <span className="text-xs text-gray-400">
                    {chat.timestamp?.toDate
                      ? new Date(chat.timestamp.toDate()).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : ''}
                  </span>
                </div>
                <div className="text-xs text-gray-600 truncate">
                  {chat.lastMessage}
                </div>
              </div>
              {chat.unread && (
                <div className="ml-2 w-2 h-2 rounded-full bg-red-500" title="Unread message" />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      )}
    </div>
  );
}
