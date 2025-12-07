# Phase 1: データベース調査報告

**調査日:** 2025-12-06  
**ステータス:** ✅ 完了

---

## 📊 調査サマリー

### company_youtube_shorts テーブル統計

| content_type | 総数 | YouTube登録済み | ブログ記事紐付け | 公開済み |
|--------------|------|----------------|-----------------|---------|
| youtube-medium | 18 | 12 | 18 | 12 |
| youtube-short | 28 | **2** | 26 | 4 |

### 重要な発見

1. **ショート動画のYouTube登録は2件のみ**
   - ID: 15 (Sora 2関連) - 記事ID: 74
   - ID: 102 (Veo3.1関連) - 記事ID: 87

2. **中尺とショート両方がYouTube登録済みの記事は0件**
   - 現時点で「両方表示」をテストできる記事がない

3. **現在のコードロジック**
   ```typescript
   // 中尺を優先、なければショート
   const mediumScript = allScripts.find(s => s.content_type === 'youtube-medium')
   const shortScript = allScripts.find(s => s.content_type === 'youtube-short')
   const data = mediumScript || shortScript  // どちらか1つのみ
   ```

---

## 📋 詳細データ

### YouTube登録済みショート動画（2件）

```sql
 id  |                 fragment_id                 |   script_title   | youtube_video_id |                        youtube_url                         | related_blog_post_id |  status   
-----+---------------------------------------------+------------------+------------------+------------------------------------------------------------+----------------------+-----------
  15 | youtube-short-aisora-2-988380-1759756345060 | Sora 2、実務革新 | TqGo37CpC48      | https://youtube.com/shorts/TqGo37CpC48?si=nXjl-pl_0Enk0H8t |                   74 | published
 102 | youtube-short-veo31-812428-1761015507936    | 大谷絶賛=設計か  | xo3KzFYhcc0      | https://youtu.be/xo3KzFYhcc0?si=6Z249PqZN8BQmN6N           |                   87 | published
```

### 対応するブログ記事

```sql
 id |      slug       |                    title                     | youtube_script_id | current_script_type | medium_registered | short_registered 
----+-----------------+----------------------------------------------+-------------------+---------------------+------------------+------------------
 74 | aisora-2-988380 | 話題の映像生成AI「Sora 2」とは？使い方総解説 |                15 | youtube-short       |                0 |                1
 87 | veo31-812428    | Veo3.1動画生成の完全ガイド                   |               102 | youtube-short       |                0 |                1
```

**注意:** これらの記事は中尺動画がないため、ショート動画が「中尺動画として」表示されている。

---

## 🔍 テーブル構造確認

### 主要カラム

| カラム名 | 型 | 用途 |
|---------|-----|------|
| `id` | bigint | 主キー |
| `fragment_id` | varchar(255) | ベクトルリンク用Fragment ID |
| `complete_uri` | text | 完全URI |
| `content_type` | varchar(100) | 'youtube-short' / 'youtube-medium' |
| `related_blog_post_id` | integer | 関連ブログ記事ID（FK） |
| `youtube_video_id` | varchar(20) | YouTubeビデオID |
| `youtube_url` | text | YouTube URL |
| `status` | varchar(20) | 'draft' / 'published' |
| `script_title` | text | 台本タイトル |
| `script_hook` | text | フック（冒頭文） |

### インデックス

- `company_youtube_shorts_blog_id_idx` - `related_blog_post_id` でのインデックス ✅
- `company_youtube_shorts_content_type_idx` - `content_type` でのインデックス ✅
- `company_youtube_shorts_status_idx` - `status` でのインデックス ✅

**結論:** 必要なインデックスは全て存在。追加のマイグレーションは不要。

---

## 🎯 実装への影響

### 変更が必要なコード

**ファイル:** `/app/posts/[slug]/page.tsx`

```typescript
// 変更前
const data = mediumScript || shortScript  // どちらか1つ

// 変更後
// 中尺動画用（既存変数を維持）
const youtubeScript = mediumScript?.youtube_video_id ? mediumScript : null

// ショート動画用（新規追加）
const youtubeShort = shortScript?.youtube_video_id ? shortScript : null
```

### テスト可能な記事

現時点でテストに使用できる記事：

1. **ショート動画のみ表示テスト**
   - `/posts/aisora-2-988380` - ショート動画ID: 15
   - `/posts/veo31-812428` - ショート動画ID: 102

2. **中尺動画のみ表示テスト**
   - `/posts/-129550` - 中尺動画ID: 25
   - `/posts/-571903` - 中尺動画ID: 33

3. **両方表示テスト**
   - **現時点で該当記事なし**
   - 新規でショート動画をYouTube登録する必要あり

---

## ✅ 結論

1. **データベース構造は適切** - 追加のマイグレーション不要
2. **テストデータは限定的** - ショート動画YouTube登録済みは2件のみ
3. **実装は可能** - 既存コードの修正で対応可能
4. **両方表示のテスト** - 実際にショート動画をYouTube登録後にテスト

---

## 📝 次のアクション

1. [ ] Phase 2: データベース・API設計（変更不要と判明）
2. [ ] Phase 3: ショート動画埋め込みコンポーネント実装
3. [ ] テスト用にショート動画をYouTube登録（必要に応じて）


