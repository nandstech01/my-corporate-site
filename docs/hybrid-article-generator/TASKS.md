# 📋 実装タスク一覧

## ⚠️ 重要な設計原則

1. **既存の記事生成機能（/api/generate-rag-blog）に一切影響を与えない**
2. **既存の高度な機能を完全再利用（変更なし）**
3. **生成記事は既存の自社RAG（company_vectors, fragment_vectors）に格納**
4. **新規テーブルはスクレイピング・ディープリサーチデータ専用**
5. **「私は」視点（kenji_harada_architect_knowledge）を必ずハイブリッド検索に含める**

---

## フェーズ 1: MCP環境構築 & DB準備 ✅ 完了

### Task 1.1: Deep Research MCP インストール
- [x] Tavily APIキー取得（https://tavily.com/） ✅
- [x] `mcp.json` に Deep Research 設定追加 ✅
- [x] 動作確認テスト ✅

### Task 1.2: 既存MCP動作確認
- [x] Brave MCP - 動作確認済み ✅
- [x] Puppeteer MCP - H1/H2/H3抽出テスト成功 ✅

### Task 1.3: 新規DBテーブル作成
- [x] `hybrid_scraped_keywords` テーブル作成 ✅ 2025-12-10
- [x] `hybrid_deep_research` テーブル作成 ✅ 2025-12-10
- [x] インデックス作成（ベクトル検索用ivfflat、BM25用GIN） ✅
- [x] ハイブリッド検索用RPC関数作成 ✅

---

## フェーズ 2: スクレイピング機能実装 ✅ 完了

### Task 2.1: スクレイピングAPIルート作成
- [x] `/api/scrape-keywords/route.ts` 作成 ✅
- [x] Brave MCP で上位サイトURL取得 ✅
- [x] 除外フィルター実装（EC、SNS、個人ブログ等） ✅

### Task 2.2: キーワード抽出機能
- [x] Cheerio でHTMLパース ✅
- [x] H1/H2/H3テキスト抽出 ✅
- [x] 本文キーワード頻度分析 ✅

### Task 2.3: キーワード統合・ランキング
- [x] 2回のスクレイピング結果をマージ ✅
- [x] 頻度でランキング ✅
- [x] 重複排除 ✅
- [x] 📝 **改善**: 全キーワードをプロンプトに渡すように修正 ✅ 2025-12-10

---

## フェーズ 3: ディープリサーチ機能実装 ✅ 完了（大幅改善）

### Task 3.1: リサーチプロンプト自動生成
- [x] テーマ別プロンプトテンプレート作成 ✅
- [x] 動的プロンプト生成ロジック ✅

### Task 3.2: Deep Research API 実装
- [x] `/api/deep-research/route.ts` 作成 ✅
- [x] ❌ ~~単純なTavily検索1回呼び出し（偽物）~~ → 削除
- [x] ✅ **本物のディープリサーチ実装** ✅ 2025-12-10
  - [x] 反復的な深掘り（depth × breadth 回）
  - [x] DeepSeekで結果分析・追加クエリ生成
  - [x] 最終レポート生成

### Task 3.3: リサーチ結果処理
- [x] 権威性スコアリング ✅
- [x] 情報源URL抽出 ✅
- [x] エンティティ・キーワード抽出 ✅

---

## フェーズ 4: 記事生成機能実装 ✅ 完了（大幅改善）

### Task 4.1: ハイブリッド記事生成APIルート
- [x] `/api/generate-hybrid-blog/route.ts` 作成 ✅
- [x] リクエストインターフェース定義 ✅

### Task 4.2: ハイブリッドRAG検索統合
- [x] hybrid_scraped_keywords 検索 ✅
- [x] hybrid_deep_research 検索 ✅
- [x] company_vectors 検索（自社一次情報） ✅
- [x] kenji_harada_architect_knowledge 検索（「私は」視点） ✅
- [x] personal_story_rag 検索 ✅

### Task 4.3: 記事本文生成
- [x] システムプロンプト適用 ✅
- [x] GPT-4o-mini 呼び出し ✅
- [x] **改善**: DeepSeek V3.2 対応 ✅ 2025-12-10
- [x] **改善**: Gemini 3 Pro 対応 ✅ 2025-12-10
- [x] **改善**: 30,000文字目標のプロンプト強化 ✅ 2025-12-10
- [x] **改善**: キーワード全網羅指示追加 ✅ 2025-12-10

### Task 4.4: 一時データ管理
- [x] **追加**: スクレイピング/ディープリサーチデータの自動削除機能 ✅ 2025-12-10

---

## フェーズ 5: 後処理機能統合 ✅ 完了

### Task 5.1: Fragment ID 自動付与
- [x] 記事生成時に自動付与 ✅

### Task 5.2: ベクトルリンク化
- [x] `FragmentVectorizer.extractAndVectorizeFromMarkdown()` 呼び出し ✅

### Task 5.3: 構造化データ生成
- [x] `UnifiedStructuredDataSystem` 呼び出し ✅
- [x] `HowToFAQSchemaSystem` 呼び出し ✅
- [x] `AutoTOCSystem` 呼び出し ✅

### Task 5.4: エンティティ関連付け
- [x] `generateBlogFAQEntities()` 呼び出し ✅
- [x] `generateBlogSectionEntities()` 呼び出し ✅

### Task 5.5: AI検索最適化
- [x] `generateCompleteAIEnhancedUnifiedPageData()` 呼び出し ✅

