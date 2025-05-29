// app/about/page.tsx
'use client';
import React from 'react';
import { FaChalkboardTeacher, FaUsers, FaSchool, FaLaptopCode, FaCalendarCheck, FaFileAlt } from 'react-icons/fa';

const AboutPage = () => {
  return (
    <main className="max-w-7xl mx-auto px-4 py-16">
      {/* Header Section */}
      <section className="text-center mb-16">
        <h1 className="text-5xl font-bold text-orange-600 mb-4">About Raaz EduTech</h1>
        <p className="text-lg text-gray-700 max-w-3xl mx-auto">
          Raaz EduTech is a next-generation School Management System designed to streamline administration, enrich learning, and empower every stakeholder in the education ecosystem.
        </p>
      </section>

      {/* Vision & Mission */}
      <section className="grid md:grid-cols-2 gap-12 mb-20">
        <div>
          <h2 className="text-3xl font-semibold text-gray-800 mb-4">Our Vision</h2>
          <p className="text-gray-600 text-lg">
            To create a digitally unified education system where management is effortless, communication is seamless, and education is impactful.
          </p>
        </div>
        <div>
          <h2 className="text-3xl font-semibold text-gray-800 mb-4">Our Mission</h2>
          <p className="text-gray-600 text-lg">
            Empower schools with tools that automate administrative tasks, enhance classroom experiences, and improve academic performance through technology.
          </p>
        </div>
      </section>

      {/* Platform Features */}
      <section className="mb-20">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">Key Features</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { icon: <FaChalkboardTeacher />, title: 'Teacher Dashboard', desc: 'Manage attendance, assignments, and student progress easily.' },
            { icon: <FaUsers />, title: 'Parent Engagement', desc: 'Get real-time updates about your child’s performance and school activities.' },
            { icon: <FaSchool />, title: 'Admin Control', desc: 'Centralized management of students, staff, fees, and reports.' },
            { icon: <FaLaptopCode />, title: 'Online Classes', desc: 'Integrated video classes and digital material access for remote learning.' },
            { icon: <FaCalendarCheck />, title: 'Smart Timetable', desc: 'Automated class schedules with conflict-free subject allocation.' },
            { icon: <FaFileAlt />, title: 'Report Cards & Exams', desc: 'Generate mark sheets, conduct online tests, and share results quickly.' },
          ].map((item, index) => (
            <div key={index} className="bg-white p-6 rounded-xl border shadow hover:shadow-orange-300 transition">
              <div className="text-4xl text-orange-500 mb-4 mx-auto">{item.icon}</div>
              <h3 className="text-xl font-semibold text-gray-800 text-center">{item.title}</h3>
              <p className="text-gray-600 mt-2 text-center">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Who We Are */}
      <section className="grid md:grid-cols-2 items-center gap-10 mb-20">
        <div>
          <h2 className="text-3xl font-semibold text-gray-800 mb-4">Who We Are</h2>
          <p className="text-gray-600 mb-4 text-lg">
            We are a team of technologists, educators, and designers passionate about transforming schools through technology. Raaz EduTech is designed using modern tools like Firebase, Next.js, and Tailwind CSS to deliver scalable, secure, and user-friendly interfaces.
          </p>
          <p className="text-gray-600 text-lg">
            Our system is crafted with deep understanding of school needs, ensuring that both teaching and management become joyful experiences.
          </p>
        </div>
        <img
          src="https://images.unsplash.com/photo-1584697964154-3dfecdfda1e4?auto=format&fit=crop&w=800&q=60"
          alt="Team working"
          className="rounded-xl w-full h-80 object-cover shadow"
        />
      </section>

      {/* Why Choose Us */}
      <section className="mb-20 text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-10">Why Choose Raaz EduTech?</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            '100% cloud-based & secure',
            'Multi-role access: Admin, Teacher, Parent, Student',
            'Real-time attendance & performance tracking',
            'Custom report generation',
            'Integrated fee & admission management',
            'Mobile-friendly responsive UI',
          ].map((point, index) => (
            <div
              key={index}
              className="bg-gray-50 p-6 rounded-xl border border-orange-100 shadow-sm hover:shadow-md transition"
            >
              <p className="text-lg text-gray-700 font-medium">{point}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer-like CTA */}
      <section className="text-center bg-orange-50 py-10 rounded-xl">
        <h3 className="text-2xl font-bold text-orange-600 mb-2">Ready to Transform Your School?</h3>
        <p className="text-gray-700 mb-4">Join hundreds of schools already using Raaz EduTech for smart management.</p>
        <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-md font-semibold transition">
          Get Started Today
        </button>
      </section>
    </main>
  );
};

export default AboutPage;
