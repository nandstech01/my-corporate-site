'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingDown, Users, Clock, Database, ShieldAlert, Network } from 'lucide-react';

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
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

export default function CorporateProblems() {
  const [particles, setParticles] = useState<Array<{ left: string, top: string, delay: string, duration: string }>>([]);
  
  // クライアントサイドでのみ実行
  useEffect(() => {
    // パーティクルのスタイルをクライアントサイドで生成
    setParticles(
      Array.from({ length: 20 }, () => ({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        delay: `${Math.random() * 5}s`,
        duration: `${5 + Math.random() * 5}s`
      }))
    );
  }, []);

  const problems = [
    {
      title: "人材不足の深刻化",
      description: "DX人材の確保が難しく、社内のデジタル化が進まない...",
      solution: "社内人材のAIスキル育成で解決",
      icon: <Users size={32} strokeWidth={1.5} className="text-blue-500" />
    },
    {
      title: "コスト増大",
      description: "人件費や運用コストの上昇が企業の収益性を圧迫している...",
      solution: "AIによる業務効率化でコスト削減",
      icon: <TrendingDown size={32} strokeWidth={1.5} className="text-blue-500" />
    },
    {
      title: "業務効率の低下",
      description: "従来の業務プロセスでは多様化するニーズに対応できない...",
      solution: "AI活用で業務プロセスを最適化",
      icon: <Clock size={32} strokeWidth={1.5} className="text-blue-500" />
    },
    {
      title: "データ活用の遅れ",
      description: "社内に蓄積されたデータを効果的に分析・活用できない...",
      solution: "AIによるデータ分析・活用を実現",
      icon: <Database size={32} strokeWidth={1.5} className="text-blue-500" />
    },
    {
      title: "セキュリティリスク",
      description: "デジタル化に伴うセキュリティ対策が追いついていない...",
      solution: "AIを活用したセキュリティ強化",
      icon: <ShieldAlert size={32} strokeWidth={1.5} className="text-blue-500" />
    },
    {
      title: "システム連携の複雑化",
      description: "複数のシステムが混在し、効率的な連携ができていない...",
      solution: "AIによるシステム統合の効率化",
      icon: <Network size={32} strokeWidth={1.5} className="text-blue-500" />
    }
  ];

  return (
    <section className="relative py-20 overflow-hidden bg-black">
      {/* Decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(59,130,246,0.05)_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>
      
      {/* Floating particles - クライアントサイドでのみスタイルを適用 */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        {particles.map((particle, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-blue-400 rounded-full animate-float"
            style={{
              left: particle.left,
              top: particle.top,
              animationDelay: particle.delay,
              animationDuration: particle.duration
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-200 via-blue-100 to-blue-200 bg-clip-text text-transparent mb-6">
            企業が直面するDX課題
          </h2>
          <div className="w-40 h-1 bg-gradient-to-r from-blue-500 via-blue-400 to-blue-500 mx-auto rounded-full mb-8" />
        </motion.div>

        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {problems.map((problem, index) => (
            <motion.div
              key={index}
              variants={item}
              className="group relative"
            >
              {/* Card background with gradient border */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-blue-400 to-blue-500 rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-700" />
              
              <div className="relative bg-gray-900/40 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-2xl group-hover:shadow-blue-500/20 transition-all duration-500">
                {/* Number badge */}
                <div className="absolute -top-4 -left-4 w-16 h-16">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-400 rounded-2xl blur-lg opacity-60 group-hover:opacity-100 transition-opacity" />
                  <div className="relative w-full h-full bg-gradient-to-br from-blue-600 to-blue-500 rounded-2xl flex items-center justify-center">
                    <span className="text-2xl font-black text-white">{(index + 1).toString().padStart(2, '0')}</span>
                  </div>
                </div>

                {/* Solution tag */}
                <div className="ml-10 mb-4">
                  <span className="inline-block px-3 py-1 text-sm bg-gradient-to-r from-blue-500/10 to-blue-500/10 border border-blue-500/20 rounded-full text-blue-300">
                    {problem.solution}
                  </span>
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-white mb-4 ml-10">
                  {problem.title}
                </h3>
                <p className="text-white/80 leading-relaxed">
                  {problem.description}
                </p>

                {/* Hover effect overlay */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/0 via-blue-400/0 to-blue-500/0 opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Super Fancy Button Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-20 relative"
        >
          {/* Decorative light beams */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] animate-spin-slow">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="absolute top-1/2 left-1/2 h-full origin-bottom"
                  style={{
                    transform: `rotate(${i * 30}deg)`,
                  }}
                >
                  <div className="w-px h-1/2 bg-gradient-to-t from-transparent via-blue-500/30 to-transparent" />
                </div>
              ))}
            </div>
          </div>

          {/* Button container with animations */}
          <div className="relative text-center">
            <div className="mb-8">
              <p className="text-2xl text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-blue-100 to-blue-200 font-medium">
                これらの課題を解決する方法を、<br />
                無料相談会でご提案させていただきます
              </p>
            </div>

            <a
              href="https://lin.ee/gUyPhHa"
              className="px-8 py-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm transition-all duration-300 group inline-flex items-center"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="relative z-10 flex items-center text-white/90 text-lg">
                無料相談はこちら
                <svg
                  className="w-4 h-4 ml-2 transform transition-transform group-hover:translate-x-1 opacity-70"
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

            <p className="mt-6 text-blue-200/80 text-sm">
              ※ 初回相談限定で、AI導入診断（通常価格10万円）を無料実施
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
} 