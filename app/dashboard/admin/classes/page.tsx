'use client';

import { useEffect, useState } from 'react';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/config';

interface ClassData {
  id: string;
  name: string;
  section: string;
}

export default function ClassesPage() {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [newClass, setNewClass] = useState({ name: '', section: '' });

  const fetchClasses = async () => {
    const snapshot = await getDocs(collection(db, 'classes'));
    const classList: ClassData[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ClassData[];
    setClasses(classList);
  };

  const handleAddClass = async () => {
    if (!newClass.name || !newClass.section) return;
    await addDoc(collection(db, 'classes'), newClass);
    setNewClass({ name: '', section: '' });
    fetchClasses();
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Manage Classes</h2>
      <div className="mb-6 space-y-2">
        <input
          type="text"
          placeholder="Class Name"
          value={newClass.name}
          onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
          className="border p-2 w-full rounded"
        />
        <input
          type="text"
          placeholder="Section"
          value={newClass.section}
          onChange={(e) => setNewClass({ ...newClass, section: e.target.value })}
          className="border p-2 w-full rounded"
        />
        <button
          onClick={handleAddClass}
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          Add Class
        </button>
      </div>
      <ul className="space-y-2">
        {classes.map((cls) => (
          <li key={cls.id} className="border p-4 rounded shadow">
            <strong>{cls.name}</strong> - Section {cls.section}
          </li>
        ))}
      </ul>
    </div>
  );
}
