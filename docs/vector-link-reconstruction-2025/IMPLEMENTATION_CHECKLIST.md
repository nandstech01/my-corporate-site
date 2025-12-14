# 実装チェックリスト

## 📋 Phase 1: 準備

### ドキュメント作成
- [x] README.md作成
- [x] FRAGMENT_ID_DESIGN.md作成
- [x] IMPLEMENTATION_CHECKLIST.md作成（このファイル）
- [ ] TEST_PLAN.md作成

### 現状確認
- [x] 既存Fragment ID（15個）確認
- [x] 古いFAQ Fragment ID（8個）確認
- [x] 新しいFAQ Fragment ID（21個）確認
- [x] 構造化データシステム確認
- [x] ベクトル化APIロジック確認

## 📋 Phase 2: Fragment ID実装

### 2.1 ProblemSection（4個のFragment ID）

#### コンポーネント修正
- [x] `app/components/portal/ProblemSection.tsx`
  - [x] 個人向けカード1: `id="problem-individual-ai-career"`
  - [x] 個人向けカード2: `id="problem-individual-relevance"`
  - [x] 法人向けカード1: `id="problem-corporate-vector-link"`
  - [x] 法人向けカード2: `id="problem-corporate-ai-architect"`
  - [x] `getFragmentId()`関数の追加
  - [x] `data-fragment-title`属性の追加
  - [x] `data-fragment-description`属性の追加

#### 構造化データ更新
- [x] `app/structured-data.tsx`
  - [x] `newFragmentIds`配列に4個追加
  - [x] 各Fragment IDの`name`, `description`, `url`を定義

#### ページ統合
- [x] `app/page.tsx`
  - [x] Fragment IDアンカーがProblemSection内に存在することを確認

### 2.2 PhilosophySection（1個のFragment ID）

#### コンポーネント修正
- [x] `app/components/portal/PhilosophySection.tsx`
  - [x] `id="philosophy-kenji-harada"`をセクション全体に追加
  - [x] `data-fragment-title="原田賢治のRelevance Engineering哲学"`
  - [x] `data-fragment-description`属性の追加

#### 構造化データ更新
- [x] `app/structured-data.tsx`
  - [x] `newFragmentIds`配列に1個追加

### 2.3 SolutionBentoGrid（4個のFragment ID）

#### コンポーネント修正
- [x] `app/components/portal/SolutionBentoGrid.tsx`
  - [x] 個人向けカード1: `id="solution-individual-step1"`
  - [x] 個人向けカード2: `id="solution-individual-step2"`
  - [x] 法人向けカード1: `id="solution-corporate-layer1"`
  - [x] 法人向けカード2: `id="solution-corporate-layer2"`
  - [x] `getFragmentId()`関数の追加
  - [x] 各カードにdata属性追加

#### 構造化データ更新
- [x] `app/structured-data.tsx`
  - [x] `newFragmentIds`配列に4個追加

### 2.4 PricingSection（4個のFragment ID）

#### コンポーネント修正
- [x] `app/components/portal/PricingSection.tsx`
  - [x] 個人向けカード1: `id="pricing-individual-main"`
  - [x] 個人向けカード2: `id="pricing-individual-bonus"`
  - [x] 法人向けカード1: `id="pricing-corporate-main"`
  - [x] 法人向けカード2: `id="pricing-corporate-support"`
  - [x] `getFragmentId()`関数の追加
  - [x] 各カードにdata属性追加

#### 構造化データ更新
- [x] `app/structured-data.tsx`
  - [x] `newFragmentIds`配列に4個追加

### 2.5 CTASection（4個のFragment ID）

#### コンポーネント修正
- [x] `app/components/portal/CTASection.tsx`
  - [x] 個人向けカード1: `id="cta-individual-line"`
  - [x] 個人向けカード2: `id="cta-individual-consultation"`
  - [x] 法人向けカード1: `id="cta-corporate-technical"`
  - [x] 法人向けカード2: `id="cta-corporate-documents"`
  - [x] `getFragmentId()`関数の追加
  - [x] 各カードにdata属性追加

#### 構造化データ更新
- [x] `app/structured-data.tsx`
  - [x] `newFragmentIds`配列に4個追加

### 2.6 ContactSection（1個のFragment ID）

#### コンポーネント修正
- [x] `app/components/portal/ContactSection.tsx`
  - [x] `id="contact-form"`をフォームセクションに追加
  - [x] `data-fragment-title="お問い合わせフォーム"`
  - [x] `data-fragment-description`属性の追加

#### 構造化データ更新
- [x] `app/structured-data.tsx`
  - [x] `newFragmentIds`配列に1個追加

### 2.7 FAQSection（21個のFragment ID）

#### 確認項目
- [x] `app/components/portal/FAQSection.tsx`
  - [x] `getFragmentId()`が既に実装されていることを確認（`faq-main-${index + 1}`）
  - [x] 21個のFAQ項目が正しく定義されていることを確認
  - [x] 各FAQ項目に`data-fragment-title`が設定されていることを確認

