'use client';

import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase/config';


export default function InstagramGalleryPage() {
  const [posts, setPosts] = useState<string[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'instagramPosts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const urls = snapshot.docs.map(doc => doc.data().url);
      setPosts(urls);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const scriptId = 'instagram-embed-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.async = true;
      script.src = 'https://www.instagram.com/embed.js';
      document.body.appendChild(script);
    } else {
      // @ts-ignore
      if (window.instgrm) window.instgrm.Embeds.process();
    }
  }, [posts]);

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <section className="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-orange-600 mb-6 text-center">
          📸 Our Instagram Gallery
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-center">
          {posts.length === 0 && (
            <p className="text-center text-gray-500">No Instagram posts yet.</p>
          )}
          {posts.map((url, i) => (
            <blockquote
              key={i}
              className="instagram-media"
              data-instgrm-permalink={url}
              data-instgrm-version="14"
              style={{
                background: '#FFF',
                border: '0',
                borderRadius: '3px',
                boxShadow:
                  '0 0 1px 0 rgba(0,0,0,0.5), 0 1px 10px 0 rgba(0,0,0,0.15)',
                margin: '1px auto',
                maxWidth: '540px',
                minWidth: '326px',
                padding: '0',
                width: '100%',
              }}
            ></blockquote>
          ))}
        </div>
      </section>
    </main>
  );
}
