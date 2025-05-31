'use client';

import { useEffect } from 'react';
import { auth } from '@/firebase/config';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import logo from './logo.png'; // ✅ Adjust the path if needed

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const doLogout = async () => {
      await signOut(auth);
      await fetch('/api/logout', { method: 'POST' });
      router.push('/login');
    };
    doLogout();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md flex flex-col items-center text-center animate-fadeIn">
        <Image src={logo} alt="App Logo" width={60} height={60} className="mb-4" />
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Logging you out</h2>
        <p className="text-sm text-gray-500 mb-4">Please wait a moment...</p>
        <Loader2 className="animate-spin text-blue-600 w-6 h-6" />
      </div>
    </div>
  );
}
