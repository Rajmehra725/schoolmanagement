'use client';

import { useEffect, useState } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, where } from 'firebase/firestore';
import { db } from '@/firebase/config';

interface ClassData {
  id: string;
  name: string;
  section: string;
  classTeacher: string;
  numberOfStudents: number;
  academicYear: string;
  subjects?: string[];
}

export default function ClassesPage() {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [newClass, setNewClass] = useState({
    name: '',
    section: '',
    classTeacher: '',
    numberOfStudents: '',
    academicYear: '',
    subjects: '',
  });
  const [filterYear, setFilterYear] = useState('');
  const [filterSection, setFilterSection] = useState('');
  const [editingClassId, setEditingClassId] = useState<string | null>(null);

  const fetchClasses = async () => {
    let classQuery = collection(db, 'classes');
    let q = query(classQuery);

    if (filterYear) q = query(classQuery, where('academicYear', '==', filterYear));
    if (filterSection) q = query(classQuery, where('section', '==', filterSection));

    const snapshot = await getDocs(q);
    const classList: ClassData[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as ClassData[];
    setClasses(classList);
  };

  const handleAddOrUpdateClass = async () => {
    const {
      name,
      section,
      classTeacher,
      numberOfStudents,
      academicYear,
      subjects,
    } = newClass;

    if (!name || !section || !classTeacher || !numberOfStudents || !academicYear) return;

    const classData = {
      name,
      section,
      classTeacher,
      numberOfStudents: Number(numberOfStudents),
      academicYear,
      subjects: subjects ? subjects.split(',').map((s) => s.trim()) : [],
    };

    if (editingClassId) {
      await updateDoc(doc(db, 'classes', editingClassId), classData);
      setEditingClassId(null);
    } else {
      await addDoc(collection(db, 'classes'), classData);
    }

    setNewClass({ name: '', section: '', classTeacher: '', numberOfStudents: '', academicYear: '', subjects: '' });
    fetchClasses();
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, 'classes', id));
    fetchClasses();
  };

  const handleEdit = (cls: ClassData) => {
    setNewClass({
      name: cls.name,
      section: cls.section,
      classTeacher: cls.classTeacher,
      numberOfStudents: cls.numberOfStudents.toString(),
      academicYear: cls.academicYear,
      subjects: cls.subjects?.join(', ') || '',
    });
    setEditingClassId(cls.id);
  };

  useEffect(() => {
    fetchClasses();
  }, [filterYear, filterSection]);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-center">Admin: Class Management</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <input type="text" placeholder="Filter by Year" value={filterYear} onChange={(e) => setFilterYear(e.target.value)} className="border p-2 rounded" />
        <input type="text" placeholder="Filter by Section" value={filterSection} onChange={(e) => setFilterSection(e.target.value)} className="border p-2 rounded" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <input type="text" placeholder="Class Name" value={newClass.name} onChange={(e) => setNewClass({ ...newClass, name: e.target.value })} className="border p-2 rounded" />
        <input type="text" placeholder="Section" value={newClass.section} onChange={(e) => setNewClass({ ...newClass, section: e.target.value })} className="border p-2 rounded" />
        <input type="text" placeholder="Class Teacher" value={newClass.classTeacher} onChange={(e) => setNewClass({ ...newClass, classTeacher: e.target.value })} className="border p-2 rounded" />
        <input type="number" placeholder="No. of Students" value={newClass.numberOfStudents} onChange={(e) => setNewClass({ ...newClass, numberOfStudents: e.target.value })} className="border p-2 rounded" />
        <input type="text" placeholder="Academic Year" value={newClass.academicYear} onChange={(e) => setNewClass({ ...newClass, academicYear: e.target.value })} className="border p-2 rounded" />
        <input type="text" placeholder="Subjects (comma-separated)" value={newClass.subjects} onChange={(e) => setNewClass({ ...newClass, subjects: e.target.value })} className="border p-2 rounded" />
      </div>

      <button onClick={handleAddOrUpdateClass} className="bg-blue-600 text-white py-2 px-6 rounded hover:bg-blue-700">
        {editingClassId ? 'Update Class' : 'Add Class'}
      </button>

      <ul className="mt-10 space-y-4">
        {classes.map((cls) => (
          <li key={cls.id} className="border p-4 rounded shadow bg-white hover:bg-gray-50">
            <div className="flex justify-between">
              <div>
                <h3 className="text-lg font-bold">{cls.name} - Section {cls.section}</h3>
                <p>Teacher: {cls.classTeacher}</p>
                <p>Students: {cls.numberOfStudents}</p>
                <p>Year: {cls.academicYear}</p>
                <p>Subjects: {cls.subjects?.join(', ')}</p>
              </div>
              <div className="space-x-2">
                <button onClick={() => handleEdit(cls)} className="text-blue-600 hover:underline">Edit</button>
                <button onClick={() => handleDelete(cls.id)} className="text-red-600 hover:underline">Delete</button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
