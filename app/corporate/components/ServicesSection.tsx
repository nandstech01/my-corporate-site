'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import {
  LightBulbIcon,
  CodeBracketIcon,
  WrenchIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

type ServiceData = {
  title: string;
  items: string[];
  icon: React.ReactNode;
};

// SEO重要部分（SSR対応）
const ServicesContent = ({ services }: { services: ServiceData[] }) => {
  return (
    <div className="container mx-auto px-6 sm:px-8 lg:px-8 relative z-10">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 bg-clip-text text-transparent mb-6">
          サービス内容
        </h2>
        <div className="w-40 h-1 bg-gradient-to-r from-blue-500 via-blue-400 to-blue-500 mx-auto rounded-full mb-8" />
        <p className="text-gray-600 max-w-2xl mx-auto">
          業界に特化したAIソリューションと包括的なサポートを提供します
        </p>
      </div>

      {/* サービス一覧カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        {services.map((service, index) => (
          <div key={service.title} className="group relative">
            {/* Card background with gradient border */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-blue-400 to-blue-500 rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-700" />
            
            <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-8 border border-blue-100 shadow-xl group-hover:shadow-blue-500/10 transition-all duration-500">
              {/* Number badge */}
              <div className="absolute -top-4 -left-4 w-16 h-16">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-400 rounded-2xl blur-lg opacity-60 group-hover:opacity-100 transition-opacity" />
                <div className="relative w-full h-full bg-gradient-to-br from-blue-600 to-blue-500 rounded-2xl flex items-center justify-center">
                  <span className="text-2xl font-black text-white">{(index + 1).toString().padStart(2, '0')}</span>
                </div>
              </div>

              <div className="ml-10">
                {service.icon}
                <h3 className="font-bold text-xl mb-4 text-gray-800">
                  {service.title}
                </h3>
              </div>

              <ul className="space-y-2 text-gray-600">
                {service.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="text-sm leading-relaxed">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// アニメーション部分（CSR専用）
const AnimatedWrapper = dynamic(() => import('framer-motion').then(mod => {
  const { motion } = mod;
  
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

  const AnimatedWrapperComponent = ({ children }: { children: React.ReactNode }) => (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
    >
      {children}
    </motion.div>
  );
  
  return AnimatedWrapperComponent;
}), { 
  ssr: false,
  loading: () => <div />
});

const FloatingParticles = dynamic(() => Promise.resolve(() => {
  const [particles, setParticles] = useState<Array<{
    left: string;
    top: string;
    delay: string;
    duration: string;
    opacity: string;
  }>>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 10 }, () => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: `${Math.random() * 5}s`,
      duration: `${5 + Math.random() * 5}s`,
      opacity: '0.3'
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
      {particles.map((particle, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-blue-300 rounded-full animate-float"
          style={{
            left: particle.left,
            top: particle.top,
            animationDelay: particle.delay,
            animationDuration: particle.duration,
            opacity: particle.opacity
          }}
        />
      ))}
    </div>
  );
}), { 
  ssr: false,
  loading: () => <div />
});

export default function ServicesSection() {
  const services: ServiceData[] = React.useMemo(() => [
    {
      title: 'AI導入コンサルティング',
      icon: <LightBulbIcon className="w-8 h-8 text-blue-500 mb-4" />,
      items: [
        '• ChatGPTやAIエージェントの活用戦略立案',
        '• 業務プロセス分析と改善提案',
        '• ROI試算と投資計画の策定',
        '• 社内教育・研修プログラムの提供',
      ],
    },
    {
      title: 'AI開発支援',
      icon: <CodeBracketIcon className="w-8 h-8 text-blue-500 mb-4" />,
      items: [
        '• Next.jsを活用したWebアプリケーション開発',
        '• 既存システムとのAPI連携',
        '• AIモデルのファインチューニング',
        '• セキュリティ対策とコンプライアンス対応',
      ],
    },
    {
      title: 'エンジニアリングサポート',
      icon: <WrenchIcon className="w-8 h-8 text-blue-500 mb-4" />,
      items: [
        '• AI人材の育成・採用支援',
        '• 技術スタック選定のアドバイス',
        '• コードレビューと品質管理',
        '• パフォーマンス最適化',
      ],
    },
    {
      title: '運用・保守',
      icon: <ShieldCheckIcon className="w-8 h-8 text-blue-500 mb-4" />,
      items: [
        '• システム監視と障害対応',
        '• 定期的なアップデート管理',
        '• ユーザーサポート',
        '• 継続的な改善提案',
      ],
    },
    {
      title: 'データ分析・可視化',
      icon: <ChartBarIcon className="w-8 h-8 text-blue-500 mb-4" />,
      items: [
        '• ビジネスデータの分析と洞察',
        '• AIを活用したデータマイニング',
        '• リアルタイムダッシュボード構築',
        '• データドリブンな意思決定支援',
      ],
    },
    {
      title: '組織変革支援',
      icon: <UserGroupIcon className="w-8 h-8 text-blue-500 mb-4" />,
      items: [
        '• DX推進体制の構築',
        '• チェンジマネジメント支援',
        '• デジタル人材育成計画の策定',
        '• アジャイル開発文化の醸成',
      ],
    },
  ], []);

  return (
    <section className="relative bg-white pt-20 pb-20 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      {/* Floating particles - CSR専用 */}
      <FloatingParticles />

      {/* SEO重要コンテンツ - SSR対応 */}
      <ServicesContent services={services} />
    </section>
  );
}
