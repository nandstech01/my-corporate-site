# YouTubeショート台本生成ワークフロー（改訂版）

## 🎯 設計方針の変更

### ❌ 旧案（却下）
- 記事生成時に同時に台本生成
- 自動化しすぎ、品質確認が後回し

### ✅ 新案（採用）
- 記事生成**後**に、記事一覧画面で個別に台本生成
- 記事を見てから「動画化する価値がある」と判断
- クオリティ確認を最優先

---

## 📋 1. UI設計：記事一覧画面の拡張

### `/admin/posts` (https://nands.tech/admin/posts)

**現在の画面:**
```
┌─────────────────────────────────────────────────┐
│ 記事一覧                       [新規作成]        │
├──────┬──────────┬─────┬────────┬────────┤
│ タイトル │ カテゴリ │ ステータス │ 作成日 │ アクション │
├──────┼──────────┼─────┼────────┼────────┤
│ ChatGPT... │ AI News │ 公開 │ 2025-10-06 │ [編集][削除] │
└──────┴──────────┴─────┴────────┴────────┘
```

**拡張後:**
```
┌────────────────────────────────────────────────────────────────┐
│ 記事一覧                                [新規作成]                │
├──────┬──────────┬─────┬────────┬──────┬────────────┤
│ タイトル │ カテゴリ │ ステータス │ 作成日 │ 動画 │ アクション      │
├──────┼──────────┼─────┼────────┼──────┼────────────┤
│ ChatGPT... │ AI News │ 公開 │ 2025-10-06 │ -    │ [編集][削除]   │
│          │          │      │            │      │ [🎬 台本生成]  │ ← 🆕
├──────┼──────────┼─────┼────────┼──────┼────────────┤
│ AI活用で... │ リスキリング │ 公開 │ 2025-10-05 │ ✅   │ [編集][削除]   │
│          │          │      │            │      │ [📺 台本確認]  │ ← 台本生成済み
└──────┴──────────┴─────┴────────┴──────┴────────────┘
```

### **新規カラム: 動画ステータス**

**表示内容:**
```tsx
{post.youtube_script_status === null && (
  <span className="badge badge-gray">-</span>
)}

{post.youtube_script_status === 'script_generated' && (
  <span className="badge badge-yellow">📝 レビュー待ち</span>
)}

{post.youtube_script_status === 'script_approved' && (
  <span className="badge badge-blue">✅ 承認済み</span>
)}

{post.youtube_script_status === 'video_editing' && (
  <span className="badge badge-purple">🎬 編集中</span>
)}

{post.youtube_script_status === 'video_uploaded' && (
  <span className="badge badge-green">📹 投稿済み</span>
)}

{post.youtube_script_status === 'embedded' && (
  <span className="badge badge-success">✅ 埋め込み完了</span>
)}

{post.youtube_script_status === 'no_video' && (
  <span className="badge badge-gray">🚫 動画なし</span>
)}
```

### **新規ボタン: 台本生成**

**条件分岐:**
```tsx
// 台本未生成の場合
{!post.youtube_script_id && (
  <button 
    onClick={() => handleGenerateScript(post.id)}
    className="btn btn-sm btn-primary"
  >
    🎬 台本生成
  </button>
)}

// 台本生成済みの場合
{post.youtube_script_id && (
  <button 
    onClick={() => handleViewScript(post.youtube_script_id)}
    className="btn btn-sm btn-secondary"
  >
    📺 台本確認
  </button>
)}
```

---

## 🔄 2. 台本生成フロー

### **Step 1: 記事一覧で「台本生成」ボタンをクリック**

