'use client';

import { useEffect, useState } from 'react';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db, auth } from '@/firebase/config';
import { Smile } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ReactionsProps {
  messageId: string;
}

const emojis: string[] = ['❤️', '😂', '👍', '😮', '😢', '👏'];

export default function Reactions({ messageId }: ReactionsProps): JSX.Element {
  const [selected, setSelected] = useState<string | null>(null);
  const [allReactions, setAllReactions] = useState<Record<string, string>>({});
  const [openPicker, setOpenPicker] = useState<boolean>(false);

  const uid = auth.currentUser?.uid;

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'messages', messageId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setAllReactions(data.reactions || {});
      }
    });
    return () => unsubscribe();
  }, [messageId]);

  useEffect(() => {
    if (uid) {
      setSelected(allReactions[uid] || null);
    }
  }, [allReactions, uid]);

  const toggleReaction = async (emoji: string) => {
    if (!uid) return;
    const messageRef = doc(db, 'messages', messageId);
    try {
      if (allReactions[uid] === emoji) {
        const updatedReactions = { ...allReactions };
        delete updatedReactions[uid];
        await updateDoc(messageRef, { reactions: updatedReactions });
        setSelected(null);
      } else {
        const updatedReactions = { ...allReactions, [uid]: emoji };
        await updateDoc(messageRef, { reactions: updatedReactions });
        setSelected(emoji);
      }
      setOpenPicker(false);
    } catch (error) {
      console.error('Failed to update reaction:', error);
    }
  };

  return (
    <div className="mt-2 flex items-center gap-2 relative select-none">
      {/* Reaction Button or Smile Icon */}
      <button
        onClick={() => setOpenPicker((prev) => !prev)}
        aria-label="Add Reaction"
        className={`p-2 rounded-full border border-gray-300 text-lg transition hover:bg-gray-200
          ${selected ? 'bg-indigo-600 text-white shadow' : 'text-gray-700'}
          sm:p-1 sm:text-base`}
        type="button"
      >
        {selected || <Smile className="w-5 h-5 sm:w-4 sm:h-4" />}
      </button>

      {/* Emoji Picker Popup */}
      <AnimatePresence>
        {openPicker && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 top-12 left-1/2 -translate-x-1/2 bg-white border border-gray-300 rounded-lg shadow-lg px-3 py-2 flex gap-2 flex-wrap justify-center max-w-[90vw] sm:top-10 sm:px-2"
          >
            {emojis.map((emoji) => (
              <button
                key={emoji}
                onClick={() => toggleReaction(emoji)}
                className="text-xl hover:scale-125 transition sm:text-lg"
              >
                {emoji}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
