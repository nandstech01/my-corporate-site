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

    setIsUploading(true);
    setError(null);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `blog/images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('blog')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error details:', uploadError);
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('blog')
        .getPublicUrl(filePath);

      onImageUploaded(publicUrl);
    } catch (err: any) {
      console.error('Error uploading:', err);
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
            accept="image/*"
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
        <p className="text-red-600 text-sm">{error}</p>
      )}
    </div>
  );
} 