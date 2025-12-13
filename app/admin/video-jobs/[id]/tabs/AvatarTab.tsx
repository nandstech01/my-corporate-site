'use client';

import React from 'react';
import { supabase } from '@/lib/supabase/client';
import { VideoJob } from '@/lib/types/videoJob';

interface AvatarTabProps {
  videoJob: VideoJob;
  onUpdate: () => void;
}

export default function AvatarTab({ videoJob, onUpdate }: AvatarTabProps) {
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [audioStatus, setAudioStatus] = React.useState<string>('');
  const [formData, setFormData] = React.useState({
    voice_url: videoJob.voice?.url || '',
    voice_id: videoJob.voice?.voiceId || '',
  });

  // Step 1: 音声生成
  const handleGenerateAudio = async () => {
    try {
      setError(null);
      setIsGeneratingAudio(true);
      setAudioStatus('音声を生成中...');

      if (!videoJob.script_raw || !videoJob.script_raw.trim()) {
        throw new Error('台本が入力されていません');
      }

      const defaultVoiceId = 'pMsXgVXv3BLzUgSXRplE'; // ElevenLabs: Takeshi
      const voiceIdToUse = formData.voice_id || videoJob.voice?.voiceId || defaultVoiceId;

      const response = await fetch(`/api/admin/video-jobs/${videoJob.id}/audio-generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input_text: videoJob.script_raw,
          voice_id: voiceIdToUse,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '音声生成に失敗しました');
      }

      setAudioStatus(`音声生成を開始しました（Job ID: ${data.audio_job_id}）`);
      setError(`
🔍 Webhook未設定のため、自動取得できません。
音声URLを手動で取得して、下の入力欄に貼り付けてください。

Job ID: ${data.audio_job_id}
      `.trim());
      
      setIsGeneratingAudio(false);
    } catch (err: any) {
      console.error('Error generating audio:', err);
      setError(err.message || '音声生成に失敗しました');
      setIsGeneratingAudio(false);
      setAudioStatus('');
    }
  };

  // Step 2: アバター動画生成
  const handleGenerateAvatar = async () => {
    try {
      setError(null);
      setIsGenerating(true);
      setAudioStatus('アバター動画を生成中...（最大1分程度かかります）');

      if (!formData.voice_url) {
        throw new Error('音声が生成されていません。先に「音声生成」を実行してください。');
      }

      const response = await fetch(`/api/admin/video-jobs/${videoJob.id}/akool-generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'アバター生成に失敗しました');
      }

      setSuccess(true);
      setAudioStatus('アバター動画の生成を開始しました！');
      onUpdate();
      
      setTimeout(() => {
        setSuccess(false);
        setAudioStatus('');
      }, 3000);
    } catch (err: any) {
      console.error('Error generating avatar:', err);
      setError(err.message || 'アバター生成に失敗しました');
      setAudioStatus('');
    } finally {
      setIsGenerating(false);
    }
  };

  const getAkoolStatusLabel = (status?: number) => {
    if (!status) return '未生成';
    const statusMap: Record<number, string> = {
      1: '処理中',
      2: '完了',
      3: 'エラー',
    };
    return statusMap[status] || `不明 (${status})`;
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-900/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg">
          <p className="font-medium">エラー</p>
          <pre className="text-sm mt-1 whitespace-pre-wrap">{error}</pre>
        </div>
      )}

      {success && (
        <div className="bg-green-900/20 border border-green-500/50 text-green-300 px-4 py-3 rounded-lg">
          <p className="font-medium">✓ 成功しました</p>
        </div>
      )}

      {/* 現在のステータス */}
      {videoJob.akool_job_id && (
        <div className="bg-purple-900/20 border border-purple-500/50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-purple-300 mb-3 flex items-center">
            <span className="mr-2">🎭</span>
            Akoolジョブステータス
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Job ID:</span>
              <span className="text-white font-mono">{videoJob.akool_job_id}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">ステータス:</span>
              <span className="text-purple-300 font-medium">
                {getAkoolStatusLabel(videoJob.avatar?.status)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* アバター設定 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <span className="mr-2">⚙️</span>
          アバター設定
        </h3>

        <div className="bg-purple-900/20 border border-purple-500/50 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="text-4xl">👧</div>
            <div>
              <p className="text-white font-medium">あん子（Talking）</p>
              <p className="text-sm text-gray-400">ID: ankotalking（固定）</p>
              <p className="text-xs text-purple-300 mt-1">✓ 自動登録済み</p>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">解像度</label>
          <div className="px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-gray-400">
            1080 x 1920 (縦型・ショート動画最適化)
          </div>
        </div>
      </div>

      {/* Step 1: 音声生成 */}
      <div className="space-y-4 pt-4 border-t border-gray-700/50">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <span className="mr-2">🎵</span>
          Step 1: 音声生成
        </h3>

        {audioStatus && (
          <div className="bg-blue-900/20 border border-blue-500/50 text-blue-300 px-4 py-3 rounded-lg">
            <p className="font-medium">{audioStatus}</p>
          </div>
        )}

        <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
          <p className="text-sm text-gray-300 mb-4">
            台本から音声を生成します。音声生成後、アバター動画を生成できます。
          </p>
          
          {formData.voice_url && (
            <div className="mb-4 p-3 bg-green-900/20 border border-green-500/50 rounded-lg">
              <p className="text-sm text-green-300">✓ 音声生成完了</p>
            </div>
          )}

          <button
            onClick={handleGenerateAudio}
            disabled={isGeneratingAudio || !videoJob.script_raw}
            className={`w-full px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
              isGeneratingAudio || !videoJob.script_raw
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-blue-500/50'
            }`}
          >
            {isGeneratingAudio ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                音声生成中...
              </span>
            ) : '🎵 音声を生成'}
          </button>

          {!videoJob.script_raw && (
            <p className="text-xs text-yellow-400 mt-2">
              ⚠️ 台本を入力してください（Script & Meta タブ）
            </p>
          )}

          {/* 手動音声URL入力 */}
          <div className="mt-4 p-4 bg-gray-800/50 border border-gray-600 rounded-lg">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              または、音声URLを直接入力
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={formData.voice_url}
                onChange={(e) => setFormData(prev => ({ ...prev, voice_url: e.target.value }))}
                placeholder="https://...音声URL..."
                className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
              />
              <button
                onClick={async () => {
                  if (formData.voice_url) {
                    await supabase
                      .from('video_jobs')
                      .update({
                        voice: { ...videoJob.voice, url: formData.voice_url, status: 3 },
                        updated_at: new Date().toISOString(),
                      })
                      .eq('id', videoJob.id);
                    onUpdate();
                    setSuccess(true);
                    setTimeout(() => setSuccess(false), 3000);
                  }
                }}
                disabled={!formData.voice_url}
                className="px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                設定
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Step 2: アバター動画生成 */}
      <div className="space-y-4 pt-4 border-t border-gray-700/50">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <span className="mr-2">🚀</span>
          Step 2: アバター動画生成
        </h3>

        <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
          <p className="text-sm text-gray-300 mb-4">
            生成された音声を使って、あん子がしゃべる動画を生成します。
          </p>
          
          {!formData.voice_url && (
            <div className="bg-yellow-900/20 border border-yellow-500/50 text-yellow-300 px-4 py-3 rounded-lg mb-4">
              <p className="text-sm">
                ⚠️ 音声が生成されていません。先に「Step 1: 音声生成」を実行してください。
              </p>
            </div>
          )}

          <button
            onClick={handleGenerateAvatar}
            disabled={isGenerating || !formData.voice_url}
            className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isGenerating ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                生成中...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <span className="mr-2">🎭</span>
                Akoolでアバター動画を生成
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 生成済み動画のプレビュー */}
      {videoJob.akool_video_url && (
        <div className="space-y-4 pt-4 border-t border-gray-700/50">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <span className="mr-2">🎬</span>
            生成済みアバター動画
          </h3>

          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
            <div className="flex justify-center">
              <div className="w-64 bg-black rounded-lg overflow-hidden mb-4" style={{ aspectRatio: '9/16' }}>
                <video
                  src={videoJob.akool_video_url}
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
                href={videoJob.akool_video_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-purple-400 hover:text-purple-300 underline"
              >
                🔗 動画URLを新しいタブで開く
              </a>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(videoJob.akool_video_url || '');
                  alert('URLをクリップボードにコピーしました');
                }}
                className="text-sm text-gray-400 hover:text-white transition-colors duration-200"
              >
                📋 URLをコピー
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