#### 構造化データ確認
- [x] `app/structured-data.tsx`
  - [x] 新しいFAQ（21個）が`newFragmentIds`に含まれていることを確認

## 📋 Phase 3: ベクトル化API更新

### 3.1 API Route修正
- [x] `app/api/vectorize-main-page-fragments/route.ts`を開く
- [x] `MAIN_PAGE_FRAGMENTS`配列を更新
  - [x] 既存15個を維持
  - [x] 新規18個を追加（ProblemSection, PhilosophySection等）
  - [x] 古いFAQ 8個を削除
  - [x] 新しいFAQ 21個を追加
- [x] 合計54個のFragment定義を確認

### 3.2 Fragment定義フォーマット
各Fragment定義に以下を含める：
- [x] `fragment_id`: Fragment ID
- [x] `content_title`: セクションタイトル
- [x] `content`: 詳細なコンテンツ（ベクトル化対象）
- [x] `content_type`: タイプ（problem, philosophy, solution, pricing, cta, contact, faq）
- [x] `category`: カテゴリ（individual, corporate, both, ai-architect, career等）
- [x] `semantic_weight`: セマンティック重み（0.85-0.96）
- [x] `target_queries`: ターゲットクエリ配列
- [x] `related_entities`: 関連エンティティ配列

## 📋 Phase 4: ベクトルDB更新

### 4.1 古いFAQの削除（慎重に実行）

#### 事前確認
- [x] `psql`接続確認
- [x] `SELECT * FROM fragment_vectors WHERE page_path = '/' AND fragment_id LIKE 'faq-main-%';`で対象確認
- [x] 対象が8個であることを確認（21個ではない）

#### 削除実行
```sql
-- ⚠️ 必ず page_path = '/' 条件を含める
DELETE FROM fragment_vectors 
WHERE page_path = '/' 
AND fragment_id IN (
  'faq-main-1', 
  'faq-main-2', 
  'faq-main-3', 
  'faq-main-4', 
  'faq-main-5', 
  'faq-main-6', 
  'faq-main-7', 
  'faq-main-8'
);
```

- [x] 削除実行前に確認
- [x] 削除実行（8件削除完了）
- [x] 削除後、`SELECT COUNT(*) FROM fragment_vectors WHERE page_path = '/';`で件数確認（15件を確認）

### 4.2 ベクトル化実行

#### 事前準備
- [x] サーバー起動確認 (`npm run dev`)
- [x] ベクトル化APIを直接実行（`curl -X POST http://localhost:3007/api/vectorize-main-page-fragments`）

#### ベクトル化実行
- [x] API実行完了
- [x] 成功: 39個の新Fragment追加
- [x] スキップ: 15個の既存Fragment（重複）
- [x] エラー: なし

#### 実行後確認
```sql
-- 全Fragment ID確認（54個になるはず）
SELECT COUNT(*) FROM fragment_vectors WHERE page_path = '/';

-- カテゴリ別確認
SELECT content_type, COUNT(*) 
FROM fragment_vectors 
WHERE page_path = '/' 
GROUP BY content_type;
```

- [x] 件数が54個であることを確認
- [x] 各カテゴリの件数が正しいことを確認

---

## 📋 Phase 5: 検証・テスト

### 5.1 HTML Fragment ID確認
- [x] ProblemSection: `#problem-individual-ai-career`, `#problem-corporate-vector-link` など
- [x] PhilosophySection: `#philosophy-kenji-harada`
- [x] SolutionBentoGrid: `#solution-individual-step1` など
- [x] PricingSection: `#pricing-individual-main` など（1日333円に更新済み）
- [x] CTASection: `#cta-individual-line` など
- [x] ContactSection: `#contact-form`
- [x] FAQSection: `#faq-main-1` ~ `#faq-main-21` (動的生成)
- [x] 各Fragment IDが存在することを確認
  - [x] `id="problem-individual-ai-career"` 等（18個）
  - [x] `id="faq-main-1"` ~ `id="faq-main-21"`（21個）
  - [x] 既存15個も維持されていることを確認

### 5.2 構造化データ確認
- [x] `app/structured-data.tsx`で54個のFragment IDを確認
- [x] `hasPart`配列に54個のFragment IDが含まれていることを確認
- [x] 各Fragment IDの`@id`が`https://nands.tech/#fragment-id`形式であることを確認

### 5.3 ベクトルDB確認
- [x] 新しいFragment IDがDBに存在することを確認（54件）
- [x] `content_title`が正しいことを確認（pricing-individual-mainが「1日333円」に更新）
- [x] `content_type`が適切であることを確認（problem, philosophy, solution, pricing, cta, contact, faq）

### 5.4 SEO構造確認
- [x] GatewayのH1構造が維持されていることを確認（`div`要素のまま）
- [x] メインページのH1が1つだけであることを確認
- [x] VideoObject構造化データが維持されていることを確認
- [x] OGP情報が維持されていることを確認

