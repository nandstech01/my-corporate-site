'use client';

import { useState } from 'react';
import { Upload, X } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useAuth } from '@/contexts/AuthContext';
import type { Database } from '@/lib/database.types';

interface ContentImageManagerProps {
  postId: string;
  onImageUpload?: (url: string) => void;
  type?: 'thumbnail' | 'content';
  onContentChange?: (content: string) => void;
  onImageSelect?: (imageId: string) => void;
}

export default function ContentImageManager({ 
  postId, 
  onImageUpload, 
  type = 'content',
  onContentChange,
  onImageSelect
}: ContentImageManagerProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const supabase = createClientComponentClient<Database>();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      // AuthContextから認証状態を確認
      console.log('認証チェック結果:', { 
        user: !!user, 
        userId: user?.id,
        email: user?.email 
      });
      
      if (!user) {
        console.error('No authenticated user found');
        setError('認証が必要です。管理画面にログインしてください。');
        return;
      }
      
      // 管理者権限の確認
      const { data: adminUser, error: adminError } = await supabase
        .from('admin_users')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      if (adminError || !adminUser) {
        console.error('Admin permission check failed:', adminError);
        setError('管理者権限がありません。');
        return;
      }
      
      console.log('認証・権限確認完了:', { 
        userId: user.id, 
        email: user.email,
        isAdmin: true
      });

      const fileExt = file.name.split('.').pop();
      const fileName = `${postId}/${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = type === 'thumbnail' ? `thumbnails/${fileName}` : `post-images/${fileName}`;

      console.log('アップロード開始:', { 
        bucket: 'blog', 
        filePath, 
        fileSize: file.size,
        fileName: file.name 
      });

      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('blog')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error details:', uploadError);
        console.error('Upload error message:', uploadError.message);
        
        if (uploadError.message?.includes('row-level security') || uploadError.message?.includes('Unauthorized')) {
          setError('アップロード権限がありません。管理者権限を確認してください。');
        } else if (uploadError.message?.includes('already exists') || uploadError.message?.includes('duplicate')) {
          setError('同名のファイルが既に存在します。');
        } else {
          setError(`アップロードエラー: ${uploadError.message}`);
        }
        return;
      }

      console.log('アップロード成功:', uploadData);

      const { data: { publicUrl } } = supabase.storage
        .from('blog')
        .getPublicUrl(filePath);

      if (onImageUpload) {
        onImageUpload(publicUrl);
      } else if (type === 'content') {
        // テキストエリアに画像のMarkdownを挿入
        const textarea = document.getElementById('content') as HTMLTextAreaElement;
        if (textarea) {
          // Supabase Storageの相対パスを使用（重複を避ける）
          const imageMarkdown = `![](${filePath})`;
          const { selectionStart, selectionEnd } = textarea;
          const currentContent = textarea.value;
          const newContent = 
            currentContent.substring(0, selectionStart) +
            imageMarkdown + '\n' +
            currentContent.substring(selectionEnd);
          
          // テキストエリアの値を更新
          textarea.value = newContent;
          
          // Reactのstateを更新
          if (onContentChange) {
            onContentChange(newContent);
          }
          
          // カーソル位置を更新
          textarea.setSelectionRange(
            selectionStart + imageMarkdown.length + 1,
            selectionStart + imageMarkdown.length + 1
          );
          textarea.focus();
        }
        setError('画像を挿入しました！');
      }
    } catch (err) {
      setError('画像のアップロードに失敗しました。');
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <label className="relative cursor-pointer">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={isUploading}
            className="hidden"
          />
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Upload className="w-4 h-4" />
            <span>{type === 'thumbnail' ? 'サムネイル' : '本文画像'}をアップロード</span>
          </div>
        </label>
        {isUploading && (
          <div className="flex items-center gap-2 text-gray-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
            <span>アップロード中...</span>
          </div>
        )}
      </div>
      {error && (
        <div className={`flex items-center gap-2 ${error.includes('挿入しました') ? 'text-green-600' : 'text-red-600'}`}>
          <X className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
} 