```tsx
// /admin/posts/page.tsx

const handleGenerateScript = async (postId: number) => {
  // 1. 確認ダイアログ
  const confirmed = confirm(
    'この記事からYouTubeショート台本を生成しますか？\n\n' +
    '・記事内容を30秒のショート動画用に要約します\n' +
    '・4フェーズ構造（フック・共感・本題・CTA）で生成します\n' +
    '・生成後は台本レビュー画面で確認できます'
  );
  
  if (!confirmed) return;
  
  // 2. ローディング表示
  setLoading(true);
  setLoadingMessage('台本生成中...');
  
  try {
    // 3. API呼び出し
    const response = await fetch('/api/admin/generate-youtube-script', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId })
    });
    
    const result = await response.json();
    
    if (result.success) {
      // 4. 成功通知
      alert(
        '✅ 台本生成完了！\n\n' +
        `台本ID: ${result.scriptId}\n` +
        `Fragment ID: ${result.fragmentId}\n` +
        `バイラル性スコア: ${result.viralityScore}点\n\n` +
        '台本レビュー画面に移動しますか？'
      );
      
      // 5. 台本レビュー画面へ遷移
      if (confirm('台本レビュー画面へ移動しますか？')) {
        router.push(`/admin/youtube-scripts/${result.scriptId}`);
      } else {
        // ページリロードで一覧更新
        router.refresh();
      }
    } else {
      alert(`❌ エラー: ${result.error}`);
    }
  } catch (error) {
    console.error('台本生成エラー:', error);
    alert('台本生成に失敗しました');
  } finally {
    setLoading(false);
  }
};
```

### **Step 2: API処理 (`/api/admin/generate-youtube-script`)**

```typescript
POST /api/admin/generate-youtube-script
{
  postId: number
}

// 処理フロー:
1. posts テーブルから記事情報取得
   ↓
2. 既に台本が存在するかチェック
   - 存在する場合 → エラー（既存台本を確認してください）
   ↓
3. 記事内容を要約（OpenAI GPT-4）
   - 30秒のショート動画用に圧縮
   - 4フェーズ構造に分解
   ↓
4. 台本生成（システムプロンプト使用）
   - title（20文字以内）
   - hook（0-2秒）
   - empathy（3-5秒）
   - body（5-20秒）
   - cta（ラスト5秒）
   - viral_elements
   - virality_score
   ↓
5. Fragment ID生成
   - youtube-script-{id}
   - Complete URI: https://nands.tech/shorts#youtube-script-{id}
   ↓
6. ベクトル埋め込み生成
   - OpenAI text-embedding-3-large
   - 1536次元ベクトル
   ↓
7. company_youtube_shorts テーブルに保存
   - related_blog_post_id: postId
   - blog_slug: post.slug
   - workflow_status: 'draft'
   - embedding: ベクトル
   ↓
8. posts.youtube_script_id 更新
   - youtube_script_id: 生成されたID
   - youtube_script_status: 'script_generated'
   ↓
9. fragment_vectors テーブルに同期
   ↓
10. レスポンス返却

// レスポンス:
{
  success: true,
  scriptId: 123,
  fragmentId: "youtube-script-123",
  script: {
    title: "ChatGPT活用で業務効率70%UP",
    hook: "実はこれ知らないと損します",
    empathy: "毎日の業務に追われて時間がない人へ",
    body: "ChatGPTを使えば問い合わせ対応が70%削減...",
    cta: "詳しい手順はプロフィールのブログで全公開中",
    duration: 30
  },
  viralityScore: 85,
  vectorized: true,
  nextStep: "/admin/youtube-scripts/123"
}
```

---

## 🎨 3. UI実装詳細

### `/app/admin/posts/page.tsx` の拡張

```tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPostsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const router = useRouter();

  // 台本生成ハンドラー
  const handleGenerateScript = async (postId: number) => {
    const post = posts.find(p => p.id === postId);
    
    const confirmed = confirm(
      `「${post.title}」からYouTubeショート台本を生成しますか？\n\n` +
      '⏱️ 処理時間: 約30秒\n' +
      '📝 内容: 記事を30秒のショート動画用に要約\n' +
      '🎯 構造: 4フェーズ（フック・共感・本題・CTA）\n\n' +
      '生成後は台本レビュー画面で確認できます。'
    );
    
    if (!confirmed) return;
    
    setLoading(true);
    setLoadingMessage(`台本生成中... (記事ID: ${postId})`);
    
    try {
      const response = await fetch('/api/admin/generate-youtube-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId })
      });
      
      const result = await response.json();
      
      if (result.success) {
        const reviewConfirmed = confirm(
          '✅ 台本生成完了！\n\n' +
          `📝 タイトル: ${result.script.title}\n` +
          `🎯 バイラル性スコア: ${result.viralityScore}点\n` +
          `🔗 Fragment ID: ${result.fragmentId}\n\n` +
          '台本レビュー画面へ移動しますか？'
        );
        
        if (reviewConfirmed) {
          router.push(`/admin/youtube-scripts/${result.scriptId}`);
        } else {
          router.refresh();
        }
      } else {
        alert(`❌ エラー: ${result.error}`);
      }
    } catch (error) {
      console.error('台本生成エラー:', error);
      alert('台本生成に失敗しました。もう一度お試しください。');
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  // 台本確認ハンドラー
  const handleViewScript = (scriptId: number) => {
    router.push(`/admin/youtube-scripts/${scriptId}`);
  };

  return (
    <div className="admin-posts">
      {/* ローディングオーバーレイ */}
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner" />
          <p>{loadingMessage}</p>
          <p className="text-sm">30秒程度かかります...</p>
        </div>
      )}

      <table className="posts-table">
        <thead>
          <tr>
            <th>タイトル</th>
            <th>カテゴリ</th>
            <th>ステータス</th>
            <th>作成日</th>
            <th>動画</th> {/* 🆕 */}
            <th>アクション</th>
          </tr>
        </thead>
        <tbody>
          {posts.map(post => (
            <tr key={post.id}>
              <td>{post.title}</td>
              <td>{post.category}</td>
              <td>{post.status}</td>
              <td>{formatDate(post.created_at)}</td>
              
              {/* 🆕 動画ステータス */}
              <td>
                {renderYouTubeStatus(post.youtube_script_status)}
              </td>
              
              {/* アクション */}
              <td className="actions">
                <button onClick={() => handleEdit(post.id)}>
                  📝 編集
                </button>
                <button onClick={() => handleDelete(post.id)}>
                  🗑️ 削除
                </button>
                
                {/* 🆕 台本生成/確認ボタン */}
                {!post.youtube_script_id ? (
                  <button 
                    onClick={() => handleGenerateScript(post.id)}
                    className="btn-primary"
                    disabled={loading}
                  >
                    🎬 台本生成
                  </button>
                ) : (
                  <button 
                    onClick={() => handleViewScript(post.youtube_script_id)}
                    className="btn-secondary"
                  >
                    📺 台本確認
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// YouTubeステータス表示
function renderYouTubeStatus(status: string | null) {
  switch (status) {
    case null:
      return <span className="badge badge-gray">-</span>;
    case 'script_generated':
      return <span className="badge badge-yellow">📝 レビュー待ち</span>;
    case 'script_approved':
      return <span className="badge badge-blue">✅ 承認済み</span>;
    case 'video_editing':
      return <span className="badge badge-purple">🎬 編集中</span>;
    case 'video_uploaded':
      return <span className="badge badge-green">📹 投稿済み</span>;
    case 'embedded':
      return <span className="badge badge-success">✅ 完了</span>;
    case 'no_video':
      return <span className="badge badge-gray">🚫 動画なし</span>;
    default:
      return <span className="badge badge-gray">-</span>;
  }
}
```

---

## 🎯 4. 台本生成API実装

### `/app/api/admin/generate-youtube-script/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { OpenAIEmbeddings } from '@/lib/vector/openai-embeddings';
import { generateYouTubeShortSchema } from '@/lib/structured-data/youtube-short-schema';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
});

