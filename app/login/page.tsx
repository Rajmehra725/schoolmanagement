'use client';
import { useState } from 'react';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { auth, db, googleProvider } from '@/firebase/config';
import { Eye, EyeOff, LogIn, Loader2, UserPlus } from 'lucide-react';
import logo from "./logo.png"

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    if (!email.includes('@') || password.length < 6) {
      setError('Enter a valid email and password (min 6 chars)');
      return false;
    }
    return true;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validateForm()) return;

    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid;
      const userDoc = await getDoc(doc(db, 'users', userId));
      const role = userDoc.data()?.role;

      if (role === 'student') router.push('/dashboard/student');
      else if (role === 'teacher') router.push('/dashboard/teacher');
      else if (role === 'admin') router.push('/dashboard/admin');
      else setError('Role not assigned. Contact admin.');
    } catch (err) {
      setError('Invalid credentials or user not found.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Check if user doc exists
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          email: user.email,
          role: 'student', // Default role, or based on logic
        });
      }

      const role = (await getDoc(userRef)).data()?.role;

      if (role === 'student') router.push('/dashboard/student');
      else if (role === 'teacher') router.push('/dashboard/teacher');
      else if (role === 'admin') router.push('/dashboard/admin');
      else setError('Role not assigned. Contact admin.');
    } catch (err) {
      setError('Google login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Panel */}
      <div className="hidden md:flex flex-col justify-center items-center w-full md:w-1/2 bg-gradient-to-br from-blue-700 via-blue-500 to-indigo-600 text-white px-10 py-12 animate-slideInLeft">
          <Image src={logo} alt="EduPanel Logo" width={50} height={50} />
        <h1 className="text-4xl font-bold mb-2 text-center">Raaz School Management</h1>
        <p className="text-lg text-center max-w-md">
          Smart & Secure Dashboard for Students, Teachers, and Admins.
        </p>
      </div>

      {/* Login Form */}
      <div className="flex flex-col justify-center items-center w-full md:w-1/2 bg-gray-100 px-6 py-12 animate-fadeIn">
        <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md">
          <h2 className="text-3xl font-bold text-center text-blue-700 mb-6">Welcome Back</h2>
          {error && <p className="text-red-600 text-center mb-4">{error}</p>}
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg"
              required
            />
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-500"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex justify-center items-center gap-2"
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <LogIn size={18} />}
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="flex justify-between mt-4 text-sm text-blue-600 font-medium">
            <button onClick={() => router.push('/signup')} className="hover:underline flex items-center gap-1">
              <UserPlus size={14} /> Sign Up
            </button>
            <button onClick={() => router.push('/forgot-password')} className="hover:underline">
              Forgot Password?
            </button>
          </div>

          <div className="my-4 flex items-center gap-2">
            <div className="h-px flex-1 bg-gray-300" />
            <span className="text-gray-400 text-sm">or</span>
            <div className="h-px flex-1 bg-gray-300" />
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full border border-gray-300 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-100 transition"
          >
            <img src="/google.svg" alt="Google" className="w-5 h-5" />
            <span className="text-sm font-medium">Continue with Google</span>
          </button>
        </div>
      </div>
    </div>
  );
}
