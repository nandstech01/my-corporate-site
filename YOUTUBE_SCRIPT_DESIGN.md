# YouTubeショート台本自動生成システム設計

## 🎯 目標

ブログ記事生成時に、同時にYouTubeショート動画の台本を自動生成し、ベクトル化する。

---

## 📊 実装が必要な機能

### 1. ブログ記事 → 台本生成API

**エンドポイント:** `/api/admin/generate-youtube-script`

**入力:**
```typescript
{
  blogPostId: number,          // 既存のブログ記事ID
  blogSlug: string,            // ブログslug
  blogContent: string,         // 記事の全文
  blogTitle: string,           // 記事タイトル
  targetDuration: number,      // 目標秒数（デフォルト: 30秒）
}
```

**処理フロー:**
```
1. ブログ記事の要約生成
   ├─ OpenAI GPT-4でブログ内容を30秒のショート動画用に圧縮
   └─ 4フェーズ構造に分解

2. 4フェーズ台本生成
   ├─ フック（0-2秒）: 視聴者の注目を一瞬で獲得
   ├─ 共感（3-5秒）: 「自分のことだ」と感じさせる
   ├─ 本題（5-20秒）: 核となる情報を1-3ポイントで提供
   └─ CTA（ラスト5秒）: 行動導線（ブログ記事へ誘導）

3. バイラル要素の追加
   ├─ viral_elements: トレンド要素抽出
   ├─ virality_score: バイラル性スコア計算
   ├─ target_emotion: ターゲット感情設定
   └─ hook_type: フックタイプ分類

4. Fragment ID生成
   ├─ youtube-script-{id}
   └─ Complete URI: https://nands.tech/shorts#youtube-script-{id}

5. ベクトル埋め込み生成
   ├─ OpenAI text-embedding-3-large
   └─ 1536次元ベクトル

6. company_youtube_shorts テーブルに保存
   ├─ related_blog_post_id: ブログ記事と連携
   ├─ blog_slug: ブログslug
   ├─ status: 'draft'（未投稿）
   └─ source_system: 'auto-generated'

7. fragment_vectors テーブルにも同期
   └─ 統合管理用
```

**出力:**
```typescript
{
  success: boolean,
  scriptId: number,
  fragmentId: string,
  script: {
    title: string,
    hook: string,
    empathy: string,
    body: string,
    cta: string,
    duration: number
  },
  viralityScore: number,
  vectorized: boolean
}
```

---

## 🤖 システムプロンプト設計

### 台本生成用プロンプト

```markdown
あなたはYouTubeショート動画の台本作成のプロフェッショナルです。
与えられたブログ記事を元に、30秒のYouTubeショート動画用の台本を作成してください。

### 【超重要】4フェーズ構造

#### Phase 1: フック・引き付け（0-2秒）
- 視聴者の注目を一瞬で獲得
- インパクトのある一言で始める
- 例:
  - 「実はこれ知らないと損します」
  - 「3秒で人生変わる話します」
  - 「これが9割の人が間違える理由」

#### Phase 2: 問題提起・共感ゾーン（3-5秒）
- 視聴者を「自分ごと化」させる
- 「自分のことだ」と感じさせる言葉選び
- 例:
  - 「毎日投稿してるのに全然伸びない人へ」
  - 「いつも三日坊主で終わる人必見」
  - 「ダイエット続かないのって普通です」

#### Phase 3: 本題・解決策（5-20秒）
- 核となる情報を1-3ポイントで提供
- シンプル&リズミカルに
- 具体的な数字や実例を入れる
- 例:
  - 「たった3つのコツで撮影が変わる」
  - 「1日5分でできる習慣」
  - 「70%削減に成功した方法」

#### Phase 4: まとめ・行動導線（ラスト5秒）
- 内容を簡潔にまとめる
- 次のアクションを明確に示す
- ブログ記事への誘導
- 例:
  - 「詳しくはプロフィールのリンクから」
  - 「もっと知りたい方はブログで全公開」
  - 「保存して今日から試してみて」

### バイラル要素
- viral_elements: トレンドキーワード、話題の要素
- target_emotion: ターゲット感情（驚き、共感、興味、好奇心）
- hook_type: フックタイプ（問題提起型、驚き型、損失回避型）

### 制約条件
- 総文字数: 150-200文字（30秒で話せる量）
- 中学生レベルの日本語
- 専門用語は使わない
- 絵文字は使わない（音声で読み上げるため）
- 口語体で自然な話し言葉

### CTA（Call To Action）
- 必ずブログ記事への誘導を含める
- 例:
  - 「詳しい手順はプロフィールのブログで」
  - 「完全版はリンクから」
  - 「もっと知りたい人はブログへ」

### 出力形式（JSON）
```json
{
  "title": "フック重視の20文字以内タイトル",
  "hook": "0-2秒のフック文",
  "empathy": "3-5秒の共感文",
  "body": "5-20秒の本題・解決策",
  "cta": "ラスト5秒のCTA",
  "viral_elements": ["要素1", "要素2", "要素3"],
  "virality_score": 75,
  "target_emotion": "驚き",
  "hook_type": "損失回避型",
  "duration_seconds": 30
}
```
```

