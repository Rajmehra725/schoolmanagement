'use client';

import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/firebase/config';
import { deleteDoc, doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Reply } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  uid: string;
  name: string;
  timestamp?: any;
  seen?: boolean;
  chatParticipants: string[];
  reactions?: string[];
  replyTo?: string;  // Add replyTo to support replies
}

interface MessageProps {
  message: Message;
  currentUserId: string;
  onReply?: (message: Message) => void;
}

function formatTime(timestamp: any) {
  if (!timestamp?.toDate) return '';
  const date = timestamp.toDate();
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export default function MessageBubble({ message, currentUserId, onReply }: MessageProps): JSX.Element {
  const [user] = useAuthState(auth);
  const isOwnMessage = message.uid === user?.uid;
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.text);
  const [reactions, setReactions] = useState<string[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyTriggered, setReplyTriggered] = useState(false);
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);

  const x = useMotionValue(0);
  const opacity = useTransform(x, [-40, 0], [1, 0]);

  // Fetch reactions and replyTo message if any
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'messages', message.id), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setReactions(Array.isArray(data.reactions) ? data.reactions : []);
      }
    });

    let unsubscribeReply: (() => void) | undefined;

    if (message.replyTo) {
      unsubscribeReply = onSnapshot(doc(db, 'messages', message.replyTo), (docSnap) => {
        if (docSnap.exists()) {
          setReplyToMessage(docSnap.data() as Message);
        } else {
          setReplyToMessage(null);
        }
      });
    }

    return () => {
      unsubscribe();
      if (unsubscribeReply) unsubscribeReply();
    };
  }, [message.id, message.replyTo]);

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

  const handleDragEnd = (_: any, info: { offset: { x: number } }) => {
    if (info.offset.x > 40 && onReply && !replyTriggered && !isOwnMessage) {
      onReply(message);
      setReplyTriggered(true);
      setTimeout(() => setReplyTriggered(false), 1000); // prevent double reply
    }
  };

  return (
    <div className={`relative flex ${isOwnMessage ? 'justify-end' : 'justify-start'} px-2`}>
      {/* Reply Icon (shows on left for others' messages) */}
      {!isOwnMessage && (
        <motion.div
          style={{ opacity }}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-0"
        >
          <Reply className="text-green-500" size={18} />
        </motion.div>
      )}

      <motion.div
        className={`group relative max-w-xs p-3 rounded-lg shadow-lg break-words z-10
          ${isOwnMessage
            ? 'bg-blue-500 text-white rounded-br-none'
            : 'bg-gray-200 text-black rounded-bl-none'}`}
        drag={!isOwnMessage ? 'x' : false}
        dragConstraints={{ left: 0, right: 60 }}
        onDragEnd={handleDragEnd}
        style={{ x }}
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        transition={{ duration: 0.3 }}
      >
        {/* Reply Preview */}
        {replyToMessage && (
          <div className="text-xs text-gray-700 bg-gray-300 p-2 rounded mb-1 border-l-4 border-blue-500 max-w-full overflow-hidden">
            <span className="font-semibold truncate block">
              {replyToMessage.uid === currentUserId ? 'You' : replyToMessage.name}
            </span>
            <span className="truncate block">{replyToMessage.text}</span>
          </div>
        )}

        {isEditing ? (
          <div>
            <input
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full text-sm px-2 py-1 rounded border text-black"
            />
            <button onClick={handleEdit} className="text-xs text-blue-600 mt-1">
              Save
            </button>
          </div>
        ) : (
          <>
            <p className="whitespace-pre-wrap">{message.text}</p>

            {reactions.length > 0 && (
              <div className="mt-1 flex gap-1 flex-wrap items-center">
                {reactions.slice(0, 3).map((emoji, idx) => (
                  <span
                    key={idx}
                    className="text-sm px-1 py-0.5 bg-white/80 text-black rounded-full cursor-pointer hover:scale-110 transition"
                    onClick={() => toggleReaction(emoji)}
                  >
                    {emoji}
                  </span>
                ))}
                {reactions.length > 3 && (
                  <span
                    onClick={() => setShowEmojiPicker((prev) => !prev)}
                    className="text-sm px-1 py-0.5 bg-gray-300 text-black rounded-full cursor-pointer hover:scale-110 transition"
                  >
                    ⋯
                  </span>
                )}
              </div>
            )}

            <div className="flex justify-between items-center mt-1 text-xs text-white/60 dark:text-gray-300">
              <span>{message.timestamp ? formatTime(message.timestamp) : '...'}</span>
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
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="text-xs bg-red-500 text-white px-1 rounded"
            >
              Delete
            </button>
          </div>
        )}

        {!isEditing && (
          <div className="absolute bottom-0 left-0 hidden group-hover:flex">
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="text-xs bg-pink-200 text-black px-2 py-1 rounded"
            >
              😊
            </button>
            {showEmojiPicker && (
              <div className="absolute bottom-full mb-2 p-2 bg-white text-black shadow-lg rounded flex gap-1">
                {['👍', '😂', '❤️', '😢', '🔥', '👏', '🎉'].map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => toggleReaction(emoji)}
                    className="text-xl px-1"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
