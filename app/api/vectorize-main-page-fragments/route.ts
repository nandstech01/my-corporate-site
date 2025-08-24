import { NextResponse } from 'next/server';
import { FragmentVectorizer, FragmentInfo } from '@/lib/vector/fragment-vectorizer';

/**
 * メインページ Fragment ID専用ベクトル化API
 * 23個のFragment ID (12サービス + 8FAQ + 3AIサイト) をfragment_vectorsテーブルにベクトル化
 */

// メインページの23個のFragment ID専用コンテンツ定義
const MAIN_PAGE_FRAGMENTS: FragmentInfo[] = [
  // サービス12項目
  {
    fragment_id: 'service-system-development',
    content_title: 'システム開発サービス',
    content: `システム開発サービス - NANDS

業務効率化とDX推進を実現するシステム開発サービスです。

特徴:
- Web・スマホアプリ開発
- データベース設計・構築
- API開発・連携
- セキュリティ対策
- レガシーシステム移行

AI技術を活用した次世代システム開発により、業務プロセス最適化を実現します。`,
    content_type: 'service',
    category: 'main-page-service',
    semantic_weight: 0.92,
    target_queries: ['システム開発', 'Web開発', 'アプリ開発', 'DX推進'],
    related_entities: ['システム開発', 'DX', 'API', 'データベース']
  },
  {
    fragment_id: 'service-aio-seo',
    content_title: 'AIO SEO対策サービス',
    content: `AIO SEO対策サービス - NANDS

AI検索時代に対応した革新的なSEO戦略サービスです。

特徴:
- Mike King理論完全実装
- レリバンスエンジニアリング
- AI検索最適化（ChatGPT/Claude対応）
- 構造化データ最適化
- Fragment ID実装

従来のSEOを超越し、AIに引用される資産サイトを構築します。`,
    content_type: 'service',
    category: 'main-page-service',
    semantic_weight: 0.95,
    target_queries: ['AIO SEO', 'AI検索最適化', 'Mike King', 'レリバンスエンジニアリング'],
    related_entities: ['AIO SEO', 'Mike King', 'ChatGPT', 'Claude', 'Fragment ID']
  },
  {
    fragment_id: 'service-chatbot-development',
    content_title: 'チャットボット開発サービス',
    content: `チャットボット開発サービス - NANDS

高度な対話AI技術による革新的チャットボット開発サービスです。

特徴:
- GPT-4/Claude統合
- 自然な会話フロー設計
- 多言語対応
- 既存システム連携
- 24時間自動応答

企業の顧客サポートを革新し、業務効率化を実現します。`,
    content_type: 'service',
    category: 'main-page-service',
    semantic_weight: 0.90,
    target_queries: ['チャットボット開発', 'AI対話', '自動応答', 'GPT-4'],
    related_entities: ['チャットボット', 'GPT-4', 'Claude', 'AI対話']
  },
  {
    fragment_id: 'service-vector-rag',
    content_title: 'ベクトルRAGシステム',
    content: `ベクトルRAGシステム - NANDS

企業の知識資産を活用する次世代検索・生成システムです。

特徴:
- ベクトルデータベース構築
- 高精度セマンティック検索
- RAG（検索拡張生成）実装
- 企業データ学習
- リアルタイム更新

社内文書・FAQ・マニュアルを活用したAIアシスタントを構築します。`,
    content_type: 'service',
    category: 'main-page-service',
    semantic_weight: 0.94,
    target_queries: ['ベクトルRAG', 'セマンティック検索', 'RAGシステム', 'ベクトルデータベース'],
    related_entities: ['ベクトルRAG', 'RAG', 'セマンティック検索', 'ベクトルデータベース']
  },
  {
    fragment_id: 'service-ai-side-business',
    content_title: 'AI副業支援サービス',
    content: `AI副業支援サービス - NANDS

AI技術を活用した副業・新規事業立ち上げ支援サービスです。

特徴:
- AI副業戦略コンサルティング
- 自動収益システム構築
- AIツール開発支援
- マーケティング自動化
- 収益最適化

AI時代の新しい働き方と収益創出をサポートします。`,
    content_type: 'service',
    category: 'main-page-service',
    semantic_weight: 0.87,
    target_queries: ['AI副業', '副業支援', 'AI収益', '新規事業'],
    related_entities: ['AI副業', '副業', '収益創出', 'マーケティング自動化']
  },
  {
    fragment_id: 'service-hr-support',
    content_title: 'HR支援ソリューション',
    content: `HR支援ソリューション - NANDS

AI技術による人事・採用業務の革新的支援サービスです。

特徴:
- AI採用マッチング
- 人材評価システム
- 研修プログラム自動化
- 人事データ分析
- 離職予測・防止

人事業務の効率化と人材価値最大化を実現します。`,
    content_type: 'service',
    category: 'main-page-service',
    semantic_weight: 0.89,
    target_queries: ['HR支援', 'AI採用', '人材評価', '人事システム'],
    related_entities: ['HR', '人事', '採用', '人材評価', 'AI採用']
  },
  {
    fragment_id: 'service-ai-agents',
    content_title: 'AIエージェント開発サービス',
    content: `AIエージェント開発サービス - NANDS

自律的に動作するAIエージェントの設計・開発・運用サービスです。

特徴:
- マルチエージェントシステム
- 自律判断・実行機能
- タスク自動化
- 学習・改善機能
- 24時間稼働

複雑な業務プロセスを自動化する次世代AIシステムを構築します。`,
    content_type: 'service',
    category: 'main-page-service',
    semantic_weight: 0.96,
    target_queries: ['AIエージェント', 'マルチエージェント', '自律AI', 'タスク自動化'],
    related_entities: ['AIエージェント', 'マルチエージェント', '自律AI', 'タスク自動化']
  },
  {
    fragment_id: 'service-mcp-servers',
    content_title: 'MCPサーバー開発サービス',
    content: `MCPサーバー開発サービス - NANDS

Model Context Protocol（MCP）サーバーの開発・運用サービスです。

特徴:
- MCP標準準拠実装
- カスタムツール開発
- Claude Desktop統合
- セキュアな接続
- スケーラブル設計

AIアシスタントとシステムの橋渡しとなるMCPサーバーを構築します。`,
    content_type: 'service',
    category: 'main-page-service',
    semantic_weight: 0.91,
    target_queries: ['MCPサーバー', 'Model Context Protocol', 'Claude Desktop', 'MCP開発'],
    related_entities: ['MCP', 'Model Context Protocol', 'Claude Desktop', 'MCPサーバー']
  },
  {
    fragment_id: 'service-sns-automation',
    content_title: 'SNS自動化サービス',
    content: `SNS自動化サービス - NANDS

AI技術によるSNSマーケティング完全自動化サービスです。

特徴:
- コンテンツ自動生成
- 投稿スケジューリング
- エンゲージメント分析
- トレンド追従
- ROI最適化

SNS運用を完全自動化し、マーケティング効果を最大化します。`,
    content_type: 'service',
    category: 'main-page-service',
    semantic_weight: 0.88,
    target_queries: ['SNS自動化', 'SNSマーケティング', 'コンテンツ自動生成', 'エンゲージメント'],
    related_entities: ['SNS自動化', 'SNSマーケティング', 'コンテンツ生成', 'エンゲージメント']
  },
  {
    fragment_id: 'service-video-generation',
    content_title: '動画生成サービス',
    content: `動画生成サービス - NANDS

AI技術による動画コンテンツ自動生成サービスです。

特徴:
- AI動画生成技術
- 自動シナリオ作成
- 音声合成・ナレーション
- 多言語対応
- ブランド統一デザイン

高品質な動画コンテンツを効率的に生成し、マーケティングを強化します。`,
    content_type: 'service',
    category: 'main-page-service',
    semantic_weight: 0.90,
    target_queries: ['AI動画生成', '動画自動作成', '音声合成', 'ビデオマーケティング'],
    related_entities: ['AI動画生成', '動画生成', '音声合成', 'ビデオマーケティング']
  },
  {
    fragment_id: 'service-corporate-reskilling',
    content_title: '企業向けリスキリングサービス',
    content: `企業向けリスキリングサービス - NANDS

AI時代に対応した企業向け人材育成・リスキリングサービスです。

特徴:
- AI技術研修プログラム
- 個別スキル診断
- 実践的プロジェクト学習
- 進捗管理システム
- 成果測定・評価

従業員のAIスキル向上と企業競争力強化を実現します。`,
    content_type: 'service',
    category: 'main-page-service',
    semantic_weight: 0.89,
    target_queries: ['企業リスキリング', 'AI研修', '人材育成', 'スキル向上'],
    related_entities: ['リスキリング', 'AI研修', '人材育成', 'スキル診断']
  },
  {
    fragment_id: 'service-individual-reskilling',
    content_title: '個人向けリスキリングサービス',
    content: `個人向けリスキリングサービス - NANDS

個人のキャリア向上を支援するAI技術習得プログラムです。

特徴:
- パーソナライズ学習
- 実践的カリキュラム
- メンタリング支援
- 転職・独立サポート
- 継続学習システム

AI時代で活躍できる人材への成長をサポートします。`,
    content_type: 'service',
    category: 'main-page-service',
    semantic_weight: 0.87,
    target_queries: ['個人リスキリング', 'AIスキル習得', 'キャリア向上', '転職支援'],
    related_entities: ['個人リスキリング', 'AIスキル', 'キャリア', '転職支援']
  },

  // AIサイト関連Fragment ID（3個）
  {
    fragment_id: 'nands-ai-site',
    content_title: 'NANDSのAIサイト',
    content: `NANDSのAIサイト - AI引用最適化

ChatGPT・Claude・Perplexityが正確に理解し、引用する価値のあるデジタル資産として設計されたWebサイト。

特徴:
- Fragment ID完全実装
- 構造化データ最適化
- Mike King理論準拠
- AI検索エンジン対応
- セマンティック構造

すべてが資産になる、AIに引用されるサイトの実例です。`,
    content_type: 'section',
    category: 'ai-site',
    semantic_weight: 0.94,
    target_queries: ['AIサイト', 'AI引用', 'デジタル資産', 'Mike King'],
    related_entities: ['AIサイト', 'AI引用', 'Fragment ID', 'Mike King', 'ChatGPT', 'Claude']
  },
  {
    fragment_id: 'ai-site-features',
    content_title: 'AIサイトの特徴',
    content: `AIサイトの特徴 - 技術仕様

AI検索エンジンに最適化された技術的特徴：

- Fragment ID システム: 各セクションに一意のID付与
- 構造化データ: Schema.org準拠の詳細メタデータ
- セマンティック最適化: AI理解に特化したコンテンツ構造
- Triple RAG対応: 企業・トレンド・YouTube統合検索
- レスポンシブ設計: 全デバイス対応

技術とユーザビリティの完璧な融合を実現しています。`,
    content_type: 'section',
    category: 'ai-site',
    semantic_weight: 0.92,
    target_queries: ['AIサイト機能', 'Fragment ID', '構造化データ', 'Triple RAG'],
    related_entities: ['Fragment ID', '構造化データ', 'Schema.org', 'Triple RAG']
  },
  {
    fragment_id: 'ai-site-technology',
    content_title: 'AIサイトの技術基盤',
    content: `AIサイトの技術基盤 - 最先端技術スタック

使用技術:
- Frontend: Next.js 14, React, TypeScript
- Backend: Supabase, PostgreSQL, pgvector
- AI: OpenAI GPT-4, Anthropic Claude, Google Gemini
- Vector DB: Supabase Vector, Pinecone
- Deploy: Vercel, Edge Functions

AI時代に最適化された技術選択により、高速で正確なAI検索対応を実現しています。`,
    content_type: 'section',
    category: 'ai-site',
    semantic_weight: 0.90,
    target_queries: ['AIサイト技術', 'Next.js', 'pgvector', 'Supabase'],
    related_entities: ['Next.js', 'Supabase', 'pgvector', 'OpenAI', 'Claude', 'Gemini']
  },

  // メインページFAQ（8個）
  {
    fragment_id: 'faq-main-1',
    content_title: 'NANDSの主要サービスについて',
    content: `Q: NANDSの主要サービスは何ですか？

A: NANDSは AI技術を核とした包括的なデジタルソリューションを提供しています。主要サービスには、AIエージェント開発、ベクトルRAGシステム構築、AIO SEO対策、チャットボット開発、システム開発、HR支援ソリューションなどがあります。特に、AI検索時代に対応したWebサイト構築と、企業の業務プロセス自動化を得意としています。`,
    content_type: 'faq',
    category: 'main-faq',
    semantic_weight: 0.90,
    target_queries: ['NANDSサービス', '主要サービス', 'AI技術', 'デジタルソリューション'],
    related_entities: ['NANDS', 'AIエージェント', 'ベクトルRAG', 'AIO SEO', 'チャットボット']
  },
  {
    fragment_id: 'faq-main-2',
    content_title: 'AI検索最適化について',
    content: `Q: AI検索最適化とは何ですか？

A: AI検索最適化（AIO）は、ChatGPT、Claude、Perplexity等のAI検索エンジンに最適化する新しいSEO手法です。従来の検索エンジン最適化を超越し、AIが理解・引用しやすいコンテンツ構造を構築します。Fragment ID実装、構造化データ最適化、Mike King理論準拠のレリバンスエンジニアリングにより、AIに引用される価値ある資産サイトを実現します。`,
    content_type: 'faq',
    category: 'main-faq',
    semantic_weight: 0.93,
    target_queries: ['AI検索最適化', 'AIO', 'Mike King', 'レリバンスエンジニアリング'],
    related_entities: ['AIO', 'AI検索最適化', 'ChatGPT', 'Claude', 'Perplexity', 'Mike King']
  },
  {
    fragment_id: 'faq-main-3',
    content_title: 'Fragment IDシステムについて',
    content: `Q: Fragment IDシステムとは何ですか？

A: Fragment IDシステムは、Webページの各セクションに一意の識別子（#id）を付与し、AI検索エンジンが正確にコンテンツを参照・引用できるようにする技術です。これにより、AIが回答生成時に具体的なセクションを正確に引用でき、ユーザーは情報源を直接確認できます。Mike King理論の中核技術として、AI時代のWeb構築には必須の仕組みです。`,
    content_type: 'faq',
    category: 'main-faq',
    semantic_weight: 0.91,
    target_queries: ['Fragment ID', 'Fragment IDシステム', 'AI引用', 'セクション識別'],
    related_entities: ['Fragment ID', 'AI引用', 'Mike King', 'セクション識別']
  },
  {
    fragment_id: 'faq-main-4',
    content_title: 'ベクトルRAGシステムについて',
    content: `Q: ベクトルRAGシステムとは何ですか？

A: ベクトルRAG（Retrieval-Augmented Generation）システムは、企業の知識資産をベクトル化してデータベースに格納し、AI検索により関連情報を取得してから回答を生成する技術です。従来のキーワード検索を超越したセマンティック検索により、文脈を理解した高精度な情報検索が可能になります。社内文書、FAQ、マニュアルを活用したAIアシスタント構築の基盤技術です。`,
    content_type: 'faq',
    category: 'main-faq',
    semantic_weight: 0.92,
    target_queries: ['ベクトルRAG', 'RAGシステム', 'セマンティック検索', 'ベクトル化'],
    related_entities: ['ベクトルRAG', 'RAG', 'セマンティック検索', 'ベクトル化', 'AIアシスタント']
  },
  {
    fragment_id: 'faq-main-5',
    content_title: 'AIエージェント開発について',
    content: `Q: AIエージェント開発とは何ですか？

A: AIエージェント開発は、自律的に判断・実行するAIシステムの構築サービスです。単純な質問応答を超越し、複雑なタスクを理解し、適切なツールを選択し、自動実行する高度なAIシステムを開発します。マルチエージェント構成により複数のAIが連携し、24時間365日稼働する業務自動化システムを実現します。次世代の業務プロセス革新技術です。`,
    content_type: 'faq',
    category: 'main-faq',
    semantic_weight: 0.94,
    target_queries: ['AIエージェント', 'マルチエージェント', '自律AI', '業務自動化'],
    related_entities: ['AIエージェント', 'マルチエージェント', '自律AI', '業務自動化', 'タスク自動化']
  },
  {
    fragment_id: 'faq-main-6',
    content_title: '導入期間・費用について',
    content: `Q: サービス導入にはどのくらいの期間と費用がかかりますか？

A: プロジェクトの規模により大きく異なります。簡単なチャットボット導入は1-2週間・50-100万円、中規模のRAGシステム構築は1-3ヶ月・200-500万円、大規模なAIエージェントシステムは3-6ヶ月・500-1000万円が目安です。まずは無料相談で要件をお聞きし、詳細な見積もりをご提案いたします。段階的導入により初期投資を抑えることも可能です。`,
    content_type: 'faq',
    category: 'main-faq',
    semantic_weight: 0.88,
    target_queries: ['導入期間', '費用', '見積もり', 'プロジェクト規模'],
    related_entities: ['導入期間', '費用', '見積もり', 'チャットボット', 'RAGシステム', 'AIエージェント']
  },
  {
    fragment_id: 'faq-main-7',
    content_title: 'サポート体制について',
    content: `Q: 導入後のサポート体制はどうなっていますか？

A: 充実したサポート体制を提供しています。24時間監視システム、月次レポート提出、定期メンテナンス、機能追加・改善、技術サポート、緊急時対応などを含む包括的なサポートパッケージをご用意しています。専任エンジニアによる継続的な最適化により、システムの性能向上と安定稼働を保証します。AI技術の進歩に合わせたアップデートも定期的に実施します。`,
    content_type: 'faq',
    category: 'main-faq',
    semantic_weight: 0.87,
    target_queries: ['サポート体制', '24時間監視', 'メンテナンス', '技術サポート'],
    related_entities: ['サポート体制', '24時間監視', 'メンテナンス', '技術サポート', '専任エンジニア']
  },
  {
    fragment_id: 'faq-main-8',
    content_title: 'セキュリティ対策について',
    content: `Q: セキュリティ対策はどのようになっていますか？

A: 企業レベルの厳格なセキュリティ対策を実装しています。データ暗号化（AES-256）、多要素認証、アクセス制御、定期的なセキュリティ監査、GDPR・個人情報保護法準拠、SOC2準拠のクラウド環境使用などにより、お客様の重要データを完全保護します。また、AI学習データの適切な管理と、機密情報の外部流出防止対策も徹底しています。`,
    content_type: 'faq',
    category: 'main-faq',
    semantic_weight: 0.89,
    target_queries: ['セキュリティ対策', 'データ暗号化', 'GDPR', '個人情報保護'],
    related_entities: ['セキュリティ', 'データ暗号化', 'GDPR', '個人情報保護', 'SOC2']
  }
];

