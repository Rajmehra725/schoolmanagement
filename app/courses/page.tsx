// app/courses/page.tsx
'use client';
import React from 'react';
import { FaBookOpen, FaChalkboard, FaLaptop, FaStar } from 'react-icons/fa';

const classDetails = [
  { name: 'Nursery', description: 'Foundational activities focusing on motor skills, phonics, and play-based learning.' },
  { name: 'KG', description: 'Interactive learning of alphabets, numbers, rhymes, and basic concepts.' },
  { name: 'Class 1', description: 'Introduction to reading, writing, basic arithmetic, and art integration.' },
  { name: 'Class 2', description: 'Strengthening language and math skills with engaging classroom activities.' },
  { name: 'Class 3', description: 'Developing comprehension, science awareness, and team collaboration.' },
  { name: 'Class 4', description: 'Balanced focus on academics, critical thinking, and co-curriculars.' },
  { name: 'Class 5', description: 'Preparation for upper primary, with project-based and activity-driven learning.' },
  { name: 'Class 6', description: 'Introduction to advanced subjects with focus on analytical skills.' },
  { name: 'Class 7', description: 'Deepening understanding of core subjects and real-world applications.' },
  { name: 'Class 8', description: 'Pre-board foundation, concept clarity, and problem-solving development.' },
  { name: 'Class 9', description: 'CBSE-aligned syllabus with lab sessions and performance tracking.' },
  { name: 'Class 10', description: 'Board exam readiness, weekly assessments, and personalized mentoring.' },
  { name: 'Class 11', description: 'Streams: Science, Commerce & Arts – with lab and career guidance.' },
  { name: 'Class 12', description: 'Final year preparation with mock boards, revision plans, and counseling.' },
];

const CoursesPage = () => {
  return (
    <main className="max-w-7xl mx-auto px-4 py-16">
      <section className="text-center mb-12">
        <h1 className="text-5xl font-bold text-orange-600 mb-4">Courses & Classes</h1>
        <p className="text-lg text-gray-700 max-w-3xl mx-auto">
          Explore our thoughtfully crafted curriculum from Nursery to Class 12, designed to nurture every child’s academic and personal growth.
        </p>
      </section>

      {/* Course Cards */}
      <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
        {classDetails.map((course, idx) => (
          <div
            key={idx}
            className="bg-white p-6 rounded-xl border shadow hover:shadow-orange-400 transition"
          >
            <FaBookOpen className="text-orange-500 text-3xl mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">{course.name}</h2>
            <p className="text-gray-600 text-sm">{course.description}</p>
          </div>
        ))}
      </section>

      {/* Features Section */}
      <section className="mb-20 text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-10">Why Our Classes Stand Out</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              icon: <FaChalkboard />,
              title: 'Activity-Based Learning',
              desc: 'Hands-on tasks and real-world examples for better concept retention.',
            },
            {
              icon: <FaLaptop />,
              title: 'Digital Classroom Tools',
              desc: 'Smart boards, online homework, and access to recorded sessions.',
            },
            {
              icon: <FaStar />,
              title: 'Holistic Development',
              desc: 'Focus on academics, sports, arts, values, and emotional well-being.',
            },
            {
              icon: <FaBookOpen />,
              title: 'Personalized Support',
              desc: 'Remedial classes, mentoring, and parent-teacher collaboration.',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-orange-50 p-6 rounded-xl border hover:shadow-md transition"
            >
              <div className="text-4xl text-orange-500 mb-3 mx-auto">{item.icon}</div>
              <h3 className="text-xl font-semibold text-gray-800">{item.title}</h3>
              <p className="text-gray-600 mt-2 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center bg-orange-100 py-10 rounded-xl">
        <h3 className="text-2xl font-bold text-orange-700 mb-2">Admissions Open!</h3>
        <p className="text-gray-700 mb-4">Join Raaz EduTech and give your child the best learning experience.</p>
        <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-md font-semibold transition">
          Enroll Now
        </button>
      </section>
    </main>
  );
};

export default CoursesPage;
