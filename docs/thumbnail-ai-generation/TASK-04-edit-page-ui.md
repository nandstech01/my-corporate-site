# TASK-04: 記事編集画面UIの実装

## 📌 概要

記事編集画面（`/admin/posts/[slug]/edit`）に
AIサムネイル生成機能のUIを追加します。

## ✅ チェックリスト

- [ ] AIサムネイル生成コンポーネントの作成
- [ ] ベース画像選択UI
- [ ] 生成ボタン・ローディング状態
- [ ] プレビュー表示
- [ ] 既存のImageUploaderとの統合

## 📁 ファイル構成

```
components/
└── admin/
    └── AIThumbnailGenerator.tsx  # 新規作成
    
app/admin/posts/[slug]/edit/
└── page.tsx  # 既存ファイルを修正
```

## 🎨 UI設計

### コンポーネント構成

```
┌─────────────────────────────────────────────────┐
│ サムネイル画像                                    │
├─────────────────────────────────────────────────┤
│ [現在のサムネイル プレビュー]                     │
│                                                 │
│ ┌─────────────┐ ┌─────────────┐                │
│ │ 画像を選択  │ │ AI生成 ✨  │                 │
│ └─────────────┘ └─────────────┘                │
│                                                 │
│ ━━━ AI生成パネル（展開時）━━━                   │
│ ┌─────────────────────────────────────────────┐│
│ │ ベース画像を選択:                           ││
│ │ ┌────┐ ┌────┐ ┌────┐                       ││
│ │ │ A  │ │ B  │ │ C  │                       ││
│ │ └────┘ └────┘ └────┘                       ││
│ │                                             ││
│ │ [🎨 サムネイルを生成]                       ││
│ └─────────────────────────────────────────────┘│
└─────────────────────────────────────────────────┘
```

## 💻 実装コード

### AIThumbnailGenerator.tsx

```typescript
// components/admin/AIThumbnailGenerator.tsx
'use client';

import { useState, useEffect } from 'react';
import { SparklesIcon, PhotoIcon } from '@heroicons/react/24/outline';

interface BaseImage {
  id: number;
  name: string;
  url: string;
  pattern_type: string;
}

interface AIThumbnailGeneratorProps {
  title: string;
  content: string;
  onThumbnailGenerated: (url: string) => void;
  currentThumbnailUrl?: string;
}

export default function AIThumbnailGenerator({
  title,
  content,
  onThumbnailGenerated,
  currentThumbnailUrl
}: AIThumbnailGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [baseImages, setBaseImages] = useState<BaseImage[]>([]);
  const [selectedBaseId, setSelectedBaseId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);

  // ベース画像を取得
  useEffect(() => {
    const fetchBaseImages = async () => {
      try {
        const response = await fetch('/api/thumbnail-base-images');
        if (response.ok) {
          const data = await response.json();
          setBaseImages(data.images || []);
          if (data.images?.length > 0) {
            setSelectedBaseId(data.images[0].id);
          }
        }
      } catch (err) {
        console.error('ベース画像取得エラー:', err);
      }
    };
    fetchBaseImages();
  }, []);

  const handleGenerate = async () => {
    if (!title || !selectedBaseId) {
      setError('タイトルとベース画像を選択してください');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-ai-thumbnail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content: content?.substring(0, 500),
          baseImageId: selectedBaseId,
          style: 'professional'
        })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || '生成に失敗しました');
      }

      setGeneratedUrl(result.url);
      onThumbnailGenerated(result.url);
      setIsOpen(false);
    } catch (err: any) {
      setError(err.message || '生成に失敗しました');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* 展開ボタン */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center px-4 py-2 border border-purple-300 rounded-md shadow-sm text-sm font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
      >
        <SparklesIcon className="w-4 h-4 mr-2" />
        AI生成 ✨
      </button>

      {/* AI生成パネル */}
      {isOpen && (
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-4 space-y-4">
          <h3 className="text-sm font-semibold text-purple-800 flex items-center">
            <SparklesIcon className="w-4 h-4 mr-2" />
            AIサムネイル生成
          </h3>

          {/* ベース画像選択 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ベース画像を選択
            </label>
            <div className="grid grid-cols-3 gap-3">
              {baseImages.map((image) => (
                <button
                  key={image.id}
                  type="button"
                  onClick={() => setSelectedBaseId(image.id)}
                  className={`relative rounded-lg overflow-hidden border-2 transition-all ${
                    selectedBaseId === image.id
                      ? 'border-purple-500 ring-2 ring-purple-300'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <img
                    src={image.url}
                    alt={image.name}
                    className="w-full h-20 object-cover"
                  />
                  {selectedBaseId === image.id && (
                    <div className="absolute inset-0 bg-purple-500/20 flex items-center justify-center">
                      <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded">
                        選択中
                      </span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 生成ボタン */}
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating || !title || !selectedBaseId}
            className="w-full inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                生成中... (最大2分かかります)
              </>
            ) : (
              <>
                <SparklesIcon className="w-5 h-5 mr-2" />
                🎨 サムネイルを生成
              </>
            )}
          </button>

          {/* エラー表示 */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* 生成結果プレビュー */}
          {generatedUrl && (
            <div className="bg-green-50 border border-green-200 rounded-md p-3">
              <p className="text-green-700 text-sm font-medium mb-2">✅ 生成完了!</p>
              <img
                src={generatedUrl}
                alt="生成されたサムネイル"
                className="w-full rounded-md"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

### 記事編集画面への統合

```typescript
// app/admin/posts/[slug]/edit/page.tsx の変更箇所

// インポート追加
import AIThumbnailGenerator from '@/components/admin/AIThumbnailGenerator';

// ImageUploaderの下に追加
<div>
  <label className="block text-sm font-medium text-gray-700">
    サムネイル画像
  </label>
  <div className="space-y-3">
    <ImageUploader
      onImageUploaded={setThumbnailUrl}
      currentImageUrl={thumbnailUrl}
    />
    <AIThumbnailGenerator
      title={title}
      content={content}
      onThumbnailGenerated={setThumbnailUrl}
      currentThumbnailUrl={thumbnailUrl}
    />
  </div>
</div>
```

## 📝 完了条件

1. AIThumbnailGeneratorコンポーネントが作成されている
2. ベース画像が選択できる
3. 生成ボタンでAPIが呼び出される
4. 生成結果がプレビュー表示される
5. 生成された画像がサムネイルとして設定される

## ⏭️ 次のタスク

→ [TASK-05: テスト・動作確認](./TASK-05-testing.md)

