'use client';

import { useEffect, useState } from 'react';
import { collection,query, where, addDoc, getDocs, Timestamp, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';

interface AttendanceRecord {
  [date: string]: string;
}

interface Student {
  id: string;
  name: string;
  fatherName: string;
  attendance?: AttendanceRecord;
}

interface Teacher {
  id: string;
  name: string;
  attendance?: AttendanceRecord;
}

export default function AttendancePage() {
  const [tab, setTab] = useState<'students' | 'teachers'>('students');
  const [classes, setClasses] = useState<string[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [newStudent, setNewStudent] = useState({ name: '', fatherName: '' });
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [loadingStudents, setLoadingStudents] = useState(false);

  const predefinedClasses = [
    'KG1', 'KG2', '1st', '2nd', '3rd', '4th', '5th', '6th',
    '7th', '8th', '9th', '10th', '11th', '12th'
  ];

  const getMonthDates = (month: number): string[] => {
    const today = new Date();
    const year = today.getFullYear();
    const dateCount = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: dateCount }, (_, i) => new Date(year, month, i + 1).toISOString().split('T')[0]);
  };

  const fetchStudents = async () => {
  if (!selectedClass) return;

  const studentsQuery = query(
    collection(db, 'students'),
    where('class', '==', selectedClass)
  );

  const snapshot = await getDocs(studentsQuery);
  const list: Student[] = snapshot.docs.map(doc => ({
    id: doc.id,
    ...(doc.data() as any)
  }));

  setStudents(list);
};

  const fetchTeachers = async () => {
    const snapshot = await getDocs(collection(db, 'teachers'));
    const list: Teacher[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as any)
    }));
    setTeachers(list);
  };

  const handleAddStudent = async () => {
    if (!newStudent.name || !newStudent.fatherName || !selectedClass) return;
    const docRef = doc(collection(db, `classes/${selectedClass}/students`));
    await setDoc(docRef, {
      name: newStudent.name,
      fatherName: newStudent.fatherName,
      attendance: {}
    });
    setNewStudent({ name: '', fatherName: '' });
    fetchStudents();
  };

  const handleDeleteStudent = async (id: string) => {
  await deleteDoc(doc(db, `students/${id}`));
  fetchStudents();
};


 const toggleAttendance = async (studentId: string, date: string) => {
  const student = students.find(s => s.id === studentId);
  if (!student) return;

  const newStatus = student.attendance?.[date] === 'P' ? 'A' : 'P';
  const updatedAttendance = { ...student.attendance, [date]: newStatus };

  await updateDoc(doc(db, `students/${studentId}`), {
    attendance: updatedAttendance
  });

  fetchStudents(); // refresh list
};


  const toggleTeacherAttendance = async (teacherId: string, date: string) => {
    const teacher = teachers.find(t => t.id === teacherId);
    if (!teacher) return;
    const newStatus = teacher.attendance?.[date] === 'P' ? 'A' : 'P';
    const updatedAttendance = { ...teacher.attendance, [date]: newStatus };
    await updateDoc(doc(db, `teachers/${teacherId}`), {
      attendance: updatedAttendance
    });
    fetchTeachers();
  };

  useEffect(() => {
    setClasses(predefinedClasses);
    if (predefinedClasses.length > 0) {
      setSelectedClass(predefinedClasses[0]); // Auto-select KG1 or first class
    }
  }, []);


  useEffect(() => {
    if (selectedClass) fetchStudents();
  }, [selectedClass]);

  useEffect(() => {
    if (tab === 'teachers') fetchTeachers();
  }, [tab]);

  const monthDates = getMonthDates(selectedMonth);

  return (
    <div className="p-6 max-w-full mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-center">Attendance Management</h2>

      <div className="flex space-x-4 mb-6 justify-center">
        <button onClick={() => setTab('students')} className={`px-4 py-2 rounded ${tab === 'students' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Students</button>
        <button onClick={() => setTab('teachers')} className={`px-4 py-2 rounded ${tab === 'teachers' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Teachers</button>
      </div>
      {tab === 'students' && (
        <>
          <div className="mb-4">
            <h3 className="text-xl font-semibold mb-2">Select Class</h3>
            <div className="flex flex-wrap gap-2">
              {predefinedClasses.map(cls => (
                <button
                  key={cls}
                  onClick={() => setSelectedClass(cls)}
                  className={`px-3 py-1 rounded ${selectedClass === cls ? 'bg-green-600 text-white' : 'bg-gray-300 hover:bg-gray-400'}`}
                >
                  {cls}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block mb-2 font-semibold">Select Month</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="border p-2 rounded"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i} value={i}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
              ))}
            </select>
          </div>

          {selectedClass && (
            <>
             
              {loadingStudents ? (
                <div className="text-center text-gray-500">Loading students...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border text-sm">
                    <thead className="bg-gray-200">
                      <tr>
                        <th className="border p-2">Name</th>
                        <th className="border p-2">Father's Name</th>
                        {monthDates.map(date => (
                          <th key={date} className="border p-1 text-xs whitespace-nowrap">{date.split('-')[2]}</th>
                        ))}
                        <th className="border p-2">Total P</th>
                        <th className="border p-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student) => {
                        const totalPresent = monthDates.reduce((acc, date) => student.attendance?.[date] === 'P' ? acc + 1 : acc, 0);
                        return (
                          <tr key={student.id} className="hover:bg-gray-50">
                            <td className="border p-2 whitespace-nowrap font-medium text-gray-800">{student.name}</td>
                            <td className="border p-2 whitespace-nowrap text-gray-600">{student.fatherName}</td>
                            {monthDates.map(date => (
                              <td key={date} className="border p-1 text-center cursor-pointer text-sm" onClick={() => toggleAttendance(student.id, date)}>
                                <span className={`inline-block w-5 h-5 rounded-full ${student.attendance?.[date] === 'P' ? 'bg-green-500 text-white' : 'bg-red-400 text-white'}`}>
                                  {student.attendance?.[date] || 'A'}
                                </span>
                              </td>
                            ))}
                            <td className="border p-2 text-center font-bold text-green-700">{totalPresent}</td>
                            <td className="border p-2">
                              <button onClick={() => handleDeleteStudent(student.id)} className="text-red-600 hover:underline">Delete</button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </>
      )}

      {tab === 'teachers' && (
        <div>
          <h3 className="text-xl font-semibold mb-4 text-center">Teachers Monthly Attendance</h3>
          <div className="mb-4 text-center">
            <label className="block mb-2 font-semibold">Select Month</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="border p-2 rounded"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i} value={i}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border text-sm">
              <thead className="bg-gray-200">
                <tr>
                  <th className="border p-2">Name</th>
                  {monthDates.map(date => (
                    <th key={date} className="border p-1 text-xs whitespace-nowrap">{date.split('-')[2]}</th>
                  ))}
                  <th className="border p-2">Total P</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map((teacher) => {
                  const totalPresent = monthDates.reduce((acc, date) => teacher.attendance?.[date] === 'P' ? acc + 1 : acc, 0);
                  return (
                    <tr key={teacher.id} className="hover:bg-gray-50">
                      <td className="border p-2 whitespace-nowrap font-medium text-gray-800">{teacher.name}</td>
                      {monthDates.map(date => (
                        <td
                          key={date}
                          className="border p-1 text-center cursor-pointer text-sm"
                          onClick={() => toggleTeacherAttendance(teacher.id, date)}
                        >
                          <span className={`inline-block w-5 h-5 rounded-full ${teacher.attendance?.[date] === 'P' ? 'bg-green-500 text-white' : 'bg-red-400 text-white'}`}>
                            {teacher.attendance?.[date] || 'A'}
                          </span>
                        </td>
                      ))}
                      <td className="border p-2 text-center font-bold text-green-700">{totalPresent}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
