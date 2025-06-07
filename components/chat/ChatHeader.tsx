import { ArrowLeft, Bell, Info, Phone, Video } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { db } from '@/firebase/config';
import { doc, onSnapshot } from 'firebase/firestore';
import moment from 'moment';
import { motion } from 'framer-motion';

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
  const [exactLastSeen, setExactLastSeen] = useState<string>('');

  useEffect(() => {
    const userRef = doc(db, 'users', user.id);

    const unsubscribe = onSnapshot(userRef, (snapshot) => {
      const data = snapshot.data();
      if (data?.lastSeen) {
        const time = moment(data.lastSeen.toDate());
        setLastSeen(time.fromNow());
        setExactLastSeen(time.format('MMMM Do YYYY, h:mm:ss a'));
      }
    });

    return () => unsubscribe();
  }, [user.id]);

  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 100 }}
      className="flex items-center justify-between gap-4 px-4 py-3 bg-[#1f2937] border-b border-gray-700 shadow-md"
    >
      <div className="flex items-center gap-3">
        {onBack && (
          <button onClick={onBack} className="md:hidden text-white mr-1">
            <ArrowLeft size={24} />
          </button>
        )}

        {user.photoURL?.trim() ? (
          <Image
            src={user.photoURL}
            alt={user.name}
            width={40}
            height={40}
            className="rounded-full object-cover border border-white/20"
          />
        ) : (
          <div className="h-10 w-10 bg-indigo-600 rounded-full flex items-center justify-center text-white text-lg font-semibold">
            {(user.name?.[0] ?? '?').toUpperCase()}
          </div>
        )}

        <div className="flex flex-col">
          <span className="text-white font-semibold text-base leading-tight">
            {user.name}
          </span>
          <span
            className={`text-xs mt-0.5 ${user.online ? 'text-green-400' : 'text-gray-400'}`}
            title={exactLastSeen}
          >
            {user.online ? (
              <span className="flex items-center gap-1">
                <span className="relative inline-flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                </span>
                Online
              </span>
            ) : (
              `Last seen ${lastSeen}`
            )}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 text-white">
        <button className="hover:text-indigo-400 transition-colors duration-200" title="Audio Call">
          <Phone size={20} />
        </button>
        <button className="hover:text-indigo-400 transition-colors duration-200" title="Video Call">
          <Video size={20} />
        </button>
        <button className="hover:text-yellow-400 transition-colors duration-200" title="Notifications">
          <Bell size={20} />
        </button>
        <button className="hover:text-blue-400 transition-colors duration-200" title="User Info">
          <Info size={20} />
        </button>
      </div>
    </motion.div>
  );
}
