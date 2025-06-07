'use client';

import { useEffect, useState } from 'react';
import {
  collection,
  onSnapshot,
  query,
  where,
  doc,
  updateDoc,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import { db, auth } from '@/firebase/config';
import { motion } from 'framer-motion';
import NotificationBadge from './NotificationBadge';
import Image from 'next/image';
import { User } from '@/app/types';
import Avtar from "./default-avatar.png"
interface UserListProps {
  activeUserId: string | null;
  onUserSelect: (user: User) => void;
}
interface UnreadInfo {
  count: number;
  lastMessage: string;
}


export default function UserList({ activeUserId, onUserSelect }: UserListProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [unreadMap, setUnreadMap] = useState<Record<string, UnreadInfo>>({});
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    if (auth.currentUser?.uid) {
      setCurrentUserId(auth.currentUser.uid);
    } else if (typeof window !== 'undefined') {
      const storedId = localStorage.getItem('userId');
      if (storedId) setCurrentUserId(storedId);
    }
  }, []);

  // Handle online/offline status
  useEffect(() => {
    if (!currentUserId) return;
    const userRef = doc(db, 'users', currentUserId);
    updateDoc(userRef, { online: true });
    const handleBeforeUnload = () => updateDoc(userRef, { online: false });
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      updateDoc(userRef, { online: false });
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [currentUserId]);

  // Fetch all users
  useEffect(() => {
    const usersCollection = collection(db, 'users');
    setLoadingUsers(true);
    const unsubscribe = onSnapshot(usersCollection, (snapshot) => {
      const loadedUsers: User[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<User, 'id'>),
      }));
      setUsers(loadedUsers);
      setLoadingUsers(false);
    });
    return () => unsubscribe();
  }, []);

  // Track unread messages from each user (real-time)

  useEffect(() => {
    if (!currentUserId) return;

    const messagesCollection = collection(db, 'messages');
    const unreadQuery = query(
      messagesCollection,
      where('to', '==', currentUserId),
      where('read', '==', false)
    );

    const unsubscribe = onSnapshot(unreadQuery, (snapshot) => {
      const unreadData: Record<string, UnreadInfo> = {};
      const latestTimestamp: Record<string, any> = {};

      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        const fromId = data.from;
        const text = data.text || '';
        const timestamp = data.timestamp;

        if (fromId) {
          if (!unreadData[fromId]) {
            unreadData[fromId] = { count: 0, lastMessage: '' };
            latestTimestamp[fromId] = null;
          }
          unreadData[fromId].count += 1;

          if (
            !latestTimestamp[fromId] ||
            (timestamp && timestamp.toMillis() > latestTimestamp[fromId].toMillis())
          ) {
            latestTimestamp[fromId] = timestamp;
            unreadData[fromId].lastMessage = text;
          }
        }
      });

      setUnreadMap(unreadData);
    });

    return () => unsubscribe();
  }, [currentUserId]);

  // Mark messages as read from a specific user
  const markMessagesAsRead = async (fromUserId: string) => {
    if (!currentUserId) return;

    const messagesRef = collection(db, 'messages');
    const q = query(
      messagesRef,
      where('chatParticipants', 'array-contains', currentUserId),
      where('uid', '==', fromUserId),
      where('seen', '==', false)
    );

    const snapshot = await getDocs(q);
    const batch = writeBatch(db);
    snapshot.docs.forEach((docSnap) => {
      batch.update(docSnap.ref, { seen: true });
    });
    await batch.commit();
  };

  const handleUserSelect = async (user: User) => {
    await markMessagesAsRead(user.id);
    onUserSelect(user);
  };

  if (loadingUsers) {
    return (
      <div className="flex justify-center items-center h-32 text-gray-500">
        Loading users...
      </div>
    );
  }

  return (
    <div
      className="space-y-3 overflow-y-auto"
      style={{
        maxHeight: 'calc(100vh - 100px)',
      }}
    >
      {users
        .filter((user) => user.id !== currentUserId)
        .sort((a, b) => (b.online ? 1 : 0) - (a.online ? 1 : 0))
        .map((user) => {
          const nameToShow = user.name?.trim() || 'Student';
          return (
            <motion.button
              key={user.id}
              onClick={() => handleUserSelect(user)}
              className={`w-full flex items-center gap-4 p-3 rounded-lg transition-colors 
                focus:outline-none focus:ring-2 focus:ring-indigo-500
                ${user.id === activeUserId ? 'bg-indigo-100 shadow-md' : 'hover:bg-indigo-50'}
              `}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              aria-pressed={user.id === activeUserId}
              aria-label={`Chat with ${nameToShow}. ${unreadMap[user.id] || 0} unread messages.`}
            >
              <div className="relative flex-shrink-0 h-12 w-12 rounded-full overflow-hidden border-2 border-indigo-300">
                <Image
                  src={user.photoURL || Avtar}
                  alt={`Profile picture of ${nameToShow}`}
                  fill
                  sizes="48px"
                  className="object-cover"
                />
                <span
                  className={`absolute bottom-1 right-1 block h-3 w-3 rounded-full border-2 border-white ${user.online ? 'bg-green-500' : 'bg-gray-400'
                    }`}
                  title={user.online ? 'Online' : 'Offline'}
                />
              </div>
              <div className="flex flex-col flex-grow min-w-0">
                <p className="font-semibold text-gray-900 truncate">{nameToShow}</p>
                <p className={`text-xs ${user.online ? 'text-green-600' : 'text-gray-400'}`}>
                  {user.online ? 'Online' : 'Offline'}
                </p>
              </div>
              {unreadMap[user.id]?.count > 0 && (
                <NotificationBadge
                  count={unreadMap[user.id].count}
                  lastMessage={unreadMap[user.id].lastMessage}
                />
              )}

            </motion.button>
          );
        })}
    </div>
  );
}
