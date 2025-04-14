'use client';

import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { AlertCircle, TrendingUp, Clock, BookOpen, ArrowRight } from 'lucide-react';

interface ProblemCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  index: number;
  color: string;
}

const ProblemCard: React.FC<ProblemCardProps> = ({ icon, title, description, index, color }) => {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [50, -50]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 50 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{
        duration: 0.8,
        delay: index * 0.2,
        ease: [0.6, 0.05, 0.01, 0.95]
      }}
      style={{ y }}
      className="relative group"
    >
      <div className="relative transform transition-all duration-500 group-hover:scale-[1.02]">
        <div className={`absolute inset-0 ${color} rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300 blur-xl`} />
        <div className="relative p-8 bg-white/[0.02] backdrop-blur-xl rounded-2xl border border-white/5 shadow-2xl">
          <div className="flex items-center space-x-4 mb-6">
            <div className={`p-3 ${color} rounded-xl shadow-lg backdrop-blur-sm`}>
              {icon}
            </div>
            <h3 className="text-2xl font-bold text-white tracking-tight">{title}</h3>
          </div>
          <p className="text-gray-300 leading-relaxed text-lg">{description}</p>
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white/20 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
        </div>
      </div>
    </motion.div>
  );
};

export default function FukugyoProblems() {
  const [isClient, setIsClient] = useState(false);
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [0, 1]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const problems = [
    {
      icon: <AlertCircle className="w-7 h-7 text-white" />,
      title: "収入の不安定さ",
      description: "月々の収入が一定せず、将来の生活設計が立てにくい状況に直面していませんか？",
      color: "bg-gradient-to-br from-red-500/40 to-pink-500/40"
    },
    {
      icon: <TrendingUp className="w-7 h-7 text-white" />,
      title: "スキルアップの機会",
      description: "急速に変化する市場で、現在のスキルだけでは将来が不安。新しい可能性を探しているあなたへ。",
      color: "bg-gradient-to-br from-yellow-500/40 to-orange-500/40"
    },
    {
      icon: <Clock className="w-7 h-7 text-white" />,
      title: "時間の制約",
      description: "本業との両立に悩んでいませんか？効率的なAI活用で、限られた時間を最大限に活かせます。",
      color: "bg-gradient-to-br from-blue-500/40 to-indigo-500/40"
    },
    {
      icon: <BookOpen className="w-7 h-7 text-white" />,
      title: "学習コスト",
      description: "新しいスキル習得にかかる時間とコストの心配は無用です。実践的なAIスキルを効率的に習得できます。",
      color: "bg-gradient-to-br from-green-500/40 to-emerald-500/40"
    }
  ];

  if (!isClient) {
    return null;
  }

  return (
    <section className="py-32 relative overflow-hidden bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.02),transparent_50%)]" />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-8">
            <span className="bg-gradient-to-r from-gray-100 via-blue-100 to-gray-100 bg-clip-text text-transparent">
              こんな悩みはありませんか？
            </span>
          </h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-2xl text-gray-300 max-w-3xl mx-auto font-light"
          >
            多くの方が抱える副業の課題を、<br />
            <span className="font-medium text-blue-200">AIスキル</span>で解決できます
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {problems.map((problem, index) => (
            <ProblemCard
              key={index}
              index={index}
              {...problem}
            />
          ))}
        </div>

        <div className="text-center mt-12">
          <a
            href="https://lin.ee/gUyPhHa"
            className="neon-button group"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="relative z-10 flex items-center">
              無料セミナーに申し込む
              <svg
                className="w-5 h-5 ml-2 transform transition-transform group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </span>
          </a>
        </div>
      </div>
    </section>
  );
} 