'use client';

import { useEffect, useState } from 'react';
import { collection, addDoc, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';

interface AttendanceData {
  id: string;
  studentName: string;
  status: string;
  date: string;
}

export default function AttendancePage() {
  const [attendanceList, setAttendanceList] = useState<AttendanceData[]>([]);
  const [form, setForm] = useState({ studentName: '', status: 'present' });

  const fetchAttendance = async () => {
    const snapshot = await getDocs(collection(db, 'attendance'));
    const list: AttendanceData[] = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        studentName: data.studentName,
        status: data.status,
        date: data.date?.toDate().toLocaleDateString() || ''
      };
    });
    setAttendanceList(list);
  };

  const handleAddAttendance = async () => {
    if (!form.studentName) return;
    await addDoc(collection(db, 'attendance'), {
      studentName: form.studentName,
      status: form.status,
      date: Timestamp.now()
    });
    setForm({ studentName: '', status: 'present' });
    fetchAttendance();
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Attendance Records</h2>
      <div className="mb-6 space-y-2">
        <input
          type="text"
          placeholder="Student Name"
          value={form.studentName}
          onChange={(e) => setForm({ ...form, studentName: e.target.value })}
          className="border p-2 w-full rounded"
        />
        <select
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value })}
          className="border p-2 w-full rounded"
        >
          <option value="present">Present</option>
          <option value="absent">Absent</option>
        </select>
        <button
          onClick={handleAddAttendance}
          className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
        >
          Add Attendance
        </button>
      </div>
      <ul className="space-y-2">
        {attendanceList.map((att) => (
          <li key={att.id} className="border p-4 rounded shadow">
            <strong>{att.studentName}</strong> - {att.status} on {att.date}
          </li>
        ))}
      </ul>
    </div>
  );
}
