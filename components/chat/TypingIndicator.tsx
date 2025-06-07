'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/firebase/config';

export default function TypingIndicator(): JSX.Element | null {
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'typingStatus'), where('typing', '==', true));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setIsTyping(snapshot.size > 0);
    });

    return () => unsubscribe();
  }, []);

  if (!isTyping) return null;

  return (
    <div className="flex justify-start px-4 pb-2">
      <div className="inline-flex items-center space-x-1 bg-orange-100 px-3 py-1 rounded-full shadow-lg max-w-fit select-none">
        <TypingDots />
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <div className="flex space-x-1">
      {[...Array(3)].map((_, i) => (
        <span
          key={i}
          className="w-2.5 h-2.5 bg-orange-500 rounded-full animate-pulse"
          style={{ animationDelay: `${i * 0.3}s` }}
        />
      ))}
    </div>
  );
}
