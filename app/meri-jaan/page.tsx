'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { db } from '@/firebase/config';
import { addDoc, collection, onSnapshot } from 'firebase/firestore';
import { useTypewriter } from 'react-simple-typewriter';
import Smile from './images/smile.jpeg';

const sections = ['start', 'story', 'reasons', 'letter', 'proposal'];

export default function MeriJaan() {
  const [sectionIndex, setSectionIndex] = useState(0);
  const [musicStarted, setMusicStarted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [allMessages, setAllMessages] = useState([]);

  const [text] = useTypewriter({
    words: [
      'Tum meri zindagi ka wo hissa ho jo kabhi replace nahi ho sakta...',
      'Tumhara hasna, baat karna mere dil ke bahut kareeb hai...',
      'Zindagi ke har mod par tum mere saath chalo... ❤️',
    ],
    loop: true,
    delaySpeed: 2000,
  });

  const startMusic = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio('/music.mp3');
      audioRef.current.loop = true;
    }

    audioRef.current
      .play()
      .then(() => {
        setMusicStarted(true);
      })
      .catch((err) => {
        console.error('🔇 Audio play failed:', err);
        alert("Tap/click again if audio didn't start 🔁");
      });
  };

  const next = () => {
    if (sectionIndex < sections.length - 1) setSectionIndex(sectionIndex + 1);
  };

  const prev = () => {
    if (sectionIndex > 0) setSectionIndex(sectionIndex - 1);
  };

  const handleSubmit = async () => {
    if (message.trim()) {
      await addDoc(collection(db, 'loveMessages'), {
        message,
        createdAt: new Date().toISOString(),
      });
      setSubmitted(true);
    }
  };

  const transition = {
    initial: { opacity: 0, y: 50 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -50 },
    transition: { duration: 0.6 },
  };

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'loveMessages'), (snapshot) => {
      const msgs: any = [];
      snapshot.forEach((doc) => msgs.push(doc.data()));
      setAllMessages(msgs.reverse());
    });
    return () => unsub();
  }, []);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center text-center bg-gradient-to-br from-pink-100 via-pink-200 to-pink-300 text-pink-800 p-4 font-serif overflow-hidden">
      {!musicStarted ? (
        <div>
          <h1 className="text-4xl font-bold mb-4">Ready to Begin? 💖</h1>
          <button
            onClick={startMusic}
            className="bg-pink-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-pink-700 text-xl"
          >
            Start Our Love Story 💌
          </button>
        </div>
      ) : (
        <>
          <AnimatePresence mode="wait">
            <motion.div
              key={sections[sectionIndex]}
              {...transition}
              className="max-w-xl"
            >
              {sectionIndex === 0 && (
                <>
                  <h1 className="text-4xl md:text-6xl font-bold mb-4">Meri Jaan ❤️</h1>
                  <p className="text-xl italic">"Ek kahani tumse shuru hoti hai..."</p>
                  <Image
                    src={Smile}
                    width={200}
                    height={200}
                    alt="her"
                    className="rounded-full mx-auto my-6 shadow-xl"
                  />
                </>
              )}

            {sectionIndex === 1 && (
  <>
     <motion.div
                    className="space-y-6 text-left leading-relaxed"
                    initial="hidden"
                    animate="visible"
                    variants={{
                      hidden: {},
                      visible: {
                        transition: {
                          staggerChildren: 0.3,
                        },
                      },
                    }}
                  >
                    {["🏫 सब कुछ शुरू हुआ स्कूल से... जब मैंने आपको पहली बार August के महीने में देखा था — वो पल आज भी मेरी आँखों में जिंदा है।",
                      "💬 फिर 10/10/2024 यानी Jaan ke birthday के दिन हमारी पहली बात हुई — और उसी दिन से ज़िन्दगी कुछ और ही हो गई।",
                      "💞 धीरे-धीरे हम एक-दूसरे के इतने करीब आ गए कि आपकी मुस्कान ही मेरी दुनिया बन गई।",
                      "🤗 वो पहली मुलाकात, पहला hug, वो पहली नज़दीकी — जैसे हर सपना हकीकत बन रहा हो।",
                      "💋 जब पहली बार हमारी नज़रें मिली और होंठ छुए — उस पल जैसे वक़्त थम गया था।",
                      "📱 रोज़ की बातें, सुबह से रात तक — अब तो आपकी आवाज़ के बिना दिन अधूरा लगता है।",
                      "🫶 अब हाल ऐसा है कि एक पल भी आपसे दूर रहना मुश्किल हो गया है।",
                      "🌹हमारी कहानी आज भी चल रही है... और तब तक चलती रहेगी जब तक ये धड़कनें चल रही हैं।",
                      "✨ और हां, तुम्हारी हर बात में एक जादू है — जो हर रोज़ मुझे और तुम्हारे प्यार में डुबोता है।",
                      "🌌 तुमसे मिलना जैसे किसी अधूरी दुआ का पूरा हो जाना है।",
                      "❤️ तुम्हारे साथ हर पल में एक फिल्म चलती है — जिसमें सिर्फ हम दोनों होते हैं।"
                    ].map((line, i) => (
                      <motion.p
                        key={i}
                        className="text-lg"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: i * 0.1 }}
                      >
                        {line}
                      </motion.p>
                    ))}
                  </motion.div>
  </>
)}

              {sectionIndex === 2 && (
  <>
    <h2 className="text-3xl font-semibold mb-4">
      Why I Love You <span className="inline-block animate-heartBeat">❤️</span>
    </h2>
    <ul className="grid grid-cols-1 gap-4 text-left">
      <li>🌸 आपकी मुस्कान — जो हर दिन को रौशन कर देती है</li>
      <li>🎵 आपकी आवाज़ — जिसे सुनकर दिल को सुकून मिलता है</li>
      <li>💖 आपका ख्याल रखने का अंदाज़ — जो मुझे खास महसूस कराता है</li>
      <li>🧠 आपकी समझदारी — जो हर मुश्किल को आसान बना देती है</li>
      <li>🤗 आपका प्यार — जो हर दर्द का इलाज है</li>
      <li>✨ आपकी आंखों की मासूमियत — जिसमें दुनिया की सबसे प्यारी कहानी छिपी है</li>
      <li>🌈 आपका साथ — जो हर पल को जादू बना देता है</li>
      <li>🔥 आपका गुस्सा भी — जो सच्चे प्यार की निशानी है</li>
      <li>💌 आपका हर छोटा सा मैसेज — जो दिन भर मुस्कुराने की वजह बन जाता है</li>
      <li>🌻 आप जैसे हैं — बस वही मुझे सबसे ज़्यादा पसंद है</li>
    </ul>
  </>
)}


              {sectionIndex === 3 && (
                <>
                  <h2 className="text-3xl font-semibold mb-4">Ek Chitthi Tumhare Naam ✍️</h2>
                  <p className="text-lg italic text-pink-700">{text}</p>
                </>
              )}

              {sectionIndex === 4 && (
                <>
                  <h2 className="text-4xl font-bold mb-4 animate-pulse">Will You Marry Me? 💍</h2>
                  <p className="text-lg mb-6 italic">Mujhe zindagi bhar ka partner mil gaya hai — kya tum meri banogi?</p>

                  {!submitted ? (
                    <>
                      <textarea
                        placeholder="Apni baat yahaan likho... 💬"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full p-3 border-2 border-pink-300 rounded-lg mb-4"
                        rows={3}
                      ></textarea>
                      <button
                        onClick={handleSubmit}
                        className="bg-pink-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-pink-700 text-xl"
                      >
                        Yes, I will ❤️
                      </button>
                    </>
                  ) : (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1, rotate: 360 }}
                      className="text-5xl mt-6"
                    >
                     I Love you so Much SweetHeart Meli Jaan Mela Bachcha💖💍
                    </motion.div>
                  )}
                </>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-between mt-10 w-full max-w-xs">
            <button
              onClick={prev}
              disabled={sectionIndex === 0}
              className="text-pink-600 font-semibold"
            >
              ⬅️ Peeche
            </button>
            <button
              onClick={next}
              disabled={sectionIndex === sections.length - 1}
              className="text-pink-600 font-semibold"
            >
              Aage ➡️
            </button>
          </div>
        </>
      )}
    </main>
  );
}
