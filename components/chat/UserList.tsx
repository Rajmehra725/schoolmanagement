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
  serverTimestamp,
  Timestamp,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db, auth } from '@/firebase/config';
import { motion } from 'framer-motion';
import NotificationBadge from './NotificationBadge';
import Image from 'next/image';
import { User } from '@/app/types';
import Avtar from './default-avatar.png';

interface UserListProps {
  activeUserId: string | null;
  onUserSelect: (user: User) => void;
}

interface UnreadInfo {
  count: number;
  lastMessage: string;
}

interface LastMessageInfo {
  [userId: string]: Timestamp | null;
}

export default function UserList({ activeUserId, onUserSelect }: UserListProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [unreadMap, setUnreadMap] = useState<Record<string, UnreadInfo>>({});
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [lastMessageMap, setLastMessageMap] = useState<LastMessageInfo>({});

  useEffect(() => {
    if (auth.currentUser?.uid) {
      setCurrentUserId(auth.currentUser.uid);
    } else if (typeof window !== 'undefined') {
      const storedId = localStorage.getItem('userId');
      if (storedId) setCurrentUserId(storedId);
    }
  }, []);

  // Online heartbeat (unchanged)
  useEffect(() => {
    if (!currentUserId) return;
    const userRef = doc(db, 'users', currentUserId);
    updateDoc(userRef, { online: true, lastSeen: serverTimestamp() });

    const interval = setInterval(() => {
      updateDoc(userRef, { lastSeen: serverTimestamp(), online: true });
    }, 30000);

    const handleBeforeUnload = () => {
      updateDoc(userRef, { online: false, lastSeen: serverTimestamp() });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(interval);
      updateDoc(userRef, { online: false, lastSeen: serverTimestamp() });
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [currentUserId]);

  // Fetch all users (unchanged)
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

  // Real-time unread message tracking (unchanged)
  useEffect(() => {
    if (!currentUserId) return;

    const messagesCollection = collection(db, 'messages'); // ✅ regular collection
    const unreadQuery = query(
      messagesCollection,
      where('to', '==', currentUserId),
      where('read', '==', false)
    );

    const unsubscribe = onSnapshot(unreadQuery, (snapshot) => {
      const unreadData: Record<string, UnreadInfo> = {};
      const latestTimestamp: Record<string, Timestamp | null | undefined> = {};

      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        const fromId = data.from;
        const text = data.text || '';
        const timestamp: Timestamp | undefined = data.timestamp;

        if (fromId) {
          if (!unreadData[fromId]) {
            unreadData[fromId] = { count: 0, lastMessage: '' };
            latestTimestamp[fromId] = null;
          }
          unreadData[fromId].count += 1;

          if (
            !latestTimestamp[fromId] ||
            (timestamp && timestamp.toMillis() > latestTimestamp[fromId]?.toMillis())
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

  // Fetch latest message timestamp per user for sorting
 // Fetch latest message timestamp per user for sorting
useEffect(() => {
  if (!currentUserId) return;

  const fetchLastMessages = async () => {
    const messagesCollection = collection(db, 'messages');

    try {
      const q = query(
        messagesCollection,
        where('chatParticipants', 'array-contains', currentUserId),
        orderBy('timestamp', 'desc'),
        limit(50)
      );

      const snapshot = await getDocs(q);
      const lastMessageByUser: LastMessageInfo = {};

      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        const participants: string[] = data.chatParticipants || [];
        if (!participants.includes(currentUserId)) return;
        const timestamp: Timestamp | undefined = data.timestamp;
        if (!timestamp) return;

        const otherUserId = participants.find((id) => id !== currentUserId);
        if (!otherUserId) return;

        if (
          !lastMessageByUser[otherUserId] ||
          timestamp.toMillis() > lastMessageByUser[otherUserId]!.toMillis()
        ) {
          lastMessageByUser[otherUserId] = timestamp;
        }
      });

      setLastMessageMap(lastMessageByUser);
    } catch (error: any) {
      if (error.code === 'failed-precondition') {
        console.warn(
          'Firestore index missing. Please create it here:',
          'https://console.firebase.google.com/v1/r/project/schoolmanagement-3340e/firestore/indexes?create_composite=Cldwcm9qZWN0cy9zY2hvb2xtYW5hZ2VtZW50LTMzNDBlL2RhdGFiYXNlcy8oZGVmYXVsdCkvY29sbGVjdGlvbkdyb3Vwcy9tZXNzYWdlcy9pbmRleGVzL18QARoUChBjaGF0UGFydGljaXBhbnRzGAEaDQoJdGltZXN0YW1wEAEaDAoIX19uYW1lX18QAQ'
        );
      } else {
        console.error('Error fetching last messages:', error);
      }
    }
  };

  fetchLastMessages();
}, [currentUserId, users]);


  // Mark messages as read (unchanged)
  const markMessagesAsRead = async (fromUserId: string) => {
    if (!currentUserId) return;

    const messagesRef = collection(db, 'messages');
    const q = query(
      messagesRef,
      where('from', '==', fromUserId),
      where('to', '==', currentUserId),
      where('read', '==', false)
    );

    const snapshot = await getDocs(q);
    const batch = writeBatch(db);
    snapshot.docs.forEach((docSnap) => {
      batch.update(docSnap.ref, { read: true });
    });
    await batch.commit();
  };

  const handleUserSelect = async (user: User) => {
    // Optimistic update
    setUnreadMap((prev) => {
      const updated = { ...prev };
      delete updated[user.id];
      return updated;
    });

    await markMessagesAsRead(user.id);
    onUserSelect(user);
  };

  const isRecent = (timestamp: Timestamp | null | undefined): boolean => {
    if (!timestamp) return false;
    try {
      const now = Date.now();
      const tsDate = timestamp.toDate();
      return now - tsDate.getTime() < 2 * 60 * 1000;
    } catch {
      return false;
    }
  };

  const userIsOnline = (user: User): boolean => {
    if (user.online) return true;
    if ('lastSeen' in user && isRecent((user as any).lastSeen)) return true;
    return false;
  };

  if (loadingUsers) {
    return (
      <div className="flex justify-center items-center h-32 text-gray-500">
        Loading users...
      </div>
    );
  }

  // Sort users: 
  // 1. By lastMessage timestamp descending (latest chat first)
  // 2. If no chat, show online users on top
  // 3. Then offline users
  const sortedUsers = users
    .filter((user) => user.id !== currentUserId)
    .sort((a, b) => {
      const aLast = lastMessageMap[a.id];
      const bLast = lastMessageMap[b.id];

      if (aLast && bLast) {
        return bLast.toMillis() - aLast.toMillis(); // latest first
      } else if (aLast && !bLast) {
        return -1;
      } else if (!aLast && bLast) {
        return 1;
      } else {
        // Both have no last message, sort by online status
        const aOnline = userIsOnline(a);
        const bOnline = userIsOnline(b);
        if (aOnline && !bOnline) return -1;
        if (!aOnline && bOnline) return 1;
        return 0;
      }
    });

  return (
    <div
      className="space-y-3 overflow-y-auto"
      style={{ maxHeight: 'calc(100vh - 100px)' }}
    >
      {sortedUsers.map((user) => {
        const nameToShow = user.name?.trim() || 'Student';
        const isOnline = userIsOnline(user);

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
            aria-label={`Chat with ${nameToShow}. ${unreadMap[user.id]?.count || 0} unread messages.`}
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
                className={`absolute bottom-1 right-1 block h-3 w-3 rounded-full border-2 border-white ${isOnline ? 'bg-green-500' : 'bg-gray-400'
                  }`}
                title={isOnline ? 'Online' : 'Offline'}
              />
            </div>
            <div className="flex flex-col flex-grow min-w-0">
              <p className="font-semibold text-gray-900 truncate">{nameToShow}</p>
              <p className={`text-xs ${isOnline ? 'text-green-600' : 'text-gray-400'}`}>
                {isOnline ? 'Online' : 'Offline'}
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
