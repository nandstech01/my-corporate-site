'use client';

import React from 'react';
import { VideoJob } from '@/lib/types/videoJob';

interface AssetsTabProps {
  videoJob: VideoJob;
  onUpdate: () => void;
}

export default function AssetsTab({ videoJob, onUpdate }: AssetsTabProps) {
  return (
    <div className="space-y-6">
      {/* Voice セクション */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <span className="mr-2">🎵</span>
          Voice（音声）
        </h3>
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
          {videoJob.voice ? (
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Voice ID:</span>
                <span className="text-white">{videoJob.voice.voiceId}</span>
              </div>
              {videoJob.voice.url && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">音声URL:</span>
                  <a href={videoJob.voice.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline truncate max-w-xs">
                    {videoJob.voice.url}
                  </a>
                </div>
              )}
              {videoJob.voice.ttsProvider && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Provider:</span>
                  <span className="text-white">{videoJob.voice.ttsProvider}</span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500">音声設定なし</p>
          )}
          <button
            disabled
            className="mt-4 w-full px-4 py-2 bg-gray-700 text-gray-400 rounded-lg text-sm font-medium cursor-not-allowed opacity-50"
          >
            🎵 音声生成（Phase 2で実装予定）
          </button>
        </div>
      </div>

      {/* Caption セクション */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <span className="mr-2">📝</span>
          Caption（テロップ）
        </h3>
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
          {videoJob.caption ? (
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">有効:</span>
                <span className="text-white">{videoJob.caption.enabled ? 'はい' : 'いいえ'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">スタイル:</span>
                <span className="text-white">{videoJob.caption.style}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">位置:</span>
                <span className="text-white">{videoJob.caption.position}</span>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">テロップ設定なし</p>
          )}
          <button
            disabled
            className="mt-4 w-full px-4 py-2 bg-gray-700 text-gray-400 rounded-lg text-sm font-medium cursor-not-allowed opacity-50"
          >
            📝 テロップ生成（Phase 2で実装予定）
          </button>
        </div>
      </div>

      {/* Background セクション */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <span className="mr-2">🖼️</span>
          Background（背景）
        </h3>
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
          {videoJob.background ? (
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">タイプ:</span>
                <span className="text-white">{videoJob.background.type}</span>
              </div>
              {videoJob.background.color && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">色:</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-white">{videoJob.background.color}</span>
                    <div 
                      className="w-6 h-6 rounded border border-gray-600" 
                      style={{ backgroundColor: videoJob.background.color }}
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500">背景設定なし</p>
          )}
          <button
            disabled
            className="mt-4 w-full px-4 py-2 bg-gray-700 text-gray-400 rounded-lg text-sm font-medium cursor-not-allowed opacity-50"
          >
            🖼️ 背景設定（Phase 2で実装予定）
          </button>
        </div>
      </div>

      {/* Music セクション */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <span className="mr-2">🎶</span>
          Music（BGM）
        </h3>
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
          {videoJob.music ? (
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">有効:</span>
                <span className="text-white">{videoJob.music.enabled ? 'はい' : 'いいえ'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">BGM ID:</span>
                <span className="text-white">{videoJob.music.bgmId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">音量:</span>
                <span className="text-white">{(videoJob.music.volume * 100).toFixed(0)}%</span>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">BGM設定なし</p>
          )}
          <button
            disabled
            className="mt-4 w-full px-4 py-2 bg-gray-700 text-gray-400 rounded-lg text-sm font-medium cursor-not-allowed opacity-50"
          >
            🎶 BGM設定（Phase 2で実装予定）
          </button>
        </div>
      </div>

      {/* Timeline セクション */}
      {videoJob.timeline && videoJob.timeline.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <span className="mr-2">⏱️</span>
            Timeline（タイムライン）
          </h3>
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            <div className="space-y-2">
              {videoJob.timeline.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm border-b border-gray-700/50 pb-2 last:border-0">
                  <span className="text-gray-400">{item.type}</span>
                  <span className="text-white">{item.start}s - {item.end}s</span>
                  <span className="text-gray-500">Layer: {item.layerIndex}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Phase 2注記 */}
      <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-4">
        <p className="text-sm text-yellow-300">
          📌 <strong>Phase 2で実装予定の機能:</strong>
        </p>
        <ul className="text-sm text-yellow-200 mt-2 space-y-1 list-disc list-inside">
          <li>FFmpegで字幕焼き込み（台本テキストベース）</li>
          <li>FFmpegで背景合成</li>
          <li>FFmpegでBGM合成</li>
          <li>TTS音声生成（Akool TTS / ElevenLabs）</li>
        </ul>
      </div>
    </div>
  );
}

