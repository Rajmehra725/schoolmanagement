'use client';
import { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/getCurrentUser";

export default function TeacherDashboard() {
  const [user, setUser] = useState<{ email: string; role: string } | null>(null);

  useEffect(() => {
    getCurrentUser().then(setUser);
  }, []);

  if (!user) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4 text-green-600">Teacher Dashboard</h1>
      <p>Welcome, <strong>{user.email}</strong></p>
      <p>Your role: <strong>{user.role}</strong></p>
    </div>
  );
}
