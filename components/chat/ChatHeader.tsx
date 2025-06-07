'use client';

import { ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { db } from '@/firebase/config';
import { doc, onSnapshot } from 'firebase/firestore';
import moment from 'moment'; // npm install moment

interface ChatHeaderProps {
  user: {
    id: string;
    name: string;
    photoURL: string;
    online: boolean;
  };
  onBack?: () => void;
}

export default function ChatHeader({ user, onBack }: ChatHeaderProps) {
  const [lastSeen, setLastSeen] = useState<string | null>(null);

  useEffect(() => {
    const userRef = doc(db, 'users', user.id);

    const unsubscribe = onSnapshot(userRef, (snapshot) => {
      const data = snapshot.data();
      if (data?.lastSeen) {
        const time = moment(data.lastSeen.toDate()).fromNow(); // e.g. "2 minutes ago"
        setLastSeen(time);
      }
    });

    return () => unsubscribe();
  }, [user.id]);

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-white/10 backdrop-blur-md border-b border-white/10">
      {/* Back Button - visible only on mobile */}
      {onBack && (
        <button onClick={onBack} className="md:hidden text-white mr-2">
          <ArrowLeft size={24} />
        </button>
      )}

      {/* Profile Picture */}
      {user.photoURL?.trim() ? (
        <Image
          src={user.photoURL}
          alt={user.name}
          width={40}
          height={40}
          className="rounded-full object-cover"
        />
      ) : (
        <div className="h-10 w-10 bg-indigo-600 rounded-full flex items-center justify-center text-white text-lg font-semibold">
          {(user.name?.[0] ?? '?').toUpperCase()}
        </div>
      )}

      {/* Name and Status */}
      <div className="flex flex-col">
        <span className="text-white font-semibold text-base">{user.name}</span>
        <span className={`text-sm ${user.online ? 'text-green-400' : 'text-gray-400'}`}>
          {user.online ? 'Online' : lastSeen ? `last seen ${lastSeen}` : 'Offline'}
        </span>
      </div>
    </div>
  );
}
