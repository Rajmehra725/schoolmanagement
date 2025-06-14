"use client";

import { useState, useRef } from "react";
import {
  addDoc,
  collection,
  serverTimestamp,
  doc,
  setDoc,
} from "firebase/firestore";
import { db } from "@/firebase/config";
import {
  FaSmile,
  FaPaperclip,
  FaMicrophone,
  FaPaperPlane,
} from "react-icons/fa";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";

interface User {
  uid: string;
  displayName: string | null;
}

interface ReplyTo {
  id: string;
  text: string;
  name: string;
}

interface ChatInputProps {
  setTypingUser?: (name: string) => void;
  chatUserId: string;
  currentUser: User | null | undefined;
  replyTo?: ReplyTo | null;
  clearReply?: () => void;
}

export default function ChatInput({
  setTypingUser,
  chatUserId,
  currentUser,
  replyTo,
  clearReply,
}: ChatInputProps): JSX.Element {
  const [input, setInput] = useState<string>("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const updateTypingStatus = async (typing: boolean) => {
    if (!currentUser) return;
    const typingDocRef = doc(db, "typingStatus", currentUser.uid);
    try {
      await setDoc(
        typingDocRef,
        {
          typing,
          name: currentUser.displayName || "Unknown",
          chatUserId,
          timestamp: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (error) {
      console.error("Typing status update failed:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    setTypingUser?.(currentUser?.displayName || "");
    updateTypingStatus(true);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setTypingUser?.("");
      updateTypingStatus(false);
    }, 2000);
  };

  const sendMessage = async () => {
    if (!input.trim() || !currentUser) return;

    const newMessage: any = {
      text: input.trim(),
      from: currentUser.uid,
      to: chatUserId,
      read: false,
      uid: currentUser.uid,
      name: currentUser.displayName,
      timestamp: serverTimestamp(),
      chatParticipants: [currentUser.uid, chatUserId],
    };

    if (replyTo) {
      newMessage.replyTo = {
        id: replyTo.id,
        text: replyTo.text,
        name: replyTo.name,
      };
    }

    try {
      await addDoc(collection(db, "messages"), newMessage);
      setInput("");
      setTypingUser?.("");
      updateTypingStatus(false);
      clearReply?.();
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setInput((prev) => prev + emojiData.emoji);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div className="relative bg-indigo-800 border-t border-indigo-700 p-2 sm:p-3">
      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="absolute bottom-16 left-2 sm:left-4 z-50 bg-indigo-800 rounded-lg shadow-lg max-h-80 overflow-y-auto">
          <EmojiPicker theme={Theme.DARK} onEmojiClick={handleEmojiClick} />
        </div>
      )}

      {/* Reply Preview */}
      {replyTo && (
        <div className="bg-indigo-700 text-white px-3 py-2 mb-1 rounded-md border-l-4 border-yellow-400 relative">
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium text-yellow-300">{replyTo.name}</span>
            <button
              onClick={clearReply}
              className="text-white text-xs hover:text-red-400"
            >
              ✕
            </button>
          </div>
          <p className="truncate text-sm italic">{replyTo.text}</p>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setShowEmojiPicker((prev) => !prev)}
          className="text-white text-lg sm:text-xl"
        >
          <FaSmile />
        </button>

        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
          placeholder="Type a message..."
          className="flex-1 min-w-[100px] px-3 py-2 rounded-full bg-indigo-700 text-white placeholder-gray-300 focus:outline-none text-sm sm:text-base"
        />

        <button className="text-white text-lg sm:text-xl">
          <FaPaperclip />
        </button>

        <button className="text-white text-lg sm:text-xl">
          <FaMicrophone />
        </button>

        <button
          onClick={sendMessage}
          className="text-white text-lg sm:text-xl"
          aria-label="Send"
        >
          <FaPaperPlane />
        </button>
      </div>
    </div>
  );
}
