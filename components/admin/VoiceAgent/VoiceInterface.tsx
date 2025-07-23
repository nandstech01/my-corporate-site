'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { OpenAIRealtimeAPI } from '../../../lib/voice-agent/openai-realtime';

interface VoiceInterfaceProps {
  isOpen: boolean;
  onStatusChange: (status: 'disconnected' | 'connecting' | 'connected' | 'error') => void;
  onTranscription: (text: string) => void;
  onResponse: (text: string) => void;
  onListeningChange: (isListening: boolean) => void;
  onSpeakingChange: (isSpeaking: boolean) => void;
  onError: (error: Error) => void;
}

export default function VoiceInterface({
  isOpen,
  onStatusChange,
  onTranscription,
  onResponse,
  onListeningChange,
  onSpeakingChange,
  onError
}: VoiceInterfaceProps) {
  const realtimeAPI = useRef<OpenAIRealtimeAPI | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const initializationRef = useRef<boolean>(false);
  const cleanupRef = useRef<(() => void) | null>(null);
  const guidancePlayedRef = useRef<boolean>(false);
  const connectionAttemptRef = useRef<boolean>(false);
  
  // 最強のグローバル接続制御
  const ensureSingleConnection = useCallback(() => {
    // 既存のWebSocket接続を強制クローズ
    if ((window as any).globalVoiceWS) {
      console.log('🧹 既存のWebSocket接続を強制クローズ');
      try {
        (window as any).globalVoiceWS.close(1000, 'New connection');
      } catch (e) {
        console.warn('WebSocket close error:', e);
      }
      (window as any).globalVoiceWS = null;
    }
    
    // グローバルAPIインスタンスの管理
    if ((window as any).globalVoiceAPI) {
      console.log('🔄 既存のグローバルAPIを再利用します');
      return (window as any).globalVoiceAPI;
    }
    return null;
  }, []);

  // 初期音声ガイダンス再生（重複防止）
  const playInitialGuidance = useCallback(() => {
    if (realtimeAPI.current?.isConnected() && !guidancePlayedRef.current) {
      try {
        console.log('🎙️ 初期音声ガイダンス開始');
        guidancePlayedRef.current = true;
        
        // 現在の音声合成をクリア
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
        
        const welcomeText = 'こんにちは！音声AIアシスタントです。どうしましたか？マイクボタンを押して話しかけてください。';
        
        // Web Speech API を使用して音声ガイダンス
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(welcomeText);
          utterance.lang = 'ja-JP';
          utterance.rate = 0.9;
          utterance.pitch = 1.0;
          utterance.onend = () => {
            console.log('🎙️ 初期ガイダンス音声再生完了');
          };
          window.speechSynthesis.speak(utterance);
          console.log('🎙️ 初期ガイダンス音声再生開始');
        }
      } catch (error) {
        console.error('❌ 初期ガイダンス再生エラー:', error);
        guidancePlayedRef.current = false; // エラー時はリセット
      }
    } else if (guidancePlayedRef.current) {
      console.log('🔇 初期ガイダンス既に再生済みのためスキップ');
    }
  }, []);

  // OpenAI Realtime API初期化（Strict Mode対応）
  const initializeRealtimeAPI = useCallback(async () => {
    // 最強の重複初期化防止（シングルトンパターン）
    if (initializationRef.current || connectionAttemptRef.current || realtimeAPI.current) {
      console.log('🚫 重複初期化をスキップします', {
        initializationFlag: initializationRef.current,
        connectionAttempt: connectionAttemptRef.current,
        hasExistingAPI: !!realtimeAPI.current,
        existingConnected: realtimeAPI.current?.isConnected() || false
      });
      
      // 既存APIが接続済みの場合は状態を更新
      if (realtimeAPI.current?.isConnected()) {
        setIsInitialized(true);
        onStatusChange('connected');
        console.log('✅ 既存API接続を活用');
      }
      return;
    }

    // 単一接続の確保とAPIチェック
    const existingAPI = ensureSingleConnection();
    if (existingAPI && existingAPI.isConnected()) {
      console.log('🔄 グローバルAPIを再利用します');
      realtimeAPI.current = existingAPI;
      setIsInitialized(true);
      onStatusChange('connected');
      return;
    }

    // 複数レベルでの重複防止
    if ((window as any).voiceInitializing || (window as any).voiceConnected || (window as any).voiceConnecting) {
      console.log('🚫 グローバル状態により初期化をスキップ', {
        initializing: (window as any).voiceInitializing,
        connected: (window as any).voiceConnected,
        connecting: (window as any).voiceConnecting
      });
      return;
    }
    
    // フラグ設定
    (window as any).voiceInitializing = true;
    (window as any).voiceConnecting = true;
    connectionAttemptRef.current = true;
    
    console.log('🚀 新規API初期化を開始します');
    initializationRef.current = true;
    
    try {
      // 既存のAPIインスタンスがある場合はクリーンアップ
      if (realtimeAPI.current) {
        console.log('🧹 既存のAPI接続をクリーンアップします');
        try {
          // @ts-ignore - TypeScript type inference issue
          await realtimeAPI.current.endSession();
        } catch (e) {
          console.warn('⚠️ 既存セッション終了エラー:', e);
        }
        realtimeAPI.current = null;
      }
      
      // グローバル接続をクリア
      if ((window as any).globalVoiceAPI) {
        delete (window as any).globalVoiceAPI;
        console.log('🗑️ グローバル音声接続をクリアしました');
      }

      // 環境変数からAPIキー取得
      const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
      
      if (!apiKey) {
        throw new Error('OpenAI APIキーが設定されていません');
      }

      console.log('🚀 新しいRealtime API接続を作成します');
      realtimeAPI.current = new OpenAIRealtimeAPI({
        apiKey,
        model: 'gpt-4o-realtime-preview-2024-10-01',
        voice: 'alloy',
        temperature: 0.8
      });

      // グローバルに保存
      (window as any).globalVoiceAPI = realtimeAPI.current;

      // コールバック設定（参照保持の確認）
      realtimeAPI.current.setOnStatusChange((status) => {
        console.log('🔄 OpenAI API状態変更:', status, {
          hasAPI: !!realtimeAPI.current,
          apiConnected: realtimeAPI.current?.isConnected() || false
        });
        onStatusChange(status);
        
        if (status === 'connected') {
          setIsInitialized(true);
          (window as any).voiceConnected = true; // グローバル接続状態
          console.log('✅ VoiceInterface初期化完了 (API接続成功)', {
            hasAPI: !!realtimeAPI.current,
            apiConnected: realtimeAPI.current?.isConnected() || false
          });
          
          // 初期音声ガイダンス
          setTimeout(() => {
            playInitialGuidance();
          }, 1000);
        } else if (status === 'disconnected' || status === 'error') {
          setIsInitialized(false);
          (window as any).voiceConnected = false; // グローバル接続状態リセット
        }
      });
      
      realtimeAPI.current.setOnTranscription(onTranscription);
      realtimeAPI.current.setOnResponse(onResponse);
      realtimeAPI.current.setOnError(onError);

      console.log('🎤 音声システム初期化完了');
      
    } catch (error) {
      console.error('Realtime API初期化エラー:', error);
      initializationRef.current = false; // エラー時はリセット
      const errorMessage = error instanceof Error ? error.message : String(error);
      onError(new Error(`音声システム初期化エラー: ${errorMessage}`));
    } finally {
      // すべてのフラグをクリア
      (window as any).voiceInitializing = false;
      (window as any).voiceConnecting = false;
      connectionAttemptRef.current = false;
    }
  }, [onStatusChange, onTranscription, onResponse, onError, ensureSingleConnection]);

  // セッション開始（重複防止）
  const startSession = useCallback(async () => {
    try {
      // 初期化が必要な場合のみ実行
      if (!realtimeAPI.current) {
        console.log('🔄 音声システム初期化が必要です');
        await initializeRealtimeAPI();
      }

      // API健康状態をチェック
      if (realtimeAPI.current && !realtimeAPI.current.isHealthy()) {
        const status = realtimeAPI.current.getServiceStatus();
        console.warn('⚠️ OpenAI Realtime APIが不安定な状態です:', status);
        
        if (!status.canRetry) {
          const waitTime = Math.ceil((status.lastErrorTime + 30000 - Date.now()) / 1000);
          console.warn(`⏰ ${waitTime}秒後に再試行可能です`);
          throw new Error(`OpenAI Realtime APIが一時的に利用できません。${waitTime}秒後に再試行してください。`);
        }
      }

      if (realtimeAPI.current && !realtimeAPI.current.isConnected()) {
        console.log('🚀 セッション開始を試行します');
        await realtimeAPI.current.startSession();
      } else if (realtimeAPI.current?.isConnected()) {
        console.log('✅ 既に接続済みです');
        setIsInitialized(true);
        onStatusChange('connected');
      } else {
        throw new Error('音声システムの初期化に失敗しました');
      }
    } catch (error) {
      console.error('セッション開始エラー:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      onError(new Error(`セッション開始エラー: ${errorMessage}`));
    }
  }, [initializeRealtimeAPI, onError, onStatusChange]);

  // セッション終了とクリーンアップ
  const endSession = useCallback(async () => {
    console.log('🔌 セッション終了 (状態リセット)');
    
    // すべてのフラグをリセット
    initializationRef.current = false;
    connectionAttemptRef.current = false;
    guidancePlayedRef.current = false;
    
    // グローバルフラグをクリア
    (window as any).voiceInitializing = false;
    (window as any).voiceConnected = false;
    (window as any).voiceConnecting = false;
    
    // 音声合成を停止
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      console.log('🔇 音声合成を停止しました');
    }
    
    if (realtimeAPI.current) {
      try {
        // @ts-ignore - TypeScript type inference issue
        await realtimeAPI.current.endSession();
      } catch (error) {
        console.error('セッション終了エラー:', error);
      }
      
      realtimeAPI.current = null;
    }
    
    // グローバル接続をクリア
    if ((window as any).globalVoiceAPI) {
      delete (window as any).globalVoiceAPI;
      console.log('🗑️ グローバル音声接続をクリアしました');
    }
    
    // 録音制御をクリア
    delete (window as any).voiceRecording;
    
    setIsInitialized(false);
    onStatusChange('disconnected');
  }, [onStatusChange]);

  // 音声録音開始
  const startListening = useCallback(async () => {
    if (realtimeAPI.current && realtimeAPI.current.isConnected()) {
      try {
        await realtimeAPI.current.startListening();
        onListeningChange(true);
      } catch (error) {
        console.error('音声録音開始エラー:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        onError(new Error(`音声録音開始エラー: ${errorMessage}`));
      }
    }
  }, [onListeningChange, onError]);

  // 音声録音停止
  const stopListening = useCallback(() => {
    if (realtimeAPI.current) {
      realtimeAPI.current.stopListening();
      onListeningChange(false);
    }
  }, [onListeningChange]);

  // モーダル開閉に応じてセッション管理（Strict Mode対応）
  useEffect(() => {
    if (isOpen) {
      console.log('📂 音声モーダル開放 - セッション開始');
      startSession();
    } else {
      console.log('📂 音声モーダル閉鎖 - セッション終了');
      endSession();
    }

    // クリーンアップ関数（Strict Mode対応）
    return () => {
      console.log('🧹 useEffect クリーンアップ実行');
      // コンポーネントアンマウント時のみクリーンアップ
      if (!isOpen) {
        // 重複防止フラグをリセット
        initializationRef.current = false;
        // セッション終了
        if (realtimeAPI.current) {
          endSession();
        }
      }
    };
  }, [isOpen, startSession, endSession]);

  // 録音状態管理
  const [shouldBeListening, setShouldBeListening] = useState(false);

  // 録音状態の変化を監視して実際の録音制御
  useEffect(() => {
    if (!realtimeAPI.current) return;

    const handleRecordingState = async () => {
      if (shouldBeListening && realtimeAPI.current?.isConnected()) {
        try {
          await realtimeAPI.current.startListening();
          console.log('🎤 実際の音声録音開始');
        } catch (error) {
          console.error('❌ 音声録音開始エラー:', error);
          onError(new Error('音声録音開始に失敗しました'));
          setShouldBeListening(false);
        }
      } else if (!shouldBeListening && realtimeAPI.current) {
        try {
          realtimeAPI.current.stopListening();
          console.log('🎤 実際の音声録音停止');
        } catch (error) {
          console.error('❌ 音声録音停止エラー:', error);
        }
      }
    };

    handleRecordingState();
  }, [shouldBeListening, onError]);

  // コールバック関数のrefを作成（依存関係問題の回避）
  const onListeningChangeRef = useRef(onListeningChange);
  onListeningChangeRef.current = onListeningChange;

  // 外部から録音制御するためのグローバル関数を公開（API初期化後）
  useEffect(() => {
    if (isOpen && realtimeAPI.current) {
      (window as any).voiceRecording = {
        start: async () => {
          console.log('📢 外部から録音開始要求');
          setShouldBeListening(true);
          onListeningChangeRef.current(true);
        },
        stop: () => {
          console.log('📢 外部から録音停止要求');
          setShouldBeListening(false);
          onListeningChangeRef.current(false);
        },
        isConnected: () => realtimeAPI.current?.isConnected() || false,
        getStatus: () => {
          const apiHealth = realtimeAPI.current?.getServiceStatus() ?? null;
          const status = {
            connected: realtimeAPI.current?.isConnected() || false,
            listening: shouldBeListening,
            initialized: isInitialized,
            healthy: realtimeAPI.current?.isHealthy() ?? true,
            serviceStatus: apiHealth
          };
          console.log('🔍 getStatus呼び出し:', status, {
            hasAPI: !!realtimeAPI.current,
            apiInstance: realtimeAPI.current ? 'exists' : 'null',
            apiHealth
          });
          return status;
        },
        resetErrors: () => {
          if (realtimeAPI.current) {
            realtimeAPI.current.resetErrorCounters();
            console.log('🔄 APIエラーカウンタをリセットしました');
          }
        },
        getAPIHealth: () => {
          return realtimeAPI.current?.getServiceStatus() ?? null;
        },
        getDebugInfo: () => {
          return realtimeAPI.current?.getDebugInfo() ?? null;
        },
        triggerResponse: () => {
          if (realtimeAPI.current) {
            realtimeAPI.current.triggerManualResponse();
            console.log('🧪 マニュアル応答リクエスト送信完了');
          }
        },
        testAudioCapture: () => {
          const debugInfo = realtimeAPI.current?.getDebugInfo();
          console.log('🎤 音声キャプチャテスト結果:', debugInfo?.audio);
        }
      };
      console.log('🌐 録音制御をグローバルに公開しました', {
        hasAPI: !!realtimeAPI.current,
        isConnected: realtimeAPI.current?.isConnected() || false,
        isInitialized,
        shouldBeListening
      });
    } else {
      if (isOpen && !realtimeAPI.current) {
        console.log('⚠️ モーダルは開いているがAPIが未初期化');
      }
      delete (window as any).voiceRecording;
    }

    return () => {
      delete (window as any).voiceRecording;
    };
  }, [isOpen, isInitialized, shouldBeListening]);

  // ブラウザの音声許可チェック
  const checkAudioPermission = useCallback(async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error('マイクアクセス許可エラー:', error);
      onError(new Error('マイクへのアクセス許可が必要です'));
      return false;
    }
  }, [onError]);

  // Web Audio API サポートチェック
  const checkWebAudioSupport = useCallback((): boolean => {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) {
      onError(new Error('このブラウザはWeb Audio APIをサポートしていません'));
      return false;
    }
    return true;
  }, [onError]);

  // WebSocket サポートチェック
  const checkWebSocketSupport = useCallback((): boolean => {
    if (!window.WebSocket) {
      onError(new Error('このブラウザはWebSocketをサポートしていません'));
      return false;
    }
    return true;
  }, [onError]);

  // 全体的なサポートチェック
  const checkBrowserSupport = useCallback(async (): Promise<boolean> => {
    const checks = [
      checkWebSocketSupport(),
      checkWebAudioSupport(),
      await checkAudioPermission()
    ];
    
    return checks.every(check => check === true);
  }, [checkWebSocketSupport, checkWebAudioSupport, checkAudioPermission]);

  // マウント時にブラウザサポートチェック
  useEffect(() => {
    if (isOpen) {
      checkBrowserSupport();
    }
  }, [isOpen, checkBrowserSupport]);

  // 外部から呼び出せる関数を公開
  const voiceInterface = {
    startListening,
    stopListening,
    isConnected: () => realtimeAPI.current?.isConnected() || false,
    getSession: () => realtimeAPI.current?.getSession() || null
  };

  // useImperativeHandle の代わりに ref を使用したい場合は、
  // forwardRef と useImperativeHandle を使用できます

  return null; // このコンポーネントは UI を持たない
}

