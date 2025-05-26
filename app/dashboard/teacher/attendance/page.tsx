"use client";

import React, { useEffect, useState } from "react";
import { collection, doc, getDocs, setDoc } from "firebase/firestore";
import { db } from "@/firebase/config";

interface Student {
  id: string;
  name: string;
}

const AttendancePage = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        // Yahan bhi teacher id ke hisaab se fetch karein
        const teacherId = "teacher123"; // example
        const querySnapshot = await getDocs(collection(db, "students"));
        const studentList: Student[] = [];
        querySnapshot.forEach((doc) => {
          // Example filter for assignedTeacherId
          if (doc.data().assignedTeacherId === teacherId) {
            studentList.push({ id: doc.id, name: doc.data().name });
          }
        });
        setStudents(studentList);
      } catch (error) {
        console.error("Error fetching students for attendance:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const toggleAttendance = (id: string) => {
    setAttendance((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const submitAttendance = async () => {
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    try {
      for (const studentId in attendance) {
        const attendanceRef = doc(db, "attendance", `${studentId}_${today}`);
        await setDoc(attendanceRef, {
          studentId,
          date: today,
          present: attendance[studentId],
          teacherId: "teacher123",
        });
      }
      alert("Attendance submitted successfully!");
    } catch (error) {
      console.error("Error submitting attendance:", error);
      alert("Failed to submit attendance.");
    }
  };

  if (loading) return <p className="p-6">Loading students...</p>;

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-3xl font-bold mb-6">Mark Attendance</h1>
      {students.length === 0 ? (
        <p>No students assigned.</p>
      ) : (
        <>
          <ul className="space-y-4">
            {students.map((student) => (
              <li
                key={student.id}
                className="flex items-center justify-between border p-3 rounded shadow"
              >
                <span>{student.name}</span>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!attendance[student.id]}
                    onChange={() => toggleAttendance(student.id)}
                    className="w-5 h-5"
                  />
                  <span>Present</span>
                </label>
              </li>
            ))}
          </ul>
          <button
            onClick={submitAttendance}
            className="mt-6 bg-blue-600 text-white py-2 px-6 rounded hover:bg-blue-700"
          >
            Submit Attendance
          </button>
        </>
      )}
    </div>
  );
};

export default AttendancePage;
