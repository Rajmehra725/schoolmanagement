// app/dashboard/teacher/schedule/page.tsx
"use client";

import { db } from "@/firebase/config";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  addDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";

interface ScheduleEntry {
  id?: string;
  class: string;
  subject: string;
  time: string;
  weekday: string;
}

export default function SchedulePage() {
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);
  const [form, setForm] = useState<ScheduleEntry>({
    class: "",
    subject: "",
    time: "",
    weekday: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchSchedule = async () => {
    const querySnapshot = await getDocs(collection(db, "schedule"));
    const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as ScheduleEntry[];
    setSchedule(data);
  };

  useEffect(() => {
    fetchSchedule();
  }, []);

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, "schedule", id));
    fetchSchedule();
  };

  const handleEdit = (entry: ScheduleEntry) => {
    setForm(entry);
    setEditingId(entry.id!);
  };

  const handleSubmit = async () => {
  if (!form.class || !form.subject || !form.time || !form.weekday) return;

  // Create a new object without the 'id' key
  const { id, ...formData } = form;

  if (editingId) {
    await updateDoc(doc(db, "schedule", editingId), formData);
    setEditingId(null);
  } else {
    await addDoc(collection(db, "schedule"), formData);
  }

  setForm({ class: "", subject: "", time: "", weekday: "" });
  fetchSchedule();
};

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-semibold">Class Schedule</h1>

      <div className="grid gap-2 md:grid-cols-5">
        <input
          placeholder="Class"
          className="border p-2 rounded"
          value={form.class}
          onChange={(e) => setForm({ ...form, class: e.target.value })}
        />
        <input
          placeholder="Subject"
          className="border p-2 rounded"
          value={form.subject}
          onChange={(e) => setForm({ ...form, subject: e.target.value })}
        />
        <input
          placeholder="Time"
          className="border p-2 rounded"
          value={form.time}
          onChange={(e) => setForm({ ...form, time: e.target.value })}
        />
        <input
          placeholder="Weekday"
          className="border p-2 rounded"
          value={form.weekday}
          onChange={(e) => setForm({ ...form, weekday: e.target.value })}
        />
        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          {editingId ? "Update" : "Add"}
        </button>
      </div>

      <ul className="space-y-2">
        {schedule.map((entry) => (
          <li key={entry.id} className="p-4 bg-white shadow rounded border">
            <p><strong>Class:</strong> {entry.class}</p>
            <p><strong>Subject:</strong> {entry.subject}</p>
            <p><strong>Time:</strong> {entry.time}</p>
            <p><strong>Weekday:</strong> {entry.weekday}</p>
            <div className="mt-2 flex gap-2">
              <button
                onClick={() => handleEdit(entry)}
                className="px-3 py-1 bg-yellow-400 text-white rounded"
              >Edit</button>
              <button
                onClick={() => handleDelete(entry.id!)}
                className="px-3 py-1 bg-red-500 text-white rounded"
              >Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}