export async function POST(request: NextRequest) {
  try {
    const { postId } = await request.json();
    
    console.log(`🎬 台本生成開始: postId=${postId}`);
    
    // 1. 記事情報取得
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('*')
      .eq('id', postId)
      .single();
    
    if (postError || !post) {
      return NextResponse.json({
        success: false,
        error: '記事が見つかりません'
      }, { status: 404 });
    }
    
    // 2. 既存台本チェック
    if (post.youtube_script_id) {
      return NextResponse.json({
        success: false,
        error: '既に台本が生成されています。台本確認画面から編集してください。',
        existingScriptId: post.youtube_script_id
      }, { status: 400 });
    }
    
    console.log(`📝 記事取得完了: ${post.title}`);
    
    // 3. 台本生成（OpenAI GPT-4）
    console.log('🤖 AI台本生成開始...');
    const scriptResponse = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: YOUTUBE_SCRIPT_SYSTEM_PROMPT
        },
        {
          role: 'user',
          content: `以下のブログ記事からYouTubeショート動画の台本を生成してください。\n\n【記事タイトル】\n${post.title}\n\n【記事内容】\n${post.content.substring(0, 3000)}`
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7
    });
    
    const scriptData = JSON.parse(scriptResponse.choices[0].message.content);
    console.log('✅ 台本生成完了:', scriptData.title);
    
    // 4. Fragment ID生成
    const { data: maxFragmentData } = await supabase
      .from('company_youtube_shorts')
      .select('fragment_id')
      .order('id', { ascending: false })
      .limit(1);
    
    let nextFragmentNumber = 1;
    if (maxFragmentData && maxFragmentData.length > 0) {
      const match = maxFragmentData[0].fragment_id.match(/youtube-script-(\d+)/);
      if (match) {
        nextFragmentNumber = parseInt(match[1]) + 1;
      }
    }
    
    const fragmentId = `youtube-script-${nextFragmentNumber}`;
    const completeUri = `https://nands.tech/shorts#${fragmentId}`;
    
    console.log(`🔗 Fragment ID: ${fragmentId}`);
    
    // 5. ベクトル埋め込み生成
    console.log('🔮 ベクトル埋め込み生成中...');
    const contentForEmbedding = `
# YouTubeショート台本: ${scriptData.title}

## フック（0-2秒）
${scriptData.hook}

## 共感（3-5秒）
${scriptData.empathy}

## 本題（5-20秒）
${scriptData.body}

## CTA（ラスト5秒）
${scriptData.cta}

## バイラル要素
${scriptData.viral_elements.join(', ')}

## 関連記事
タイトル: ${post.title}
URL: https://nands.tech/posts/${post.slug}
    `.trim();
    
    const embeddings = new OpenAIEmbeddings();
    const embedding = await embeddings.embedSingle(contentForEmbedding);
    console.log('✅ ベクトル埋め込み完了');
    
    // 6. company_youtube_shorts に保存
    const { data: scriptRecord, error: insertError } = await supabase
      .from('company_youtube_shorts')
      .insert({
        fragment_id: fragmentId,
        complete_uri: completeUri,
        page_path: '/shorts',
        related_blog_post_id: postId,
        blog_slug: post.slug,
        content_title: scriptData.title,
        content: contentForEmbedding,
        content_type: 'youtube-short',
        script_title: scriptData.title,
        script_hook: scriptData.hook,
        script_empathy: scriptData.empathy,
        script_body: scriptData.body,
        script_cta: scriptData.cta,
        script_duration_seconds: scriptData.duration_seconds || 30,
        viral_elements: scriptData.viral_elements,
        virality_score: scriptData.virality_score,
        target_emotion: scriptData.target_emotion,
        hook_type: scriptData.hook_type,
        embedding: embedding,
        workflow_status: 'draft',
        status: 'draft',
        source_system: 'auto-generated',
        content_for_embedding: contentForEmbedding
      })
      .select()
      .single();
    
    if (insertError || !scriptRecord) {
      console.error('台本保存エラー:', insertError);
      return NextResponse.json({
        success: false,
        error: '台本の保存に失敗しました'
      }, { status: 500 });
    }
    
    console.log(`✅ 台本保存完了: ID=${scriptRecord.id}`);
    
    // 7. posts.youtube_script_id 更新
    await supabase
      .from('posts')
      .update({
        youtube_script_id: scriptRecord.id,
        youtube_script_status: 'script_generated'
      })
      .eq('id', postId);
    
    // 8. fragment_vectors に同期保存
    await supabase
      .from('fragment_vectors')
      .insert({
        fragment_id: fragmentId,
        complete_uri: completeUri,
        page_path: '/shorts',
        content_type: 'youtube-short',
        content: contentForEmbedding,
        embedding: embedding,
        metadata: {
          related_post_id: postId,
          blog_slug: post.slug,
          script_id: scriptRecord.id
        }
      });
    
    console.log('✅ fragment_vectors 同期完了');
    
    // 9. 成功レスポンス
    return NextResponse.json({
      success: true,
      scriptId: scriptRecord.id,
      fragmentId: fragmentId,
      script: {
        title: scriptData.title,
        hook: scriptData.hook,
        empathy: scriptData.empathy,
        body: scriptData.body,
        cta: scriptData.cta,
        duration: scriptData.duration_seconds || 30
      },
      viralityScore: scriptData.virality_score,
      vectorized: true,
      nextStep: `/admin/youtube-scripts/${scriptRecord.id}`
    });
    
  } catch (error) {
    console.error('台本生成エラー:', error);
    return NextResponse.json({
      success: false,
      error: error.message || '台本生成に失敗しました'
    }, { status: 500 });
  }
}