### 5.5 既存機能確認（重要ファイル100%維持）
- [x] `/lib/structured-data/entity-relationships.ts` - 変更なし
- [x] `/lib/structured-data/haspart-schema-system.ts` - 変更なし
- [x] `/lib/structured-data/howto-faq-schema.ts` - 変更なし
- [x] `/lib/structured-data/index.ts` - 変更なし
- [x] `/lib/structured-data/schema-org-latest.ts` - 変更なし
- [x] `/lib/structured-data/unified-integration.ts` - 変更なし
- [x] 動画埋め込みスニペット - 変更なし
- [x] ブログ機能（posts, categories, businesses テーブル） - 影響なし

### 5.6 最終検証結果

#### ✅ HTML
- 54件のFragment IDアンカーが正しく配置
- 各セクションに`id`と`data-fragment-id`属性

#### ✅ DB
- 54件のfragment_vectorsレコード（page_path='/'）
- 内訳: service(12) + ai-site(3) + problem(4) + philosophy(1) + solution(4) + pricing(4) + cta(4) + contact(1) + faq(21)

#### ✅ 構造化データ
- 54件のFragment IDを`app/structured-data.tsx`で管理
- hasPartスキーマでGoogle/AI検索エンジンに最適化
- エンティティ関係性システム100%維持

#### ✅ SEO最適化
- ゲートウェイのH1/H2構造を維持
- メインページのFragment ID構造を最適化
- Mike King理論準拠を維持

---
- [ ] FAQアコーディオンが正常に動作すること
- [ ] Contact Formが正常に送信できること
- [ ] Light/Dark Modeが正常に切り替わること
- [ ] 個人様/法人様モードが正常に切り替わること

### 5.6 パフォーマンス確認
- [ ] Lighthouse Score確認（Performance, SEO, Accessibility）
- [ ] ページロード時間確認（3秒以内）
- [ ] ISR動作確認（30分後に再生成されるか）

### 5.7 モバイル確認
- [ ] スマホブラウザでの表示確認
- [ ] Gateway画面の動作確認
- [ ] Hero Image Sliderの動作確認
- [ ] 各セクションのSwiper動作確認

## 📋 Phase 6: 本番デプロイ前

### 6.1 コミット前確認
- [ ] `npm run build`が成功すること
- [ ] TypeScript型エラーがないこと（ignoreBuildErrorsは一時的なもの）
- [ ] ESLintエラーがないこと

### 6.2 Git管理
- [ ] `git status`で変更ファイル確認
- [ ] 不要なファイルが含まれていないこと
- [ ] コミットメッセージを明確に記述
  ```
  feat: ベクトルリンク再構築 - 新セクションFragment ID追加
  
  - ProblemSection, PhilosophySection等に18個のFragment ID追加
  - FAQ 21個を新コンテンツでベクトル化
  - 構造化データ（hasPart）を54個のFragmentに拡張
  - SEO構造100%維持
  - 既存機能への影響ゼロ
  ```

### 6.3 デプロイ
- [ ] Vercel/Netlifyへのデプロイ
- [ ] 本番環境でのFragment ID確認
- [ ] 本番環境での構造化データ確認
- [ ] Google Search Consoleでの確認

## 📋 Phase 7: 事後確認

### 7.1 SEOモニタリング
- [ ] Google Search Consoleでのインデックス状況確認（1週間後）
- [ ] Rich Resultsテスト実行
- [ ] Schema Markup Validatorで検証

### 7.2 ドキュメント更新
- [ ] README.mdに完了日時を記録
- [ ] 実装ログを更新
- [ ] 今後のメンテナンス手順を記録

## ⚠️ トラブルシューティング

### 問題: ベクトル化が失敗する
- [ ] OpenAI APIキーが有効か確認
- [ ] `fragment-vectorizer.ts`のエラーログ確認
- [ ] Fragment定義の`content`が空でないか確認

### 問題: 構造化データが表示されない
- [ ] `app/structured-data.tsx`の構文エラー確認
- [ ] JSON-LD形式が正しいか確認
- [ ] ブラウザのDevToolsでConsole Errorを確認

### 問題: Fragment IDがHTMLに表示されない
- [ ] コンポーネントのレンダリング条件を確認
- [ ] `isIndividual`/`isCorporate`モード切替を確認
- [ ] `AnimatePresence`の動作を確認

### 問題: 既存機能が動作しない
- [ ] 即座にロールバック
- [ ] エラーログを確認
- [ ] 影響範囲を特定
- [ ] 修正後、再度テスト

## 📝 実装者メモ

- Fragment ID追加時は必ず`data-fragment-title`と`data-fragment-description`も追加
- モード切替（個人/法人）がある場合、Fragment IDも切り替える
- ベクトル化実行前に必ず古いデータを削除
- SEO構造は**絶対に変更しない**
- 実装完了後、このチェックリストを更新

## 🎯 成功基準

- [ ] 54個のFragment IDが全てHTMLに存在
- [ ] 54個のFragment IDが全てDBに登録
- [ ] 54個のFragment IDが全て構造化データに記述
- [ ] SEO構造100%維持
- [ ] 既存機能100%動作
- [ ] Lighthouse Score: Performance 90+, SEO 100

