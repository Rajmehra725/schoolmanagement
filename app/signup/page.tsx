'use client';

import { useEffect, useState } from 'react';
import { db } from '@/firebase/config';
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
  addDoc,
} from 'firebase/firestore';

interface Teacher {
  id: string;
  name: string;
  email: string;
  department?: string;
  phone?: string;
  photoUrl?: string;
}

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<Omit<Teacher, 'id'>>({
    name: '',
    email: '',
    department: '',
    phone: '',
    photoUrl: '',
  });

  const fetchTeachers = async () => {
    try {
      const teachersQuery = collection(db, 'teachers');
      const querySnapshot = await getDocs(teachersQuery);
      const teacherData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Teacher, 'id'>),
      }));
      setTeachers(teacherData);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this teacher?')) return;
    try {
      await deleteDoc(doc(db, 'teachers', id));
      setSelectedTeacher(null);
      fetchTeachers();
    } catch (error) {
      console.error('Failed to delete teacher:', error);
    }
  };

  const handleUpdate = async () => {
    if (!selectedTeacher) return;
    try {
      const teacherRef = doc(db, 'teachers', selectedTeacher.id);
      await updateDoc(teacherRef, {
        name: selectedTeacher.name,
        email: selectedTeacher.email,
        department: selectedTeacher.department ?? '',
        phone: selectedTeacher.phone ?? '',
        photoUrl: selectedTeacher.photoUrl ?? '',
      });
      fetchTeachers();
      alert('Teacher updated successfully');
    } catch (error) {
      console.error('Failed to update teacher:', error);
    }
  };

  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'teachers'), {
        name: formData.name,
        email: formData.email,
        department: formData.department ?? '',
        phone: formData.phone ?? '',
        photoUrl: formData.photoUrl ?? '',
      });
      setFormData({ name: '', email: '', department: '', phone: '', photoUrl: '' });
      setShowAddForm(false);
      fetchTeachers();
      alert('Teacher added successfully');
    } catch (error) {
      console.error('Failed to add teacher:', error);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-blue-700">All Registered Teachers</h1>

      <button
        onClick={() => setShowAddForm(true)}
        className="mb-6 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
      >
        Add New Teacher
      </button>

      {showAddForm && (
        <form onSubmit={handleAddTeacher} className="mb-8 p-6 bg-white rounded shadow max-w-xl">
          <h2 className="text-xl font-semibold mb-4">Add Teacher</h2>
          {[{ label: 'Name', name: 'name', type: 'text' }, { label: 'Email', name: 'email', type: 'email' }, { label: 'Department', name: 'department', type: 'text' }, { label: 'Phone', name: 'phone', type: 'tel' }, { label: 'Photo URL', name: 'photoUrl', type: 'url' }].map(({ label, name, type }) => (
            <div key={name} className="mb-3">
              <label className="block mb-1 font-medium">{label}</label>
              <input
                type={type}
                name={name}
                value={(formData as any)[name]}
                onChange={(e) => setFormData({ ...formData, [name]: e.target.value })}
                className="w-full border px-3 py-2 rounded"
                required={name === 'name' || name === 'email'}
              />
            </div>
          ))}

          <div className="flex gap-3">
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
              Create
            </button>
            <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition">
              Cancel
            </button>
          </div>
        </form>
      )}

      {teachers.length === 0 ? (
        <p className="text-gray-600">No teachers found.</p>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {teachers.map((teacher) => (
            <li
              key={teacher.id}
              className="p-5 bg-white border rounded-xl shadow-sm hover:shadow-md transition cursor-pointer"
              onClick={() => setSelectedTeacher(teacher)}
            >
              <div className="flex items-center gap-4">
                {teacher.photoUrl ? (
                  <img
                    src={teacher.photoUrl}
                    alt="Teacher"
                    className="w-16 h-16 rounded-full object-cover border"
                    onError={(e) => ((e.currentTarget as HTMLImageElement).src = '/default-avatar.png')}
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                    N/A
                  </div>
                )}
                <div>
                  <p className="font-semibold text-lg">{teacher.name}</p>
                  <p className="text-sm text-gray-700">Email: {teacher.email}</p>
                  <p className="text-sm text-gray-700">Department: {teacher.department || 'N/A'}</p>
                  <p className="text-sm text-gray-700">Phone: {teacher.phone || 'N/A'}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {selectedTeacher && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-6" onClick={() => setSelectedTeacher(null)}>
          <div className="bg-white rounded-xl p-6 max-w-lg w-full relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedTeacher(null)}
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 font-bold text-xl"
              aria-label="Close"
            >
              &times;
            </button>

            <div className="flex flex-col items-center gap-4 mb-6">
              {selectedTeacher.photoUrl ? (
                <img
                  src={selectedTeacher.photoUrl}
                  alt="Teacher"
                  className="w-24 h-24 rounded-full object-cover border"
                  onError={(e) => ((e.currentTarget as HTMLImageElement).src = '/default-avatar.png')}
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xl">
                  N/A
                </div>
              )}
              <h2 className="text-2xl font-bold">Edit Teacher</h2>
            </div>

            <div className="space-y-4">
              {[{ label: 'Name', key: 'name', type: 'text' }, { label: 'Email', key: 'email', type: 'email' }, { label: 'Department', key: 'department', type: 'text' }, { label: 'Phone', key: 'phone', type: 'tel' }, { label: 'Photo URL', key: 'photoUrl', type: 'url' }].map(({ label, key, type }) => (
                <div key={key}>
                  <label className="block font-medium mb-1">{label}</label>
                  <input
                    type={type}
                    value={(selectedTeacher as any)[key] ?? ''}
                    onChange={(e) =>
                      setSelectedTeacher({
                        ...selectedTeacher,
                        [key]: e.target.value,
                      } as Teacher)
                    }
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>
              ))}
            </div>

            <div className="mt-6 flex gap-4 justify-end">
              <button onClick={handleUpdate} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                Update
              </button>
              <button onClick={() => selectedTeacher && handleDelete(selectedTeacher.id)} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition">
                Delete
              </button>
              <button onClick={() => setSelectedTeacher(null)} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
