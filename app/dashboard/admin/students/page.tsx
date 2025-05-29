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
import { useRouter } from 'next/navigation';

interface Student {
    id: string;
    name: string;
    email: string;
    role?: string;
    class?: string;
    fatherName?: string;
    mobile?: string;
    photoUrl?: string | null;
}

export default function StudentsPage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [formData, setFormData] = useState<Omit<Student, 'id'>>({
        name: '',
        email: '',
        role: '',
        class: '',
        fatherName: '',
        mobile: '',
        photoUrl: '',
    });

    const router = useRouter();

    const fetchStudents = async () => {
        try {
            const studentsQuery = collection(db, 'students');
            const querySnapshot = await getDocs(studentsQuery);

            const studentData = querySnapshot.docs.map((doc) => {
                const data = doc.data() as Omit<Student, 'id'> & { photoUrl?: string | null };
                return {
                    id: doc.id,
                    ...data,
                    photoUrl: data.photoUrl ?? undefined,
                };
            });

            setStudents(studentData);
        } catch (error) {
            console.error('Error fetching students:', error);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this student?')) return;

        try {
            await deleteDoc(doc(db, 'students', id));
            setSelectedStudent(null);
            fetchStudents();
        } catch (error) {
            console.error('Failed to delete student:', error);
        }
    };

    const handleUpdate = async () => {
        if (!selectedStudent) return;

        try {
            const studentRef = doc(db, 'students', selectedStudent.id);
            await updateDoc(studentRef, {
                name: selectedStudent.name,
                email: selectedStudent.email,
                role: selectedStudent.role ?? '',
                class: selectedStudent.class ?? '',
                fatherName: selectedStudent.fatherName ?? '',
                mobile: selectedStudent.mobile ?? '',
                photoUrl: selectedStudent.photoUrl ?? '',
            });
            fetchStudents();
            alert('Student updated successfully');
        } catch (error) {
            console.error('Failed to update student:', error);
        }
    };

    const handleAddStudent = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await addDoc(collection(db, 'students'), formData);
            setFormData({
                name: '',
                email: '',
                role: '',
                class: '',
                fatherName: '',
                mobile: '',
                photoUrl: '',
            });
            setShowAddForm(false);
            fetchStudents();
            alert('Student added successfully');
        } catch (error) {
            console.error('Failed to add student:', error);
        }
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-blue-700">All Registered Students</h1>

            <button
                onClick={() => setShowAddForm(true)}
                className="mb-6 px-5 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow-md"
            >
                Add New Student
            </button>

            {showAddForm && (
                <form
                    onSubmit={handleAddStudent}
                    className="mb-8 p-6 bg-white rounded-xl shadow-lg max-w-xl mx-auto"
                >
                    <h2 className="text-2xl font-semibold mb-6 border-b pb-2">Add Student</h2>

                    {[ 
                        { label: 'Name', name: 'name', type: 'text' },
                        { label: 'Email', name: 'email', type: 'email' },
                        { label: 'Role', name: 'role', type: 'text' },
                        { label: 'Class', name: 'class', type: 'text' },
                        { label: "Father's Name", name: 'fatherName', type: 'text' },
                        { label: 'Mobile', name: 'mobile', type: 'tel' },
                        { label: 'Photo URL', name: 'photoUrl', type: 'url' },
                    ].map(({ label, name, type }) => (
                        <div key={name} className="mb-4">
                            <label className="block mb-1 font-medium text-gray-700">{label}</label>
                            <input
                                type={type}
                                name={name}
                                value={(formData as any)[name]}
                                onChange={(e) =>
                                    setFormData({ ...formData, [name]: e.target.value })
                                }
                                className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required={name === 'name' || name === 'email'}
                            />
                        </div>
                    ))}

                    <div className="flex gap-4 justify-end mt-6">
                        <button
                            type="submit"
                            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow"
                        >
                            Create
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowAddForm(false)}
                            className="px-5 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition shadow"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            {students.length === 0 ? (
                <p className="text-gray-600 text-center mt-10">No students found.</p>
            ) : (
                <ul
                    className="space-y-5 max-h-[600px] overflow-y-auto px-4 py-2 bg-white rounded-xl shadow-lg border border-gray-200"
                    style={{ scrollbarWidth: 'thin' }}
                >
                    {students.map((student) => (
                        <li
                            key={student.id}
                            className="p-4 flex items-center gap-4 border border-gray-100 rounded-lg shadow-sm hover:shadow-lg cursor-pointer transition"
                            onClick={() => setSelectedStudent(student)}
                        >
                            {student.photoUrl ? (
                                <img
                                    src={student.photoUrl}
                                    alt={`${student.name} Photo`}
                                    className="w-16 h-16 rounded-full object-cover border-2 border-blue-500"
                                    onError={(e) => {
                                        (e.currentTarget as HTMLImageElement).src =
                                            '/default-avatar.png'; // fallback image
                                    }}
                                />
                            ) : (
                                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-semibold text-lg border-2 border-gray-300">
                                    N/A
                                </div>
                            )}
                            <div className="flex flex-col">
                                <p className="font-semibold text-lg text-gray-800">{student.name}</p>
                                <p className="text-sm text-gray-600">Email: {student.email}</p>
                                <p className="text-sm text-gray-600">
                                    Father's Name: {student.fatherName || 'N/A'}
                                </p>
                                <p className="text-sm text-gray-600">Mobile: {student.mobile || 'N/A'}</p>
                                <p className="text-sm text-gray-600">Class: {student.class || 'N/A'}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {selectedStudent && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
                    onClick={() => setSelectedStudent(null)}
                >
                    <div
                        className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto relative shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setSelectedStudent(null)}
                            className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 font-bold text-2xl leading-none"
                            aria-label="Close"
                        >
                            &times;
                        </button>

                        <div className="flex flex-col items-center gap-5 mb-6">
                            {selectedStudent.photoUrl ? (
                                <img
                                    src={selectedStudent.photoUrl}
                                    alt={`${selectedStudent.name} Photo`}
                                    className="w-28 h-28 rounded-full object-cover border-4 border-blue-600"
                                    onError={(e) => {
                                        (e.currentTarget as HTMLImageElement).src = '/default-avatar.png';
                                    }}
                                />
                            ) : (
                                <div className="w-28 h-28 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xl font-semibold border-4 border-gray-300">
                                    N/A
                                </div>
                            )}
                            <h2 className="text-3xl font-bold text-gray-900">Edit Student</h2>
                        </div>

                        <div className="space-y-5">
                            {[
                                { label: 'Name', key: 'name', type: 'text' },
                                { label: 'Email', key: 'email', type: 'email' },
                                { label: 'Role', key: 'role', type: 'text' },
                                { label: 'Class', key: 'class', type: 'text' },
                                { label: "Father's Name", key: 'fatherName', type: 'text' },
                                { label: 'Mobile', key: 'mobile', type: 'tel' },
                                { label: 'Photo URL', key: 'photoUrl', type: 'url' },
                            ].map(({ label, key, type }) => (
                                <div key={key}>
                                    <label className="block font-semibold mb-2 text-gray-700">{label}</label>
                                    <input
                                        type={type}
                                        value={(selectedStudent as any)[key] ?? ''}
                                        onChange={(e) =>
                                            setSelectedStudent({
                                                ...selectedStudent,
                                                [key]: e.target.value,
                                            } as Student)
                                        }
                                        className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 flex justify-end gap-4">
                            <button
                                onClick={handleUpdate}
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-md"
                            >
                                Update
                            </button>
                            <button
                                onClick={() => selectedStudent && handleDelete(selectedStudent.id)}
                                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition shadow-md"
                            >
                                Delete
                            </button>
                            <button
                                onClick={() => setSelectedStudent(null)}
                                className="px-6 py-3 bg-gray-300 rounded-lg hover:bg-gray-400 transition shadow-md"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
