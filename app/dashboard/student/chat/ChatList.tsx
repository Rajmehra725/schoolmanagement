'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo } from 'react';
import { Info } from 'lucide-react';

interface User {
  id: string;
  name: string;
  photoURL?: string | null;
  status?: 'online' | 'offline';
}

interface UserListProps {
  users: User[];
  selectedUserId: string | null;
  onSelectUser: (user: User) => void;
}

export default function UserList({ users, selectedUserId, onSelectUser }: UserListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = useMemo(() => {
    const filtered = users.filter((u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return filtered.sort((a, b) =>
      (b.status === 'online' ? 1 : 0) - (a.status === 'online' ? 1 : 0)
    );
  }, [searchTerm, users]);

  const onlineCount = users.filter((u) => u.status === 'online').length;

  return (
    <div className="w-full md:w-1/3 lg:w-1/4 border-r p-4 overflow-y-auto bg-white shadow h-[250px] md:h-auto flex flex-col gap-4 relative">
      {/* Header */}
      <div className="sticky top-0 bg-white z-10 pb-2">
        <h2 className="font-bold text-xl text-blue-600 flex items-center justify-between">
          Users
          <span className="text-sm text-green-600 font-semibold">{onlineCount} online</span>
        </h2>

        {/* Search Bar */}
        <div className="relative mt-2">
          <input
            type="text"
            placeholder="Search users..."
            className="w-full p-2 border border-gray-300 rounded-md outline-blue-400 pr-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-400 hover:text-red-500"
              onClick={() => setSearchTerm('')}
              title="Clear"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Users List */}
      <div className="flex-1 overflow-y-auto custom-scroll">
        <AnimatePresence>
          {filteredUsers.map((u) => (
            <motion.div
              key={u.id}
              layout
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className={`p-2 cursor-pointer rounded-lg mb-2 shadow-sm transition flex items-center gap-4 ${
                selectedUserId === u.id ? 'bg-blue-100' : 'hover:bg-gray-50'
              }`}
              onClick={() => onSelectUser(u)}
            >
              <div className="relative group">
                {u.photoURL ? (
                  <img
                    src={u.photoURL}
                    alt={u.name}
                    className="w-12 h-12 rounded-full object-cover border border-gray-300"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gray-200 text-gray-600 font-bold border border-gray-300">
                    {u.name.charAt(0).toUpperCase()}
                  </div>
                )}

                {/* Status Badge */}
                <span
                  className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border border-white ${
                    u.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                  }`}
                />
              </div>

              <div className="flex flex-col">
                <span className="font-medium text-gray-800">{u.name}</span>
                {u.status && (
                  <span className="text-xs text-gray-500 capitalize">{u.status}</span>
                )}
              </div>
            </motion.div>
          ))}

          {filteredUsers.length === 0 && (
            <motion.div
              className="text-center text-gray-500 py-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              No users found
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
