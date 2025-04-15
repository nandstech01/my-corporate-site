'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, FileCheck, Users, Rocket, ArrowRight } from 'lucide-react';

const FlowStep = ({ 
  step, 
  title, 
  description, 
  icon, 
  isLast,
  delay 
}: { 
  step: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  isLast: boolean;
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
      className="relative"
    >
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
              {icon}
            </div>
            {!isLast && (
              <div className="absolute top-12 left-1/2 transform -translate-x-1/2 w-px h-full bg-gradient-to-b from-blue-500/50 to-transparent" />
            )}
          </div>
        </div>
        <div className="flex-grow pt-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-sm text-blue-400 font-semibold">STEP {step}</span>
            <h3 className="text-xl font-bold text-white">{title}</h3>
          </div>
          <p className="text-gray-300 leading-relaxed">{description}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default function CorporateFlow() {
  const steps = [
    {
      icon: <MessageCircle className="w-6 h-6 text-white" />,
      title: "無料相談",
      description: "お客様の課題やニーズをヒアリングし、最適なAI研修プランをご提案します。",
    },
    {
      icon: <FileCheck className="w-6 h-6 text-white" />,
      title: "研修プラン策定",
      description: "企業規模や目的に合わせて、カスタマイズされた研修プランを作成します。",
    },
    {
      icon: <Users className="w-6 h-6 text-white" />,
      title: "研修実施",
      description: "実践的なハンズオン形式で、AIツールの活用方法を習得していただきます。",
    },
    {
      icon: <Rocket className="w-6 h-6 text-white" />,
      title: "フォローアップ",
      description: "研修後も継続的なサポートを提供し、確実な業務改善を実現します。",
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-200 via-blue-100 to-blue-200 bg-clip-text text-transparent mb-6">
            導入の流れ
          </h2>
          <p className="text-xl text-blue-200/80 max-w-3xl mx-auto">
            直面する課題への段階的アプローチで<br />
            確実な業務改善を実現します
          </p>
          <div className="w-40 h-1 bg-gradient-to-r from-blue-500 via-blue-400 to-blue-500 mx-auto rounded-full mt-8" />
        </motion.div>

        <div className="space-y-12">
          {steps.map((step, index) => (
            <FlowStep
              key={index}
              step={index + 1}
              title={step.title}
              description={step.description}
              icon={step.icon}
              isLast={index === steps.length - 1}
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
          <p className="mt-6 text-blue-200/80 text-sm">
          ※ 初回相談限定で『ChatGTP完全マスター』無料提供
          </p>
        </div>
      </div>
    </section>
  );
} 