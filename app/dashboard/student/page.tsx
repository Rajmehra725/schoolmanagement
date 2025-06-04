'use client';

import { useEffect, useState } from 'react';
import { auth, db } from '@/firebase/config';
import { doc, getDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { updatePassword, updateEmail } from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';

export default function StudentDashboard() {
  const [userData, setUserData] = useState<any>(null);
  const [tab, setTab] = useState<'personal' | 'results' | 'settings'>('personal');
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [results, setResults] = useState<Record<string, any>[]>([]);
  const [emailUpdate, setEmailUpdate] = useState('');
  const [passwordUpdate, setPasswordUpdate] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const docRef = doc(db, 'students', user.uid);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        const data = snapshot.data();
        setUserData(data);
        setFormData({
          phone: data.phone || '',
          address: data.address || '',
          dob: data.dob || '',
          class: data.class || '',
          fatherName: data.fatherName || '',
          name: data.name || '',
        });
      }
    };

    const fetchResults = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const resultsRef = collection(db, 'students', user.uid, 'results');
      const snapshot = await getDocs(resultsRef);
      const resultsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setResults(resultsData);
    };

    fetchUser();
    fetchResults();
  }, []);

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) return;

    await updateDoc(doc(db, 'students', user.uid), formData);
    setUserData((prev: any) => ({ ...prev, ...formData }));
    setEditMode(false);
  };

  const handleEmailPasswordUpdate = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      if (emailUpdate) await updateEmail(user, emailUpdate);
      if (passwordUpdate) await updatePassword(user, passwordUpdate);
      alert('Updated successfully');
    } catch (error: any) {
      alert(error.message);
    }
  };

  if (!userData) return <p className="text-center mt-10 animate-pulse text-gray-500">Loading...</p>;

  return (
    <div className="p-4 w-full text-gray-800">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center space-x-6 mb-6"
      >
        <img
          src={userData.photoUrl || ''}
          alt="Profile"
          className="w-24 h-24 rounded-full border-4 border-purple-300 shadow-lg object-cover"
        />
        <div>
          <h1 className="text-3xl font-bold text-purple-700">Student Dashboard</h1>
          <p className="text-sm text-gray-600">📧 {userData.email}</p>
          <p className="text-sm text-gray-500">🎓 Role: {userData.role}</p>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex space-x-6 mb-6 border-b pb-2">
        {['personal', 'results', 'settings'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t as any)}
            className={`pb-2 font-semibold capitalize transition-all duration-200 ${
              tab === t ? 'border-b-2 border-purple-600 text-purple-700' : 'text-gray-500 hover:text-purple-500'
            }`}
          >
            {t === 'personal' ? 'Personal Info' : t === 'results' ? 'Results' : 'Account Settings'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow p-6 overflow-hidden">
        <AnimatePresence mode="wait">
          {tab === 'personal' && (
            <motion.div
              key="personal"
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ duration: 0.4 }}
            >
              <div className="flex justify-between mb-4">
                <h2 className="text-xl font-semibold">Personal Information</h2>
                <button
                  onClick={() => setEditMode(!editMode)}
                  className="text-sm text-purple-600 hover:underline"
                >
                  {editMode ? 'Cancel' : 'Edit'}
                </button>
              </div>

              {editMode ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {['name', 'fatherName', 'phone', 'address', 'dob', 'class'].map((field) => (
                    <div key={field}>
                      <label className="block text-sm font-medium mb-1 capitalize">
                        {field.replace(/([A-Z])/g, ' $1')}:
                      </label>
                      <input
                        type={field === 'dob' ? 'date' : 'text'}
                        value={formData[field] || ''}
                        onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                        className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-300"
                      />
                    </div>
                  ))}
                  <div className="md:col-span-2">
                    <button
                      onClick={handleSave}
                      className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700 transition-all"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <ul className="space-y-2 text-sm">
                  <li><strong>Name:</strong> {userData.name || 'N/A'}</li>
                  <li><strong>Father's Name:</strong> {userData.fatherName || 'N/A'}</li>
                  <li><strong>Email:</strong> {userData.email || 'N/A'}</li>
                  <li><strong>Phone:</strong> {userData.mobile || 'N/A'}</li>
                  <li><strong>Address:</strong> {userData.address || 'N/A'}</li>
                  <li><strong>Date of Birth:</strong> {userData.dob || 'N/A'}</li>
                  <li><strong>Class:</strong> {userData.class || 'N/A'}</li>
                </ul>
              )}
            </motion.div>
          )}

          {tab === 'results' && (
            <motion.div
              key="results"
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ duration: 0.4 }}
            >
              <h2 className="text-xl font-semibold mb-4">Results</h2>
              {results.length > 0 ? (
                results.map((term) => (
                  <div key={term.id} className="mb-4">
                    <h3 className="text-purple-700 font-bold">{term.id}</h3>
                    <ul className="list-disc ml-6">
                      {Object.entries(term)
                        .filter(([key]) => key !== 'id')
                        .map(([subject, mark]) => (
                          <li key={subject}>
                            <strong>{subject}:</strong> {String(mark)}
                          </li>
                        ))}
                    </ul>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-600">No results found.</p>
              )}
            </motion.div>
          )}

          {tab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ duration: 0.4 }}
            >
              <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium">New Email:</label>
                  <input
                    type="email"
                    value={emailUpdate}
                    onChange={(e) => setEmailUpdate(e.target.value)}
                    className="w-full border px-3 py-2 rounded focus:ring-purple-300 focus:ring-2 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">New Password:</label>
                  <input
                    type="password"
                    value={passwordUpdate}
                    onChange={(e) => setPasswordUpdate(e.target.value)}
                    className="w-full border px-3 py-2 rounded focus:ring-purple-300 focus:ring-2 outline-none"
                  />
                </div>
                <button
                  onClick={handleEmailPasswordUpdate}
                  className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700 transition"
                >
                  Update
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
