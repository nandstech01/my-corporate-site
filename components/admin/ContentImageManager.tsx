'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/supabase';

type Props = {
  postId: string;
  onImageSelect: (imageId: string) => void;
};

type PostImage = {
  id: number;
  url: string;
  created_at: string;
};

export default function ContentImageManager({ postId, onImageSelect }: Props) {
  const [images, setImages] = useState<PostImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchImages();
  }, [postId]);

  const fetchImages = async () => {
    const { data, error } = await supabase
      .from('post_images')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: false });

    if (error) {
      setError(error.message);
      return;
    }

    setImages(data || []);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `content/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('blog')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('blog')
        .getPublicUrl(filePath);

      const { error: dbError } = await supabase
        .from('post_images')
        .insert([
          {
            post_id: postId,
            url: publicUrl,
          },
        ]);

      if (dbError) {
        throw dbError;
      }

      await fetchImages();
    } catch (err: any) {
      setError(err.message || 'アップロードに失敗しました');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">画像管理</h3>
        <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
          <span className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            {isUploading ? '画像をアップロード中...' : '画像を追加'}
          </span>
          <input
            type="file"
            className="sr-only"
            accept="image/*"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </label>
      </div>

      {error && (
        <p className="text-red-600 text-sm">{error}</p>
      )}

      <div className="grid grid-cols-2 gap-4">
        {images.map((image) => (
          <div
            key={image.id}
            className="relative group cursor-pointer"
            onClick={() => onImageSelect(image.id.toString())}
          >
            <img
              src={image.url}
              alt=""
              className="w-full h-32 object-cover rounded-md"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity rounded-md flex items-center justify-center">
              <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity">
                選択
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 