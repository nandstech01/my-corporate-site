'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/lib/database.types';

type Props = {
  onImageUploaded: (url: string) => void;
  currentImageUrl?: string;
};

export default function ImageUploader({ onImageUploaded, currentImageUrl }: Props) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient<Database>();

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
      // ファイル検証
      if (file.size > 10 * 1024 * 1024) { // 10MB制限
        throw new Error('ファイルサイズが大きすぎます（10MB以下にしてください）');
      }

      if (!file.type.startsWith('image/')) {
        throw new Error('画像ファイルを選択してください');
      }

      const fileExt = file.name.split('.').pop()?.toLowerCase();
      if (!fileExt || !['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(fileExt)) {
        throw new Error('サポートされていない画像形式です');
      }

      // ファイル名生成（より安全な方法）
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 8);
      const fileName = `${timestamp}-${randomString}.${fileExt}`;
      const filePath = `images/${fileName}`;

      console.log('🚀 Uploading to Storage:', {
        bucket: 'blog',
        filePath: filePath,
        fullUrl: `blog/${filePath}`
      });

      // 認証状態を確認
      const { data: { session } } = await supabase.auth.getSession();
      console.log('🔐 Auth session:', {
        hasSession: !!session,
        userId: session?.user?.id
      });

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('blog')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('❌ Upload error details:', {
          message: uploadError.message,
          name: uploadError.name,
          cause: uploadError.cause,
          stack: uploadError.stack
        });
        throw new Error(`アップロードエラー: ${uploadError.message}`);
      }

      console.log('✅ Upload successful:', uploadData);

      const { data: { publicUrl } } = supabase.storage
        .from('blog')
        .getPublicUrl(filePath);

      console.log('🔗 Public URL generated:', publicUrl);

      onImageUploaded(publicUrl);
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