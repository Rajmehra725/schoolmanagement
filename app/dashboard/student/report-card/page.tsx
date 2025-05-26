"use client";

import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/firebase/config";

interface ReportCardItem {
  id: string;
  subject: string;
  marksObtained: number;
  totalMarks: number;
  grade: string;
}

const ReportCardPage = () => {
  const [reportCards, setReportCards] = useState<ReportCardItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReportCards = async () => {
      try {
        const studentId = "student123"; // Example, auth se le sakte hain
        const q = query(
          collection(db, "reportCards"),
          where("studentId", "==", studentId)
        );
        const querySnapshot = await getDocs(q);
        const cards: ReportCardItem[] = [];
        querySnapshot.forEach((doc) => {
          cards.push({ id: doc.id, ...doc.data() } as ReportCardItem);
        });
        setReportCards(cards);
      } catch (error) {
        console.error("Error fetching report cards:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReportCards();
  }, []);

  if (loading) return <p className="p-6">Loading report card...</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">My Report Card</h1>
      {reportCards.length === 0 ? (
        <p>No report card data found.</p>
      ) : (
        <table className="w-full border border-gray-300 border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 p-2">Subject</th>
              <th className="border border-gray-300 p-2">Marks Obtained</th>
              <th className="border border-gray-300 p-2">Total Marks</th>
              <th className="border border-gray-300 p-2">Grade</th>
            </tr>
          </thead>
          <tbody>
            {reportCards.map((card) => (
              <tr key={card.id} className="hover:bg-gray-100">
                <td className="border border-gray-300 p-2">{card.subject}</td>
                <td className="border border-gray-300 p-2">{card.marksObtained}</td>
                <td className="border border-gray-300 p-2">{card.totalMarks}</td>
                <td className="border border-gray-300 p-2">{card.grade}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ReportCardPage;
