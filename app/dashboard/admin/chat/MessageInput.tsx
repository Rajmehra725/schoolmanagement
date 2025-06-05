'use client';

import { useRef, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Smile, SendHorizonal, X, Paperclip } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Picker = dynamic(() => import('emoji-picker-react'), { ssr: false });

interface MessageInputProps {
  message: string;
  onChange: (val: string) => void;
  onSend: () => void;
  onAttach?: () => void; // placeholder for future file attachment handler
}

export default function MessageInput({ message, onChange, onSend, onAttach }: MessageInputProps) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle keyboard shortcut Ctrl+Enter for sending
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' && e.ctrlKey) || e.key === 'Enter') {
      if (message.trim()) {
        onSend();
        setShowEmojiPicker(false);
      }
    }
  };

  const onEmojiClick = (emojiData: any) => {
    onChange(message + emojiData.emoji);
    inputRef.current?.focus();
  };

  return (
    <div className="border-t bg-white p-3 flex items-center gap-2 relative shadow-sm max-sm:flex-wrap max-sm:justify-center">
      {/* Emoji Picker Toggle */}
      <button
        onClick={() => setShowEmojiPicker((prev) => !prev)}
        className="p-2 rounded-full hover:bg-gray-200 transition relative"
        aria-label="Toggle emoji picker"
        title="Emoji Picker"
        type="button"
      >
        <Smile size={20} className="text-gray-600" />
        <AnimatePresence>
          {showEmojiPicker && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-16 left-0 z-50"
            >
              <Picker onEmojiClick={onEmojiClick} />
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      {/* Attachment Button */}
      <button
        onClick={onAttach}
        className="p-2 rounded-full hover:bg-gray-200 transition"
        aria-label="Attach file"
        title="Attach file (Coming Soon)"
        type="button"
      >
        <Paperclip size={20} className="text-gray-600" />
      </button>

      {/* Input Field */}
      <div className="relative flex-1 min-w-[150px]">
        <input
          ref={inputRef}
          value={message}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={isFocused ? 'Press Enter to send, Ctrl+Enter to send' : 'Type your message...'}
          className="w-full pl-4 pr-10 py-2 rounded-full border shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          autoComplete="off"
          spellCheck={false}
        />
        {message && (
          <button
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition"
            onClick={() => onChange('')}
            aria-label="Clear message"
            title="Clear message"
            type="button"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Send Button */}
      <button
        onClick={() => {
          if (message.trim()) {
            onSend();
            setShowEmojiPicker(false);
            inputRef.current?.focus();
          }
        }}
        className={`flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium transition
          ${message.trim() ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer' : 'bg-blue-300 text-white cursor-not-allowed'}`}
        aria-label="Send message"
        title={message.trim() ? 'Send message' : 'Type a message first'}
        type="button"
        disabled={!message.trim()}
      >
        Send <SendHorizonal size={16} />
      </button>
    </div>
  );
}
