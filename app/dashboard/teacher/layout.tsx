'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getCurrentUser } from '@/lib/getCurrentUser';
import { useRouter } from 'next/navigation';
import {
  Users,
  CalendarCheck,
  CalendarDays,
  NotebookText,
  LogOut,
  Menu,
  X,
  Bell,
  MessageSquareHeartIcon
} from 'lucide-react';

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ email: string; role: string } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    getCurrentUser().then((userData) => {
      if (!userData || userData.role !== 'teacher') {
        router.push('/login');
      } else {
        setUser(userData);
      }
    });
  }, [router]);

  const navItems = [
    { label: 'My Students', href: '/dashboard/teacher/students', icon: Users },
    { label: 'Mark Attendance', href: '/dashboard/teacher/attendance', icon: CalendarCheck },
    { label: 'Schedule', href: '/dashboard/teacher/schedule', icon: CalendarDays },
    { label: 'Syllabus Tracker', href: '/dashboard/teacher/syllabus-tracker', icon: NotebookText },
    { label: 'Notification', href: '/dashboard/teacher/notification', icon: Bell },
    { label: 'Chat', href: '/dashboard/teacher/chat', icon: MessageSquareHeartIcon },
    { label: 'Logout', href: '/logout', icon: LogOut }
  ];

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center text-gray-600 text-lg">
        Authenticating...
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-md bg-white shadow"
        >
          {sidebarOpen ? <X className="w-6 h-6 text-green-600" /> : <Menu className="w-6 h-6 text-green-600" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-md z-40 transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static`}
      >
        <div className="h-full flex flex-col p-4">
          <div className="mb-6 text-green-700 text-2xl font-bold text-center">
            📘 Teacher Panel
          </div>

          <nav className="flex-1 space-y-2">
            {navItems.map(({ label, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium
                  ${
                    pathname === href
                      ? 'bg-green-100 text-green-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className="w-5 h-5" />
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-4 md:p-6 mt-14 md:mt-0 w-full">
        {children}
      </main>
    </div>
  );
}
