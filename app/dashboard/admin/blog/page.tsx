'use client';

import { useEffect, useState } from 'react';
import { db } from '@/firebase/config';
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  arrayUnion,
  Timestamp,
} from 'firebase/firestore';

export default function AdminBlogPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  const fetchBlogs = async () => {
    setLoading(true);
    const snap = await getDocs(collection(db, 'blogs'));
    const docs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setBlogs(docs);
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!title || !description || !content || !imageUrl) {
      setMessage('❌ Please fill in all fields.');
      return;
    }

    const blogData = {
      title,
      description,
      content,
      imageUrl,
      likes: [],
      comments: [],
      createdAt: Timestamp.now(),
    };

    try {
      if (editId) {
        await updateDoc(doc(db, 'blogs', editId), blogData);
        setMessage('✅ Blog updated successfully!');
      } else {
        await addDoc(collection(db, 'blogs'), blogData);
        setMessage('✅ Blog created successfully!');
      }

      setTitle('');
      setDescription('');
      setContent('');
      setImageUrl('');
      setEditId(null);
      fetchBlogs();
    } catch (error) {
      console.error(error);
      setMessage('❌ Error while saving blog.');
    }
  };

  const likePost = async (id: string) => {
    await updateDoc(doc(db, 'blogs', id), {
      likes: arrayUnion('admin'),
    });
    fetchBlogs();
  };

  const addComment = async (id: string, text: string) => {
    if (!text.trim()) return;
    await updateDoc(doc(db, 'blogs', id), {
      comments: arrayUnion({
        user: 'admin',
        text,
        time: Timestamp.now(),
      }),
    });
    fetchBlogs();
  };

  const deleteBlog = async (id: string) => {
    const confirmDelete = confirm('Are you sure you want to delete this blog?');
    if (!confirmDelete) return;
    await deleteDoc(doc(db, 'blogs', id));
    setMessage('🗑️ Blog deleted.');
    fetchBlogs();
  };

  const startEditing = (blog: any) => {
    setEditId(blog.id);
    setTitle(blog.title);
    setDescription(blog.description || '');
    setContent(blog.content);
    setImageUrl(blog.imageUrl);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-orange-600">📝 Admin Blog Panel</h1>

      {message && (
        <div className="bg-yellow-100 text-yellow-800 p-3 rounded">{message}</div>
      )}

      <div className="bg-white p-4 rounded shadow space-y-4">
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Blog Title"
          className="w-full p-2 border rounded"
        />
        <input
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Short Description"
          className="w-full p-2 border rounded"
        />
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Full Blog Content"
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          value={imageUrl}
          onChange={e => setImageUrl(e.target.value)}
          placeholder="Image URL (https://...)"
          className="w-full p-2 border rounded"
        />
        <button
          onClick={handleSubmit}
          className="w-full py-2 rounded text-white bg-blue-600 hover:bg-blue-700"
        >
          {editId ? 'Update Blog' : 'Create Blog'}
        </button>
      </div>

      <hr />

      {loading ? (
        <p className="text-center">⏳ Loading blogs...</p>
      ) : blogs.length === 0 ? (
        <p className="text-center text-gray-600">No blogs found.</p>
      ) : (
        <div className="space-y-6">
          {blogs.map(blog => (
            <div key={blog.id} className="bg-gray-100 p-4 rounded shadow">
              {blog.imageUrl && (
                <img
                  src={blog.imageUrl}
                  className="w-full max-h-[500px] object-contain rounded border border-gray-300 mx-auto"
                  alt="blog"
                />
              )}
              <h2 className="text-2xl font-bold mt-3">{blog.title}</h2>
              <p className="text-gray-700 italic mt-1">{blog.description}</p>
              <p className="mt-2 text-gray-800">{blog.content}</p>
              <p className="text-sm mt-2">👍 {blog.likes?.length || 0} likes</p>

              <div className="flex space-x-4 mt-2 text-sm">
                <button
                  className="text-blue-600 hover:underline"
                  onClick={() => likePost(blog.id)}
                >
                  Like
                </button>
                <button
                  className="text-green-600 hover:underline"
                  onClick={() => startEditing(blog)}
                >
                  Edit
                </button>
                <button
                  className="text-red-600 hover:underline"
                  onClick={() => deleteBlog(blog.id)}
                >
                  Delete
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
          ))}
        </div>
      )}
    </div>
  );
}
