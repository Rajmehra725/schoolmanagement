 'use client';

import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/firebase/config';
import { useRouter } from 'next/navigation';
import { Loader2, UserPlus } from 'lucide-react';

export default function SignUpPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('student');
  const [fatherName, setFatherName] = useState('');
  const [dob, setDob] = useState('');
  const [aadhar, setAadhar] = useState('');
  const [mobile, setMobile] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [address, setAddress] = useState('');
  const [className, setClassName] = useState('');
  const [qualification, setQualification] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [subject, setSubject] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    if (!name.trim() || !email.includes('@') || password.length < 6) {
      setError('Please fill all fields correctly.');
      return false;
    }
    return true;
  };

  const handleSignUp = async () => {
    setError('');
    if (!validateForm()) return;

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const commonData = {
        name,
        fatherName,
        dob,
        aadhar,
        mobile,
        email,
        photoUrl,
        address,
        uid: user.uid,
        role,
      };

      if (role === 'student') {
        await setDoc(doc(db, 'students', user.uid), {
          ...commonData,
          class: className,
        });
      } else {
        await setDoc(doc(db, 'teachers', user.uid), {
          ...commonData,
          qualification,
          resumeUrl,
          subject,
        });
      }

      // ✅ Sync to users collection for login role access
      await setDoc(doc(db, 'users', user.uid), {
        name,
        email,
        role,
      });

      alert('Signup successful!');
      router.push('/login');
    } catch (err: any) {
      setError(err.message || 'Signup failed!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-10">
      <div className="bg-white shadow-2xl rounded-xl p-8 w-full max-w-xl animate-fadeIn">
        <h2 className="text-3xl font-bold text-center text-blue-700 mb-6">Create Account</h2>

        {error && <p className="text-red-600 text-center mb-4">{error}</p>}

        {step === 1 && (
          <>
            <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full mb-4 p-3 border border-gray-300 rounded-lg bg-white">
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </select>
            <button onClick={() => setStep(2)} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition">Next</button>
          </>
        )}

        {step === 2 && (
          <>
            <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full mb-3 p-3 border border-gray-300 rounded-lg" />
            <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full mb-3 p-3 border border-gray-300 rounded-lg" />
            <input type="password" placeholder="Password (min 6 characters)" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full mb-3 p-3 border border-gray-300 rounded-lg" />
            <input type="text" placeholder="Father's Name" value={fatherName} onChange={(e) => setFatherName(e.target.value)} className="w-full mb-3 p-3 border border-gray-300 rounded-lg" />
            <input type="date" placeholder="Date of Birth" value={dob} onChange={(e) => setDob(e.target.value)} className="w-full mb-3 p-3 border border-gray-300 rounded-lg" />
            <input type="text" placeholder="Aadhar Card No." value={aadhar} onChange={(e) => setAadhar(e.target.value)} className="w-full mb-3 p-3 border border-gray-300 rounded-lg" />
            <input type="text" placeholder="Mobile No." value={mobile} onChange={(e) => setMobile(e.target.value)} className="w-full mb-3 p-3 border border-gray-300 rounded-lg" />
            <input type="text" placeholder="Photo URL" value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} className="w-full mb-3 p-3 border border-gray-300 rounded-lg" />
            <input type="text" placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full mb-3 p-3 border border-gray-300 rounded-lg" />
            <div className="flex justify-between">
              <button onClick={() => setStep(1)} className="bg-gray-300 px-4 py-2 rounded">Back</button>
              <button onClick={() => setStep(3)} className="bg-blue-600 text-white px-4 py-2 rounded">Next</button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            {role === 'student' && (
              <input type="text" placeholder="Class" value={className} onChange={(e) => setClassName(e.target.value)} className="w-full mb-3 p-3 border border-gray-300 rounded-lg" />
            )}
            {role === 'teacher' && (
              <>
                <input type="text" placeholder="Qualification" value={qualification} onChange={(e) => setQualification(e.target.value)} className="w-full mb-3 p-3 border border-gray-300 rounded-lg" />
                <input type="text" placeholder="Subject You Teach" value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full mb-3 p-3 border border-gray-300 rounded-lg" />
                <input type="text" placeholder="Resume URL" value={resumeUrl} onChange={(e) => setResumeUrl(e.target.value)} className="w-full mb-3 p-3 border border-gray-300 rounded-lg" />
              </>
            )}
            <div className="flex justify-between mb-3">
              <button onClick={() => setStep(2)} className="bg-gray-300 px-4 py-2 rounded">Back</button>
              <button onClick={handleSignUp} disabled={loading} className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2">
                {loading ? <Loader2 className="animate-spin" size={20} /> : <UserPlus size={18} />}
                {loading ? 'Signing Up...' : 'Sign Up'}
              </button>
            </div>
          </>
        )}

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <button onClick={() => router.push('/login')} className="text-blue-600 hover:underline">
            Login here
          </button>
        </p>
      </div>
    </div>
  );
}
