"use client";

import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/firebase/config"; // Aapka firebase config yahan import karein

interface Student {
  id: string;
  name: string;
  class: string;
}

const StudentsPage = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        // Example: teacherId se students ko fetch karna
        // Yahan aapko teacher ka uid ya id pass karna hoga
        const teacherId = "teacher123"; // example
        const q = query(
          collection(db, "students"),
          where("assignedTeacherId", "==", teacherId)
        );
        const querySnapshot = await getDocs(q);
        const studentsList: Student[] = [];
        querySnapshot.forEach((doc) => {
          studentsList.push({ id: doc.id, ...doc.data() } as Student);
        });
        setStudents(studentsList);
      } catch (error) {
        console.error("Error fetching students:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  if (loading) return <p className="p-6">Loading students...</p>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Assigned Students</h1>
      {students.length === 0 ? (
        <p>No students assigned.</p>
      ) : (
        <ul className="space-y-3">
          {students.map((student) => (
            <li
              key={student.id}
              className="border p-4 rounded shadow hover:shadow-lg transition"
            >
              <p>
                <span className="font-semibold">Name:</span> {student.name}
              </p>
              <p>
                <span className="font-semibold">Class:</span> {student.class}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default StudentsPage;
