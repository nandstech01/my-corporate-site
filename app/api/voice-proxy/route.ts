import { NextRequest } from 'next/server';
import WebSocket from 'ws';
import { handleFunctionCall } from './function-handlers';

// OpenAI Realtime API WebSocketプロキシ
export async function GET(request: NextRequest) {
  try {
    // WebSocket接続のアップグレード処理
    const upgradeHeader = request.headers.get('upgrade');
    
    if (upgradeHeader !== 'websocket') {
      return new Response('Expected Upgrade: websocket', { status: 426 });
    }

    // OpenAI APIキーの確認
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      return new Response('OpenAI API key not configured', { status: 500 });
    }

    return new Response('WebSocket Upgrade Required', {
      status: 101,
      headers: {
        'Upgrade': 'websocket',
        'Connection': 'Upgrade',
      },
    });

  } catch (error) {
    console.error('Voice proxy error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

// WebSocket ハンドラー（Next.js App Router用）
export const dynamic = 'force-dynamic';

// WebSocketサーバーのセットアップ
let wss: WebSocket.Server | null = null;

export function setupWebSocketServer() {
  if (wss) return wss;
  
  wss = new WebSocket.Server({ 
    port: 3001,
    path: '/api/voice-proxy'
  });

  wss.on('connection', async (clientWs: WebSocket) => {
    console.log('🎤 Client connected to voice proxy');
    
    let openaiWs: WebSocket | null = null;
    
    try {
      // OpenAI Realtime APIに接続
      openaiWs = new WebSocket('wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01', {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'OpenAI-Beta': 'realtime=v1'
        }
      });

      // OpenAI → Client への転送
      openaiWs.on('message', (data) => {
        if (clientWs.readyState === WebSocket.OPEN) {
          clientWs.send(data);
        }
      });

      // Client → OpenAI への転送
      clientWs.on('message', (data) => {
        if (openaiWs && openaiWs.readyState === WebSocket.OPEN) {
          openaiWs.send(data);
        }
      });

      // OpenAI接続確立
      openaiWs.on('open', () => {
        console.log('✅ Connected to OpenAI Realtime API');
        
        // セッション設定の送信
        const sessionConfig = {
          type: 'session.update',
          session: {
            modalities: ['text', 'audio'],
            instructions: `あなたは日本企業の音声AIアシスタントです。
            
主な役割:
1. ユーザーの音声指示を理解し、適切に応答
2. ブログ記事生成、トレンド調査などの業務支援
3. 親しみやすく、プロフェッショナルな対応

応答ガイドライン:
- 日本語で自然に応答
- タスク開始時：「承知しました。○○を実行します...」
- 進捗中：「○○を取得中です...」「記事を生成中です...」
- 完了時：「○○が完了しました！」
- エラー時：「申し訳ありません。○○でエラーが発生しました」

指示理解:
- 「記事生成」「ブログ作成」→ ブログ記事生成タスク
- 「トレンド調査」→ 最新ニュース検索
- 「X投稿」→ X（Twitter）投稿生成

簡潔で分かりやすい応答を心がけてください。`,
            voice: 'alloy',
            input_audio_format: 'pcm16',
            output_audio_format: 'pcm16',
            input_audio_transcription: {
              model: 'whisper-1'
            },
            turn_detection: {
              type: 'server_vad',
              threshold: 0.5,
              prefix_padding_ms: 300,
              silence_duration_ms: 200
            },
            tools: [
              {
                type: 'function',
                name: 'execute_blog_generation',
                description: 'ブログ記事の生成と保存を実行する',
                parameters: {
                  type: 'object',
                  properties: {
                    query: {
                      type: 'string',
                      description: '記事生成のクエリ・テーマ'
                    },
                    category: {
                      type: 'string',
                      description: '記事のカテゴリ',
                      default: 'ai-tools'
                    }
                  },
                  required: ['query']
                }
              },
              {
                type: 'function',
                name: 'search_trends',
                description: '最新トレンドやニュースを検索する',
                parameters: {
                  type: 'object',
                  properties: {
                    query: {
                      type: 'string',
                      description: '検索クエリ'
                    }
                  },
                  required: ['query']
                }
              }
            ]
          }
        };
        
                 if (openaiWs) {
           openaiWs.send(JSON.stringify(sessionConfig));
         }
      });

      // エラーハンドリング
      openaiWs.on('error', (error) => {
        console.error('❌ OpenAI WebSocket error:', error);
        if (clientWs.readyState === WebSocket.OPEN) {
          clientWs.send(JSON.stringify({
            type: 'error',
            error: {
              message: 'OpenAI connection error',
              details: error.message
            }
          }));
        }
      });

      openaiWs.on('close', () => {
        console.log('🔌 OpenAI WebSocket closed');
        if (clientWs.readyState === WebSocket.OPEN) {
          clientWs.close();
        }
      });

    } catch (error) {
      console.error('❌ Failed to connect to OpenAI:', error);
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(JSON.stringify({
          type: 'error',
          error: {
            message: 'Failed to connect to OpenAI',
            details: error instanceof Error ? error.message : String(error)
          }
        }));
      }
    }

    // クライアント切断時のクリーンアップ
    clientWs.on('close', () => {
      console.log('👋 Client disconnected from voice proxy');
      if (openaiWs && openaiWs.readyState === WebSocket.OPEN) {
        openaiWs.close();
      }
    });

    clientWs.on('error', (error) => {
      console.error('❌ Client WebSocket error:', error);
      if (openaiWs && openaiWs.readyState === WebSocket.OPEN) {
        openaiWs.close();
      }
    });
  });

  return wss;
}

// サーバー起動時にWebSocketサーバーをセットアップ
if (process.env.NODE_ENV === 'development') {
  setupWebSocketServer();
} 