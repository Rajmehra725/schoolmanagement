'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const loveLines = [
  'Tumhari muskaan meri duniya hai 😍',
  'Jab tum hasta ho, toh lagta hai jaise zindagi muskura rahi hai ✨',
  'Tum ro deti ho toh meri rooh kaamp jaati hai 🥺',
  'Aur jab tum hasta ho... toh main jeeta hoon 💖',
];

export default function SmileForYou() {
  const [started, setStarted] = useState(false);
  const [lineIndex, setLineIndex] = useState(0);
  const [showLetter, setShowLetter] = useState(false);
  const [showFinalHeart, setShowFinalHeart] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [hearts, setHearts] = useState<{ left: string; top: string; delay: string; emoji: string }[]>([]);
  const [loveCount, setLoveCount] = useState(0);
  const [showSecret, setShowSecret] = useState(false);

  useEffect(() => {
    setIsClient(true);

    const arr = Array.from({ length: 40 }).map((_, i) => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: `${i * 0.3}s`,
      emoji: ['❤️', '💖', '😊', '💋', '🌹'][i % 5],
    }));
    setHearts(arr);
  }, []);

  const start = () => {
    setStarted(true);
    setLineIndex(0);
    setShowLetter(false);
    setShowFinalHeart(false);
  };

  useEffect(() => {
    if (started && lineIndex < loveLines.length - 1) {
      const timer = setTimeout(() => {
        setLineIndex((prev) => prev + 1);
      }, 4000);
      return () => clearTimeout(timer);
    } else if (lineIndex === loveLines.length - 1) {
      setTimeout(() => setShowLetter(true), 3000);
    }
  }, [lineIndex, started]);

  useEffect(() => {
    if (started) {
      const interval = setInterval(() => {
        setLoveCount((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [started]);

  if (!isClient) return null;

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-pink-100 via-pink-200 to-pink-300 flex flex-col items-center justify-center text-center p-6 overflow-hidden text-pink-900 font-serif">

      {/* Floating Emoji Rain */}
      <div className="absolute inset-0 -z-10 opacity-20 pointer-events-none">
        {hearts.map((h, i) => (
          <div
            key={i}
            className="absolute text-2xl animate-bounce"
            style={{
              left: h.left,
              top: h.top,
              animationDelay: h.delay,
            }}
          >
            {h.emoji}
          </div>
        ))}
      </div>

      {/* Firefly-style Flickering */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute text-xl animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          >
            {['💖', '✨', '🌟'][i % 3]}
          </div>
        ))}
      </div>

      {!started ? (
        <>
          <motion.h1
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-5xl font-bold mb-6"
          >
            Meli Sweetheart Jaan 💌
          </motion.h1>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={start}
            className="bg-pink-600 text-white px-6 py-3 rounded-full text-xl shadow-lg hover:bg-pink-700"
          >
            Click & Smile For Me 💖
          </motion.button>
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="max-w-xl"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 animate-pulse">
            Tumhara Hasna Sabse Khoobsurat Cheez Hai 💫
          </h2>

          {/* Typewriter-Style Love Lines */}
          <p className="text-xl italic text-pink-800 min-h-[4rem] transition-all duration-500">
            {loveLines[lineIndex]}
          </p>

          {/* Music Bars */}
          <div className="flex justify-center mt-4 space-x-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-1 h-6 bg-pink-500 animate-pulse"
                style={{ animationDelay: `${i * 0.2}s` }}
              ></div>
            ))}
          </div>

          {/* Hug Emoji Bounce */}
          <div className="mt-8 text-6xl animate-bounce">😊🤗💖</div>

          <p className="mt-6 text-lg leading-relaxed">
            Meli Princess 👑, Meli Baby Jaan 💋, Meli Cute Sa Smile Machine 🥰 —  
            Tum muskura do toh duniya jeetne ka mann karta hai!
          </p>

          <div className="mt-6 text-lg text-pink-700 font-semibold">
            I’ve said “I love you” <span className="text-pink-900 font-bold">{loveCount}</span> times in my heart ❤️
          </div>

          {/* Love Letter Section */}
          {showLetter && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="mt-10 bg-white bg-opacity-80 p-4 rounded-lg shadow-lg text-pink-800"
            >
              <h3 className="text-2xl font-semibold mb-2">✍️ Ek Chitthi Tumhare Naam</h3>
              <p>
                Meri Jaan,  
                Tum roti ho toh mujhe duniya se shikayat hoti hai.  
                Par jab tum hasta ho... toh lagta hai saari zindagi jeet gaya.  
                Tum meri khushi ho. Tum meri dua ho.  
                Sirf ek baar muskura do — meli rooh ko sukoon mil jayega 💖
              </p>
            </motion.div>
          )}

          {/* Secret Reveal */}
          {showLetter && (
            <div className="mt-10">
              {!showSecret ? (
                <button
                  onClick={() => setShowSecret(true)}
                  className="bg-pink-700 text-white px-5 py-2 rounded-full hover:bg-pink-800 shadow-md"
                >
                  🔓 Tap to reveal a secret
                </button>
              ) : (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 1 }}
                  className="mt-4 text-xl text-pink-900 font-semibold"
                >
                  Tum roti ho toh meri duniya andheri ho jaati hai...  
                  Tum hasta ho toh meri zindagi mein roshni aa jaati hai.  
                  💖 *Mujhe sirf tumhari muskaan chahiye... zindagi bhar ke liye.* 💍
                </motion.div>
              )}
            </div>
          )}

          {/* Sparkling Heart */}
          {showLetter && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 2, duration: 1 }}
              className="mt-10 text-5xl hover:animate-spin cursor-pointer"
            >
              🌟❤️
            </motion.div>
          )}

          {/* Moonlight Romantic Ending */}
          {showLetter && (
            <>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 3, duration: 1 }}
                className="mt-6 text-xl text-pink-900 italic"
              >
                🌙 Under this moon... just smile and say, "I’m yours, Raaz." 💍
              </motion.p>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 4, duration: 1.2 }}
                className="mt-10 text-2xl font-bold bg-gradient-to-r from-red-500 via-pink-500 to-purple-600 bg-clip-text text-transparent"
              >
                🌈 I Promise... I'll Keep Making You Smile, Forever 💫
              </motion.p>
            </>
          )}
        </motion.div>
      )}
    </main>
  );
}
