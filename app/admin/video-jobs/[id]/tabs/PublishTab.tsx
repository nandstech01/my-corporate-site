'use client';

import React from 'react';
import { VideoJob } from '@/lib/types/videoJob';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface PublishTabProps {
  videoJob: VideoJob;
  onUpdate: () => void;
}

export default function PublishTab({ videoJob, onUpdate }: PublishTabProps) {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = React.useState(false);
  const [isPublishing, setIsPublishing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);
  const [hasYouTubeAuth, setHasYouTubeAuth] = React.useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = React.useState(true);

  // YouTube認証状態をチェック
  React.useEffect(() => {
    checkYouTubeAuth();
  }, [user]);

  const checkYouTubeAuth = async () => {
    if (!user) {
      setIsCheckingAuth(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('youtube_auth')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle(); // .single()ではなく.maybeSingle()を使用（レコードがない場合もOK）

      // 406エラーやその他のエラーを無視（認証なしとして扱う）
      if (error) {
        console.warn('YouTube認証確認エラー（正常）:', error.message);
        setHasYouTubeAuth(false);
      } else {
        setHasYouTubeAuth(!!data);
      }
    } catch (err) {
      console.warn('YouTube認証確認エラー（正常）:', err);
      setHasYouTubeAuth(false);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const handleYouTubeAuth = () => {
    // OAuth認証ページにリダイレクト
    window.location.href = '/api/auth/youtube';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const videoFile = files.find((file) => file.type.startsWith('video/'));

    if (!videoFile) {
      setError('動画ファイルをドロップしてください（MP4など）');
      return;
    }

    await uploadFinalVideo(videoFile);
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadFinalVideo(file);
  };

  const uploadFinalVideo = async (file: File) => {
    try {
      setError(null);
      setSuccess(false);
      setIsUploading(true);

      const formData = new FormData();
      formData.append('video', file);

      const response = await fetch(`/api/admin/video-jobs/${videoJob.id}/upload-final`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '動画のアップロードに失敗しました');
      }

      setSuccess(true);
      onUpdate();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error uploading final video:', err);
      setError(err.message || '動画のアップロードに失敗しました');
    } finally {
      setIsUploading(false);
    }
  };

  const handlePublishToYouTube = async () => {
    if (!hasYouTubeAuth) {
      alert('YouTube認証が必要です。先に「YouTube認証」ボタンをクリックしてください。');
      return;
    }

    if (!window.confirm(`YouTubeに動画を投稿しますか？\n\nタイトル: ${videoJob.youtube_title}\n公開設定: 🔒 限定公開（Unlisted）`)) {
      return;
    }

    try {
      setError(null);
      setSuccess(false);
      setIsPublishing(true);

      const response = await fetch(`/api/admin/video-jobs/${videoJob.id}/publish-youtube`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (!response.ok) {
        // 認証が必要な場合
        if (data.requireAuth) {
          alert('YouTube認証の有効期限が切れています。再認証してください。');
          handleYouTubeAuth();
          return;
        }
        throw new Error(data.error || 'YouTubeへの投稿に失敗しました');
      }

      alert(`✅ YouTubeへの投稿が完了しました！\n\nVideo ID: ${data.youtube_video_id}\n公開設定: 🔒 限定公開\n\n${data.youtube_url}`);
      setSuccess(true);
      onUpdate();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error publishing to YouTube:', err);
      setError(err.message || 'YouTubeへの投稿に失敗しました');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-900/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg">
          <p className="font-medium">エラー</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-900/20 border border-green-500/50 text-green-300 px-4 py-3 rounded-lg">
          <p className="font-medium">✓ 成功しました</p>
        </div>
      )}

      {/* 最終動画アップロード */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <span className="mr-2">📹</span>
          最終動画アップロード
        </h3>

        {videoJob.final_video_url ? (
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 space-y-4">
            <div className="flex justify-center">
              <div className="w-64 bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '9/16' }}>
                <video
                  src={videoJob.final_video_url}
                  controls
                  className="w-full h-full object-cover"
                  style={{ aspectRatio: '9/16' }}
                >
                  お使いのブラウザは動画タグをサポートしていません。
                </video>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <a
                href={videoJob.final_video_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-green-400 hover:text-green-300 underline"
              >
                🔗 動画URLを新しいタブで開く
              </a>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(videoJob.final_video_url || '');
                  alert('URLをクリップボードにコピーしました');
                }}
                className="text-sm text-gray-400 hover:text-white transition-colors duration-200"
              >
                📋 URLをコピー
              </button>
            </div>

            <div className="pt-4 border-t border-gray-700/50">
              <label className="block">
                <span className="text-sm text-gray-400 mb-2 block">動画を再アップロードする場合:</span>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileInput}
                  disabled={isUploading}
                  className="block w-full text-sm text-gray-400
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-lg file:border-0
                    file:text-sm file:font-medium
                    file:bg-gray-700 file:text-white
                    hover:file:bg-gray-600
                    file:cursor-pointer cursor-pointer
                    disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </label>
            </div>
          </div>
        ) : (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-all duration-200 ${
              isDragging
                ? 'border-green-500 bg-green-500/10'
                : 'border-gray-600 hover:border-gray-500 bg-gray-800/50'
            }`}
          >
            {isUploading ? (
              <div className="space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
                <p className="text-white font-medium">アップロード中...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-6xl">📹</div>
                <div>
                  <p className="text-white font-medium mb-2">
                    最終動画をここにドラッグ&ドロップ
                  </p>
                  <p className="text-sm text-gray-400">または</p>
                </div>
                <label className="inline-block">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                  <span className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 cursor-pointer inline-block">
                    ファイルを選択
                  </span>
                </label>
                <p className="text-xs text-gray-500 mt-2">対応形式: MP4, MOV, AVI など</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* YouTube認証 */}
      <div className="space-y-4 pt-4 border-t border-gray-700/50">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <span className="mr-2">🔐</span>
          YouTube認証
        </h3>

        {isCheckingAuth ? (
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            <p className="text-gray-400">認証状態を確認中...</p>
          </div>
        ) : hasYouTubeAuth ? (
          <div className="bg-green-900/20 border border-green-500/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">✅</span>
                <p className="text-green-300 font-medium">YouTube認証済み</p>
              </div>
              <button
                onClick={handleYouTubeAuth}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
              >
                再認証
              </button>
            </div>
            <p className="text-xs text-green-200 mt-2">
              YouTubeへの動画アップロードが可能です
            </p>
          </div>
        ) : (
          <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-300 font-medium mb-2">⚠️ YouTube認証が必要です</p>
                <p className="text-xs text-yellow-200">
                  Googleアカウントでログインし、YouTubeへのアップロード権限を許可してください
                </p>
              </div>
              <button
                onClick={handleYouTubeAuth}
                className="px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all whitespace-nowrap"
              >
                🔐 YouTube認証
              </button>
            </div>
          </div>
        )}
      </div>

      {/* YouTube投稿メタデータ確認 */}
      <div className="space-y-4 pt-4 border-t border-gray-700/50">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <span className="mr-2">📋</span>
          投稿メタデータ確認
        </h3>

        <div className="bg-blue-900/20 border border-blue-500/50 rounded-lg p-4 space-y-3">
          <div>
            <p className="text-xs text-blue-300 mb-1">📌 YouTubeタイトル</p>
            <p className="text-white font-medium">{videoJob.youtube_title || '（未設定）'}</p>
          </div>
          
          <div>
            <p className="text-xs text-blue-300 mb-1">📝 YouTube説明文</p>
            <p className="text-gray-300 text-sm whitespace-pre-wrap">
              {videoJob.youtube_description || '（未設定）'}
            </p>
          </div>
          
          <div>
            <p className="text-xs text-blue-300 mb-1">🏷️ YouTubeタグ</p>
            <div className="flex flex-wrap gap-2">
              {videoJob.youtube_tags && videoJob.youtube_tags.length > 0 ? (
                videoJob.youtube_tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-600/30 text-blue-200 text-xs rounded-md"
                  >
                    {tag}
                  </span>
                ))
              ) : (
                <span className="text-gray-400 text-sm">（未設定）</span>
              )}
            </div>
          </div>

          <div className="pt-2 border-t border-blue-500/20">
            <p className="text-xs text-blue-200">
              ⚠️ これらの情報がそのままYouTubeに投稿されます。<br />
              変更する場合は、<strong>「Script & Meta」タブ</strong>で編集してください。
            </p>
          </div>
        </div>
      </div>

      {/* YouTube投稿 */}
      <div className="space-y-4 pt-4 border-t border-gray-700/50">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <span className="mr-2">🚀</span>
          YouTube投稿（限定公開）
        </h3>

        {videoJob.youtube_video_id && videoJob.youtube_url ? (
          <div className="bg-emerald-900/20 border border-emerald-500/50 rounded-lg p-4 space-y-3">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">✅</span>
              <p className="text-emerald-300 font-medium">YouTubeに投稿済みです</p>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Video ID:</span>
                <span className="text-white font-mono">{videoJob.youtube_video_id}</span>
              </div>
              {videoJob.youtube_published_at && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">投稿日時:</span>
                  <span className="text-white">
                    {new Date(videoJob.youtube_published_at).toLocaleString('ja-JP')}
                  </span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-emerald-700/50">
              <a
                href={videoJob.youtube_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
              >
                <span className="mr-2">📺</span>
                YouTubeで視聴
              </a>
            </div>
          </div>
        ) : (
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 space-y-4">
            <p className="text-sm text-gray-300">
              最終動画をYouTubeに限定公開（Unlisted）で投稿します。
            </p>

            {!videoJob.final_video_url && (
              <div className="bg-yellow-900/20 border border-yellow-500/50 text-yellow-300 px-4 py-3 rounded-lg">
                <p className="text-sm">
                  ⚠️ 最終動画がアップロードされていません。先に動画をアップロードしてください。
                </p>
              </div>
            )}

            {!videoJob.youtube_title && (
              <div className="bg-yellow-900/20 border border-yellow-500/50 text-yellow-300 px-4 py-3 rounded-lg">
                <p className="text-sm">
                  ⚠️ YouTubeタイトルが設定されていません。「Script & Meta」タブで設定してください。
                </p>
              </div>
            )}

            {!hasYouTubeAuth && (
              <div className="bg-yellow-900/20 border border-yellow-500/50 text-yellow-300 px-4 py-3 rounded-lg">
                <p className="text-sm">
                  ⚠️ YouTube認証が必要です。上の「YouTube認証」ボタンをクリックしてください。
                </p>
              </div>
            )}

            <button
              onClick={handlePublishToYouTube}
              disabled={isPublishing || !videoJob.final_video_url || !videoJob.youtube_title || !hasYouTubeAuth}
              className="w-full px-6 py-4 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isPublishing ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  YouTube投稿中...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <span className="mr-2">🚀</span>
                  YouTubeに投稿（限定公開）
                </span>
              )}
            </button>

            <p className="text-xs text-gray-500 text-center">
              ※ 投稿後、YouTubeの管理画面で公開設定を変更できます
            </p>
          </div>
        )}
      </div>

      {/* メタデータプレビュー */}
      <div className="space-y-4 pt-4 border-t border-gray-700/50">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <span className="mr-2">📊</span>
          投稿メタデータ
        </h3>

        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 space-y-3 text-sm">
          <div>
            <span className="text-gray-400 block mb-1">タイトル:</span>
            <span className="text-white">{videoJob.youtube_title || '未設定'}</span>
          </div>

          {videoJob.youtube_description && (
            <div>
              <span className="text-gray-400 block mb-1">説明文:</span>
              <p className="text-white whitespace-pre-wrap text-xs bg-gray-900/50 p-3 rounded border border-gray-700 max-h-32 overflow-y-auto">
                {videoJob.youtube_description}
              </p>
            </div>
          )}

          {videoJob.youtube_tags && videoJob.youtube_tags.length > 0 && (
            <div>
              <span className="text-gray-400 block mb-1">タグ:</span>
              <div className="flex flex-wrap gap-2">
                {videoJob.youtube_tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-700/50 text-gray-300 rounded text-xs border border-gray-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div>
            <span className="text-gray-400 block mb-1">公開設定:</span>
            <span className="text-yellow-300 font-medium">🔒 限定公開（Unlisted）</span>
          </div>
        </div>
      </div>
    </div>
  );
}

