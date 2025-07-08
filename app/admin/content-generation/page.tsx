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

// キーワードデータベース（英語・日本語対応）
const keywordDatabase = {
  // 自社サービス関連
  company: {
    'AIエージェント': 'AI Agents',
    'AIエージェント開発': 'AI Agent Development',
    'チャットボット': 'Chatbot',
    'チャットボット開発': 'Chatbot Development',
    'システム開発': 'System Development',
    'Webアプリ開発': 'Web Application Development',
    'DX推進': 'Digital Transformation',
    'AIコンサルティング': 'AI Consulting',
    'MCPサーバー': 'MCP Servers',
    'API統合': 'API Integration',
    'リスキリング': 'Reskilling',
    '人材育成': 'Human Resource Development',
    'スキルアップ': 'Skill Enhancement',
    'キャリア開発': 'Career Development',
    'デジタルスキル': 'Digital Skills',
    'AI教育': 'AI Education',
    'プログラミング研修': 'Programming Training',
    'テクノロジー教育': 'Technology Education',
    'SEO対策': 'SEO Optimization',
    'AIO対策': 'AIO Optimization',
    'コンテンツマーケティング': 'Content Marketing',
    'Web最適化': 'Web Optimization',
    'SNS自動化': 'Social Media Automation',
    'ソーシャルメディア': 'Social Media',
    'マーケティング自動化': 'Marketing Automation',
    'コンテンツ配信': 'Content Distribution',
    '動画生成': 'Video Generation',
    'AI動画': 'AI Video',
    '映像制作': 'Video Production',
    'メディア制作': 'Media Production',
    'ベクトル検索': 'Vector Search',
    'RAG技術': 'RAG Technology',
    '情報検索': 'Information Retrieval',
    'AI検索': 'AI Search',
    'HR Solutions': 'HR Solutions',
    '人事管理': 'Human Resources Management',
    '採用支援': 'Recruitment Support',
    '組織開発': 'Organizational Development'
  },
  // 最新技術・トレンド
  trend: {
    'AI技術': 'AI Technology',
    '人工知能': 'Artificial Intelligence',
    '機械学習': 'Machine Learning',
    'ディープラーニング': 'Deep Learning',
    'LLM': 'Large Language Models',
    'ChatGPT': 'ChatGPT',
    'GPT-4': 'GPT-4',
    'OpenAI': 'OpenAI',
    'Google AI': 'Google AI',
    'Claude': 'Claude AI',
    'Gemini': 'Google Gemini',
    'AI最新動向': 'Latest AI Trends',
    'テクノロジートレンド': 'Technology Trends',
    'イノベーション': 'Innovation',
    'デジタル変革': 'Digital Transformation',
    'AI活用事例': 'AI Use Cases',
    'AI導入': 'AI Implementation',
    'AIソリューション': 'AI Solutions',
    'エンタープライズAI': 'Enterprise AI',
    'AI戦略': 'AI Strategy',
    'データサイエンス': 'Data Science',
    'ビッグデータ': 'Big Data',
    'データ活用': 'Data Utilization',
    'データ分析': 'Data Analytics',
    'ビジネスインテリジェンス': 'Business Intelligence',
    'クラウドコンピューティング': 'Cloud Computing',
    'AWS': 'Amazon Web Services',
    'Azure': 'Microsoft Azure',
    'Google Cloud': 'Google Cloud Platform',
    'API開発': 'API Development',
    'マイクロサービス': 'Microservices',
    'DevOps': 'DevOps',
    'アジャイル開発': 'Agile Development',
    'サイバーセキュリティ': 'Cybersecurity',
    'データプライバシー': 'Data Privacy',
    'GDPR': 'GDPR Compliance',
    'コンプライアンス': 'Compliance',
    'エッジコンピューティング': 'Edge Computing',
    'IoT': 'Internet of Things',
    'ブロックチェーン': 'Blockchain',
    'Web3': 'Web3 Technology',
    'NFT': 'Non-Fungible Tokens',
    'メタバース': 'Metaverse',
    'AR/VR': 'Augmented Reality / Virtual Reality',
    '拡張現実': 'Augmented Reality',
    '仮想現実': 'Virtual Reality',
    'ロボティクス': 'Robotics',
    'オートメーション': 'Automation',
    'RPA': 'Robotic Process Automation',
    'ローコード開発': 'Low-Code Development',
    'ノーコード開発': 'No-Code Development'
  },
  // 教育・学習
  education: {
    'オンライン学習': 'Online Learning',
    'Eラーニング': 'E-Learning',
    'MOOCs': 'Massive Open Online Courses',
    'デジタル教育': 'Digital Education',
    'EdTech': 'Educational Technology',
    'LMS': 'Learning Management System',
    'プログラミング教育': 'Programming Education',
    'STEM教育': 'STEM Education',
    'コーディング': 'Coding',
    'ソフトウェア開発': 'Software Development',
    'Web開発': 'Web Development',
    'モバイルアプリ開発': 'Mobile App Development',
    'データベース': 'Database',
    'SQL': 'Structured Query Language',
    'Python': 'Python Programming',
    'JavaScript': 'JavaScript',
    'TypeScript': 'TypeScript',
    'React': 'React Framework',
    'Next.js': 'Next.js Framework',
    'Node.js': 'Node.js',
    'UI/UX': 'User Interface / User Experience',
    'フロントエンド': 'Frontend Development',
    'バックエンド': 'Backend Development',
    'フルスタック': 'Full Stack Development',
    'プロジェクト管理': 'Project Management',
    'アジャイル': 'Agile Methodology',
    'スクラム': 'Scrum Framework',
    'テスト駆動開発': 'Test-Driven Development',
    'CI/CD': 'Continuous Integration / Continuous Deployment',
    'バージョン管理': 'Version Control',
    'Git': 'Git Version Control',
    'GitHub': 'GitHub Platform',
    'オープンソース': 'Open Source',
    'コミュニティ': 'Community',
    'ハッカソン': 'Hackathon',
    'メンタリング': 'Mentoring',
    'ピアラーニング': 'Peer Learning',
    'スキル認定': 'Skill Certification',
    '資格取得': 'Certification',
    'キャリアパス': 'Career Path',
    '転職支援': 'Career Transition Support',
    'フリーランス': 'Freelancing',
    'リモートワーク': 'Remote Work',
    'ワークライフバランス': 'Work-Life Balance',
    'ダイバーシティ': 'Diversity',
    'インクルージョン': 'Inclusion'
  }
};

