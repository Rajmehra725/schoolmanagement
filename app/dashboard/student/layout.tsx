'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getCurrentUser } from '@/lib/getCurrentUser';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  CalendarDays,
  FileText,
  LogOut
} from 'lucide-react';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ email: string; role: string } | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    getCurrentUser().then((userData) => {
      if (!userData || userData.role !== 'student') {
        router.push('/login');
      } else {
        setUser(userData);
      }
    });
  }, [router]);

  const navItems = [
    { label: 'My Classes', href: '/dashboard/student/classes', icon: BookOpen },
    { label: 'My Attendance', href: '/dashboard/student/attendance', icon: CalendarDays },
    { label: 'Report Card', href: '/dashboard/student/report-card', icon: FileText }
  ];

  if (!user) {
    return <div className="flex h-screen items-center justify-center">Authenticating...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md px-4 py-6 flex flex-col justify-between">
        <div>
          <h2 className="text-2xl font-bold text-indigo-600 mb-6">Student Panel</h2>
          <nav className="space-y-2">
            {navItems.map(({ label, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-100 ${
                  pathname === href ? 'bg-indigo-200 text-indigo-900 font-semibold' : 'text-gray-700'
                }`}
              >
                <Icon className="w-5 h-5" />
                {label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="text-sm text-gray-500">
          <p>{user.email}</p>
          <button
            className="flex items-center gap-2 text-red-600 mt-2 hover:underline"
            onClick={() => {
              localStorage.removeItem('user');
              router.push('/login');
            }}
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
