'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
   // mock login state

  const toggleMenu = () => setIsOpen(!isOpen);
 

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Teachers', href: '/teachers' },
    { label: 'About', href: '/about' },
     { label: 'Login', href: '/login' },
  ];

  return (
    <nav className="bg-orange-600 text-white shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-4">
        <Link href="/" className="text-2xl font-bold">MySchool</Link>

        {/* Desktop Menu */}
        <ul className="hidden md:flex space-x-6 items-center">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="hover:text-yellow-300 transition">
                {item.label}
              </Link>
            </li>
          ))}
         
        </ul>

        {/* Mobile Toggle */}
        <div className="md:hidden">
          <button onClick={toggleMenu}>{isOpen ? <X size={28} /> : <Menu size={28} />}</button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <ul className="md:hidden bg-orange-500 px-4 pb-4 space-y-2">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="block py-2 border-b border-orange-400 hover:text-yellow-200 transition"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            </li>
          ))}
         
        </ul>
      )}
    </nav>
  );
}
