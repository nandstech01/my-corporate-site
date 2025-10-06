# YouTubeショート完全ワークフロー設計

## 🎯 設計原則

1. **1:1関係の保証**: ブログ記事 ↔ YouTubeショート台本は必ず1対1
2. **ステータス管理**: 各段階のステータスを明確に管理
3. **柔軟性**: 記事のみ公開（動画なし）も可能
4. **追跡可能性**: どの記事にどの動画が紐づいているか常に追跡可能
5. **人間承認**: 重要な工程には必ず人間の承認を挟む

---

## 📊 1. データベース設計

### `posts` テーブル拡張

```sql
ALTER TABLE posts ADD COLUMN IF NOT EXISTS youtube_script_status VARCHAR(50) DEFAULT NULL;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS youtube_script_id INT REFERENCES company_youtube_shorts(id);

-- ステータス値:
-- NULL: 台本未生成
-- 'script_generated': 台本生成済み
-- 'script_approved': 台本承認済み（動画編集開始可能）
-- 'video_editing': 動画編集中
-- 'video_uploaded': YouTube投稿完了
-- 'embedded': 記事に埋め込み完了
-- 'no_video': 動画なし（記事のみ公開）
```

### `company_youtube_shorts` テーブル拡張

```sql
ALTER TABLE company_youtube_shorts ADD COLUMN IF NOT EXISTS workflow_status VARCHAR(50) DEFAULT 'draft';
ALTER TABLE company_youtube_shorts ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP;
ALTER TABLE company_youtube_shorts ADD COLUMN IF NOT EXISTS video_editing_started_at TIMESTAMP;
ALTER TABLE company_youtube_shorts ADD COLUMN IF NOT EXISTS youtube_uploaded_at TIMESTAMP;
ALTER TABLE company_youtube_shorts ADD COLUMN IF NOT EXISTS embedded_at TIMESTAMP;
ALTER TABLE company_youtube_shorts ADD COLUMN IF NOT EXISTS approved_by VARCHAR(255);
ALTER TABLE company_youtube_shorts ADD COLUMN IF NOT EXISTS notes TEXT;

-- ステータス値:
-- 'draft': 台本生成済み（レビュー待ち）
-- 'approved': 台本承認済み（動画編集開始可能）
-- 'video_editing': 動画編集中
-- 'uploaded': YouTube投稿完了（URL設定済み）
-- 'published': 記事に埋め込み完了（公開）
-- 'cancelled': キャンセル（動画なし）
```

---

## 🔄 2. 完全ワークフロー

### **ステップ1: 記事生成 + 台本生成（自動）**

**実行場所**: `/admin/content-generation`

**UI:**
```tsx
<div className="youtube-option">
  <label>
    <input 
      type="checkbox" 
      checked={generateYoutubeScript}
      onChange={(e) => setGenerateYoutubeScript(e.target.checked)}
    />
    YouTubeショート台本も同時生成
  </label>
  <p className="hint">
    後で動画を作らない選択もできます
  </p>
</div>
```

**API処理** (`/api/generate-rag-blog`):
```typescript
// 1. ブログ記事生成
const blogPost = await generateBlogPost(...);

// 2. 台本生成（オプション）
let scriptId = null;
if (generateYoutubeScript) {
  const script = await generateYouTubeScript({
    blogPostId: blogPost.id,
    blogSlug: blogPost.slug,
    blogContent: blogPost.content,
    blogTitle: blogPost.title
  });
  
  scriptId = script.id;
  
  // 3. posts.youtube_script_id を更新
  await supabase
    .from('posts')
    .update({
      youtube_script_id: scriptId,
      youtube_script_status: 'script_generated'
    })
    .eq('id', blogPost.id);
  
  // 4. company_youtube_shorts.related_blog_post_id を更新
  await supabase
    .from('company_youtube_shorts')
    .update({
      related_blog_post_id: blogPost.id,
      blog_slug: blogPost.slug,
      workflow_status: 'draft'
    })
    .eq('id', scriptId);
}

return {
  postId: blogPost.id,
  slug: blogPost.slug,
  scriptId: scriptId, // NULLの場合は台本なし
  scriptStatus: generateYoutubeScript ? 'script_generated' : null
};
```

