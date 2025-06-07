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
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize(); // call on first load
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex h-screen bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-700 text-white overflow-hidden">
      {isMobile ? (
        <>
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
              className="w-full"
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 80 }}
            >
              <ChatRoom user={activeUser} onBack={() => setActiveUser(null)} />
            </motion.div>
          )}
        </>
      ) : (
        // Desktop layout
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
            className="flex-1 flex flex-col bg-indigo-800"
            key={activeUser?.id ?? 'no-chat'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <AnimatePresence mode="wait">
              {activeUser ? (
                <ChatRoom
                  user={activeUser}
                  key={activeUser.id}
                  onBack={() => setActiveUser(null)}
                />
              ) : (
                <motion.div
                  key="placeholder"
                  className="flex items-center justify-center h-full text-indigo-300 italic select-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  Select a user to start chatting
                </motion.div>
              )}
            </AnimatePresence>
          </motion.main>
        </>
      )}
    </div>
  );
}
