// app/page.tsx
import Head from "next/head";

export default function HomePage() {
  return (
    <>
      <Head>
        <title>School Management System | Home</title>
        <meta name="description" content="Manage your school efficiently with student, teacher, attendance, and fee tracking in one place." />
        <meta name="keywords" content="School Management, Student Info, Attendance, Fees, Teachers, Firebase, Next.js, Tailwind" />
        <meta name="author" content="Raaz Mehra" />
        <meta property="og:title" content="School Management System" />
        <meta property="og:description" content="Modern school management built using Next.js and Firebase." />
      </Head>

     

      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-6">
        <div className="text-center max-w-xl">
          <h1 className="text-4xl font-bold text-blue-600 mb-4">
            Welcome to School Management System
          </h1>
          <p className="text-lg text-gray-700 mb-6">
            A modern, secure, and powerful platform to manage your school’s students, teachers, attendance, and more.
          </p>
          <a
            href="/dashboard"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-all"
          >
            Go to Dashboard
          </a>
        </div>
      </main>
    </>
  );
}
