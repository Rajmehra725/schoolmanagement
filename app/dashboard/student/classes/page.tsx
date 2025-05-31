'use client'

import { useEffect, useState } from 'react';
import { db } from '@/firebase/config';
import { collection, getDocs } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export default function ClassesPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        setError(null);
        const querySnapshot = await getDocs(collection(db, 'classes'));
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setClasses(data);
      } catch {
        setError('Failed to load classes. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, []);

 const filteredClasses = classes.filter(cls =>
  (cls.name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
  (cls.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold mb-6 text-center text-indigo-700">Your Classes</h1>

      <input
        type="text"
        placeholder="Search classes..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        className="mb-6 w-full max-w-md mx-auto p-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin h-10 w-10 text-indigo-600" />
        </div>
      ) : error ? (
        <p className="text-center text-red-600">{error}</p>
      ) : filteredClasses.length === 0 ? (
        <p className="text-center text-gray-500">No classes found.</p>
      ) : (
        <ul className="space-y-6 max-w-3xl mx-auto">
          {filteredClasses.map(cls => (
            <motion.li
              key={cls.id}
              whileHover={{ scale: 1.03, boxShadow: "0 10px 15px rgba(0,0,0,0.1)" }}
              className="p-6 bg-white rounded-xl shadow-md cursor-pointer transition"
              tabIndex={0}
              role="button"
              aria-label={`View details for ${cls.name}`}
              onClick={() => alert(`Clicked on class: ${cls.name}`)}
              onKeyDown={e => { if (e.key === 'Enter') alert(`Clicked on class: ${cls.name}`); }}
            >
              <h2 className="text-xl font-semibold text-indigo-800">{cls.name}</h2>
              <p className="mt-2 text-gray-600">{cls.description}</p>
            </motion.li>
          ))}
        </ul>
      )}
    </motion.div>
  );
}
