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

// Helper function to clean and truncate excerpt
const processExcerpt = (text: string, maxLength: number = 60): string => {
  if (!text) return '';
  // Remove markdown headers and list items
  const cleanedText = text.replace(/^(#+\s*|\*+\s*|-+\s*)/gm, '').trim();
  // Remove other potential markdown like bold/italic markers if needed (simple approach)
  // cleanedText = cleanedText.replace(/(\*\*|__|\*|_)/g, ''); 
  if (cleanedText.length <= maxLength) {
    return cleanedText;
  }
  return cleanedText.substring(0, maxLength) + '...';
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
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {posts.map((post) => (
        <motion.article
          key={post.id}
          variants={item}
          className="bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-transparent hover:border-[#00CFFF] transition-all duration-300 flex flex-col"
          whileHover={{ y: -5 }}
        >
          <Link href={`/posts/${post.slug}`} className="block flex flex-col flex-grow">
            <div className="relative w-full flex-shrink-0 rounded-t-xl overflow-hidden" style={{ paddingBottom: '56.25%' }}>
              <PostImage
                src={post.thumbnail_url || post.featured_image}
                alt={post.title}
              />
            </div>
            <div className="p-6 flex flex-col flex-grow">
              {post.category && (
                <div className="text-sm text-blue-400 mb-2 font-medium">
                  {post.category.name}
                </div>
              )}
              <h3 className="text-xl font-semibold mb-2 text-gray-100 line-clamp-2 hover:text-blue-300 transition-colors duration-200">
                {post.title}
              </h3>
              <p className="text-gray-300 text-sm line-clamp-3 mb-4 flex-grow">
                {processExcerpt(post.excerpt)}
              </p>
              <div className="mt-auto">
                <span
                  className="inline-block px-6 py-3 font-bold text-white rounded-md text-sm
                  bg-gradient-to-r from-[#00CFFF] via-[#008CFF] to-[#0047FF]
                  hover:from-[#00BFFF] hover:via-[#0077FF] hover:to-[#0033CC]
                  transition-all duration-300"
                >
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