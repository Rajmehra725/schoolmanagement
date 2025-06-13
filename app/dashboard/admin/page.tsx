'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { db } from '@/firebase/config';
import {
  collection,
  getCountFromServer,
  getDocs,
  query,
  orderBy,
  limit,
  onSnapshot,
} from 'firebase/firestore';
import {
  FaUserGraduate,
  FaChalkboardTeacher,
  FaTrophy,
  FaSchool,
  FaRegCalendarAlt,
  FaBell,
  FaClipboardList,
} from 'react-icons/fa';
import { HiOutlineUserAdd } from 'react-icons/hi';

interface Student {
  id: string;
  name: string;
  class: string;
  email: string;
  dob: string;
  fatherName: string;
  address: string;
  aadhar: string;
}

export default function PrincipalDashboard() {
  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    classes: 0,
    achievements: 0,
    events: 0,
  });
  const [notices, setNotices] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [attendanceToday, setAttendanceToday] = useState({ present: 0, absent: 0 });
  const [birthdaysToday, setBirthdaysToday] = useState<Student[]>([]);

  useEffect(() => {
    const fetchCounts = async () => {
      const [studentsSnap, teachersSnap, classesSnap, achievementsSnap, eventsSnap] = await Promise.all([
        getCountFromServer(collection(db, 'students')),
        getCountFromServer(collection(db, 'teachers')),
        getCountFromServer(collection(db, 'classes')),
        getCountFromServer(collection(db, 'achievements')),
        getCountFromServer(collection(db, 'events')),
      ]);

      setStats({
        students: studentsSnap.data().count,
        teachers: teachersSnap.data().count,
        classes: classesSnap.data().count,
        achievements: achievementsSnap.data().count,
        events: eventsSnap.data().count,
      });

      const noticeQuery = query(collection(db, 'notices'), orderBy('timestamp', 'desc'), limit(5));
      const noticeSnap = await getDocs(noticeQuery);
      setNotices(noticeSnap.docs.map((doc) => doc.data().title));
    };

    const unsub = onSnapshot(collection(db, 'students'), (snap) => {
      const list = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Student));
      setStudents(list);
    });

    fetchCounts();
    return () => unsub();
  }, []);

  useEffect(() => {
    const fetchAttendance = async () => {
      const snap = await getDocs(collection(db, 'attendance'));
      const today = new Date().toISOString().slice(0, 10);
      let present = 0;
      let absent = 0;
      snap.docs.forEach((doc) => {
        const data = doc.data();
        if (data.date === today) {
          if (data.status === 'Present') present++;
          else absent++;
        }
      });
      setAttendanceToday({ present, absent });
    };

    fetchAttendance();
  }, []);

  useEffect(() => {
    const today = new Date().toISOString().slice(5, 10); // MM-DD
    const todayBirthdays = students.filter((s) => s.dob?.slice(5, 10) === today);
    setBirthdaysToday(todayBirthdays);
  }, [students]);

  const filteredStudents = students.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 space-y-10 animate-fadeIn">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-orange-600">Welcome, Principal 👨‍🏫</h1>
        <p className="text-gray-600 mt-2 text-lg">School management insights and controls</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Students" count={stats.students} icon={<FaUserGraduate />} color="bg-blue-100" />
        <StatCard title="Teachers" count={stats.teachers} icon={<FaChalkboardTeacher />} color="bg-green-100" />
        <StatCard title="Classes" count={stats.classes} icon={<FaSchool />} color="bg-yellow-100" />
        <StatCard title="Achievements" count={stats.achievements} icon={<FaTrophy />} color="bg-purple-100" />
        <StatCard title="Events" count={stats.events} icon={<FaRegCalendarAlt />} color="bg-pink-100" />
        <StatCard title="Notices" count={notices.length} icon={<FaBell />} color="bg-red-100" />
        <StatCard title="Present Today" count={attendanceToday.present} icon={<FaClipboardList />} color="bg-green-100" />
        <StatCard title="Absent Today" count={attendanceToday.absent} icon={<FaClipboardList />} color="bg-red-100" />
      </div>

      {/* 🔍 Search + User List */}
      <div>
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Search Students</h2>
        <input
          type="text"
          placeholder="Search by name..."
          className="border p-2 rounded w-full max-w-md mb-4"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredStudents.map((student) => (
            <div
              key={student.id}
              className="bg-white shadow rounded p-4 hover:bg-gray-100 cursor-pointer"
              onClick={() => setSelectedStudent(student)}
            >
              <h3 className="font-bold">{student.name}</h3>
              <p className="text-sm">Class: {student.class}</p>
              <p className="text-sm">Email: {student.email}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 🎯 Top Performing Students */}
      <div>
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Top Performing Students</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {students.slice(0, 3).map((s) => (
            <div key={s.id} className="bg-white shadow p-4 rounded">
              <h3 className="font-bold">{s.name}</h3>
              <p>Class: {s.class}</p>
              <p>🏆 Excellent performance</p>
            </div>
          ))}
        </div>
      </div>

      {/* 🎂 Birthdays Today */}
      <div>
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">🎂 Birthdays Today</h2>
        {birthdaysToday.length > 0 ? (
          <ul className="list-disc ml-6 text-gray-700">
            {birthdaysToday.map((s) => (
              <li key={s.id}>{s.name} (Class: {s.class})</li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No birthdays today</p>
        )}
      </div>

      {/* 🧾 Student Detail Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full relative shadow-lg">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-black text-xl"
              onClick={() => setSelectedStudent(null)}
            >
              ✕
            </button>
            <h3 className="text-xl font-bold mb-4">Student Details</h3>
            <ul className="text-sm space-y-1">
              <li><strong>Name:</strong> {selectedStudent.name}</li>
              <li><strong>Class:</strong> {selectedStudent.class}</li>
              <li><strong>Email:</strong> {selectedStudent.email}</li>
              <li><strong>DOB:</strong> {selectedStudent.dob}</li>
              <li><strong>Father's Name:</strong> {selectedStudent.fatherName}</li>
              <li><strong>Address:</strong> {selectedStudent.address}</li>
              <li><strong>Aadhar:</strong> {selectedStudent.aadhar}</li>
            </ul>
          </div>
        </div>
      )}

      {/* ⚡ Quick Actions */}
      <div>
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <ActionButton icon={<HiOutlineUserAdd />} label="Add Student" color="bg-orange-500" href="/add-student" />
          <ActionButton icon={<FaClipboardList />} label="Add Notice" color="bg-blue-600" href="/add-notice" />
          <ActionButton icon={<FaTrophy />} label="Add Achievement" color="bg-purple-600" href="/add-achievement" />
          <ActionButton icon={<FaRegCalendarAlt />} label="Schedule Event" color="bg-green-600" href="/add-event" />
        </div>
      </div>

      {/* 📢 Latest Notices */}
      <div>
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Latest Notices</h2>
        <ul className="list-disc ml-6 space-y-2 text-gray-700">
          {notices.length > 0 ? (
            notices.map((notice, idx) => <li key={idx}>📌 {notice}</li>)
          ) : (
            <li>No recent notices</li>
          )}
        </ul>
      </div>
    </div>
  );
}

// Reusable Components
function StatCard({ title, count, icon, color }: { title: string; count: number; icon: JSX.Element; color: string }) {
  return (
    <div className={`p-6 rounded-lg shadow ${color} flex items-center gap-4`}>
      <div className="text-3xl text-gray-700">{icon}</div>
      <div>
        <h3 className="text-lg font-medium text-gray-800">{title}</h3>
        <p className="text-2xl font-bold text-gray-900">{count}</p>
      </div>
    </div>
  );
}

function ActionButton({
  icon,
  label,
  color,
  href,
}: {
  icon: JSX.Element;
  label: string;
  color: string;
  href: string;
}) {
  return (
    <Link href={href}>
      <div
        className={`${color} hover:brightness-110 cursor-pointer text-white px-6 py-3 rounded-lg flex items-center gap-2 shadow`}
      >
        {icon}
        {label}
      </div>
    </Link>
  );
}
