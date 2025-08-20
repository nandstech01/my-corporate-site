'use client';

import { useEffect } from 'react';

interface AIDetectionTrackerProps {
  // オプション: 特定のFragment IDのみ追跡
  fragmentId?: string;
  // オプション: 検出を無効化
  disabled?: boolean;
}

export default function AIDetectionTracker({ 
  fragmentId, 
  disabled = false 
}: AIDetectionTrackerProps) {
  
  useEffect(() => {
    // 検出が無効化されている場合は何もしない
    if (disabled) return;

    // ブラウザ環境でのみ実行
    if (typeof window === 'undefined') return;

    const detectAIQuotation = async () => {
      try {
        // 現在のURL取得
        const currentUrl = window.location.href;
        
        // Fragment IDが指定されている場合、URLに含まれているかチェック
        if (fragmentId && !currentUrl.includes(`#${fragmentId}`)) {
          return;
        }

        // Fragment IDがない場合はスキップ
        if (!currentUrl.includes('#')) {
          return;
        }

        // リファラー情報取得
        const referrer = document.referrer || '';
        
        // User-Agent取得
        const userAgent = navigator.userAgent || '';
        
        // Query String取得
        const queryString = window.location.search || '';

        // AI引用検出API呼び出し
        const response = await fetch('/api/deeplink-analytics/ai-detection', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: currentUrl,
            userAgent,
            referrer,
            queryString
          })
        });

        const result = await response.json();

        if (result.success) {
          console.log(`🤖 AI引用検出成功:`, result.detection);
          
          // オプション: カスタムイベント発火
          window.dispatchEvent(new CustomEvent('ai-quotation-detected', {
            detail: result.detection
          }));
        } else if (result.message) {
          // AI検索エンジンが検出されなかった場合（正常）
          console.log('ℹ️ AI検索エンジン未検出:', result.message);
        }

      } catch (error) {
        console.error('AI引用検出エラー:', error);
      }
    };

    // ページ読み込み後に検出実行
    const timeoutId = setTimeout(detectAIQuotation, 1000);

    // クリーンアップ
    return () => {
      clearTimeout(timeoutId);
    };
  }, [fragmentId, disabled]);

  // このコンポーネントは何も描画しない（トラッキング専用）
  return null;
}

// 使用例のためのヘルパーフック
export function useAIDetectionStats() {
  const fetchStats = async (days: number = 7) => {
    try {
      const response = await fetch(`/api/deeplink-analytics/ai-detection?days=${days}`);
      const result = await response.json();
      
      if (result.success) {
        return result.stats;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('AI検出統計取得エラー:', error);
      throw error;
    }
  };

  return { fetchStats };
} 