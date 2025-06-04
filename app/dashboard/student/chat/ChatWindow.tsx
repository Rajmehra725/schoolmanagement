'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/firebase/config';
import {
  collection,
  onSnapshot,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  setDoc,
  doc,
} from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { Smile, SendHorizonal } from 'lucide-react';

const Picker = dynamic(() => import('emoji-picker-react'), { ssr: false });

interface User {
  id: string;
  name: string;
  photoURL?: string;
}

interface Message {
  senderId: string;
  text: string;
  timestamp: any;
}

export default function AdminChatPage() {
  const [user] = useAuthState(auth);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    const unsub = onSnapshot(collection(db, 'users'), (snapshot) => {
      const usersList = snapshot.docs
        .filter((doc) => doc.id !== user.uid)
        .map((doc) => ({
          id: doc.id,
          name: doc.data().name,
          photoURL: doc.data().photoURL,
        }));
      setUsers(usersList);
    });

    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (!user || !selectedUser) return;

    setLoadingMessages(true);
    const chatId = [user.uid, selectedUser.id].sort().join('_');
    const chatRef = collection(db, 'chats', chatId, 'messages');
    const q = query(chatRef, orderBy('timestamp'));

    const unsub = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => doc.data() as Message);
      setMessages(msgs);
      setLoadingMessages(false);
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    });

    return () => unsub();
  }, [user, selectedUser]);

  const handleSend = async () => {
    if (!message.trim() || !user || !selectedUser) return;

    const chatId = [user.uid, selectedUser.id].sort().join('_');
    await addDoc(collection(db, 'chats', chatId, 'messages'), {
      senderId: user.uid,
      text: message,
      timestamp: serverTimestamp(),
    });

    await setDoc(doc(db, 'chatSummaries', user.uid, 'threads', selectedUser.id), {
      userId: selectedUser.id,
      name: selectedUser.name,
      lastMessage: message,
      timestamp: serverTimestamp(),
    });

    await setDoc(doc(db, 'chatSummaries', selectedUser.id, 'threads', user.uid), {
      userId: user.uid,
      name: user.displayName,
      lastMessage: message,
      timestamp: serverTimestamp(),
    });

    setMessage('');
    inputRef.current?.focus();
    setShowEmojiPicker(false);
    setIsTyping(false);
  };

  const onEmojiClick = (emojiData: any) => {
    setMessage((prev) => prev + emojiData.emoji);
  };

  return (
    <div className="flex flex-col md:flex-row h-screen">
      {/* Sidebar */}
      <div className="w-full md:w-1/3 lg:w-1/4 border-r p-4 overflow-y-auto bg-white shadow">
        <h2 className="font-bold text-xl mb-4 text-blue-600">Users</h2>
        {users.map((u) => (
          <motion.div
            layout
            key={u.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`flex items-center gap-3 p-2 cursor-pointer rounded mb-2 transition ${
              selectedUser?.id === u.id ? 'bg-blue-100' : 'hover:bg-gray-100'
            }`}
            onClick={() => setSelectedUser(u)}
          >
            <img
              src={u.photoURL || '/default-avatar.png'}
              alt="avatar"
              className="w-8 h-8 rounded-full object-cover"
            />
            <div className="font-medium truncate">{u.name}</div>
          </motion.div>
        ))}
      </div>

      {/* Chat Box */}
      <div className="flex-1 flex flex-col bg-gray-50 relative">
        {selectedUser ? (
          <>
            <div className="border-b p-4 font-semibold flex items-center justify-between bg-white">
              <span>Chat with {selectedUser.name}</span>
              <span className="text-xs text-gray-500">Last seen: Recently</span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {loadingMessages ? (
                <div className="text-center text-gray-500">Loading messages...</div>
              ) : (
                <AnimatePresence>
                  {messages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className={`text-sm p-3 rounded-lg shadow max-w-xs break-words ${
                        msg.senderId === user?.uid
                          ? 'ml-auto bg-blue-200 text-right'
                          : 'bg-white text-left'
                      }`}
                    >
                      <div>{msg.text}</div>
                      <div className="text-[10px] text-gray-500 mt-1">
                        {msg.timestamp?.toDate
                          ? new Date(msg.timestamp.toDate()).toLocaleTimeString()
                          : '...'}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
              {isTyping && (
                <div className="text-sm text-gray-400 italic">Typing...</div>
              )}
              <div ref={bottomRef} />
            </div>

            {showEmojiPicker && (
              <div className="absolute bottom-24 left-1 z-10">
                <Picker onEmojiClick={onEmojiClick} />
              </div>
            )}

            <div className="border-t p-4 flex bg-white relative gap-2 items-center">
              <button
                onClick={() => setShowEmojiPicker((prev) => !prev)}
                className="bg-gray-200 p-2 rounded hover:bg-gray-300"
              >
                <Smile size={18} />
              </button>

              <input
                ref={inputRef}
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  setIsTyping(!!e.target.value);
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type a message..."
                className="flex-1 border px-4 py-2 rounded-l focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                onClick={handleSend}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r transition flex items-center gap-1"
              >
                Send <SendHorizonal size={16} />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-xl">
            Select a user to start chatting
          </div>
        )}
      </div>
    </div>
  );
}
