// ChatBoxWithFirebase.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import {
  collection,
  doc,
  onSnapshot,
  updateDoc,
  deleteDoc,
  addDoc,
  serverTimestamp,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from '@/firebase/config';

interface Message {
  id: string;
  text: string;
  senderId: string;
  receiverId: string;
  timestamp: any;
  status?: 'sent' | 'delivered' | 'seen';
  reaction?: string;
}

interface ChatBoxProps {
  userId: string;
  selectedUserId: string;
  selectedUserName: string;
  chatId: string;
}

const emojiOptions = ['👍', '❤️', '😂', '🔥', '😢'];

export default function ChatBox({ userId, selectedUserId, selectedUserName, chatId }: ChatBoxProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState('');
  const [editMsgId, setEditMsgId] = useState<string | null>(null);
  const [notification, setNotification] = useState('');
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'chats', chatId, 'messages'), orderBy('timestamp'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: Message[] = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Message));
      setMessages(msgs);
      setLoading(false);
      markDelivered(msgs);
      markSeen(msgs);
    });
    return unsubscribe;
  }, [chatId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const markDelivered = async (msgs: Message[]) => {
    for (const msg of msgs) {
      if (msg.receiverId === userId && msg.status === 'sent') {
        const msgRef = doc(db, 'chats', chatId, 'messages', msg.id);
        await updateDoc(msgRef, { status: 'delivered' });
      }
    }
  };

  const markSeen = async (msgs: Message[]) => {
    for (const msg of msgs) {
      if (msg.receiverId === userId && msg.status !== 'seen') {
        const msgRef = doc(db, 'chats', chatId, 'messages', msg.id);
        await updateDoc(msgRef, { status: 'seen' });
      }
    }
  };

  const handleReaction = async (index: number, emoji: string) => {
    const msg = messages[index];
    const msgRef = doc(db, 'chats', chatId, 'messages', msg.id);
    await updateDoc(msgRef, { reaction: emoji });
  };

  const sendMessage = async () => {
    if (input.trim() === '') return;
    if (editMsgId) {
      const msgRef = doc(db, 'chats', chatId, 'messages', editMsgId);
      await updateDoc(msgRef, { text: input });
      setNotification('Message edited');
      setEditMsgId(null);
    } else {
      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        text: input,
        senderId: userId,
        receiverId: selectedUserId,
        timestamp: serverTimestamp(),
        status: 'sent',
      });
      setNotification('Message sent');
    }
    setInput('');
    setTimeout(() => setNotification(''), 2000);
  };

  const handleEdit = (msg: Message) => {
    setEditMsgId(msg.id);
    setInput(msg.text);
  };

  const handleDelete = async (msgId: string) => {
    await deleteDoc(doc(db, 'chats', chatId, 'messages', msgId));
    setNotification('Message deleted');
    setTimeout(() => setNotification(''), 2000);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b bg-white font-semibold text-blue-600 shadow text-lg">
        Chat with {selectedUserName}
      </div>

      {/* Notification */}
      {notification && (
        <div className="text-center text-sm bg-green-100 text-green-700 py-1 animate-fade-in">
          {notification}
        </div>
      )}

      {/* Chat Box */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-3 custom-scroll relative">
        {loading ? (
          <div className="text-center text-gray-500 animate-pulse">Loading messages...</div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((msg, index) => {
              const isOwn = msg.senderId === userId;
              const time = msg.timestamp?.toDate
                ? new Date(msg.timestamp.toDate()).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : '...';

              return (
                <motion.div
                  key={msg.id}
                  onMouseEnter={() => setTyping(true)}
                  onMouseLeave={() => setTyping(false)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className={`group relative p-3 max-w-[75%] rounded-xl shadow-sm text-sm break-words ${
                    isOwn
                      ? 'ml-auto bg-blue-100 text-right text-gray-800'
                      : 'bg-white text-left text-gray-900'
                  }`}
                >
                  <div>{msg.text}</div>

                  {msg.reaction && (
                    <div className="text-xl mt-1">
                      <span>{msg.reaction}</span>
                    </div>
                  )}

                  {typing && (
                    <div
                      className={`absolute -top-8 ${
                        isOwn ? 'right-0' : 'left-0'
                      } bg-white p-1 rounded-lg shadow flex gap-1`}
                    >
                      {emojiOptions.map((emoji) => (
                        <button
                          key={emoji}
                          className="hover:scale-110 transition text-lg"
                          onClick={() => handleReaction(index, emoji)}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="text-[10px] text-gray-500 mt-1 flex justify-between items-center gap-2">
                    <span>{time}</span>
                    {isOwn && (
                      <div className="flex gap-2 text-xs font-semibold">
                        {msg.status && (
                          <span
                            className={`${
                              msg.status === 'seen'
                                ? 'text-green-500'
                                : msg.status === 'delivered'
                                ? 'text-blue-500'
                                : 'text-gray-400'
                            }`}
                          >
                            {msg.status}
                          </span>
                        )}
                        <button
                          onClick={() => handleEdit(msg)}
                          className="text-yellow-500 hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(msg.id)}
                          className="text-red-500 hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}

        {typing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center text-gray-500 italic text-sm gap-1 mt-2"
          >
            <span>{selectedUserName} is typing</span>
            <div className="flex gap-[2px]">
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-100" />
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-200" />
            </div>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input Bar */}
      <div className="p-3 bg-white border-t flex gap-2 max-sm:flex-col max-sm:items-stretch">
        <input
          className="flex-1 px-4 py-2 border rounded-full shadow-sm text-sm focus:outline-none"
          type="text"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold"
          onClick={sendMessage}
        >
          {editMsgId ? 'Update' : 'Send'}
        </button>
      </div>
    </div>
  );
}
