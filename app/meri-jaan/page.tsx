// Romantic Love Page with Password Protection ❤️

'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const SECRET_PASSWORD = 'raaz@123';

const images = [
  { src: '/photos/1.jpeg', caption: '🌹 Jab tum aaye... zindagi mehka di ❤️' },
  { src: '/photos/2.jpg', caption: '💫 Tumhara saath... meri har khushi ka raaz hai 💕' },
  { src: '/photos/3.jpg', caption: '🥰 Tumhara hasna... meri jaan ki muskaan hai ✨' },
  { src: '/photos/4.jpg', caption: '👩‍❤️‍👨 Tum ho... toh har din pyara hai 💖' },
];

const loveNote = `Meri Jaan... 💖
AAP sirf meri mohabbat nahi ho... tum meri har subah 🌅 ka noor ho, meri har raat 🌙 ka sukoon ho. Tumhari muskaan 😊 meri rooh tak utar jaati hai, jaise khushbu kisi phool 🌸 mein basa ho. Jab tum meri taraf dekhti ho 👀, toh meri duniya ruk jaati hai 🛑... aur jab tum hasta ho 😄, toh meri zindagi phir se chal padti hai 💓. Tum roti ho 😢 toh meri raaton ki neend ud jaati hai 🌧️, aur tumhari khushi meri jeet ban jaati hai 🏆. Tumse sirf pyaar nahi, ibadat karta hoon 🙏... har dua mein sirf tumhara naam hota hai 💌. Zindagi ke har pal mein, har saans mein... bas tum hi tum ho 🫶. Tum meri duniya ho, mera raaz ho, meri har heartbeat ka sabse khoobsurat ehsaas ho 💖. Tum mujhe kabool ho, har janam ke liye 💍.`;

export default function LoveSecretPage() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [index, setIndex] = useState(0);
  const [replay, setReplay] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (isUnlocked) {
      if (!audioRef.current) {
        const audio = new Audio('/music.mp3');
        audio.loop = true;
        audio.volume = 0.4;
        audio.play().catch(() => {});
        audioRef.current = audio;
      }

      const timer = setInterval(() => {
        setIndex((prev) => {
          if (prev === images.length - 1) {
            clearInterval(timer);
            return prev;
          }
          return prev + 1;
        });
      }, 5000);

      return () => clearInterval(timer);
    }
  }, [isUnlocked, replay]);

  const handleUnlock = () => {
    if (input === SECRET_PASSWORD) {
      setIsUnlocked(true);
    } else {
      setError('Galat password meri jaan 🥺');
    }
  };

  const resetSlideshow = () => {
    setIndex(0);
    setReplay(!replay);
  };

  if (!isUnlocked) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-6 text-center font-mono">
        <h1 className="text-4xl font-bold mb-6 animate-pulse text-red-500">🔐 Secret Love Vault</h1>
        <input
          type="password"
          placeholder="Enter Secret Password..."
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setError('');
          }}
          className="px-4 py-2 text-black rounded-md border border-gray-300 shadow-md mb-3 w-72"
        />
        <button
          onClick={handleUnlock}
          className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-full shadow-lg"
        >
          Unlock ❤️
        </button>
        {error && <p className="mt-4 text-red-400">{error}</p>}
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-red-200 via-red-300 to-red-400 flex flex-col items-center justify-center text-center p-6 relative overflow-hidden text-red-900 font-serif">
      <div className="absolute inset-0 pointer-events-none z-0 opacity-40">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute text-2xl animate-bounce"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          >
            {['❤️', '💋', '🌹', '💖', '🔥'][i % 5]}
          </div>
        ))}
      </div>

      <div className="absolute inset-0 pointer-events-none z-0">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1.5 h-1.5 bg-white rounded-full opacity-70 animate-ping"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDuration: `${2 + Math.random() * 3}s`,
              animationDelay: `${Math.random()}s`,
            }}
          />
        ))}
      </div>

      <h1 className="text-4xl font-bold mb-4 animate-pulse">Meri Pyaari Jaan ❤️</h1>
      <p className="text-red-700 text-sm mb-2 animate-bounce">🎶 Romantic music playing...</p>

      <div className="relative w-[300px] h-[300px] md:w-[400px] md:h-[400px] rounded-xl overflow-hidden shadow-2xl border-4 border-red-300 bg-white z-10">
        <AnimatePresence mode="wait">
          <motion.img
            key={images[index].src}
            src={images[index].src}
            alt={`photo-${index}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.8 }}
            className="w-full h-full object-cover"
          />
        </AnimatePresence>
      </div>

      <motion.p
        key={index}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="mt-4 text-lg md:text-xl font-medium max-w-md"
      >
        {images[index].caption}
      </motion.p>

      {index === images.length - 1 && (
        <>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1 }}
            className="mt-8 text-2xl font-bold text-red-900"
          >
            💍 Tum meri duniya ho... shaadi karogi na?
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 1.2 }}
            className="mt-6 bg-white bg-opacity-80 text-red-800 p-4 rounded-lg shadow-xl max-w-lg text-left text-sm sm:text-base"
          >
            <pre className="whitespace-pre-line font-serif">{loveNote}</pre>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.8, duration: 1.5 }}
            className="mt-6 italic text-red-900 text-lg"
          >
            🌙 "Main tumhara hoon... hamesha. Tum bas muskurana mat chhodna." 💫
          </motion.p>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={resetSlideshow}
            className="mt-6 bg-red-600 text-white px-6 py-2 rounded-full shadow-md hover:bg-red-700"
          >
            🔁 Phir se dekhna hai ❤️
          </motion.button>
        </>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3 }}
        className="absolute bottom-5 text-xl font-bold text-red-600 animate-pulse"
      >
        ❤️ I love you... I love you... I love you... 🫀
      </motion.div>
    </main>
  );
}
