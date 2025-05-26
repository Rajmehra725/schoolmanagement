"use client";

import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/firebase/config";

interface ScheduleItem {
  id: string;
  day: string;
  time: string;
  subject: string;
  class: string;
}

const SchedulePage = () => {
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const teacherId = "teacher123"; // Example
        const q = query(
          collection(db, "schedules"),
          where("teacherId", "==", teacherId)
        );
        const querySnapshot = await getDocs(q);
        const scheduleList: ScheduleItem[] = [];
        querySnapshot.forEach((doc) => {
          scheduleList.push({ id: doc.id, ...doc.data() } as ScheduleItem);
        });
        setSchedule(scheduleList);
      } catch (error) {
        console.error("Error fetching schedule:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, []);

  if (loading) return <p className="p-6">Loading schedule...</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">My Schedule</h1>
      {schedule.length === 0 ? (
        <p>No schedule found.</p>
      ) : (
        <table className="w-full border border-gray-300 border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 p-2">Day</th>
              <th className="border border-gray-300 p-2">Time</th>
              <th className="border border-gray-300 p-2">Subject</th>
              <th className="border border-gray-300 p-2">Class</th>
            </tr>
          </thead>
          <tbody>
            {schedule.map((item) => (
              <tr key={item.id} className="hover:bg-gray-100">
                <td className="border border-gray-300 p-2">{item.day}</td>
                <td className="border border-gray-300 p-2">{item.time}</td>
                <td className="border border-gray-300 p-2">{item.subject}</td>
                <td className="border border-gray-300 p-2">{item.class}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default SchedulePage;
