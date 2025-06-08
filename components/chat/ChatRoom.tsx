'use client';

import { useEffect, useRef, useState } from 'react';
import { db, auth } from '@/firebase/config';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  where,
  updateDoc,
  doc,
} from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import TypingIndicator from './TypingIndicator';
import SeenIndicator from './SeenIndicator';
import ChatHeader from './ChatHeader';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  text: string;
  uid: string;
  name: string;
  timestamp?: any;
  seen?: boolean;
  chatParticipants: string[];
}

interface UserInfo {
  id: string;
  name: string;
  photoURL: string;
  online: boolean;
}

interface ChatRoomProps {
  user: UserInfo;
  onBack: () => void;
}

export default function ChatRoom({ user, onBack }: ChatRoomProps): JSX.Element {
  const [messages, setMessages] = useState<Message[]>([]);
  const [authUser] = useAuthState(auth);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const markMessagesAsSeen = async (msgs: Message[]) => {
    if (!authUser) return;
    const unseenMessages = msgs.filter(
      (msg) => msg.uid === user.id && !msg.seen
    );

    const updates = unseenMessages.map(async (msg) => {
      const msgRef = doc(db, 'messages', msg.id);
      await updateDoc(msgRef, { seen: true });
    });

    await Promise.all(updates);
  };

  useEffect(() => {
    if (!authUser) return;

    const messagesRef = collection(db, 'messages');
    const q = query(
      messagesRef,
      where('chatParticipants', 'array-contains', authUser.uid),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() } as Message))
        .filter(
          (msg) =>
            msg.chatParticipants.includes(user.id) &&
            msg.chatParticipants.includes(authUser.uid)
        );

      setMessages(msgs);
      markMessagesAsSeen(msgs);
    });

    return () => unsubscribe();
  }, [authUser, user.id]);

  const lastMessage = messages[messages.length - 1];

  return (
    <motion.main
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 90, damping: 18 }}
      className="flex flex-col w-full h-[100dvh] md:h-[calc(100vh-80px)] bg-gradient-to-br from-gray-100 to-white dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-gray-100 rounded-lg overflow-hidden"
    >
      {/* Chat Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="sticky top-0 z-20 bg-white/70 dark:bg-gray-900/80 backdrop-blur-md shadow-md"
      >
        <ChatHeader user={user} onBack={onBack || (() => {})} />
      </motion.div>

      {/* Chat Messages */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-6 space-y-4 scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-700">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="hover:scale-[1.01] transform transition-all"
            >
              <MessageBubble
                message={msg}
                currentUserId={authUser?.uid || ''}
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex items-center space-x-1 ml-3"
        >
          <TypingIndicator />
        </motion.div>

        {/* Seen Indicator */}
        <div className="flex justify-end pr-2 text-xs text-green-500 mt-1">
          {lastMessage && <SeenIndicator messageId={lastMessage.id} />}
        </div>

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 18 }}
        className="sticky bottom-0 bg-white dark:bg-gray-900 shadow-inner px-4 py-2 border-t border-gray-300 dark:border-gray-700 pb-[env(safe-area-inset-bottom)]"
      >
        <ChatInput chatUserId={user.id} currentUser={authUser} />
      </motion.div>
    </motion.main>
  );
}
