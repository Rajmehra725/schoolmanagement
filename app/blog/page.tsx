'use client';

import { useEffect, useState } from 'react';
import { db } from '@/firebase/config';
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  arrayUnion,
  Timestamp,
} from 'firebase/firestore';

export default function PublicBlogPage() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBlogs = async () => {
    const snap = await getDocs(collection(db, 'blogs'));
    const docs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setBlogs(docs);
    setLoading(false);
  };

  const likePost = async (id: string) => {
    const ref = doc(db, 'blogs', id);
    await updateDoc(ref, {
      likes: arrayUnion('user'), // Replace with user ID if login system exists
    });
    fetchBlogs();
  };

  const addComment = async (id: string, text: string) => {
    if (!text.trim()) return;
    const ref = doc(db, 'blogs', id);
    await updateDoc(ref, {
      comments: arrayUnion({
        user: 'guest',
        text,
        time: Timestamp.now(),
      }),
    });
    fetchBlogs();
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    alert('🔗 Blog link copied!');
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-center text-orange-600">📚 Blog Posts</h1>

      {loading ? (
        <p className="text-center text-gray-600">⏳ Loading blogs...</p>
      ) : blogs.length === 0 ? (
        <p className="text-center text-gray-600">No blogs yet.</p>
      ) : (
        blogs.map(blog => (
          <div key={blog.id} className="bg-white p-4 rounded shadow space-y-3">
            <img
              src={blog.imageUrl}
              alt="blog"
              className="w-full max-h-[500px] object-contain rounded border"
            />
            <h2 className="text-2xl font-bold text-gray-800">{blog.title}</h2>
            <p className="italic text-gray-600">{blog.description}</p>
            <p className="text-gray-800">{blog.content}</p>

            <div className="text-sm text-gray-600 mt-2 flex flex-wrap gap-4">
              <span>👍 {blog.likes?.length || 0} Likes</span>
              <button onClick={() => likePost(blog.id)} className="text-blue-600 hover:underline">Like</button>
              <button
                onClick={() =>
                  copyToClipboard(`${window.location.origin}/blog/${blog.id}`)
                }
                className="text-green-600 hover:underline"
              >
                Share
              </button>
            </div>

            <div className="mt-3">
              <input
                className="w-full p-1 border rounded"
                placeholder="Write a comment and press Enter"
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    addComment(blog.id, (e.target as HTMLInputElement).value);
                    (e.target as HTMLInputElement).value = '';
                  }
                }}
              />
              <div className="mt-2 space-y-1 text-sm">
                {blog.comments?.map((c: any, i: number) => (
                  <div key={i}>
                    <strong>{c.user}:</strong> {c.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
