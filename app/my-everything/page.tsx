'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

// ---------- CONFIG ----------
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

// ---------- UTILS ----------
const playAudio = (audioRef: React.MutableRefObject<HTMLAudioElement | null>, src: string, loop = false, volume = 0.6) => {
  try {
    if (!audioRef.current) audioRef.current = new Audio(src);
    audioRef.current.src = src;
    audioRef.current.loop = loop;
    audioRef.current.volume = volume;
    audioRef.current.play().catch(() => {});
  } catch {}
};

const fadeOutAudio = (audio: HTMLAudioElement | null, duration = 600) => {
  if (!audio) return;
  const step = 50;
  const times = Math.floor(duration / step);
  const volStep = audio.volume / times;
  const iv = setInterval(() => {
    if (!audio) return clearInterval(iv);
    audio.volume = Math.max(0, audio.volume - volStep);
    if (audio.volume <= 0.01) {
      audio.pause();
      audio.currentTime = 0;
      clearInterval(iv);
    }
  }, step);
};

// ---------- SMALL COMPONENTS ----------
function Typewriter({ text, speed = 45 }: { text: string; speed?: number }) {
  const [display, setDisplay] = useState('');
  useEffect(() => {
    setDisplay('');
    let i = 0;
    const id = setInterval(() => {
      setDisplay((d) => d + text[i]);
      i++;
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);
  return <span>{display}</span>;
}

// ---------- MAIN ----------
export default function MeliJaanBirthdaySurprise(): JSX.Element {
  const [step, setStep] = useState(0);
  const [passwordInput, setPasswordInput] = useState('');
  const [error, setError] = useState('');
  const [bgAudioStarted, setBgAudioStarted] = useState(false);
  const bgMusicRef = useRef<HTMLAudioElement | null>(null);
  const whisperRef = useRef<HTMLAudioElement | null>(null);
  const kissSfxRef = useRef<HTMLAudioElement | null>(null);

  const [flirtMsgIndex, setFlirtMsgIndex] = useState(0);
  const [nicknameIndex, setNicknameIndex] = useState(0);
  const [showLetter, setShowLetter] = useState(false);
  const [kissesCaught, setKissesCaught] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);

  // --- nickname rotation ---
  useEffect(() => {
    const id = setInterval(() => setNicknameIndex((p) => (p + 1) % cuteNames.length), 3000);
    return () => clearInterval(id);
  }, []);

  // --- background music start when unlocked ---
  useEffect(() => {
    if (step > 0 && !bgAudioStarted) {
      playAudio(bgMusicRef, '/romantic.mp3', true, 0.26);
      setBgAudioStarted(true);
    }
  }, [step, bgAudioStarted]);

  // --- floating hearts & cleanup (kept simple & performant) ---
  useEffect(() => {
    if (step > 0) {
      const heartInterval = setInterval(() => {
        const heart = document.createElement('div');
        heart.innerText = '💖';
        heart.className = 'absolute text-2xl pointer-events-none transform-gpu';
        heart.style.left = Math.random() * 100 + 'vw';
        heart.style.top = '100vh';
        heart.style.zIndex = '10';
        heart.style.opacity = '0.95';
        heart.style.transition = `transform ${3 + Math.random() * 2}s linear, opacity 3s linear`;
        document.body.appendChild(heart);
        requestAnimationFrame(() => (heart.style.transform = `translateY(-120vh) scale(${0.8 + Math.random() * 0.6})`));
        setTimeout(() => heart.remove(), 5000);
      }, 900);
      return () => clearInterval(heartInterval);
    }
  }, [step]);

  // --- Kiss Catching Game logic ---
  useEffect(() => {
    if (gameStarted) {
      const gameInterval = setInterval(() => {
        const kiss = document.createElement('div');
        kiss.innerText = '💋';
        kiss.className = 'absolute text-3xl cursor-pointer select-none transform-gpu';
        kiss.style.left = Math.random() * 80 + 'vw';
        kiss.style.top = Math.random() * 80 + 'vh';
        kiss.style.zIndex = '40';
        kiss.onclick = () => {
          setKissesCaught((prev) => prev + 1);
          playAudio(kissSfxRef, '/kiss.mp3', false, 0.7);
          kiss.remove();
        };
        document.body.appendChild(kiss);
        setTimeout(() => kiss.remove(), 3000);
      }, 700);
      return () => clearInterval(gameInterval);
    }
  }, [gameStarted]);

  // --- small helpers ---
  const handleUnlock = () => {
    if (passwordInput.trim() === SECRET_PASSWORD) {
      setStep(1);
      confetti({ particleCount: 120, spread: 90, origin: { y: 0.6 } });
      playAudio(kissSfxRef, '/kiss.mp3', false, 0.7);
      // gentle whisper after unlock
      setTimeout(() => playAudio(whisperRef, '/whisper.mp3', false, 0.45), 800);
    } else {
      setError('Galat password meri jaan 🥺');
    }
  };

  const nextStep = (to?: number) => setStep((s) => (typeof to === 'number' ? to : s + 1));

  // --- YES (proposal accepted) special effects ---
  const handleYes = () => {
    // cinematic: hearts + night sky + confetti + start game
    confetti({ particleCount: 300, spread: 120, origin: { y: 0.6 } });
    // heart rain
    createHeartRain(120);
    // starry background by adding class
    document.body.classList.add('meli-night-sky');
    playAudio(kissSfxRef, '/kiss.mp3', false, 0.8);
    setGameStarted(true);
    nextStep(6);
    // whisper line
    setTimeout(() => playAudio(whisperRef, '/proposal_whisper.mp3', false, 0.6), 700);
  };

  function createHeartRain(count = 80) {
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const el = document.createElement('div');
        el.innerText = '💞';
        el.style.position = 'fixed';
        el.style.left = Math.random() * 100 + 'vw';
        el.style.top = '-5vh';
        el.style.fontSize = `${12 + Math.random() * 28}px`;
        el.style.zIndex = '50';
        el.style.pointerEvents = 'none';
        el.style.opacity = '0.95';
        el.style.transition = `transform ${3 + Math.random() * 2}s linear, opacity 3.5s linear`;
        document.body.appendChild(el);
        requestAnimationFrame(() => (el.style.transform = `translateY(120vh) rotate(${Math.random() * 360}deg)`));
        setTimeout(() => el.remove(), 5000);
      }, Math.random() * 800);
    }
  }

  // Cleanup night-sky class when leaving final
  useEffect(() => {
    return () => {
      document.body.classList.remove('meli-night-sky');
      if (bgMusicRef.current) fadeOutAudio(bgMusicRef.current, 700);
      if (whisperRef.current) fadeOutAudio(whisperRef.current, 300);
    };
  }, []);

  // ---------- RENDER ----------
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pink-200 via-pink-300 to-pink-400 p-4 font-serif text-center overflow-hidden relative">
      {/* global tiny styles - starry night & glow */}
      <style>{`
        @keyframes floatUp { 0% { transform: translateY(0) scale(1); opacity: 1; } 100% { transform: translateY(-100vh) scale(0.8); opacity: 0; } }
        .meli-night-sky::before {
          content: "";
          position: fixed; inset: 0; z-index: 0; pointer-events: none;
          background: radial-gradient(ellipse at bottom, rgba(0,0,30,0.18), transparent 40%), radial-gradient(circle at 10% 20%, rgba(255,255,255,0.06), transparent 6%);
        }
        .glow { text-shadow: 0 6px 18px rgba(255,150,180,0.45), 0 1px 2px rgba(0,0,0,0.15); }
      `}</style>

      {/* Hidden audio elements refs managed via JS - but keep <audio> for accessibility fallback */}
      <audio ref={bgMusicRef as any} src="/romantic.mp3" style={{ display: 'none' }} />
      <audio ref={whisperRef as any} src="/whisper.mp3" style={{ display: 'none' }} />
      <audio ref={kissSfxRef as any} src="/kiss.mp3" style={{ display: 'none' }} />

      <AnimatePresence mode="wait">
        {/* Intro cinematic before lock screen */}
        {step === 0 && (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-2xl p-6 bg-white/70 backdrop-blur-sm rounded-2xl shadow-2xl"
          >
            <div className="p-4">
              <h1 className="text-4xl font-extrabold text-red-600 mb-3 glow">✨ Welcome to Meli Jaan's World ✨</h1>
              <p className="mb-4 text-sm text-gray-700">Aapki dreamy duniya thodi der me open hogi — type the secret and unlock the magic.</p>
              <div className="w-full bg-white rounded-xl p-4 shadow-inner">
                <p className="text-center mb-2 text-pink-600"> <Typewriter text={'Loading meli Jaan\'s magical world...'} speed={30} /> </p>
                <div className="flex gap-2 justify-center mt-3">
                  <button onClick={() => nextStep(0)} className="px-4 py-2 rounded-full bg-pink-500 text-white">Open Lock</button>
                </div>
              </div>

              {/* Lock card below */}
              <div className="mt-6 w-full max-w-md mx-auto">
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="p-6 bg-white rounded-xl shadow-lg">
                  <h2 className="text-3xl font-bold text-red-600 mb-4 animate-pulse">🔐 Meli {cuteNames[nicknameIndex]} ka Secret ❤️</h2>
                  <p className="text-sm mb-4">Password daalo meri jaan aur apni dreamy duniya unlock karo 😘</p>
                  <input
                    aria-label="secret-password"
                    type="password"
                    placeholder="Enter Secret Password..."
                    value={passwordInput}
                    onChange={(e) => { setPasswordInput(e.target.value); setError(''); }}
                    className="w-full px-4 py-2 mb-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-300"
                  />
                  <div className="flex gap-2">
                    <button onClick={handleUnlock} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-full font-bold">Unlock ❤️</button>
                  </div>
                  {error && <p className="text-red-500 mt-2">{error}</p>}
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Greeting */}
        {step === 1 && (
          <motion.div key="greet" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-md p-6 bg-white rounded-xl shadow-lg">
            <h2 className="text-3xl font-bold text-pink-600 mb-4">🎂 Happy Birthday {cuteNames[nicknameIndex]} 💋</h2>
            <p className="text-lg">Tum meri zindagi ka sabse khoobsurat gift ho 🎁</p>
            <div className="mt-4 flex gap-3 justify-center">
              <button onClick={() => nextStep(2)} className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-full font-semibold">Chalo memories dekhe 💞</button>
              <button onClick={() => { setShowLetter(true); playAudio(whisperRef, '/whisper_intro.mp3', false, 0.45); }} className="bg-pink-500 hover:bg-pink-600 text-white py-2 px-4 rounded-full">Whisper</button>
            </div>
          </motion.div>
        )}

        {/* Memories */}
        {step === 2 && (
          <motion.div key="mems" initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-md p-4 bg-white rounded-xl shadow-lg overflow-y-auto max-h-[60vh]">
            <h2 className="text-xl font-bold text-pink-600 mb-4">Hamari Yaadein 🥰</h2>
            {memories.map((mem, idx) => (
              <div key={idx} className="mb-4">
                <img src={mem.img} alt={`memory-${idx}`} className="w-full h-32 object-cover rounded-md mb-2" />
                <p className="text-sm text-red-700">{mem.text}</p>
              </div>
            ))}
            <div className="flex justify-between gap-2">
              <button onClick={() => nextStep(1)} className="mt-2 bg-gray-200 text-gray-800 py-2 px-4 rounded-full">Back</button>
              <button onClick={() => nextStep(3)} className="mt-2 bg-pink-600 hover:bg-pink-700 text-white py-2 px-4 rounded-full">Romantic Photos 💋</button>
            </div>
          </motion.div>
        )}

        {/* Romantic Photos */}
        {step === 3 && (
          <motion.div key="photos" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-2xl p-4 bg-white rounded-xl shadow-lg overflow-x-auto flex gap-4">
            {romanticPhotos.map((photo, idx) => (
              <img key={idx} src={photo} alt={`romantic-${idx}`} className="w-40 h-40 object-cover rounded-lg shadow-md transform hover:scale-105 transition" />
            ))}
            <button onClick={() => nextStep(4)} className="absolute bottom-10 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-full font-semibold">Aao flirty mood 😜</button>
          </motion.div>
        )}

        {/* Flirty Messages */}
        {step === 4 && (
          <motion.div key="flirty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-md p-6 bg-white rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold text-pink-600 mb-4">Flirty Time 😘</h2>
            <p className="text-lg mb-4">{flirtMessages[flirtMsgIndex]}</p>
            <div className="flex gap-2 justify-center">
              <button onClick={() => setFlirtMsgIndex((i) => (i + 1) % flirtMessages.length)} className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-full">Next 😍</button>
              <button onClick={() => setShowLetter(true)} className="bg-pink-500 hover:bg-pink-600 text-white py-2 px-4 rounded-full">Read Love Letter 💌</button>
            </div>
            <button onClick={() => nextStep(5)} className="block mx-auto mt-4 bg-pink-600 hover:bg-pink-700 text-white py-2 px-4 rounded-full font-semibold">💍 Proposal Time 💞</button>
          </motion.div>
        )}

        {/* Love Letter Modal */}
        {showLetter && (
          <motion.div key="letter" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md text-left relative">
              <h3 className="text-2xl font-bold text-red-600 mb-3">💌 Meri Pyari Jaan ke Naam 💋</h3>
              <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                {`Meli Jaan,\n\nJabse Aap meli life me aayi ho, sab kuch beautiful lagta hai. 💫  \nAap meli muskaan ho, mela sukoon ho, meli khushi ho 💖  \nAapke bina duniya adhuri lagti hai…  \nAapka naam sunte hi dil kehta hai — ummmmmmaaaah 💋💋\n\nForever yours,\nAapka pagal 😘💋💋`}
              </p>
              <div className="mt-4 flex gap-2 justify-end">
                <button onClick={() => setShowLetter(false)} className="bg-pink-600 hover:bg-pink-700 text-white py-2 px-4 rounded-full">Close 💞</button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Proposal */}
        {step === 5 && (
          <motion.div key="proposal" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-md p-6 bg-white rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold text-red-600 mb-4">💖 Meli Jaan…</h2>
            <p className="mb-4">Aap meli duniya ho, meli life ka best decision ho 🥺💞</p>
            <h3 className="text-xl font-bold mb-2">Will you marry me? 💍</h3>
            <div className="flex justify-center gap-4">
              <button onClick={handleYes} className="bg-pink-600 hover:bg-pink-700 text-white py-2 px-4 rounded-full font-bold animate-bounce">YES 💖</button>
              <button onClick={() => nextStep(4)} className="bg-gray-200 text-gray-800 py-2 px-4 rounded-full">Maybe</button>
            </div>
          </motion.div>
        )}

        {/* Kiss Game */}
        {step === 6 && (
          <motion.div key="game" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-md p-6 bg-white rounded-xl shadow-lg text-center">
            <h2 className="text-3xl font-bold text-pink-600 mb-2">💋 Kiss Catch Game 🎮</h2>
            <p className="mb-2">Catch the flying kisses and show your love! 💞</p>
            <p className="text-lg mb-4">Kisses Caught: <strong>{kissesCaught}</strong> 💋</p>
            <div className="flex gap-2 justify-center">
              <button onClick={() => { setKissesCaught(0); setGameStarted(true); }} className="bg-pink-500 text-white py-2 px-4 rounded-full">Start</button>
              <button onClick={() => { setGameStarted(false); }} className="bg-gray-200 py-2 px-4 rounded-full">Stop</button>
            </div>
            {kissesCaught >= 10 && (
              <button onClick={() => { setGameStarted(false); playAudio(kissSfxRef, '/kiss.mp3', false, 0.8); confetti({ particleCount: 400, spread: 150, origin: { y: 0.6 } }); nextStep(7); }} className="mt-4 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-full font-bold">Finish Game 💖</button>
            )}
          </motion.div>
        )}

        {/* Final Romantic Ending */}
        {step === 7 && (
          <motion.div key="final" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-md p-6 bg-white rounded-xl shadow-lg text-center relative">
            <h2 className="text-3xl font-bold text-pink-600 mb-4 glow">🎉 Forever Together 💞</h2>
            <p className="mb-4">Ab se har birthday hum saath manayenge 💍💋</p>
            <p className="text-lg font-semibold animate-pulse">“Ummmmmmmaaaahhhhh 💋💋💋”</p>
            <p className="mt-4 text-sm">A slow cinematic background will zoom and play a soft love melody.</p>
            <div className="mt-6 flex gap-2 justify-center">
              <button onClick={() => { fadeOutAudio(bgMusicRef.current, 800); playAudio(whisperRef, '/end_whisper.mp3', false, 0.55); nextStep(8); }} className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-full">Ab hamali memories 😜</button>
              <button onClick={() => { /* replay confetti */ confetti({ particleCount: 200, spread: 120 }); }} className="bg-pink-200 text-pink-700 py-2 px-4 rounded-full">Replay Magic</button>
            </div>
          </motion.div>
        )}

        {/* Step 8: Personal Memories */}
        {step === 8 && (
          <motion.div key="personal" initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-md p-4 bg-white rounded-xl shadow-lg overflow-y-auto max-h-[60vh]">
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
            <div className="flex gap-2 justify-between">
              <button onClick={() => setStep(7)} className="mt-2 bg-gray-200 text-gray-800 py-2 px-4 rounded-full">Back</button>
              <button onClick={() => { setStep(0); setKissesCaught(0); setGameStarted(false); document.body.classList.remove('meli-night-sky'); }} className="mt-2 bg-pink-600 hover:bg-pink-700 text-white py-2 px-4 rounded-full">Restart</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* small floating CTA on bottom-right */}
      <div className="fixed right-6 bottom-6 z-50">
        <div className="bg-white/60 backdrop-blur-sm p-2 rounded-full shadow-lg">
          <button aria-label="play-music" onClick={() => { if (bgMusicRef.current && !bgMusicRef.current.paused) { fadeOutAudio(bgMusicRef.current, 400); } else { playAudio(bgMusicRef, '/romantic.mp3', true, 0.26); } }} className="px-3 py-2 rounded-full">♪</button>
        </div>
      </div>

    </main>
  );
}
