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
  NotebookText	,
  LogOut,
  Menu,
  X, Bell
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
    { label: 'Syllabus-Tracker', href: '/dashboard/teacher/syllabus-tracker', icon: NotebookText	 },
    { label: 'Notification', href: '/dashboard/teacher/notification', icon: Bell	 }
  ];

  if (!user) {
    return <div className="flex h-screen items-center justify-center text-gray-600 text-lg">Authenticating...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile Sidebar Toggle */}
      <div className="md:hidden absolute top-4 left-4 z-50">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-md bg-white shadow-md">
          {sidebarOpen ? <X className="w-6 h-6 text-green-600" /> : <Menu className="w-6 h-6 text-green-600" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-md px-4 py-6 z-40 transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static`}
      >
        <div className="flex flex-col justify-between h-full">
          <div>
            <h2 className="text-2xl font-bold text-green-600 mb-6 text-center">Teacher Panel</h2>
            <nav className="space-y-2">
              {navItems.map(({ label, href, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium hover:bg-green-100 transition-colors ${
                    pathname === href ? 'bg-green-200 text-green-900 font-semibold' : 'text-gray-700'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="text-sm text-gray-500 mt-6 border-t pt-4">
            <p className="truncate">{user.email}</p>
            <button
              className="flex items-center gap-2 text-red-600 mt-2 hover:underline"
              onClick={() => {
                localStorage.removeItem('user');
                router.push('/logout');
              }}
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:ml-64 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
