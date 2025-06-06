'use client';

import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/firebase/config';
import { deleteDoc, doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface Message {
  id: string;
  text: string;
  uid: string;
  name: string;
  timestamp?: any;
  seen?: boolean;
  chatParticipants: string[];
  reactions?: string[];
}

interface MessageProps {
  message: Message;
  currentUserId: string;
  onReply?: (message: Message) => void;
}

export default function MessageBubble({ message, currentUserId, onReply }: MessageProps): JSX.Element {
  const [user] = useAuthState(auth);
  const isOwnMessage = message.uid === user?.uid;
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.text);
  const [reactions, setReactions] = useState<string[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'messages', message.id), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setReactions(Array.isArray(data.reactions) ? data.reactions : []);
      }
    });
    return () => unsubscribe();
  }, [message.id]);

  const handleDelete = async () => {
    await deleteDoc(doc(db, 'messages', message.id));
  };

  const handleEdit = async () => {
    await updateDoc(doc(db, 'messages', message.id), { text: editText });
    setIsEditing(false);
  };

  const toggleReaction = async (emoji: string) => {
    const hasReacted = reactions.includes(emoji);
    const newReactions = hasReacted
      ? reactions.filter((r) => r !== emoji)
      : [...reactions, emoji];

    await updateDoc(doc(db, 'messages', message.id), {
      reactions: newReactions,
    });
    setShowEmojiPicker(false);
  };

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 50 }}
      onDragEnd={(e, info) => {
        if (info.offset.x > 30 && onReply) onReply(message);
      }}
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`group relative max-w-xs p-3 rounded-lg shadow-lg break-words
        ${isOwnMessage ? 'bg-blue-500 text-white rounded-br-none' : 'bg-gray-200 text-black rounded-bl-none'}`}>

        {isEditing ? (
          <div>
            <input
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full text-sm px-2 py-1 rounded border text-black"
            />
            <button onClick={handleEdit} className="text-xs text-blue-600 mt-1">Save</button>
          </div>
        ) : (
          <>
            <p className="whitespace-pre-wrap">{message.text}</p>
            {reactions.length > 0 && (
              <div className="mt-1 flex gap-1 flex-wrap">
                {reactions.map((emoji, idx) => (
                  <span key={idx} className="text-sm cursor-pointer" onClick={() => toggleReaction(emoji)}>{emoji}</span>
                ))}
              </div>
            )}
            <div className="flex justify-between items-center mt-1 text-xs text-gray-300">
              {isOwnMessage && (
                <span>
                  {message.seen ? (
                    <span className="text-blue-300">✔✔</span>
                  ) : message.timestamp ? (
                    <span>✔</span>
                  ) : (
                    <span className="text-gray-400">🕓</span>
                  )}
                </span>
              )}
            </div>
          </>
        )}

        {isOwnMessage && !isEditing && (
          <div className="absolute top-0 right-0 hidden group-hover:flex gap-1 p-1">
            <button
              onClick={() => setIsEditing(true)}
              className="text-xs bg-yellow-400 text-black px-1 rounded"
            >Edit</button>
            <button
              onClick={handleDelete}
              className="text-xs bg-red-500 text-white px-1 rounded"
            >Delete</button>
          </div>
        )}

        {!isEditing && (
          <div className="absolute bottom-0 left-0 hidden group-hover:flex">
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="text-xs bg-pink-200 text-black px-2 py-1 rounded"
            >😊</button>
            {showEmojiPicker && (
              <div className="absolute bottom-full mb-2 p-2 bg-white text-black shadow-lg rounded">
                {["👍", "😂", "❤️", "😢", "🔥"].map((emoji) => (
                  <button key={emoji} onClick={() => toggleReaction(emoji)} className="text-xl px-1">
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
