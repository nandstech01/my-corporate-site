"use client";

import React, { useState } from 'react';
import ComingSoonModal from './ComingSoonModal';

interface FeaturePreviewSectionProps {
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  featureType: 'chatbot' | 'diagnostic' | 'generation' | 'search';
  mockInterface?: React.ReactNode;
  expectedDate?: string;
  accentColor?: 'blue' | 'green' | 'purple' | 'cyan' | 'orange' | 'pink';
}

export default function FeaturePreviewSection({
  title,
  subtitle,
  description,
  features,
  featureType,
  mockInterface,
  expectedDate = "2025年第1四半期",
  accentColor = 'blue'
}: FeaturePreviewSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const colorClasses = {
    blue: {
      gradient: 'from-blue-50 to-indigo-50',
      border: 'border-blue-200',
      button: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
      accent: 'text-blue-600'
    },
    green: {
      gradient: 'from-green-50 to-emerald-50',
      border: 'border-green-200',
      button: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
      accent: 'text-green-600'
    },
    purple: {
      gradient: 'from-purple-50 to-violet-50',
      border: 'border-purple-200',
      button: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
      accent: 'text-purple-600'
    },
    cyan: {
      gradient: 'from-cyan-50 to-blue-50',
      border: 'border-cyan-200',
      button: 'from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700',
      accent: 'text-cyan-600'
    },
    orange: {
      gradient: 'from-orange-50 to-amber-50',
      border: 'border-orange-200',
      button: 'from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700',
      accent: 'text-orange-600'
    },
    pink: {
      gradient: 'from-pink-50 to-rose-50',
      border: 'border-pink-200',
      button: 'from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700',
      accent: 'text-pink-600'
    }
  };

  const colors = colorClasses[accentColor];

  return (
    <>
      <section className={`py-16 bg-gradient-to-br ${colors.gradient}`}>
        <div className="max-w-6xl mx-auto px-4">
          {/* ヘッダー */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 bg-white/60 border border-white/40 text-sm font-medium mb-4">
              <svg className="w-4 h-4 mr-2 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              準備中の新機能
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{title}</h2>
            <p className={`text-xl ${colors.accent} font-medium mb-4`}>{subtitle}</p>
            <p className="text-gray-600 max-w-3xl mx-auto leading-relaxed">{description}</p>
          </div>

          {/* メインコンテンツ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* 機能説明 */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">実装予定機能</h3>
              <div className="space-y-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start">
                    <div className={`w-6 h-6 ${colors.border} border-2 rounded-full flex items-center justify-center mr-4 mt-1 flex-shrink-0`}>
                      <svg className={`w-3 h-3 ${colors.accent}`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{feature}</p>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="mt-8">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className={`inline-flex items-center px-8 py-4 bg-gradient-to-r ${colors.button} text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105`}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  機能プレビューを見る
                </button>
                <p className="text-sm text-gray-500 mt-2">
                  詳細情報とリリース予定をご確認いただけます
                </p>
              </div>
            </div>

            {/* モックインターフェース */}
            <div>
              <div 
                className={`bg-white border-2 ${colors.border} shadow-xl cursor-pointer transform transition-transform hover:scale-105`}
                onClick={() => setIsModalOpen(true)}
              >
                {mockInterface || (
                  <div className="p-8 text-center">
                    <div className={`w-16 h-16 mx-auto ${colors.gradient} rounded-full flex items-center justify-center mb-4`}>
                      {featureType === 'chatbot' ? (
                        <svg className={`w-8 h-8 ${colors.accent}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      ) : (
                        <svg className={`w-8 h-8 ${colors.accent}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      )}
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      {featureType === 'chatbot' ? 'インタラクティブChat' : '診断ツール'}
                    </h4>
                    <p className="text-gray-600 text-sm">
                      クリックして詳細をご確認ください
                    </p>
                  </div>
                )}
                
                {/* Coming Soon オーバーレイ */}
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <div className="bg-white px-4 py-2 text-sm font-medium text-gray-900 shadow-lg">
                    Coming Soon
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Coming Soon Modal */}
      <ComingSoonModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        featureName={title}
        description={description}
        features={features}
        expectedDate={expectedDate}
      />
    </>
  );
} 