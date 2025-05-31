'use client';

import { useEffect, useState } from 'react';
import { db } from '@/firebase/config';
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc
} from 'firebase/firestore';

// 🔷 Define the shape of your syllabus items
interface SyllabusItem {
  id: string;
  class: string;
  subject: string;
  topic: string;
  comment?: string;
  completed: boolean;
}

export default function SyllabusTracker() {
  const [topics, setTopics] = useState<SyllabusItem[]>([]);
  const [newTopic, setNewTopic] = useState('');
  const [className, setClassName] = useState('');
  const [subject, setSubject] = useState('');
  const [comment, setComment] = useState('');

  // 🔸 Replace this with dynamic classes based on logged-in teacher
  const teacherClasses = ['6th', '8th'];

  const fetchTopics = async () => {
    const snapshot = await getDocs(collection(db, 'syllabus'));
    const data = snapshot.docs.map(docSnap => {
      const d = docSnap.data();
      return {
        id: docSnap.id,
        class: d.class,
        subject: d.subject,
        topic: d.topic,
        comment: d.comment || '',
        completed: d.completed
      } as SyllabusItem;
    });

    const filtered = data.filter(item => teacherClasses.includes(item.class));
    setTopics(filtered);
  };

  const handleAdd = async () => {
    if (!newTopic || !className || !subject || !teacherClasses.includes(className)) return;

    await addDoc(collection(db, 'syllabus'), {
      class: className,
      subject,
      topic: newTopic,
      comment,
      completed: false
    });

    setNewTopic('');
    setClassName('');
    setSubject('');
    setComment('');
    fetchTopics();
  };

  const markAsCompleted = async (id: string) => {
    const ref = doc(db, 'syllabus', id);
    await updateDoc(ref, { completed: true });
    fetchTopics();
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">📘 Syllabus Tracker (Class-wise)</h1>

      <div className="mb-6 space-y-2">
        <div className="flex flex-wrap gap-2">
          <select
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="">Select Class</option>
            {teacherClasses.map(cls => (
              <option key={cls} value={cls}>{cls}</option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="border p-2 rounded"
          />

          <input
            type="text"
            placeholder="Topic to teach"
            value={newTopic}
            onChange={(e) => setNewTopic(e.target.value)}
            className="border p-2 rounded flex-1"
          />

          <input
            type="text"
            placeholder="Comment (optional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="border p-2 rounded flex-1"
          />

          <button
            onClick={handleAdd}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Add
          </button>
        </div>
      </div>

      <ul className="space-y-3">
        {topics.map((item) => (
          <li key={item.id}>
            <div className="p-4 border rounded shadow-sm flex justify-between items-start gap-4">
              <div>
                <p><strong>Class:</strong> {item.class}</p>
                <p><strong>Subject:</strong> {item.subject}</p>
                <p><strong>Topic:</strong> {item.topic}</p>
                {item.comment && <p className="text-sm text-gray-600"><strong>Comment:</strong> {item.comment}</p>}
              </div>
              {!item.completed ? (
                <button
                  onClick={() => markAsCompleted(item.id)}
                  className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                >
                  ✅ Done
                </button>
              ) : (
                <span className="text-green-600 font-semibold">✅ Completed</span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
