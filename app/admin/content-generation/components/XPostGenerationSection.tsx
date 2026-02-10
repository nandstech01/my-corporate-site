'use client';

import React, { useState, useEffect } from 'react';
import {
  SparklesIcon,
  DocumentDuplicateIcon,
  EyeIcon,
  XMarkIcon,
  ChartBarIcon,
  ClockIcon,
  TagIcon,
  LinkIcon,
  BuildingOfficeIcon,
  CogIcon,
  GlobeAltIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  Squares2X2Icon
} from '@heroicons/react/24/outline';
import { patternTemplates } from '@/lib/x-post-generation/pattern-templates';

// 生成された投稿の型定義を更新
interface GeneratedXPost {
  success: boolean;
  pattern: {
    id: string;
    name: string;
    description: string;
    category?: string;
  };
  generatedPost: string;
  tags: string[];
  diagram?: string;
  threadPosts?: string[];
  xQuotes?: Array<{url: string, content: string, author?: string}>;
  urlQuotes?: Array<{url: string, title: string, content: string}>;
  metadata: {
    ragSources: string[];
    dataUsed: number;
    generatedAt: string;
    url?: string;
  };
  error?: string;
}

interface XPostGenerationSectionProps {
  className?: string;
}

export default function XPostGenerationSection({ className = '' }: XPostGenerationSectionProps) {
  // State definitions
  const [loading, setLoading] = useState<string | null>(null);
  const [generatedPosts, setGeneratedPosts] = useState<GeneratedXPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<GeneratedXPost | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('general');
  const [activeTab, setActiveTab] = useState('ai_trends');
  const [customMode, setCustomMode] = useState(false);
  const [customQuery, setCustomQuery] = useState('');

  // モード切り替え（pattern/article/research）
  const [generationMode, setGenerationMode] = useState<'pattern' | 'article' | 'research'>('pattern');
  const [articleSlug, setArticleSlug] = useState('');
  const [researchTopic, setResearchTopic] = useState('');
  const [researchUrl, setResearchUrl] = useState('');

  // X投稿機能用State（既存機能に影響なし）
  const [xApiConfigured, setXApiConfigured] = useState<boolean | null>(null);
  const [postingToX, setPostingToX] = useState<number | null>(null);
  const [postResult, setPostResult] = useState<{ index: number; success: boolean; message: string; url?: string } | null>(null);

  // 3つのカテゴリに整理されたタブ
  const tabCategories = {
    general: {
      name: '汎用',
      icon: GlobeAltIcon,
      color: 'from-blue-500 to-purple-600',
      tabs: [
        {
          id: 'ai_trends',
          name: '🚀 AI技術',
          description: 'AI・機械学習の最新動向',
          query: 'AI 人工知能 機械学習 最新技術 トレンド',
          color: 'from-blue-500 to-purple-600'
        },
        {
          id: 'tech_news',
          name: '📱 テクノロジー',
          description: '最新テクノロジーニュース',
          query: 'テクノロジー イノベーション 最新技術 IT ニュース',
          color: 'from-green-500 to-blue-600'
        },
        {
          id: 'data_analysis',
          name: '📊 データ分析',
          description: '市場データ・統計分析',
          query: 'データ分析 統計 市場調査 トレンド分析',
          color: 'from-cyan-500 to-blue-600'
        },
        {
          id: 'future_tech',
          name: '🔮 未来予測',
          description: '技術の将来展望',
          query: '未来予測 将来展望 技術トレンド 2025年',
          color: 'from-purple-500 to-pink-600'
        }
      ]
    },
    companies: {
      name: '企業特化',
      icon: BuildingOfficeIcon,
      color: 'from-orange-500 to-red-600',
      tabs: [
        {
          id: 'google_news',
          name: '🔍 Google',
          description: 'Google関連ニュース',
          query: 'Google グーグル Gemini Bard 検索 AI 最新情報',
          color: 'from-blue-500 to-green-500'
        },
        {
          id: 'openai_news',
          name: '🤖 OpenAI',
          description: 'OpenAI関連ニュース',
          query: 'OpenAI ChatGPT GPT-4 GPT-5 人工知能 最新情報',
          color: 'from-green-500 to-blue-600'
        },
        {
          id: 'anthropic_news',
          name: '🧠 Anthropic',
          description: 'Anthropic関連ニュース',
          query: 'Anthropic Claude AI 人工知能 最新情報',
          color: 'from-purple-500 to-blue-600'
        },
        {
          id: 'genspark_news',
          name: '⚡ Genspark',
          description: 'Genspark関連ニュース',
          query: 'Genspark 検索エンジン AI 最新情報',
          color: 'from-yellow-500 to-orange-600'
        }
      ]
    },
    technologies: {
      name: '技術特化',
      icon: CogIcon,
      color: 'from-indigo-500 to-purple-600',
      tabs: [
        {
          id: 'geo_optimization',
          name: '🌍 GEO',
          description: 'GEO戦略・最適化',
          query: 'GEO 生成エンジン最適化 検索 AI 最適化',
          color: 'from-green-500 to-blue-500'
        },
        {
          id: 'relevance_engineering',
          name: '🔧 RE',
          description: 'レリバンスエンジニアリング',
          query: 'レリバンスエンジニアリング 関連性 検索 AI 最適化',
          color: 'from-blue-500 to-purple-600'
        },
        {
          id: 'aio_analysis',
          name: '🎯 AIO',
          description: 'AIO分析・技術',
          query: 'AIO AI検索最適化 人工知能 最適化 技術',
          color: 'from-red-500 to-pink-600'
        },
        {
          id: 'ai_mode_deep',
          name: '🧬 AIモード',
          description: 'AIモード深層技術',
          query: 'AIモード 深層学習 機械学習 技術 最新',
          color: 'from-purple-500 to-indigo-600'
        }
      ]
    }
  };

  // 統合されたパターン（重複削除）
  const unifiedPatterns = [
    {
      id: 'breaking_insight',
      name: '🔥 速報インサイト',
      description: 'X引用を含む最新ニュースの独自分析',
      category: 'news',
      color: 'from-red-500 to-orange-500'
    },
    {
      id: 'data_analysis',
      name: '📊 データ分析投稿',
      description: 'URL引用付きデータ分析とトレンド解説',
      category: 'analysis',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'tech_explanation',
      name: '⚡ 技術解説',
      description: '技術的内容の分かりやすい解説',
      category: 'education',
      color: 'from-yellow-500 to-green-500'
    },
    {
      id: 'company_comparison',
      name: '🏢 企業比較',
      description: '競合他社との比較分析',
      category: 'business',
      color: 'from-purple-500 to-blue-500'
    }
  ];

  // 現在のカテゴリのタブを取得
  const getCurrentTabs = () => {
    return tabCategories[activeCategory as keyof typeof tabCategories]?.tabs || [];
  };

  // 現在選択されているクエリを取得
  const getCurrentQuery = (): string => {
    if (customMode) {
      return customQuery;
    }
    const currentTabs = getCurrentTabs();
    const activeTabData = currentTabs.find(tab => tab.id === activeTab);
    return activeTabData?.query || '';
  };

  // 名前から絵文字を抽出する関数
  const extractEmoji = (name: string): string => {
    const emojiMatch = name.match(/^([🔥📈🚨⭐✨🚀🌟💡📊⚡🎯📡🌍🔬🧠⚙️🔗🌐🔍🤖🧬🌍🔧]+)/);
    return emojiMatch ? emojiMatch[1] : '📝';
  };

  // カテゴリ変更時にタブをリセット
  useEffect(() => {
    const currentTabs = getCurrentTabs();
    if (currentTabs.length > 0) {
      setActiveTab(currentTabs[0].id);
    }
  }, [activeCategory]);

  // X API設定確認（既存機能に影響なし）
  useEffect(() => {
    const checkXApiConfig = async () => {
      try {
        const response = await fetch('/api/post-to-x');
        const data = await response.json();
        setXApiConfigured(data.configured);
      } catch {
        setXApiConfigured(false);
      }
    };
    checkXApiConfig();
  }, []);

  // X投稿生成処理
  const handlePatternGenerate = async (patternId: string, options: { diagram?: boolean; thread?: boolean } = {}) => {
    setLoading(patternId);
    setError(null);
    
    try {
      const response = await fetch('/api/generate-x-post-pattern', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patternId,
          query: getCurrentQuery(),
          generateDiagram: options.diagram || false,
          includeThread: options.thread || false,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        const newPost: GeneratedXPost = {
          success: true,
          pattern: data.pattern,
          generatedPost: data.generatedPost,
          tags: data.tags,
          diagram: data.diagram,
          threadPosts: data.threadPosts,
          xQuotes: data.xQuotes,
          urlQuotes: data.urlQuotes,
          metadata: data.metadata
        };
        setGeneratedPosts(prev => [newPost, ...prev]);
      } else {
        setError(data.error || '投稿生成に失敗しました');
      }
    } catch (error) {
      setError('API呼び出しエラーが発生しました');
      console.error('Error:', error);
    } finally {
      setLoading(null);
    }
  };

  // 記事モード生成
  const handleArticleGenerate = async () => {
    if (!articleSlug.trim()) {
      setError('記事slugを入力してください');
      return;
    }
    setLoading('article');
    setError(null);

    try {
      const response = await fetch('/api/generate-x-post-pattern', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'article', slug: articleSlug.trim() }),
      });

      const data = await response.json();

      if (data.success) {
        const newPost: GeneratedXPost = {
          success: true,
          pattern: data.pattern,
          generatedPost: data.generatedPost,
          tags: data.tags,
          metadata: data.metadata,
        };
        setGeneratedPosts(prev => [newPost, ...prev]);
      } else {
        setError(data.error || '記事モード生成に失敗しました');
      }
    } catch (err) {
      setError('API呼び出しエラーが発生しました');
      console.error('Error:', err);
    } finally {
      setLoading(null);
    }
  };

  // 調査モード生成
  const handleResearchGenerate = async () => {
    if (!researchTopic.trim() && !researchUrl.trim()) {
      setError('トピックまたはURLを入力してください');
      return;
    }
    setLoading('research');
    setError(null);

    try {
      const response = await fetch('/api/generate-x-post-pattern', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'research',
          topic: researchTopic.trim(),
          url: researchUrl.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const newPost: GeneratedXPost = {
          success: true,
          pattern: data.pattern,
          generatedPost: data.generatedPost,
          tags: data.tags,
          metadata: data.metadata,
        };
        setGeneratedPosts(prev => [newPost, ...prev]);
      } else {
        setError(data.error || '調査モード生成に失敗しました');
      }
    } catch (err) {
      setError('API呼び出しエラーが発生しました');
      console.error('Error:', err);
    } finally {
      setLoading(null);
    }
  };

  /**
   * クリップボードにコピー
   */
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('コピーしました！');
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  /**
   * Xでシェア
   */
  const shareOnX = (post: GeneratedXPost) => {
    const text = post.generatedPost;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  /**
   * Xに自動投稿（既存機能に影響なし）
   */
  const postToX = async (post: GeneratedXPost, index: number) => {
    if (postingToX !== null) return;

    const isLongForm = post.pattern.category === 'article';
    let text = post.generatedPost;
    // 長文モード以外で280文字を超える場合は切り詰め
    if (!isLongForm && text.length > 280) {
      text = text.substring(0, 277) + '...';
    }

    setPostingToX(index);
    setPostResult(null);

    try {
      const response = await fetch('/api/post-to-x', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          ...(isLongForm ? { longForm: true } : {}),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setPostResult({
          index,
          success: true,
          message: 'Xへの投稿が完了しました！',
          url: data.tweetUrl,
        });
      } else {
        setPostResult({
          index,
          success: false,
          message: data.error || '投稿に失敗しました',
        });
      }
    } catch (err) {
      setPostResult({
        index,
        success: false,
        message: 'APIエラーが発生しました',
      });
    } finally {
      setPostingToX(null);
    }
  };

  /**
   * 完全な投稿文を生成（タグ付き）
   */
  const getCompletePost = (post: GeneratedXPost): string => {
    const tags = post.tags.join(' ');
    return post.diagram 
      ? `${post.generatedPost}\n\n${post.diagram}\n\n${tags}`
      : `${post.generatedPost}\n\n${tags}`;
  };

  return (
    <div className={`bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700/50 shadow-2xl backdrop-blur-sm ${className}`}>
      {/* ヘッダー */}
      <div className="p-6 border-b border-gray-700/50 bg-gradient-to-r from-gray-800/50 to-gray-700/50 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600">
              <SparklesIcon className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              X投稿生成システム
            </h2>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-400 bg-gray-800/50 px-3 py-1">
              {generatedPosts.length}/10 投稿生成済み
            </div>
            <button
              onClick={() => setCustomMode(!customMode)}
              className="text-sm bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white px-4 py-2 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
            >
              {customMode ? '📋 プリセット' : '✏️ カスタム'}
            </button>
          </div>
        </div>
        
        {/* モード切り替えタブ */}
        <div className="mb-6">
          <div className="flex space-x-2">
            <button
              onClick={() => setGenerationMode('pattern')}
              className={`flex items-center space-x-2 px-5 py-3 transition-all duration-300 border-2 ${
                generationMode === 'pattern'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg border-white/30'
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 border-gray-600/50'
              }`}
            >
              <Squares2X2Icon className="w-5 h-5" />
              <div className="text-left">
                <div className="text-sm font-semibold">パターン</div>
                <div className="text-xs opacity-75">既存モード</div>
              </div>
            </button>
            <button
              onClick={() => setGenerationMode('article')}
              className={`flex items-center space-x-2 px-5 py-3 transition-all duration-300 border-2 ${
                generationMode === 'article'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg border-white/30'
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 border-gray-600/50'
              }`}
            >
              <DocumentTextIcon className="w-5 h-5" />
              <div className="text-left">
                <div className="text-sm font-semibold">記事要約</div>
                <div className="text-xs opacity-75">ブログ→長文</div>
              </div>
            </button>
            <button
              onClick={() => setGenerationMode('research')}
              className={`flex items-center space-x-2 px-5 py-3 transition-all duration-300 border-2 ${
                generationMode === 'research'
                  ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg border-white/30'
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 border-gray-600/50'
              }`}
            >
              <MagnifyingGlassIcon className="w-5 h-5" />
              <div className="text-left">
                <div className="text-sm font-semibold">調査投稿</div>
                <div className="text-xs opacity-75">最新情報→280字</div>
              </div>
            </button>
          </div>
        </div>

        {/* パターンモード: カテゴリ選択 */}
        {generationMode === 'pattern' && (
          <>
            <div className="mb-6">
              <div className="flex space-x-2 mb-4">
                {Object.entries(tabCategories).map(([key, category]) => {
                  const IconComponent = category.icon;
                  return (
                    <button
                      key={key}
                      onClick={() => setActiveCategory(key)}
                      className={`flex items-center space-x-2 px-4 py-2 transition-all duration-300 transform hover:scale-105 border ${
                        activeCategory === key
                          ? `bg-gradient-to-r ${category.color} text-white shadow-lg border-white/30`
                          : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 border-gray-600/50'
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                      <span className="text-sm font-medium">{category.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* クエリ選択タブ */}
            {customMode ? (
              <div className="mb-4">
                <input
                  type="text"
                  value={customQuery}
                  onChange={(e) => setCustomQuery(e.target.value)}
                  placeholder="カスタムクエリを入力..."
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent backdrop-blur-sm"
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {getCurrentTabs().map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`group p-4 border-2 transition-all duration-300 transform hover:scale-105 relative overflow-hidden ${
                      activeTab === tab.id
                        ? `bg-gradient-to-r ${tab.color} border-white/30 text-white shadow-xl`
                        : 'bg-gray-800/50 border-gray-600/50 text-gray-300 hover:border-gray-500/50 hover:bg-gray-700/50 backdrop-blur-sm'
                    }`}
                  >
                    <div className="text-center relative z-10">
                      <div className="text-lg mb-1">{tab.name}</div>
                      <div className="text-xs opacity-75">{tab.description}</div>
                    </div>
                    {activeTab === tab.id && (
                      <div className="absolute inset-0 border-2 border-white/20 animate-pulse"></div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* 選択中のクエリ表示 */}
            <div className="mt-4 p-3 bg-gray-800/50 border border-gray-600/50 backdrop-blur-sm">
              <div className="text-xs text-gray-400 mb-1">選択中のクエリ:</div>
              <div className="text-sm text-gray-200 font-mono">{getCurrentQuery()}</div>
            </div>
          </>
        )}

        {/* 記事モード入力 */}
        {generationMode === 'article' && (
          <div className="p-4 bg-gray-800/30 border border-green-500/30">
            <h3 className="text-sm font-semibold text-green-300 mb-3 flex items-center">
              <DocumentTextIcon className="w-4 h-4 mr-2" />
              記事要約モード
            </h3>
            <p className="text-xs text-gray-400 mb-3">
              Supabaseから記事を取得し、LangGraphパイプラインでPremium長文投稿（1000-2000文字）を生成します。
            </p>
            <div className="flex space-x-3">
              <input
                type="text"
                value={articleSlug}
                onChange={(e) => setArticleSlug(e.target.value)}
                placeholder="記事slug（例: domoai-953306）"
                className="flex-1 px-4 py-3 bg-gray-900/50 border border-gray-600/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-transparent"
              />
              <button
                onClick={handleArticleGenerate}
                disabled={loading === 'article'}
                className={`px-6 py-3 font-semibold transition-all duration-300 ${
                  loading === 'article'
                    ? 'bg-gray-600 cursor-not-allowed text-gray-400'
                    : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 transform hover:scale-105'
                }`}
              >
                {loading === 'article' ? (
                  <span className="flex items-center space-x-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full"></span>
                    <span>生成中...</span>
                  </span>
                ) : (
                  '生成'
                )}
              </button>
            </div>
          </div>
        )}

        {/* 調査モード入力 */}
        {generationMode === 'research' && (
          <div className="p-4 bg-gray-800/30 border border-orange-500/30">
            <h3 className="text-sm font-semibold text-orange-300 mb-3 flex items-center">
              <MagnifyingGlassIcon className="w-4 h-4 mr-2" />
              調査投稿モード
            </h3>
            <p className="text-xs text-gray-400 mb-3">
              Brave Searchで最新情報を収集し、LangGraphパイプラインで280文字投稿を生成します。
            </p>
            <div className="space-y-3">
              <input
                type="text"
                value={researchTopic}
                onChange={(e) => setResearchTopic(e.target.value)}
                placeholder="トピック（例: Claude Code 最新機能）"
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-transparent"
              />
              <input
                type="text"
                value={researchUrl}
                onChange={(e) => setResearchUrl(e.target.value)}
                placeholder="URL（任意）"
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-transparent"
              />
              <button
                onClick={handleResearchGenerate}
                disabled={loading === 'research'}
                className={`w-full px-6 py-3 font-semibold transition-all duration-300 ${
                  loading === 'research'
                    ? 'bg-gray-600 cursor-not-allowed text-gray-400'
                    : 'bg-gradient-to-r from-orange-500 to-red-600 text-white hover:from-orange-600 hover:to-red-700 transform hover:scale-105'
                }`}
              >
                {loading === 'research' ? (
                  <span className="flex items-center justify-center space-x-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full"></span>
                    <span>調査・生成中...</span>
                  </span>
                ) : (
                  '調査して生成'
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* パターン生成セクション（パターンモード時のみ） */}
      <div className="p-6">
        {generationMode === 'pattern' && <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <SparklesIcon className="w-5 h-5 mr-2 text-blue-400" />
            投稿パターン生成
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {unifiedPatterns.map((pattern) => {
              const isLoading = loading === pattern.id;
              const isBreaking = pattern.id === 'breaking_insight';
              
              return (
                <div
                  key={pattern.id}
                  className={`group relative p-6 border transition-all duration-300 transform hover:scale-105 cursor-pointer ${
                    isLoading
                      ? 'bg-gray-700/50 border-gray-600/50 animate-pulse'
                      : isBreaking
                      ? 'bg-gradient-to-br from-red-900/80 to-red-800/80 border-red-500/50 hover:border-red-400/70 backdrop-blur-sm'
                      : 'bg-gradient-to-br from-gray-800/50 to-gray-700/50 border-gray-600/50 hover:border-gray-500/50 backdrop-blur-sm'
                  } ${isBreaking ? 'animate-pulse-border' : ''}`}
                  onClick={() => !isLoading && handlePatternGenerate(pattern.id)}
                  style={{
                    animation: isBreaking ? 'pulse-border 2s infinite' : 'none'
                  }}
                >
                  {/* 速報専用の脈動境界線 */}
                  {isBreaking && (
                    <>
                      <div className="absolute inset-0 border-2 border-white/30 animate-ping"></div>
                      <div className="absolute inset-0 border border-red-400/50 animate-pulse"></div>
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-white to-red-500 animate-slide"></div>
                    </>
                  )}
                  
                  <div className="flex items-start justify-between relative z-10">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className={`p-2 bg-gradient-to-r ${isBreaking ? 'from-red-500 to-orange-500' : pattern.color} ${isBreaking ? 'animate-pulse' : ''}`}>
                          <div className="text-white text-sm font-bold">
                            {extractEmoji(pattern.name)}
                          </div>
                        </div>
                        <div>
                          <h4 className={`font-semibold ${isBreaking ? 'text-red-100' : 'text-white'} group-hover:text-blue-400 transition-colors`}>
                            {pattern.name}
                            {isBreaking && <span className="ml-2 text-xs bg-red-500 text-white px-2 py-1 animate-bounce">LIVE</span>}
                          </h4>
                          <p className={`text-sm ${isBreaking ? 'text-red-200' : 'text-gray-400'}`}>
                            {pattern.description}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent animate-spin"></div>
                        <span className="text-sm text-gray-400">生成中...</span>
                      </div>
                    ) : (
                      <div className={`${isBreaking ? 'text-red-300' : 'text-blue-400'} opacity-0 group-hover:opacity-100 transition-opacity`}>
                        <SparklesIcon className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                  
                  {/* 速報専用のグロー効果 */}
                  {isBreaking && (
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-transparent to-red-500/10 animate-pulse pointer-events-none"></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>}

        {/* エラー表示 */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-500/50 text-red-200 backdrop-blur-sm">
            <div className="flex items-center">
              <XMarkIcon className="w-5 h-5 mr-2" />
              {error}
            </div>
          </div>
        )}

        {/* 生成された投稿一覧 */}
        {generatedPosts.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <DocumentDuplicateIcon className="w-5 h-5 mr-2 text-green-400" />
              生成された投稿
            </h3>
            
            <div className="space-y-4">
              {generatedPosts.map((post, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-800/50 border border-gray-600/50 backdrop-blur-sm hover:bg-gray-700/50 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gradient-to-r from-green-500 to-blue-500">
                        <div className="text-white text-sm font-bold">
                          {extractEmoji(post.pattern.name)}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">{post.pattern.name}</h4>
                        <p className="text-sm text-gray-400">{post.pattern.description}</p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedPost(post);
                          setShowPreview(true);
                        }}
                        className="p-2 bg-blue-600/50 hover:bg-blue-600 transition-colors transform hover:scale-110"
                        title="プレビュー"
                      >
                        <EyeIcon className="w-4 h-4 text-white" />
                      </button>
                      <button
                        onClick={() => copyToClipboard(getCompletePost(post))}
                        className="p-2 bg-green-600/50 hover:bg-green-600 transition-colors transform hover:scale-110"
                        title="コピー"
                      >
                        <DocumentDuplicateIcon className="w-4 h-4 text-white" />
                      </button>
                      <button
                        onClick={() => shareOnX(post)}
                        className="p-2 bg-black/50 hover:bg-black transition-colors transform hover:scale-110"
                        title="Xでシェア"
                      >
                        <span className="text-white text-sm font-bold">𝕏</span>
                      </button>
                      {/* Xに投稿ボタン（API設定時のみ表示） */}
                      {xApiConfigured && (
                        <button
                          onClick={() => postToX(post, index)}
                          disabled={postingToX !== null}
                          className={`px-3 py-2 transition-colors transform hover:scale-105 flex items-center space-x-1 ${
                            postingToX === index
                              ? 'bg-gray-600 cursor-not-allowed'
                              : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
                          }`}
                          title="Xに自動投稿"
                        >
                          {postingToX === index ? (
                            <>
                              <div className="w-3 h-3 border-2 border-white border-t-transparent animate-spin"></div>
                              <span className="text-white text-xs">投稿中...</span>
                            </>
                          ) : (
                            <span className="text-white text-xs font-bold">Xに投稿</span>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-300 line-clamp-2">
                    {post.generatedPost}
                  </div>

                  {/* 文字数表示 */}
                  <div className={`mt-1 text-xs ${
                    post.pattern.category === 'article'
                      ? post.generatedPost.length > 25000 ? 'text-red-400' : 'text-green-400'
                      : post.generatedPost.length > 280 ? 'text-yellow-400' : 'text-gray-500'
                  }`}>
                    {post.generatedPost.length}{post.pattern.category === 'article' ? '/25000文字（長文）' : '/280文字'}
                    {post.pattern.category !== 'article' && post.generatedPost.length > 280 && ' (投稿時に自動切り詰め)'}
                  </div>
                  
                  {post.tags && post.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {post.tags.map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className="px-2 py-1 bg-blue-600/20 text-blue-300 text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div className="mt-3 flex items-center space-x-4 text-xs text-gray-400">
                    <div className="flex items-center">
                      <ChartBarIcon className="w-3 h-3 mr-1" />
                      データ使用: {post.metadata.dataUsed}件
                    </div>
                    <div className="flex items-center">
                      <ClockIcon className="w-3 h-3 mr-1" />
                      {new Date(post.metadata.generatedAt).toLocaleString('ja-JP')}
                    </div>
                  </div>

                  {/* 投稿結果表示 */}
                  {postResult && postResult.index === index && (
                    <div className={`mt-3 p-3 border ${
                      postResult.success
                        ? 'bg-green-900/50 border-green-500/50 text-green-200'
                        : 'bg-red-900/50 border-red-500/50 text-red-200'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{postResult.message}</span>
                        {postResult.url && (
                          <a
                            href={postResult.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 text-sm underline flex items-center"
                          >
                            <LinkIcon className="w-3 h-3 mr-1" />
                            投稿を見る
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* プレビューモーダル */}
      {showPreview && selectedPost && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700/50 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-gray-700/50 bg-gradient-to-r from-gray-800/50 to-gray-700/50">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  {extractEmoji(selectedPost.pattern.name)} {selectedPost.pattern.name} - 投稿プレビュー
                </h3>
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-2 hover:bg-gray-700/50 transition-colors"
                >
                  <XMarkIcon className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* 完整投稿文 */}
              <div>
                <h4 className="text-white font-semibold mb-3">完整投稿文</h4>
                <div className="p-4 bg-gray-800/50 border border-gray-600/50 text-gray-200 whitespace-pre-wrap">
                  {selectedPost.generatedPost}
                </div>
                
                {selectedPost.tags && selectedPost.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedPost.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-600/20 text-blue-300 text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* URL引用 */}
              {selectedPost.urlQuotes && selectedPost.urlQuotes.length > 0 && (
                <div>
                  <h4 className="text-white font-semibold mb-3">URL引用</h4>
                  <div className="space-y-3">
                    {selectedPost.urlQuotes.map((quote, index) => (
                      <div
                        key={index}
                        className="p-4 bg-gray-800/50 border border-gray-600/50"
                      >
                        <div className="text-sm text-gray-300 mb-2">
                          "<span className="font-medium">タイトル:</span> {quote.title}"
                        </div>
                        <div className="text-sm text-gray-400 mb-2">
                          "<span className="font-medium">内容:</span> {quote.content}"
                        </div>
                        <a
                          href={quote.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 text-sm underline flex items-center"
                        >
                          <LinkIcon className="w-3 h-3 mr-1" />
                          {quote.url}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* X投稿引用 */}
              {selectedPost.xQuotes && selectedPost.xQuotes.length > 0 && (
                <div>
                  <h4 className="text-white font-semibold mb-3">X投稿引用</h4>
                  <div className="space-y-3">
                    {selectedPost.xQuotes.map((quote, index) => (
                      <div
                        key={index}
                        className="p-4 bg-gray-800/50 border border-gray-600/50"
                      >
                        <div className="text-sm text-gray-300 mb-2">
                          "{quote.content}"
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-blue-400 text-sm">
                            {quote.author || 'X投稿'}
                          </span>
                          <a
                            href={quote.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 text-sm underline"
                          >
                            元投稿を見る
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* アクションボタン */}
              <div className="flex space-x-3">
                <button
                  onClick={() => copyToClipboard(getCompletePost(selectedPost))}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 transition-all duration-300 flex items-center justify-center space-x-2 transform hover:scale-105"
                >
                  <DocumentDuplicateIcon className="w-4 h-4" />
                  <span>投稿文をコピー</span>
                </button>
                <button
                  onClick={() => shareOnX(selectedPost)}
                  className="flex-1 bg-black hover:bg-gray-800 text-white px-4 py-2 transition-colors flex items-center justify-center space-x-2 transform hover:scale-105"
                >
                  <span className="font-bold">𝕏</span>
                  <span>でシェア</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* カスタムスタイル */}
      <style jsx>{`
        @keyframes pulse-border {
          0%, 100% {
            border-color: rgba(239, 68, 68, 0.5);
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4);
          }
          50% {
            border-color: rgba(255, 255, 255, 0.8);
            box-shadow: 0 0 0 8px rgba(239, 68, 68, 0);
          }
        }
        
        @keyframes slide {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        
        .animate-slide {
          animation: slide 2s linear infinite;
        }
        
        .animate-pulse-border {
          animation: pulse-border 2s infinite;
        }
      `}</style>
    </div>
  );
} 