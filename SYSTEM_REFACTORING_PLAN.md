# 🔧 システムリファクタリング計画 — 安全性・保守性・可視化の向上

**作成日**: 2025年10月12日  
**目的**: システムプロンプトの分離 + 思想RAG管理画面 + モデル最適化

---

## 🔍 調査結果

### **❶ 現在使用しているモデル**

**発見**: 現在は `gpt-4o` を使用
```typescript
// route.ts Line 371
model: 'gpt-4o', // 最新の高性能モデル
```

**ご指摘の通り**: `gpt-4o-mini` を使うべきか検討が必要

**比較**:
| モデル | コスト（1M tokens） | 性能 | 用途 |
|--------|---------------------|------|------|
| gpt-4o | $5.00 | 最高 | 複雑なタスク |
| gpt-4o-mini | $0.15 | 高 | 一般的なタスク |
| gpt-3.5-turbo | $0.50 | 中 | シンプルなタスク |

**差額**: gpt-4o-mini は gpt-4o の **33分の1のコスト**

**推奨**:
```typescript
// ショート動画（30秒）: gpt-4o-mini で十分
scriptType === 'short' ? 'gpt-4o-mini' : 'gpt-4o'

// 理由:
// - ショートは450-500文字、シンプル
// - 中尺は1250-1400文字、複雑
// - 週5回配信 × 2種類 = 週10回 → コスト削減効果大
```

---

## 📂 システムプロンプトの分離設計

### **❶ 現状の問題**

**問題点**:
1. **route.ts が1026行** → 長すぎる
2. **システムプロンプトが巨大** → 600行以上
3. **SNS別の最適化が埋もれている** → 修正しにくい
4. **今後の拡張が困難** → 新しいSNS追加が大変

**解決策**: **プロンプトを別ファイルに分離**

---

### **❷ 新しいディレクトリ構造**

```
/lib/prompts/
├── youtube/
│   ├── short-base.ts          # ショート動画のベースプロンプト
│   ├── medium-base.ts         # 中尺動画のベースプロンプト
│   └── common-rules.ts        # 共通ルール（データ正確性など）
│
├── sns/
│   ├── x-twitter.ts           # X用のプロンプト
│   ├── linkedin.ts            # LinkedIn用
│   ├── threads.ts             # Threads用
│   ├── instagram.ts           # Instagram用
│   ├── tiktok.ts              # TikTok用
│   └── lemon8.ts              # Lemon8用
│
├── kenji-thought/
│   └── integration-prompt.ts  # Kenji思想統合用プロンプト
│
└── index.ts                   # プロンプト統合・エクスポート
```

---

### **❸ 実装例**

#### **/lib/prompts/common-rules.ts**
```typescript
/**
 * 全台本生成で共通のルール
 */
export const COMMON_RULES = `
【絶対厳守】データの正確性ルール:
- ブログ記事に記載されている数字・データのみ使用
- 記事にないデータは絶対に追加しない
- データがない場合は概念的な説明で補う
  × 「実測データあり」「流入3倍」
  ○ 「構造を設計することで」「効率が向上する」

【トーン】:
- カジュアル × プロフェッショナル
- 「〜です」「〜ます」が基本
- 子供っぽい語尾を避ける（「〜だよね」「〜してね」禁止）

【エンジニア視点】:
- 技術的な裏付けを簡潔に示す
- 実務での応用例を含める
- 具体的な数字や事例（記事にあるもののみ）
`;

export const KENJI_THOUGHT_CONTEXT = `
【Kenji Harada AIアーキテクトの思想】（自然に使える場合のみ）:
- 「構造設計」: AIが理解できる構造を設計する
- 「ベクトルリンク」: Fragment化 + Complete URI
- 「Triple RAG」: 3層検索構造（自社・トレンド・教育）

重要: 思想は押し付けず、ブログ記事の内容に忠実に。
`;
```

