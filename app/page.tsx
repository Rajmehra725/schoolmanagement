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
      <section className="relative bg-gradient-to-br from-orange-600 via-orange-500 to-orange-700 text-white text-center min-h-[70vh] flex items-center justify-center px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/hero-pattern.svg')] opacity-10"></div>
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="space-y-2 mb-6">
            <p className="text-orange-200 text-lg">Welcome to</p>
            <h1 className="text-4xl md:text-6xl font-bold mb-2 tracking-tight">
              🏫 RaazEdutech
            </h1>
            <p className="text-xl md:text-3xl text-orange-100 font-light">
              Empowering Future Through Education
            </p>
          </div>
          <p className="text-lg text-orange-100 mb-8 max-w-2xl mx-auto">
            Join our community of learners and discover a world of opportunities
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/courses"
              className="px-8 py-3 bg-white text-orange-600 rounded-lg font-semibold text-lg hover:bg-orange-50 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
            >
              Explore Courses
            </a>
            <a
              href="/admissions"
              className="px-8 py-3 bg-transparent border-2 border-white text-white rounded-lg font-semibold text-lg hover:bg-white hover:text-orange-600 transition-all duration-300 transform hover:scale-105"
            >
              Apply Now
            </a>
          </div>
        </div>
      </section>

      {/* Principal Message */}
      {principalMessage && (
        <section className="bg-white py-16 px-4 shadow-lg mb-8 max-w-4xl mx-auto rounded-xl relative overflow-hidden mt-[-4rem]">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600"></div>
          <div className="relative z-10">
            <h2 className="text-3xl font-bold text-orange-600 mb-6 text-center flex items-center justify-center gap-3">
              <span className="w-12 h-1 bg-orange-200 rounded-full"></span>
              <span>📣 Message from the Principal</span>
              <span className="w-12 h-1 bg-orange-200 rounded-full"></span>
            </h2>
            <div className="text-center">
              <p className="italic text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed">
                "{principalMessage.message}"
              </p>
              {principalMessage.name && (
                <div className="mt-6 text-orange-600">
                  <p className="font-semibold">{principalMessage.name}</p>
                  <p className="text-sm text-orange-500">Principal, RaazEdutech</p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Announcements */}
      <section className="max-w-6xl mx-auto py-16 px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-orange-600">📢 Latest Announcements</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Stay informed about the latest updates and important information</p>
        </div>
        <ul className="space-y-4">
          {announcements.map((a, i) => (
            <li key={i} className="bg-white p-6 shadow-sm hover:shadow-md rounded-lg border border-orange-100 hover:border-orange-200 transition-all duration-300">
              <h3 className="font-semibold text-lg text-orange-600 mb-2">{a.title}</h3>
              <p className="text-gray-600">{a.description}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Events */}
      <section className="bg-white py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-orange-600">📅 Upcoming Events</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Stay updated with our latest events and activities
            </p>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((e, i) => (
              <li key={i} className="group bg-white p-6 rounded-xl border border-orange-100 hover:border-orange-300 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex items-start mb-4">
                  <div className="bg-orange-100 text-orange-600 p-3 rounded-lg">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="font-bold text-lg group-hover:text-orange-600 transition-colors">{e.name}</h3>
                    <p className="text-sm text-orange-500">{e.date}</p>
                  </div>
                </div>
                <p className="text-gray-600">{e.description}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Top Students */}
      <section className="bg-gradient-to-b from-orange-50 to-white py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-orange-600">🏆 Our Star Achievers</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Celebrating excellence and outstanding academic achievements
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8">
            {topStudents.map((s, i) => (
              <div key={i} className="group text-center bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-orange-100 hover:border-orange-200">
                <div className="relative inline-block mb-4">
                  <div className="absolute inset-0 bg-orange-100 rounded-full transform scale-110 group-hover:scale-120 transition-transform duration-300"></div>
                  <img
                    src={s.photo}
                    alt={s.name}
                    className="w-24 h-24 object-cover rounded-full relative z-10"
                  />
                </div>
                <p className="font-semibold text-lg text-gray-800">{s.name}</p>
                <p className="text-orange-600">{s.grade}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Academics Overview */}
      <section className="py-16 px-4 bg-gradient-to-b from-white to-orange-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-orange-600">📚 Academic Excellence</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover our comprehensive academic programs designed to nurture talent and inspire learning
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {academics.map((a, i) => (
              <div key={i} className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-orange-100 hover:border-orange-200">
                <h3 className="text-xl font-semibold text-orange-600 mb-3">{a.title}</h3>
                <p className="text-gray-600 leading-relaxed">{a.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Faculty Profiles */}
      <section className="py-16 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-orange-600">👨‍🏫 Meet Our Expert Faculty</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Learn from experienced educators dedicated to nurturing the next generation of leaders
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8">
            {faculty.map((f, i) => (
              <div key={i} className="group">
                <div className="relative h-48 mb-4 rounded-xl overflow-hidden">
                  <img
                    src={f.photoURL || '/default-avatar.png'}
                    alt={f.name}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <p className="font-semibold text-gray-900">{f.name}</p>
                <p className="text-sm text-orange-600">{f.designation}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="bg-gradient-to-r from-orange-100 to-orange-50 py-16 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/pattern.png')] opacity-5"></div>
        <div className="relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-orange-700">
            ✉️ Stay Updated with School News
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Subscribe to our newsletter for updates on events, achievements, and important announcements
          </p>
          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border px-4 py-2 rounded w-full mb-4"
              required
            />
            <button type="submit" className="bg-orange-600 text-white px-6 py-2 rounded hover:bg-orange-700 transition-colors">
              Subscribe
            </button>
          </form>
          {status && <p className="mt-3 text-sm text-gray-700">{status}</p>}
        </div>
      </section>
    </main>
  );
}
