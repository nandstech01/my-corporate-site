'use client';

import { useState, useRef, useEffect } from 'react';
import { XMarkIcon, MicrophoneIcon, SpeakerWaveIcon } from '@heroicons/react/24/outline';
import AvatarDisplay from './AvatarDisplay';
import ConversationHistory from './ConversationHistory';
import TaskProgress from './TaskProgress';
import VoiceInterface, { useVoiceInterface } from './VoiceInterface';
import TextTestInterface from './TextTestInterface';

interface VoiceAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TaskStatus {
  id: string;
  title: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  details?: string;
  progress?: number;
}

export default function VoiceAgentModalV2({ isOpen, onClose }: VoiceAgentModalProps) {
  const [currentTasks, setCurrentTasks] = useState<TaskStatus[]>([]);
  const [voiceInterfaceRef, setVoiceInterfaceRef] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  
  // 実際の音声インターフェースを使用
  const voiceInterface = useVoiceInterface();

  // モーダル外クリックで閉じる
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  // タスク作成・更新関数
  const createTask = (title: string, details?: string): string => {
    const taskId = Date.now().toString();
    const newTask: TaskStatus = {
      id: taskId,
      title,
      status: 'pending',
      details,
      progress: 0
    };
    setCurrentTasks(prev => [...prev, newTask]);
    return taskId;
  };

  const updateTask = (taskId: string, updates: Partial<TaskStatus>) => {
    setCurrentTasks(prev => 
      prev.map(task => 
        task.id === taskId ? { ...task, ...updates } : task
      )
    );
  };

  // 実際のRAG検索実行
  const executeRAGSearch = async (query: string): Promise<any> => {
    try {
      const response = await fetch('/api/search-rag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          sources: ['company', 'trend'],
          limit: 10
        })
      });
      
      if (!response.ok) {
        throw new Error(`RAG検索エラー: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('RAG検索実行エラー:', error);
      throw error;
    }
  };

  // 実際のブログ記事生成実行
  const executeBlogGeneration = async (query: string, ragData: any[]): Promise<any> => {
    try {
      const response = await fetch('/api/generate-rag-blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          ragData,
          targetLength: 6000,
          businessCategory: 'corporate', // デフォルト事業カテゴリ
          categorySlug: 'ai-tools', // デフォルトカテゴリ（AIツール紹介）
          includeImages: false,
        })
      });
      
      if (!response.ok) {
        throw new Error(`ブログ記事生成エラー: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('ブログ記事生成実行エラー:', error);
      throw error;
    }
  };

  // 指示の自動処理（音声・テキスト共通）
  const handleCommand = async (instruction: string) => {
    setIsProcessing(true);
    
    try {
      // 簡単な意図解析
      const isArticleRequest = instruction.includes('記事') || 
                              instruction.includes('ブログ') || 
                              instruction.includes('生成');
      
      if (isArticleRequest) {
        // ブログ記事生成タスク
        const taskId = createTask(
          'トレンド調査とブログ記事生成',
          'Brave Search APIで最新情報を取得中...'
        );

        // AIに開始を報告
        voiceInterface.addMessage('assistant', 
          '承知しました。最新トレンドを調査してブログ記事を生成します...'
        );

        try {
        // Step 1: RAG検索
        updateTask(taskId, { 
          status: 'running', 
          progress: 20,
          details: 'RAG検索実行中...' 
        });

        const ragResults = await executeRAGSearch(instruction);
        
        updateTask(taskId, { 
          progress: 50,
          details: `${ragResults.results?.length || 0}件の関連情報を取得しました` 
        });

        // Step 2: ブログ記事生成
        updateTask(taskId, { 
          progress: 70,
          details: 'ブログ記事を生成しています...' 
        });

        const blogResult = await executeBlogGeneration(instruction, ragResults.results || []);
        
        // Step 3: 完了
        updateTask(taskId, { 
          status: 'completed',
          progress: 100,
          details: `${blogResult.title || '記事'}を生成完了しました` 
        });

        // AIに完了を報告
        voiceInterface.addMessage('assistant', 
          `${blogResult.title || '記事'}を生成し、保存しました。完成です！`
        );

      } catch (error) {
        updateTask(taskId, { 
          status: 'error',
          details: `エラー: ${error instanceof Error ? error.message : String(error)}` 
        });
        
        voiceInterface.addMessage('assistant', 
          '申し訳ありません。記事生成中にエラーが発生しました。'
        );
      }
    } else {
      // その他の指示
      voiceInterface.addMessage('assistant', 
        '承知しました。現在対応している機能は記事生成です。「〇〇のブログ記事を生成して」のように指示してください。'
      );
    }
  } catch (error) {
    console.error('Command processing error:', error);
    voiceInterface.addMessage('assistant', 
      '申し訳ありません。処理中にエラーが発生しました。'
    );
  } finally {
    setIsProcessing(false);
  }
};

  // 音声認識結果を受信した時の処理
  useEffect(() => {
    if (voiceInterface.conversation.length > 0) {
      const lastMessage = voiceInterface.conversation[voiceInterface.conversation.length - 1];
      if (lastMessage.role === 'user') {
        // ユーザーの指示を自動処理
        handleCommand(lastMessage.content);
      }
    }
  }, [voiceInterface.conversation]);

  // 音声録音トグル
  const handleMicrophoneClick = async () => {
    console.log('🎤 マイクボタンクリック:', {
      isListening: voiceInterface.isListening,
      status: voiceInterface.status
    });

    if (voiceInterface.isListening) {
      // 録音停止
      voiceInterface.stopListening();
    } else {
      if (voiceInterface.status === 'connected') {
        // 録音開始
        await voiceInterface.startListening();
      } else {
        voiceInterface.onError(new Error('音声システムに接続してください'));
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 背景オーバーレイ */}
      <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />
      
      {/* VoiceInterfaceコンポーネント - プロキシサーバー経由の接続管理 */}
      <VoiceInterface
        isOpen={isOpen}
        onStatusChange={voiceInterface.onStatusChange}
        onTranscription={voiceInterface.onTranscription}
        onResponse={voiceInterface.onResponse}
        onListeningChange={voiceInterface.onListeningChange}
        onSpeakingChange={voiceInterface.onSpeakingChange}
        onError={voiceInterface.onError}
      />
      
      {/* モーダルコンテンツ */}
      <div 
        ref={modalRef}
        className="relative bg-white rounded-2xl shadow-2xl w-[90vw] h-[85vh] max-w-4xl max-h-[800px] 
                   overflow-hidden flex flex-col animate-in fade-in-0 zoom-in-95 duration-300"
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full 
                           flex items-center justify-center">
              <SpeakerWaveIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                音声AIエージェント
              </h2>
              <p className="text-sm text-gray-500">
                音声で管理作業を自動実行
              </p>
            </div>
          </div>
          
          {/* 接続状態表示 */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div 
                className={`w-3 h-3 rounded-full ${
                  voiceInterface.status === 'connected' ? 'bg-green-500 animate-pulse' :
                  voiceInterface.status === 'connecting' ? 'bg-yellow-500 animate-pulse' :
                  voiceInterface.status === 'error' ? 'bg-red-500' :
                  'bg-gray-300'
                }`}
              />
              <span className="text-sm text-gray-600">
                {voiceInterface.status === 'connected' ? '接続中' :
                 voiceInterface.status === 'connecting' ? '接続中...' :
                 voiceInterface.status === 'error' ? 'エラー' :
                 '未接続'}
              </span>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="閉じる"
            >
              <XMarkIcon className="w-6 h-6 text-gray-500" />
            </button>
          </div>
        </div>

        {/* メインコンテンツエリア */}
        <div className="flex-1 flex overflow-hidden">
          {/* 左側: アバター表示 */}
          <div className="w-1/2 bg-gradient-to-br from-slate-900 to-slate-800 flex flex-col">
            <AvatarDisplay 
              isListening={voiceInterface.isListening}
              isSpeaking={voiceInterface.isSpeaking}
            />
            
            {/* 音声録音ボタン */}
            <div className="p-6 text-center">
              <button
                onClick={handleMicrophoneClick}
                disabled={voiceInterface.status === 'connecting'}
                onMouseDown={() => console.log('🖱️ マイクボタン押下')}
                className={`
                  w-20 h-20 rounded-full transition-all duration-300
                  flex items-center justify-center mx-auto
                  ${voiceInterface.isListening 
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                    : voiceInterface.status === 'connected'
                      ? 'bg-blue-500 hover:bg-blue-600 hover:scale-110'
                      : 'bg-gray-400 cursor-not-allowed'
                  }
                  shadow-lg hover:shadow-xl
                  ${voiceInterface.status === 'connecting' ? 'animate-spin' : ''}
                `}
                title={
                  voiceInterface.status === 'connecting' ? '接続中...' :
                  voiceInterface.status === 'connected' 
                    ? (voiceInterface.isListening ? '録音停止' : '音声で指示') 
                    : '接続待機中'
                }
              >
                <MicrophoneIcon className="w-10 h-10 text-white" />
              </button>
              
              <p className="text-white text-sm mt-3">
                {voiceInterface.status === 'connecting' ? '接続中...' :
                 voiceInterface.status === 'connected' 
                   ? (voiceInterface.isListening ? '話してください...' : 'タップして音声指示')
                   : 'システム初期化中'
                }
              </p>
              
              {/* エラー表示 */}
              {voiceInterface.error && (
                <div className="mt-2 p-2 bg-red-500 bg-opacity-20 rounded-lg">
                  <p className="text-red-200 text-xs">
                    {voiceInterface.error.message}
                  </p>
                  <button
                    onClick={voiceInterface.clearError}
                    className="text-red-100 text-xs underline mt-1"
                  >
                    エラーをクリア
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 右側: 会話履歴とタスク進捗 */}
          <div className="w-1/2 flex flex-col bg-gray-50">
            {/* 会話履歴 */}
            <div className="flex-1 overflow-hidden">
              <ConversationHistory 
                conversation={voiceInterface.conversation}
                isTyping={voiceInterface.isSpeaking}
              />
            </div>
            
            {/* タスク進捗 */}
            {currentTasks.length > 0 && (
              <div className="border-t border-gray-200">
                <TaskProgress tasks={currentTasks} />
              </div>
            )}
            
            {/* テキストテストインターフェース */}
            <TextTestInterface 
              onSubmit={handleCommand}
              isProcessing={isProcessing}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 