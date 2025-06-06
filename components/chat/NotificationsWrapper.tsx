'use client';

import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, auth } from '@/firebase/config';
import { useAuthState } from 'react-firebase-hooks/auth';
import NotificationBadge from './NotificationBadge';

export default function NotificationsWrapper() {
  const [authUser, loadingAuth] = useAuthState(auth);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!authUser || loadingAuth) return;

    const q = query(
      collection(db, 'messages'),
      where('to', '==', authUser.uid),
      where('read', '==', false)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setUnreadCount(snapshot.size);
    });

    return () => unsubscribe();
  }, [authUser, loadingAuth]);

  if (loadingAuth || !authUser) return null;

  return (
    <div className="absolute top-2 right-2 z-50">
      <NotificationBadge count={unreadCount} />
    </div>
  );
}
