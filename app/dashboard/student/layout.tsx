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
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ email: string; role: string } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
    return (
      <div className="flex h-screen items-center justify-center text-indigo-600 animate-pulse font-semibold text-xl">
        Authenticating...
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-tr from-blue-50 via-white to-indigo-50">
      {/* Sidebar */}
      <AnimatePresence>
        {(sidebarOpen || typeof window !== 'undefined') && (
          <motion.aside
            key="sidebar"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 250, damping: 30 }}
            className="fixed md:relative z-40 inset-y-0 left-0 bg-white w-64 shadow-lg px-5 py-6 rounded-r-3xl border-r border-gray-200 flex flex-col justify-between"
          >
            <div>
              <h2 className="text-2xl font-extrabold text-indigo-700 mb-8">🎓 Student Panel</h2>
              <nav className="space-y-2">
                {navItems.map(({ label, href, icon: Icon }) => {
                  const active = pathname === href;
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={`flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 group ${
                        active
                          ? 'bg-indigo-100 text-indigo-800 shadow-inner'
                          : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-700'
                      }`}
                    >
                      <Icon className={`w-5 h-5 transition group-hover:scale-110 ${active ? 'text-indigo-700' : ''}`} />
                      <span className="group-hover:translate-x-1 transition">{label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="text-xs text-gray-500">
              <p className="truncate">{user.email}</p>
              <button
                className="mt-3 flex items-center gap-2 text-red-600 hover:underline hover:text-red-700 transition-all"
                onClick={() => {
                  localStorage.removeItem('user');
                  router.push('/logout');
                }}
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main content & topbar */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Topbar */}
        <div className="md:hidden bg-gradient-to-r from-indigo-600 to-blue-600 text-white flex justify-between items-center px-4 py-3 shadow-lg z-20">
          <button onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <h1 className="font-semibold text-lg">Raaz EduTech</h1>
        </div>

        {/* Page Content */}
        <motion.main
          key={pathname}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="flex-1 overflow-y-auto px-6 py-6 md:px-10 md:py-8 bg-white rounded-tl-3xl shadow-inner"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