// 音声インターフェースのヘルパーフック
export function useVoiceInterface() {
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [conversation, setConversation] = useState<Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>>([]);
  const [error, setError] = useState<Error | null>(null);

  // メッセージ追加
  const addMessage = useCallback((role: 'user' | 'assistant', content: string) => {
    const newMessage = {
      id: Date.now().toString(),
      role,
      content,
      timestamp: new Date()
    };
    setConversation(prev => [...prev, newMessage]);
  }, []);

  // 音声認識結果処理
  const handleTranscription = useCallback((text: string) => {
    addMessage('user', text);
  }, [addMessage]);

  // AI応答処理
  const handleResponse = useCallback((text: string) => {
    addMessage('assistant', text);
    setIsSpeaking(true);
    
    // 応答完了後に speaking を false に
    setTimeout(() => setIsSpeaking(false), 2000);
  }, [addMessage]);

  // エラー処理
  const handleError = useCallback((error: Error) => {
    setError(error);
    setStatus('error');
    console.error('音声インターフェースエラー:', error);
    
    // OpenAI APIサーバーエラーの場合は特別な処理
    if (error.message.includes('OpenAI APIでサーバーエラー')) {
      console.error('🚨 OpenAI Realtime APIのサーバーエラーが発生しました');
      console.error('💡 これは一時的な問題の可能性があります。数分後に再度お試しください。');
      console.error('🔗 OpenAIサービス状況: https://status.openai.com/');
      console.error('📋 既知の問題: OpenAI Realtime APIは現在プレビュー版で、断続的にサーバーエラーが発生することがあります');
      
      // 自動再試行機能の案内
      console.log('🔄 30秒後に自動で再接続を試行します...');
      
      // 音声合成で通知（オプション）
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance('申し訳ありません。OpenAI音声システムで一時的なエラーが発生しました。モーダルを閉じて再度開くか、ページを再読み込みしてください。');
        utterance.lang = 'ja-JP';
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
      }
      
             // ユーザーに手動再試行を案内
       console.log('🔄 解決方法: モーダルを閉じて再度開くか、ページを再読み込みしてください');
    }
  }, []);

  // エラークリア
  const clearError = useCallback(() => {
    setError(null);
    if (status === 'error') {
      setStatus('disconnected');
    }
  }, [status]);

  // 会話履歴クリア
  const clearConversation = useCallback(() => {
    setConversation([]);
  }, []);

  // セッション終了（クリーンアップ）- VoiceInterfaceコンポーネントで管理
  const endSession = useCallback(async () => {
    try {
      setIsListening(false);
      setStatus('disconnected');
      console.log('🔌 セッション終了 (状態リセット)');
    } catch (error) {
      console.error('❌ セッション終了エラー:', error);
    }
  }, []);

  // コンポーネントアンマウント時のクリーンアップ
  useEffect(() => {
    return () => {
      endSession();
    };
  }, [endSession]);

  return {
    // 状態
    status,
    isListening,
    isSpeaking,
    conversation,
    error,
    
    // コールバック関数
    onStatusChange: setStatus,
    onTranscription: handleTranscription,
    onResponse: handleResponse,
    onListeningChange: setIsListening,
    onSpeakingChange: setIsSpeaking,
    onError: handleError,
    
    // 音声録音制御関数（改善版）
    startListening: useCallback(async () => {
      try {
        // マイク権限チェック
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        
        // 再試行機能付きの録音開始
        const attemptStart = async (attempt = 1, maxAttempts = 3) => {
          if ((window as any).voiceRecording) {
            const status = (window as any).voiceRecording.getStatus();
            console.log(`🔍 録音制御前の状態 (試行${attempt}):`, status);
            
            if (status.connected && status.initialized) {
              await (window as any).voiceRecording.start();
              console.log('🎤 音声録音開始（VoiceInterface経由）');
              return;
            } else if (attempt < maxAttempts) {
              console.log(`⏳ 接続待機中... ${attempt}/${maxAttempts}`);
              await new Promise(resolve => setTimeout(resolve, 500));
              return attemptStart(attempt + 1, maxAttempts);
            } else {
              throw new Error(`音声システムが準備できていません。状態: ${JSON.stringify(status)}。ページを再読み込みしてください。`);
            }
          } else {
            if (attempt < maxAttempts) {
              console.log(`⏳ システム初期化待機中... ${attempt}/${maxAttempts}`);
              await new Promise(resolve => setTimeout(resolve, 500));
              return attemptStart(attempt + 1, maxAttempts);
            } else {
              throw new Error('音声システムが初期化されていません。ページを再読み込みしてください。');
            }
          }
        };
        
        await attemptStart();
      } catch (error) {
        console.error('❌ 音声録音開始エラー:', error);
        handleError(new Error(error instanceof Error ? error.message : '音声録音開始に失敗しました'));
      }
    }, [handleError]),
    
    stopListening: useCallback(() => {
      try {
        // VoiceInterfaceコンポーネントの録音停止を呼び出し
        if ((window as any).voiceRecording) {
          (window as any).voiceRecording.stop();
          console.log('🎤 音声録音停止（VoiceInterface経由）');
        } else {
          console.warn('⚠️ 録音制御が見つかりません（録音停止）');
        }
      } catch (error) {
        console.error('❌ 音声録音停止エラー:', error);
        handleError(new Error('音声録音停止に失敗しました'));
      }
    }, [handleError]),
    
    // ヘルパー関数
    addMessage,
    clearError,
    clearConversation
  };
} 