---

## 🔄 2. ブログ記事生成APIへの統合

### `/api/generate-rag-blog` の拡張

**現在:**
```typescript
POST /api/generate-rag-blog
{
  query, ragData, targetLength, 
  businessCategory, categorySlug, includeImages
}
→ ブログ記事のみ生成
```

**拡張後:**
```typescript
POST /api/generate-rag-blog
{
  query, ragData, targetLength, 
  businessCategory, categorySlug, includeImages,
  generateYoutubeScript: boolean // 🆕 台本生成フラグ
}
→ ブログ記事 + YouTubeショート台本を同時生成
```

**実装案:**
```typescript
// 1. ブログ記事生成（既存）
const blogResult = await generateBlogArticle(...);

// 2. 台本生成（🆕）
if (generateYoutubeScript) {
  const scriptResult = await generateYouTubeScript({
    blogPostId: blogResult.postId,
    blogSlug: blogResult.slug,
    blogContent: blogResult.content,
    blogTitle: blogResult.title
  });
  
  console.log('✅ 台本生成完了:', scriptResult.fragmentId);
}

// 3. レスポンス
return {
  ...blogResult,
  youtubeScript: scriptResult // 🆕
};
```

---

## 📱 3. 管理画面への統合

### `/admin/content-generation` の拡張

**追加UI:**
```tsx
<div className="youtube-script-option">
  <label>
    <input 
      type="checkbox" 
      checked={generateYoutubeScript}
      onChange={(e) => setGenerateYoutubeScript(e.target.checked)}
    />
    YouTubeショート台本も同時生成
  </label>
  <p className="text-sm text-gray-500">
    ブログ記事を元に30秒のYouTubeショート台本を自動生成します
  </p>
</div>
```

**結果表示:**
```tsx
{result.youtubeScript && (
  <div className="youtube-script-result">
    <h3>🎬 YouTubeショート台本</h3>
    <div className="script-preview">
      <p><strong>タイトル:</strong> {result.youtubeScript.title}</p>
      <p><strong>フック:</strong> {result.youtubeScript.hook}</p>
      <p><strong>共感:</strong> {result.youtubeScript.empathy}</p>
      <p><strong>本題:</strong> {result.youtubeScript.body}</p>
      <p><strong>CTA:</strong> {result.youtubeScript.cta}</p>
      <p><strong>バイラル性:</strong> {result.youtubeScript.viralityScore}点</p>
    </div>
    <a href={`/admin/youtube-scripts/${result.youtubeScript.scriptId}`}>
      台本を編集
    </a>
  </div>
)}
```

---

## 🎬 4. 台本管理画面

### `/admin/youtube-scripts` （🆕）

**機能:**
- 生成された台本一覧表示
- 台本編集
- 台本承認ワークフロー
- YouTube投稿ステータス管理

**画面構成:**
```
/admin/youtube-scripts
├─ 一覧ページ
│  ├─ 台本タイトル
│  ├─ 関連ブログ記事
│  ├─ ステータス（draft / approved / posted）
│  ├─ バイラル性スコア
│  └─ アクション（編集 / 承認 / 削除）
│
├─ 詳細・編集ページ
│  ├─ 4フェーズ台本編集
│  ├─ バイラル要素編集
│  ├─ プレビュー（30秒タイマー）
│  ├─ 承認ボタン
│  └─ YouTube投稿ボタン（将来）
│
└─ Fragment Vectors統合
   └─ ベクトル化ステータス表示
```

---

## 🚀 5. YouTube API投稿機能（Phase 2）

**現時点では未実装推奨**

理由:
1. まずは台本生成とベクトル化を完成させる
2. 台本の品質を人間が確認する工程が必要
3. YouTube API投稿は慎重に設計が必要

