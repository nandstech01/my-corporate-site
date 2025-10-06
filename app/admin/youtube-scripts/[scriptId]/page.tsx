'use client';

import React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/lib/database.types';

interface YouTubeScript {
  id: number;
  fragment_id: string;
  complete_uri: string;
  page_path: string;
  related_blog_post_id: number | null;
  blog_slug: string | null;
  script_title: string;
  script_hook: string;
  script_empathy: string;
  script_body: string;
  script_cta: string;
  script_duration_seconds: number;
  visual_instructions: {
    hook: string[];
    empathy: string[];
    body: string[];
    cta: string[];
  };
  text_overlays: string[];
  background_music_suggestion: string;
  viral_elements: string[];
  virality_score: number;
  target_emotion: string;
  hook_type: string;
  ai_optimization_score: number;
  workflow_status: string;
  status: string;
  youtube_url: string | null;
  youtube_video_id: string | null;
  created_at: string;
  published_at: string | null;
  metadata?: {
    youtube_metadata?: {
      youtube_title: string;
      youtube_description: string;
      youtube_tags: string[];
    };
  };
}

export default function YouTubeScriptDetailPage() {
  const params = useParams();
  const router = useRouter();
  const scriptId = params.scriptId as string;
  
  const [script, setScript] = React.useState<YouTubeScript | null>(null);
  const [blogPostTitle, setBlogPostTitle] = React.useState<string>('');
  const [isLoading, setIsLoading] = React.useState(true);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isSubmittingUrl, setIsSubmittingUrl] = React.useState(false);
  const [youtubeUrl, setYoutubeUrl] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  
  const supabase = createClientComponentClient<Database>();

  React.useEffect(() => {
    fetchScript();
  }, [scriptId]);

  const fetchScript = async () => {
    try {
      setError(null);
      
      // 台本データ取得
      const { data: scriptData, error: scriptError } = await supabase
        .from('company_youtube_shorts')
        .select('*')
        .eq('id', scriptId)
        .single();

      if (scriptError) throw scriptError;
      if (!scriptData) {
        throw new Error('台本が見つかりません');
      }

      setScript(scriptData as unknown as YouTubeScript);

      // 関連記事タイトル取得
      if (scriptData.related_blog_post_id) {
        const { data: postData } = await supabase
          .from('posts')
          .select('title')
          .eq('id', scriptData.related_blog_post_id)
          .single();
        
        if (postData) {
          setBlogPostTitle(postData.title);
        }
      }
    } catch (error: any) {
      console.error('台本取得エラー:', error);
      setError(error.message || '台本の取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitUrl = async () => {
    if (!youtubeUrl.trim()) {
      alert('YouTube URLを入力してください');
      return;
    }

    if (!window.confirm('このYouTube URLを登録してベクトルリンク化しますか？\n\n登録後は、Fragment Vectorsに同期され、AIの引用対象となります。')) {
      return;
    }

    setIsSubmittingUrl(true);
    try {
      const response = await fetch('/api/admin/update-youtube-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scriptId: parseInt(scriptId),
          youtubeUrl: youtubeUrl.trim()
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'URL登録に失敗しました');
      }

      alert(`✅ YouTube URLを登録しました！\n\n✨ ベクトルリンク化完了\n🔗 Video ID: ${data.videoId}\n\nFragment Vectorsに同期され、AIの引用対象となりました。`);
      
      // データを再取得して表示を更新
      await fetchScript();
      setYoutubeUrl('');
      
    } catch (error: any) {
      console.error('URL登録エラー:', error);
      alert(`URL登録に失敗しました\n\n${error.message}`);
    } finally {
      setIsSubmittingUrl(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('この台本を削除してもよろしいですか？\n\n削除後は、記事一覧から再度台本を生成できます。')) {
      return;
    }

    setIsDeleting(true);
    try {
      // 1. company_youtube_shortsテーブルから削除
      const { error: deleteError } = await supabase
        .from('company_youtube_shorts')
        .delete()
        .eq('id', scriptId);

      if (deleteError) throw deleteError;

      // 2. postsテーブルのyoutube_script_idをクリア
      if (script?.related_blog_post_id) {
        const { error: updateError } = await supabase
          .from('posts')
          .update({
            youtube_script_id: null,
            youtube_script_status: null
          })
          .eq('id', script.related_blog_post_id);

        if (updateError) {
          console.error('記事テーブル更新エラー:', updateError);
        }
      }

      // 3. fragment_vectorsテーブルからも削除
      const { error: fragmentError } = await supabase
        .from('fragment_vectors')
        .delete()
        .eq('fragment_id', script?.fragment_id);

      if (fragmentError) {
        console.error('Fragment Vector削除エラー:', fragmentError);
      }

      alert('✅ 台本を削除しました\n\n記事一覧から再度台本を生成できます。');
      router.push('/admin/posts');
      
    } catch (error: any) {
      console.error('台本削除エラー:', error);
      alert(`台本の削除に失敗しました\n\n${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="text-white">読み込み中...</div>
        </div>
      </div>
    );
  }

  if (error || !script) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error || '台本が見つかりません'}</p>
          <Link
            href="/admin/posts"
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            ← 記事一覧に戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      {/* ヘッダー */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">🎬 YouTubeショート台本</h1>
          <p className="text-gray-300 text-sm">Script ID: {scriptId}</p>
        </div>
        <div className="flex space-x-2">
          <Link
            href="/admin/posts"
            className="inline-flex items-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-white bg-gray-700 hover:bg-gray-600"
          >
            ← 記事一覧
          </Link>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
          >
            {isDeleting ? '削除中...' : '🗑️ 台本削除'}
          </button>
        </div>
      </div>

      {/* 関連記事情報 */}
      {blogPostTitle && script.blog_slug && (
        <div className="bg-blue-900 border border-blue-700 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-200 mb-1">📝 関連記事</p>
              <p className="text-white font-medium">{blogPostTitle}</p>
            </div>
            <Link
              href={`/posts/${script.blog_slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-300 hover:text-blue-200 underline"
            >
              記事を見る ↗
            </Link>
          </div>
        </div>
      )}

      {/* AI最適化スコア */}
      <div className={`${script.youtube_url ? 'bg-green-900 border-green-700' : 'bg-yellow-900 border-yellow-700'} border rounded-lg p-4 mb-6`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-green-200 mb-1">🎯 AI最適化スコア</p>
            <p className="text-2xl font-bold text-white">{script.ai_optimization_score || 50}/100</p>
            <p className="text-xs text-green-200 mt-1">
              {script.youtube_url 
                ? '✅ Fragment ID, Complete URI, ベクトル埋め込み完備' 
                : '⏳ Draft状態（URL登録後に95点）'
              }
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-green-200">バイラリティスコア</p>
            <p className="text-xl font-bold text-white">{script.virality_score}/100</p>
          </div>
        </div>
      </div>

      {/* 台本メタデータ */}
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">📊 台本情報</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-400">タイトル</p>
            <p className="text-white font-medium">{script.script_title}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">予想尺</p>
            <p className="text-white font-medium">{script.script_duration_seconds}秒</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">ターゲット感情</p>
            <p className="text-white font-medium">{script.target_emotion}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">フックタイプ</p>
            <p className="text-white font-medium">{script.hook_type}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">BGM提案</p>
            <p className="text-white font-medium">{script.background_music_suggestion}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">ステータス</p>
            <p className="text-white font-medium">{script.workflow_status}</p>
          </div>
        </div>
      </div>

      {/* 4フェーズ台本 */}
      <div className="space-y-6">
        {/* Hook */}
        <div className="bg-red-900 border border-red-700 rounded-lg p-6">
          <div className="flex items-center mb-3">
            <span className="text-2xl mr-2">🎣</span>
            <h3 className="text-lg font-semibold text-white">1️⃣ Hook（冒頭2秒）</h3>
          </div>
          <p className="text-white whitespace-pre-wrap mb-4">{script.script_hook}</p>
          {script.visual_instructions.hook && script.visual_instructions.hook.length > 0 && (
            <div className="mt-4 pt-4 border-t border-red-600">
              <p className="text-sm text-red-200 mb-2">🎬 視覚的指示</p>
              <ul className="list-disc list-inside space-y-1">
                {script.visual_instructions.hook.map((instruction, idx) => (
                  <li key={idx} className="text-red-100 text-sm">{instruction}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Empathy */}
        <div className="bg-yellow-900 border border-yellow-700 rounded-lg p-6">
          <div className="flex items-center mb-3">
            <span className="text-2xl mr-2">🤝</span>
            <h3 className="text-lg font-semibold text-white">2️⃣ Empathy（3-5秒）</h3>
          </div>
          <p className="text-white whitespace-pre-wrap mb-4">{script.script_empathy}</p>
          {script.visual_instructions.empathy && script.visual_instructions.empathy.length > 0 && (
            <div className="mt-4 pt-4 border-t border-yellow-600">
              <p className="text-sm text-yellow-200 mb-2">🎬 視覚的指示</p>
              <ul className="list-disc list-inside space-y-1">
                {script.visual_instructions.empathy.map((instruction, idx) => (
                  <li key={idx} className="text-yellow-100 text-sm">{instruction}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="bg-blue-900 border border-blue-700 rounded-lg p-6">
          <div className="flex items-center mb-3">
            <span className="text-2xl mr-2">💡</span>
            <h3 className="text-lg font-semibold text-white">3️⃣ Body（5-20秒）</h3>
          </div>
          <p className="text-white whitespace-pre-wrap mb-4">{script.script_body}</p>
          {script.visual_instructions.body && script.visual_instructions.body.length > 0 && (
            <div className="mt-4 pt-4 border-t border-blue-600">
              <p className="text-sm text-blue-200 mb-2">🎬 視覚的指示</p>
              <ul className="list-disc list-inside space-y-1">
                {script.visual_instructions.body.map((instruction, idx) => (
                  <li key={idx} className="text-blue-100 text-sm">{instruction}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="bg-green-900 border border-green-700 rounded-lg p-6">
          <div className="flex items-center mb-3">
            <span className="text-2xl mr-2">🚀</span>
            <h3 className="text-lg font-semibold text-white">4️⃣ CTA（ラスト5秒）</h3>
          </div>
          <p className="text-white whitespace-pre-wrap mb-4">{script.script_cta}</p>
          {script.visual_instructions.cta && script.visual_instructions.cta.length > 0 && (
            <div className="mt-4 pt-4 border-t border-green-600">
              <p className="text-sm text-green-200 mb-2">🎬 視覚的指示</p>
              <ul className="list-disc list-inside space-y-1">
                {script.visual_instructions.cta.map((instruction, idx) => (
                  <li key={idx} className="text-green-100 text-sm">{instruction}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* テキストオーバーレイ */}
      {script.text_overlays && script.text_overlays.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold text-white mb-4">📝 テキストオーバーレイ</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {script.text_overlays.map((overlay, idx) => (
              <div key={idx} className="bg-gray-700 rounded p-3">
                <p className="text-white text-sm">{overlay}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* バイラル要素 */}
      {script.viral_elements && script.viral_elements.length > 0 && (
        <div className="bg-purple-900 border border-purple-700 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold text-white mb-4">🔥 バイラル要素</h3>
          <div className="flex flex-wrap gap-2">
            {script.viral_elements.map((element, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-purple-700 text-purple-100 rounded-full text-sm"
              >
                {element}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ベクトルリンク情報（YouTube URL登録後のみ表示） */}
      {script.youtube_url && script.complete_uri && (
        <div className="bg-gradient-to-r from-green-900 to-emerald-900 border-2 border-green-500 rounded-lg p-6 mt-6">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <h3 className="text-lg font-semibold text-white">✅ ベクトルリンク情報（AIの引用対象）</h3>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-green-200">Fragment ID</p>
              <p className="text-white text-sm font-mono bg-green-950 px-3 py-2 rounded">{script.fragment_id}</p>
            </div>
            <div>
              <p className="text-sm text-green-200">Complete URI</p>
              <p className="text-white text-sm font-mono bg-green-950 px-3 py-2 rounded break-all">{script.complete_uri}</p>
            </div>
            <div>
              <p className="text-sm text-green-200">公開日時</p>
              <p className="text-white text-sm">{script.published_at ? new Date(script.published_at).toLocaleString('ja-JP') : '未公開'}</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-green-700">
            <p className="text-xs text-green-200">
              ✅ Fragment Vectorsに同期済み - AIの引用対象として活用されています<br />
              🔍 Mike King理論に基づく完全なベクトルリンク構造を実装
            </p>
          </div>
        </div>
      )}

      {/* YouTube投稿用メタデータ */}
      {script.metadata?.youtube_metadata && (
        <div className="bg-indigo-900 border border-indigo-700 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold text-white mb-4">📺 YouTube投稿用メタデータ</h3>
          
          {/* YouTubeタイトル */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-indigo-200">タイトル（100文字以内）</p>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(script.metadata!.youtube_metadata!.youtube_title);
                  alert('✅ タイトルをコピーしました');
                }}
                className="px-3 py-1 bg-indigo-700 hover:bg-indigo-600 text-white text-xs rounded"
              >
                📋 コピー
              </button>
            </div>
            <div className="bg-indigo-800 rounded p-3">
              <p className="text-white text-sm">{script.metadata.youtube_metadata.youtube_title}</p>
            </div>
          </div>

          {/* YouTube説明文 */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-indigo-200">説明文（300-500文字）</p>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(script.metadata!.youtube_metadata!.youtube_description);
                  alert('✅ 説明文をコピーしました');
                }}
                className="px-3 py-1 bg-indigo-700 hover:bg-indigo-600 text-white text-xs rounded"
              >
                📋 コピー
              </button>
            </div>
            <div className="bg-indigo-800 rounded p-3">
              <p className="text-white text-sm whitespace-pre-wrap">{script.metadata.youtube_metadata.youtube_description}</p>
            </div>
          </div>

          {/* YouTubeタグ */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-indigo-200">タグ（10-15個）</p>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(script.metadata!.youtube_metadata!.youtube_tags.join(', '));
                  alert('✅ タグをコピーしました');
                }}
                className="px-3 py-1 bg-indigo-700 hover:bg-indigo-600 text-white text-xs rounded"
              >
                📋 コピー
              </button>
            </div>
            <div className="bg-indigo-800 rounded p-3">
              <div className="flex flex-wrap gap-2">
                {script.metadata.youtube_metadata.youtube_tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-indigo-700 text-indigo-100 rounded text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* YouTube URL登録フォーム */}
      {!script.youtube_url && (
        <div className="bg-gradient-to-r from-purple-900 to-pink-900 border border-purple-700 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold text-white mb-4">📺 YouTube URL登録</h3>
          <p className="text-purple-200 text-sm mb-4">
            動画をYouTubeに投稿したら、URLを登録してベクトルリンク化しましょう
          </p>
          
          <div className="space-y-3">
            <input
              type="text"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://youtube.com/shorts/xxxxx または https://youtu.be/xxxxx"
              className="w-full px-4 py-3 bg-purple-800 border border-purple-600 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            
            <button
              onClick={handleSubmitUrl}
              disabled={isSubmittingUrl || !youtubeUrl.trim()}
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isSubmittingUrl ? '登録中...' : '🚀 YouTube URL登録 & ベクトルリンク化'}
            </button>
          </div>

          <div className="mt-4 pt-4 border-t border-purple-700">
            <p className="text-xs text-purple-200">
              ✨ URL登録により、Fragment Vectorsに同期され、AIの引用対象となります
            </p>
          </div>
        </div>
      )}

      {/* 登録済みURL表示 */}
      {script.youtube_url && (
        <div className="bg-green-900 border border-green-700 rounded-lg p-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">✅ YouTube URL登録済み</h3>
            <span className="px-3 py-1 bg-green-700 text-green-100 rounded-full text-xs font-semibold">
              ベクトルリンク化済み
            </span>
          </div>

          {/* サムネイル表示 */}
          {script.youtube_video_id && (
            <div className="mb-4">
              <p className="text-sm text-green-200 mb-2">サムネイルプレビュー</p>
              <img
                src={`https://img.youtube.com/vi/${script.youtube_video_id}/maxresdefault.jpg`}
                alt={script.script_title}
                className="w-full rounded-lg shadow-lg"
                onError={(e) => {
                  // maxresdefault が存在しない場合は hqdefault にフォールバック
                  e.currentTarget.src = `https://img.youtube.com/vi/${script.youtube_video_id}/hqdefault.jpg`;
                }}
              />
            </div>
          )}
          
          <div className="space-y-3">
            <div>
              <p className="text-sm text-green-200 mb-1">YouTube URL</p>
              <a
                href={script.youtube_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-green-200 underline break-all"
              >
                {script.youtube_url}
              </a>
            </div>
            
            {script.youtube_video_id && (
              <div>
                <p className="text-sm text-green-200 mb-1">Video ID</p>
                <p className="text-white font-mono text-sm">{script.youtube_video_id}</p>
              </div>
            )}

            {script.published_at && (
              <div>
                <p className="text-sm text-green-200 mb-1">公開日時</p>
                <p className="text-white text-sm">{new Date(script.published_at).toLocaleString('ja-JP')}</p>
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-green-700">
            <p className="text-xs text-green-200">
              ✅ Fragment Vectorsに同期済み - AIの引用対象として活用されています<br />
              🎨 サムネイル・動画URLもSchema.orgに含まれ、マルチモーダルAI対応済み
            </p>
          </div>
        </div>
      )}

      {/* 注意事項 */}
      <div className="bg-yellow-900 border border-yellow-700 rounded-lg p-6 mt-6">
        <h3 className="text-lg font-semibold text-white mb-3">⚠️ ワークフロー</h3>
        <ol className="list-decimal list-inside space-y-2 text-yellow-100">
          <li>この台本を元に動画を編集してください</li>
          <li>YouTubeにショート動画として投稿してください</li>
          <li className={script.youtube_url ? 'line-through opacity-50' : ''}>
            投稿URLを取得したら、上のフォームからURL登録してください
          </li>
          <li>記事詳細ページに動画を埋め込んでください（任意）</li>
        </ol>
        <p className="text-sm text-yellow-200 mt-4">
          ※ 台本の内容が気に入らない場合は、削除して再生成できます
        </p>
      </div>
    </div>
  );
}