**結果:**
- ✅ ブログ記事生成完了
- ✅ 台本生成完了（オプション）
- ✅ 1:1関係が確立（`posts.youtube_script_id` ↔ `company_youtube_shorts.related_blog_post_id`）
- ✅ ステータス: `script_generated`

---

### **ステップ2: 台本レビュー・編集（手動）**

**実行場所**: `/admin/youtube-scripts` (🆕 新規ページ)

**画面構成:**
```
┌─────────────────────────────────────────────┐
│ YouTubeショート台本管理                        │
├─────────────────────────────────────────────┤
│ 検索: [        ] ステータス: [全て ▼]          │
├─────────────────────────────────────────────┤
│ タイトル        │ 関連記事      │ ステータス  │  │
├─────────────────────────────────────────────┤
│ ChatGPT活用で  │ chatgpt--13.. │ レビュー待ち │→│
│ 業務効率70%UP   │               │             │  │
├─────────────────────────────────────────────┤
│ ...             │ ...           │ ...         │  │
└─────────────────────────────────────────────┘
```

**詳細画面** (`/admin/youtube-scripts/[scriptId]`):
```tsx
<div className="script-detail">
  {/* 1:1関係の明示 */}
  <div className="relationship">
    <h3>🔗 関連記事</h3>
    <a href={`/posts/${script.blog_slug}`} target="_blank">
      {script.related_blog_title}
    </a>
    <p>記事ID: {script.related_blog_post_id}</p>
  </div>

  {/* 台本編集 */}
  <div className="script-editor">
    <h3>📝 台本編集</h3>
    
    <label>タイトル（20文字以内）</label>
    <input value={script.script_title} onChange={...} />
    
    <label>フック（0-2秒）</label>
    <textarea value={script.script_hook} onChange={...} />
    
    <label>共感（3-5秒）</label>
    <textarea value={script.script_empathy} onChange={...} />
    
    <label>本題（5-20秒）</label>
    <textarea value={script.script_body} onChange={...} />
    
    <label>CTA（ラスト5秒）</label>
    <textarea value={script.script_cta} onChange={...} />
  </div>

  {/* プレビュー */}
  <div className="preview">
    <h3>🎬 プレビュー（30秒）</h3>
    <button onClick={startPreview}>▶ 再生</button>
    <div className="timer">残り: {timer}秒</div>
    <div className="script-text">{currentPhaseText}</div>
  </div>

  {/* アクション */}
  <div className="actions">
    <button onClick={saveScript}>💾 保存</button>
    <button onClick={approveScript}>✅ 承認（動画編集開始可能）</button>
    <button onClick={cancelScript}>🚫 キャンセル（動画なし）</button>
  </div>
</div>
```

**承認処理** (`/api/admin/approve-youtube-script`):
```typescript
POST /api/admin/approve-youtube-script
{
  scriptId: number,
  action: 'approve' | 'cancel'
}

// approve の場合:
await supabase
  .from('company_youtube_shorts')
  .update({
    workflow_status: 'approved',
    approved_at: new Date().toISOString(),
    approved_by: currentUser.email
  })
  .eq('id', scriptId);

await supabase
  .from('posts')
  .update({
    youtube_script_status: 'script_approved'
  })
  .eq('youtube_script_id', scriptId);

// cancel の場合:
await supabase
  .from('company_youtube_shorts')
  .update({
    workflow_status: 'cancelled'
  })
  .eq('id', scriptId);

await supabase
  .from('posts')
  .update({
    youtube_script_status: 'no_video'
  })
  .eq('youtube_script_id', scriptId);
```

