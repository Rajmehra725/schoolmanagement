'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatRoom from '@/components/chat/ChatRoom';
import UserList from '@/components/chat/UserList';
import { User } from '@/app/types';

export default function ChatPage(): JSX.Element {
  const [activeUser, setActiveUser] = useState<User | null>(null);
  const [isMobile, setIsMobile] = useState(false);

 useEffect(() => {
  const media = window.matchMedia('(max-width: 767px)');
  const listener = () => setIsMobile(media.matches);
  listener(); // set initial state
  media.addListener(listener);
  return () => media.removeListener(listener);
}, []);


  // Add class to make body scroll-hidden/fullscreen if needed
  useEffect(() => {
    if (isMobile && activeUser) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isMobile, activeUser]);

  return (
    <div
      className={`${
        isMobile && activeUser ? 'fixed inset-0 z-50' : 'relative'
      } flex h-screen w-full bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-700 text-white overflow-hidden`}
    >
      {isMobile ? (
        <AnimatePresence mode="wait">
          {!activeUser ? (
            <motion.div
              key="mobile-userlist"
              className="w-full"
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 80 }}
            >
              <UserList
                activeUserId={null}
                onUserSelect={setActiveUser}
              />
            </motion.div>
          ) : (
            <motion.div
              key="mobile-chatroom"
              className="w-full h-full"
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 80 }}
            >
              <ChatRoom user={activeUser} onBack={() => setActiveUser(null)} />
            </motion.div>
          )}
        </AnimatePresence>
      ) : (
        <>
          <motion.div
            className="hidden md:flex md:flex-col w-72 bg-indigo-900 border-r border-indigo-700"
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 80 }}
          >
            <UserList
              activeUserId={activeUser?.id || null}
              onUserSelect={setActiveUser}
            />
          </motion.div>

          <motion.main
            key={activeUser?.id ?? 'no-chat'}
            className="flex-1 flex flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {activeUser ? (
              <ChatRoom user={activeUser} onBack={() => setActiveUser(null)} />
            ) : (
              <div className="flex items-center justify-center h-full text-xl text-gray-400">
                Select a user to start chatting
              </div>
            )}
          </motion.main>
        </>
      )}
    </div>
  );
}
