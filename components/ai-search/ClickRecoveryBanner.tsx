'use client';

import React, { useState, useEffect } from 'react';
import { aiSearchDetection, TrafficSource } from '@/lib/ai-search-detection';

interface ClickRecoveryBannerProps {
  trafficSource?: TrafficSource;
  onClose?: () => void;
  onConversion?: (source: string) => void;
  className?: string;
}

/**
 * Click-Recovery Banner - AI検索流入者向けコンバージョン促進バナー
 */
export const ClickRecoveryBanner: React.FC<ClickRecoveryBannerProps> = ({
  trafficSource,
  onClose,
  onConversion,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [animationClass, setAnimationClass] = useState('');
  const [detectedSource, setDetectedSource] = useState<TrafficSource | null>(null);

  useEffect(() => {
    // クライアントサイドでAI検索流入を検知
    if (typeof window !== 'undefined' && !trafficSource) {
      const headers = new Headers();
      headers.set('user-agent', navigator.userAgent);
      headers.set('referer', document.referrer);
      
      const detected = aiSearchDetection.detectAISearchTraffic(headers, window.location.href);
      setDetectedSource(detected);
      
      if (aiSearchDetection.shouldShowClickRecoveryBanner(detected)) {
        setTimeout(() => {
          setIsVisible(true);
          setAnimationClass('animate-slide-in');
        }, 1500); // 1.5秒後に表示
      }
    } else if (trafficSource && aiSearchDetection.shouldShowClickRecoveryBanner(trafficSource)) {
      setDetectedSource(trafficSource);
      setTimeout(() => {
        setIsVisible(true);
        setAnimationClass('animate-slide-in');
      }, 1500);
    }
  }, [trafficSource]);

  const handleClose = () => {
    setAnimationClass('animate-slide-out');
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 300);
  };

  const handleCTAClick = (ctaText: string) => {
    const sourceName = detectedSource?.source?.name || 'Unknown AI Search';
    onConversion?.(sourceName);
    
    // Google Analytics等のトラッキング
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as any).gtag('event', 'click_recovery_conversion', {
        source: sourceName,
        cta_text: ctaText,
        confidence: detectedSource?.confidence || 0
      });
    }

    // 実際のCTAアクション（お問い合わせフォームへのリダイレクトなど）
    if (ctaText.includes('無料相談') || ctaText.includes('お問い合わせ')) {
      window.location.href = '/api/contact?source=ai-search-recovery';
    } else if (ctaText.includes('サービス一覧')) {
      window.location.href = '/#services';
    } else if (ctaText.includes('詳細')) {
      window.location.href = '/about';
    }
  };

  if (!isVisible || !detectedSource?.isAISearch) {
    return null;
  }

  const recovery = aiSearchDetection.generateRecoveryMessage(detectedSource);
  const urgencyColor = {
    low: 'bg-blue-50 border-blue-200',
    medium: 'bg-amber-50 border-amber-200',
    high: 'bg-green-50 border-green-200'
  }[recovery.urgency];

  const urgencyTextColor = {
    low: 'text-blue-900',
    medium: 'text-amber-900',
    high: 'text-green-900'
  }[recovery.urgency];

  const urgencyButtonColor = {
    low: 'bg-blue-600 hover:bg-blue-700',
    medium: 'bg-amber-600 hover:bg-amber-700',
    high: 'bg-green-600 hover:bg-green-700'
  }[recovery.urgency];

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 ${animationClass} ${className}`}>
      <div className={`${urgencyColor} border-b-2 shadow-lg`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-start space-x-3 flex-1">
              {/* AI検索アイコン */}
              <div className="flex-shrink-0 mt-1">
                <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 01-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 013.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 013.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 01-3.09 3.09z"/>
                    <path d="M18.813 8.904L18 11.75l-.813-2.846a4.5 4.5 0 01-2.09-2.09L12.25 6l2.846-.813a4.5 4.5 0 012.09-2.09L18 0.25l.813 2.846a4.5 4.5 0 012.09 2.09L23.75 6l-2.846.813a4.5 4.5 0 01-2.09 2.09z"/>
                  </svg>
                </div>
              </div>

              {/* メッセージコンテンツ */}
              <div className="flex-1 min-w-0">
                <h3 className={`text-sm font-semibold ${urgencyTextColor} mb-1`}>
                  {recovery.title}
                </h3>
                <p className={`text-xs ${urgencyTextColor} opacity-80 leading-relaxed`}>
                  {recovery.message}
                </p>
                
                {/* 信頼度インジケーター */}
                {detectedSource.confidence > 0.7 && (
                  <div className="flex items-center mt-2 space-x-2">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs text-gray-600">
                        {detectedSource.source?.name} からの検出
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* CTA & Close ボタン */}
            <div className="flex items-center space-x-3 ml-4">
              <button
                onClick={() => handleCTAClick(recovery.ctaText)}
                className={`${urgencyButtonColor} text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 whitespace-nowrap hover:shadow-md`}
              >
                {recovery.ctaText}
              </button>
              
              <button
                onClick={handleClose}
                className={`${urgencyTextColor} opacity-60 hover:opacity-100 transition-opacity duration-200`}
                aria-label="バナーを閉じる"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* アニメーション用スタイル */}
      <style jsx>{`
        .animate-slide-in {
          animation: slideInFromTop 0.4s ease-out;
        }
        .animate-slide-out {
          animation: slideOutToTop 0.3s ease-in;
        }
        
        @keyframes slideInFromTop {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes slideOutToTop {
          from {
            transform: translateY(0);
            opacity: 1;
          }
          to {
            transform: translateY(-100%);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

/**
 * AI検索流入統計表示コンポーネント（管理画面用）
 */
export const AISearchStats: React.FC = () => {
  const [stats, setStats] = useState(aiSearchDetection.generateAISearchStats());
  const [history, setHistory] = useState(aiSearchDetection.getDetectionHistory(50));

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(aiSearchDetection.generateAISearchStats());
      setHistory(aiSearchDetection.getDetectionHistory(50));
    }, 5000); // 5秒ごとに更新

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">AI検索流入統計</h3>
      
      {/* 統計サマリー */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{stats.totalVisits}</div>
          <div className="text-sm text-blue-800">総訪問数</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{stats.aiSearchVisits}</div>
          <div className="text-sm text-green-800">AI検索流入</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">
            {stats.aiSearchPercentage.toFixed(1)}%
          </div>
          <div className="text-sm text-purple-800">AI検索割合</div>
        </div>
      </div>

      {/* ソース別内訳 */}
      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-800 mb-3">ソース別内訳</h4>
        <div className="space-y-2">
          {Object.entries(stats.sourceBreakdown).map(([source, count]) => (
            <div key={source} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
              <span className="text-sm text-gray-700">{source}</span>
              <span className="text-sm font-medium text-gray-900">{count}件</span>
            </div>
          ))}
        </div>
      </div>

      {/* 最近の検知履歴 */}
      <div>
        <h4 className="text-md font-medium text-gray-800 mb-3">最近の検知履歴</h4>
        <div className="max-h-64 overflow-y-auto space-y-2">
          {history.slice(0, 10).map((traffic, index) => (
            <div key={index} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded text-xs">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${traffic.isAISearch ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span className="text-gray-700">
                  {traffic.source?.name || 'Unknown'}
                </span>
              </div>
              <div className="text-gray-500">
                {new Date(traffic.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClickRecoveryBanner; 