**将来の実装案:**
```typescript
// /api/admin/post-to-youtube
POST /api/admin/post-to-youtube
{
  scriptId: number,
  videoFile: File // 別途動画制作が必要
}
→ YouTube APIで投稿
→ company_youtube_shorts.status = 'posted'
→ company_youtube_shorts.youtube_video_id 更新
```

---

## ✅ 6. ベクトル化のタイミング

### **台本生成直後に自動ベクトル化**

**フロー:**
```
1. 台本生成API呼び出し
   ↓
2. 4フェーズ台本を生成
   ↓
3. content_for_embedding を作成
   - title + hook + empathy + body + cta
   - viral_elements を含める
   ↓
4. OpenAI Embeddings API呼び出し
   - text-embedding-3-large
   - 1536次元ベクトル
   ↓
5. company_youtube_shorts.embedding に保存
   ↓
6. fragment_vectors にも同期保存
   ↓
7. ✅ ベクトル化完了
```

**ベクトル化されるコンテンツ例:**
```markdown
# YouTubeショート台本: ChatGPT活用で業務効率70%UP

## フック（0-2秒）
実はこれ知らないと損します！

## 共感（3-5秒）
毎日の業務に追われて時間がない人へ

## 本題（5-20秒）
ChatGPTを使えば問い合わせ対応が70%削減できます。
たった3ステップで導入可能。
1. ナレッジベースを整理
2. カスタムGPT作成
3. 社内展開

## CTA（ラスト5秒）
詳しい手順はプロフィールのブログで全公開中！

## バイラル要素
- ChatGPT
- 業務効率化
- 70%削減
- 即実践可能

## メタデータ
- Fragment ID: youtube-script-1
- Complete URI: https://nands.tech/shorts#youtube-script-1
- 関連ブログ: /posts/chatgpt--139381
- バイラル性スコア: 85点
```

---

## 🎯 7. 台本クオリティ保証

### **必須の品質チェック**

#### 自動チェック（システム）
```typescript
interface QualityCheckResult {
  passed: boolean;
  checks: {
    titleLength: boolean;      // タイトル20文字以内
    hookImpact: boolean;        // フックにインパクトワード含む
    empathyRelatability: boolean; // 共感文に「〜人へ」等含む
    bodyClarity: boolean;       // 本題に数字・具体例含む
    ctaClear: boolean;          // CTAにブログ誘導含む
    durationEstimate: boolean;  // 30秒以内（文字数150-200）
    viralityScore: number;      // 60点以上
  };
  warnings: string[];
}
```

#### 人間によるレビュー（管理画面）
1. **プレビュー機能**
   - 30秒タイマーで台本を読み上げ
   - 文字数カウント表示
   - バイラル要素表示

2. **承認ワークフロー**
   - draft → approved → posted
   - 承認前は公開されない
   - 編集履歴を保存

3. **A/Bテスト機能（将来）**
   - 複数の台本案を生成
   - バイラル性スコアで比較
   - 最適な台本を選択

---

## 📊 8. 実装優先度

### Phase 1: 台本生成とベクトル化（🔥 最優先）
- [ ] `/api/admin/generate-youtube-script` 実装
- [ ] システムプロンプト設計
- [ ] 4フェーズ台本生成ロジック
- [ ] ベクトル化処理
- [ ] company_youtube_shorts テーブルへの保存
- [ ] fragment_vectors への同期

### Phase 2: 管理画面統合
- [ ] `/admin/youtube-scripts` ページ作成
- [ ] 台本一覧表示
- [ ] 台本編集機能
- [ ] プレビュー機能
- [ ] 承認ワークフロー

### Phase 3: ブログ記事生成APIとの統合
- [ ] `/api/generate-rag-blog` に `generateYoutubeScript` フラグ追加
- [ ] 同時生成ロジック実装
- [ ] `/admin/content-generation` UI拡張

### Phase 4: YouTube API投稿（将来）
- [ ] YouTube Data API統合
- [ ] 動画アップロード機能
- [ ] 投稿ステータス管理
- [ ] 自動投稿スケジューラー

---

## 🚨 注意事項

### 1. 台本の品質確認は必須
- AI生成台本は必ず人間がレビュー
- バイラル要素が過激すぎないか確認
- ブログ記事の内容と一致しているか確認

### 2. トレンド要素の更新
- AI検索エンジンの最新トレンドを反映
- 定期的にシステムプロンプトを更新
- A/Bテストで効果測定

### 3. YouTube APIの制限
- 1日の投稿数制限
- API呼び出し制限
- 動画サイズ制限

---

**作成日**: 2025年10月6日  
**最終更新**: 2025年10月6日

