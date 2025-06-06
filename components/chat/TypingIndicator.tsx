'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/firebase/config';

export default function TypingIndicator(): JSX.Element | null {
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'typingStatus'), where('typing', '==', true));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersTyping = snapshot.docs.map((doc) => doc.data().name as string);
      setTypingUsers(usersTyping);
    });

    return () => unsubscribe();
  }, []);

  if (typingUsers.length === 0) return null;

  const typingText =
    typingUsers.length === 1
      ? `${typingUsers[0]} is typing...`
      : `${typingUsers.join(', ')} are typing...`;

  return (
    <p className="text-xs text-gray-500 italic px-4 pb-1 select-none animate-pulse">
      {typingText}
    </p>
  );
}