// キーワード候補の生成
const generateKeywordSuggestions = (query: string, isEnglish: boolean) => {
  const allKeywords = Object.values(keywordDatabase).flatMap(category => Object.entries(category));
  
  if (isEnglish) {
    return allKeywords
      .filter(([japanese, english]) => 
        english.toLowerCase().includes(query.toLowerCase()) ||
        japanese.includes(query)
      )
      .map(([japanese, english]) => english)
      .slice(0, 10);
  } else {
    return allKeywords
      .filter(([japanese, english]) => 
        japanese.includes(query) ||
        english.toLowerCase().includes(query.toLowerCase())
      )
      .map(([japanese, english]) => japanese)
      .slice(0, 10);
  }
};

// 翻訳機能
const translateKeyword = (keyword: string, toEnglish: boolean) => {
  const allKeywords = Object.values(keywordDatabase).flatMap(category => Object.entries(category));
  
  if (toEnglish) {
    const found = allKeywords.find(([japanese, english]) => japanese === keyword);
    return found ? found[1] : keyword;
  } else {
    const found = allKeywords.find(([japanese, english]) => english === keyword);
    return found ? found[0] : keyword;
  }
};

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
  
  // 🆕 キーワード機能追加
  const [isEnglishMode, setIsEnglishMode] = useState(false);
  const [keywordSuggestions, setKeywordSuggestions] = useState<string[]>([]);
  const [showKeywordSuggestions, setShowKeywordSuggestions] = useState(false);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);

  // キーワード候補の更新
  const updateKeywordSuggestions = (query: string) => {
    if (query.length > 1) {
      const suggestions = generateKeywordSuggestions(query, isEnglishMode);
      setKeywordSuggestions(suggestions);
      setShowKeywordSuggestions(suggestions.length > 0);
    } else {
      setKeywordSuggestions([]);
      setShowKeywordSuggestions(false);
    }
  };

  // 検索クエリの更新
  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setBlogGenerationForm(prev => ({ ...prev, query: newQuery }));
    updateKeywordSuggestions(newQuery);
  };

  // キーワード候補の選択
  const selectKeywordSuggestion = (keyword: string) => {
    setBlogGenerationForm(prev => ({ ...prev, query: keyword }));
    if (!selectedKeywords.includes(keyword)) {
      setSelectedKeywords(prev => [...prev, keyword]);
    }
    setShowKeywordSuggestions(false);
  };

  // 英語・日本語切り替え
  const toggleLanguageMode = () => {
    setIsEnglishMode(prev => {
      const newMode = !prev;
      // 現在の検索クエリを翻訳
      const translatedQuery = translateKeyword(blogGenerationForm.query, newMode);
      setBlogGenerationForm(prevForm => ({ ...prevForm, query: translatedQuery }));
      
      // 選択済みキーワードを翻訳
      const translatedKeywords = selectedKeywords.map(keyword => 
        translateKeyword(keyword, newMode)
      );
      setSelectedKeywords(translatedKeywords);
      
      return newMode;
    });
  };

  // キーワードの削除
  const removeKeyword = (keyword: string) => {
    setSelectedKeywords(prev => prev.filter(k => k !== keyword));
  };

  // 選択済みキーワードから検索クエリを構築
  const buildQueryFromKeywords = () => {
    if (selectedKeywords.length > 0) {
      const query = selectedKeywords.join(' ');
      setBlogGenerationForm(prev => ({ ...prev, query }));
    }
  };

  // 人気キーワードの取得（事前定義）
  const getPopularKeywords = () => {
    if (isEnglishMode) {
      return [
        'AI Technology', 'Machine Learning', 'ChatGPT', 'AI Agents', 'Deep Learning',
        'Digital Transformation', 'Cloud Computing', 'Data Science', 'Reskilling',
        'API Development', 'Chatbot Development', 'SEO Optimization', 'Social Media Automation',
        'Video Generation', 'Vector Search', 'System Development', 'Web Development',
        'AI Education', 'Programming Training', 'Innovation'
      ];
    } else {
      return [
        'AI技術', '機械学習', 'ChatGPT', 'AIエージェント', 'ディープラーニング',
        'デジタル変革', 'クラウドコンピューティング', 'データサイエンス', 'リスキリング',
        'API開発', 'チャットボット開発', 'SEO対策', 'SNS自動化',
        '動画生成', 'ベクトル検索', 'システム開発', 'Web開発',
        'AI教育', 'プログラミング研修', 'イノベーション'
      ];
    }
  };

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
    <div className="text-white">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 rounded-xl mb-6">
        <div className="flex items-center space-x-3 mb-4">
          <SparklesIcon className="w-8 h-8" />
          <h1 className="text-3xl font-bold">コンテンツ生成管理</h1>
        </div>
        <p className="text-purple-100">
          トリプルRAGシステムで生成されたコンテンツを管理し、記事やX投稿に変換できます
        </p>
      </div>

      <div>
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
                <div className="space-y-4">
                <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-300">
                        🔍 検索クエリ
                  </label>
                      
                      {/* 言語切り替えボタン */}
                      <div className="flex items-center space-x-1">
                        <button
                          type="button"
                          onClick={toggleLanguageMode}
                          className={`px-2 py-1 text-xs rounded transition-colors ${
                            !isEnglishMode 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                          }`}
                        >
                          🇯🇵 日本語
                        </button>
                        <button
                          type="button"
                          onClick={toggleLanguageMode}
                          className={`px-2 py-1 text-xs rounded transition-colors ${
                            isEnglishMode 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                          }`}
                        >
                          🇺🇸 English
                        </button>
                      </div>
                    </div>
                    
                    {/* 検索クエリ入力欄 */}
                  <div className="relative">
                    <input
                      type="text"
                      value={blogGenerationForm.query}
                        onChange={handleQueryChange}
                        placeholder={isEnglishMode ? 
                          "e.g., AI Technology Machine Learning Development" : 
                          "例: レリバンスエンジニアリングとSEO最適化"
                        }
                        className="w-full px-4 py-3 pr-10 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        onFocus={() => setShowKeywordSuggestions(keywordSuggestions.length > 0)}
                        onBlur={() => setTimeout(() => setShowKeywordSuggestions(false), 200)}
                    />
                    <MagnifyingGlassIcon className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                      
                      {/* キーワード候補の表示 */}
                      {showKeywordSuggestions && keywordSuggestions.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                          {keywordSuggestions.map((keyword, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => selectKeywordSuggestion(keyword)}
                              className="w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-700 hover:text-white transition-colors text-sm"
                            >
                              {keyword}
                            </button>
                          ))}
                  </div>
                      )}
                </div>
                
                    <p className="text-xs text-gray-400">
                      {isEnglishMode ? 
                        "Enter keywords for global information retrieval" :
                        "海外情報取得のため英語・日本語キーワードを使い分けできます"
                      }
                    </p>
                  </div>
                  
                  {/* 選択済みキーワード */}
                  {selectedKeywords.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                        🏷️ 選択済みキーワード
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {selectedKeywords.map((keyword, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-purple-600 text-white text-xs rounded-full flex items-center space-x-1"
                          >
                            <span>{keyword}</span>
                            <button
                              type="button"
                              onClick={() => removeKeyword(keyword)}
                              className="text-purple-200 hover:text-white ml-1"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={buildQueryFromKeywords}
                        className="mt-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                      >
                        🔄 検索クエリに反映
                      </button>
                    </div>
                  )}
                  
                  {/* 人気キーワード */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      🔥 人気キーワード ({isEnglishMode ? 'English' : '日本語'})
                    </label>
                    <div className="flex flex-wrap gap-1">
                      {getPopularKeywords().slice(0, 8).map((keyword, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => selectKeywordSuggestion(keyword)}
                          className="px-2 py-1 bg-gray-600 hover:bg-gray-500 text-gray-200 text-xs rounded transition-colors"
                        >
                          {keyword}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {isEnglishMode ? "🎯 Target Word Count" : "🎯 目標文字数"}
                  </label>
                  <select
                    value={blogGenerationForm.targetLength}
                    onChange={(e) => setBlogGenerationForm({
                      ...blogGenerationForm,
                      targetLength: parseInt(e.target.value)
                    })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value={5000}>{isEnglishMode ? "5,000 words" : "5,000文字"}</option>
                    <option value={6000}>{isEnglishMode ? "6,000 words" : "6,000文字"}</option>
                    <option value={7000}>{isEnglishMode ? "7,000 words" : "7,000文字"}</option>
                    <option value={8000}>{isEnglishMode ? "8,000 words" : "8,000文字"}</option>
                  </select>
                  <p className="text-xs text-gray-400 mt-1">
                    {isEnglishMode ? 
                      "Article will be generated with approximately this word count" :
                      "実際に指定文字数程度で記事が生成されます"
                    }
                  </p>
                </div>
              </div>

              {/* RAGシステム選択 */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  🎯 使用するRAGシステム
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
                    <div className="flex-1">
                      <div className="font-medium text-white flex items-center space-x-2">
                        <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
                        <span>Company RAG</span>
                      </div>
                      <div className="text-sm text-gray-400">
                        {isEnglishMode ? 
                          "Company services & expertise" : 
                          "自社情報・サービス・専門性"
                        }
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {isEnglishMode ? 
                          "Best for: Corporate solutions, case studies" : 
                          "適用: 企業ソリューション、事例紹介"
                        }
                      </div>
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
                    <div className="flex-1">
                      <div className="font-medium text-white flex items-center space-x-2">
                        <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                        <span>Trend RAG</span>
                      </div>
                      <div className="text-sm text-gray-400">
                        {isEnglishMode ? 
                          "Latest news & global trends (57 items)" : 
                          "最新ニュース・グローバルトレンド（57件）"
                        }
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {isEnglishMode ? 
                          "Best for: Industry analysis, news insights" : 
                          "適用: 業界分析、ニュース解説"
                        }
                      </div>
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
                    <div className="flex-1">
                      <div className="font-medium text-white flex items-center space-x-2">
                        <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                        <span>YouTube RAG</span>
                      </div>
                      <div className="text-sm text-gray-400">
                        {isEnglishMode ? 
                          "Educational video content & tutorials" : 
                          "教育系動画・チュートリアル情報"
                        }
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {isEnglishMode ? 
                          "Best for: How-to guides, tech tutorials" : 
                          "適用: ハウツーガイド、技術解説"
                        }
                      </div>
                    </div>
                  </label>
                </div>
                
                {/* RAGシステムの組み合わせ推奨 */}
                <div className="mt-4 p-3 bg-blue-900/30 border border-blue-700 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-300 mb-2">
                    💡 {isEnglishMode ? "Recommended Combinations" : "推奨組み合わせ"}
                  </h4>
                  <div className="text-xs text-blue-200 space-y-1">
                    <div>• <strong>{isEnglishMode ? "Global Tech Analysis" : "グローバル技術分析"}:</strong> Company + Trend RAG</div>
                    <div>• <strong>{isEnglishMode ? "Comprehensive Guides" : "包括的ガイド"}:</strong> {isEnglishMode ? "All 3 RAG systems" : "全3システム"}</div>
                    <div>• <strong>{isEnglishMode ? "Technical Deep-Dive" : "技術深掘り"}:</strong> Company + YouTube RAG</div>
                  </div>
                </div>
              </div>

              {/* カテゴリ設定 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {isEnglishMode ? "📁 Business Category" : "📁 事業カテゴリ"}
                  </label>
                  <select
                    value={blogGenerationForm.businessCategory}
                    onChange={(e) => setBlogGenerationForm({
                      ...blogGenerationForm,
                      businessCategory: e.target.value
                    })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">{isEnglishMode ? "Please select" : "選択してください"}</option>
                    {businesses.map((business) => (
                      <option key={business.slug} value={business.slug}>
                        {business.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {isEnglishMode ? "🏷️ Article Category" : "🏷️ 記事カテゴリ"}
                  </label>
                  <select
                    value={blogGenerationForm.categorySlug}
                    onChange={(e) => setBlogGenerationForm({
                      ...blogGenerationForm,
                      categorySlug: e.target.value
                    })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">{isEnglishMode ? "Please select" : "選択してください"}</option>
                    {filteredCategories.map((category) => (
                      <option key={category.slug} value={category.slug}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 高度な設定 */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                  <span className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-sm font-bold text-white">⚙️</span>
                  <span>{isEnglishMode ? "Advanced Settings" : "高度な設定"}</span>
                </h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* 日付フィルタ */}
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h4 className="font-medium text-white mb-3 flex items-center space-x-2">
                      <span>📅</span>
                      <span>{isEnglishMode ? "Date Filter" : "日付フィルタ"}</span>
                    </h4>
                    <p className="text-gray-300 text-sm mb-3">
                      {isEnglishMode ? 
                        "Use information from specified time period only" : 
                        "指定期間内の情報のみを使用"
                      }
                    </p>
                    <select
                      value={blogGenerationForm.dateFilter}
                      onChange={(e) => setBlogGenerationForm({
                        ...blogGenerationForm,
                        dateFilter: e.target.value as 'all' | '7days' | '30days' | '90days'
                      })}
                      className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white text-sm focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="all">{isEnglishMode ? "All periods" : "全期間"}</option>
                      <option value="7days">{isEnglishMode ? "Last 7 days" : "直近7日間"}</option>
                      <option value="30days">{isEnglishMode ? "Last 30 days" : "直近30日間"}</option>
                      <option value="90days">{isEnglishMode ? "Last 90 days" : "直近90日間"}</option>
                    </select>
                    <div className="text-xs text-gray-400 mt-2 space-y-1">
                      <div>• <strong>7days:</strong> {isEnglishMode ? "Recent news & trends only" : "最新ニュース・トレンドのみ"}</div>
                      <div>• <strong>30days:</strong> {isEnglishMode ? "Monthly updates & analysis" : "月次アップデート・分析"}</div>
                      <div>• <strong>all:</strong> {isEnglishMode ? "All available information" : "全期間の情報を使用"}</div>
                    </div>
                  </div>
                  
                  {/* 最新ニュースモード */}
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h4 className="font-medium text-white mb-3 flex items-center space-x-2">
                      <span>⚡</span>
                      <span>{isEnglishMode ? "Latest News Mode" : "最新ニュースモード"}</span>
                    </h4>
                    <p className="text-gray-300 text-sm mb-3">
                      {isEnglishMode ? 
                        "Apply freshness weighting to trend information" : 
                        "トレンド情報に新しさによる重み付けを適用"
                      }
                    </p>
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={blogGenerationForm.latestNewsMode}
                        onChange={(e) => setBlogGenerationForm({
                          ...blogGenerationForm,
                          latestNewsMode: e.target.checked
                        })}
                        className="w-4 h-4 text-purple-600 bg-gray-600 border-gray-500 rounded focus:ring-purple-500"
                      />
                      <span className="text-white text-sm">
                        {isEnglishMode ? "Enable Latest News Mode" : "最新ニュースモードを有効化"}
                      </span>
                    </label>
                    <div className="text-xs text-gray-400 mt-3 space-y-1">
                      <div>• <strong>{isEnglishMode ? "24h:" : "24時間以内:"}</strong> +0.3 {isEnglishMode ? "bonus" : "ボーナス"}</div>
                      <div>• <strong>{isEnglishMode ? "7d:" : "7日以内:"}</strong> +0.15 {isEnglishMode ? "bonus" : "ボーナス"}</div>
                      <div>• <strong>{isEnglishMode ? "30d:" : "30日以内:"}</strong> +0.05 {isEnglishMode ? "bonus" : "ボーナス"}</div>
                    </div>
                  </div>
                </div>
                
                {/* 推奨設定パターン */}
                <div className="mt-4 p-4 bg-green-900/30 border border-green-700 rounded-lg">
                  <h4 className="text-sm font-medium text-green-300 mb-3">
                    🎯 {isEnglishMode ? "Recommended Settings for Global Content" : "海外情報取得向け推奨設定"}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-green-200">
                    <div>
                      <strong>{isEnglishMode ? "🌍 Global Tech News:" : "🌍 グローバルテックニュース:"}</strong>
                      <ul className="ml-4 mt-1 space-y-1">
                        <li>• {isEnglishMode ? "Language: English" : "言語: 英語"}</li>
                        <li>• RAG: Trend + Company</li>
                        <li>• {isEnglishMode ? "Date Filter: 7days" : "日付フィルタ: 7days"}</li>
                        <li>• {isEnglishMode ? "Latest News Mode: ON" : "最新ニュースモード: ON"}</li>
                      </ul>
                    </div>
                    <div>
                      <strong>{isEnglishMode ? "🔬 Technical Deep-Dive:" : "🔬 技術深掘り分析:"}</strong>
                      <ul className="ml-4 mt-1 space-y-1">
                        <li>• {isEnglishMode ? "Language: English" : "言語: 英語"}</li>
                        <li>• RAG: All 3 systems</li>
                        <li>• {isEnglishMode ? "Date Filter: 30days" : "日付フィルタ: 30days"}</li>
                        <li>• {isEnglishMode ? "Latest News Mode: OFF" : "最新ニュースモード: OFF"}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* アクションボタン */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={async () => {
                    if (!blogGenerationForm.query.trim()) {
                      alert(isEnglishMode ? 'Please enter a search query' : '検索クエリを入力してください');
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
                          threshold: 0.3,
                          dateFilter: blogGenerationForm.dateFilter,
                          latestNewsMode: blogGenerationForm.latestNewsMode
                        })
                      });
                      
                      if (response.ok) {
                        const data = await response.json();
                        setRagSearchResults(data.results || []);
                      } else {
                        throw new Error(isEnglishMode ? 'RAG search failed' : 'RAG検索に失敗しました');
                      }
                    } catch (error) {
                      console.error('RAG search error:', error);
                      alert(isEnglishMode ? 'An error occurred during RAG search' : 'RAG検索でエラーが発生しました');
                    } finally {
                      setRagSearchLoading(false);
                    }
                  }}
                  disabled={ragSearchLoading || !blogGenerationForm.query.trim() || blogGenerationForm.selectedRAGs.length === 0}
                  className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  <MagnifyingGlassIcon className="w-5 h-5" />
                  <span>{ragSearchLoading ? 
                    (isEnglishMode ? 'Searching RAG...' : 'RAG検索中...') : 
                    (isEnglishMode ? 'Search RAG Data' : 'RAGデータ検索')
                  }</span>
                </button>
                
                {ragSearchResults.length > 0 && (
                  <button
                    onClick={generateRAGBlogArticle}
                    disabled={blogGenerationLoading}
                    className="flex items-center space-x-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
                  >
                    <RocketLaunchIcon className="w-5 h-5" />
                    <span>{blogGenerationLoading ? 
                      (isEnglishMode ? 'Generating Article...' : 'ブログ記事生成中...') : 
                      (isEnglishMode ? 'Generate Blog Article' : 'ブログ記事生成')
                    }</span>
                  </button>
                )}
              </div>

              {/* RAG検索結果 */}
              {ragSearchResults.length > 0 && (
                <div className="mt-6 p-4 bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-2 mb-4">
                    <ChartBarIcon className="w-5 h-5 text-green-400" />
                    <h3 className="text-lg font-semibold text-white">
                      {isEnglishMode ? 
                        `RAG Search Results: ${ragSearchResults.length} items` : 
                        `RAG検索結果: ${ragSearchResults.length}件`
                      }
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-blue-600/20 p-3 rounded">
                      <div className="text-blue-400 text-sm">Company RAG</div>
                      <div className="text-xl font-bold text-white">
                        {ragSearchResults.filter(r => r.source === 'company').length}{isEnglishMode ? ' items' : '件'}
                      </div>
                    </div>
                    <div className="bg-green-600/20 p-3 rounded">
                      <div className="text-green-400 text-sm">Trend RAG</div>
                      <div className="text-xl font-bold text-white">
                        {ragSearchResults.filter(r => r.source === 'trend').length}{isEnglishMode ? ' items' : '件'}
                      </div>
                    </div>
                    <div className="bg-red-600/20 p-3 rounded">
                      <div className="text-red-400 text-sm">YouTube RAG</div>
                      <div className="text-xl font-bold text-white">
                        {ragSearchResults.filter(r => r.source === 'youtube').length}{isEnglishMode ? ' items' : '件'}
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
                            {isEnglishMode ? 'Score:' : 'スコア:'} {(result.score || 0).toFixed(3)}
                          </span>
                        </div>
                        <p className="text-gray-300 line-clamp-2">
                          {result.content ? 
                            result.content.substring(0, 150) + '...' : 
                            (isEnglishMode ? 'No content available' : 'コンテンツがありません')
                          }
                        </p>
                      </div>
                    ))}
                  </div>
                  
                  {/* 推奨アクション */}
                  <div className="mt-4 p-3 bg-purple-900/30 border border-purple-700 rounded-lg">
                    <h4 className="text-sm font-medium text-purple-300 mb-2">
                      💡 {isEnglishMode ? "Next Steps" : "次のステップ"}
                    </h4>
                    <p className="text-xs text-purple-200">
                      {isEnglishMode ? 
                        "Review the search results above and click 'Generate Blog Article' to create a high-quality article using this RAG data." :
                        "上記の検索結果を確認し、「ブログ記事生成」をクリックしてRAGデータを活用した高品質な記事を作成してください。"
                      }
                    </p>
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