**結果:**
- ✅ 台本の品質確認完了
- ✅ 承認 → ステータス: `script_approved`（次ステップへ）
- ✅ キャンセル → ステータス: `no_video`（記事のみ公開）

---

### **ステップ3: 動画編集・制作（手動・時間がかかる）**

**実行場所**: 外部ツール（CapCut、Premiere Pro等）

**管理画面での操作** (`/admin/youtube-scripts/[scriptId]`):
```tsx
<div className="video-production">
  <h3>🎥 動画制作</h3>
  
  <div className="status">
    現在のステータス: <span className="badge">承認済み</span>
  </div>

  <button onClick={startVideoEditing}>
    🎬 動画編集を開始
  </button>
  
  <p className="note">
    このボタンを押すと「動画編集中」ステータスになります。
    動画編集完了後、YouTubeに投稿してください。
  </p>
  
  <div className="script-download">
    <button onClick={downloadScript}>
      📄 台本をダウンロード（.txt）
    </button>
  </div>
</div>
```

**「動画編集を開始」処理:**
```typescript
POST /api/admin/start-video-editing
{
  scriptId: number
}

await supabase
  .from('company_youtube_shorts')
  .update({
    workflow_status: 'video_editing',
    video_editing_started_at: new Date().toISOString()
  })
  .eq('id', scriptId);

await supabase
  .from('posts')
  .update({
    youtube_script_status: 'video_editing'
  })
  .eq('youtube_script_id', scriptId);
```

**結果:**
- ✅ ステータス: `video_editing`
- 🎬 動画編集中（時間がかかる）
- 📝 台本ファイルをダウンロード可能

---

### **ステップ4: YouTube投稿 + URL取得（手動 or 半自動）**

#### **方法A: 手動URL入力（🌟 推奨）**

**実行場所**: `/admin/youtube-scripts/[scriptId]`

**UI:**
```tsx
<div className="youtube-upload">
  <h3>📹 YouTube投稿完了</h3>
  
  <div className="instructions">
    <p>動画編集が完了したら、YouTubeに投稿してください。</p>
    <ol>
      <li>YouTubeにアップロード（ショート動画として）</li>
      <li>投稿完了後、URLをコピー</li>
      <li>下記に貼り付けて保存</li>
    </ol>
  </div>

  <label>YouTube動画URL</label>
  <input 
    type="url"
    placeholder="https://youtube.com/shorts/xxxxx"
    value={youtubeUrl}
    onChange={handleUrlChange}
  />
  
  <div className="url-validation">
    {isValidYouTubeUrl ? '✅ 有効なURL' : '❌ 無効なURL'}
  </div>

  <button 
    onClick={saveYouTubeUrl}
    disabled={!isValidYouTubeUrl}
  >
    💾 URL保存 & 構造化データ統合
  </button>
</div>
```

**URL保存処理** (`/api/admin/save-youtube-url`):
```typescript
POST /api/admin/save-youtube-url
{
  scriptId: number,
  youtubeUrl: string // https://youtube.com/shorts/xxxxx
}

// 1. URLバリデーション
const videoId = extractVideoIdFromUrl(youtubeUrl);
if (!videoId) {
  return { error: '無効なYouTube URL' };
}

// 2. YouTube Data APIで動画情報取得（オプション）
const videoInfo = await fetchYouTubeVideoInfo(videoId);

// 3. company_youtube_shorts 更新
await supabase
  .from('company_youtube_shorts')
  .update({
    video_id: videoId,
    video_url: youtubeUrl,
    embed_url: `https://www.youtube.com/embed/${videoId}`,
    youtube_uploaded_at: new Date().toISOString(),
    workflow_status: 'uploaded',
    
    // YouTube APIから取得した情報（オプション）
    view_count: videoInfo?.viewCount,
    like_count: videoInfo?.likeCount,
    published_at: videoInfo?.publishedAt
  })
  .eq('id', scriptId);

