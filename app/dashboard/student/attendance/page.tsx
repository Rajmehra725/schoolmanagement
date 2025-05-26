"use client";

import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/firebase/config";

interface AttendanceRecord {
  id: string;
  date: string;
  present: boolean;
}

const AttendancePage = () => {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const studentId = "student123"; // Example, auth se le sakte hain
        const q = query(
          collection(db, "attendance"),
          where("studentId", "==", studentId)
        );
        const querySnapshot = await getDocs(q);
        const records: AttendanceRecord[] = [];
        querySnapshot.forEach((doc) => {
          records.push({ id: doc.id, ...doc.data() } as AttendanceRecord);
        });
        // Sort by date descending
        records.sort((a, b) => (a.date < b.date ? 1 : -1));
        setAttendance(records);
      } catch (error) {
        console.error("Error fetching attendance:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, []);

  if (loading) return <p className="p-6">Loading attendance records...</p>;

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-3xl font-bold mb-6">My Attendance</h1>
      {attendance.length === 0 ? (
        <p>No attendance records found.</p>
      ) : (
        <table className="w-full border border-gray-300 border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 p-2">Date</th>
              <th className="border border-gray-300 p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {attendance.map((record) => (
              <tr key={record.id} className="hover:bg-gray-100">
                <td className="border border-gray-300 p-2">{record.date}</td>
                <td
                  className={`border border-gray-300 p-2 font-semibold ${
                    record.present ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {record.present ? "Present" : "Absent"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AttendancePage;
