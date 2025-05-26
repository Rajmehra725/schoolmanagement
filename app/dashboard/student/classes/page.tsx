"use client";

import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/firebase/config";

interface ClassItem {
  id: string;
  subject: string;
  teacherName: string;
  time: string;
  day: string;
}

const ClassesPage = () => {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const studentId = "student123"; // Example, auth se le sakte hain
        // Fetch classes where student is enrolled
        const q = query(
          collection(db, "classes"),
          where("enrolledStudents", "array-contains", studentId)
        );
        const querySnapshot = await getDocs(q);
        const classesList: ClassItem[] = [];
        querySnapshot.forEach((doc) => {
          classesList.push({ id: doc.id, ...doc.data() } as ClassItem);
        });
        setClasses(classesList);
      } catch (error) {
        console.error("Error fetching classes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  if (loading) return <p className="p-6">Loading classes...</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">My Classes</h1>
      {classes.length === 0 ? (
        <p>You are not enrolled in any classes.</p>
      ) : (
        <ul className="space-y-4">
          {classes.map((cls) => (
            <li
              key={cls.id}
              className="border rounded p-4 shadow hover:shadow-lg transition"
            >
              <p>
                <span className="font-semibold">Subject:</span> {cls.subject}
              </p>
              <p>
                <span className="font-semibold">Teacher:</span> {cls.teacherName}
              </p>
              <p>
                <span className="font-semibold">Day:</span> {cls.day}
              </p>
              <p>
                <span className="font-semibold">Time:</span> {cls.time}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ClassesPage;
