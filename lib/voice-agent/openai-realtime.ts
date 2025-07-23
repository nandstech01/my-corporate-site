// OpenAI Realtime API 統合クラス
// GPT-4o Mini Realtime API を使用した音声対話システム

interface OpenAIRealtimeConfig {
  apiKey: string;
  model?: string;
  voice?: string;
  temperature?: number;
}

interface AudioData {
  data: ArrayBuffer;
  sampleRate?: number;
  channels?: number;
}

interface RealtimeSession {
  id: string;
  status: 'connecting' | 'connected' | 'disconnected' | 'error';
  conversation: any[];
}

export class OpenAIRealtimeAPI {
  private ws: WebSocket | null = null;
  private config: OpenAIRealtimeConfig;
  private session: RealtimeSession | null = null;
  private audioContext: AudioContext | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioStream: MediaStream | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5; // 最大再試行回数を増加
  private isManualDisconnect = false;
  private lastErrorTime = 0;
  private errorCooldownMs = 30000; // 30秒のクールダウン
  private serverErrorCount = 0; // サーバーエラー回数カウンタ
  private maxServerErrors = 3; // 最大サーバーエラー回数
  private exponentialBackoffMs = 1000; // 指数バックオフ初期値
  private responseTimeoutMs = 15000; // 応答タイムアウト（15秒）
  private lastResponseTime = 0; // 最後の応答受信時刻
  private responseTimer: NodeJS.Timeout | null = null; // 応答タイマー
  
  // コールバック関数
  private onStatusChange?: (status: RealtimeSession['status']) => void;
  private onResponse?: (text: string, audio?: AudioData) => void;
  private onTranscription?: (text: string) => void;
  private onError?: (error: Error) => void;

  constructor(config: OpenAIRealtimeConfig) {
    this.config = {
      model: 'gpt-4o-mini-realtime-preview',
      voice: 'alloy',
      temperature: 0.7,
      ...config
    };
  }

