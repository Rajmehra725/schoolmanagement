'use client';

import { useState } from 'react';
import { db, storage } from '@/firebase/config';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function AdmissionsPage() {
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    grade: '',
    email: '',
    phone: '',
    documentUrl: '',
  });
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState<boolean | null>(null);

  const [enquiry, setEnquiry] = useState({ name: '', email: '', question: '' });
  const [enquirySuccess, setEnquirySuccess] = useState<boolean | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setDocumentFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setMessage('');
    setSuccess(null);

    try {
      let fileUrl = '';

      if (documentFile) {
        const filePath = `admissions/${uuidv4()}-${documentFile.name}`;
        const fileRef = ref(storage, filePath);
        await uploadBytes(fileRef, documentFile);
        fileUrl = await getDownloadURL(fileRef);
      }

      const newApplication = {
        ...formData,
        documentUrl: fileUrl,
        timestamp: new Date(),
      };

      await addDoc(collection(db, 'admissions'), newApplication);

      setMessage('✅ Application submitted successfully!');
      setSuccess(true);
      setFormData({ name: '', age: '', grade: '', email: '', phone: '', documentUrl: '' });
      setDocumentFile(null);
      setShowForm(false);
    } catch (error) {
      console.error('❌ Error submitting application:', error);
      setMessage('❌ Something went wrong. Check the console for details.');
      setSuccess(false);
    } finally {
      setUploading(false);
    }
  };

  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const enquiryData = {
        name: enquiry.name,
        email: enquiry.email,
        question: enquiry.question,
        timestamp: new Date(),
      };
      await addDoc(collection(db, 'enquiries'), enquiryData);
      setEnquiry({ name: '', email: '', question: '' });
      setEnquirySuccess(true);
    } catch (err) {
      console.error('❌ Error submitting enquiry:', err);
      setEnquirySuccess(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 md:p-12">
      <section className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow p-8">
        <h1 className="text-3xl font-bold text-orange-600 mb-4">Admissions Open 2025–26</h1>
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          We are now accepting applications for Nursery to Grade 12. Join a community that fosters excellence in academics,
          innovation, and values-based education.
        </p>

        <div className="space-y-4 text-gray-800 dark:text-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-orange-500">Admission Process:</h2>
            <ul className="list-disc pl-6">
              <li>Fill out the online application form</li>
              <li>Submit required documents</li>
              <li>Attend entrance test / interaction session</li>
              <li>Confirmation & Fee Payment</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-orange-500">Eligibility:</h2>
            <ul className="list-disc pl-6">
              <li>Nursery: 3+ years as on March 31, 2025</li>
              <li>Grade 1 and above: Previous year’s report card required</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-orange-500">Documents Required:</h2>
            <ul className="list-disc pl-6">
              <li>Birth Certificate</li>
              <li>Passport-size Photos</li>
              <li>Address Proof</li>
              <li>Previous School Report Card (if applicable)</li>
            </ul>
          </div>

          <div className="bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-100 p-4 rounded">
            <p className="font-medium">📅 Application Deadline: March 15, 2025</p>
            <p>📞 Contact Admissions: +91-9876543210 | ✉️ admissions@smartschool.edu.in</p>
          </div>
        </div>

        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-block mt-8 px-6 py-3 bg-orange-600 text-white rounded hover:bg-orange-700 transition"
          >
            Apply Online
          </button>
        )}

        {showForm && (
          <form onSubmit={handleSubmit} className="mt-8 space-y-4 bg-orange-50 dark:bg-gray-700 p-6 rounded-xl">
            <div>
              <label className="block text-sm font-medium">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full mt-1 p-2 rounded border"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Age</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                required
                className="w-full mt-1 p-2 rounded border"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Class Applying For</label>
              <select
                name="grade"
                value={formData.grade}
                onChange={handleChange}
                required
                className="w-full mt-1 p-2 rounded border"
              >
                <option value="">Select Grade</option>
                {[...Array(13)].map((_, i) => (
                  <option key={i} value={i < 3 ? ['Nursery', 'LKG', 'UKG'][i] : `Grade ${i}`}>
                    {i < 3 ? ['Nursery', 'LKG', 'UKG'][i] : `Grade ${i}`}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full mt-1 p-2 rounded border"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full mt-1 p-2 rounded border"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Upload Document (PDF or Image)</label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="w-full mt-1"
              />
            </div>
            <button
              type="submit"
              disabled={uploading}
              className="w-full bg-orange-600 text-white py-2 px-4 rounded hover:bg-orange-700 transition flex items-center justify-center gap-2"
            >
              {uploading && <Loader2 className="animate-spin w-4 h-4" />} Submit Application
            </button>
          </form>
        )}

        {message && (
          <div
            className={`mt-6 text-center font-semibold px-4 py-2 rounded-md ${
              success ? 'text-green-700 bg-green-100 dark:bg-green-900' : 'text-red-700 bg-red-100 dark:bg-red-900'
            }`}
          >
            {success ? <CheckCircle className="inline-block mr-2" /> : <XCircle className="inline-block mr-2" />}
            {message}
          </div>
        )}

        <div className="mt-12">
          <h2 className="text-2xl font-bold text-orange-600 mb-4">❓ Have Questions About Admissions?</h2>
          <form
            onSubmit={handleEnquirySubmit}
            className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md space-y-4"
          >
            <div>
              <label className="block text-sm font-medium">Your Name</label>
              <input
                type="text"
                value={enquiry.name}
                onChange={(e) => setEnquiry({ ...enquiry, name: e.target.value })}
                required
                className="w-full mt-1 p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Your Email</label>
              <input
                type="email"
                value={enquiry.email}
                onChange={(e) => setEnquiry({ ...enquiry, email: e.target.value })}
                required
                className="w-full mt-1 p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Your Question</label>
              <textarea
                value={enquiry.question}
                onChange={(e) => setEnquiry({ ...enquiry, question: e.target.value })}
                required
                className="w-full mt-1 p-2 border rounded"
                rows={4}
              />
            </div>
            <button
              type="submit"
              className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 transition"
            >
              Submit Enquiry
            </button>

            {enquirySuccess !== null && (
              <div
                className={`mt-4 p-3 rounded text-sm font-medium ${
                  enquirySuccess
                    ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100'
                    : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-100'
                }`}
              >
                {enquirySuccess ? '✅ Your enquiry has been submitted!' : '❌ Failed to submit your enquiry.'}
              </div>
            )}
          </form>
        </div>
      </section>
    </div>
  );
}
