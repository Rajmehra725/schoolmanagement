'use client';

import { useRef, useState, useEffect, DragEvent } from 'react';
import dynamic from 'next/dynamic';
import { Smile, SendHorizonal, X, Paperclip } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Picker = dynamic(() => import('emoji-picker-react'), { ssr: false });

interface MessageInputProps {
  message: string;
  onChange: (val: string) => void;
  onSend: () => void;
  onAttach?: (file: File) => void; // now accepts file
  onTyping?: (isTyping: boolean) => void; // new typing indicator callback
}

export default function MessageInput({
  message,
  onChange,
  onSend,
  onAttach,
  onTyping,
}: MessageInputProps) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Typing indicator handler
  const handleTyping = (val: string) => {
    onChange(val);
    if (onTyping) {
      onTyping(true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => onTyping(false), 1500);
    }
  };

  // Keyboard shortcut: Enter sends message, Shift+Enter adds newline
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (message.trim()) {
        onSend();
        setShowEmojiPicker(false);
        if (onTyping) onTyping(false);
      }
    }
  };

  // Emoji selected
  const onEmojiClick = (emojiData: any) => {
    onChange(message + emojiData.emoji);
    inputRef.current?.focus();
  };

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachedFile(e.target.files[0]);
      if (onAttach) onAttach(e.target.files[0]);
    }
  };

  // Handle drag and drop files
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setAttachedFile(e.dataTransfer.files[0]);
      if (onAttach) onAttach(e.dataTransfer.files[0]);
    }
  };

  // Clear attached file
  const clearAttachment = () => {
    setAttachedFile(null);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="border-t bg-white p-3 flex flex-col gap-2 relative shadow-sm max-sm:flex-wrap max-sm:justify-center"
    >
      {/* Emoji Picker Toggle */}
      <div className="flex items-center gap-2">
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
        <label
          htmlFor="file-upload"
          className="p-2 rounded-full hover:bg-gray-200 transition cursor-pointer"
          aria-label="Attach file"
          title="Attach file"
        >
          <Paperclip size={20} className="text-gray-600" />
          <input
            id="file-upload"
            type="file"
            className="hidden"
            onChange={handleFileChange}
            accept="image/*,video/*,application/pdf"
          />
        </label>

        {/* Send Button */}
        <button
          onClick={() => {
            if (message.trim()) {
              onSend();
              setShowEmojiPicker(false);
              if (onTyping) onTyping(false);
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

      {/* Input Field with autosize textarea */}
      <div className="relative flex-1 min-w-[150px]">
        <textarea
          ref={inputRef}
          value={message}
          onChange={(e) => handleTyping(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={
            isFocused
              ? 'Shift+Enter for newline, Enter to send'
              : 'Type your message...'
          }
          className="w-full resize-none pl-4 pr-10 py-2 rounded-xl border shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition min-h-[40px] max-h-[120px] overflow-y-auto"
          rows={1}
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

      {/* Attached File Preview */}
      {attachedFile && (
        <div className="flex items-center gap-3 border rounded p-2 bg-gray-50">
          <span className="text-sm truncate max-w-xs">{attachedFile.name}</span>
          <button
            onClick={clearAttachment}
            aria-label="Remove attachment"
            title="Remove attachment"
            className="text-red-500 hover:text-red-700 transition"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Drag & Drop Hint */}
      <div className="text-xs text-gray-400 italic text-center mt-1 select-none">
        Drag & drop files here to attach
      </div>
    </div>
  );
}