#### **/lib/prompts/youtube/short-base.ts**
```typescript
import { COMMON_RULES, KENJI_THOUGHT_CONTEXT } from '../common-rules';

/**
 * ショート動画（30秒）用のベースプロンプト
 */
export function getShortScriptBasePrompt(): string {
  return `
あなたは「AIエンジニア目線」で情報を発信するYouTubeショート動画の台本制作エキスパートです。

${COMMON_RULES}

${KENJI_THOUGHT_CONTEXT}

【必須】4つのフェーズ構造と文字数:
全体で450-500文字必要（早口で喋る前提）

1️⃣ Hook（冒頭2秒・110文字以上）
   - 技術的な問題提起で始める
   - インパクトのある一言
   
2️⃣ Empathy（3-5秒・120文字以上）
   - 実務での具体的な悩みに共感
   
3️⃣ Body（5-20秒・180文字以上）
   - 1〜3つの具体的なポイントを解説
   
4️⃣ CTA（ラスト5秒・80文字以上）
   - 明確な行動指示

【重要】JSONフォーマットでのみ返答してください。
`;
}
```

#### **/lib/prompts/sns/x-twitter.ts**
```typescript
/**
 * X（Twitter）用の投稿文生成プロンプト
 */
export const X_TWITTER_PROMPT = `
【X投稿文生成ルール】:

【必須要素】:
1. 冒頭で衝撃的な一文（損失回避型）
   - 例: 「🚨これ知らないとヤバい」
2. 具体的な内容（記事の核心）
3. ブログへの誘導
4. ハッシュタグ2-3個

【構造】:
冒頭1行: 衝撃的な一文
本文2-3行: 核心を凝縮（記事にある情報のみ）
CTA: ブログ誘導

【文字数】: 250-280文字（ギリギリまで使う）

【トーン】: やや挑戦的、バズりやすい

【重要】:
- ブログ記事の内容を元に作成
- 台本の説明ではなく、記事の核心を説明
- 記事にないデータは絶対に使わない
`;
```

#### **/lib/prompts/sns/linkedin.ts**
```typescript
/**
 * LinkedIn用の投稿文生成プロンプト
 */
export const LINKEDIN_PROMPT = `
【LinkedIn投稿文生成ルール】:

【必須要素】:
1. タイトル: ビジネス価値を要約（50文字以内）
2. 冒頭: 課題の明確化
3. 本文:
   - 技術的解決策
   - ビジネスへの影響
   - 実装のポイント
4. CTA: ブログ誘導・議論促進

【構造】:
タイトル: ビジネス価値
冒頭: 課題
本文: 箇条書きで整理
CTA: 詳細はブログで

【文字数】:
- タイトル: 50文字以内
- 本文: 200-300文字

【トーン】: プロフェッショナル、データドリブン

【重要】:
- 技術 → ビジネス価値の流れ
- 記事にある情報のみ使用
`;
```

#### **/lib/prompts/index.ts**
```typescript
/**
 * プロンプト統合・エクスポート
 */
import { COMMON_RULES, KENJI_THOUGHT_CONTEXT } from './common-rules';
import { getShortScriptBasePrompt } from './youtube/short-base';
import { getMediumScriptBasePrompt } from './youtube/medium-base';
import { X_TWITTER_PROMPT } from './sns/x-twitter';
import { LINKEDIN_PROMPT } from './sns/linkedin';
import { THREADS_PROMPT } from './sns/threads';
import { INSTAGRAM_PROMPT } from './sns/instagram';
import { TIKTOK_PROMPT } from './sns/tiktok';
import { LEMON8_PROMPT } from './sns/lemon8';

/**
 * ショート動画用の完全なシステムプロンプトを生成
 */
export function buildShortScriptSystemPrompt(): string {
  return getShortScriptBasePrompt();
}

/**
 * 中尺動画用の完全なシステムプロンプトを生成
 */
export function buildMediumScriptSystemPrompt(): string {
  return getMediumScriptBasePrompt();
}

/**
 * SNS別のプロンプトを取得
 */
export function getSNSPrompt(platform: string): string {
  const prompts: Record<string, string> = {
    'x': X_TWITTER_PROMPT,
    'linkedin': LINKEDIN_PROMPT,
    'threads': THREADS_PROMPT,
    'instagram': INSTAGRAM_PROMPT,
    'tiktok': TIKTOK_PROMPT,
    'lemon8': LEMON8_PROMPT,
  };
  
  return prompts[platform] || '';
}

export {
  COMMON_RULES,
  KENJI_THOUGHT_CONTEXT,
  X_TWITTER_PROMPT,
  LINKEDIN_PROMPT,
  THREADS_PROMPT,
  INSTAGRAM_PROMPT,
  TIKTOK_PROMPT,
  LEMON8_PROMPT,
};
```

