'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import PostImage from './PostImage';
import { motion } from 'framer-motion';

type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  thumbnail_url: string | null;
  featured_image?: string | null;
  category?: {
    name: string;
    slug: string;
  };
};

export default function PostsGrid({ initialPosts }: { initialPosts: Post[] }) {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    setPosts(initialPosts);
  }, [initialPosts]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {posts.map((post) => (
        <motion.article
          key={post.id}
          variants={item}
          className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300"
          whileHover={{ y: -5 }}
        >
          <Link href={`/posts/${post.slug}`} className="block">
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <PostImage
                src={post.thumbnail_url || post.featured_image}
                alt={post.title}
              />
            </div>
            <div className="p-6">
              {post.category && (
                <div className="text-sm text-indigo-600 mb-2">{post.category.name}</div>
              )}
              <h3 className="text-xl font-semibold mb-2 line-clamp-2 hover:text-indigo-600 transition-colors duration-200">
                {post.title}
              </h3>
              <p className="text-gray-600 text-sm line-clamp-3">{post.excerpt}</p>
              <div className="mt-4">
                <span className="text-indigo-600 text-sm font-medium hover:text-indigo-800 transition-colors duration-200">
                  続きを読む →
                </span>
              </div>
            </div>
          </Link>
        </motion.article>
      ))}
    </motion.div>
  );
} 