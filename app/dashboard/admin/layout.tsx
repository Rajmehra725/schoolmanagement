'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getCurrentUser } from '@/lib/getCurrentUser';
import { useRouter } from 'next/navigation';
import {
  User,
  Users,
  BookOpen,
  CalendarDays,
  LogOut,
  LayoutDashboard
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ email: string; role: string } | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    getCurrentUser().then((userData) => {
      if (!userData || userData.role !== 'admin') {
        router.push('/login');
      } else {
        setUser(userData);
      }
    });
  }, [router]);

  const navItems = [
    { label: 'Dashboard', href: '/dashboard/admin', icon: LayoutDashboard },
    { label: 'Students', href: '/dashboard/admin/students', icon: Users },
    { label: 'Teachers', href: '/dashboard/admin/teachers', icon: User },
    { label: 'Classes', href: '/dashboard/admin/classes', icon: BookOpen },
    { label: 'Attendance', href: '/dashboard/admin/attendance', icon: CalendarDays }
  ];

  if (!user) {
    return <div className="flex h-screen items-center justify-center">Checking authentication...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md px-4 py-6 flex flex-col justify-between">
        <div>
          <h2 className="text-2xl font-bold text-blue-600 mb-6">Admin Panel</h2>
          <nav className="space-y-2">
            {navItems.map(({ label, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-100 ${
                  pathname === href ? 'bg-blue-200 text-blue-900 font-semibold' : 'text-gray-700'
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
