'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db, auth } from '@/firebase/config';
import { motion } from 'framer-motion';
import NotificationBadge from './NotificationBadge';
import Image from 'next/image';
import { User } from '@/app/types'; // adjust path as needed

interface UserListProps {
  activeUserId: string | null;
  onUserSelect: (user: User) => void;
}

export default function UserList({ activeUserId, onUserSelect }: UserListProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [unreadMap, setUnreadMap] = useState<Record<string, number>>({});
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingUnread, setLoadingUnread] = useState(true);

  // Get currentUserId from auth or localStorage fallback
  useEffect(() => {
    if (auth.currentUser?.uid) {
      setCurrentUserId(auth.currentUser.uid);
    } else if (typeof window !== 'undefined') {
      const storedId = localStorage.getItem('userId');
      if (storedId) setCurrentUserId(storedId);
    }
  }, []);

  // Subscribe to realtime users list
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

  // Subscribe to unread messages count for current user grouped by sender
  useEffect(() => {
    if (!currentUserId) return;

    setLoadingUnread(true);

    const messagesCollection = collection(db, 'messages');

    // Query unread messages where currentUser is participant and not sender, and read==false
    // Adjust according to your DB schema; here assuming 'to' is recipient id
    const unreadQuery = query(
      messagesCollection,
      where('to', '==', currentUserId),
      where('read', '==', false)
    );

    const unsubscribe = onSnapshot(unreadQuery, (snapshot) => {
      const counts: Record<string, number> = {};
      snapshot.docs.forEach((doc) => {
        const data = doc.data() as { from?: string };
        if (data.from) {
          counts[data.from] = (counts[data.from] || 0) + 1;
        }
      });
      setUnreadMap(counts);
      setLoadingUnread(false);
    });

    return () => unsubscribe();
  }, [currentUserId]);

  // Utility to validate photoURL
  const getValidSrc = useCallback((url?: string | null) => {
    return url && url.trim() !== '' ? url : null;
  }, []);

  // Debounce user click to prevent multiple quick triggers
  const [clickDisabled, setClickDisabled] = useState(false);
  const handleUserSelect = useCallback(
    (user: User) => {
      if (clickDisabled) return;
      setClickDisabled(true);
      onUserSelect(user);
      setTimeout(() => setClickDisabled(false), 300);
    },
    [clickDisabled, onUserSelect]
  );

  // Memoize users list render for perf
  const renderedUsers = useMemo(() => {
    if (loadingUsers) return <p>Loading users...</p>;
    if (users.length === 0) return <p>No users found.</p>;

    return users
      .filter((user) => user.id !== currentUserId)
      .map((user) => {
        const isActive = activeUserId === user.id;
        const unreadCount = unreadMap[user.id] || 0;
        const photoURL = getValidSrc(user.photoURL);

        return (
          <motion.li
            key={user.id}
            onClick={() => handleUserSelect(user)}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className={`cursor-pointer rounded-lg p-2 mb-2 flex items-center gap-3 
              ${isActive ? 'bg-indigo-800 shadow-md' : 'hover:bg-indigo-900'}`}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleUserSelect(user);
              }
            }}
            aria-pressed={isActive}
            aria-label={`Chat with ${user.name}, ${unreadCount} unread messages`}
          >
            {photoURL ? (
              <Image
                src={photoURL}
                alt={user.name}
                width={32}
                height={32}
                className="rounded-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="h-8 w-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-sm">
                {(user.name?.[0] ?? '?').toUpperCase()}
              </div>
            )}

            <div className="flex-1 truncate">
              <span className="font-medium">{user.name}</span>
              <div className="text-xs text-gray-300 select-none">
                {user.online ? '🟢 Online' : '⚫ Offline'}
              </div>
            </div>

            {/* Unread messages badge */}
            {loadingUnread ? (
              <div className="text-xs text-gray-400">...</div>
            ) : (
              unreadCount > 0 && <NotificationBadge count={unreadCount} />
            )}
          </motion.li>
        );
      });
  }, [
    users,
    currentUserId,
    activeUserId,
    unreadMap,
    loadingUsers,
    loadingUnread,
    getValidSrc,
    handleUserSelect,
  ]);

  return (
    <aside
      className="flex flex-col h-full w-full bg-indigo-950 text-white p-4 overflow-y-auto border-r border-indigo-700"
      aria-label="User List"
    >
      <h2 className="text-xl font-bold mb-4 select-none">📇 Chats</h2>
      <ul>{renderedUsers}</ul>
    </aside>
  );
}