// 4. 構造化データ生成
const schemaData = generateYouTubeShortSchema({
  videoId,
  title: script.script_title,
  description: script.content,
  embedUrl: `https://www.youtube.com/embed/${videoId}`,
  thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
  uploadDate: new Date().toISOString()
});

await supabase
  .from('company_youtube_shorts')
  .update({
    schema_data: schemaData
  })
  .eq('id', scriptId);

// 5. posts ステータス更新
await supabase
  .from('posts')
  .update({
    youtube_script_status: 'video_uploaded'
  })
  .eq('youtube_script_id', scriptId);

return {
  success: true,
  videoId,
  schemaGenerated: true,
  nextStep: 'embed' // 次は埋め込み
};
```

#### **方法B: YouTube API自動取得（将来実装）**

```typescript
// 自動的にチャンネルの最新動画をチェック
// → 台本タイトルと一致する動画を検出
// → 自動でURL取得・保存
// 
// 注意: これは完全自動化は難しい
// - 動画タイトルが完全一致するとは限らない
// - 手動確認ステップが必要
```

**結果:**
- ✅ YouTube URL保存完了
- ✅ 構造化データ生成完了
- ✅ ステータス: `video_uploaded`
- ✅ 次ステップ: 記事への埋め込み

---

### **ステップ5: 構造化データ統合（自動）**

**実行タイミング**: ステップ4のURL保存時に自動実行

**処理内容:**
```typescript
// Schema.org VideoObject生成
const schemaData = {
  "@context": "https://schema.org",
  "@type": "VideoObject",
  "name": script.script_title,
  "description": script.content,
  "thumbnailUrl": `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
  "uploadDate": new Date().toISOString(),
  "contentUrl": `https://youtube.com/shorts/${videoId}`,
  "embedUrl": `https://www.youtube.com/embed/${videoId}`,
  "duration": `PT${script.script_duration_seconds}S`,
  
  // Fragment ID統合
  "@id": `https://nands.tech/shorts#${script.fragment_id}`,
  "url": `https://nands.tech/shorts#${script.fragment_id}`,
  
  // isPartOf: ブログ記事との関連
  "isPartOf": {
    "@type": "BlogPosting",
    "@id": `https://nands.tech/posts/${script.blog_slug}`,
    "url": `https://nands.tech/posts/${script.blog_slug}`
  }
};

// AI最適化スコア再計算
const aiScore = calculateAIOptimizationScore(script, schemaData);
```

**結果:**
- ✅ Schema.org VideoObject生成
- ✅ Fragment ID統合
- ✅ ブログ記事との関連付け（isPartOf）
- ✅ AI最適化スコア更新

---

### **ステップ6: 記事詳細ページに埋め込み（自動）**

**実行場所**: `/admin/youtube-scripts/[scriptId]` または `/admin/posts/[postId]/edit`

**UI:**
```tsx
<div className="embed-video">
  <h3>📺 記事に埋め込む</h3>
  
  <div className="preview">
    <h4>プレビュー</h4>
    <iframe
      width="315"
      height="560"
      src={`https://www.youtube.com/embed/${script.video_id}`}
      title={script.script_title}
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    />
  </div>

  <button onClick={embedToPost}>
    ✅ 記事に埋め込む
  </button>
</div>
```

**埋め込み処理** (`/api/admin/embed-youtube-to-post`):
```typescript
POST /api/admin/embed-youtube-to-post
{
  scriptId: number
}

// 1. company_youtube_shorts から情報取得
const script = await supabase
  .from('company_youtube_shorts')
  .select('*')
  .eq('id', scriptId)
  .single();

// 2. posts の content に埋め込みコード追加
const embedCode = `
<!-- YouTube Short Embed -->
<div class="youtube-short-embed" data-video-id="${script.video_id}">
  <iframe
    width="315"
    height="560"
    src="https://www.youtube.com/embed/${script.video_id}"
    title="${script.script_title}"
    frameborder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowfullscreen
  ></iframe>
</div>
`;

