"use client";

import { db } from "@/firebase/config";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  getDoc,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";

interface Student {
  id: string;
  name: string;
  class: string;
}

export default function AttendancePage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [presentIds, setPresentIds] = useState<string[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("All");
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [allClasses, setAllClasses] = useState<string[]>([]);

  // Fetch students
  useEffect(() => {
    const fetchStudents = async () => {
      const snapshot = await getDocs(collection(db, "students"));
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Student[];
      setStudents(data);
      setAllClasses(["All", ...Array.from(new Set(data.map((s) => s.class)))]);
    };
    fetchStudents();
  }, []);

  // Load attendance for selected date
  useEffect(() => {
    const fetchAttendance = async () => {
      const attendanceIds: string[] = [];
      for (const student of students) {
        const docSnap = await getDoc(doc(db, "attendance", `${selectedDate}_${student.id}`));
        if (docSnap.exists() && docSnap.data().status === "Present") {
          attendanceIds.push(student.id);
        }
      }
      setPresentIds(attendanceIds);
    };
    if (students.length) fetchAttendance();
  }, [selectedDate, students]);

  const toggleAttendance = (id: string) => {
    setPresentIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const submitAttendance = async () => {
    for (const student of filteredStudents) {
      await setDoc(doc(db, "attendance", `${selectedDate}_${student.id}`), {
        studentId: student.id,
        date: selectedDate,
        status: presentIds.includes(student.id) ? "Present" : "Absent",
      });
    }
    alert("Attendance submitted!");
  };

  const markAll = (status: "Present" | "Absent") => {
    if (status === "Present") {
      setPresentIds(filteredStudents.map((s) => s.id));
    } else {
      setPresentIds([]);
    }
  };

  const filteredStudents = selectedClass === "All"
    ? students
    : students.filter((s) => s.class === selectedClass);

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">📝 Mark Attendance</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-4 items-center">
        <label className="block">
          📚 Class:
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="ml-2 px-3 py-1 border rounded"
          >
            {allClasses.map((cls) => (
              <option key={cls} value={cls}>{cls}</option>
            ))}
          </select>
        </label>

        <label className="block">
          📅 Date:
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="ml-2 px-3 py-1 border rounded"
          />
        </label>

        <div className="flex gap-2">
          <button
            onClick={() => markAll("Present")}
            className="px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Mark All Present
          </button>
          <button
            onClick={() => markAll("Absent")}
            className="px-4 py-1 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Mark All Absent
          </button>
        </div>
      </div>

      {/* Students List */}
      <ul className="space-y-2">
        {filteredStudents.map((student) => (
          <li
            key={student.id}
            className={`p-3 border rounded cursor-pointer transition-colors ${
              presentIds.includes(student.id)
                ? "bg-green-100 hover:bg-green-200"
                : "bg-red-100 hover:bg-red-200"
            }`}
            onClick={() => toggleAttendance(student.id)}
          >
            <div className="flex justify-between">
              <span>{student.name} ({student.class})</span>
              <span className="font-semibold">
                {presentIds.includes(student.id) ? "Present" : "Absent"}
              </span>
            </div>
          </li>
        ))}
      </ul>

      {/* Submit */}
      <button
        onClick={submitAttendance}
        className="mt-6 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        ✅ Submit Attendance
      </button>
    </div>
  );
}