#### **/app/api/admin/generate-youtube-script/route.ts（簡潔化）**
```typescript
import { buildShortScriptSystemPrompt, buildMediumScriptSystemPrompt } from '@/lib/prompts';

// プロンプトをscriptTypeで分岐（簡潔に！）
const systemPrompt = scriptType === 'short' 
  ? buildShortScriptSystemPrompt()
  : buildMediumScriptSystemPrompt();

// モデルもscriptTypeで最適化
const model = scriptType === 'short' ? 'gpt-4o-mini' : 'gpt-4o';

const completion = await openai.chat.completions.create({
  model: model,
  messages: messages,
  response_format: { type: 'json_object' },
  temperature: scriptType === 'short' ? 0.7 : 0.8,
  max_tokens: scriptType === 'short' ? 2000 : 10000,
});
```

---

## 🎛️ 思想RAG管理画面の設計

### **❶ 新しい管理画面**

**パス**: `/admin/kenji-thought`

**機能**:
1. 思想ドキュメント一覧
2. ベクトル化ステータス確認
3. 新規追加・編集・削除
4. ベクトル埋め込み情報の可視化

---

### **❷ データベーステーブル**

```sql
CREATE TABLE kenji_harada_architect_knowledge (
  id SERIAL PRIMARY KEY,
  fragment_id TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL, -- 例: "構造設計", "ベクトルリンク", "Triple RAG"
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  content_for_embedding TEXT NOT NULL,
  embedding vector(1536),
  semantic_weight FLOAT DEFAULT 1.0,
  examples TEXT[],
  related_concepts TEXT[],
  status TEXT DEFAULT 'active', -- 'active', 'draft', 'archived'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX ON kenji_harada_architect_knowledge USING ivfflat (embedding vector_cosine_ops);
```

---

### **❸ 管理画面UI設計**

