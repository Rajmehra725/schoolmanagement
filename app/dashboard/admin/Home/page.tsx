'use client';

import { useState, useEffect, FormEvent } from 'react';
import {
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';
import { db, storage } from '@/firebase/config';

interface Announcement {
  id: string;
  title: string;
  content: string;
}

interface Event {
  id: string;
  title: string;
  date: string;
  description: string;
}


export default function AdminDashboard() {
  // Announcements
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [newAnnouncementTitle, setNewAnnouncementTitle] = useState('');
  const [newAnnouncementContent, setNewAnnouncementContent] = useState('');

  // Events
  const [events, setEvents] = useState<Event[]>([]);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState('');
  const [newEventDescription, setNewEventDescription] = useState('');

  // Principal Message
  const [principalMessage, setPrincipalMessage] = useState('');
  const [loadingMessage, setLoadingMessage] = useState(false);

  // --- Fetch announcements ---
  useEffect(() => {
    const q = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const anns: Announcement[] = [];
      snapshot.forEach(doc => anns.push({ id: doc.id, ...(doc.data() as any) }));
      setAnnouncements(anns);
    });
    return () => unsub();
  }, []);

  // --- Fetch events ---
  useEffect(() => {
    const q = query(collection(db, 'events'), orderBy('date', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const evs: Event[] = [];
      snapshot.forEach(doc => evs.push({ id: doc.id, ...(doc.data() as any) }));
      setEvents(evs);
    });
    return () => unsub();
  }, []);


  // --- Fetch principal message ---
  useEffect(() => {
    async function fetchPrincipalMessage() {
      const docRef = doc(db, 'principalMessages', 'principalMessage');
      const docSnap = await getDocs(collection(db, 'principalMessages'));
      // Using getDoc instead:
      const { getDoc } = await import('firebase/firestore');
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        setPrincipalMessage(snap.data().message || '');
      }
    }
    fetchPrincipalMessage();
  }, []);

  // --------------- Handlers -----------------

  async function handleAddAnnouncement(e: FormEvent) {
    e.preventDefault();
    if (!newAnnouncementTitle.trim() || !newAnnouncementContent.trim()) return;
    await addDoc(collection(db, 'announcements'), {
      title: newAnnouncementTitle.trim(),
      content: newAnnouncementContent.trim(),
      createdAt: new Date(),
    });
    setNewAnnouncementTitle('');
    setNewAnnouncementContent('');
  }

  async function handleDeleteAnnouncement(id: string) {
    if (confirm('Are you sure to delete this announcement?')) {
      await deleteDoc(doc(db, 'announcements', id));
    }
  }

  async function handleAddEvent(e: FormEvent) {
    e.preventDefault();
    if (!newEventTitle.trim() || !newEventDate || !newEventDescription.trim()) return;
    await addDoc(collection(db, 'events'), {
      title: newEventTitle.trim(),
      date: newEventDate,
      description: newEventDescription.trim(),
    });
    setNewEventTitle('');
    setNewEventDate('');
    setNewEventDescription('');
  }

  async function handleDeleteEvent(id: string) {
    if (confirm('Are you sure to delete this event?')) {
      await deleteDoc(doc(db, 'events', id));
    }
  }

  async function handleSavePrincipalMessage(e: FormEvent) {
    e.preventDefault();
    setLoadingMessage(true);
    await updateDoc(doc(db, 'principalMessages', 'principalMessage'), {
      message: principalMessage,
    }).catch(async () => {
      // if doc does not exist, create it
      await addDoc(collection(db, 'principalMessages'), {
        message: principalMessage,
        id: 'principalMessage',
      });
    });
    setLoadingMessage(false);
    alert('Principal message saved');
  }

  return (
   
      <div className="space-y-16 p-6 max-w-5xl mx-auto">

        {/* Announcements Section */}
        <section>
          <h2 className="text-3xl font-semibold text-orange-600 mb-4">Announcements</h2>
          <form onSubmit={handleAddAnnouncement} className="mb-6 space-y-2">
            <input
              type="text"
              placeholder="Title"
              value={newAnnouncementTitle}
              onChange={(e) => setNewAnnouncementTitle(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
            <textarea
              placeholder="Content"
              value={newAnnouncementContent}
              onChange={(e) => setNewAnnouncementContent(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
            <button
              type="submit"
              className="bg-orange-600 text-white px-6 py-2 rounded hover:bg-orange-700"
            >
              Add Announcement
            </button>
          </form>
          <ul className="space-y-3">
            {announcements.map(({ id, title, content }) => (
              <li
                key={id}
                className="border p-3 rounded hover:shadow-md flex justify-between items-start"
              >
                <div>
                  <h3 className="font-semibold text-lg">{title}</h3>
                  <p className="mt-1">{content}</p>
                </div>
                <button
                  onClick={() => handleDeleteAnnouncement(id)}
                  className="text-red-600 hover:text-red-800 font-bold"
                  title="Delete Announcement"
                >
                  &times;
                </button>
              </li>
            ))}
          </ul>
        </section>

        {/* Events Section */}
        <section>
          <h2 className="text-3xl font-semibold text-orange-600 mb-4">Events</h2>
          <form onSubmit={handleAddEvent} className="mb-6 space-y-2">
            <input
              type="text"
              placeholder="Event Title"
              value={newEventTitle}
              onChange={(e) => setNewEventTitle(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
            <input
              type="date"
              value={newEventDate}
              onChange={(e) => setNewEventDate(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
            <textarea
              placeholder="Event Description"
              value={newEventDescription}
              onChange={(e) => setNewEventDescription(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
            <button
              type="submit"
              className="bg-orange-600 text-white px-6 py-2 rounded hover:bg-orange-700"
            >
              Add Event
            </button>
          </form>
          <ul className="space-y-3">
            {events.map(({ id, title, date, description }) => (
              <li
                key={id}
                className="border p-3 rounded hover:shadow-md flex justify-between items-start"
              >
                <div>
                  <h3 className="font-semibold text-lg">{title}</h3>
                  <p className="text-sm text-gray-600">{date}</p>
                  <p className="mt-1">{description}</p>
                </div>
                <button
                  onClick={() => handleDeleteEvent(id)}
                  className="text-red-600 hover:text-red-800 font-bold"
                  title="Delete Event"
                >
                  &times;
                </button>
              </li>
            ))}
          </ul>
        </section>

        {/* Principal Message Section */}
        <section>
          <h2 className="text-3xl font-semibold text-orange-600 mb-4">Principal's Message</h2>
          <form onSubmit={handleSavePrincipalMessage}>
            <textarea
              value={principalMessage}
              onChange={(e) => setPrincipalMessage(e.target.value)}
              className="w-full h-48 p-4 border border-gray-300 rounded mb-4"
              placeholder="Write principal's message here..."
              required
            />
            <button
              type="submit"
              disabled={loadingMessage}
              className="bg-orange-600 text-white px-6 py-2 rounded hover:bg-orange-700 disabled:opacity-50"
            >
              {loadingMessage ? 'Saving...' : "Save Message"}
            </button>
          </form>
        </section>

      </div>
   
  );
}