export async function POST() {
  try {
    console.log('🚀 メインページFragment ID専用ベクトル化開始...');
    console.log(`📊 対象Fragment数: ${MAIN_PAGE_FRAGMENTS.length}個`);

    const fragmentVectorizer = new FragmentVectorizer();
    
    // メインページのFragment IDをベクトル化
    const result = await fragmentVectorizer.vectorizeBlogFragments({
      post_id: 0, // メインページは特別なID
      post_title: 'メインページ - NANDS',
      slug: 'main',
      page_path: '/',
      fragments: MAIN_PAGE_FRAGMENTS,
      category: 'main-page',
      seo_keywords: ['NANDS', 'AI技術', 'システム開発', 'AIエージェント', 'ベクトルRAG'],
      rag_sources: ['main-page-content']
    });

    console.log('📊 メインページFragment IDベクトル化完了:');
    console.log(`  - 成功: ${result.vectorizedCount}/${result.totalCount}個`);
    console.log(`  - エラー: ${result.errors.length}個`);

    if (result.errors.length > 0) {
      console.log('❌ エラー詳細:');
      result.errors.forEach(error => console.log(`  - ${error}`));
    }

    return NextResponse.json({
      success: result.success,
      message: `メインページFragment IDベクトル化完了`,
      results: {
        totalFragments: result.totalCount,
        vectorizedCount: result.vectorizedCount,
        successRate: `${Math.round((result.vectorizedCount / result.totalCount) * 100)}%`,
        errors: result.errors
      },
      fragmentDetails: MAIN_PAGE_FRAGMENTS.map(f => ({
        fragment_id: f.fragment_id,
        content_title: f.content_title,
        content_type: f.content_type,
        category: f.category,
        complete_uri: `https://nands.tech/#${f.fragment_id}`
      })),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ メインページFragment IDベクトル化エラー:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'メインページFragment IDベクトル化でエラーが発生しました',
        details: (error as Error).message 
      },
      { status: 500 }
    );
  }
} 