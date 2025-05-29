'use client';

const homeSections = [
  {
    id: 'hero',
    title: 'Welcome to Smart School',
    description: 'Empowering education through innovation and technology. A digital-first platform for future-ready learning.',
    imageUrl: 'https://www.joonsquare.com/usermanage/image/business/divine-blessing-school-saharanpur-2257/divine-blessing-school-saharanpur-a1.jpg',
    buttonText: 'Apply Now',
    link: '/admissions',
  },
  {
    id: 'about',
    title: 'About Us',
    description:
      'Smart School is dedicated to nurturing future leaders through excellence in education, discipline, and values. Our school fosters creativity, innovation, and digital literacy for a better tomorrow.',
    imageUrl: 'https://www.joonsquare.com/usermanage/image/business/divine-blessing-school-saharanpur-2257/about.jpg',
    buttonText: 'Learn More',
    link: '/about',
  },
  {
    id: 'features',
    title: 'Why Choose Us?',
    description:
      '✅ Smart Digital Classrooms\n✅ Experienced & Certified Faculty\n✅ Co-curricular and Sports Activities\n✅ Real-time Attendance Tracking\n✅ Online Exam & Digital Report Cards\n✅ Secure Campus Surveillance\n✅ Parent-Teacher Communication Portal\n✅ Online Fee Payment System',
  },
  {
    id: 'stats',
    title: 'Our Achievements',
    description:
      '🎓 1200+ Students\n👨‍🏫 60+ Teachers\n🏫 15 Years of Excellence\n📚 40+ Subjects\n🏆 25+ Awards Won\n🌐 100% Digital Transformation',
  },
  {
    id: 'admissions',
    title: 'Admissions Open 2025-26',
    description:
      'Smart School is now accepting applications for Nursery to Grade 12. Book a school tour or apply online now.',
    buttonText: 'Start Application',
    link: '/admissions',
  },
  {
    id: 'announcements',
    title: 'Latest Announcements',
    description: 'Stay updated with our upcoming events, holidays, and parent meetings. Check this space regularly.',
    buttonText: 'View All Announcements',
    link: '/announcements',
  },
  {
    id: 'academics',
    title: 'Academic Excellence',
    description: 'Our curriculum is designed to blend CBSE guidelines with innovation and personalized learning paths. We focus on both theoretical and practical knowledge.',
  },
  {
    id: 'testimonials',
    title: 'What People Say',
    description:
      '"The best school for my child!" – Parent\n"Teachers are very supportive and modern classrooms help a lot." – Student\n"Excellent academic and moral education." – Parent',
  },
  {
    id: 'gallery',
    title: 'Photo Gallery',
    description: 'A glimpse of our vibrant school life – from classrooms to cultural events and science fairs.',
    buttonText: 'View Full Gallery',
    link: '/gallery',
  },
  {
    id: 'faculty',
    title: 'Meet Our Faculty',
    description: 'Our teachers are certified professionals with vast experience and a passion for education. Continuous training and development ensure quality teaching.',
  },
  {
    id: 'contact',
    title: 'Contact Us',
    description:
      '📍 Smart School, City Center, Mumbai\n📞 +91-9876543210\n✉️ contact@smartschool.edu.in\n📅 Office Hours: Mon–Fri, 9:00 AM – 5:00 PM',
  },
];

export default function HomePage() {
  return (
    <div className="space-y-16 p-6 md:p-10 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {homeSections.map((section) => (
        <section
          key={section.id}
          id={section.id}
          className="rounded-2xl shadow-md bg-white dark:bg-gray-800 p-6"
        >
          <h2 className="text-2xl font-bold text-orange-600 mb-2">{section.title}</h2>
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
            {section.description}
          </p>

          {section.imageUrl && (
            <div className="mt-4">
              <img
                src={section.imageUrl}
                alt={section.title}
                className="rounded-xl shadow w-full h-auto"
              />
            </div>
          )}

          {section.buttonText && section.link && (
            <a
              href={section.link}
              className="inline-block mt-4 px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition"
            >
              {section.buttonText}
            </a>
          )}
        </section>
      ))}

     
    </div>
  );
}
