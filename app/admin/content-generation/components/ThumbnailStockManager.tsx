'use client';

import { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { PhotoIcon, TrashIcon, EyeIcon, ArrowUpTrayIcon, CheckCircleIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/lib/database.types';

interface ThumbnailStock {
  id: number;
  filename: string;
  url: string;
  alt_text: string | null;
  usage_count: number;
  is_active: boolean;
  uploaded_at: string;
}

export default function ThumbnailStockManager() {
  const [thumbnails, setThumbnails] = useState<ThumbnailStock[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [isExpanded, setIsExpanded] = useState(false); // 🔽 デフォルトで閉じておく
  const supabase = createClientComponentClient<Database>();

  // サムネイル一覧取得
  const fetchThumbnails = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('thumbnail_stock')
        .select('*')
        .order('uploaded_at', { ascending: true });

      if (error) throw error;
      setThumbnails(data || []);
    } catch (error) {
      console.error('サムネイル取得エラー:', error);
      alert('サムネイル一覧の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThumbnails();
  }, []);

  // ファイルアップロード処理
  const uploadFiles = async (files: File[]) => {
    setUploading(true);
    const newProgress: { [key: string]: number } = {};
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileKey = `${file.name}_${i}`;
        newProgress[fileKey] = 0;
        setUploadProgress({ ...newProgress });

        // ファイル名を安全化
        const fileExt = file.name.split('.').pop();
        const safeFileName = `thumbnail_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
        const filePath = `thumbnails/${safeFileName}`;

        // Supabase Storageにアップロード
        const { error: uploadError, data: uploadData } = await supabase.storage
          .from('blog')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error(`${file.name} アップロードエラー:`, uploadError);
          continue;
        }

        newProgress[fileKey] = 50;
        setUploadProgress({ ...newProgress });

        // 公開URLを取得
        const { data: urlData } = supabase.storage
          .from('blog')
          .getPublicUrl(filePath);

        // DBに保存
        const { error: dbError } = await supabase
          .from('thumbnail_stock')
          .insert({
            filename: safeFileName,
            url: urlData.publicUrl,
            alt_text: `サムネイル画像 ${i + 1}`,
            usage_count: 0,
            is_active: true
          });

        if (dbError) {
          console.error(`${file.name} DB保存エラー:`, dbError);
          continue;
        }

        newProgress[fileKey] = 100;
        setUploadProgress({ ...newProgress });
      }

      // アップロード完了後、一覧を再取得
      await fetchThumbnails();
      alert(`${files.length}件のサムネイル画像をアップロードしました`);
    } catch (error) {
      console.error('アップロードエラー:', error);
      alert('アップロードに失敗しました');
    } finally {
      setUploading(false);
      setUploadProgress({});
    }
  };

  // ドロップゾーン設定
  const onDrop = useCallback((acceptedFiles: File[]) => {
    // 画像ファイルのみ許可
    const imageFiles = acceptedFiles.filter(file => 
      file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024 // 5MB制限
    );
    
    if (imageFiles.length !== acceptedFiles.length) {
      alert('画像ファイル（5MB以下）のみアップロード可能です');
    }
    
    if (imageFiles.length > 0) {
      uploadFiles(imageFiles);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif']
    },
    multiple: true
  });

  // 画像削除
  const deleteThumbnail = async (thumbnail: ThumbnailStock) => {
    if (!confirm(`「${thumbnail.filename}」を削除しますか？`)) return;

    try {
      // Storageから削除
      const filePath = thumbnail.url.split('/').pop();
      if (filePath) {
        await supabase.storage
          .from('blog')
          .remove([`thumbnails/${filePath}`]);
      }

      // DBから削除
      const { error } = await supabase
        .from('thumbnail_stock')
        .delete()
        .eq('id', thumbnail.id);

      if (error) throw error;

      await fetchThumbnails();
      alert('サムネイル画像を削除しました');
    } catch (error) {
      console.error('削除エラー:', error);
      alert('削除に失敗しました');
    }
  };

  // アクティブ状態切り替え
  const toggleActive = async (thumbnail: ThumbnailStock) => {
    try {
      const { error } = await supabase
        .from('thumbnail_stock')
        .update({ is_active: !thumbnail.is_active })
        .eq('id', thumbnail.id);

      if (error) throw error;
      await fetchThumbnails();
    } catch (error) {
      console.error('状態変更エラー:', error);
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
      {/* 🔽 クリック可能なヘッダー */}
      <div 
        className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-700/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
          <PhotoIcon className="w-6 h-6 text-blue-400" />
          <h2 className="text-xl font-semibold text-white">サムネイル画像ストック</h2>
          <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
            {thumbnails.filter(t => t.is_active).length}/150
          </span>
        </div>
        <div className="flex items-center space-x-2">
        <button
            onClick={(e) => {
              e.stopPropagation(); // 親のクリックイベントを止める
              fetchThumbnails();
            }}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
        >
          更新
        </button>
          {isExpanded ? (
            <ChevronUpIcon className="w-6 h-6 text-gray-400" />
          ) : (
            <ChevronDownIcon className="w-6 h-6 text-gray-400" />
          )}
        </div>
      </div>

      {/* 🔽 折りたたみ可能なコンテンツ */}
      {isExpanded && (
        <div className="p-6 pt-0 border-t border-gray-700">

      {/* アップロードエリア */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors mb-6 ${
          isDragActive 
            ? 'border-blue-400 bg-blue-400/10' 
            : 'border-gray-600 hover:border-gray-500'
        }`}
      >
        <input {...getInputProps()} />
        <ArrowUpTrayIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        {uploading ? (
          <div>
            <p className="text-white mb-2">アップロード中...</p>
            <div className="space-y-2">
              {Object.entries(uploadProgress).map(([fileKey, progress]) => (
                <div key={fileKey} className="bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              ))}
            </div>
          </div>
        ) : isDragActive ? (
          <p className="text-blue-400">ファイルをドロップしてください</p>
        ) : (
          <div>
            <p className="text-white mb-2">
              画像をドラッグ&ドロップ、またはクリックしてファイルを選択
            </p>
            <p className="text-gray-400 text-sm">
              JPEG, PNG, WebP, GIF対応（最大5MB、複数選択可）
            </p>
          </div>
        )}
      </div>

      {/* 使用統計 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-700 rounded-lg p-4">
          <p className="text-gray-300 text-sm">総数</p>
          <p className="text-white text-2xl font-bold">{thumbnails.length}</p>
        </div>
        <div className="bg-gray-700 rounded-lg p-4">
          <p className="text-gray-300 text-sm">アクティブ</p>
          <p className="text-green-400 text-2xl font-bold">
            {thumbnails.filter(t => t.is_active).length}
          </p>
        </div>
        <div className="bg-gray-700 rounded-lg p-4">
          <p className="text-gray-300 text-sm">総使用回数</p>
          <p className="text-blue-400 text-2xl font-bold">
            {thumbnails.reduce((sum, t) => sum + t.usage_count, 0)}
          </p>
        </div>
        <div className="bg-gray-700 rounded-lg p-4">
          <p className="text-gray-300 text-sm">平均使用回数</p>
          <p className="text-yellow-400 text-2xl font-bold">
            {thumbnails.length > 0 
              ? Math.round(thumbnails.reduce((sum, t) => sum + t.usage_count, 0) / thumbnails.length * 10) / 10
              : 0
            }
          </p>
        </div>
      </div>

      {/* サムネイル一覧 */}
      {loading ? (
        <div className="text-center text-gray-400 py-8">読み込み中...</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {thumbnails.map((thumbnail) => (
            <div 
              key={thumbnail.id} 
              className={`relative group rounded-lg overflow-hidden border-2 ${
                thumbnail.is_active ? 'border-green-500' : 'border-gray-600'
              }`}
            >
              <img
                src={thumbnail.url}
                alt={thumbnail.alt_text || ''}
                className="w-full h-32 object-cover"
              />
              
              {/* オーバーレイ */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute top-2 right-2 flex space-x-1">
                  <button
                    onClick={() => toggleActive(thumbnail)}
                    className={`p-1 rounded ${
                      thumbnail.is_active 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-500 text-gray-300'
                    }`}
                    title={thumbnail.is_active ? 'アクティブ' : '非アクティブ'}
                  >
                    <CheckCircleIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => window.open(thumbnail.url, '_blank')}
                    className="p-1 bg-blue-500 text-white rounded"
                    title="プレビュー"
                  >
                    <EyeIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteThumbnail(thumbnail)}
                    className="p-1 bg-red-500 text-white rounded"
                    title="削除"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
                <div className="absolute bottom-2 left-2 text-white text-xs">
                  使用: {thumbnail.usage_count}回
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {thumbnails.length === 0 && !loading && (
        <div className="text-center text-gray-400 py-8">
          まだサムネイル画像がアップロードされていません
        </div>
      )}
        </div>
      )}
    </div>
  );
} 