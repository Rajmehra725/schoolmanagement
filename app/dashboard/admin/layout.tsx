'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getCurrentUser } from '@/lib/getCurrentUser';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  User,
  BookOpen,
  CalendarCheck,
  Bell,
  Menu,
  LogOut,
  Newspaper
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ email: string; role: string } | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
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
  { label: 'Attendance', href: '/dashboard/admin/attendance', icon: CalendarCheck },
  { label: 'Notification', href: '/dashboard/admin/notification', icon: Bell },
  { label: 'Blog', href: '/dashboard/admin/blog', icon: Newspaper }
];

  const handleLinkClick = () => {
    // Close menu on link click
    setMenuOpen(false);
  };

  if (!user) {
    return <div className="flex h-screen items-center justify-center">Checking authentication...</div>;
  }

  return (
    <div className="flex h-screen flex-col md:flex-row bg-gray-100">
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between bg-white shadow px-4 py-3">
        <h2 className="text-xl font-bold text-blue-600">Admin Panel</h2>
        <button onClick={() => setMenuOpen(!menuOpen)} className="text-blue-600">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Overlay and Slide Sidebar for Mobile */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-40 md:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <aside
        className={`fixed md:static z-50 md:z-10 w-64 bg-white shadow-md px-4 py-6 h-full transform transition-transform duration-300 md:translate-x-0 ${
          menuOpen ? 'translate-x-0' : '-translate-x-full'
        } md:flex flex-col justify-between`}
      >
        <div>
          <h2 className="text-2xl font-bold text-blue-600 mb-6 hidden md:block">Admin Panel</h2>
          <nav className="space-y-2">
            {navItems.map(({ label, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={handleLinkClick}
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
        <div className="text-sm text-gray-500 mt-6 md:mt-0">
          <p>{user.email}</p>
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
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 overflow-y-auto">{children}</main>
    </div>
  );
}
