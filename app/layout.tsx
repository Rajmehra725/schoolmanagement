// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar/page";
import Footer from "@/components/Footer/page";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "School Management System",
  description: "Manage students, teachers, attendance and fees with ease using Next.js and Firebase.",
  keywords: ["School Management System", "Next.js", "Firebase", "Attendance", "Students", "Teachers", "Fees"],
  authors: [{ name: "Raaz Mehra" }],
  creator: "Raaz Mehra",
  metadataBase: new URL("https://spsmanagement.vercel.app"),
  openGraph: {
    title: "School Management System",
    description: "Modern, secure, and efficient school management built with Next.js 13+.",
    url: "https://spsmanagement.vercel.app",
    siteName: " Raaz EduTech",
    images: [
      {
        url: "https://spsmanagement.vercel.app/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "School Management Dashboard",
      },
    ],
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "School Management System",
    description: "Manage school records easily with Firebase and Next.js",
    images: ["https://spsmanagement.vercel.app/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-gray-900`}
      >
        <Navbar/>
        {children}
        <Footer/>
      </body>
    </html>
  );
}
