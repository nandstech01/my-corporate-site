'use client';

import { useState, useEffect } from 'react';
import { SparklesIcon, PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface BaseImage {
  id: number;
  name: string;
  description: string | null;
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
  const [loadingImages, setLoadingImages] = useState(true);

  // ベース画像を取得
  useEffect(() => {
    const fetchBaseImages = async () => {
      setLoadingImages(true);
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
      } finally {
        setLoadingImages(false);
      }
    };
    
    if (isOpen) {
      fetchBaseImages();
    }
  }, [isOpen]);

  const handleGenerate = async () => {
    if (!title) {
      setError('タイトルを入力してください');
      return;
    }

    if (!selectedBaseId) {
      setError('ベース画像を選択してください');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedUrl(null);

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
      
      // 成功メッセージ
      console.log(`✅ サムネイル生成完了 (${result.generationTime}ms)`);
    } catch (err: any) {
      console.error('サムネイル生成エラー:', err);
      setError(err.message || '生成に失敗しました');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUseGenerated = () => {
    if (generatedUrl) {
      console.log('🎨 [AIThumbnail] この画像を使用:', generatedUrl);
      onThumbnailGenerated(generatedUrl);
      // パネルは閉じるが、generatedUrlは保持
      setIsOpen(false);
      console.log('✅ [AIThumbnail] onThumbnailGenerated呼び出し完了');
    } else {
      console.warn('⚠️ [AIThumbnail] generatedUrlが空です');
    }
  };

  return (
    <div className="mt-3">
      {/* 展開ボタン */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center px-4 py-2 border border-purple-300 rounded-md shadow-sm text-sm font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
      >
        <SparklesIcon className="w-4 h-4 mr-2" />
        {isOpen ? 'AI生成を閉じる' : 'AI生成 ✨'}
      </button>

      {/* AI生成パネル */}
      {isOpen && (
        <div className="mt-4 bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-5 space-y-4 shadow-sm">
          {/* ヘッダー */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-purple-800 flex items-center">
              <SparklesIcon className="w-5 h-5 mr-2" />
              AIサムネイル生成（ナノバナナプロ）
            </h3>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* 説明 */}
          <p className="text-xs text-gray-600">
            ベース画像を選択し、記事タイトルを元にAIがサムネイルを生成します。
            人物の顔は維持され、テキストと背景が調整されます。
          </p>

          {/* ベース画像選択 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ベース画像を選択 <span className="text-red-500">*</span>
            </label>
            
            {loadingImages ? (
              <div className="text-center py-4 text-gray-500 text-sm">
                読み込み中...
              </div>
            ) : baseImages.length === 0 ? (
              <div className="text-center py-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <PhotoIcon className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <p className="text-yellow-700 text-sm">
                  ベース画像が登録されていません
                </p>
                <p className="text-yellow-600 text-xs mt-1">
                  管理画面でベース画像を追加してください
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {baseImages.map((image) => (
                  <button
                    key={image.id}
                    type="button"
                    onClick={() => setSelectedBaseId(image.id)}
                    className={`relative rounded-lg overflow-hidden border-2 transition-all ${
                      selectedBaseId === image.id
                        ? 'border-purple-500 ring-2 ring-purple-300 shadow-md'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={image.name}
                      className="w-full h-24 object-cover"
                    />
                    <div className={`absolute inset-0 transition-all ${
                      selectedBaseId === image.id
                        ? 'bg-purple-500/20'
                        : 'bg-transparent hover:bg-black/10'
                    }`}>
                      {selectedBaseId === image.id && (
                        <span className="absolute bottom-1 left-1 bg-purple-600 text-white text-xs px-2 py-0.5 rounded">
                          選択中
                        </span>
                      )}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 truncate">
                      {image.name}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* タイトルプレビュー */}
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <p className="text-xs text-gray-500 mb-1">生成に使用するタイトル:</p>
            <p className="text-sm font-medium text-gray-800 truncate">
              {title || '（タイトルを入力してください）'}
            </p>
          </div>

          {/* 生成ボタン */}
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating || !title || !selectedBaseId || baseImages.length === 0}
            className="w-full inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-700 text-sm font-medium">エラー</p>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          )}

          {/* 生成結果プレビュー */}
          {generatedUrl && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
              <p className="text-green-700 text-sm font-medium flex items-center">
                ✅ 生成完了!
              </p>
              <img
                src={generatedUrl}
                alt="生成されたサムネイル"
                className="w-full rounded-lg shadow-md"
              />
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={handleUseGenerated}
                  className="flex-1 px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                >
                  この画像を使用
                </button>
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="px-3 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
                >
                  再生成
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

