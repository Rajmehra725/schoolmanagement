'use client';

import { ArrowLeft } from 'lucide-react';
import Image from 'next/image';

interface ChatHeaderProps {
  user: {
    id: string;
    name: string;
    photoURL: string;
    online: boolean;
  };
  onBack: () => void;
}

export default function ChatHeader({ user, onBack }: ChatHeaderProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-white/10 backdrop-blur-md border-b border-white/10">
      {/* Back Button - visible only on mobile */}
      <button onClick={onBack} className="md:hidden text-white mr-2">
        <ArrowLeft size={24} />
      </button>

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
          {user.online ? 'Online' : 'Offline'}
        </span>
      </div>
    </div>
  );
}
