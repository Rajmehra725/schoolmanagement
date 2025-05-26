import Link from 'next/link';
import { Github, Twitter, Linkedin } from 'lucide-react';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="border-t shadow-sm bg-white dark:bg-gray-900 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Branding */}
        <div>
          <div className="flex items-center space-x-2">
            <Image src="/logo.png" alt="EduPanel Logo" width={32} height={32} />
            <h2 className="text-xl font-bold text-orange-600 dark:text-orange-400">EduPanel</h2>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Empowering education through technology.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Quick Links</h3>
          <ul className="space-y-1 text-sm text-gray-500 dark:text-gray-400">
            <li><Link href="/">Home</Link></li>
            <li><Link href="/about">About</Link></li>
            <li><Link href="/contact">Contact</Link></li>
            <li><Link href="/login">Login</Link></li>
          </ul>
        </div>

        {/* Contact & Social */}
        <div>
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Connect</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">support@edupanel.com</p>
          <div className="flex space-x-4 mt-2">
            <Link href="https://github.com" target="_blank" aria-label="GitHub">
              <Github className="w-5 h-5 text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white" />
            </Link>
            <Link href="https://linkedin.com" target="_blank" aria-label="LinkedIn">
              <Linkedin className="w-5 h-5 text-gray-600 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-400" />
            </Link>
            <Link href="https://twitter.com" target="_blank" aria-label="Twitter">
              <Twitter className="w-5 h-5 text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-300" />
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t dark:border-gray-700 text-center py-4 text-sm text-gray-400 dark:text-gray-500">
        © {new Date().getFullYear()} EduPanel. All rights reserved.
      </div>
    </footer>
  );
}