#### **/app/admin/kenji-thought/page.tsx**
```tsx
'use client';

import React from 'react';
import Link from 'next/link';

interface KenjiThought {
  id: number;
  fragment_id: string;
  category: string;
  title: string;
  content: string;
  status: string;
  embedding_status: 'vectorized' | 'pending' | 'error';
  created_at: string;
}

export default function KenjiThoughtManagementPage() {
  const [thoughts, setThoughts] = React.useState<KenjiThought[]>([]);
  
  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* ヘッダー */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">
          🧠 Kenji Harada 思想RAG管理
        </h1>
        <Link
          href="/admin/kenji-thought/new"
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          ➕ 新規追加
        </Link>
      </div>

      {/* 統計情報 */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-800 rounded-lg p-4">
          <p className="text-sm text-gray-400">総数</p>
          <p className="text-2xl font-bold text-white">3</p>
        </div>
        <div className="bg-green-900 rounded-lg p-4">
          <p className="text-sm text-green-200">ベクトル化済み</p>
          <p className="text-2xl font-bold text-white">3</p>
        </div>
        <div className="bg-yellow-900 rounded-lg p-4">
          <p className="text-sm text-yellow-200">使用率</p>
          <p className="text-2xl font-bold text-white">100%</p>
        </div>
      </div>

      {/* 思想一覧 */}
      <div className="space-y-4">
        {thoughts.map((thought) => (
          <div
            key={thought.id}
            className="bg-gray-800 rounded-lg p-6 border border-gray-700"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {thought.title}
                </h3>
                <div className="flex space-x-2">
                  <span className="px-2 py-1 bg-blue-900 text-blue-200 text-xs rounded">
                    {thought.category}
                  </span>
                  {thought.embedding_status === 'vectorized' && (
                    <span className="px-2 py-1 bg-green-900 text-green-200 text-xs rounded">
                      ✓ ベクトル化済み
                    </span>
                  )}
                </div>
              </div>
              <div className="flex space-x-2">
                <Link
                  href={`/admin/kenji-thought/${thought.id}`}
                  className="px-3 py-1 bg-gray-700 text-white text-sm rounded"
                >
                  編集
                </Link>
              </div>
            </div>

            <p className="text-gray-300 text-sm mb-4">
              {thought.content.substring(0, 200)}...
            </p>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-gray-400">Fragment ID</p>
                <p className="text-gray-200 font-mono">{thought.fragment_id}</p>
              </div>
              <div>
                <p className="text-gray-400">ベクトル次元</p>
                <p className="text-gray-200">1536次元</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 📊 リファクタリングの効果

### **Before（現在）**
```
route.ts: 1026行
├─ システムプロンプト: 600行（埋もれている）
├─ ロジック: 426行
└─ 修正が困難
```

### **After（リファクタリング後）**
```
route.ts: 300行（シンプル！）
├─ ロジックのみ
└─ プロンプトはimportで読み込み

/lib/prompts/: プロンプト専用
├─ youtube/: 動画用プロンプト
├─ sns/: SNS別プロンプト
└─ kenji-thought/: 思想統合用

修正が簡単！新しいSNS追加も容易！
```

---

## 💰 コスト削減効果

### **モデル最適化**
```
現在: 全てgpt-4o
週5回 × 2種類（ショート・中尺）= 週10回

1回のコスト:
- gpt-4o: 約500トークン生成 = $0.0025
- gpt-4o-mini: 約500トークン生成 = $0.000075

週のコスト:
- 現在（全てgpt-4o）: $0.025
- 最適化後（ショートのみmini）: $0.0163

月のコスト削減: $0.025（約35%削減）
```

---

## ✅ 実装の優先順位

### **Phase 1（最優先）**: プロンプト分離
1. `/lib/prompts/` ディレクトリ作成
2. common-rules.ts 作成
3. youtube/short-base.ts 作成
4. sns/x-twitter.ts, linkedin.ts, threads.ts 作成
5. index.ts で統合
6. route.ts を簡潔化

**所要時間**: 2-3時間  
**リスク**: 低（既存ロジックは変更しない）

### **Phase 2**: モデル最適化
1. route.ts でモデルを動的選択
2. テスト（品質低下がないか確認）

**所要時間**: 30分  
**リスク**: 低（品質確認が必要）

### **Phase 3**: 思想RAG管理画面
1. データベーステーブル作成
2. `/admin/kenji-thought/page.tsx` 作成
3. API作成（一覧・詳細・追加・編集・削除）
4. ベクトル化ステータスの可視化

**所要時間**: 4-5時間  
**リスク**: 低（新規機能、既存に影響なし）

---

## 🎯 私の推奨

**優先順位**:
1. **Phase 1（プロンプト分離）** - 最優先
   - 理由: 今後の修正が劇的に楽になる
   - リスク: 低
   
2. **Phase 2（モデル最適化）** - 次優先
   - 理由: コスト削減（月約35%）
   - リスク: 低（テストで確認）
   
3. **Phase 3（管理画面）** - その後
   - 理由: 可視化・管理が便利に
   - リスク: 低（新規機能）

**今日中に**: Phase 1（プロンプト分離）を完了できます。

---

**この設計でOKですか？すぐに実装を開始できます。** 🚀

