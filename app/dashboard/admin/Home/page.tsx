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
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

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

interface Achievement {
  id: string;
  title: string;
  description: string;
}

interface AcademicInfo {
  id: string;
  classOrStream: string;
  subjects: string;
  description: string;
}
interface Faculty {
  id: string;
  name: string;
  subject: string;
  designation: string;
  photoURL: string;
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

  // Achievements
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [newAchievementTitle, setNewAchievementTitle] = useState('');
  const [newAchievementDescription, setNewAchievementDescription] = useState('');


  const [academics, setAcademics] = useState<AcademicInfo[]>([]);
  const [classOrStream, setClassOrStream] = useState('');
  const [subjects, setSubjects] = useState('');
  const [description, setDescription] = useState('');

  // Principal Message
  const [principalMessage, setPrincipalMessage] = useState('');
  const [loadingMessage, setLoadingMessage] = useState(false);
  const [emails, setEmails] = useState<string[]>([]);

 const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [facultyForm, setFacultyForm] = useState({
    name: '',
    subject: '',
    designation: '',
    photoURL: '',
  });

  const [editingId, setEditingId] = useState<string | null>(null);
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


  useEffect(() => {
    const q = query(collection(db, 'newsletterSubscribers'));
    const unsub = onSnapshot(q, (snap) => {
      const allEmails: string[] = [];
      snap.forEach(doc => allEmails.push(doc.data().email));
      setEmails(allEmails);
    });
    return () => unsub();
  }, []);

   const fetchFaculties = async () => {
    const snap = await getDocs(collection(db, 'faculties'));
    setFaculties(
      snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Faculty[]
    );
  };