  // セッション開始
  async startSession(): Promise<void> {
    try {
      // WebSocket接続準備
      await this.initializeWebSocket();
      
      // 音声コンテキスト初期化
      await this.initializeAudioContext();
      
      // セッション作成
      this.session = {
        id: this.generateSessionId(),
        status: 'connecting',
        conversation: []
      };

      this.updateStatus('connecting');
      
    } catch (error) {
      console.error('セッション開始エラー:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // OpenAI Realtime APIのサーバーエラーか判定
      if (this.isServerError(errorMessage)) {
        await this.handleServerErrorWithRetry(error instanceof Error ? error : new Error(errorMessage));
      } else {
        this.handleError(new Error(`セッション開始に失敗しました: ${errorMessage}`));
      }
    }
  }

  // サーバーエラー判定
  private isServerError(errorMessage: string): boolean {
    const serverErrorPatterns = [
      'The server had an error while processing your request',
      'server_error',
      '500',
      'OpenAI APIでサーバーエラーが発生しました'
    ];
    
    return serverErrorPatterns.some(pattern => 
      errorMessage.toLowerCase().includes(pattern.toLowerCase())
    );
  }

  // サーバーエラー用リトライハンドラー
  private async handleServerErrorWithRetry(error: Error): Promise<void> {
    this.serverErrorCount++;
    
    if (this.serverErrorCount >= this.maxServerErrors) {
      console.error('🚫 最大サーバーエラー回数に達しました。OpenAI Realtime APIに問題があります。');
      this.handleError(new Error('OpenAI Realtime APIでの継続的なサーバーエラー。しばらく時間をおいて再試行してください。'));
      return;
    }

    // 指数バックオフで再試行
    const backoffDelay = this.exponentialBackoffMs * Math.pow(2, this.serverErrorCount - 1);
    console.log(`🔄 サーバーエラーのため${backoffDelay}ms後に再試行します (${this.serverErrorCount}/${this.maxServerErrors})`);
    
    setTimeout(async () => {
      try {
        await this.startSession();
      } catch (retryError) {
        console.error('再試行失敗:', retryError);
        await this.handleServerErrorWithRetry(retryError instanceof Error ? retryError : new Error(String(retryError)));
      }
    }, backoffDelay);
  }

  // WebSocket初期化（プロキシ経由）
  private async initializeWebSocket(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // プロキシエンドポイントに接続
        const wsUrl = process.env.NODE_ENV === 'development' 
          ? 'ws://localhost:3001/api/voice-proxy'
          : `wss://${window.location.host}/api/voice-proxy`;
        
        console.log('🎤 プロキシ経由でOpenAI Realtime APIに接続中...', wsUrl);
        
        // 既存のグローバル接続を強制クローズ
        if ((window as any).globalVoiceWS) {
          console.log('🧹 既存のグローバルWebSocket接続を強制クローズ');
          try {
            (window as any).globalVoiceWS.close(1000, 'New connection');
          } catch (e) {
            console.warn('WebSocket close error:', e);
          }
        }
        
        this.ws = new WebSocket(wsUrl);
        
        // グローバル追跡に登録
        (window as any).globalVoiceWS = this.ws;

        this.ws.onopen = () => {
          console.log('✅ プロキシ経由でOpenAI Realtime APIに接続成功');
          
          // 再接続成功時はカウンターリセット
          this.reconnectAttempts = 0;
          this.isManualDisconnect = false;
          
          // プロキシ経由の場合、認証は不要（サーバーで処理済み）
          // セッション設定のみ送信
          this.sendSessionConfig();
          
          this.updateStatus('connected');
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleWebSocketMessage(event);
        };

        this.ws.onclose = (event) => {
          console.error('🔌 WebSocket接続終了:', {
            code: event.code,
            reason: event.reason,
            wasClean: event.wasClean,
            timeStamp: event.timeStamp
          });
          
          // 切断理由の詳細ログ
          const closeReasons: Record<number, string> = {
            1000: '正常切断',
            1001: 'エンドポイント離脱',
            1002: 'プロトコルエラー', 
            1003: '未対応データ',
            1005: '状態コードなし',
            1006: '異常切断',
            1007: 'データ形式エラー',
            1008: 'ポリシー違反',
            1009: 'メッセージサイズ過大',
            1010: '拡張ネゴシエーション失敗',
            1011: 'サーバー内部エラー',
            1013: 'サービス再起動中',
            1015: 'TLSハンドシェイク失敗'
          };
          
          console.error(`🚨 切断理由: ${closeReasons[event.code] || '不明'} (Code: ${event.code})`);
          
          // セッション状態もクリア
          this.session = null;
          this.updateStatus('disconnected');
          
          // 自動再接続（手動切断でない場合）
          if (!this.isManualDisconnect && event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
            // エラークールダウンチェック
            const now = Date.now();
            if (now - this.lastErrorTime < this.errorCooldownMs) {
              console.warn(`⏰ エラークールダウン中です。${Math.ceil((this.errorCooldownMs - (now - this.lastErrorTime)) / 1000)}秒後に再試行可能`);
              return;
            }
            
            this.reconnectAttempts++;
            console.log(`🔄 自動再接続を試行します (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            
            setTimeout(() => {
              this.startSession().catch(error => {
                console.error('自動再接続失敗:', error);
                this.lastErrorTime = Date.now(); // エラー時間を記録
              });
            }, 2000 * this.reconnectAttempts); // 再接続間隔を延長（1秒→2秒）
          } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('🚫 最大再接続回数に達しました。手動でページを再読み込みしてください。');
            this.updateStatus('error');
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocketエラー:', error);
          this.updateStatus('error');
          reject(new Error('WebSocket接続エラー'));
        };

      } catch (error) {
        reject(error);
      }
    });
  }

  // 音声コンテキスト初期化
  private async initializeAudioContext(): Promise<void> {
    try {
      // AudioContext作成
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // マイクアクセス許可要求
      this.audioStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 24000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        }
      });

      // MediaRecorder初期化
      this.mediaRecorder = new MediaRecorder(this.audioStream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      this.setupMediaRecorderEvents();

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`音声初期化エラー: ${errorMessage}`);
    }
  }

  // MediaRecorderイベント設定
  private setupMediaRecorderEvents(): void {
    if (!this.mediaRecorder) return;

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.sendAudioData(event.data);
      }
    };

    this.mediaRecorder.onstop = () => {
      console.log('音声録音停止');
    };
  }

  // 認証メッセージ送信
  private sendAuthenticationMessage(): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    // OpenAI Realtime API の認証
    const authMessage = {
      type: 'session.create',
      authorization: `Bearer ${this.config.apiKey}`
    };

    console.log('認証メッセージ送信中...');
    this.ws.send(JSON.stringify(authMessage));
  }

  // セッション設定送信
  private sendSessionConfig(): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    const sessionConfig = {
      type: 'session.update',
      session: {
        modalities: ['text', 'audio'],
        instructions: `あなたは親切で知識豊富なAIアシスタントです。
                      管理画面での作業を音声で指示されたとき、既存のAPI機能を自動実行します。
                      必ず日本語で応答してください。短く、簡潔で分かりやすい応答を心がけてください。`,
        voice: this.config.voice || 'alloy',
        input_audio_format: 'pcm16',
        output_audio_format: 'pcm16',
        input_audio_transcription: {
          model: 'whisper-1',
          language: 'ja'
        },
        turn_detection: {
          type: 'server_vad',
          threshold: 0.4,
          prefix_padding_ms: 500,
          silence_duration_ms: 800,
          create_response: true
        },
        tools: [
          {
            type: 'function',
            name: 'search_rag',
            description: 'RAG検索を実行してブログ記事生成に必要な情報を取得する',
            parameters: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: '検索クエリ'
                },
                sources: {
                  type: 'array',
                  items: { type: 'string' },
                  description: '検索ソース (company, trend, youtube)'
                }
              },
              required: ['query']
            }
          },
          {
            type: 'function',
            name: 'generate_blog_post',
            description: 'RAGデータを使用してブログ記事を生成する',
            parameters: {
              type: 'object',
              properties: {
                query: { type: 'string', description: '記事テーマ' },
                ragData: { type: 'array', description: 'RAG検索結果' }
              },
              required: ['query', 'ragData']
            }
          }
        ],
        temperature: this.config.temperature
      }
    };

    this.ws.send(JSON.stringify(sessionConfig));
  }

  // WebSocketメッセージ処理
  private handleWebSocketMessage(event: MessageEvent): void {
    try {
      // 受信データの詳細ログ
      console.log('🔍 WebSocketメッセージ受信:', {
        type: typeof event.data,
        dataType: event.data.constructor.name,
        isBlob: event.data instanceof Blob,
        isArrayBuffer: event.data instanceof ArrayBuffer,
        isString: typeof event.data === 'string',
        size: event.data.size || event.data.byteLength || event.data.length || 'unknown'
      });

      // Blobデータの場合は音声データとして処理
      if (event.data instanceof Blob) {
        console.log('🎵 音声データ受信 (Blob):', event.data.size, 'bytes');
        this.handleAudioBlob(event.data);
        return;
      }

      // ArrayBufferの場合も音声データとして処理
      if (event.data instanceof ArrayBuffer) {
        console.log('🎵 音声データ受信 (ArrayBuffer):', event.data.byteLength, 'bytes');
        this.handleAudioBuffer(event.data);
        return;
      }

      // 文字列の場合のみJSONとしてパース
      if (typeof event.data === 'string') {
        console.log('📝 文字列データ受信:', {
          length: event.data.length,
          preview: event.data.substring(0, 100) + (event.data.length > 100 ? '...' : '')
        });

        const message = JSON.parse(event.data);
        
        console.log('📨 受信メッセージ:', message.type, message);
        
        switch (message.type) {
          case 'session.created':
            console.log('✅ セッション作成完了:', message.session);
            // 接続成功時はエラーカウンタをリセット
            this.serverErrorCount = 0;
            this.reconnectAttempts = 0;
            this.updateStatus('connected');
            break;
            
          case 'session.updated':
            console.log('🔄 セッション更新完了:', message.session);
            // セッション更新成功時もエラーカウンタをリセット
            this.serverErrorCount = 0;
            this.reconnectAttempts = 0;
            this.updateStatus('connected');
            break;
            
          case 'conversation.item.input_audio_transcription.completed':
            // 音声認識結果
            console.log('🎤 音声認識完了:', message.transcript);
            console.log('📝 認識結果詳細:', {
              transcript: message.transcript,
              hasCallback: !!this.onTranscription,
              messageDetail: message
            });
            
            // 音声認識が完了したので応答タイマーをリセット
            this.lastResponseTime = Date.now();
            
            if (this.onTranscription) {
              this.onTranscription(message.transcript);
            }
            
            // 音声認識完了後、応答がない場合のためのマニュアルリクエスト
            setTimeout(() => {
              if (Date.now() - this.lastResponseTime > 3000) { // 3秒応答がない場合
                console.log('🔄 音声認識後3秒経過 - 応答リクエスト送信');
                this.requestResponse();
              }
            }, 3000);
            break;
            
          case 'response.audio.delta':
            // 音声応答データ
            console.log('🔊 音声応答受信:', {
              deltaLength: message.delta ? message.delta.length : 0,
              hasHandler: !!this.handleAudioResponse
            });
            
            // 応答受信を記録してタイマーを停止
            this.lastResponseTime = Date.now();
            this.stopResponseTimer();
            
            this.handleAudioResponse(message.delta);
            break;
            
          case 'response.text.delta':
            // テキスト応答データ
            console.log('💬 テキスト応答受信:', message.delta);
            
            // 応答受信を記録してタイマーを停止
            this.lastResponseTime = Date.now();
            this.stopResponseTimer();
            
            if (this.onResponse) {
              this.onResponse(message.delta);
            }
            break;
            
          case 'response.function_call_arguments.done':
            // Function Calling実行
            this.handleFunctionCall(message);
            break;
            
          case 'response.created':
            // 応答作成開始
            console.log('🚀 OpenAI応答作成開始:', message);
            this.lastResponseTime = Date.now();
            break;

          case 'response.done':
            console.log('✅ レスポンス完了:', message);
            console.log('📊 応答詳細:', {
              responseId: message.response?.id,
              status: message.response?.status,
              hasAudio: !!message.response?.output?.find((item: any) => item.type === 'audio'),
              hasText: !!message.response?.output?.find((item: any) => item.type === 'text'),
              outputItems: message.response?.output?.length || 0
            });
            
            // 応答完了時にタイマーを停止
            this.stopResponseTimer();
            this.lastResponseTime = Date.now();
            
            this.updateStatus('connected');
            break;

          case 'input_audio_buffer.committed':
            // 音声バッファコミット完了
            console.log('📨 音声バッファコミット完了:', message);
            break;

          case 'input_audio_buffer.speech_started':
            // 音声開始検出
            console.log('🎤 音声開始検出:', message);
            break;

          case 'input_audio_buffer.speech_stopped':
            // 音声停止検出
            console.log('⏹️ 音声停止検出:', message);
            break;
            
          case 'error':
            console.error('❌ Realtime APIエラー:', message.error);
            
            // サーバーエラーの場合は新しいリトライ機構を使用
            if (message.error.type === 'server_error') {
              console.error('🚫 OpenAI サーバーエラーを検出しました');
              console.error('🔄 自動リトライ機構を開始します');
              
              // 音声録音を強制停止
              this.forceStopListening();
              
              // エラーカウンタをインクリメント
              this.serverErrorCount++;
              
              if (this.serverErrorCount >= this.maxServerErrors) {
                // 最大エラー回数に達した場合
                console.error('🚫 最大サーバーエラー回数に達しました。OpenAI Realtime APIに問題があります。');
                this.isManualDisconnect = true;
                this.updateStatus('error');
                
                if (this.onError) {
                  this.onError(new Error('OpenAI Realtime APIでの継続的なサーバーエラー。しばらく時間をおいて再試行してください。'));
                }
                
                if (this.ws) {
                  this.ws.close(1000, 'Max Server Errors Reached');
                }
              } else {
                // 指数バックオフでセッション再開
                const backoffDelay = this.exponentialBackoffMs * Math.pow(2, this.serverErrorCount - 1);
                console.log(`🔄 ${backoffDelay}ms後にセッション再開を試行します (${this.serverErrorCount}/${this.maxServerErrors})`);
                
                this.updateStatus('connecting');
                
                setTimeout(async () => {
                  try {
                    // WebSocket接続を一旦クリーンアップ
                    if (this.ws) {
                      this.ws.close(1000, 'Retry After Server Error');
                    }
                    
                    // 短い待機後に再接続
                    setTimeout(async () => {
                      await this.startSession();
                    }, 1000);
                    
                  } catch (retryError) {
                    console.error('サーバーエラー後の再試行失敗:', retryError);
                    this.handleError(new Error('サーバーエラー後の再接続に失敗しました'));
                  }
                }, backoffDelay);
              }
            } else {
              // 他のエラータイプ
              this.handleError(new Error(message.error.message));
            }
            break;
            
          default:
            console.log('🔍 未処理メッセージ:', message.type, message);
        }
      } else {
        console.log('未知のデータ形式:', typeof event.data, event.data);
      }
    } catch (error) {
      console.error('メッセージ解析エラー:', error instanceof Error ? error.message : String(error));
    }
  }

  // 音声録音開始
  async startListening(): Promise<void> {
    if (!this.mediaRecorder || !this.audioStream) {
      throw new Error('音声システムが初期化されていません');
    }

    try {
      console.log('🎤 音声録音開始要求:', {
        recorderState: this.mediaRecorder.state,
        hasStream: !!this.audioStream,
        wsState: this.ws?.readyState
      });
      
      this.mediaRecorder.start(100); // 100ms間隔でデータ送信
      console.log('✅ 音声録音開始成功');
    } catch (error) {
      console.error('❌ 音声録音開始エラー:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`音声録音開始エラー: ${errorMessage}`);
    }
  }

  // 音声録音停止
  stopListening(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop();
      console.log('🛑 音声録音停止');
      
      // エラー状態でなければ音声バッファをコミットし、応答をリクエスト
      if (this.session?.status === 'connected') {
        this.commitAudioBuffer();
        
        // 応答タイムアウトタイマーを開始
        this.startResponseTimer();
        
        // マニュアル応答リクエストを送信
        setTimeout(() => {
          this.requestResponse();
        }, 500); // 音声データ処理のため少し遅延
      } else {
        console.log('⚠️ セッション状態が不正のためコミットをスキップ:', this.session?.status);
      }
    }
  }

  // 応答タイムアウトタイマー開始
  private startResponseTimer(): void {
    if (this.responseTimer) {
      clearTimeout(this.responseTimer);
    }
    
    console.log(`⏰ 応答タイムアウトタイマー開始 (${this.responseTimeoutMs}ms)`);
    this.responseTimer = setTimeout(() => {
      console.warn('⏰ OpenAI応答タイムアウト - マニュアル応答リクエストを送信');
      this.requestResponse();
    }, this.responseTimeoutMs);
  }

  // 応答タイムアウトタイマー停止
  private stopResponseTimer(): void {
    if (this.responseTimer) {
      clearTimeout(this.responseTimer);
      this.responseTimer = null;
      console.log('⏹️ 応答タイムアウトタイマー停止');
    }
  }

  // マニュアル応答リクエスト
  private requestResponse(): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('⚠️ WebSocket未接続のため応答リクエストをスキップ');
      return;
    }

    const responseRequest = {
      type: 'response.create',
      response: {
        modalities: ['text', 'audio'],
        instructions: 'ユーザーの音声入力に対して、日本語で自然に応答してください。'
      }
    };

    console.log('📤 マニュアル応答リクエスト送信:', responseRequest);
    this.ws.send(JSON.stringify(responseRequest));
  }

  // 強制音声停止（エラー時用）
  private forceStopListening(): void {
    try {
      if (this.mediaRecorder) {
        if (this.mediaRecorder.state === 'recording') {
          this.mediaRecorder.stop();
        }
        console.log('🛑 音声録音を強制停止');
      }
      
      // ストリームもクリーンアップ
      if (this.audioStream) {
        this.audioStream.getTracks().forEach(track => {
          track.stop();
          console.log('🔇 音声トラック停止:', track.kind);
        });
      }
    } catch (error) {
      console.warn('音声停止エラー:', error);
    }
  }

  // 音声バッファコミット（音声認識開始）
  private commitAudioBuffer(): void {
    // 接続状態の詳細確認
    const wsReady = this.ws?.readyState === WebSocket.OPEN;
    const sessionReady = this.session?.status === 'connected';
    
    if (!this.ws || !wsReady || !sessionReady) {
      console.warn('⚠️ 接続未完了のため音声バッファをコミットできません:', {
        hasWs: !!this.ws,
        wsReadyState: this.ws?.readyState,
        wsReady,
        sessionStatus: this.session?.status,
        sessionReady
      });
      return;
    }

    try {
      console.log('📝 音声バッファコミット開始');
      
      // 音声バッファをコミット
      const commitMessage = {
        type: 'input_audio_buffer.commit'
      };
      console.log('📨 送信:', commitMessage);
      this.ws.send(JSON.stringify(commitMessage));
      
      // 短い遅延後に応答生成を指示（音声処理完了を待つ）
      setTimeout(() => {
        if (this.ws?.readyState === WebSocket.OPEN) {
          const createResponse = {
            type: 'response.create',
            response: {
              modalities: ['text', 'audio'],
              instructions: 'ユーザーの音声入力に対して、日本語で自然に応答してください。',
              voice: 'alloy',
              output_audio_format: 'pcm16',
              temperature: 0.8
            }
          };
          console.log('📨 応答生成指示送信:', createResponse);
          this.ws.send(JSON.stringify(createResponse));
          
          // 応答監視タイマー開始
          this.startResponseTimer();
        }
      }, 200);
      
      console.log('✅ 音声バッファコミット・応答生成指示完了');
    } catch (error) {
      console.error('❌ 音声バッファコミットエラー:', error);
    }
  }

  // 音声データ送信
  private async sendAudioData(audioBlob: Blob): Promise<void> {
    // 接続状態の詳細確認
    const wsReady = this.ws?.readyState === WebSocket.OPEN;
    const sessionReady = this.session?.status === 'connected';
    
    if (!this.ws || !wsReady || !sessionReady) {
      console.warn('⚠️ 接続未完了のため音声データを送信できません:', {
        hasWs: !!this.ws,
        wsReadyState: this.ws?.readyState,
        wsReady,
        sessionStatus: this.session?.status,
        sessionReady
      });
      return;
    }

    try {
      const arrayBuffer = await audioBlob.arrayBuffer();
      console.log('🎵 音声データ送信:', {
        blobSize: audioBlob.size,
        arrayBufferSize: arrayBuffer.byteLength,
        wsState: this.ws.readyState
      });
      
      const audioMessage = {
        type: 'input_audio_buffer.append',
        audio: this.arrayBufferToBase64(arrayBuffer)
      };

      this.ws.send(JSON.stringify(audioMessage));
      console.log('📤 音声メッセージ送信完了');
    } catch (error) {
      console.error('❌ 音声データ送信エラー:', error);
    }
  }

  // 音声応答処理
  private handleAudioResponse(audioDelta: string): void {
    try {
      const audioData = this.base64ToArrayBuffer(audioDelta);
      this.playAudio(audioData);
    } catch (error) {
      console.error('音声再生エラー:', error);
    }
  }

  // Blob音声データ処理
  private async handleAudioBlob(blob: Blob): Promise<void> {
    try {
      console.log('🎵 Blob音声データ処理開始:', {
        type: blob.type,
        size: blob.size
      });

      const arrayBuffer = await blob.arrayBuffer();
      
      // PCM16形式として処理
      this.playAudio(arrayBuffer);
    } catch (error) {
      console.error('Blob音声処理エラー:', error);
    }
  }

  // ArrayBuffer音声データ処理
  private handleAudioBuffer(buffer: ArrayBuffer): void {
    try {
      this.playAudio(buffer);
    } catch (error) {
      console.error('ArrayBuffer音声処理エラー:', error);
    }
  }

  // Function Call処理
  private async handleFunctionCall(message: any): Promise<void> {
    const { name, arguments: args } = message.call;
    
    try {
      let result;
      
      switch (name) {
        case 'search_rag':
          result = await this.executeRAGSearch(args);
          break;
        case 'generate_blog_post':
          result = await this.generateBlogPost(args);
          break;
        default:
          throw new Error(`未知の関数: ${name}`);
      }

      // 結果をRealtimeAPIに送信
      this.sendFunctionResult(message.call_id, result);
      
    } catch (error) {
      console.error(`Function Call実行エラー (${name}):`, error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.sendFunctionResult(message.call_id, { error: errorMessage });
    }
  }

  // RAG検索実行
  private async executeRAGSearch(args: any): Promise<any> {
    const response = await fetch('/api/search-rag', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(args)
    });
    
    if (!response.ok) {
      throw new Error(`RAG検索エラー: ${response.statusText}`);
    }
    
    return await response.json();
  }

  // ブログ記事生成実行
  private async generateBlogPost(args: any): Promise<any> {
    const response = await fetch('/api/generate-rag-blog', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(args)
    });
    
    if (!response.ok) {
      throw new Error(`ブログ記事生成エラー: ${response.statusText}`);
    }
    
    return await response.json();
  }

  // Function結果送信
  private sendFunctionResult(callId: string, result: any): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    const message = {
      type: 'conversation.item.create',
      item: {
        type: 'function_call_output',
        call_id: callId,
        output: JSON.stringify(result)
      }
    };

    this.ws.send(JSON.stringify(message));
  }

  // 音声再生（PCM16対応）
  private async playAudio(audioData: ArrayBuffer): Promise<void> {
    if (!this.audioContext) {
      console.error('AudioContextが初期化されていません');
      return;
    }

    try {
      // AudioContextの状態確認・復旧
      if (this.audioContext.state === 'suspended') {
        console.log('AudioContextが中断されています。復旧を試行...');
        await this.audioContext.resume();
      }

      // PCM16データをAudioBufferに変換
      const audioBuffer = this.createAudioBufferFromPCM16(audioData);
      if (!audioBuffer) {
        console.warn('音声バッファ作成に失敗');
        return;
      }

      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.audioContext.destination);
      
      console.log('🔊 音声再生開始:', {
        duration: audioBuffer.duration,
        contextState: this.audioContext.state
      });
      
      source.start();
      
      // 再生完了時のログ
      source.onended = () => {
        console.log('🔊 音声再生完了');
      };

    } catch (error) {
      console.error('音声再生エラー:', error);
      
      // 詳細なエラー情報
      if (error instanceof Error) {
        console.error('エラー詳細:', {
          name: error.name,
          message: error.message,
          contextState: this.audioContext?.state
        });
      }
    }
  }

  // PCM16データからAudioBufferを作成
  private createAudioBufferFromPCM16(arrayBuffer: ArrayBuffer): AudioBuffer | null {
    if (!this.audioContext) return null;

    try {
      // PCM16 = 16-bit signed integers, サンプルレート24kHz, モノラル
      const sampleRate = 24000;
      const channels = 1;
      const bytesPerSample = 2; // 16-bit = 2 bytes
      
      // バイト数の検証：PCM16は偶数バイトである必要がある
      if (arrayBuffer.byteLength % bytesPerSample !== 0) {
        console.warn('⚠️ 無効なPCM16データ: バイト数が奇数です', {
          bufferSize: arrayBuffer.byteLength,
          remainder: arrayBuffer.byteLength % bytesPerSample
        });
        
        // 奇数バイトの場合、最後の1バイトを切り捨てて偶数にする
        const adjustedLength = arrayBuffer.byteLength - (arrayBuffer.byteLength % bytesPerSample);
        if (adjustedLength === 0) {
          console.error('❌ 調整後のデータサイズが0になりました');
          return null;
        }
        
        // 調整されたArrayBufferを作成
        arrayBuffer = arrayBuffer.slice(0, adjustedLength);
        console.log('🔧 データを調整しました:', {
          originalSize: arrayBuffer.byteLength + (arrayBuffer.byteLength % bytesPerSample),
          adjustedSize: arrayBuffer.byteLength
        });
      }

      const dataView = new DataView(arrayBuffer);
      const numSamples = arrayBuffer.byteLength / bytesPerSample;
      
      console.log('🎵 PCM16データ変換:', {
        bufferSize: arrayBuffer.byteLength,
        numSamples,
        sampleRate,
        duration: `${(numSamples / sampleRate * 1000).toFixed(1)}ms`
      });

      if (numSamples === 0) {
        console.warn('⚠️ 音声サンプルが0個です');
        return null;
      }

      // 最初の数サンプルをログ出力（デバッグ用）
      const firstSamples = [];
      const maxSamplesToDump = Math.min(10, Math.floor(numSamples));
      for (let i = 0; i < maxSamplesToDump; i++) {
        const sample = dataView.getInt16(i * bytesPerSample, true);
        firstSamples.push(sample);
      }
      console.log('🎵 最初の10サンプル:', firstSamples);

      // AudioBuffer作成
      const audioBuffer = this.audioContext.createBuffer(channels, Math.floor(numSamples), sampleRate);
      const channelData = audioBuffer.getChannelData(0);

      // PCM16データを-1.0〜1.0の範囲に変換してAudioBufferにコピー
      for (let i = 0; i < Math.floor(numSamples); i++) {
        try {
          // 16-bit signed integer を読み取り、リトルエンディアン
          const sample = dataView.getInt16(i * bytesPerSample, true);
          // -32768〜32767 を -1.0〜1.0 に正規化（より正確な正規化）
          channelData[i] = sample < 0 ? sample / 32768.0 : sample / 32767.0;
        } catch (error) {
          console.error(`❌ サンプル${i}の読み取りエラー:`, error);
          channelData[i] = 0; // エラーの場合は無音にする
        }
      }

      console.log('✅ AudioBuffer作成成功:', {
        length: audioBuffer.length,
        duration: audioBuffer.duration,
        sampleRate: audioBuffer.sampleRate
      });

      return audioBuffer;
    } catch (error) {
      console.error('PCM16→AudioBuffer変換エラー:', error);
      return null;
    }
  }

  // セッション終了
  async endSession(): Promise<void> {
    try {
      // 手動切断フラグを設定（自動再接続防止）
      this.isManualDisconnect = true;
      
      // エラーカウンタをリセット（新しいセッション開始に備えて）
      this.serverErrorCount = 0;
      this.reconnectAttempts = 0;
      
      // 音声録音停止
      this.stopListening();
      
      // WebSocket切断とグローバル状態クリア
      if (this.ws) {
        // グローバル追跡をクリア
        if ((window as any).globalVoiceWS === this.ws) {
          (window as any).globalVoiceWS = null;
        }
        
        this.ws.close();
        this.ws = null;
      }
      
      // グローバルAPIインスタンスをクリア
      if ((window as any).globalVoiceAPI === this) {
        (window as any).globalVoiceAPI = null;
      }
      
      // 音声ストリーム停止
      if (this.audioStream) {
        this.audioStream.getTracks().forEach(track => track.stop());
        this.audioStream = null;
      }
      
      // AudioContext終了
      if (this.audioContext) {
        await this.audioContext.close();
        this.audioContext = null;
      }
      
      this.session = null;
      this.updateStatus('disconnected');
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('セッション終了エラー:', errorMessage);
    }
  }

  // ユーティリティメソッド
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    bytes.forEach(byte => binary += String.fromCharCode(byte));
    return btoa(binary);
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  private updateStatus(status: RealtimeSession['status']): void {
    if (this.session) {
      this.session.status = status;
    }
    if (this.onStatusChange) {
      this.onStatusChange(status);
    }
  }

  private handleError(error: Error): void {
    console.error('OpenAI Realtime API エラー:', error);
    if (this.onError) {
      this.onError(error);
    }
  }

  // コールバック設定
  setOnStatusChange(callback: (status: RealtimeSession['status']) => void): void {
    this.onStatusChange = callback;
  }

  setOnResponse(callback: (text: string, audio?: AudioData) => void): void {
    this.onResponse = callback;
  }

  setOnTranscription(callback: (text: string) => void): void {
    this.onTranscription = callback;
  }

  setOnError(callback: (error: Error) => void): void {
    this.onError = callback;
  }

  // 現在の状態取得
  getSession(): RealtimeSession | null {
    return this.session;
  }

  isConnected(): boolean {
    const wsConnected = this.ws?.readyState === WebSocket.OPEN;
    const sessionConnected = this.session?.status === 'connected';
    
    // デバッグログ（但し、接続中状態の場合は警告を抑制）
    if (wsConnected !== sessionConnected && this.session?.status !== 'connecting') {
      console.warn('⚠️ WebSocket状態とセッション状態が不一致:', {
        wsReadyState: this.ws?.readyState,
        wsConnected,
        sessionStatus: this.session?.status,
        sessionConnected
      });
    }
    
    // WebSocket接続が実際の接続状態を表すため、それを優先
    return wsConnected && sessionConnected;
  }

  // OpenAI Realtime APIの状態確認
  isHealthy(): boolean {
    return this.serverErrorCount < this.maxServerErrors && 
           this.reconnectAttempts < this.maxReconnectAttempts;
  }

  // サービス状態の詳細取得
  getServiceStatus(): {
    isHealthy: boolean;
    serverErrors: number;
    maxServerErrors: number;
    reconnectAttempts: number;
    maxReconnectAttempts: number;
    lastErrorTime: number;
    canRetry: boolean;
  } {
    const now = Date.now();
    const canRetry = (now - this.lastErrorTime) > this.errorCooldownMs;
    
    return {
      isHealthy: this.isHealthy(),
      serverErrors: this.serverErrorCount,
      maxServerErrors: this.maxServerErrors,
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts,
      lastErrorTime: this.lastErrorTime,
      canRetry
    };
  }

  // エラーカウンタを手動でリセット（テスト用）
  resetErrorCounters(): void {
    this.serverErrorCount = 0;
    this.reconnectAttempts = 0;
    this.lastErrorTime = 0;
    this.lastResponseTime = 0;
    this.stopResponseTimer();
    console.log('🔄 エラーカウンタをリセットしました');
  }

  // デバッグ情報取得
  getDebugInfo(): {
    session: any;
    ws: { readyState: number; url?: string } | null;
    timings: {
      lastResponseTime: number;
      timeSinceLastResponse: number;
      hasResponseTimer: boolean;
    };
    audio: {
      hasAudioContext: boolean;
      hasMediaRecorder: boolean;
      recorderState?: string;
    };
  } {
    return {
      session: this.session,
      ws: this.ws ? {
        readyState: this.ws.readyState,
        url: this.ws.url
      } : null,
      timings: {
        lastResponseTime: this.lastResponseTime,
        timeSinceLastResponse: Date.now() - this.lastResponseTime,
        hasResponseTimer: !!this.responseTimer
      },
      audio: {
        hasAudioContext: !!this.audioContext,
        hasMediaRecorder: !!this.mediaRecorder,
        recorderState: this.mediaRecorder?.state
      }
    };
  }

  // マニュアルテスト用応答リクエスト（デバッグ用）
  triggerManualResponse(): void {
    console.log('🧪 マニュアルテスト: 応答リクエスト送信');
    this.requestResponse();
  }
} 