'use client';

import React, { useEffect, useState } from 'react';
import { db } from '@/firebase/config';
import { getDocs ,addDoc, collection, serverTimestamp } from 'firebase/firestore';

export default function HomePage() {
  const [principalMessage, setPrincipalMessage] = useState<{ message: string; name?: string; photo?: string } | null>(null);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [topStudents, setTopStudents] = useState<any[]>([]);
  const [academics, setAcademics] = useState<any[]>([]);
  const [faculty, setFaculty] = useState<any[]>([]);
  const [subscribers, setSubscribers] = useState<any[]>([]);
 const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) return setStatus('Please enter a valid email.');

    try {
      await addDoc(collection(db, 'newsletterEmails'), {
        email,
        createdAt: serverTimestamp(),
      });
      setEmail('');
      setStatus('✅ Thank you for subscribing!');
    } catch (err) {
      console.error(err);
      setStatus('❌ Failed to subscribe. Please try again.');
    }
  };
async function handleSubscribe(email: string) {
  if (!email) return;

  try {
    await addDoc(collection(db, 'newsletterEmails'), {
      email,
      subscribedAt: serverTimestamp(), // optional: timestamp
    });

    alert('Subscribed successfully!');
  } catch (error) {
    console.error('Subscription failed:', error);
    alert('Failed to subscribe. Please try again.');
  }
}

  useEffect(() => {
    const fetchData = async () => {
      // Principal Message
     
      const pmSnap = await getDocs(collection(db, 'principalMessage'));
      if (!pmSnap.empty) {
        const pmData = pmSnap.docs[0].data();
        setPrincipalMessage(pmData as { message: string });
      }
      // Announcements
      const annSnap = await getDocs(collection(db, 'announcements'));
      setAnnouncements(annSnap.docs.map(doc => doc.data()));

      // Events
      const evtSnap = await getDocs(collection(db, 'events'));
      setEvents(evtSnap.docs.map(doc => doc.data()));

      // Top Students
      const studSnap = await getDocs(collection(db, 'topStudents'));
      setTopStudents(studSnap.docs.map(doc => doc.data()));

      // Academics Overview
      const acadSnap = await getDocs(collection(db, 'academics'));
      setAcademics(acadSnap.docs.map(doc => doc.data()));

      // Faculty
      const facSnap = await getDocs(collection(db, 'faculties')); // ✅ Matches Firestore
      if (facSnap.empty) {
        console.warn('No faculty data found in Firestore.');
        return;
      }
      setFaculty(facSnap.docs.map(doc => doc.data()));

      // Newsletter Subscribers
      const subSnap = await getDocs(collection(db, 'newsletterEmails'));
      setSubscribers(subSnap.docs.map(doc => doc.data()));
    };

    fetchData();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 text-gray-800">

      {/* Hero Section */}
      <section className="bg-orange-600 text-white text-center py-10">
        <h1 className="text-4xl font-bold">🏫 Welcome to RaazEdutech</h1>
        <p className="mt-2 text-lg">Empowering Future Through Education</p>
      </section>

      {/* Principal Message */}
      {principalMessage && (
        <section className="bg-white py-10 px-4 shadow-md mb-8 max-w-4xl mx-auto rounded">
          <h2 className="text-3xl font-bold text-orange-600 mb-4 text-center">📣 Message from the Principal</h2>
          <div className="text-center">
            <p className="italic text-lg max-w-3xl mx-auto">{principalMessage.message}</p>
          </div>
        </section>
      )}

      {/* Announcements */}
      <section className="max-w-6xl mx-auto py-10 px-4">
        <h2 className="text-2xl font-bold mb-4 text-orange-600">📢 Latest Announcements</h2>
        <ul className="space-y-4">
          {announcements.map((a, i) => (
            <li key={i} className="bg-white p-4 shadow rounded">
              <h3 className="font-semibold">{a.title}</h3>
              <p className="text-sm">{a.description}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Events */}
      <section className="bg-white py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-4 text-orange-600">📅 Upcoming Events</h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {events.map((e, i) => (
              <li key={i} className="p-4 border border-gray-200 rounded shadow">
                <h3 className="font-bold">{e.name}</h3>
                <p className="text-sm">{e.date}</p>
                <p className="text-sm">{e.description}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Top Students */}
      <section className="bg-gray-100 py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-4 text-orange-600">🏆 Top Performing Students</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {topStudents.map((s, i) => (
              <div key={i} className="text-center bg-white p-4 rounded shadow">
                <img
                  src={s.photo}
                  alt={s.name}
                  className="w-24 h-24 object-cover mx-auto rounded-full mb-2"
                />
                <p className="font-semibold">{s.name}</p>
                <p className="text-sm text-gray-600">{s.grade}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Academics Overview */}
      <section className="py-10 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-4 text-orange-600">📚 Academics Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {academics.map((a, i) => (
              <div key={i} className="p-4 border rounded shadow">
                <h3 className="text-lg font-semibold">{a.title}</h3>
                <p className="text-sm text-gray-700">{a.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Faculty Profiles */}
      <section className="py-10 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-4 text-orange-600">👨‍🏫 Meet Our Faculty</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {faculty.map((f, i) => (
              <div key={i} className="text-center bg-white p-4 rounded shadow">
                <img
                  src={f.photoURL}
                  alt={f.name}
                  className="w-24 h-24 object-cover mx-auto rounded-full mb-2"
                />
                <p className="font-semibold">{f.name}</p>
                <p className="text-sm text-gray-600">{f.designation}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="bg-orange-100 py-10 px-4 text-center">
      <h2 className="text-2xl font-bold mb-4 text-orange-700">✉️ Subscribe to Our Newsletter</h2>
     <form onSubmit={handleSubmit} className="space-y-2">
      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border px-4 py-2 rounded w-full"
        required
      />
      <button type="submit" className="bg-orange-600 text-white px-6 py-2 rounded">
        Subscribe
      </button>
    </form>
      {status && <p className="mt-3 text-sm text-gray-700">{status}</p>}
    </div>

    </main>
  );
}
