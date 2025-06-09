'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { TrendingDown, Users, Clock, Database, ShieldAlert, Network } from 'lucide-react';

// SEO重要部分（SSR対応）
const ProblemsContent = ({ problems }: { problems: Array<{
  title: string;
  description: string;
  solution: string;
  icon: React.ReactNode;
}> }) => {
  return (
    <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-8">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-200 via-blue-100 to-blue-200 bg-clip-text text-transparent mb-6">
          企業のDX課題
        </h2>
        <div className="w-40 h-1 bg-gradient-to-r from-blue-500 via-blue-400 to-blue-500 mx-auto rounded-full mb-8" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {problems.map((problem, index) => (
          <div key={index} className="group relative">
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
          </div>
        ))}
      </div>

      {/* CTA Section */}
      <div className="mt-20 relative text-center">
        <div className="mb-8">
          <p className="text-2xl text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-blue-100 to-blue-200 font-medium">
            これら課題の解決方法を<br />
            無料相談会でご提案させていただきます
          </p>
        </div>

        <a
          href="#consultation-section"
          className="group relative inline-flex items-center justify-center px-12 py-4 text-lg font-semibold text-white transition-all duration-300 ease-out"
        >
          {/* Button background layers */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 opacity-90 group-hover:opacity-100 transition-opacity" />
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 via-blue-400 to-blue-500 blur-lg opacity-60 group-hover:opacity-100 transition-opacity" />
          
          {/* Button content */}
          <span className="relative z-10 flex items-center">
            無料相談会に申し込む
            <svg
              className="w-5 h-5 ml-2 transform transition-transform group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </span>
        </a>
      </div>
    </div>
  );
};

// アニメーション部分（CSR専用）
const FloatingParticles = dynamic(() => Promise.resolve(() => {
  const [particles, setParticles] = useState<Array<{ 
    left: string; 
    top: string; 
    delay: string; 
    duration: string; 
  }>>([]);
  
  useEffect(() => {
    setParticles(
      Array.from({ length: 20 }, () => ({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        delay: `${Math.random() * 5}s`,
        duration: `${5 + Math.random() * 5}s`
      }))
    );
  }, []);

  return (
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
  );
}), { 
  ssr: false,
  loading: () => <div />
});

const DecorativeLights = dynamic(() => Promise.resolve(() => (
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
)), { 
  ssr: false,
  loading: () => <div />
});

export default function CorporateProblems() {
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
      
      {/* Floating particles - CSR専用 */}
      <FloatingParticles />

      {/* SEO重要コンテンツ - SSR対応 */}
      <ProblemsContent problems={problems} />
    </section>
  );
} 