// 3. 記事の適切な位置に挿入（例: はじめにセクションの後）
const updatedContent = insertEmbedCode(
  currentContent,
  embedCode,
  'after-introduction' // 挿入位置
);

await supabase
  .from('posts')
  .update({
    content: updatedContent,
    youtube_script_status: 'embedded'
  })
  .eq('id', script.related_blog_post_id);

// 4. company_youtube_shorts ステータス更新
await supabase
  .from('company_youtube_shorts')
  .update({
    workflow_status: 'published',
    embedded_at: new Date().toISOString()
  })
  .eq('id', scriptId);

return {
  success: true,
  postUrl: `https://nands.tech/posts/${script.blog_slug}`,
  embedPosition: 'after-introduction'
};
```

**結果:**
- ✅ YouTube動画が記事に埋め込み完了
- ✅ ステータス: `published`（完全公開）
- ✅ 記事詳細ページで動画視聴可能

---

## 📊 3. ステータス一覧表

### `posts.youtube_script_status`

| ステータス | 説明 | 次のアクション |
|-----------|------|---------------|
| `NULL` | 台本未生成 | - |
| `script_generated` | 台本生成済み | 台本レビュー・承認 |
| `script_approved` | 台本承認済み | 動画編集開始 |
| `video_editing` | 動画編集中 | YouTube投稿 |
| `video_uploaded` | YouTube投稿完了 | 記事に埋め込み |
| `embedded` | 記事埋め込み完了 | 完了 ✅ |
| `no_video` | 動画なし | 完了（記事のみ）✅ |

### `company_youtube_shorts.workflow_status`

| ステータス | 説明 | 可能なアクション |
|-----------|------|----------------|
| `draft` | 台本生成済み | 編集、承認、キャンセル |
| `approved` | 承認済み | 動画編集開始 |
| `video_editing` | 動画編集中 | YouTube URL入力 |
| `uploaded` | YouTube投稿完了 | 記事埋め込み |
| `published` | 公開完了 | - |
| `cancelled` | キャンセル | - |

---

## 🎯 4. 1:1関係の保証

### データベースレベル

```sql
-- posts → company_youtube_shorts (1対1)
ALTER TABLE posts 
  ADD CONSTRAINT fk_youtube_script 
  FOREIGN KEY (youtube_script_id) 
  REFERENCES company_youtube_shorts(id) 
  ON DELETE SET NULL;

-- company_youtube_shorts → posts (1対1)
ALTER TABLE company_youtube_shorts
  ADD CONSTRAINT fk_blog_post
  FOREIGN KEY (related_blog_post_id)
  REFERENCES posts(id)
  ON DELETE CASCADE;

-- ユニーク制約（1つの記事に1つの台本のみ）
CREATE UNIQUE INDEX idx_unique_post_script 
  ON posts(youtube_script_id) 
  WHERE youtube_script_id IS NOT NULL;

CREATE UNIQUE INDEX idx_unique_script_post
  ON company_youtube_shorts(related_blog_post_id)
  WHERE related_blog_post_id IS NOT NULL;
```

### 管理画面での可視化

```tsx
// /admin/posts/[slug]/edit
<div className="youtube-relationship">
  <h3>🎬 関連YouTubeショート</h3>
  
  {post.youtube_script_id ? (
    <div className="script-card">
      <p>台本ID: {post.youtube_script_id}</p>
      <p>ステータス: {post.youtube_script_status}</p>
      <a href={`/admin/youtube-scripts/${post.youtube_script_id}`}>
        台本を管理
      </a>
      
      {script.video_id && (
        <div className="video-preview">
          <iframe src={`https://youtube.com/embed/${script.video_id}`} />
        </div>
      )}
    </div>
  ) : (
    <div className="no-script">
      <p>台本未生成</p>
      <button onClick={generateScript}>
        台本を生成
      </button>
    </div>
  )}
