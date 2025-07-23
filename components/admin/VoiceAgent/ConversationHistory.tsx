'use client';

import { useEffect, useRef } from 'react';
import { UserIcon, CpuChipIcon } from '@heroicons/react/24/outline';

interface ConversationItem {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ConversationHistoryProps {
  conversation: ConversationItem[];
  isTyping: boolean;
}

export default function ConversationHistory({ conversation, isTyping }: ConversationHistoryProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // 新しいメッセージが追加されたら自動スクロール
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversation, isTyping]);

  // タイピングインジケータ
  const TypingIndicator = () => (
    <div className="flex items-center space-x-2 p-3 bg-gray-100 rounded-lg mb-4 mr-8">
      <CpuChipIcon className="w-5 h-5 text-blue-500" />
      <div className="flex space-x-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
      <span className="text-gray-500 text-sm">AIが考えています...</span>
    </div>
  );

  // 時刻フォーマット
  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* ヘッダー */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <h3 className="font-medium text-gray-900">対話履歴</h3>
        <p className="text-sm text-gray-500">
          音声指示とAIの応答
        </p>
      </div>

      {/* 会話エリア */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {conversation.length === 0 ? (
          // 初期メッセージ
          <div className="text-center py-8">
            <CpuChipIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-sm">
              音声で指示を出してみましょう
            </p>
            <p className="text-gray-400 text-xs mt-2">
              例: "今日のトレンドを調査してブログ記事を作って"
            </p>
          </div>
        ) : (
          // 会話履歴
          conversation.map((item) => (
            <div 
              key={item.id}
              className={`flex ${item.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`
                  max-w-[80%] flex items-start space-x-3
                  ${item.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}
                `}
              >
                {/* アバター */}
                <div 
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                    ${item.role === 'user' 
                      ? 'bg-blue-500' 
                      : 'bg-gradient-to-r from-purple-500 to-blue-600'
                    }
                  `}
                >
                  {item.role === 'user' ? (
                    <UserIcon className="w-5 h-5 text-white" />
                  ) : (
                    <CpuChipIcon className="w-5 h-5 text-white" />
                  )}
                </div>

                {/* メッセージバブル */}
                <div
                  className={`
                    rounded-lg p-3 shadow-sm
                    ${item.role === 'user'
                      ? 'bg-blue-500 text-white rounded-br-sm'
                      : 'bg-white border border-gray-200 text-gray-900 rounded-bl-sm'
                    }
                  `}
                >
                  <p className="text-sm leading-relaxed">
                    {item.content}
                  </p>
                  <p 
                    className={`
                      text-xs mt-2 opacity-70
                      ${item.role === 'user' ? 'text-blue-100' : 'text-gray-500'}
                    `}
                  >
                    {formatTime(item.timestamp)}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}

        {/* タイピングインジケータ */}
        {isTyping && <TypingIndicator />}
      </div>

      {/* フッター（統計情報） */}
      {conversation.length > 0 && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between text-sm text-gray-500">
            <span>会話数: {conversation.length}件</span>
            <span>
              最終更新: {conversation.length > 0 ? formatTime(conversation[conversation.length - 1].timestamp) : '-'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
} 