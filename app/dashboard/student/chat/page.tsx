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
import { Smile, SendHorizonal, ArrowLeft } from 'lucide-react';

const Picker = dynamic(() => import('emoji-picker-react'), { ssr: false });

interface User {
  id: string;
  name: string;
  photoURL?: string | null;
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
  const [typing, setTyping] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);

  // Fetch users except current user
  useEffect(() => {
    if (!user) return;

    const unsub = onSnapshot(collection(db, 'users'), (snapshot) => {
      const usersList = snapshot.docs
        .filter((doc) => doc.id !== user.uid)
        .map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            name: typeof data.name === 'string' && data.name.trim() !== '' ? data.name : 'Unknown User',
            photoURL: data.photoURL || null,
          };
        });
      setUsers(usersList);
    });

    return () => unsub();
  }, [user]);

  // Fetch messages for selected user chat
  useEffect(() => {
    if (!user || !selectedUser) {
      setMessages([]);
      return;
    }

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

  // Listen typing status of selected user
  useEffect(() => {
    if (!user || !selectedUser) {
      setTyping(false);
      return;
    }

    const chatId = [user.uid, selectedUser.id].sort().join('_');
    const typingRef = doc(db, 'typingStatus', chatId);

    const unsub = onSnapshot(typingRef, (docSnap) => {
      const typingData = docSnap.data();
      if (typingData && typingData[selectedUser.id]) {
        setTyping(true);
      } else {
        setTyping(false);
      }
    });

    return () => unsub();
  }, [selectedUser, user]);

  const handleTypingStatus = async (isTyping: boolean) => {
    if (!user || !selectedUser) return;
    const chatId = [user.uid, selectedUser.id].sort().join('_');
    await setDoc(
      doc(db, 'typingStatus', chatId),
      {
        [user.uid]: isTyping,
      },
      { merge: true }
    );
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    handleTypingStatus(true);
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      handleTypingStatus(false);
    }, 1500);
  };

  const handleSend = async () => {
    if (!message.trim() || !user || !selectedUser) return;

    const chatId = [user.uid, selectedUser.id].sort().join('_');
    await addDoc(collection(db, 'chats', chatId, 'messages'), {
      senderId: user.uid,
      text: message.trim(),
      timestamp: serverTimestamp(),
    });

    await setDoc(
      doc(db, 'chatSummaries', user.uid, 'threads', selectedUser.id),
      {
        userId: selectedUser.id,
        name: selectedUser.name,
        lastMessage: message.trim(),
        timestamp: serverTimestamp(),
      }
    );

    await setDoc(
      doc(db, 'chatSummaries', selectedUser.id, 'threads', user.uid),
      {
        userId: user.uid,
        name: user.displayName || 'Admin',
        lastMessage: message.trim(),
        timestamp: serverTimestamp(),
      }
    );

    setMessage('');
    inputRef.current?.focus();
    setShowEmojiPicker(false);
    await handleTypingStatus(false);
  };

  const onEmojiClick = (emojiData: any) => {
    setMessage((prev) => prev + emojiData.emoji);
    inputRef.current?.focus();
  };

  return (
    <div className="h-screen flex flex-col md:flex-row bg-gray-100">
      {/* Sidebar */}
      <div
        className={`
          fixed inset-0 bg-white z-30 p-4 overflow-y-auto border-r shadow-md
          md:static md:w-1/3 lg:w-1/4 md:shadow-none
          ${selectedUser ? 'translate-x-0 md:translate-x-0' : 'translate-x-0 md:translate-x-0'}
          ${selectedUser ? 'translate-x-full md:translate-x-0' : 'translate-x-0'}
          transition-transform duration-300 ease-in-out
          md:block
        `}
        style={{ maxHeight: '100vh' }}
      >
        <h2 className="font-bold text-xl mb-4 text-blue-600">Users</h2>
        {users.length === 0 && (
          <p className="text-gray-500 text-center mt-10">No users found</p>
        )}
        {users.map((u) => (
          <motion.div
            layout
            key={u.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`p-2 cursor-pointer rounded mb-2 transition flex items-center gap-3 ${
              selectedUser?.id === u.id ? 'bg-blue-100' : 'hover:bg-gray-100'
            }`}
            onClick={() => setSelectedUser(u)}
          >
            <img
              src={u.photoURL || '/default-profile.png'}
              alt={u.name}
              className="w-10 h-10 rounded-full object-cover border border-gray-300"
            />
            <div className="font-medium text-sm md:text-base">{u.name}</div>
          </motion.div>
        ))}
      </div>

      {/* Chat box */}
      <div
        className={`flex flex-col bg-gray-50 relative md:w-2/3 lg:w-3/4
          ${selectedUser ? 'block' : 'hidden md:flex'}
        `}
        style={{ maxHeight: '100vh' }}
      >
        {selectedUser ? (
          <>
            {/* Header */}
            <div className="border-b p-4 font-semibold flex items-center justify-between bg-white sticky top-0 z-20 shadow-sm">
              <div className="flex items-center gap-3">
                <button
                  className="md:hidden p-1 rounded hover:bg-gray-100"
                  onClick={() => setSelectedUser(null)}
                  aria-label="Back to user list"
                >
                  <ArrowLeft size={20} />
                </button>
                <img
                  src={selectedUser.photoURL || '/default-profile.png'}
                  alt={selectedUser.name}
                  className="w-8 h-8 rounded-full object-cover border border-gray-300"
                />
                <span className="text-sm md:text-base font-medium">{selectedUser.name}</span>
              </div>
              <span className="text-xs text-gray-500">Last seen: Recently</span>
            </div>

            {/* Messages */}
            <div
              className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
              style={{ scrollBehavior: 'smooth' }}
            >
              {loadingMessages ? (
                <div className="text-center text-gray-500">Loading messages...</div>
              ) : (
                <AnimatePresence initial={false}>
                  {messages.map((msg, i) => {
                    const isOwn = msg.senderId === user?.uid;
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className={`text-sm p-3 rounded-lg shadow max-w-xs break-words ${
                          isOwn ? 'ml-auto bg-blue-200 text-right' : 'bg-white text-left'
                        } flex flex-col`}
                      >
                        <div>{msg.text}</div>
                        <div className="text-[10px] text-gray-500 mt-1 select-none">
                          {msg.timestamp?.toDate
                            ? new Date(msg.timestamp.toDate()).toLocaleTimeString()
                            : '...'}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
              {typing && (
                <div className="text-gray-500 italic text-sm animate-pulse">
                  {selectedUser.name} is typing...
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Emoji picker */}
            {showEmojiPicker && (
              <div className="absolute bottom-20 left-2 z-20 max-w-xs md:max-w-md shadow-lg rounded overflow-hidden">
                <Picker onEmojiClick={onEmojiClick} />
              </div>
            )}

            {/* Input area */}
            <div className="border-t p-4 flex bg-white relative gap-2 items-center flex-wrap md:flex-nowrap">
              <button
                onClick={() => setShowEmojiPicker((prev) => !prev)}
                className="bg-gray-200 p-2 rounded hover:bg-gray-300"
                aria-label="Toggle emoji picker"
                type="button"
              >
                <Smile size={18} />
              </button>

              <input
                ref={inputRef}
                value={message}
                onChange={onInputChange}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type a message..."
                className="flex-1 border px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 min-w-[150px]"
                autoComplete="off"
                type="text"
              />

              <button
                onClick={handleSend}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition flex items-center gap-1"
                aria-label="Send message"
                type="button"
              >
                Send <SendHorizonal size={16} />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-xl p-4">
            Select a user to start chatting
          </div>
        )}
      </div>
    </div>
  );
}
