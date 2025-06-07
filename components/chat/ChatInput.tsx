"use client";

import { useState, useRef, useEffect } from "react";
import { addDoc, collection, serverTimestamp, doc, setDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { FaSmile, FaPaperclip, FaMicrophone } from "react-icons/fa";
import EmojiPicker, { Theme, EmojiClickData } from "emoji-picker-react";

interface User {
  uid: string;
  displayName: string | null;
}

interface ChatInputProps {
  setTypingUser?: (name: string) => void;
  chatUserId: string;
  currentUser: User | null | undefined;
}

export default function ChatInput({
  setTypingUser,
  chatUserId,
  currentUser,
}: ChatInputProps): JSX.Element {
  const [input, setInput] = useState<string>("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [recording, setRecording] = useState(false);

  // Typing status update
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

    try {
      await addDoc(collection(db, "messages"), {
        text: input.trim(),
        from: currentUser.uid,
        to: chatUserId,
        read: false,
        uid: currentUser.uid,
        name: currentUser.displayName,
        timestamp: serverTimestamp(),
        chatParticipants: [currentUser.uid, chatUserId],
      });
      setInput("");
      setTypingUser?.("");
      updateTypingStatus(false);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleEmojiClick = (emojiData: EmojiClickData, event: MouseEvent) => {
    setInput((prev) => prev + emojiData.emoji);
  };

  useEffect(() => {
    return () => {
      updateTypingStatus(false);
    };
  }, []);

  const handleVoiceClick = () => {
    if (recording) return; // simulate simple voice message
    setRecording(true);
    setTimeout(() => {
      setRecording(false);
      alert("🎙️ Voice message recorded (simulated)");
    }, 3000);
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        sendMessage();
      }}
      className="relative flex items-center gap-3 p-4 border-t bg-white dark:bg-gray-800"
    >
      <button
        type="button"
        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        className="text-gray-600 dark:text-gray-300"
        aria-label="Toggle emoji picker"
      >
        <FaSmile className="text-xl" />
      </button>
      <button
        type="button"
        onClick={() => alert("📎 File upload not implemented yet")}
        className="text-gray-600 dark:text-gray-300"
        aria-label="Attach file"
      >
        <FaPaperclip className="text-xl" />
      </button>
      <input
        type="text"
        className="flex-1 rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        placeholder="Type a message..."
        value={input}
        onChange={handleInputChange}
        autoComplete="off"
      />
      <button
        type="submit"
        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md font-semibold transition"
      >
        Send
      </button>
      <button
        type="button"
        onClick={handleVoiceClick}
        title="Record Voice"
        aria-label="Record voice message"
      >
        <FaMicrophone
          className={`text-xl ${recording ? "text-red-500" : "text-gray-600 dark:text-gray-300"}`}
        />
      </button>

      {showEmojiPicker && (
        <div className="absolute bottom-full left-0 mb-2 z-50">
          <EmojiPicker onEmojiClick={handleEmojiClick} theme={'dark' as Theme} />
        </div>
      )}
    </form>
  );
}
