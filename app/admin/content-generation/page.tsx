'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/supabase';
import { 
  SparklesIcon, 
  DocumentTextIcon, 
  ChatBubbleLeftEllipsisIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  RocketLaunchIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

interface GeneratedContent {
  id: number;
  type: string;
  title: string;
  content: string;
  metadata: any;
  created_at: string;
  updated_at: string;
}

interface RAGSearchResult {
  id: number;
  content: string;
  source: string;
  score?: number;
  metadata?: any;
}

interface BlogGenerationForm {
  query: string;
  selectedRAGs: string[];
  targetLength: number;
  businessCategory: string;
  categorySlug: string;
  includeImages: boolean;
  dateFilter: 'all' | '7days' | '30days' | '90days';
  latestNewsMode: boolean;
}

export default function ContentGenerationPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [contents, setContents] = useState<GeneratedContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContent, setSelectedContent] = useState<GeneratedContent | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  
  // カテゴリ管理
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<any[]>([]);
  
  // RAGブログ記事生成関連
  const [showRAGBlogGeneration, setShowRAGBlogGeneration] = useState(false);
  const [showUsageGuide, setShowUsageGuide] = useState(false);
  const [ragSearchResults, setRagSearchResults] = useState<RAGSearchResult[]>([]);
  const [blogGenerationForm, setBlogGenerationForm] = useState<BlogGenerationForm>({
    query: '',
    selectedRAGs: ['company', 'trend', 'youtube'],
    targetLength: 6000,
    businessCategory: '',
    categorySlug: '',
    includeImages: true,
    dateFilter: 'all',
    latestNewsMode: false
  });
  const [ragSearchLoading, setRagSearchLoading] = useState(false);
  const [blogGenerationLoading, setBlogGenerationLoading] = useState(false);

  // 認証チェック
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/admin');
      return;
    }
  }, [user, authLoading, router]);

  // 初期データ読み込み
  useEffect(() => {
    fetchContents();
    fetchCategories();
  }, []);

  // 事業カテゴリ変更時にフィルタリング
  useEffect(() => {
    if (blogGenerationForm.businessCategory) {
      const selectedBusiness = businesses.find(b => b.slug === blogGenerationForm.businessCategory);
      if (selectedBusiness) {
        setFilteredCategories(selectedBusiness.categories || []);
        // 最初のカテゴリを自動選択
        if (selectedBusiness.categories && selectedBusiness.categories.length > 0) {
          setBlogGenerationForm(prev => ({
            ...prev,
            categorySlug: selectedBusiness.categories[0].slug
          }));
        }
      }
    } else {
      setFilteredCategories([]);
    }
  }, [blogGenerationForm.businessCategory, businesses]);

  const fetchContents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('generated_content')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        // テーブルが存在しない場合はエラーを無視
        if (error.code === '42P01') {
          console.warn('generated_contentテーブルが存在しません。テーブルを作成してください。');
          setContents([]);
          return;
        }
        throw error;
      }
      setContents(data || []);
    } catch (error) {
      console.error('Error fetching contents:', error);
      setContents([]); // エラー時は空配列に設定
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setBusinesses(data.businesses || []);
        setCategories(data.categories || []);
        
        // 最初の事業カテゴリを自動選択
        if (data.businesses && data.businesses.length > 0) {
          setBlogGenerationForm(prev => ({
            ...prev,
            businessCategory: data.businesses[0].slug
          }));
        }
      }
    } catch (error) {
      console.error('カテゴリ取得エラー:', error);
    }
  };

  // RAGデータ検索（統合RAGエンドポイント使用）
  const searchRAGData = async () => {
    if (!blogGenerationForm.query.trim()) {
      alert('検索クエリを入力してください');
      return;
    }

    setRagSearchLoading(true);
    try {
      // 統合RAGエンドポイントを使用
      const response = await fetch('/api/search-rag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: blogGenerationForm.query,
          sources: blogGenerationForm.selectedRAGs,
          limit: 5, // 各RAGから5件ずつ取得
          threshold: 0.3,
          dateFilter: blogGenerationForm.dateFilter,
          latestNewsMode: blogGenerationForm.latestNewsMode
        })
      });

      if (!response.ok) {
        throw new Error('RAG検索API呼び出しに失敗しました');
      }

      const result = await response.json();
      
      if (result.success && result.results) {
        const allResults: RAGSearchResult[] = result.results.map((item: any) => ({
          id: item.id,
          content: item.content,
          source: item.source,
          score: item.score,
          metadata: item.metadata
        }));

        setRagSearchResults(allResults);
        console.log(`✅ RAG検索完了: ${allResults.length}件取得`);
        console.log('📊 検索結果統計:', result.summary);
      } else {
        throw new Error('RAG検索結果の取得に失敗しました');
      }
    } catch (error) {
      console.error('RAG search error:', error);
      alert(`RAG検索でエラーが発生しました: ${(error as Error).message}`);
    } finally {
      setRagSearchLoading(false);
    }
  };

  // RAGブログ記事生成
  const generateRAGBlogArticle = async () => {
    if (ragSearchResults.length === 0) {
      alert('まずRAGデータを検索してください');
      return;
    }

    setBlogGenerationLoading(true);
    try {
      const response = await fetch('/api/generate-rag-blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: blogGenerationForm.query,
          ragData: ragSearchResults,
          targetLength: blogGenerationForm.targetLength,
          businessCategory: blogGenerationForm.businessCategory,
          categorySlug: blogGenerationForm.categorySlug,
          includeImages: blogGenerationForm.includeImages
        })
      });

      if (response.ok) {
        const result = await response.json();
        
        // 成功時の処理
        console.log('✅ 記事生成成功:', result);
        console.log('✅ 生成された記事ID:', result.postId);
        console.log('✅ 記事タイトル:', result.title);
        console.log('✅ 記事文字数:', result.wordCount);
        
        // 短いアラートで成功を表示
        alert(`記事生成完了！\n\nタイトル: ${result.title}\n文字数: ${result.wordCount}文字\n\n記事一覧画面に移動します...`);
        
        // 記事一覧画面に移動
        console.log('🔄 記事一覧画面に移動します...');
        
        // 少し遅延を持たせてリダイレクト（アラートが閉じられるまで待つ）
        setTimeout(() => {
          try {
            router.push('/admin/posts');
            console.log('✅ リダイレクト実行完了');
          } catch (error) {
            console.error('❌ リダイレクトエラー:', error);
            // 手動でリダイレクトを試行
            console.log('🔄 手動リダイレクトを試行...');
            window.location.href = '/admin/posts';
          }
        }, 500);
      } else {
        throw new Error('ブログ記事生成に失敗しました');
      }
    } catch (error) {
      console.error('Blog generation error:', error);
      alert('ブログ記事生成でエラーが発生しました');
    } finally {
      setBlogGenerationLoading(false);
    }
  };

  // コンテンツを記事に変換
  const convertToArticle = async (content: GeneratedContent) => {
    try {
      const { data, error } = await supabase
        .from('chatgpt_posts')
        .insert([
          {
            title: content.title,
            content: content.content,
            status: 'draft',
            chatgpt_section_id: 1, // デフォルトセクション
            created_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (error) throw error;
      
      // 記事編集画面に遷移
      router.push(`/admin/posts/${data.id}/edit`);
    } catch (error) {
      console.error('Error converting to article:', error);
      alert('記事への変換でエラーが発生しました');
    }
  };

  // X投稿生成
  const generateTwitterPost = async (content: GeneratedContent) => {
    try {
      const response = await fetch('/api/generate-x-post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contentId: content.id,
          title: content.title,
          summary: content.content.substring(0, 500) // 最初の500文字を要約として使用
        })
      });

      if (response.ok) {
        const data = await response.json();
        // X投稿管理画面に遷移（実装予定）
        alert('X投稿を生成しました：\n' + data.posts.map((post: any) => post.content).join('\n\n---\n\n'));
      } else {
        throw new Error('X投稿生成に失敗しました');
      }
    } catch (error) {
      console.error('Error generating X post:', error);
      alert('X投稿の生成でエラーが発生しました');
    }
  };

  // コンテンツ削除
  const deleteContent = async (id: number) => {
    if (!confirm('このコンテンツを削除しますか？')) return;

    try {
      const { error } = await supabase
        .from('generated_content')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setContents(contents.filter(c => c.id !== id));
    } catch (error) {
      console.error('Error deleting content:', error);
      alert('削除でエラーが発生しました');
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'trend-article':
        return 'トレンド記事';
      case 'x-post':
        return 'X投稿';
      default:
        return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'trend-article':
        return 'bg-blue-500';
      case 'x-post':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <SparklesIcon className="w-8 h-8" />
          <h1 className="text-3xl font-bold">コンテンツ生成管理</h1>
        </div>
        <p className="text-purple-100">
          トリプルRAGシステムで生成されたコンテンツを管理し、記事やX投稿に変換できます
        </p>
      </div>

      <div className="p-6">
        {/* 統計情報 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center space-x-3">
              <DocumentTextIcon className="w-8 h-8 text-blue-400" />
              <div>
                <p className="text-2xl font-bold text-white">
                  {contents.filter(c => c.type === 'trend-article').length}
                </p>
                <p className="text-gray-400">生成記事数</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center space-x-3">
              <ChatBubbleLeftEllipsisIcon className="w-8 h-8 text-green-400" />
              <div>
                <p className="text-2xl font-bold text-white">
                  {contents.filter(c => c.type === 'x-post').length}
                </p>
                <p className="text-gray-400">X投稿数</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center space-x-3">
              <ClockIcon className="w-8 h-8 text-purple-400" />
              <div>
                <p className="text-2xl font-bold text-white">{contents.length}</p>
                <p className="text-gray-400">総コンテンツ数</p>
              </div>
            </div>
          </div>
        </div>

        {/* 使い方マニュアルセクション */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 mb-6">
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <DocumentTextIcon className="w-6 h-6 text-blue-400" />
                <h2 className="text-xl font-semibold">使い方マニュアル</h2>
              </div>
              <button
                onClick={() => setShowUsageGuide(!showUsageGuide)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                {showUsageGuide ? '閉じる' : '使い方を見る'}
              </button>
            </div>
            <p className="text-gray-400 mt-2">
              トリプルRAGシステムの効果的な活用方法を詳しく解説
            </p>
          </div>
          
          {showUsageGuide && (
            <div className="p-6 space-y-6">
              
              {/* 基本的な使い方 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                  <span className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-sm font-bold text-white">1</span>
                  <span>基本的な使い方</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h4 className="font-medium text-white mb-2">📝 検索クエリ</h4>
                    <p className="text-gray-300 text-sm">
                      記事のテーマとなるキーワードを入力します。
                    </p>
                    <div className="mt-2 text-xs text-gray-400">
                      例: 「AI エージェント 最新技術」「リスキリング 人材育成」
                    </div>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h4 className="font-medium text-white mb-2">🎯 文字数設定</h4>
                    <p className="text-gray-300 text-sm">
                      記事の文字数を選択します。実際に指定文字数で生成されます。
                    </p>
                    <div className="mt-2 text-xs text-gray-400">
                      5,000文字〜8,000文字まで対応
                    </div>
                  </div>
                </div>
              </div>

              {/* RAGシステム選択ガイド */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                  <span className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-sm font-bold text-white">2</span>
                  <span>RAGシステムの選択方法</span>
                </h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h4 className="font-medium text-white mb-2 flex items-center space-x-2">
                      <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
                      <span>Company RAG</span>
                    </h4>
                    <p className="text-gray-300 text-sm mb-2">
                      自社の全27サービス・事業情報を活用
                    </p>
                    <div className="text-xs text-gray-400">
                      <strong>選択すべき記事:</strong><br />
                      • 自社サービスの紹介記事<br />
                      • 企業の専門性を活かした記事<br />
                      • 実績・事例を含む記事
                    </div>
                  </div>
                  
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h4 className="font-medium text-white mb-2 flex items-center space-x-2">
                      <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                      <span>Trend RAG</span>
                    </h4>
                    <p className="text-gray-300 text-sm mb-2">
                      最新ニュース・トレンド情報（57件）
                    </p>
                    <div className="text-xs text-gray-400">
                      <strong>選択すべき記事:</strong><br />
                      • 最新技術動向の記事<br />
                      • ニュース解説記事<br />
                      • 業界トレンド分析記事
                    </div>
                  </div>
                  
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h4 className="font-medium text-white mb-2 flex items-center space-x-2">
                      <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                      <span>YouTube RAG</span>
                    </h4>
                    <p className="text-gray-300 text-sm mb-2">
                      教育系動画の詳細情報
                    </p>
                    <div className="text-xs text-gray-400">
                      <strong>選択すべき記事:</strong><br />
                      • 技術解説記事<br />
                      • 学習ガイド記事<br />
                      • 実践的なハウツー記事
                    </div>
                  </div>
                </div>
              </div>

              {/* 記事タイプ別推奨パターン */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                  <span className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-sm font-bold text-white">3</span>
                  <span>記事タイプ別推奨パターン</span>
                </h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-green-900 to-green-800 rounded-lg p-4">
                    <h4 className="font-medium text-white mb-3 flex items-center space-x-2">
                      <span className="text-xl">🚀</span>
                      <span>最新技術情報記事</span>
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <span className="text-green-300">✓</span>
                        <span className="text-white">Company RAG + Trend RAG</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-green-300">✓</span>
                        <span className="text-white">最新ニュースモード: ON</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-green-300">✓</span>
                        <span className="text-white">日付フィルタ: 7days</span>
                      </div>
                    </div>
                    <div className="mt-3 text-xs text-gray-200">
                      <strong>用途:</strong> 「AI最新技術」「ChatGPT新機能」「生成AI動向」
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-lg p-4">
                    <h4 className="font-medium text-white mb-3 flex items-center space-x-2">
                      <span className="text-xl">🔧</span>
                      <span>専門技術深掘り記事</span>
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <span className="text-blue-300">✓</span>
                        <span className="text-white">Company RAG + YouTube RAG</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-blue-300">✓</span>
                        <span className="text-white">最新ニュースモード: OFF</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-blue-300">✓</span>
                        <span className="text-white">日付フィルタ: all</span>
                      </div>
                    </div>
                    <div className="mt-3 text-xs text-gray-200">
                      <strong>用途:</strong> 「システム開発手法」「AIエージェント実装」「技術アーキテクチャ」
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-900 to-purple-800 rounded-lg p-4">
                    <h4 className="font-medium text-white mb-3 flex items-center space-x-2">
                      <span className="text-xl">📚</span>
                      <span>包括的解説記事</span>
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <span className="text-purple-300">✓</span>
                        <span className="text-white">Company RAG + Trend RAG + YouTube RAG</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-purple-300">✓</span>
                        <span className="text-white">最新ニュースモード: OFF</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-purple-300">✓</span>
                        <span className="text-white">日付フィルタ: 30days</span>
                      </div>
                    </div>
                    <div className="mt-3 text-xs text-gray-200">
                      <strong>用途:</strong> 「リスキリング完全ガイド」「企業DX戦略」「人材育成体系」
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-orange-900 to-orange-800 rounded-lg p-4">
                    <h4 className="font-medium text-white mb-3 flex items-center space-x-2">
                      <span className="text-xl">📰</span>
                      <span>ニュース解説記事</span>
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <span className="text-orange-300">✓</span>
                        <span className="text-white">Trend RAG のみ</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-orange-300">✓</span>
                        <span className="text-white">最新ニュースモード: ON</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-orange-300">✓</span>
                        <span className="text-white">日付フィルタ: 7days</span>
                      </div>
                    </div>
                    <div className="mt-3 text-xs text-gray-200">
                      <strong>用途:</strong> 「AI業界最新動向」「テック業界ニュース」「技術トレンド速報」
                    </div>
                  </div>
                </div>
              </div>

              {/* 高度な設定 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                  <span className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-sm font-bold text-white">4</span>
                  <span>高度な設定</span>
                </h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h4 className="font-medium text-white mb-2">⚡ 最新ニュースモード</h4>
                    <p className="text-gray-300 text-sm mb-2">
                      トレンドRAGの情報に新しさによる重み付けを適用
                    </p>
                    <div className="text-xs text-gray-400 space-y-1">
                      <div>• 24時間以内: +0.3ボーナス</div>
                      <div>• 7日以内: +0.15ボーナス</div>
                      <div>• 30日以内: +0.05ボーナス</div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h4 className="font-medium text-white mb-2">📅 日付フィルタ</h4>
                    <p className="text-gray-300 text-sm mb-2">
                      指定期間内の情報のみを使用
                    </p>
                    <div className="text-xs text-gray-400 space-y-1">
                      <div>• 7days: 直近1週間の情報のみ</div>
                      <div>• 30days: 直近1ヶ月の情報のみ</div>
                      <div>• all: 全期間の情報を使用</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 注意事項 */}
              <div className="bg-yellow-900 border border-yellow-700 rounded-lg p-4">
                <h4 className="font-medium text-yellow-300 mb-2">⚠️ 注意事項</h4>
                <ul className="text-sm text-yellow-200 space-y-1">
                  <li>• 最新ニュースモードON時は、YouTube RAGが自動的に除外されます</li>
                  <li>• 文字数制限は実際に機能しており、指定した文字数程度で記事が生成されます</li>
                  <li>• 生成された記事は自動的にRAGシステムに追加され、今後の記事生成で参照可能になります</li>
                  <li>• カテゴリ関連性システムにより、選択したカテゴリに最適化された記事が生成されます</li>
                </ul>
              </div>

              {/* 使用例 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                  <span className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center text-sm font-bold text-white">5</span>
                  <span>実際の使用例</span>
                </h3>
                
                <div className="bg-gray-700 rounded-lg p-4">
                  <h4 className="font-medium text-white mb-2">例: 「AI エージェント 最新技術」記事の生成</h4>
                  <div className="text-sm text-gray-300 space-y-2">
                    <div><strong>手順1:</strong> 検索クエリに「AI エージェント 最新技術」を入力</div>
                    <div><strong>手順2:</strong> Company RAG + Trend RAG を選択</div>
                    <div><strong>手順3:</strong> 最新ニュースモードを ON、日付フィルタを 7days に設定</div>
                    <div><strong>手順4:</strong> 目標文字数を 6,000文字 に設定</div>
                                         <div><strong>手順5:</strong> 事業カテゴリを「リスキリング」、記事カテゴリを「AIニュース・トレンド」に設定</div>
                    <div><strong>手順6:</strong> 「RAGデータ検索」をクリック</div>
                    <div><strong>手順7:</strong> 検索結果を確認後、「記事生成」をクリック</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RAGブログ記事生成セクション */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 mb-6">
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <RocketLaunchIcon className="w-6 h-6 text-purple-400" />
                <h2 className="text-xl font-semibold">RAGブログ記事生成</h2>
              </div>
              <button
                onClick={() => setShowRAGBlogGeneration(!showRAGBlogGeneration)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
              >
                {showRAGBlogGeneration ? '閉じる' : '記事生成を開始'}
              </button>
            </div>
            <p className="text-gray-400 mt-2">
              トリプルRAGシステムからデータを取得して、5000-7000文字の高品質ブログ記事を自動生成
            </p>
          </div>
          
          {showRAGBlogGeneration && (
            <div className="p-6 space-y-6">
              {/* 検索設定 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    検索クエリ
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={blogGenerationForm.query}
                      onChange={(e) => setBlogGenerationForm({
                        ...blogGenerationForm,
                        query: e.target.value
                      })}
                      placeholder="例: レリバンスエンジニアリングとSEO最適化"
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <MagnifyingGlassIcon className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    目標文字数
                  </label>
                  <select
                    value={blogGenerationForm.targetLength}
                    onChange={(e) => setBlogGenerationForm({
                      ...blogGenerationForm,
                      targetLength: parseInt(e.target.value)
                    })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value={5000}>5,000文字</option>
                    <option value={6000}>6,000文字</option>
                    <option value={7000}>7,000文字</option>
                    <option value={8000}>8,000文字</option>
                  </select>
                </div>
              </div>

              {/* RAGシステム選択 */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  使用するRAGシステム
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <label className="flex items-center space-x-3 p-4 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors">
                    <input
                      type="checkbox"
                      checked={blogGenerationForm.selectedRAGs.includes('company')}
                      onChange={(e) => {
                        const newSelected = e.target.checked
                          ? [...blogGenerationForm.selectedRAGs, 'company']
                          : blogGenerationForm.selectedRAGs.filter(s => s !== 'company');
                        setBlogGenerationForm({
                          ...blogGenerationForm,
                          selectedRAGs: newSelected
                        });
                      }}
                      className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                    />
                    <div>
                      <div className="font-medium text-white">Company RAG</div>
                      <div className="text-sm text-gray-400">自社情報・サービス</div>
                    </div>
                  </label>
                  
                  <label className="flex items-center space-x-3 p-4 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors">
                    <input
                      type="checkbox"
                      checked={blogGenerationForm.selectedRAGs.includes('trend')}
                      onChange={(e) => {
                        const newSelected = e.target.checked
                          ? [...blogGenerationForm.selectedRAGs, 'trend']
                          : blogGenerationForm.selectedRAGs.filter(s => s !== 'trend');
                        setBlogGenerationForm({
                          ...blogGenerationForm,
                          selectedRAGs: newSelected
                        });
                      }}
                      className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                    />
                    <div>
                      <div className="font-medium text-white">Trend RAG</div>
                      <div className="text-sm text-gray-400">最新ニュース・トレンド</div>
                    </div>
                  </label>
                  
                  <label className="flex items-center space-x-3 p-4 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors">
                    <input
                      type="checkbox"
                      checked={blogGenerationForm.selectedRAGs.includes('youtube')}
                      onChange={(e) => {
                        const newSelected = e.target.checked
                          ? [...blogGenerationForm.selectedRAGs, 'youtube']
                          : blogGenerationForm.selectedRAGs.filter(s => s !== 'youtube');
                        setBlogGenerationForm({
                          ...blogGenerationForm,
                          selectedRAGs: newSelected
                        });
                      }}
                      className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                    />
                    <div>
                      <div className="font-medium text-white">YouTube RAG</div>
                      <div className="text-sm text-gray-400">教育系動画情報</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* カテゴリ設定 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    事業カテゴリ
                  </label>
                  <select
                    value={blogGenerationForm.businessCategory}
                    onChange={(e) => setBlogGenerationForm({
                      ...blogGenerationForm,
                      businessCategory: e.target.value
                    })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">選択してください</option>
                    {businesses.map((business) => (
                      <option key={business.slug} value={business.slug}>
                        {business.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    記事カテゴリ
                  </label>
                  <select
                    value={blogGenerationForm.categorySlug}
                    onChange={(e) => setBlogGenerationForm({
                      ...blogGenerationForm,
                      categorySlug: e.target.value
                    })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">選択してください</option>
                    {filteredCategories.map((category) => (
                      <option key={category.slug} value={category.slug}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* アクションボタン */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={async () => {
                    if (!blogGenerationForm.query.trim()) {
                      alert('検索クエリを入力してください');
                      return;
                    }
                    
                    setRagSearchLoading(true);
                    try {
                      const response = await fetch('/api/search-rag', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          query: blogGenerationForm.query,
                          sources: blogGenerationForm.selectedRAGs,
                          limit: 10,
                          threshold: 0.3
                        })
                      });
                      
                      if (response.ok) {
                        const data = await response.json();
                        setRagSearchResults(data.results || []);
                      } else {
                        throw new Error('RAG検索に失敗しました');
                      }
                    } catch (error) {
                      console.error('RAG検索エラー:', error);
                      alert('RAG検索でエラーが発生しました');
                    } finally {
                      setRagSearchLoading(false);
                    }
                  }}
                  disabled={ragSearchLoading || !blogGenerationForm.query.trim() || blogGenerationForm.selectedRAGs.length === 0}
                  className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  <MagnifyingGlassIcon className="w-5 h-5" />
                  <span>{ragSearchLoading ? 'RAG検索中...' : 'RAGデータ検索'}</span>
                </button>
                
                {ragSearchResults.length > 0 && (
                  <button
                    onClick={generateRAGBlogArticle}
                    disabled={blogGenerationLoading}
                    className="flex items-center space-x-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
                  >
                    <RocketLaunchIcon className="w-5 h-5" />
                    <span>{blogGenerationLoading ? 'ブログ記事生成中...' : 'ブログ記事生成'}</span>
                  </button>
                )}
              </div>

              {/* RAG検索結果 */}
              {ragSearchResults.length > 0 && (
                <div className="mt-6 p-4 bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-2 mb-4">
                    <ChartBarIcon className="w-5 h-5 text-green-400" />
                    <h3 className="text-lg font-semibold text-white">
                      RAG検索結果: {ragSearchResults.length}件
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-blue-600/20 p-3 rounded">
                      <div className="text-blue-400 text-sm">Company RAG</div>
                      <div className="text-xl font-bold text-white">
                        {ragSearchResults.filter(r => r.source === 'company').length}件
                      </div>
                    </div>
                    <div className="bg-green-600/20 p-3 rounded">
                      <div className="text-green-400 text-sm">Trend RAG</div>
                      <div className="text-xl font-bold text-white">
                        {ragSearchResults.filter(r => r.source === 'trend').length}件
                      </div>
                    </div>
                    <div className="bg-red-600/20 p-3 rounded">
                      <div className="text-red-400 text-sm">YouTube RAG</div>
                      <div className="text-xl font-bold text-white">
                        {ragSearchResults.filter(r => r.source === 'youtube').length}件
                      </div>
                    </div>
                  </div>
                  
                  <div className="max-h-40 overflow-y-auto space-y-2">
                    {ragSearchResults.slice(0, 5).map((result, index) => (
                      <div key={index} className="p-3 bg-gray-800 rounded text-sm">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className={`px-2 py-1 text-xs rounded ${
                            result.source === 'company' ? 'bg-blue-600' :
                            result.source === 'trend' ? 'bg-green-600' : 'bg-red-600'
                          }`}>
                            {result.source.toUpperCase()}
                          </span>
                          <span className="text-gray-400">
                            スコア: {(result.score || 0).toFixed(3)}
                          </span>
                        </div>
                        <p className="text-gray-300 line-clamp-2">
                          {result.content ? result.content.substring(0, 150) + '...' : 'コンテンツがありません'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* コンテンツ一覧 */}
        <div className="bg-gray-800 rounded-xl border border-gray-700">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-xl font-semibold">生成されたコンテンツ</h2>
          </div>
          
          <div className="divide-y divide-gray-700">
            {loading ? (
              <div className="p-6 text-center text-gray-400">
                読み込み中...
              </div>
            ) : contents.length === 0 ? (
              <div className="p-6 text-center text-gray-400">
                まだコンテンツが生成されていません
              </div>
            ) : (
              contents.map((content) => (
                <div key={content.id} className="p-6 hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full text-white ${getTypeColor(content.type)}`}>
                          {getTypeLabel(content.type)}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(content.created_at).toLocaleString('ja-JP')}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">
                        {content.title}
                      </h3>
                      <p className="text-gray-300 text-sm mb-4">
                        {content.content ? content.content.substring(0, 200) + '...' : 'コンテンツがありません'}
                      </p>
                      
                      {/* メタデータ */}
                      {content.metadata && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {content.metadata.newsCount && (
                            <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                              ニュース: {content.metadata.newsCount}件
                            </span>
                          )}
                          {content.metadata.companyRAGHits && (
                            <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">
                              自社RAG: {content.metadata.companyRAGHits}件
                            </span>
                          )}
                          {content.metadata.keywords && (
                            <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded">
                              キーワード: {content.metadata.keywords.length}個
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => {
                          setSelectedContent(content);
                          setShowPreview(true);
                        }}
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                        title="プレビュー"
                      >
                        <EyeIcon className="w-5 h-5" />
                      </button>
                      
                      {content.type === 'trend-article' && (
                        <>
                          <button
                            onClick={() => convertToArticle(content)}
                            className="p-2 text-blue-400 hover:text-white hover:bg-blue-700 rounded-lg transition-colors"
                            title="記事に変換"
                          >
                            <DocumentTextIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => generateTwitterPost(content)}
                            className="p-2 text-green-400 hover:text-white hover:bg-green-700 rounded-lg transition-colors"
                            title="X投稿生成"
                          >
                            <ChatBubbleLeftEllipsisIcon className="w-5 h-5" />
                          </button>
                        </>
                      )}
                      
                      <button
                        onClick={() => deleteContent(content.id)}
                        className="p-2 text-red-400 hover:text-white hover:bg-red-700 rounded-lg transition-colors"
                        title="削除"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* プレビューモーダル */}
      {showPreview && selectedContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-semibold">コンテンツプレビュー</h2>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-400 hover:text-white"
              >
                <ClockIcon className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <h3 className="text-2xl font-bold mb-4">{selectedContent.title}</h3>
              <div className="prose prose-invert max-w-none">
                <pre className="whitespace-pre-wrap text-gray-300">
                  {selectedContent.content}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 