'use client';

import { useEffect, useState } from "react";
import { getCurrentUser, CurrentUserData } from "@/lib/getCurrentUser";
import { signOut } from "firebase/auth";
import { auth } from "@/firebase/config";

export default function TeacherDashboard() {
  const [user, setUser] = useState<CurrentUserData | null>(null);
  const [loading, setLoading] = useState(true);
useEffect(() => {
  const fetchUser = async () => {
    const currentUser = await getCurrentUser(); // fixed: removed invalid argument
    setUser(currentUser);
    setLoading(false);
  };

  fetchUser();
}, []);


  const handleLogout = async () => {
    await signOut(auth);
    window.location.href = "/login";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <svg
          className="animate-spin h-10 w-10 text-green-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      </div>
    );
  }

  if (!user) {
    return (
      <p className="text-center mt-10 text-red-600 font-semibold">
        No user data found. Please login.
      </p>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto bg-gray-50 rounded-xl shadow-md">
      <h1 className="text-3xl sm:text-4xl font-bold text-green-700 mb-6 text-center animate-pulse">
        👨‍🏫 Welcome, {user.name?.split(" ")[0] || "Teacher"}!
      </h1>

      {/* Profile Section */}
      <div className="bg-white rounded-xl shadow p-4 sm:p-6 border mb-6 flex flex-col sm:flex-row gap-6 items-center sm:items-start">
        <img
          src={user.photoUrl || "/default-avatar.png"}
          alt={user.name ? `${user.name}'s photo` : "User photo"}
          className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-green-600"
        />

        <div className="flex-1 text-gray-700 space-y-2 text-sm sm:text-base w-full">
          <p><strong>Name:</strong> {user.name || "N/A"}</p>
          <p><strong>Email:</strong> {user.email || "N/A"}</p>
          <p><strong>Role:</strong> {user.role || "N/A"}</p>
          <p><strong>Last Login:</strong> {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : "N/A"}</p>

          <button
            onClick={handleLogout}
            className="mt-4 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded shadow-md"
          >
            🔒 Logout
          </button>
        </div>
      </div>

      {/* Extra Features */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-2 text-green-600">📢 Announcements</h2>
          <p className="text-sm text-gray-600">No announcements yet.</p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-2 text-green-600">📊 Performance Stats</h2>
          <p className="text-sm text-gray-600">Feature under development.</p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-2 text-green-600">📝 Recent Activity</h2>
          <p className="text-sm text-gray-600">Nothing to show right now.</p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-2 text-green-600">🔗 Quick Links</h2>
          <ul className="text-sm text-blue-600 space-y-1">
            <li><a href="/dashboard/teacher/students" className="hover:underline">My Students</a></li>
            <li><a href="/dashboard/teacher/attendance" className="hover:underline">Mark Attendance</a></li>
            <li><a href="/dashboard/teacher/chat" className="hover:underline">Chat</a></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
