// 🌸 Meli Jaan's Ultimate Birthday Surprise 💋
// Full Romantic Vibe Combo Edition 🎉🎂✨ + Marry Me Ending + Kiss Game 💋🎮

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

const SECRET_PASSWORD = 'raaz@123';

const memories = [
  { text: '💖 Pehli baar jab Aap mili thi, dil ne bola — "Bas yehi meli Jaan hai!"', img: '/photos/1.jpeg' },
  { text: '🌸 Aaapki hasi mere din ki shuruaat hai ☀️', img: '/photos/2.jpg' },
  { text: '💫 Aap mele life ka sabse beautiful part ho 💕', img: '/photos/3.jpg' },
];

const romanticPhotos = ['/photos/romantic1.jpg', '/photos/romantic2.jpg', '/photos/romantic3.jpg'];

const flirtMessages = [
  "Uff! AApki smile to mela battery recharge kar deti hai 🔋💞",
  "Babu! Aapki aankhon mein galaxy hai 💫",
  "Shona, AAp meli coffee ho ☕ — bina Aapki subah adhoori lagti hai 😘",
  "AApko dekh kar dil ne bola – 'ummmmmaaaah 💋'",
  "Cutiepie 🍓, Aap meri zindagi ki sabse pyaali chapter ho 💖",
  "Aapke bina dil bore ho jata hai 😢, Aapke saath dil dance kare 💃🕺",
];

const cuteNames = [" Boo Boo 💕", "Cutiepie 🧁", "Deepu Baby 💋", "Sweetu 🍓", "SweetHeart 🌸"];

