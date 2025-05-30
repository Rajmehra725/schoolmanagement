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
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setLoading(false);
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    window.location.href = "/login";
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <svg
          className="animate-spin h-10 w-10 text-green-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-label="Loading spinner"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8z"
          ></path>
        </svg>
      </div>
    );

  if (!user)
    return (
      <p className="text-center mt-10 text-red-600 font-semibold">
        No user data found. Please login.
      </p>
    );

  return (
    <div className="p-6 max-w-4xl mx-auto bg-gray-50 rounded-xl shadow-md">
      <h1 className="text-3xl font-bold text-green-700 mb-6 text-center">
        👨‍🏫 Teacher Dashboard
      </h1>

      <div className="bg-white rounded-xl shadow p-6 border mb-6 flex flex-col sm:flex-row gap-6 items-center">
        <img
          src={user.photoUrl || "/default-avatar.png"}
          alt={user.name ? `${user.name}'s photo` : "User photo"}
          className="w-32 h-32 rounded-full object-cover border-4 border-green-600"
        />

        <div className="flex-1 text-gray-700 space-y-2">
          <p>
            <strong>Name:</strong> {user.name || "N/A"}
          </p>
          <p>
            <strong>Email:</strong> {user.email || "N/A"}
          </p>
          <p>
            <strong>Father's Name:</strong> {user.fatherName || "N/A"}
          </p>
          <p>
            <strong>Mobile:</strong> {user.mobile || user.phone || "N/A"}
          </p>
          <p>
            <strong>Qualification:</strong> {user.qualification || "N/A"}
          </p>
          <p>
            <strong>Subject:</strong> {user.subject || "N/A"}
          </p>
          <p>
            <strong>Role:</strong> {user.role || "N/A"}
          </p>
          {user.resumeUrl && (
            <p>
              <strong>Resume:</strong>{" "}
              <a
                href={user.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
                aria-label="View Resume"
              >
                View Resume
              </a>
            </p>
          )}
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg shadow"
          aria-label="Logout"
        >
          🚪 Logout
        </button>
      </div>
    </div>
  );
}
