'use client';

import { useState, useEffect } from 'react';
import { ClockIcon, PlayIcon, PauseIcon, CogIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface ScheduleConfig {
  enabled: boolean;
  frequency: 'weekly' | 'biweekly';
  days: Array<'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday'>;
  timeRange: { start: string; end: string };
  categoryRotation: string[];
  randomSelection: boolean;
  requireApproval: boolean;
  qualityThreshold: number;
}

interface ScheduledPost {
  id: string;
  scheduledFor: string;
  category: string;
  query: string;
  ragConfig: string[];
  status: 'pending' | 'approved' | 'rejected' | 'generated' | 'published';
  quality: number | null;
  createdAt: string;
}

export default function AutoScheduler() {
  const [config, setConfig] = useState<ScheduleConfig>({
    enabled: false,
    frequency: 'weekly',
    days: ['tuesday', 'friday'],
    timeRange: { start: '10:00', end: '16:00' },
    categoryRotation: ['ai-basics', 'finance', 'it-software', 'chatgpt-usage'],
    randomSelection: true,
    requireApproval: true,
    qualityThreshold: 0.8
  });

  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(false);

  // カテゴリ別推奨RAG設定（副業系除外）
  const categoryRAGConfigs: Record<string, string[]> = {
    // 個人向けリスキリング (business_id: 2)
    'ai-basics': ['company', 'trend'],
    'python-intro': ['company', 'youtube'],
    'chatgpt-usage': ['company', 'trend'],
    'ai-tools': ['company', 'trend'],
    'ai-sidejob-skills': ['company', 'trend'],
    'career-change': ['company', 'trend'],
    'practical-projects': ['company', 'youtube'],
    'certifications': ['company', 'trend'],
    'ai-news': ['trend', 'youtube'],
    
    // 法人向けリスキリング (business_id: 3)
    'finance': ['company', 'trend'],
    'manufacturing': ['company', 'trend'],
    'logistics': ['company', 'trend'],
    'retail': ['company', 'trend'],
    'medical-care': ['company', 'trend'],
    'construction': ['company', 'trend'],
    'it-software': ['company', 'trend', 'youtube'],
    'hr-service': ['company', 'trend'],
    'marketing': ['company', 'trend'],
    'government': ['company', 'trend']
  };

  // トレンドベースクエリ候補
  const trendQueries: Record<string, string[]> = {
    'ai-agents': [
      'AI エージェント 最新技術 2025',
      'AI エージェント 業務自動化 活用事例',
      'AI エージェント 開発 フレームワーク',
      'マルチエージェント システム 実装'
    ],
    'reskilling': [
      'リスキリング AI時代 人材育成',
      'デジタルスキル 企業研修 最新動向',
      'AI リテラシー 教育 プログラム',
      'DX人材 育成 戦略'
    ],
    'system-development': [
      'システム開発 AI活用 最新手法',
      'クラウドネイティブ 開発 トレンド',
      'API ファースト 設計 パターン',
      'マイクロサービス 実装 ベストプラクティス'
    ],
    'aio-seo': [
      'AIO対策 AI検索 最適化',
      'レリバンスエンジニアリング 実践',
      'AI検索エンジン 対応 SEO',
      '構造化データ AI引用 最適化'
    ]
  };

  // スケジュール設定の保存
  const saveScheduleConfig = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/schedule-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      
      if (!response.ok) throw new Error('設定の保存に失敗しました');
      alert('スケジュール設定を保存しました');
    } catch (error) {
      console.error('Schedule config save error:', error);
      alert('設定の保存に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // 次回のスケジュール生成
  const generateNextSchedule = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/generate-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config })
      });
      
      const result = await response.json();
      if (result.success) {
        setScheduledPosts(result.scheduledPosts);
        alert(`${result.scheduledPosts.length}件のスケジュールを生成しました`);
      }
    } catch (error) {
      console.error('Schedule generation error:', error);
      alert('スケジュール生成に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // 記事承認/拒否
  const handlePostApproval = async (postId: string, approved: boolean) => {
    try {
      const response = await fetch('/api/admin/approve-scheduled-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, approved })
      });
      
      if (response.ok) {
        setScheduledPosts(prev => prev.map(post => 
          post.id === postId 
            ? { ...post, status: approved ? 'approved' : 'rejected' }
            : post
        ));
      }
    } catch (error) {
      console.error('Approval error:', error);
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <ClockIcon className="w-6 h-6 text-cyan-400" />
          <h2 className="text-xl font-semibold text-white">自動スケジューラー</h2>
          <span className={`px-2 py-1 rounded-full text-xs ${
            config.enabled 
              ? 'bg-green-500/20 text-green-400' 
              : 'bg-gray-500/20 text-gray-400'
          }`}>
            {config.enabled ? 'アクティブ' : '非アクティブ'}
          </span>
        </div>
        <button
          onClick={() => setConfig(prev => ({ ...prev, enabled: !prev.enabled }))}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            config.enabled
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          {config.enabled ? '停止' : '開始'}
        </button>
      </div>

      {/* 設定パネル */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* 基本設定 */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white">基本設定</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              生成頻度
            </label>
            <select
              value={config.frequency}
              onChange={(e) => setConfig(prev => ({ ...prev, frequency: e.target.value as 'weekly' | 'biweekly' }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            >
              <option value="weekly">週2回（推奨）</option>
              <option value="biweekly">隔週1回（安全重視）</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              生成曜日
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['tuesday', 'wednesday', 'thursday', 'friday'].map((day) => (
                <label key={day} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={config.days.includes(day as any)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setConfig(prev => ({ ...prev, days: [...prev.days, day as any] }));
                      } else {
                        setConfig(prev => ({ ...prev, days: prev.days.filter(d => d !== day) }));
                      }
                    }}
                    className="rounded bg-gray-700 border-gray-600"
                  />
                  <span className="text-sm text-gray-300 capitalize">{day}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                開始時間
              </label>
              <input
                type="time"
                value={config.timeRange.start}
                onChange={(e) => setConfig(prev => ({ 
                  ...prev, 
                  timeRange: { ...prev.timeRange, start: e.target.value }
                }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                終了時間
              </label>
              <input
                type="time"
                value={config.timeRange.end}
                onChange={(e) => setConfig(prev => ({ 
                  ...prev, 
                  timeRange: { ...prev.timeRange, end: e.target.value }
                }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              />
            </div>
          </div>
        </div>

        {/* 品質管理設定 */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white">品質管理</h3>
          
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="requireApproval"
              checked={config.requireApproval}
              onChange={(e) => setConfig(prev => ({ ...prev, requireApproval: e.target.checked }))}
              className="rounded bg-gray-700 border-gray-600"
            />
            <label htmlFor="requireApproval" className="text-sm text-gray-300">
              生成前に人間の承認を必須とする（推奨）
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              品質閾値: {config.qualityThreshold}
            </label>
            <input
              type="range"
              min="0.5"
              max="1.0"
              step="0.1"
              value={config.qualityThreshold}
              onChange={(e) => setConfig(prev => ({ ...prev, qualityThreshold: parseFloat(e.target.value) }))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>低品質でも生成</span>
              <span>高品質のみ生成</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              カテゴリ選択方式
            </label>
            <div className="space-y-3">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="categorySelection"
                  checked={config.randomSelection}
                  onChange={() => setConfig(prev => ({ ...prev, randomSelection: true }))}
                  className="rounded bg-gray-700 border-gray-600"
                />
                <span className="text-sm text-gray-300">ランダム均等選択（推奨）</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="categorySelection"
                  checked={!config.randomSelection}
                  onChange={() => setConfig(prev => ({ ...prev, randomSelection: false }))}
                  className="rounded bg-gray-700 border-gray-600"
                />
                <span className="text-sm text-gray-300">手動選択</span>
              </label>
            </div>
            
            {config.randomSelection ? (
              <div className="mt-3 p-3 bg-gray-700/50 rounded-lg">
                <p className="text-sm text-gray-300 mb-2">
                  <strong>ランダム均等選択:</strong> 全30カテゴリから自動で均等に選択
                </p>
                <div className="grid grid-cols-3 gap-2 text-xs text-gray-400">
                  <div>副業支援: 10種</div>
                  <div>個人向け: 10種</div>
                  <div>法人向け: 10種</div>
                </div>
              </div>
            ) : (
              <div className="mt-3 max-h-32 overflow-y-auto">
                {Object.keys(categoryRAGConfigs).map((category) => (
                  <label key={category} className="flex items-center space-x-2 mb-1">
                    <input
                      type="checkbox"
                      checked={config.categoryRotation.includes(category)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setConfig(prev => ({ ...prev, categoryRotation: [...prev.categoryRotation, category] }));
                        } else {
                          setConfig(prev => ({ ...prev, categoryRotation: prev.categoryRotation.filter(c => c !== category) }));
                        }
                      }}
                      className="rounded bg-gray-700 border-gray-600"
                    />
                    <span className="text-sm text-gray-300">{category}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* アクションボタン */}
      <div className="flex space-x-3 mb-6">
        <button
          onClick={saveScheduleConfig}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
        >
          {loading ? '保存中...' : '設定を保存'}
        </button>
        <button
          onClick={generateNextSchedule}
          disabled={loading || !config.enabled}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
        >
          {loading ? '生成中...' : '次回スケジュール生成'}
        </button>
      </div>

      {/* スケジュール済み記事一覧 */}
      {scheduledPosts.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-white mb-4">スケジュール済み記事</h3>
          <div className="space-y-3">
            {scheduledPosts.map((post) => (
              <div key={post.id} className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <span className="text-white font-medium">{post.category}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      post.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                      post.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                      post.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {post.status}
                    </span>
                  </div>
                  <span className="text-sm text-gray-400">
                    {new Date(post.scheduledFor).toLocaleString('ja-JP')}
                  </span>
                </div>
                <p className="text-gray-300 text-sm mb-3">{post.query}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {post.ragConfig.map((rag) => (
                      <span key={rag} className="px-2 py-1 bg-gray-600 text-xs rounded text-gray-300">
                        {rag}
                      </span>
                    ))}
                  </div>
                  {post.status === 'pending' && config.requireApproval && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handlePostApproval(post.id, true)}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors"
                      >
                        承認
                      </button>
                      <button
                        onClick={() => handlePostApproval(post.id, false)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                      >
                        拒否
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 安全性に関する注意事項 */}
      <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4 mt-6">
        <div className="flex items-start space-x-3">
          <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-yellow-300 font-medium mb-2">🛡️ Googleガイドライン準拠設計</h4>
            <ul className="text-yellow-200 text-sm space-y-1">
              <li>• 週2回の頻度でスケール濫用を回避</li>
              <li>• 人間による品質チェック・承認工程を標準装備</li>
              <li>• カテゴリローテーションで多様性を確保</li>
              <li>• 高品質閾値設定で低品質コンテンツを除外</li>
              <li>• ランダム時間配信で自然な更新パターンを実現</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 