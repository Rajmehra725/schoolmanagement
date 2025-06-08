'use client';

import React, { useEffect, useState } from 'react';
import {
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  deleteDoc,
  updateDoc,
  doc,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import { db } from '@/firebase/config';

interface InstagramPost {
  id: string;
  url: string;
}

export default function InstagramAdminPage() {
  const [url, setUrl] = useState('');
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editUrl, setEditUrl] = useState('');
  const [deletedPost, setDeletedPost] = useState<InstagramPost | null>(null);

  // Fetch posts in real-time
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'instagramPosts'), (snapshot) => {
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        url: doc.data().url,
      }));
      setPosts(items);
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return setMsg('Please enter a URL.');

    setLoading(true);
    setMsg('');
    try {
      await addDoc(collection(db, 'instagramPosts'), {
        url,
        createdAt: serverTimestamp(),
      });
      setMsg('URL added successfully!');
      setUrl('');
    } catch (error) {
      setMsg('Error adding URL.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (post: InstagramPost) => {
    try {
      await deleteDoc(doc(db, 'instagramPosts', post.id));
      setDeletedPost(post);
      setMsg('Post deleted. Undo?');

      // Undo timeout (5s)
      setTimeout(() => {
        setDeletedPost(null);
        setMsg('');
      }, 5000);
    } catch (error) {
      console.error(error);
      setMsg('Error deleting post.');
    }
  };

  const handleUndo = async () => {
    if (deletedPost) {
      try {
        await addDoc(collection(db, 'instagramPosts'), {
          url: deletedPost.url,
          createdAt: serverTimestamp(),
        });
        setMsg('Post restored!');
      } catch (error) {
        console.error(error);
        setMsg('Failed to restore post.');
      } finally {
        setDeletedPost(null);
      }
    }
  };

  const handleEdit = async (id: string) => {
    if (!editUrl.trim()) return setMsg('Please enter a new URL.');

    try {
      await updateDoc(doc(db, 'instagramPosts', id), { url: editUrl });
      setMsg('Post updated!');
      setEditingId(null);
      setEditUrl('');
    } catch (error) {
      console.error(error);
      setMsg('Error updating post.');
    }
  };

  const handleDeleteAll = async () => {
    const confirm = window.confirm('Are you sure you want to delete ALL posts?');
    if (!confirm) return;

    try {
      const snapshot = await getDocs(collection(db, 'instagramPosts'));
      const batch = writeBatch(db);
      snapshot.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
      setMsg('All posts deleted!');
    } catch (error) {
      console.error(error);
      setMsg('Failed to delete all posts.');
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <section className="bg-white p-8 rounded shadow-md w-full max-w-md mb-10">
        <h1 className="text-2xl font-bold mb-6 text-orange-600 text-center">
          Admin: Add Instagram Post URL
        </h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="url"
            placeholder="Enter Instagram Post URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="border border-gray-300 p-3 rounded"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-orange-600 text-white py-3 rounded hover:bg-orange-700 disabled:opacity-50"
          >
            {loading ? 'Adding...' : 'Add URL'}
          </button>
        </form>
        {msg && (
          <div className="mt-4 text-center text-sm text-gray-700">
            {msg}{' '}
            {deletedPost && (
              <button
                onClick={handleUndo}
                className="text-blue-600 underline ml-2"
              >
                Undo
              </button>
            )}
          </div>
        )}
      </section>

      <section className="w-full max-w-2xl bg-white p-6 rounded shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Existing Posts</h2>
          {posts.length > 0 && (
            <button
              onClick={handleDeleteAll}
              className="text-red-600 font-medium hover:underline text-sm"
            >
              🗑️ Delete All
            </button>
          )}
        </div>
        <ul className="space-y-4">
          {posts.map((post) => (
            <li
              key={post.id}
              className="flex justify-between items-center border-b pb-2"
            >
              {editingId === post.id ? (
                <div className="flex-grow">
                  <input
                    type="url"
                    value={editUrl}
                    onChange={(e) => setEditUrl(e.target.value)}
                    className="border p-1 w-full rounded"
                  />
                  <div className="flex justify-end space-x-2 mt-1 text-sm">
                    <button
                      onClick={() => handleEdit(post.id)}
                      className="text-green-600 hover:underline"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(null);
                        setEditUrl('');
                      }}
                      className="text-gray-500 hover:underline"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <span className="text-sm truncate max-w-[250px]">{post.url}</span>
                  <div className="flex gap-2 text-sm">
                    <button
                      onClick={() => {
                        setEditingId(post.id);
                        setEditUrl(post.url);
                      }}
                      className="text-blue-500 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(post)}
                      className="text-red-500 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
