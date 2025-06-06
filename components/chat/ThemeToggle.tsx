'use client';

import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  return (
    <button
      className="p-2 text-white bg-white/10 rounded-full hover:bg-white/20 transition"
      onClick={() => setDark((prev) => !prev)}
    >
      {dark ? <Sun /> : <Moon />}
    </button>
  );
}