</div>
```

---

## 🚨 5. 柔軟性の確保

### シナリオ1: 記事のみ公開（動画なし）

**操作:**
1. 台本レビュー画面で「キャンセル」ボタンをクリック
2. ステータス: `no_video`
3. 記事は通常通り公開、動画なし

### シナリオ2: 後から動画を追加

**操作:**
1. `/admin/posts/[slug]/edit` で「台本を生成」ボタン
2. 台本生成 → ワークフロー開始
3. 既存の記事に後から動画追加可能

### シナリオ3: 動画を差し替え

**操作:**
1. `/admin/youtube-scripts/[scriptId]` で「YouTube URL を更新」
2. 新しいURLを入力
3. 構造化データ再生成
4. 記事の埋め込みコードも自動更新

---

## 📱 6. 管理画面の追加ページ

### `/admin/youtube-scripts` (一覧)

**機能:**
- 全台本の一覧表示
- ステータスフィルタ
- 関連記事リンク
- 一括操作（承認、削除）

### `/admin/youtube-scripts/[scriptId]` (詳細)

**機能:**
- 台本編集
- プレビュー（30秒タイマー）
- 承認・キャンセル
- 動画編集開始
- YouTube URL入力
- 記事埋め込み

### `/admin/posts/[slug]/edit` (拡張)

**追加機能:**
- 関連YouTubeショート表示
- 台本生成ボタン
- 動画埋め込み位置調整

---

## 🔧 7. API一覧

| エンドポイント | メソッド | 機能 |
|---------------|---------|------|
| `/api/admin/generate-youtube-script` | POST | 台本生成 |
| `/api/admin/approve-youtube-script` | POST | 台本承認/キャンセル |
| `/api/admin/start-video-editing` | POST | 動画編集開始 |
| `/api/admin/save-youtube-url` | POST | YouTube URL保存 |
| `/api/admin/embed-youtube-to-post` | POST | 記事埋め込み |
| `/api/admin/youtube-scripts` | GET | 台本一覧取得 |
| `/api/admin/youtube-scripts/[id]` | GET/PUT | 台本詳細取得/更新 |

---

## ✅ 8. 実装優先度

### Phase 1: 基本ワークフロー（🔥 最優先）

1. データベーススキーマ拡張
   - `posts.youtube_script_status`
   - `posts.youtube_script_id`
   - `company_youtube_shorts.workflow_status`
   
2. 台本生成API実装
   - `/api/admin/generate-youtube-script`
   
3. 台本管理画面
   - `/admin/youtube-scripts` 一覧
   - `/admin/youtube-scripts/[scriptId]` 詳細
   
4. 承認ワークフロー
   - 台本承認・キャンセル機能
   - ステータス管理

### Phase 2: YouTube統合

5. YouTube URL手動入力
   - `/api/admin/save-youtube-url`
   - URLバリデーション
   - 構造化データ生成
   
6. 記事埋め込み機能
   - `/api/admin/embed-youtube-to-post`
   - 埋め込み位置調整

### Phase 3: 管理画面強化

7. 1:1関係の可視化
   - `/admin/posts/[slug]/edit` 拡張
   - 関連動画表示
   
8. ステータス追跡
   - ダッシュボード
   - 進捗管理

---

## 📝 まとめ

### 🎯 この設計のメリット

1. **完全な追跡可能性**: どの記事にどの動画が紐づいているか常に明確
2. **柔軟性**: 記事のみ公開、後から動画追加、動画差し替えすべて可能
3. **人間承認**: 重要な工程には必ず人間の承認を挟む
4. **ステータス管理**: 各段階のステータスが明確
5. **1:1関係保証**: データベースレベルで1対1関係を保証

### ⚠️ 注意点

1. **動画編集は外部**: 動画編集自体はシステム外で実施
2. **手動工程**: YouTube投稿とURL入力は手動（最も確実）
3. **品質管理**: 台本承認ステップで必ず品質確認
4. **YouTube API制限**: 自動投稿は実装しない（制限が厳しい）

---

**作成日**: 2025年10月6日  
**最終更新**: 2025年10月6日