// システムプロンプト
const YOUTUBE_SCRIPT_SYSTEM_PROMPT = `
あなたはYouTubeショート動画の台本作成のプロフェッショナルです。
与えられたブログ記事を元に、30秒のYouTubeショート動画用の台本を作成してください。

【超重要】4フェーズ構造

1. フック・引き付け（0-2秒）
   - 視聴者の注目を一瞬で獲得
   - インパクトのある一言
   - 例: 「実はこれ知らないと損します」

2. 問題提起・共感ゾーン（3-5秒）
   - 視聴者を「自分ごと化」
   - 例: 「毎日の業務に追われて時間がない人へ」

3. 本題・解決策（5-20秒）
   - 核となる情報を1-3ポイントで提供
   - 具体的な数字や実例
   - 例: 「ChatGPTを使えば問い合わせ対応が70%削減できます」

4. まとめ・行動導線（ラスト5秒）
   - ブログ記事への誘導
   - 例: 「詳しい手順はプロフィールのブログで全公開中」

【制約条件】
- 総文字数: 150-200文字（30秒で話せる量）
- 中学生レベルの日本語
- 専門用語は使わない
- 絵文字は使わない

【出力形式】JSON
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
`;
```

---

## ✅ 5. 実装優先度

### Phase 1: 記事一覧UI拡張（🔥 最優先）

1. **データベーススキーマ確認**
   - `posts.youtube_script_status` 存在確認
   - `posts.youtube_script_id` 存在確認
   
2. **UI拡張**
   - `/app/admin/posts/page.tsx` 修正
   - 動画ステータスカラム追加
   - 台本生成ボタン追加
   
3. **台本生成API実装**
   - `/app/api/admin/generate-youtube-script/route.ts` 新規作成
   - システムプロンプト設計
   - ベクトル埋め込み生成

### Phase 2: 台本レビュー画面

4. `/admin/youtube-scripts/[scriptId]` 実装
5. 台本編集機能
6. プレビュー機能

### Phase 3: 残りのワークフロー

7. YouTube URL入力
8. 記事埋め込み機能

---

## 📝 まとめ

### ✅ この設計のメリット

1. **慎重なアプローチ**: 記事を見てから判断
2. **クオリティ優先**: 台本の品質を最初に確認
3. **既存記事対応**: 過去の記事にも適用可能
4. **テストしやすい**: 1記事ずつ試せる
5. **失敗リスク低減**: 記事生成と台本生成が分離

### 🎯 ユーザーの要望を完全に満たす

- ✅ 記事と同時生成**ではなく**、生成後に台本生成
- ✅ 記事一覧画面（https://nands.tech/admin/posts）にボタン配置
- ✅ まずは台本のクオリティを確認できる

---

**実装を開始してよろしいでしょうか？**

Phase 1から順番に実装しますか？

