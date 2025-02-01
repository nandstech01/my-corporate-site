'use client'

import React, { useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'

type BlogPost = {
  id: number
  title: string
  excerpt: string
  imageUrl: string
  date: string
  link: string
}

const dummyPosts: BlogPost[] = [
  {
    id: 1,
    title: "ChatGPT時代の副業が熱い！",
    excerpt: "AIを活用した新時代の働き方とは？稼げる副業術を徹底解説。",
    imageUrl: "/images/background.jpg",
    date: "2025/01/20",
    link: "/blog/chatgpt-sidejob",
  },
  {
    id: 2,
    title: "企業が取り組むリスキリング最前線",
    excerpt: "生成AI研修で社員の生産性が上がる事例が続々。成功のポイントは？",
    imageUrl: "/images/meeting_scene.png",
    date: "2025/01/18",
    link: "/blog/corporate-reskilling",
  },
  {
    id: 3,
    title: "退職代行で次のキャリアへシフト",
    excerpt: "2,980円で退職後、すぐにAIスキルで稼ぐ人が急増中の理由。",
    imageUrl: "/images/amazon-warehouse.jpg",
    date: "2025/01/15",
    link: "/blog/taishoku-anshin",
  },
]

const fadeInUpVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

// ReflectionOverlay コンポーネント
function ReflectionOverlay({ hovered }: { hovered: boolean }) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!overlayRef.current) return;

    if (hovered) {
      overlayRef.current.animate(
        [
          { transform: "translateX(-120%)", opacity: 0 },
          { transform: "translateX(120%)", opacity: 0.2 },
        ],
        {
          duration: 800,
          easing: "ease-out",
          fill: "forwards",
        }
      );
    } else {
      overlayRef.current.animate(
        [{ transform: "translateX(-120%)", opacity: 0 }],
        {
          duration: 300,
          fill: "forwards",
        }
      );
    }
  }, [hovered]);

  return (
    <div
      ref={overlayRef}
      className="absolute top-0 left-0 w-1/3 h-full
      bg-white bg-opacity-20
      pointer-events-none
      mix-blend-screen
      rounded-full"
      style={{
        borderRadius: "9999px",
      }}
    ></div>
  );
}

export default function BlogSection() {
  const [hovered, setHovered] = useState(false);

  return (
    <section className="w-full py-16 bg-gray-50 text-gray-800">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold mb-6 text-center">最新ブログ記事</h2>
        <p className="text-center text-gray-600 mb-10">
          各事業の最新情報をピックアップ。トレンドを逃さずチェック！
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {dummyPosts.map((post) => (
            <div key={post.id} className="bg-white rounded-lg shadow hover:shadow-lg overflow-hidden">
              <img src={post.imageUrl} alt={post.title} className="w-full h-48 object-cover" />
              <div className="p-4">
                <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
                <p className="text-sm text-gray-500 mb-4">{post.date}</p>
                <p className="text-gray-700 mb-4">{post.excerpt}</p>
                <a
                  href={post.link}
                  className="text-indigo-500 hover:underline font-medium"
                >
                  続きを読む →
                </a>
              </div>
            </div>
          ))}
        </div>
        <motion.div
          className="text-center mt-12"
          variants={fadeInUpVariants}
          initial={{ scale: 1 }}
          whileHover={{
            scale: 1.03,
            transition: { duration: 0.3 }
          }}
          whileTap={{
            scale: 0.97,
            transition: { duration: 0.2 }
          }}
          onHoverStart={() => setHovered(true)}
          onHoverEnd={() => setHovered(false)}
        >
          <a
            href="/blog"
            className="relative overflow-hidden px-12 py-5 font-bold text-white
            bg-gradient-to-r from-blue-800 via-blue-600 to-blue-500
            hover:from-blue-900 hover:via-blue-700 hover:to-blue-600
            transition-all duration-300"
            style={{
              transformStyle: "preserve-3d",
            }}
          >
            {/* 外側の白い枠 - より細く洗練された印象に */}
            <div className="absolute inset-0 border border-white opacity-30"></div>
            
            {/* 内側の白い枠 - アクセントとして */}
            <div 
              className="absolute inset-[2px]"
              style={{
                border: '1px solid rgba(255, 255, 255, 0.6)',
                background: 'linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.1) 100%)',
                opacity: 0.2,
              }}
            ></div>

            {/* ボタンテキスト */}
            <span className="relative z-10 tracking-wider">ブログ一覧へ</span>

            {/* 光沢エフェクト */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.1) 100%)",
                mixBlendMode: "overlay",
              }}
            ></div>

            {/* 反射レイヤー */}
            <ReflectionOverlay hovered={hovered} />

            {/* ホバー時のグロー効果 - より繊細に */}
            <div
              className="absolute inset-0 opacity-0 transition-opacity duration-300 pointer-events-none"
              style={{
                background: "radial-gradient(circle at center, rgba(255,255,255,0.15) 0%, transparent 70%)",
                opacity: hovered ? 0.6 : 0,
              }}
            ></div>
          </a>
        </motion.div>
      </div>
    </section>
  )
} 