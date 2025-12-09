'use client';

import { useState } from 'react';

type Props = {
  onImageUploaded: (url: string) => void;
  currentImageUrl?: string;
};

export default function ImageUploader({ onImageUploaded, currentImageUrl }: Props) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log('📁 File selected:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    setIsUploading(true);
    setError(null);

    try {
      // クライアント側の基本検証
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('ファイルサイズが大きすぎます（10MB以下にしてください）');
      }

      if (!file.type.startsWith('image/')) {
        throw new Error('画像ファイルを選択してください');
      }

      // FormDataを作成してAPI経由でアップロード
      const formData = new FormData();
      formData.append('file', file);

      console.log('🚀 Uploading via API...');

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('❌ Upload error details:', result);
        throw new Error(result.error || 'アップロードに失敗しました');
      }

      console.log('✅ Upload successful:', result);
      console.log('🔗 Public URL:', result.url);

      onImageUploaded(result.url);
    } catch (err: any) {
      console.error('❌ Error uploading:', err);
      setError(err.message || 'アップロードに失敗しました');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
          <span className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            {isUploading ? '画像をアップロード中...' : '画像を選択'}
          </span>
          <input
            type="file"
            className="sr-only"
            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </label>
        {currentImageUrl && (
          <img
            src={currentImageUrl}
            alt="Current thumbnail"
            className="h-12 w-12 object-cover rounded-md"
          />
        )}
      </div>
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-600 text-sm font-medium">エラー</p>
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}
      {isUploading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-blue-600 text-sm">画像をアップロード中です...</p>
        </div>
      )}
    </div>
  );
} 