### Task 5.6: H2図解生成（オプション）
- [x] `generateH2DiagramsAuto()` 呼び出し ✅
- [x] **改善**: デフォルトOFF、トグルで切り替え可能に ✅ 2025-12-10

---

## フェーズ 6: 管理画面UI実装 ✅ 完了

### Task 6.1: ハイブリッド記事生成ページ
- [x] `/admin/content-generation/page.tsx` に追加 ✅
- [x] `HybridArticleGenerator` コンポーネント作成 ✅
- [x] キーワード入力フォーム ✅
- [x] 生成オプション設定 ✅

### Task 6.2: 自動入力機能
- [x] メイントピックから関連クエリ自動生成 ✅
- [x] トピック候補ボタン（ジャンル別） ✅
- [x] カテゴリ自動推定 ✅

### Task 6.3: モデル選択機能
- [x] DeepSeek V3.2 / Gemini 3 Pro 切り替え ✅
- [x] リサーチモデル / 生成モデル個別設定 ✅

### Task 6.4: その他UI改善
- [x] サムネイルストック折りたたみ機能 ✅
- [x] 進捗表示・ログ ✅
- [x] エラーハンドリング ✅

---

## フェーズ 7: テスト・最適化 🔄 進行中

### Task 7.1: 統合テスト
- [x] 全フロー通しテスト ✅
- [x] エラーケーステスト ✅
- [ ] **本物のディープリサーチでテスト** ← 次のステップ

### Task 7.2: 品質最適化
- [ ] キーワード網羅率チェッカー
- [ ] 文字数確認（30,000文字目標）
- [ ] SEOスコア確認

---

## 📊 進捗サマリー

| フェーズ | ステータス | 完了率 | 備考 |
|---------|----------|--------|------|
| 1. MCP環境構築 & DB | ✅ 完了 | 100% | 全タスク完了 |
| 2. スクレイピング機能 | ✅ 完了 | 100% | キーワード全網羅に改善 |
| 3. ディープリサーチ機能 | ✅ 完了 | 100% | **本物に書き換え完了** |
| 4. 記事生成機能 | ✅ 完了 | 100% | Gemini 3 Pro対応完了 |
| 5. 後処理機能統合 | ✅ 完了 | 100% | 既存関数100%再利用 |
| 6. 管理画面UI | ✅ 完了 | 100% | 全機能実装完了 |
| 7. テスト・最適化 | 🔄 進行中 | 80% | 本番テスト待ち |

---

## 🔄 2025-12-10 改善履歴

### ディープリサーチの大幅改善
**問題**: 「ディープリサーチ」が単純なTavily検索1回で3-5秒で終わっていた（偽物）

**解決**: 本物のディープリサーチを実装
- 初期検索 → DeepSeek分析 → 追加クエリ生成 → 反復検索 → 最終レポート
- depth × breadth 回の反復処理
- 予想時間: 3-5分

### キーワード網羅性の改善
**問題**: スクレイピングキーワードの一部（85個）しかプロンプトに渡していなかった

**解決**: 全キーワードをプロンプトに含める
- H1/H2/H3キーワード: 全て
- 本文キーワード: 上位100個

### 文字数目標の強化
**問題**: 8,400文字程度しか生成されない（目標30,000文字）

**解決**: 
- Gemini 3 Pro の maxOutputTokens を 32,000 に設定
- プロンプトに「各H2セクション1500文字以上」「FAQ12問以上」を明記
- 「${targetLength}文字以上」を強調

### Gemini 3 Pro 実装
**問題**: UIにGemini選択肢があるが、実際はGPT-4o-miniにフォールバックしていた

**解決**: `gemini-3-pro-preview` モデルを実装
- 64kトークン出力対応（約128,000文字）
- 30,000文字目標に十分対応

---

## 📝 既存関数再利用リスト

以下の既存関数は**変更せず**に呼び出すだけ：

| 関数/クラス | ファイル | 用途 |
|------------|---------|------|
| `FragmentVectorizer` | `lib/vector/fragment-vectorizer.ts` | Fragment IDベクトル化 |
| `HybridSearchSystem` | `lib/vector/hybrid-search.ts` | ハイブリッド検索 |
| `UnifiedStructuredDataSystem` | `lib/structured-data/index.ts` | 構造化データ |
| `HowToFAQSchemaSystem` | `lib/structured-data/howto-faq-schema.ts` | HowTo/FAQ Schema |
| `AutoTOCSystem` | `lib/structured-data/auto-toc-system.ts` | 目次生成 |
| `generateBlogFAQEntities` | `lib/structured-data/entity-relationships.ts` | FAQエンティティ |
| `generateBlogSectionEntities` | `lib/structured-data/entity-relationships.ts` | セクションエンティティ |
| `generateCompleteAIEnhancedUnifiedPageData` | `lib/structured-data/unified-integration-ai-enhanced.ts` | AI検索最適化 |
| `generateH2DiagramsAuto` | `lib/ai-image/h2-diagram-auto-generator.ts` | H2図解生成 |

---

## 🗓️ 最終更新

2025年12月10日

### 更新履歴
- **2025-12-10 (最新)**: 
  - 🔬 **本物のディープリサーチ実装** - 反復的深掘り、DeepSeek分析統合
  - 🤖 **Gemini 3 Pro 実装** - 30,000文字生成対応
  - 📝 **キーワード全網羅** - プロンプト改善
  - 🔄 **一時データ自動削除** - DB容量節約
- **2025-12-09**: 全フェーズ初回実装完了
- **2025-12-10**: フェーズ1 DB作成完了
