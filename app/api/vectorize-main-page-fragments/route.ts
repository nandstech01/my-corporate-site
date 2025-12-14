import { NextResponse } from 'next/server';
import { FragmentVectorizer, FragmentInfo } from '@/lib/vector/fragment-vectorizer';

/**
 * メインページ Fragment ID専用ベクトル化API
 * 54個のFragment ID (15既存維持 + 18新規セクション + 21FAQ) をfragment_vectorsテーブルにベクトル化
 * 
 * 🆕 2025-12-14更新: 
 * - ProblemSection (4個)
 * - PhilosophySection (1個)
 * - SolutionBentoGrid (4個)
 * - PricingSection (4個)
 * - CTASection (4個)
 * - ContactSection (1個)
 * - 新しいFAQ (21個)
 * 
 * 🗑️ 削除対象: 古いFAQ (8個: faq-main-reskilling ~ faq-main-ai-site-benefits)
 */

// メインページの54個のFragment ID専用コンテンツ定義
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

  // ========================================
  // 🆕 ProblemSection (4個) - 2025-12-14追加
  // ========================================
  {
    fragment_id: 'problem-individual-ai-career',
    content_title: '2026年、そのコードはAIが1秒で書く - AIキャリア戦略',
    content: `Q: AIエンジニアのキャリアは今後どうなりますか？

A: GitHub Copilot、Devin、Claude...「作る」だけのエンジニアの価値は暴落しています。今必要なのは、AIを部下として指揮し、システム全体を俯瞰する「設計力」です。

あなたのライバルは人間ではなく、月額20ドルのAIです。2026年、コードを書くことは価値になりません。AIに何を作らせるかを設計できるAIアーキテクトが求められています。

参考記事: https://nands.tech/posts/ai--949889`,
    content_type: 'problem',
    category: 'individual',
    semantic_weight: 0.95,
    target_queries: ['AIキャリア', 'AIエンジニア', 'キャリア戦略', 'AIアーキテクト'],
    related_entities: ['AIキャリア', 'AIエンジニア', 'Devin', 'GitHub Copilot', 'AIアーキテクト']
  },
  {
    fragment_id: 'problem-individual-relevance',
    content_title: 'AIは質問に答えるのではなく意図に応える - レリバンスエンジニアリング',
    content: `Q: レリバンスエンジニアリングとは何ですか？

A: 検索から対話へ。AIが理解するのは「キーワード」ではなく「Context（文脈）」です。レリバンスエンジニアリングなしに、AIの真価は引き出せません。

AIに「正しく質問する」時代は終わりました。これからは、AIが自律的に意図を理解し、適切な情報を取得し、最適な回答を生成する時代です。そのためには、データの構造化とコンテキストの設計が必須です。

参考記事: https://nands.tech/posts/ai-950781`,
    content_type: 'problem',
    category: 'individual',
    semantic_weight: 0.93,
    target_queries: ['レリバンスエンジニアリング', 'AI対話', 'コンテキスト設計', 'セマンティック検索'],
    related_entities: ['レリバンスエンジニアリング', 'Context', 'セマンティック検索', 'AI対話']
  },
  {
    fragment_id: 'problem-corporate-vector-link',
    content_title: 'RAGを入れたのに、なぜ御社のAIはバカなのか - ベクトルリンク構造化',
    content: `Q: RAGシステムを導入したのに精度が低いのはなぜですか？

A: ChatGPTにPDFを読ませただけのRAGは、ただの「検索窓」です。AIはファイルを読みません。データの「意味（Context）」を読みます。構造なきデータは、AIにとってノイズでしかありません。

必要なのは「ベクトルリンク」による構造化です。エンティティ関係性を明示し、フラグメント構造を設計し、セマンティックな意味を持たせることで、AIは初めて「理解」できるようになります。

参考記事: https://nands.tech/posts/-571903`,
    content_type: 'problem',
    category: 'corporate',
    semantic_weight: 0.96,
    target_queries: ['ベクトルリンク', 'RAG精度向上', 'データ構造化', 'AIシステム設計'],
    related_entities: ['ベクトルリンク', 'RAG', 'データ構造化', 'セマンティック検索', 'エンティティ関係性']
  },
  {
    fragment_id: 'problem-corporate-ai-architect',
    content_title: '社員を雇うのではなくAIを構築する時代 - AIアーキテクト',
    content: `Q: AIアーキテクトとは何ですか？

A: AIアーキテクトは、システム全体を俯瞰し、AIを「部品」として組み込む設計者です。もはやコードは書きません。MCP、RAG、Agentsを統合し、企業OS全体を設計します。

2026年、エンジニアは「作る人」から「設計する人」へ。社員を雇うのではなく、AIを構築する時代が来ています。月額数万円のAIが、年収数百万円の社員の仕事を24時間365日こなします。

参考記事: https://nands.tech/posts/ai-ai20251000-097498`,
    content_type: 'problem',
    category: 'corporate',
    semantic_weight: 0.94,
    target_queries: ['AIアーキテクト', 'AIシステム設計', '企業OS', 'AI駆動開発'],
    related_entities: ['AIアーキテクト', 'MCP', 'RAG', 'Agents', '企業OS']
  },

  // ========================================
  // 🆕 PhilosophySection (1個)
  // ========================================
  {
    fragment_id: 'philosophy-kenji-harada',
    content_title: '原田賢治のRelevance Engineering哲学 - AIアーキテクト',
    content: `私はAIを使わない。AIが私を使う構造を設計する。

世の中の9割は「プロンプト」で解決しようとします。しかし、AIの回答精度を決めるのはプロンプトではなく「データの渡し方（コンテキスト）」です。これができる人間を、私は「AIアーキテクト」と呼びます。

あなたが次に書くコードが、単なる処理ではなく、未来のAIへの「手紙」になることを願っています。

原田賢治 / AI Architect / Founder / NANDS
Relevance Engineering実践者

参考記事: https://nands.tech/posts/ai-950781`,
    content_type: 'philosophy',
    category: 'both',
    semantic_weight: 0.92,
    target_queries: ['原田賢治', 'Relevance Engineering', 'AIアーキテクト', 'コンテキスト設計'],
    related_entities: ['原田賢治', 'Relevance Engineering', 'AIアーキテクト', 'Context', 'NANDS']
  },

  // ========================================
  // 🆕 SolutionBentoGrid (4個)
  // ========================================
  {
    fragment_id: 'solution-individual-step1',
    content_title: 'STEP 1: Cursor 2.0 完全習得 - AIペアプログラミング',
    content: `Cursor 2.0とは？

AIペアプログラミング環境で効率10倍を実現します。

- Claude・GPT-4統合によるコード生成
- Composer機能でプロジェクト全体を操る
- 6ヶ月で実務レベルに到達

もう「書く」時代は終わりました。AIに書かせ、あなたは設計に集中する。それがCursor 2.0のコンセプトです。`,
    content_type: 'solution',
    category: 'individual',
    semantic_weight: 0.90,
    target_queries: ['Cursor 2.0', 'AIペアプログラミング', 'Claude', 'GPT-4', 'Composer'],
    related_entities: ['Cursor', 'AIペアプログラミング', 'Claude', 'GPT-4', 'Composer']
  },
  {
    fragment_id: 'solution-individual-step2',
    content_title: 'STEP 2: AIアーキテクト養成プログラム - Vector Link & Mastra',
    content: `AIアーキテクト養成プログラムとは？

「使う側」から「操る側」へ。システム全体を俯瞰するアーキテクト思考を習得します。

- Vector Link構造化設計
- Mastra Frameworkによるエージェント開発
- MCP統合でツール連携
- システム全体を俯瞰するアーキテクト思考

コードを書くのではなく、AIに何を作らせるかを設計する。それがAIアーキテクトの仕事です。`,
    content_type: 'solution',
    category: 'individual',
    semantic_weight: 0.93,
    target_queries: ['AIアーキテクト養成', 'Vector Link', 'Mastra', 'MCP', 'システム設計'],
    related_entities: ['AIアーキテクト', 'Vector Link', 'Mastra', 'MCP', 'システム設計']
  },
  {
    fragment_id: 'solution-corporate-layer1',
    content_title: 'LAYER 1: Brain 構造化基盤 - Vector Link & RAG',
    content: `企業OS LAYER 1: Brain（構造化基盤）とは？

AIは「ファイル」を読まない。「意味」を読む。

- Vector Linkによるデータ再構築
- RAGの「正しい」使い方を設計
- コンテキストをAIに正確に伝える
- 構造なきデータはノイズでしかない

データを整理するのではなく、データに意味を持たせる。それがVector Linkの本質です。`,
    content_type: 'solution',
    category: 'corporate',
    semantic_weight: 0.95,
    target_queries: ['Vector Link', 'RAG設計', 'データ構造化', '企業OS', 'Brain'],
    related_entities: ['Vector Link', 'RAG', 'データ構造化', '企業OS', 'Brain']
  },
  {
    fragment_id: 'solution-corporate-layer2',
    content_title: 'LAYER 2-3: Agent & Output 業務自動化 - マーケティング自動実行',
    content: `企業OS LAYER 2-3: Agent & Output（業務自動化）とは？

社員を雇うのではなく、AIを構築する時代。

- 問い合わせ対応・調査・要約の自動化
- マーケティング施策の自動実行
- SNS・動画・記事の自動生成
- 人間は「設計」に集中できる

AIに作業させ、人間は戦略に集中する。それが新しい働き方です。`,
    content_type: 'solution',
    category: 'corporate',
    semantic_weight: 0.92,
    target_queries: ['業務自動化', 'AIエージェント', 'マーケティング自動化', 'SNS自動生成'],
    related_entities: ['業務自動化', 'AIエージェント', 'マーケティング自動化', 'Agent', 'Output']
  },

  // ========================================
  // 🆕 PricingSection (4個)
  // ========================================
  {
    fragment_id: 'pricing-individual-main',
    content_title: '個人向けメインプラン - 1日333円で生存戦略',
    content: `個人向けメインプラン：1日333円（生存戦略プラン）

1日333円で、一生食いっぱぐれない「設計力」を。

プラン内容:
- Cursor 2.0 完全習得
- AIアーキテクト養成
- Vector Link構造化設計
- 6ヶ月で実務レベル到達

18ヶ月分割で1日333円（総額180,000円・税込）

コーダーからアーキテクトへ。AIに使われる側から、AIを操る側へ。`,
    content_type: 'pricing',
    category: 'individual',
    semantic_weight: 0.91,
    target_queries: ['個人向けリスキリング', '1日333円', 'AIアーキテクト養成', 'プログラミング学習'],
    related_entities: ['リスキリング', 'AIアーキテクト', 'Cursor', 'プログラミング学習']
  },
  {
    fragment_id: 'pricing-individual-bonus',
    content_title: '個人向け裏カリキュラム - LINE限定特典（無料）',
    content: `個人向け裏カリキュラム：LINE限定特典（無料）

2026年を生き残るための全て。

特典内容:
- 生存戦略ロードマップ
- ブログでは言えない本音
- 最新AI動向アップデート
- 質問し放題サポート

LINE友だち追加で即時配布。ブログでは言えない「リアル」をお届けします。

LINEで受け取る: https://lin.ee/s5dmFuD`,
    content_type: 'pricing',
    category: 'individual',
    semantic_weight: 0.88,
    target_queries: ['LINE特典', '裏カリキュラム', '無料特典', 'AIキャリア'],
    related_entities: ['LINE特典', '裏カリキュラム', '無料', 'キャリア戦略']
  },
  {
    fragment_id: 'pricing-corporate-main',
    content_title: '法人向けメインプラン - 実質1人1日333円（助成金活用）',
    content: `法人向けメインプラン：実質1人1日333円（6ヶ月コース）

1日333円で社員をAIアーキテクトに。

人材開発助成金対象プログラム:
- 正規240,000円 → 国が75%負担
- 実質60,000円/人（税込）
- 国が認めたプログラム

プラン内容:
- 人材開発助成金プログラム
- 助成金申請サポート付き
- 社員のAIリスキリング
- 法人向けカスタマイズ可能

資料請求: https://nands.tech/dm-form`,
    content_type: 'pricing',
    category: 'corporate',
    semantic_weight: 0.94,
    target_queries: ['法人リスキリング', '人材開発助成金', '社員研修', 'AIリスキリング'],
    related_entities: ['人材開発助成金', '法人リスキリング', 'AIリスキリング', '社員研修']
  },
  {
    fragment_id: 'pricing-corporate-support',
    content_title: '法人向けサポート - AIアーキテクト直接対応（無料相談）',
    content: `法人向けサポート：AIアーキテクト直接対応（無料技術相談）

設計から運用まで伴走します。

サポート内容:
- 企業OS設計コンサルティング
- Vector Link導入支援
- RAG・Agent構築サポート
- 継続的な技術顧問

営業マンではなく、技術者が直接対応。御社のAI課題を技術的な本質から議論します。

すぐに無料相談: https://lin.ee/s5dmFuD`,
    content_type: 'pricing',
    category: 'corporate',
    semantic_weight: 0.90,
    target_queries: ['技術相談', 'AIアーキテクト', 'Vector Link導入', '企業OS設計'],
    related_entities: ['技術相談', 'AIアーキテクト', 'Vector Link', '企業OS', 'RAG']
  },

  // ========================================
  // 🆕 CTASection (4個)
  // ========================================
  {
    fragment_id: 'cta-individual-line',
    content_title: '個人向けLINE限定特典 - 裏カリキュラム無料配布',
    content: `個人向けLINE限定特典：裏カリキュラム（無料配布中）

ブログでは言えない「生存戦略ロードマップ」をLINE限定で配布。

特典内容:
- 生存戦略ロードマップ
- 最新AI動向アップデート
- 質問し放題サポート

AIアーキテクトへの最短ルートを公開します。LINE友だち追加で即時受け取り。

LINEで受け取る: https://lin.ee/s5dmFuD`,
    content_type: 'cta',
    category: 'individual',
    semantic_weight: 0.87,
    target_queries: ['LINE特典', '無料配布', '生存戦略', 'AIキャリア'],
    related_entities: ['LINE', '無料特典', '生存戦略', 'AIアーキテクト']
  },
  {
    fragment_id: 'cta-individual-consultation',
    content_title: '個人向けキャリア相談 - AIアーキテクト直接アドバイス（無料）',
    content: `個人向けキャリア相談：AIアーキテクト直接アドバイス（無料）

2026年を生き残るためのキャリア戦略を、AIアーキテクトが直接アドバイス。

相談内容:
- 現状スキルの棚卸し
- 最適な学習プラン提案
- AI時代のキャリア設計

あなたに合った学習ロードマップを作成します。

無料で相談する: https://lin.ee/s5dmFuD`,
    content_type: 'cta',
    category: 'individual',
    semantic_weight: 0.89,
    target_queries: ['キャリア相談', 'AIキャリア', '学習プラン', 'AIアーキテクト'],
    related_entities: ['キャリア相談', 'AIキャリア', '学習プラン', 'AIアーキテクト']
  },
  {
    fragment_id: 'cta-corporate-technical',
    content_title: '法人向け技術相談 - AIアーキテクト直接対応（無料）',
    content: `法人向け技術相談：AIアーキテクト直接対応（無料）

御社のAI課題を、営業マンではなく技術者が直接ヒアリング。

相談内容:
- 現状課題のヒアリング
- 技術的な解決策の提案
- 概算見積もりの作成

技術的な本質を議論し、最適なソリューションを提案します。

すぐに無料相談: https://lin.ee/s5dmFuD`,
    content_type: 'cta',
    category: 'corporate',
    semantic_weight: 0.91,
    target_queries: ['技術相談', 'AI導入', '無料相談', 'AIシステム設計'],
    related_entities: ['技術相談', 'AI導入', 'AIアーキテクト', 'システム設計']
  },
  {
    fragment_id: 'cta-corporate-documents',
    content_title: '法人向け資料請求 - サービス資料無料配布',
    content: `法人向け資料請求：サービス資料（無料）

AI導入事例、料金プラン、助成金活用方法などをまとめた資料を無料配布。

資料内容:
- AI導入事例集
- 料金プラン詳細
- 助成金活用ガイド

社内検討にお役立てください。

無料で資料請求: https://nands.tech/dm-form`,
    content_type: 'cta',
    category: 'corporate',
    semantic_weight: 0.88,
    target_queries: ['資料請求', 'AI導入事例', '料金プラン', '助成金'],
    related_entities: ['資料請求', 'AI導入事例', '料金プラン', '助成金']
  },

  // ========================================
  // 🆕 ContactSection (1個)
  // ========================================
  {
    fragment_id: 'contact-form',
    content_title: 'お問い合わせフォーム - AIアーキテクト直接対応',
    content: `お問い合わせフォーム

AIに関するご相談、サービスのお問い合わせはこちらから。

営業マンではなく、技術者が直接対応します。

フォーム項目:
- お名前
- メールアドレス
- お問い合わせ内容

御社のAI課題を技術的な本質から議論します。まずはお気軽にご相談ください。`,
    content_type: 'contact',
    category: 'both',
    semantic_weight: 0.85,
    target_queries: ['お問い合わせ', '問い合わせフォーム', 'AI相談', 'サービス相談'],
    related_entities: ['お問い合わせ', '問い合わせフォーム', 'AI相談', 'サービス相談']
  },

  // ========================================
  // 🆕 FAQSection (21個) - 新しいFAQ
  // ========================================
  {
    fragment_id: 'faq-main-1',
    content_title: 'AIアーキテクトとは何ですか？',
    content: `Q: AIアーキテクトとは何ですか？

A: AIアーキテクトは、システム全体を俯瞰し、AIを「部品」として組み込む設計者です。もはやコードは書きません。MCP、RAG、Agentsを統合し、企業OS全体を設計します。2026年、エンジニアは「作る人」から「設計する人」へ進化します。`,
    content_type: 'faq',
    category: 'ai-architect',
    semantic_weight: 0.94,
    target_queries: ['AIアーキテクト', 'システム設計', '企業OS', 'MCP', 'RAG'],
    related_entities: ['AIアーキテクト', 'MCP', 'RAG', 'Agents', '企業OS']
  },
  {
    fragment_id: 'faq-main-2',
    content_title: 'Cursor 2.0とは何ですか？なぜ重要なのですか？',
    content: `Q: Cursor 2.0とは何ですか？なぜ重要なのですか？

A: Cursor 2.0は、AIペアプログラミング環境で効率を10倍にするツールです。Claude・GPT-4統合によるコード生成、Composer機能でプロジェクト全体を操ります。もう「書く」時代は終わりました。6ヶ月で実務レベルに到達可能です。`,
    content_type: 'faq',
    category: 'ai-architect',
    semantic_weight: 0.92,
    target_queries: ['Cursor 2.0', 'AIペアプログラミング', 'Claude', 'GPT-4'],
    related_entities: ['Cursor', 'AIペアプログラミング', 'Claude', 'GPT-4', 'Composer']
  },
  {
    fragment_id: 'faq-main-3',
    content_title: 'MCP、Mastra Frameworkとは何ですか？',
    content: `Q: MCP、Mastra Frameworkとは何ですか？

A: MCPはModel Context Protocolの略で、AIツール連携の標準規格です。Mastra Frameworkはエージェント開発フレームワークで、これらを統合することでシステム全体を俯瞰するアーキテクト思考を習得できます。`,
    content_type: 'faq',
    category: 'ai-architect',
    semantic_weight: 0.90,
    target_queries: ['MCP', 'Mastra Framework', 'AIツール連携', 'エージェント開発'],
    related_entities: ['MCP', 'Mastra', 'Model Context Protocol', 'エージェント開発']
  },
  {
    fragment_id: 'faq-main-4',
    content_title: 'Vector Link構造化設計とは何ですか？',
    content: `Q: Vector Link構造化設計とは何ですか？

A: Vector Linkは、データの「意味（Context）」を構造化し、AIがデータを正確に理解できる仕組みです。構造なきデータは、AIにとってノイズでしかありません。ベクトルリンクによる構造化が、RAGの精度を決定づけます。`,
    content_type: 'faq',
    category: 'ai-architect',
    semantic_weight: 0.93,
    target_queries: ['Vector Link', 'データ構造化', 'RAG精度', 'コンテキスト'],
    related_entities: ['Vector Link', 'データ構造化', 'RAG', 'Context', 'セマンティック検索']
  },
  {
    fragment_id: 'faq-main-5',
    content_title: '2026年、エンジニアのキャリアはどう変わりますか？',
    content: `Q: 2026年、エンジニアのキャリアはどう変わりますか？

A: 2026年、生き残るのは「書く人」ではなく「設計する人」です。AIを『使う側』から『操る人』へ。コードを書く時代は終わり、AIが1秒で書きます。あなたはシステムを設計する側に回る必要があります。`,
    content_type: 'faq',
    category: 'career',
    semantic_weight: 0.91,
    target_queries: ['AIキャリア', 'エンジニアキャリア', '2026年', 'キャリア戦略'],
    related_entities: ['AIキャリア', 'エンジニアキャリア', 'キャリア戦略', 'AIアーキテクト']
  },
  {
    fragment_id: 'faq-main-6',
    content_title: 'プログラミング未経験でもAIアーキテクトになれますか？',
    content: `Q: プログラミング未経験でもAIアーキテクトになれますか？

A: はい、可能です。従来のプログラミングスキルよりも、システム全体を俯瞰する設計思考が重要です。Cursor 2.0を使えば、AIがコードを書いてくれるため、あなたは「何を作るか」に集中できます。6ヶ月の実践カリキュラムで実務レベルに到達します。`,
    content_type: 'faq',
    category: 'career',
    semantic_weight: 0.89,
    target_queries: ['プログラミング未経験', 'AIアーキテクト', '初心者', 'リスキリング'],
    related_entities: ['プログラミング未経験', 'AIアーキテクト', 'Cursor', 'リスキリング']
  },
  {
    fragment_id: 'faq-main-7',
    content_title: '個人向けリスキリングの料金はいくらですか？',
    content: `Q: 個人向けリスキリングの料金はいくらですか？

A: 1日333円の「生存戦略プラン」を提供しています（18ヶ月分割で総額180,000円）。6ヶ月コースで、Cursor 2.0完全習得からAIアーキテクト養成プログラムまで、実践的なカリキュラムを受講できます。さらにLINE限定の裏カリキュラムも無料配布中です。`,
    content_type: 'faq',
    category: 'career',
    semantic_weight: 0.90,
    target_queries: ['個人向けリスキリング', '料金', '1日333円', '生存戦略プラン'],
    related_entities: ['リスキリング', '料金', '生存戦略プラン', 'Cursor', 'AIアーキテクト']
  },
  {
    fragment_id: 'faq-main-8',
    content_title: '法人向けリスキリングの料金はいくらですか？',
    content: `Q: 法人向けリスキリングの料金はいくらですか？

A: 正規240,000円のところ、人材開発助成金を活用すると国が75%負担するため、実質60,000円/人（6ヶ月）となります。1日あたり333円で社員をAIアーキテクトに育成できます。助成金申請サポートも付いています。`,
    content_type: 'faq',
    category: 'corporate-reskilling',
    semantic_weight: 0.93,
    target_queries: ['法人リスキリング', '料金', '人材開発助成金', '1日333円'],
    related_entities: ['法人リスキリング', '人材開発助成金', '助成金', 'AIリスキリング']
  },
  {
    fragment_id: 'faq-main-9',
    content_title: '人材開発助成金とは何ですか？どのように活用できますか？',
    content: `Q: 人材開発助成金とは何ですか？どのように活用できますか？

A: 厚生労働省が認定する「人材開発助成金プログラム」により、研修費用の75%を国が負担します。当社は助成金申請サポートも提供しているため、申請手続きもスムーズに進められます。国が認めたプログラムで安心して社員のAIリスキリングを進められます。`,
    content_type: 'faq',
    category: 'corporate-reskilling',
    semantic_weight: 0.92,
    target_queries: ['人材開発助成金', '助成金', '厚生労働省', '申請サポート'],
    related_entities: ['人材開発助成金', '助成金', '厚生労働省', '申請サポート']
  },
  {
    fragment_id: 'faq-main-10',
    content_title: '社員のAIリスキリングで何を学べますか？',
    content: `Q: 社員のAIリスキリングで何を学べますか？

A: ChatGPT、Gemini、Claude、Genspark、ManusなどのLLMの基礎から学習できます。月1万円から受講可能で、AIを基礎から学習し、実務で活用できるレベルまで育成します。カスタマイズ研修も可能です。`,
    content_type: 'faq',
    category: 'corporate-reskilling',
    semantic_weight: 0.90,
    target_queries: ['AIリスキリング', 'LLM', 'ChatGPT', 'Claude', '社員研修'],
    related_entities: ['AIリスキリング', 'LLM', 'ChatGPT', 'Claude', 'Gemini', 'Genspark', 'Manus']
  },
  {
    fragment_id: 'faq-main-11',
    content_title: '研修期間はどのくらいですか？オンラインでも受講できますか？',
    content: `Q: 研修期間はどのくらいですか？オンラインでも受講できますか？

A: 6ヶ月の実践カリキュラムです。完全オンライン対応のため、全国どこからでも受講可能です。社員の業務と並行して学習でき、実務に即したスキルを習得できます。`,
    content_type: 'faq',
    category: 'corporate-reskilling',
    semantic_weight: 0.88,
    target_queries: ['研修期間', 'オンライン', '6ヶ月', '全国対応'],
    related_entities: ['研修期間', 'オンライン', '全国対応', 'リスキリング']
  },
  {
    fragment_id: 'faq-main-12',
    content_title: 'AI駆動開発とは何ですか？',
    content: `Q: AI駆動開発とは何ですか？

A: 全自動化を目指すための開発手法です。Cursor、Mastra、MCP、Akoolなどのツールを統合し、AIエージェントによる自動化システムを構築します。カスタマイズ研修も可能で、全自動化AIアーキテクトを養成します。`,
    content_type: 'faq',
    category: 'ai-driven-dev',
    semantic_weight: 0.91,
    target_queries: ['AI駆動開発', '全自動化', 'AIエージェント', 'Mastra', 'MCP'],
    related_entities: ['AI駆動開発', '全自動化', 'AIエージェント', 'Cursor', 'Mastra', 'MCP', 'Akool']
  },
  {
    fragment_id: 'faq-main-13',
    content_title: 'チャットボット開発とベクトルRAG検索の違いは何ですか？',
    content: `Q: チャットボット開発とベクトルRAG検索の違いは何ですか？

A: チャットボットは「質問に答える」ツールです。しかし、ベクトルRAG検索は「意図に応える」システムです。AIはファイルを読みません。データの「意味（Context）」を読みます。ベクトルリンクによる構造化が、RAGの精度を決定づけます。`,
    content_type: 'faq',
    category: 'ai-driven-dev',
    semantic_weight: 0.93,
    target_queries: ['チャットボット', 'ベクトルRAG', 'RAG検索', '違い'],
    related_entities: ['チャットボット', 'ベクトルRAG', 'RAG', 'Vector Link', 'Context']
  },
  {
    fragment_id: 'faq-main-14',
    content_title: 'RAGを導入したのに精度が悪いのはなぜですか？',
    content: `Q: RAGを導入したのに精度が悪いのはなぜですか？

A: ChatGPTにPDFを読ませただけのRAGは、ただの「検索窓」です。構造なきデータは、AIにとってノイズでしかありません。必要なのは「ベクトルリンク」による構造化です。データの渡し方（コンテキスト）が、AIの回答精度を決めます。`,
    content_type: 'faq',
    category: 'ai-driven-dev',
    semantic_weight: 0.95,
    target_queries: ['RAG精度', 'RAG問題', 'ベクトルリンク', 'データ構造化'],
    related_entities: ['RAG精度', 'ベクトルリンク', 'データ構造化', 'Context', 'ChatGPT']
  },
  {
    fragment_id: 'faq-main-15',
    content_title: 'システム開発の期間と料金はどのくらいですか？',
    content: `Q: システム開発の期間と料金はどのくらいですか？

A: プロジェクトの規模により異なりますが、チャットボット開発は2-4週間、ベクトルRAG検索システムは4-8週間、フルスタックシステム開発は2-6ヶ月が目安です。まずは無料相談でご要望をお聞かせください。IT補助金の活用も可能です。`,
    content_type: 'faq',
    category: 'ai-driven-dev',
    semantic_weight: 0.89,
    target_queries: ['システム開発', '期間', '料金', '見積もり'],
    related_entities: ['システム開発', '開発期間', '料金', 'IT補助金']
  },
  {
    fragment_id: 'faq-main-16',
    content_title: '無料相談はどのように申し込めますか？',
    content: `Q: 無料相談はどのように申し込めますか？

A: LINEまたはお問い合わせフォームから無料相談を申し込めます。AIアーキテクトが直接対応し、あなたのキャリアや企業の課題に合わせた最適なプランをご提案します。`,
    content_type: 'faq',
    category: 'support',
    semantic_weight: 0.87,
    target_queries: ['無料相談', '申し込み', 'LINE', 'お問い合わせ'],
    related_entities: ['無料相談', 'LINE', 'お問い合わせ', 'AIアーキテクト']
  },
  {
    fragment_id: 'faq-main-17',
    content_title: '地方在住でもサービスを利用できますか？',
    content: `Q: 地方在住でもサービスを利用できますか？

A: はい、完全オンライン対応のため、全国どこからでもご利用いただけます。滋賀県・関西地方での実績も豊富にあります。対面でのサービスをご希望の場合も、状況に応じて対応いたしますのでご相談ください。`,
    content_type: 'faq',
    category: 'support',
    semantic_weight: 0.86,
    target_queries: ['地方', 'オンライン', '全国対応', '滋賀県'],
    related_entities: ['地方', 'オンライン', '全国対応', '滋賀県', '関西']
  },
  {
    fragment_id: 'faq-main-18',
    content_title: '資料請求はできますか？',
    content: `Q: 資料請求はできますか？

A: はい、無料で資料請求が可能です。サービス資料をPDFでお送りしますので、お問い合わせフォームからご請求ください。法人向けには助成金活用ガイドも同梱しています。

資料請求フォーム: https://nands.tech/dm-form`,
    content_type: 'faq',
    category: 'support',
    semantic_weight: 0.88,
    target_queries: ['資料請求', 'サービス資料', 'PDF', '助成金ガイド'],
    related_entities: ['資料請求', 'サービス資料', '助成金ガイド']
  },
  {
    fragment_id: 'faq-main-19',
    content_title: 'SNS自動化とは何ですか？',
    content: `Q: SNS自動化とは何ですか？

A: SNSも自動化で成果が出せます。YouTube Shorts、Instagram、X（Twitter）などのコンテンツを自動生成・投稿するシステムを構築します。AIエージェントが24時間365日稼働し、マーケティング施策を自動実行します。`,
    content_type: 'faq',
    category: 'automation',
    semantic_weight: 0.90,
    target_queries: ['SNS自動化', 'YouTube Shorts', 'マーケティング自動化', 'コンテンツ自動生成'],
    related_entities: ['SNS自動化', 'YouTube Shorts', 'Instagram', 'X', 'Twitter', 'マーケティング自動化']
  },
  {
    fragment_id: 'faq-main-20',
    content_title: '動画自動生成サービスとは何ですか？',
    content: `Q: 動画自動生成サービスとは何ですか？

A: AIによる動画自動生成サービスです。YouTube、TikTok、Instagram Reels向けの動画を自動生成します。スクリプト作成から編集、投稿まで完全自動化。人間は戦略に集中し、AIが実行します。`,
    content_type: 'faq',
    category: 'automation',
    semantic_weight: 0.89,
    target_queries: ['動画自動生成', 'YouTube', 'TikTok', 'Instagram Reels'],
    related_entities: ['動画自動生成', 'YouTube', 'TikTok', 'Instagram Reels', 'AI動画']
  },
  {
    fragment_id: 'faq-main-21',
    content_title: '実績・導入事例はありますか？',
    content: `Q: 実績・導入事例はありますか？

A: はい、個人向けリスキリング、法人向けAIリスキリング、AIシステム開発など、多数の実績があります。滋賀県・関西地方を中心に全国の企業様にサービスを提供しています。具体的な導入事例は資料請求またはお問い合わせでご確認いただけます。`,
    content_type: 'faq',
    category: 'support',
    semantic_weight: 0.87,
    target_queries: ['実績', '導入事例', '事例', '成功事例'],
    related_entities: ['実績', '導入事例', '成功事例', '滋賀県', '関西']
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