export default function BirthdaySurprise() {
  const [step, setStep] = useState(0);
  const [passwordInput, setPasswordInput] = useState('');
  const [error, setError] = useState('');
  const [bgMusic, setBgMusic] = useState<HTMLAudioElement | null>(null);
  const [flirtMsgIndex, setFlirtMsgIndex] = useState(0);
  const [nicknameIndex, setNicknameIndex] = useState(0);
  const [showLetter, setShowLetter] = useState(false);
  const [kissesCaught, setKissesCaught] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);

  // cute name loop
  useEffect(() => {
    const interval = setInterval(() => {
      setNicknameIndex((prev) => (prev + 1) % cuteNames.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Background music
  useEffect(() => {
  if (step > 0 && !bgMusic) {
    const music = new Audio('/romantic.mp3');
    music.loop = true;
    music.volume = 0.3;
    music.play().catch(() => {});
    setBgMusic(music); // ✅ TypeScript ab accept karega
  }
}, [step, bgMusic]);

  // floating hearts animation
  useEffect(() => {
    if (step > 0) {
      const heartInterval = setInterval(() => {
        const heart = document.createElement('div');
        heart.innerText = '💖';
        heart.className = 'absolute text-2xl';
        heart.style.left = Math.random() * 100 + 'vw';
        heart.style.top = '100vh';
        heart.style.animation = `floatUp ${3 + Math.random() * 2}s linear forwards`;
        document.body.appendChild(heart);
        setTimeout(() => heart.remove(), 5000);
      }, 800);
      return () => clearInterval(heartInterval);
    }
  }, [step]);

  const playSound = (path: string) => {
  try {
    const audio = new Audio(path);
    audio.volume = 0.6;
    audio.play().catch(() => {});
  } catch {}
};

  const handleUnlock = () => {
    if (passwordInput === SECRET_PASSWORD) {
      setStep(1);
      confetti({ particleCount: 120, spread: 90, origin: { y: 0.6 } });
      playSound('/kiss.mp3');
    } else {
      setError('Galat password meri jaan 🥺');
    }
  };

  const handleNextStep = () => setStep(step + 1);

  // Kiss Catching Game logic
  useEffect(() => {
    if (gameStarted) {
      const gameInterval = setInterval(() => {
        const kiss = document.createElement('div');
        kiss.innerText = '💋';
        kiss.className = 'absolute text-3xl cursor-pointer';
        kiss.style.left = Math.random() * 80 + 'vw';
        kiss.style.top = Math.random() * 80 + 'vh';
        kiss.onclick = () => {
          setKissesCaught((prev) => prev + 1);
          playSound('/kiss.mp3');
          kiss.remove();
        };
        document.body.appendChild(kiss);
        setTimeout(() => kiss.remove(), 3000);
      }, 800);
      return () => clearInterval(gameInterval);
    }
  }, [gameStarted]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pink-200 via-pink-300 to-pink-400 p-4 font-serif text-center overflow-hidden relative">
      <style>{`
        @keyframes floatUp {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(-100vh) scale(0.8); opacity: 0; }
        }
      `}</style>

      {/* Step 0: Lock Screen */}
      {step === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-md p-6 bg-white rounded-xl shadow-lg">
          <h1 className="text-3xl font-bold text-red-600 mb-4 animate-pulse">🔐 Meli {cuteNames[nicknameIndex]} ka Secret ❤️</h1>
          <p className="text-sm mb-4">Password daalo meri jaan aur apni dreamy duniya unlock karo 😘</p>
          <input
            type="password"
            placeholder="Enter Secret Password..."
            value={passwordInput}
            onChange={(e) => {
              setPasswordInput(e.target.value);
              setError('');
            }}
            className="w-full px-4 py-2 mb-3 border rounded-md"
          />
          <button onClick={handleUnlock} className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-full font-bold">
            Unlock ❤️
          </button>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </motion.div>
      )}

      {/* Step 1: Greeting */}
      {step === 1 && (
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-md p-6 bg-white rounded-xl shadow-lg">
          <h2 className="text-3xl font-bold text-pink-600 mb-4">🎂 Happy Birthday {cuteNames[nicknameIndex]} 💋</h2>
          <p className="text-lg">Tum meri zindagi ka sabse khoobsurat gift ho 🎁</p>
          <button onClick={handleNextStep} className="mt-4 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-full font-semibold">
            Chalo memories dekhe meri jaan 💞
          </button>
        </motion.div>
      )}

      {/* Step 2: Memories */}
      {step === 2 && (
        <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-full max-w-md p-4 bg-white rounded-xl shadow-lg overflow-y-auto max-h-[60vh]">
          <h2 className="text-xl font-bold text-pink-600 mb-4">Hamari Yaadein 🥰</h2>
          {memories.map((mem, idx) => (
            <div key={idx} className="mb-4">
              <img src={mem.img} alt={`memory-${idx}`} className="w-full h-32 object-cover rounded-md mb-2" />
              <p className="text-sm text-red-700">{mem.text}</p>
            </div>
          ))}
          <button onClick={handleNextStep} className="mt-2 bg-pink-600 hover:bg-pink-700 text-white py-2 px-4 rounded-full font-semibold">
            Romantic Photos dekhe 💋
          </button>
        </motion.div>
      )}

      {/* Step 3: Romantic Photos */}
      {step === 3 && (
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-md p-4 bg-white rounded-xl shadow-lg overflow-x-auto flex space-x-4">
          {romanticPhotos.map((photo, idx) => (
            <img key={idx} src={photo} alt={`romantic-${idx}`} className="w-32 h-32 object-cover rounded-lg cursor-pointer" />
          ))}
          <button onClick={handleNextStep} className="absolute bottom-10 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-full font-semibold">
            Aao flirty mood me chalein 😜
          </button>
        </motion.div>
      )}

      {/* Step 4: Flirty Messages */}
      {step === 4 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-md p-6 bg-white rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold text-pink-600 mb-4">Flirty Time 😘</h2>
          <p className="text-lg mb-4">{flirtMessages[flirtMsgIndex]}</p>
          <button
            onClick={() => setFlirtMsgIndex((flirtMsgIndex + 1) % flirtMessages.length)}
            className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-full font-semibold"
          >
            Next 😍
          </button>
          <button onClick={() => setShowLetter(true)} className="ml-3 bg-pink-500 hover:bg-pink-600 text-white py-2 px-4 rounded-full font-semibold">
            Read Love Letter 💌
          </button>
          <button onClick={handleNextStep} className="block mx-auto mt-4 bg-pink-600 hover:bg-pink-700 text-white py-2 px-4 rounded-full font-semibold">
            💍 Proposal Time 💞
          </button>
        </motion.div>
      )}

      {/* Love Letter Modal */}
      {showLetter && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md text-left relative">
            <h3 className="text-2xl font-bold text-red-600 mb-3">💌 Meri Pyari Jaan ke Naam 💋</h3>
            <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
              {`Meli Jaan,\n\nJabse Aap meli life me aayi ho, sab kuch beautiful lagta hai. 💫  
Aap meli muskaan ho, mela sukoon ho, meli khushi ho 💖  
Aapke bina duniya adhuri lagti hai…  
Aapka naam sunte hi dil kehta hai — ummmmmmaaaah 💋💋\n\nForever yours,\nAapka pagal 😘💋💋`}
            </p>
            <button onClick={() => setShowLetter(false)} className="mt-4 bg-pink-600 hover:bg-pink-700 text-white py-2 px-4 rounded-full font-semibold">
              Close 💞
            </button>
          </div>
        </motion.div>
      )}

      {/* Step 5: Proposal */}
      {step === 5 && (
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-md p-6 bg-white rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold text-red-600 mb-4">💖 Meli Jaan…</h2>
          <p className="mb-4">Aap meli duniya ho, meli life ka best decision ho 🥺💞</p>
          <h3 className="text-xl font-bold mb-2">Will you marry me? 💍</h3>
          <button
            onClick={() => {
              confetti({ particleCount: 300, spread: 120, origin: { y: 0.6 } });
              playSound('/kiss.mp3');
              setGameStarted(true);
              setStep(6);
            }}
            className="bg-pink-600 hover:bg-pink-700 text-white py-2 px-4 rounded-full font-bold animate-bounce"
          >
            YES 💖
          </button>
        </motion.div>
      )}

      {/* Step 6: Mini Kiss Game */}
      {step === 6 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-md p-6 bg-white rounded-xl shadow-lg text-center">
          <h2 className="text-3xl font-bold text-pink-600 mb-2">💋 Kiss Catch Game 🎮</h2>
          <p className="mb-2">Catch the flying kisses and show your love! 💞</p>
          <p className="text-lg mb-4">Kisses Caught: <strong>{kissesCaught}</strong> 💋</p>
          {kissesCaught >= 10 && (
            <button
              onClick={() => {
                setGameStarted(false);
                playSound('/kiss.mp3');
                confetti({ particleCount: 400, spread: 150, origin: { y: 0.6 } });
                setStep(7);
              }}
              className="mt-4 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-full font-bold"
            >
              Finish Game 💖
            </button>
          )}
        </motion.div>
      )}

      {/* Step 7: Final Romantic Ending */}
      {step === 7 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-md p-6 bg-white rounded-xl shadow-lg text-center">
          <h2 className="text-3xl font-bold text-pink-600 mb-4">🎉 Forever Together 💞</h2>
          <p className="mb-4">Ab se har birthday hum saath manayenge 💍💋</p>
          <p className="text-lg font-semibold animate-pulse">“Ummmmmmmaaaahhhhh 💋💋💋”</p>
            <button onClick={handleNextStep} className="absolute bottom-10 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-full font-semibold">
            Ab hamali memories 😜
          </button>
        </motion.div>
      )}
      {/* Step 8: Personal Memories */}
{step === 8 && (
  <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-full max-w-md p-4 bg-white rounded-xl shadow-lg overflow-y-auto max-h-[60vh]">
    <h2 className="text-xl font-bold text-pink-600 mb-4">Special Memories 💖</h2>
    {[
      { text: 'Pehli date ka din – yaad hai jab ham achool me chhupke mile the kinna sukoon bhara pal tha na meli boo boo 🌸', img: '/photos/mem1.jpg' },
      { text: 'gift jo Aapne  mujhe diya tha 🎁', img: '/photos/mem2.jpg' },
      { text: 'Hamala room me milne ka sukoon bhara pal , aap mere liye behad spacial ho mele betu ,i love u so much meli cute si princess💋💋💋 🏖️', img: '/photos/mem3.jpg' },
    ].map((mem, idx) => (
      <div key={idx} className="mb-4">
        <img src={mem.img} alt={`personal-memory-${idx}`} className="w-full h-32 object-cover rounded-md mb-2" />
        <p className="text-sm text-red-700">{mem.text}</p>
      </div>
    ))}
    <button onClick={() => setStep(7)} className="mt-2 bg-pink-600 hover:bg-pink-700 text-white py-2 px-4 rounded-full font-semibold">
      Back to Final Ending 💞
    </button>
  </motion.div>
)}

      
    </main>
  );
}
