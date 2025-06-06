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
  getDocs,
  QuerySnapshot,
  DocumentData,
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
  onBack?: () => void; // for mobile back button
}

export default function ChatRoom({ user, onBack }: ChatRoomProps): JSX.Element {
  const [messages, setMessages] = useState<Message[]>([]);
  const [authUser] = useAuthState(auth);
  const chatRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom helper
  const scrollToBottom = () => {
    chatRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Mark all unseen messages from this user as seen
  const markMessagesAsSeen = async (msgs: Message[]) => {
    if (!authUser) return;

    // Filter unseen messages sent by the other user
    const unseenMessages = msgs.filter(
      (msg) =>
        msg.uid === user.id && // from other user
        !msg.seen // not yet seen
    );

    // Batch update all unseen messages as seen
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

      // Mark unseen messages as seen
      markMessagesAsSeen(msgs);

      scrollToBottom();
    });

    return () => unsubscribe();
  }, [authUser, user.id]);

  const lastMessage = messages[messages.length - 1];

  return (
    <main className="flex flex-col flex-1 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg max-w-md mx-auto h-screen shadow-lg">
      <ChatHeader user={user} onBack={onBack || (() => {})} />

      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <MessageBubble message={msg} currentUserId={authUser?.uid || ''} />
            </motion.div>
          ))}
        </AnimatePresence>

        <TypingIndicator />

        <div className="flex justify-end pr-2 text-sm text-green-500">
          {lastMessage && <SeenIndicator messageId={lastMessage.id} />}
        </div>

        <div ref={chatRef} />
      </div>

      <ChatInput chatUserId={user.id} currentUser={authUser} />
    </main>
  );
}
