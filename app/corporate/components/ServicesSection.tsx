'use client';

import React from 'react';
import { useTrail, animated } from '@react-spring/web';
import {
  LightBulbIcon,
  CodeBracketIcon,
  WrenchIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

type ServiceData = {
  title: string;
  items: string[];
  icon: React.ReactNode;
};

export default function ServicesSection() {
  // サービスデータをコンポーネント内で定義
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
  ], []); // 依存配列を空にして再レンダリングを防ぐ

  const trails = useTrail(services.length, {
    from: { opacity: 0, y: 20 },
    to: { opacity: 1, y: 0 },
    config: {
      mass: 1,
      tension: 170,
      friction: 26
    },
  });

  return (
    <section className="relative bg-gradient-to-b from-white to-gray-50 pt-20 pb-20 overflow-hidden">
      {/* 上部の装飾的な波形 */}
      <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-white to-transparent"></div>

      <div className="container mx-auto px-4 relative z-10">
        <h2 className="text-3xl font-bold text-center mb-10">サービス内容</h2>

        {/* サービス一覧カード */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {trails.map((style, index) => {
            const service = services[index];
            if (!service) return null;

            return (
              <animated.div
                key={service.title}
                style={{
                  ...style,
                  transform: style.y.to(y => `translateY(${y}px)`)
                }}
                className="bg-white p-6 rounded-xl shadow hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex flex-col items-start">
                  {service.icon}
                  <h3 className="font-bold text-xl mb-4 text-gray-800">
                    {service.title}
                  </h3>
                </div>
                <ul className="space-y-2 pl-2 border-l-4 border-blue-100">
                  {service.items.map((item, i) => (
                    <li key={`${service.title}-${i}`} className="text-sm text-gray-600 leading-relaxed">
                      {item}
                    </li>
                  ))}
                </ul>
              </animated.div>
            );
          })}
        </div>
      </div>

      {/* 下部の装飾的な波形 */}
      <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-gray-50 to-transparent"></div>
    </section>
  );
}
