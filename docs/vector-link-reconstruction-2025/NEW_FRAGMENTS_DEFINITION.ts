// 🆕 新しいFragment ID定義 (39個)
// これらをMAIN_PAGE_FRAGMENTS配列に追加する

// ========================================
// ProblemSection (4個)
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
// PhilosophySection (1個)
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
// SolutionBentoGrid (4個)
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
// PricingSection (4個)
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
// CTASection (4個)
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
// ContactSection (1個)
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
// FAQ Section (21個) - 🆕 新しいFAQ
// ========================================
// NOTE: 実際のFAQコンテンツはFAQSection.tsxから取得
// ここではFragment ID定義のみ
// 詳細なQ&Aは別途実装時に追加

