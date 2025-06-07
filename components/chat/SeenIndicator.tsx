import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase/config';

interface SeenIndicatorProps {
  messageId: string;
}

export default function SeenIndicator({ messageId }: SeenIndicatorProps): JSX.Element {
  const [status, setStatus] = useState<'sent' | 'delivered' | 'seen'>('sent');

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'messages', messageId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.seen) {
          setStatus('seen');
        } else if (data.delivered) {
          setStatus('delivered');
        } else {
          setStatus('sent');
        }
      }
    });

    return () => unsubscribe();
  }, [messageId]);

  let icon = '✓';
  let color = 'text-gray-400';

  if (status === 'delivered') {
    icon = '✓✓';
  }

  if (status === 'seen') {
    icon = '✓✓';
    color = 'text-blue-500';
  }

  return (
    <span className={`ml-2 text-xs ${color}`} title={status}>
      {icon}
    </span>
  );
}
  