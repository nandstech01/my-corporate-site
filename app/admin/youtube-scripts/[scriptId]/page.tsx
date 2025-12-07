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
  content_type: string; // 'youtube-short' | 'youtube-medium'
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
    sns_metadata?: {
      x_post: string;
      threads_post: string;
      linkedin_title: string;
      linkedin_description: string;
      tiktok_caption: string;
      common_tags: string[];
    };
  };
}

export default function YouTubeScriptDetailPage() {
  const params = useParams();
  const router = useRouter();
  const scriptId = params.scriptId as string;
  
  const [script, setScript] = React.useState<YouTubeScript | null>(null);
  const [shortScript, setShortScript] = React.useState<YouTubeScript | null>(null);
  const [mediumScript, setMediumScript] = React.useState<YouTubeScript | null>(null);
  const [relatedBlogPostId, setRelatedBlogPostId] = React.useState<number | null>(null);
  const [blogPostTitle, setBlogPostTitle] = React.useState<string>('');
  const [blogSlug, setBlogSlug] = React.useState<string>('');
  const [isLoading, setIsLoading] = React.useState(true);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isSubmittingUrl, setIsSubmittingUrl] = React.useState(false);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [youtubeUrl, setYoutubeUrl] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  
  // サムネイル生成用
  const [thumbnailPatterns, setThumbnailPatterns] = React.useState<any[]>([]);
  const [isGeneratingThumbnail, setIsGeneratingThumbnail] = React.useState(false);
  const [selectedPattern, setSelectedPattern] = React.useState<number | null>(null);
  
  // Veo 3.1プロンプト生成用
  const [veoPromptPatterns, setVeoPromptPatterns] = React.useState<any[]>([]);
  const [isGeneratingVeoPrompt, setIsGeneratingVeoPrompt] = React.useState(false);
  const [selectedVeoPattern, setSelectedVeoPattern] = React.useState<number | null>(null);
  
  const supabase = createClientComponentClient<Database>();

  React.useEffect(() => {
    fetchScript();
  }, [scriptId]);

  const fetchScript = async () => {
    try {
      setError(null);
      
      // 現在の台本データ取得
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
      setRelatedBlogPostId(scriptData.related_blog_post_id);

      // ★ 関連する全ての台本を取得（ショート & 中尺）
      if (scriptData.related_blog_post_id) {
        const { data: allScripts, error: allScriptsError } = await supabase
          .from('company_youtube_shorts')
          .select('*')
          .eq('related_blog_post_id', scriptData.related_blog_post_id);

        if (allScriptsError) {
          console.error('関連台本の取得エラー:', allScriptsError);
        } else if (allScripts) {
          // content_typeで分類
          const short = allScripts.find(s => s.content_type === 'youtube-short');
          const medium = allScripts.find(s => s.content_type === 'youtube-medium');
          
          setShortScript(short as unknown as YouTubeScript || null);
          setMediumScript(medium as unknown as YouTubeScript || null);

          console.log('📊 関連台本:', {
            short: short ? `ID: ${short.id}` : '未作成',
            medium: medium ? `ID: ${medium.id}` : '未作成'
          });
        }

        // 関連記事情報取得
        const { data: postData } = await supabase
          .from('posts')
          .select('title, slug')
          .eq('id', scriptData.related_blog_post_id)
          .single();
        
        if (postData) {
          setBlogPostTitle(postData.title);
          setBlogSlug(postData.slug);
        }
      }
    } catch (error: any) {
      console.error('台本取得エラー:', error);
      setError(error.message || '台本の取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  // YouTube URL登録（現在表示中の台本用）
  const handleSubmitUrl = async () => {
    if (!script) return;
    
    if (!youtubeUrl.trim()) {
      alert('YouTube URLを入力してください');
      return;
    }

    const typeName = script.content_type === 'youtube-short' ? 'ショート' : '中尺';
    
    if (!window.confirm(`このYouTube URL（${typeName}）を登録してベクトルリンク化しますか？\n\n登録後は、Fragment Vectorsに同期され、AIの引用対象となります。`)) {
      return;
    }

    setIsSubmittingUrl(true);
    try {
      const response = await fetch('/api/admin/update-youtube-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scriptId: script.id,
          youtubeUrl: youtubeUrl.trim()
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'URL登録に失敗しました');
      }

      alert(`✅ ${typeName}台本のYouTube URLを登録しました！\n\n✨ ベクトルリンク化完了\n🔗 Video ID: ${data.videoId}\n\nFragment Vectorsに同期され、AIの引用対象となりました。`);
      
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

  // 台本生成関数（ショート or 中尺）
  const handleGenerateScript = async (scriptType: 'short' | 'medium') => {
    if (!relatedBlogPostId || !blogPostTitle || !blogSlug) {
      alert('記事情報が不足しています');
      return;
    }

    const typeName = scriptType === 'short' ? 'ショート（30秒）' : '中尺（130秒）';
    
    if (!window.confirm(`${typeName}台本を生成しますか？\n\n記事: ${blogPostTitle}`)) {
      return;
    }

    setIsGenerating(true);
    try {
      // 記事本文を取得
      const { data: postData, error: postError } = await supabase
        .from('posts')
        .select('content')
        .eq('id', relatedBlogPostId)
        .single();

      if (postError || !postData) {
        throw new Error('記事本文の取得に失敗しました');
      }

      const response = await fetch('/api/admin/generate-youtube-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: relatedBlogPostId,
          postSlug: blogSlug,
          postTitle: blogPostTitle,
          postContent: postData.content,
          scriptType: scriptType
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || '台本生成に失敗しました');
      }

      alert(`✅ ${typeName}台本を生成しました！\n\nScript ID: ${data.scriptId}\nAI最適化スコア: ${data.aiOptimizationScore}/100\n\n台本詳細ページに移動します。`);
      
      // 新しく生成された台本の詳細ページにリダイレクト
      router.push(`/admin/youtube-scripts/${data.scriptId}`);
      
    } catch (error: any) {
      console.error('台本生成エラー:', error);
      alert(`台本生成に失敗しました\n\n${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDelete = async () => {
    if (!script) return;
    
    const typeName = script.content_type === 'youtube-short' ? 'ショート（30秒）' : '中尺（130秒）';
    
    if (!window.confirm(`この${typeName}台本を削除してもよろしいですか？\n\n削除後は、記事一覧から再度生成できます。\n\n※ もう一方のタイプの台本は削除されません。`)) {
      return;
    }

    setIsDeleting(true);
    try {
      console.log(`🗑️ ${typeName}台本削除開始: ID ${scriptId}`);
      
      // 1. company_youtube_shortsテーブルから削除（現在の台本のみ）
      const { error: deleteError } = await supabase
        .from('company_youtube_shorts')
        .delete()
        .eq('id', scriptId);

      if (deleteError) throw deleteError;
      console.log(`✅ company_youtube_shorts削除完了`);

      // 2. fragment_vectorsテーブルからも削除（ベクトルリンク解除）
      if (script.youtube_url && script.fragment_id) {
        console.log(`🔗 Fragment Vector削除中: ${script.fragment_id}`);
        const { error: fragmentError } = await supabase
          .from('fragment_vectors')
          .delete()
          .eq('fragment_id', script.fragment_id);

        if (fragmentError) {
          console.error('⚠️ Fragment Vector削除エラー:', fragmentError);
          // エラーは記録するが処理は続行（台本削除は成功している）
        } else {
          console.log(`✅ Fragment Vector削除完了`);
        }
      } else {
        console.log(`💡 Fragment Vectorは未登録（YouTube URL未登録）`);
      }

      alert(`✅ ${typeName}台本を削除しました\n\n記事一覧から再度生成できます。`);
      router.push('/admin/posts');
      
    } catch (error: any) {
      console.error(`❌ ${typeName}台本削除エラー:`, error);
      alert(`台本の削除に失敗しました\n\n${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // サムネイル生成関数
  const handleGenerateThumbnail = async () => {
    if (!script) return;

    setIsGeneratingThumbnail(true);
    setThumbnailPatterns([]);
    setSelectedPattern(null);

    try {
      console.log('🎨 サムネイル文言生成開始');

      // トレンドニュースのタイトルを取得（ある場合）
      let relatedNewsTitle = '';
      // scriptのmetadataからtrendニュースを抽出する試み（実際のデータ構造に応じて調整が必要）
      // ここでは、Hookの最初の部分からニュースを抽出する簡易的な方法を使用
      const hookMatch = script.script_hook.match(/^(.+?)。/);
      if (hookMatch) {
        relatedNewsTitle = hookMatch[1];
      }

      const response = await fetch('/api/admin/generate-thumbnail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scriptTitle: script.script_title,
          scriptHook: script.script_hook,
          scriptBody: script.script_body,
          scriptCta: script.script_cta,
          relatedNewsTitle: relatedNewsTitle,
          scriptType: script.content_type // 'youtube-short' or 'youtube-medium'
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'サムネイル生成に失敗しました');
      }

      console.log(`✅ サムネイル文言生成完了: ${data.patterns.length}パターン`);
      setThumbnailPatterns(data.patterns);
      
      // 最初のパターンを自動選択
      if (data.patterns.length > 0) {
        setSelectedPattern(0);
      }

    } catch (error: any) {
      console.error('❌ サムネイル生成エラー:', error);
      alert(`サムネイル生成に失敗しました\n\n${error.message}`);
    } finally {
      setIsGeneratingThumbnail(false);
    }
  };

  // Veo 3.1プロンプト生成関数
  const handleGenerateVeoPrompt = async () => {
    if (!script) return;

    setIsGeneratingVeoPrompt(true);
    setVeoPromptPatterns([]);
    setSelectedVeoPattern(null);

    try {
      console.log('🎬 Veo 3.1プロンプト生成開始');

      // トレンドニュースのタイトルを取得（ある場合）
      let relatedNews = '';
      const hookMatch = script.script_hook.match(/^(.+?)。/);
      if (hookMatch) {
        relatedNews = hookMatch[1];
      }

      const response = await fetch('/api/admin/generate-veo-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scriptTitle: script.script_title,
          hookText: script.script_hook,
          bodyText: script.script_body,
          ctaText: script.script_cta,
          relatedNews: relatedNews,
          contentType: script.content_type // 'youtube-short' or 'youtube-medium'
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Veo 3.1プロンプト生成に失敗しました');
      }

      console.log(`✅ Veo 3.1プロンプト生成完了: ${data.patterns.length}パターン`);
      setVeoPromptPatterns(data.patterns);
      
      // 最初のパターンを自動選択
      if (data.patterns.length > 0) {
        setSelectedVeoPattern(0);
      }

    } catch (error: any) {
      console.error('❌ Veo 3.1プロンプト生成エラー:', error);
      alert(`Veo 3.1プロンプト生成に失敗しました\n\n${error.message}`);
    } finally {
      setIsGeneratingVeoPrompt(false);
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
          <h1 className="text-2xl font-bold text-white mb-2">🎬 YouTube台本管理</h1>
          <p className="text-gray-300 text-sm">
            {shortScript && mediumScript && '⚡ ショート & 🎯 中尺'}
            {shortScript && !mediumScript && '⚡ ショート（30秒）'}
            {!shortScript && mediumScript && '🎯 中尺（130秒）'}
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="inline-flex items-center px-4 py-2 border border-red-600 text-sm font-medium rounded-md text-white bg-red-700 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
            title={`この${script.content_type === 'youtube-short' ? 'ショート' : '中尺'}台本を削除`}
          >
            {isDeleting ? '削除中...' : '🗑️ 削除'}
          </button>
          <Link
            href="/admin/posts"
            className="inline-flex items-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-white bg-gray-700 hover:bg-gray-600"
          >
            ← 記事一覧
          </Link>
        </div>
      </div>

      {/* 関連記事情報 */}
      {blogPostTitle && blogSlug && (
        <div className="bg-blue-900 border border-blue-700 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-200 mb-1">📝 関連記事</p>
              <p className="text-white font-medium">{blogPostTitle}</p>
            </div>
            <Link
              href={`/posts/${blogSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-300 hover:text-blue-200 underline"
            >
              記事を見る ↗
            </Link>
          </div>
        </div>
      )}

      {/* もう一方のタイプの台本管理 */}
      {script.content_type === 'youtube-short' && !mediumScript && (
        <div className="bg-blue-900/30 border-2 border-blue-600 rounded-lg p-8 mb-8">
          <div className="text-center">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-bold text-white mb-2">中尺台本（130秒）</h3>
            <p className="text-gray-300 mb-6">教育的価値・AI引用最適化の詳細解説動画用台本</p>
            <button
              onClick={() => handleGenerateScript('medium')}
              disabled={isGenerating}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isGenerating ? '生成中...' : '🎯 中尺台本を生成'}
            </button>
          </div>
        </div>
      )}

      {script.content_type === 'youtube-short' && mediumScript && (
        <div className="bg-blue-900 border border-blue-700 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">🎯 中尺台本（130秒）</h3>
              <p className="text-blue-200 text-sm">{mediumScript.script_title}</p>
            </div>
            <Link
              href={`/admin/youtube-scripts/${mediumScript.id}`}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all"
            >
              中尺台本を表示 →
            </Link>
          </div>
        </div>
      )}

      {script.content_type === 'youtube-medium' && !shortScript && (
        <div className="bg-yellow-900/30 border-2 border-yellow-600 rounded-lg p-8 mb-8">
          <div className="text-center">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-bold text-white mb-2">ショート台本（30秒）</h3>
            <p className="text-gray-300 mb-6">バズる要素重視の短尺動画用台本</p>
            <button
              onClick={() => handleGenerateScript('short')}
              disabled={isGenerating}
              className="px-6 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isGenerating ? '生成中...' : '⚡ ショート台本を生成'}
            </button>
          </div>
        </div>
      )}

      {script.content_type === 'youtube-medium' && shortScript && (
        <div className="bg-yellow-900 border border-yellow-700 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">⚡ ショート台本（30秒）</h3>
              <p className="text-yellow-200 text-sm">{shortScript.script_title}</p>
            </div>
            <Link
              href={`/admin/youtube-scripts/${shortScript.id}`}
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-lg transition-all"
            >
              ショート台本を表示 →
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

      {/* 📋 台本全体コピー */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 border-2 border-gray-600 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">📋 台本全体をコピー</h3>
            <p className="text-sm text-gray-400">読み上げ用・編集用にコピーできます</p>
          </div>
          <button
            onClick={() => {
              const fullScript = `【${script.script_title}】

🎣 フック（冒頭）:
${script.script_hook}

${script.script_empathy ? `🤝 共感ゾーン:
${script.script_empathy}

` : ''}💡 本題:
${script.script_body}

🚀 CTA:
${script.script_cta}`;
              navigator.clipboard.writeText(fullScript);
              alert('✅ 台本全体をコピーしました！');
            }}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-lg transition-all"
          >
            📋 全体コピー
          </button>
        </div>
        
        {/* 読み上げ用（改行なし） */}
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-400">読み上げ用（改行なし・連続テキスト）</p>
            <button
              onClick={() => {
                const readScript = `${script.script_hook} ${script.script_empathy || ''} ${script.script_body} ${script.script_cta}`.replace(/\s+/g, ' ').trim();
                navigator.clipboard.writeText(readScript);
                alert('✅ 読み上げ用テキストをコピーしました！');
              }}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded"
            >
              📋 読み上げ用コピー
            </button>
          </div>
          <div className="bg-gray-800 rounded p-3 max-h-24 overflow-y-auto">
            <p className="text-gray-300 text-sm">
              {`${script.script_hook} ${script.script_empathy || ''} ${script.script_body} ${script.script_cta}`.replace(/\s+/g, ' ').trim()}
            </p>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            文字数: {`${script.script_hook} ${script.script_empathy || ''} ${script.script_body} ${script.script_cta}`.replace(/\s+/g, ' ').trim().length}文字
          </p>
        </div>
      </div>

      {/* 4フェーズ台本 */}
      <div className="space-y-6">
        {/* Hook */}
        <div className="bg-red-900 border border-red-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <span className="text-2xl mr-2">🎣</span>
              <h3 className="text-lg font-semibold text-white">1️⃣ Hook（冒頭2秒）</h3>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(script.script_hook);
                alert('✅ Hookをコピーしました！');
              }}
              className="px-3 py-1 bg-red-700 hover:bg-red-600 text-white text-xs rounded"
            >
              📋 コピー
            </button>
          </div>
          <p className="text-white whitespace-pre-wrap mb-4">{script.script_hook}</p>
          <p className="text-xs text-red-300">文字数: {script.script_hook?.length || 0}文字</p>
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
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <span className="text-2xl mr-2">🤝</span>
              <h3 className="text-lg font-semibold text-white">2️⃣ Empathy（3-5秒）</h3>
            </div>
            {script.script_empathy && (
              <button
                onClick={() => {
                  navigator.clipboard.writeText(script.script_empathy);
                  alert('✅ Empathyをコピーしました！');
                }}
                className="px-3 py-1 bg-yellow-700 hover:bg-yellow-600 text-white text-xs rounded"
              >
                📋 コピー
              </button>
            )}
          </div>
          <p className="text-white whitespace-pre-wrap mb-4">{script.script_empathy || '（なし）'}</p>
          <p className="text-xs text-yellow-300">文字数: {script.script_empathy?.length || 0}文字</p>
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
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <span className="text-2xl mr-2">💡</span>
              <h3 className="text-lg font-semibold text-white">3️⃣ Body（5-20秒）</h3>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(script.script_body);
                alert('✅ Bodyをコピーしました！');
              }}
              className="px-3 py-1 bg-blue-700 hover:bg-blue-600 text-white text-xs rounded"
            >
              📋 コピー
            </button>
          </div>
          <p className="text-white whitespace-pre-wrap mb-4">{script.script_body}</p>
          <p className="text-xs text-blue-300">文字数: {script.script_body?.length || 0}文字</p>
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
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <span className="text-2xl mr-2">🚀</span>
              <h3 className="text-lg font-semibold text-white">4️⃣ CTA（ラスト5秒）</h3>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(script.script_cta);
                alert('✅ CTAをコピーしました！');
              }}
              className="px-3 py-1 bg-green-700 hover:bg-green-600 text-white text-xs rounded"
            >
              📋 コピー
            </button>
          </div>
          <p className="text-white whitespace-pre-wrap mb-4">{script.script_cta}</p>
          <p className="text-xs text-green-300">文字数: {script.script_cta?.length || 0}文字</p>
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
              <p className="text-white text-sm">{script.metadata?.youtube_metadata?.youtube_title || 'タイトル未設定'}</p>
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
              <p className="text-white text-sm whitespace-pre-wrap">{script.metadata?.youtube_metadata?.youtube_description || '説明文未設定'}</p>
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
                {(script.metadata?.youtube_metadata?.youtube_tags || []).map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-indigo-700 text-indigo-100 rounded text-xs"
                  >
                    {tag}
                  </span>
                ))}
                {(!script.metadata?.youtube_metadata?.youtube_tags || script.metadata.youtube_metadata.youtube_tags.length === 0) && (
                  <span className="text-indigo-300 text-xs">タグ未設定</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🎨 サムネイル文言生成セクション */}
      <div className="bg-gradient-to-r from-orange-900 to-red-900 border-2 border-orange-500 rounded-lg p-6 mt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">
              🎨 サムネイル文言生成（5パターン）
              {script.content_type === 'youtube-short' && ' - ショート（縦型）'}
              {script.content_type === 'youtube-medium' && ' - 中尺（横型）'}
            </h3>
            
            {script.content_type === 'youtube-short' && (
              <p className="text-sm text-orange-200">
                台本からバズるサムネイル文言を自動生成します（縦型・9:16）<br />
                ✨ タイトル（3-8文字）・サブタイトル（8-12文字）<br />
                🎨 レイアウト・色・強調方法も提案します<br />
                🔥 対立構造、衝撃型、数字インパクト型など - 瞬間的なクリックを誘発
              </p>
            )}
            
            {script.content_type === 'youtube-medium' && (
              <p className="text-sm text-orange-200">
                台本から権威性の高いサムネイル文言を自動生成します（横型・16:9）<br />
                ✨ タイトル（10-20文字）・サブタイトル（15-25文字）<br />
                🎨 レイアウト・色・強調方法も提案します<br />
                🔬 専門用語を積極的に使用し、構造と解決策を明確に示します
              </p>
            )}
          </div>
          <button
            onClick={handleGenerateThumbnail}
            disabled={isGeneratingThumbnail}
            className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isGeneratingThumbnail ? '生成中...' : '🚀 サムネ生成'}
          </button>
        </div>

        {/* 生成結果表示 */}
        {thumbnailPatterns.length > 0 && (
          <div className="mt-6 space-y-4">
            {thumbnailPatterns.map((pattern, idx) => (
              <div
                key={idx}
                className={`${
                  selectedPattern === idx
                    ? 'bg-orange-800 border-2 border-orange-400'
                    : 'bg-orange-900 border border-orange-700'
                } rounded-lg p-5 cursor-pointer hover:border-orange-500 transition-all`}
                onClick={() => setSelectedPattern(idx)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg font-bold text-white">
                        {idx === 0 && '🥇'}
                        {idx === 1 && '🥈'}
                        {idx === 2 && '🥉'}
                        {idx === 3 && '💎'}
                        {idx === 4 && '⚡'}
                      </span>
                      <h4 className="text-md font-semibold text-white">{pattern.name}</h4>
                      <span className="ml-auto px-3 py-1 bg-orange-700 text-orange-100 rounded-full text-xs font-bold">
                        スコア: {pattern.score}/100
                      </span>
                    </div>
                    <p className="text-xs text-orange-200 mb-3">{pattern.reason}</p>
                  </div>
                </div>

                {/* タイトル */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-orange-200">タイトル（{pattern.title.length}文字）</p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(pattern.title);
                        alert('✅ タイトルをコピーしました');
                      }}
                      className="px-3 py-1 bg-orange-700 hover:bg-orange-600 text-white text-xs rounded"
                    >
                      📋 コピー
                    </button>
                  </div>
                  <div className="bg-orange-950 rounded p-3">
                    <p className="text-white text-2xl font-bold">{pattern.title}</p>
                  </div>
                </div>

                {/* サブタイトル */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-orange-200">サブタイトル（{pattern.subtitle.length}文字）</p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(pattern.subtitle);
                        alert('✅ サブタイトルをコピーしました');
                      }}
                      className="px-3 py-1 bg-orange-700 hover:bg-orange-600 text-white text-xs rounded"
                    >
                      📋 コピー
                    </button>
                  </div>
                  <div className="bg-orange-950 rounded p-3">
                    <p className="text-white text-lg font-semibold">{pattern.subtitle}</p>
                  </div>
                </div>

                {/* 🎨 デザイン指示 */}
                {(pattern.layout || pattern.color_scheme || pattern.text_emphasis) && (
                  <div className="mb-3 p-4 bg-orange-950 rounded-lg border border-orange-800">
                    <p className="text-sm font-semibold text-orange-300 mb-3">🎨 デザイン指示</p>
                    <div className="space-y-2 text-xs">
                      {pattern.layout && (
                        <div>
                          <span className="text-orange-400 font-semibold">📐 レイアウト: </span>
                          <span className="text-white">{pattern.layout}</span>
                        </div>
                      )}
                      {pattern.color_scheme && (
                        <div>
                          <span className="text-orange-400 font-semibold">🎨 色: </span>
                          <span className="text-white">{pattern.color_scheme}</span>
                        </div>
                      )}
                      {pattern.text_emphasis && (
                        <div>
                          <span className="text-orange-400 font-semibold">✨ 強調: </span>
                          <span className="text-white">{pattern.text_emphasis}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 両方コピー */}
                <div className="mt-3 pt-3 border-t border-orange-700">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const designInfo = pattern.layout || pattern.color_scheme || pattern.text_emphasis
                        ? `\n\n📐 レイアウト: ${pattern.layout || 'なし'}\n🎨 色: ${pattern.color_scheme || 'なし'}\n✨ 強調: ${pattern.text_emphasis || 'なし'}`
                        : '';
                      const text = `タイトル: ${pattern.title}\n\nサブタイトル: ${pattern.subtitle}${designInfo}`;
                      navigator.clipboard.writeText(text);
                      alert('✅ タイトル & サブタイトル & デザイン指示をコピーしました');
                    }}
                    className="w-full px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold rounded transition-all"
                  >
                    📋 全てコピー
                  </button>
                </div>
              </div>
            ))}

            <div className="mt-6 pt-6 border-t border-orange-700">
              {script.content_type === 'youtube-short' && (
                <p className="text-xs text-orange-200 text-center">
                  ✨ 5パターンから選んで、Vrewでサムネイルを作成しましょう！<br />
                  🎯 最推奨は1番目（対立構造型）- 画面2分割で対立構造を視覚化<br />
                  🎨 レイアウト・色・強調方法を参考にデザインしてください<br />
                  💡 「常識 vs AI」の対立と「常識の敗北」を明確に示すとバズります
                </p>
              )}
              
              {script.content_type === 'youtube-medium' && (
                <p className="text-xs text-orange-200 text-center">
                  ✨ 5パターンから選んで、サムネイルを作成しましょう！<br />
                  🎯 最推奨は1番目（技術解説型）- 脳の図やネットワーク図で専門性を示す<br />
                  🎨 レイアウト・色・強調方法を参考にデザインしてください<br />
                  🔬 専門用語（レリバンスエンジニアリング、ベクトルリンクなど）を大きく表示<br />
                  💡 構造と解決策を明確に示すと信頼性が高まります
                </p>
              )}
            </div>
          </div>
        )}

        {/* 未生成時のメッセージ */}
        {thumbnailPatterns.length === 0 && !isGeneratingThumbnail && (
          <div className="mt-4 text-center py-8">
            <p className="text-orange-200">「サムネ生成」ボタンをクリックして、5パターンのサムネイル文言を生成してください。</p>
          </div>
        )}
      </div>

      {/* 🎬 Veo 3.1 背景動画プロンプト生成 */}
      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 border-2 border-purple-500 rounded-lg p-6 mt-6">
        <h3 className="text-lg font-semibold text-white mb-4">🎬 Veo 3.1 背景動画プロンプト生成（8秒制約）</h3>
        <p className="text-sm text-purple-200 mb-4">
          台本に従ったエンタメ性の高い背景動画プロンプトを生成します。<br />
          <span className="text-yellow-300 font-semibold">⚠️ Veo 3.1 Proプラン: 8秒が上限</span><br />
          横向き（16:9）で生成→縦動画（9:16）にクロップ、音声なし、中央重視の構図
        </p>

        {/* 生成ボタン */}
        <div>
          <button
            onClick={handleGenerateVeoPrompt}
            disabled={isGeneratingVeoPrompt}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-lg shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isGeneratingVeoPrompt ? '生成中...' : '🚀 Veo 3.1プロンプト生成'}
          </button>
        </div>

        {/* 生成結果表示 */}
        {veoPromptPatterns.length > 0 && (
          <div className="mt-6 space-y-4">
            {veoPromptPatterns.map((pattern, idx) => (
              <div
                key={idx}
                className={`${
                  selectedVeoPattern === idx
                    ? 'bg-purple-800 border-2 border-purple-400'
                    : 'bg-purple-900 border border-purple-700'
                } rounded-lg p-5 cursor-pointer hover:border-purple-500 transition-all`}
                onClick={() => setSelectedVeoPattern(idx)}
              >
                {/* パターン名 */}
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-lg font-bold text-white">
                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '💎'} {pattern.pattern_name}
                  </h4>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigator.clipboard.writeText(pattern.prompt);
                      alert(`✅ パターン${idx + 1}のプロンプトをコピーしました`);
                    }}
                    className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded transition-all"
                  >
                    📋 コピー
                  </button>
                </div>

                {/* 特徴 */}
                <div className="mb-3">
                  <span className="text-purple-400 font-semibold">✨ 特徴: </span>
                  <span className="text-white">{pattern.style_note}</span>
                </div>

                {/* 構図のポイント */}
                <div className="mb-3">
                  <span className="text-purple-400 font-semibold">📐 構図: </span>
                  <span className="text-white">{pattern.composition_note}</span>
                </div>

                {/* プロンプト本文 */}
                <div className="mt-3 pt-3 border-t border-purple-700">
                  <div className="bg-black bg-opacity-30 rounded p-3">
                    <p className="text-purple-300 text-xs mb-1 font-mono">Veo 3.1 Prompt:</p>
                    <p className="text-white text-sm font-mono leading-relaxed">{pattern.prompt}</p>
                  </div>
                </div>
              </div>
            ))}

            {/* 推奨メッセージ */}
            <div className="mt-4 bg-purple-800 bg-opacity-50 rounded-lg p-4">
              <p className="text-sm text-purple-200 leading-relaxed">
                💡 <span className="font-semibold">使い方:</span><br />
                1. お好みのパターンを選択してコピー<br />
                2. Veo 3.1（Google AI Studio）でプロンプトを貼り付け<br />
                3. 横向き（16:9）で生成し、動画編集ソフトで縦（9:16）にクロップ<br />
                4. アバター音声と合成して完成！<br />
                <br />
                🎯 推奨は1番目 - 台本の雰囲気に最も近いスタイル<br />
                🎨 エンタメ性を重視したビジュアルで、視聴者を引き込みます
              </p>
            </div>
          </div>
        )}

        {/* 未生成時のメッセージ */}
        {veoPromptPatterns.length === 0 && !isGeneratingVeoPrompt && (
          <div className="mt-4 text-center py-8">
            <p className="text-purple-200">「Veo 3.1プロンプト生成」ボタンをクリックして、5パターンのプロンプトを生成してください。</p>
          </div>
        )}
      </div>

      {/* 🆕 SNS投稿用メタデータ */}
      {script.metadata?.sns_metadata && (
        <div className="bg-gradient-to-r from-blue-900 to-cyan-900 border-2 border-blue-500 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold text-white mb-4">🌐 SNS投稿用文章（6つのSNS展開）</h3>
          <p className="text-sm text-blue-200 mb-6">
            YouTube投稿と同時に6つのSNS（X、Threads、Instagram、Lemon8、LinkedIn、TikTok）でも展開しましょう。それぞれのSNSに最適化された文章を生成しています。
          </p>

          {/* ❶ X（Twitter）用 */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              <h4 className="font-bold text-white">❶ X（Twitter）用投稿（280文字以内）</h4>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(script.metadata!.sns_metadata!.x_post);
                  alert('✅ X投稿文をコピーしました');
                }}
                className="ml-auto px-3 py-1 bg-blue-700 hover:bg-blue-600 text-white text-xs rounded"
              >
                📋 コピー
              </button>
            </div>
            <div className="bg-blue-950 rounded-lg p-4">
              <p className="text-white text-sm whitespace-pre-wrap">{script.metadata?.sns_metadata?.x_post || 'X投稿文未設定'}</p>
              <p className="text-blue-300 text-xs mt-2">文字数: {script.metadata?.sns_metadata?.x_post?.length || 0}/280</p>
            </div>
          </div>

          {/* ❷ Threads用 */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">🧵</span>
              <h4 className="font-bold text-white">❷ Threads用投稿（500文字以内）</h4>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(script.metadata!.sns_metadata!.threads_post);
                  alert('✅ Threads投稿文をコピーしました');
                }}
                className="ml-auto px-3 py-1 bg-blue-700 hover:bg-blue-600 text-white text-xs rounded"
              >
                📋 コピー
              </button>
            </div>
            <div className="bg-blue-950 rounded-lg p-4">
              <p className="text-white text-sm whitespace-pre-wrap">{script.metadata?.sns_metadata?.threads_post || 'Threads投稿文未設定'}</p>
              <p className="text-blue-300 text-xs mt-2">文字数: {script.metadata?.sns_metadata?.threads_post?.length || 0}/500</p>
            </div>
          </div>

          {/* ❸ Instagram用 */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">📸</span>
              <h4 className="font-bold text-white">❸ Instagram投稿</h4>
            </div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-blue-200">キャプション（2200文字以内、視覚的・エモーショナル）</p>
              <button
                onClick={() => {
                  const caption = (script.metadata?.sns_metadata as any)?.instagram_caption;
                  if (caption) {
                    navigator.clipboard.writeText(caption);
                    alert('✅ Instagramキャプションをコピーしました');
                  }
                }}
                className="ml-auto px-3 py-1 bg-blue-700 hover:bg-blue-600 text-white text-xs rounded"
              >
                📋 コピー
              </button>
            </div>
            <div className="bg-blue-950 rounded-lg p-4">
              <p className="text-white text-sm whitespace-pre-wrap">{(script.metadata?.sns_metadata as any)?.instagram_caption || 'Instagramキャプション未設定'}</p>
              <p className="text-blue-300 text-xs mt-2">文字数: {(script.metadata?.sns_metadata as any)?.instagram_caption?.length || 0}/2200</p>
            </div>
          </div>

          {/* ❹ Lemon8用 */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">🍋</span>
              <h4 className="font-bold text-white">❹ Lemon8投稿</h4>
            </div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-blue-200">投稿文（1000文字以内、ライフスタイル・実用的）</p>
              <button
                onClick={() => {
                  const caption = (script.metadata?.sns_metadata as any)?.lemon8_caption;
                  if (caption) {
                    navigator.clipboard.writeText(caption);
                    alert('✅ Lemon8投稿文をコピーしました');
                  }
                }}
                className="ml-auto px-3 py-1 bg-blue-700 hover:bg-blue-600 text-white text-xs rounded"
              >
                📋 コピー
              </button>
            </div>
            <div className="bg-blue-950 rounded-lg p-4">
              <p className="text-white text-sm whitespace-pre-wrap">{(script.metadata?.sns_metadata as any)?.lemon8_caption || 'Lemon8投稿文未設定'}</p>
              <p className="text-blue-300 text-xs mt-2">文字数: {(script.metadata?.sns_metadata as any)?.lemon8_caption?.length || 0}/1000</p>
            </div>
          </div>

          {/* ❺ LinkedIn用 */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              <h4 className="font-bold text-white">❺ LinkedIn用投稿</h4>
            </div>
            
            {/* LinkedInタイトル */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-blue-200">タイトル（100文字以内）</p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(script.metadata!.sns_metadata!.linkedin_title);
                    alert('✅ LinkedInタイトルをコピーしました');
                  }}
                  className="px-3 py-1 bg-blue-700 hover:bg-blue-600 text-white text-xs rounded"
                >
                  📋 コピー
                </button>
              </div>
              <div className="bg-blue-950 rounded-lg p-3">
                <p className="text-white text-sm font-semibold">{script.metadata?.sns_metadata?.linkedin_title || 'LinkedInタイトル未設定'}</p>
                <p className="text-blue-300 text-xs mt-1">文字数: {script.metadata?.sns_metadata?.linkedin_title?.length || 0}/100</p>
              </div>
            </div>
            
            {/* LinkedIn説明文 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-blue-200">説明文（1300文字以内）</p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(script.metadata!.sns_metadata!.linkedin_description);
                    alert('✅ LinkedIn説明文をコピーしました');
                  }}
                  className="px-3 py-1 bg-blue-700 hover:bg-blue-600 text-white text-xs rounded"
                >
                  📋 コピー
                </button>
              </div>
              <div className="bg-blue-950 rounded-lg p-4 max-h-96 overflow-y-auto">
                <p className="text-white text-sm whitespace-pre-wrap">{script.metadata?.sns_metadata?.linkedin_description || 'LinkedIn説明文未設定'}</p>
                <p className="text-blue-300 text-xs mt-2">文字数: {script.metadata?.sns_metadata?.linkedin_description?.length || 0}/1300</p>
              </div>
            </div>
          </div>

          {/* ❻ TikTok用 */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">🎵</span>
              <h4 className="font-bold text-white">❻ TikTok用キャプション（150文字推奨）</h4>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(script.metadata!.sns_metadata!.tiktok_caption);
                  alert('✅ TikTokキャプションをコピーしました');
                }}
                className="ml-auto px-3 py-1 bg-blue-700 hover:bg-blue-600 text-white text-xs rounded"
              >
                📋 コピー
              </button>
            </div>
            <div className="bg-blue-950 rounded-lg p-4">
              <p className="text-white text-sm whitespace-pre-wrap">{script.metadata?.sns_metadata?.tiktok_caption || 'TikTokキャプション未設定'}</p>
              <p className="text-blue-300 text-xs mt-2">文字数: {script.metadata?.sns_metadata?.tiktok_caption?.length || 0} (150文字推奨)</p>
            </div>
          </div>

          {/* 共通タグ */}
          <div className="mt-6 pt-6 border-t border-blue-700">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">🏷️</span>
              <h4 className="font-bold text-white">全SNS共通タグ（YouTube タグと同じ）</h4>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(script.metadata!.sns_metadata!.common_tags.join(', '));
                  alert('✅ 共通タグをコピーしました');
                }}
                className="ml-auto px-3 py-1 bg-blue-700 hover:bg-blue-600 text-white text-xs rounded"
              >
                📋 コピー
              </button>
            </div>
            <div className="bg-blue-950 rounded-lg p-4">
              <div className="flex flex-wrap gap-2">
                {(script.metadata?.sns_metadata?.common_tags || []).map((tag: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-blue-700 text-blue-100 rounded text-xs"
                  >
                    #{tag}
                  </span>
                ))}
                {(!script.metadata?.sns_metadata?.common_tags || script.metadata.sns_metadata.common_tags.length === 0) && (
                  <span className="text-blue-300 text-xs">タグ未設定</span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-blue-700">
            <p className="text-xs text-blue-200 text-center">
              ✨ 6つのSNS（X、Threads、Instagram、Lemon8、LinkedIn、TikTok）に最適化された文章が生成されています<br />
              📋 コピーボタンで簡単に各SNSに投稿できます
            </p>
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

