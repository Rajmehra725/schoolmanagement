// app/page.tsx
export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white">
      <h1 className="text-5xl font-bold mb-4">Tailwind CSS is Working! 🚀</h1>
      <p className="text-lg text-center max-w-md">
        This page is styled using Tailwind CSS. If you see this with gradient background, centered text, and glowing styles — it means Tailwind is installed correctly!
      </p>
      <button className="mt-6 px-6 py-2 bg-white text-blue-600 font-semibold rounded-full shadow-md hover:scale-105 transition">
        Click Me!
      </button>
    </main>
  );
}
