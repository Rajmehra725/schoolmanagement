'use client';

import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase/config';

interface SeenIndicatorProps {
  messageId: string;
}

export default function SeenIndicator({ messageId }: SeenIndicatorProps): JSX.Element {
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'messages', messageId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSeen(Boolean(data.seen));
      }
    });

    return () => unsubscribe();
  }, [messageId]);

  return (
    <span className={`ml-2 text-xs ${seen ? 'text-blue-400' : 'text-gray-400'}`} title={seen ? 'Seen' : 'Sent'}>
      {seen ? '✓✓' : '✓'}
    </span>
  );
}
