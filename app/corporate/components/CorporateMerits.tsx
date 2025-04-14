'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Zap, TrendingUp, Users } from 'lucide-react';

const MeritCard = ({ 
  icon, 
  title, 
  description, 
  delay 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
  delay: number;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: delay * 0.1,
        ease: "easeOut"
      }}
    >
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
        <div className="relative p-6 bg-white/5 backdrop-blur-lg rounded-xl border border-white/10">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg">
              {icon}
            </div>
            <h3 className="text-xl font-bold text-white">{title}</h3>
          </div>
          <p className="text-gray-300 leading-relaxed">{description}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default function CorporateMerits() {
  const merits = [
    {
      icon: <CheckCircle className="w-6 h-6 text-white" />,
      title: "即戦力の育成",
      description: "3ヶ月で実践的なAIスキルを習得。業務で即活用できる実践的な知識とスキルを提供します。",
    },
    {
      icon: <Zap className="w-6 h-6 text-white" />,
      title: "生産性の向上",
      description: "AIツールの活用により、業務効率が平均40%向上。時間とコストの大幅な削減を実現します。",
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-white" />,
      title: "ROIの最大化",
      description: "投資対効果を重視したカリキュラム設計。1年以内での投資回収を実現します。",
    },
    {
      icon: <Users className="w-6 h-6 text-white" />,
      title: "組織力の強化",
      description: "個人のスキルアップに加え、チーム全体のDX推進力を強化。組織全体の競争力を高めます。",
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(59,130,246,0.05)_1px,transparent_1px)] bg-[size:14px_24px]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-200 via-blue-100 to-blue-200 bg-clip-text text-transparent mb-6">
            導入のメリット
          </h2>
          <p className="text-xl text-blue-200/80 max-w-3xl mx-auto">
            AI研修導入による具体的な成果をご紹介します
          </p>
          <div className="w-40 h-1 bg-gradient-to-r from-blue-500 via-blue-400 to-blue-500 mx-auto rounded-full mt-8" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {merits.map((merit, index) => (
            <MeritCard
              key={index}
              icon={merit.icon}
              title={merit.title}
              description={merit.description}
              delay={index}
            />
          ))}
        </div>

        <div className="mt-16 text-center">
          <button
            onClick={() => {
              const consultationSection = document.getElementById('consultation-section');
              if (consultationSection) {
                consultationSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="px-8 py-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm transition-all duration-300 group inline-flex items-center"
            type="button"
          >
            <span className="relative z-10 flex items-center text-white/90 text-lg">
              無料相談はこちら
              <svg
                className="w-4 h-4 ml-2 transform transition-transform group-hover:translate-y-1 opacity-70"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </span>
          </button>
        </div>
      </div>
    </section>
  );
} 