"use client";

import { db } from "@/firebase/config";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { useEffect, useState } from "react";

interface Student {
  id: string;
  name: string;
  email: string;
  password: string;
  fatherName: string;
  dob: string;
  aadhar: string;
  mobile: string;
  photoUrl: string;
  address: string;
  class: string;
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    fatherName: "",
    dob: "",
    aadhar: "",
    mobile: "",
    photoUrl: "",
    address: "",
    class: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterClass, setFilterClass] = useState("All");

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    const querySnapshot = await getDocs(collection(db, "students"));
    const data = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Student[];
    setStudents(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation for all fields
    if (
      !form.name ||
      !form.email ||
      !form.password ||
      !form.fatherName ||
      !form.dob ||
      !form.aadhar ||
      !form.mobile ||
      !form.photoUrl ||
      !form.address ||
      !form.class
    ) {
      alert("Please fill all fields");
      return;
    }

    if (isEditing && editId) {
      await updateDoc(doc(db, "students", editId), {
        ...form,
      });
      setIsEditing(false);
      setEditId(null);
    } else {
      await addDoc(collection(db, "students"), {
        ...form,
      });
    }

    setForm({
      name: "",
      email: "",
      password: "",
      fatherName: "",
      dob: "",
      aadhar: "",
      mobile: "",
      photoUrl: "",
      address: "",
      class: "",
    });

    fetchStudents();
  };

  const handleEdit = (student: Student) => {
    setIsEditing(true);
    setEditId(student.id);
    setForm({
      name: student.name,
      email: student.email,
      password: student.password,
      fatherName: student.fatherName,
      dob: student.dob,
      aadhar: student.aadhar,
      mobile: student.mobile,
      photoUrl: student.photoUrl,
      address: student.address,
      class: student.class,
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this student?")) {
      await deleteDoc(doc(db, "students", id));
      fetchStudents();
    }
  };

  const filteredStudents = students.filter(
    (s) =>
      (s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.class.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase()) ||
        s.fatherName.toLowerCase().includes(search.toLowerCase()) ||
        s.mobile.toLowerCase().includes(search.toLowerCase())) &&
      (filterClass === "All" || s.class === filterClass)
  );

  const classList = ["All", ...new Set(students.map((s) => s.class))];

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🎓 Assigned Students</h1>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <input
          type="text"
          placeholder="Full Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="border p-2 rounded"
        />
        <input
          type="email"
          placeholder="Email Address"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="border p-2 rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Father's Name"
          value={form.fatherName}
          onChange={(e) => setForm({ ...form, fatherName: e.target.value })}
          className="border p-2 rounded"
        />
        <input
          type="date"
          placeholder="Date of Birth"
          value={form.dob}
          onChange={(e) => setForm({ ...form, dob: e.target.value })}
          className="border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Aadhar Card No."
          value={form.aadhar}
          onChange={(e) => setForm({ ...form, aadhar: e.target.value })}
          className="border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Mobile No."
          value={form.mobile}
          onChange={(e) => setForm({ ...form, mobile: e.target.value })}
          className="border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Photo URL"
          value={form.photoUrl}
          onChange={(e) => setForm({ ...form, photoUrl: e.target.value })}
          className="border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Address"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
          className="border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Class"
          value={form.class}
          onChange={(e) => setForm({ ...form, class: e.target.value })}
          className="border p-2 rounded"
        />

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 col-span-full"
        >
          {isEditing ? "Update" : "Add"} Student
        </button>
      </form>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <input
          type="text"
          placeholder="🔍 Search by name/class/email/father/mobile"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded w-full md:w-80"
        />
        <select
          value={filterClass}
          onChange={(e) => setFilterClass(e.target.value)}
          className="border p-2 rounded"
        >
          {classList.map((cls) => (
            <option key={cls} value={cls}>
              {cls}
            </option>
          ))}
        </select>
      </div>

      {/* Student List */}
      <ul className="space-y-4">
        {filteredStudents.map((student) => (
          <li
            key={student.id}
            className="p-4 bg-white border rounded shadow flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
          >
            <div>
              <p>
                <strong>Name:</strong> {student.name}
              </p>
              <p>
                <strong>Email:</strong> {student.email}
              </p>
              <p>
                <strong>Father's Name:</strong> {student.fatherName}
              </p>
              <p>
                <strong>DOB:</strong> {student.dob}
              </p>
              <p>
                <strong>Aadhar No:</strong> {student.aadhar}
              </p>
              <p>
                <strong>Mobile:</strong> {student.mobile}
              </p>
              <p>
                <strong>Address:</strong> {student.address}
              </p>
              <p>
                <strong>Class:</strong> {student.class}
              </p>
              {student.photoUrl && (
                <img
                  src={student.photoUrl}
                  alt={student.name}
                  className="w-24 h-24 object-cover rounded mt-2"
                />
              )}
            </div>
            <div className="flex gap-2 mt-2 md:mt-0">
              <button
                onClick={() => handleEdit(student)}
                className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(student.id)}
                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