  useEffect(() => {
    fetchFaculties();
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

  useEffect(() => {
    const q = query(collection(db, 'achievements'), orderBy('title'));
    const unsub = onSnapshot(q, (snapshot) => {
      const data: Achievement[] = [];
      snapshot.forEach(doc => data.push({ id: doc.id, ...(doc.data() as any) }));
      setAchievements(data);
    });
    return () => unsub();
  }, []);

  async function handleAddAchievement(e: FormEvent) {
    e.preventDefault();
    if (!newAchievementTitle || !newAchievementDescription) return;
    await addDoc(collection(db, 'achievements'), {
      title: newAchievementTitle,
      description: newAchievementDescription,
    });
    setNewAchievementTitle('');
    setNewAchievementDescription('');
  }

  async function handleDeleteAchievement(id: string) {
    if (confirm('Delete this achievement?')) {
      await deleteDoc(doc(db, 'achievements', id));
    }
  }

  useEffect(() => {
    const q = query(collection(db, 'academics'));
    const unsub = onSnapshot(q, (snapshot) => {
      const items: AcademicInfo[] = [];
      snapshot.forEach(doc => items.push({ id: doc.id, ...(doc.data() as any) }));
      setAcademics(items);
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

  async function handleAddAcademicInfo(e: FormEvent) {
    e.preventDefault();
    if (!classOrStream || !subjects || !description) return;
    await addDoc(collection(db, 'academics'), {
      classOrStream,
      subjects,
      description,
    });
    setClassOrStream('');
    setSubjects('');
    setDescription('');
  }

  async function handleDeleteAcademic(id: string) {
    if (confirm('Delete this academic info?')) {
      await deleteDoc(doc(db, 'academics', id));
    }
  }

  async function handleAddFaculty(e: FormEvent) {
    e.preventDefault();
    const { name, subject, photoURL } = facultyForm;
    if (!name || !subject || !photoURL) return;

    await addDoc(collection(db, 'faculties'), facultyForm);
    setFacultyForm({ name: '', subject: '', designation: '', photoURL: '' });
    fetchFaculties();
  }

  async function handleDeleteFaculty(id: string) {
    await deleteDoc(doc(db, 'faculties', id));
    fetchFaculties();
  }

  async function handleUpdateFaculty(id: string) {
    await updateDoc(doc(db, 'faculties', id), facultyForm);
    setEditingId(null);
    setFacultyForm({ name: '', subject: '', designation: '', photoURL: '' });
    fetchFaculties();
  }

  function handleEditFaculty(faculty: Faculty) {
    setEditingId(faculty.id);
    setFacultyForm({
      name: faculty.name,
      subject: faculty.subject,
      designation: faculty.designation || '',
      photoURL: faculty.photoURL,
    });
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
      {/* Achievements Section */}
      <section>
        <h2 className="text-3xl font-semibold text-orange-600 mb-4">Achievements</h2>
        <form onSubmit={handleAddAchievement} className="mb-6 space-y-2">
          <input
            type="text"
            placeholder="Achievement Title"
            value={newAchievementTitle}
            onChange={(e) => setNewAchievementTitle(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
          />
          <textarea
            placeholder="Description"
            value={newAchievementDescription}
            onChange={(e) => setNewAchievementDescription(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
          />
          <button
            type="submit"
            className="bg-orange-600 text-white px-6 py-2 rounded hover:bg-orange-700"
          >
            Add Achievement
          </button>
        </form>
        <ul className="space-y-3">
          {achievements.map(({ id, title, description }) => (
            <li
              key={id}
              className="border p-3 rounded hover:shadow-md flex justify-between items-start"
            >
              <div>
                <h3 className="font-semibold text-lg">{title}</h3>
                <p className="mt-1">{description}</p>
              </div>
              <button
                onClick={() => handleDeleteAchievement(id)}
                className="text-red-600 hover:text-red-800 font-bold"
              >
                &times;
              </button>
            </li>
          ))}
        </ul>
      </section>
      {/* Academics Section */}
      <section>
        <h2 className="text-3xl font-semibold text-orange-600 mb-4">Academics Overview</h2>
        <form onSubmit={handleAddAcademicInfo} className="mb-6 space-y-2">
          <input
            type="text"
            placeholder="Class or Stream (e.g. Class 10 / Science)"
            value={classOrStream}
            onChange={(e) => setClassOrStream(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            required
          />
          <input
            type="text"
            placeholder="Subjects (comma separated)"
            value={subjects}
            onChange={(e) => setSubjects(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            required
          />
          <textarea
            placeholder="Brief Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            required
          />
          <button
            type="submit"
            className="bg-orange-600 text-white px-6 py-2 rounded hover:bg-orange-700"
          >
            Add Info
          </button>
        </form>
        <ul className="space-y-3">
          {academics.map(({ id, classOrStream, subjects, description }) => (
            <li key={id} className="border p-3 rounded flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{classOrStream}</h3>
                <p className="text-sm text-gray-600">{subjects}</p>
                <p>{description}</p>
              </div>
              <button
                onClick={() => handleDeleteAcademic(id)}
                className="text-red-600 hover:text-red-800 font-bold"
              >
                &times;
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* Faculty Section */}
   <section>
      <h2 className="text-3xl font-semibold text-orange-600 mb-4">Faculty Profiles</h2>

      <form onSubmit={editingId ? (e) => { e.preventDefault(); handleUpdateFaculty(editingId); } : handleAddFaculty} className="space-y-2 mb-4">
        <input
          type="text"
          placeholder="Name"
          value={facultyForm.name}
          onChange={(e) => setFacultyForm({ ...facultyForm, name: e.target.value })}
          className="w-full border px-3 py-2 rounded"
          required
        />
        <input
          type="text"
          placeholder="Subject"
          value={facultyForm.subject}
          onChange={(e) => setFacultyForm({ ...facultyForm, subject: e.target.value })}
          className="w-full border px-3 py-2 rounded"
          required
        />
        <input
          type="text"
          placeholder="Designation"
          value={facultyForm.designation}
          onChange={(e) => setFacultyForm({ ...facultyForm, designation: e.target.value })}
          className="w-full border px-3 py-2 rounded"
        />
        <input
          type="url"
          placeholder="Photo URL"
          value={facultyForm.photoURL}
          onChange={(e) => setFacultyForm({ ...facultyForm, photoURL: e.target.value })}
          className="w-full border border-gray-300 rounded px-3 py-2"
          required
        />
        <button type="submit" className="bg-orange-600 text-white px-6 py-2 rounded hover:bg-orange-700">
          {editingId ? 'Update Faculty' : 'Add Faculty'}
        </button>
      </form>

      <ul className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {faculties.map(({ id, name, subject, designation, photoURL }) => (
          <li key={id} className="border p-3 rounded text-center bg-white shadow">
            <img src={photoURL} alt={name} className="w-24 h-24 rounded-full mx-auto mb-2 object-cover" />
            <h4 className="font-semibold">{name}</h4>
            <p className="text-sm text-gray-700">{subject}</p>
            <p className="text-xs text-gray-500">{designation}</p>
            <div className="mt-2 flex justify-center gap-2">
              <button
                onClick={() => handleEditFaculty({ id, name, subject, designation, photoURL })}
                className="text-blue-600 hover:underline text-sm"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteFaculty(id)}
                className="text-red-600 hover:underline text-sm"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
      {/* Newsletter Emails Section */}
      <section>
        <h2 className="text-3xl font-semibold text-orange-600 mb-4">Newsletter Subscribers</h2>
        <ul className="space-y-2 list-disc pl-5">
          {emails.map((email, idx) => (
            <li key={idx}>{email}</li>
          ))}
        </ul>
      </section>

    </div>

  );
}
