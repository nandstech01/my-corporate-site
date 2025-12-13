'use client';

import React from 'react';
import { supabase } from '@/lib/supabase/client';
import { VideoJob } from '@/lib/types/videoJob';

interface ScriptMetaTabProps {
  videoJob: VideoJob;
  onUpdate: () => void;
}

export default function ScriptMetaTab({ videoJob, onUpdate }: ScriptMetaTabProps) {
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  const [formData, setFormData] = React.useState({
    title_internal: videoJob.title_internal || '',
    youtube_title: videoJob.youtube_title || '',
    youtube_description: videoJob.youtube_description || '',
    youtube_tags: videoJob.youtube_tags?.join(', ') || '',
    script_raw: videoJob.script_raw || '',
  });

  const handleSave = async () => {
    try {
      setError(null);
      setSuccess(false);
      setIsSaving(true);

      const tagsArray = formData.youtube_tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      const { error: updateError } = await supabase
        .from('video_jobs')
        .update({
          title_internal: formData.title_internal,
          youtube_title: formData.youtube_title,
          youtube_description: formData.youtube_description,
          youtube_tags: tagsArray,
          script_raw: formData.script_raw,
          updated_at: new Date().toISOString(),
        })
        .eq('id', videoJob.id);

      if (updateError) throw updateError;

      setSuccess(true);
      onUpdate();

      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error saving video job:', err);
      setError(err.message || '保存に失敗しました');
    } finally {
      setIsSaving(false);
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
          <p className="font-medium">✓ 保存しました</p>
        </div>
      )}

      {/* 基本情報 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <span className="mr-2">📋</span>
          基本情報
        </h3>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            内部タイトル <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={formData.title_internal}
            onChange={(e) => setFormData({ ...formData, title_internal: e.target.value })}
            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            disabled={isSaving}
          />
          <p className="text-xs text-gray-500 mt-1">
            管理画面で表示される識別用タイトル
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            YouTubeタイトル <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={formData.youtube_title}
            onChange={(e) => setFormData({ ...formData, youtube_title: e.target.value })}
            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            disabled={isSaving}
            maxLength={100}
          />
          <p className="text-xs text-gray-500 mt-1">
            YouTube投稿時に使用されるタイトル（最大100文字） - 現在: {formData.youtube_title.length}/100
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            YouTube説明文
          </label>
          <textarea
            value={formData.youtube_description}
            onChange={(e) => setFormData({ ...formData, youtube_description: e.target.value })}
            rows={6}
            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-y"
            disabled={isSaving}
            maxLength={5000}
          />
          <p className="text-xs text-gray-500 mt-1">
            動画の説明文（最大5000文字） - 現在: {formData.youtube_description.length}/5000
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            YouTubeタグ
          </label>
          <input
            type="text"
            value={formData.youtube_tags}
            onChange={(e) => setFormData({ ...formData, youtube_tags: e.target.value })}
            placeholder="タグ1, タグ2, タグ3"
            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            disabled={isSaving}
          />
          <p className="text-xs text-gray-500 mt-1">
            カンマ区切りで入力してください
          </p>
        </div>
      </div>

      {/* 台本 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <span className="mr-2">📝</span>
          台本
        </h3>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            台本（Raw） <span className="text-red-400">*</span>
          </label>
          <textarea
            value={formData.script_raw}
            onChange={(e) => setFormData({ ...formData, script_raw: e.target.value })}
            rows={16}
            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-y font-mono text-sm"
            disabled={isSaving}
          />
          <p className="text-xs text-gray-500 mt-1">
            アバター動画生成に使用する台本テキスト - 文字数: {formData.script_raw.length}
          </p>
        </div>

        {videoJob.script_struct && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              台本（Struct）- 構造化データ
            </label>
            <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 max-h-96 overflow-y-auto">
              <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap">
                {JSON.stringify(videoJob.script_struct, null, 2)}
              </pre>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              AIによって生成された構造化台本データ（読み取り専用）
            </p>
          </div>
        )}
      </div>

      {/* 保存ボタン */}
      <div className="flex justify-end pt-4 border-t border-gray-700/50">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {isSaving ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              保存中...
            </span>
          ) : (
            '💾 変更を保存'
          )}
        </button>
      </div>
    </div>
  );
}

