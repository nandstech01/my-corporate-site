const WebSocket = require('ws');
const { createServer } = require('http');
const fetch = require('node-fetch');

// 環境変数の読み込み
require('dotenv').config({ path: '.env.local' });

// テキストメッセージかどうかを判定
function isTextMessage(data) {
  if (!data || data.length === 0) return false;
  
  try {
    // 最初の文字がJSONの開始文字（{, [）かどうかをチェック
    const firstChar = data[0];
    const isText = firstChar === 0x7B || firstChar === 0x5B; // '{' or '['
    console.log('🔍 メッセージ判定:', {
      firstChar: firstChar,
      firstCharHex: '0x' + firstChar.toString(16),
      isText: isText,
      length: data.length
    });
    return isText;
  } catch (error) {
    console.error('❌ isTextMessage エラー:', error);
    return false;
  }
}

const PORT = 3001;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY not found in environment');
  process.exit(1);
}

// HTTPサーバー作成
const server = createServer();

// WebSocketサーバー作成
const wss = new WebSocket.Server({ server });

// 接続管理
let activeConnections = new Set();
let activeOpenAIConnection = null; // OpenAI接続の追跡
const MAX_CONNECTIONS = 1; // 同時接続数を1に制限（安定性向上）

console.log('🎤 音声プロキシサーバー起動中...');

// 関数実行ハンドラー
async function executeBlogGeneration(args) {
  try {
    console.log('📝 ブログ記事生成開始:', args);
    
    // RAG検索の実行
    const ragResponse = await fetch('http://localhost:3000/api/search-rag', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: args.query,
        rag_types: ['company', 'trend'],
        date_filter: 'all'
      })
    });

    if (!ragResponse.ok) {
      throw new Error(`RAG検索エラー: ${ragResponse.statusText}`);
    }

    const ragData = await ragResponse.json();
    console.log('📊 RAG検索完了:', ragData.results?.length || 0, '件取得');

    // ブログ記事生成の実行
    const blogResponse = await fetch('http://localhost:3000/api/generate-rag-blog', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: args.query,
        ragData: ragData.results || [],
        targetLength: 6000,
        businessCategory: 'corporate',
        categorySlug: args.category || 'ai-tools',
        includeImages: false
      })
    });

    if (!blogResponse.ok) {
      throw new Error(`ブログ記事生成エラー: ${blogResponse.statusText}`);
    }

    const blogResult = await blogResponse.json();
    console.log('✅ ブログ記事生成完了:', blogResult.title);

    return {
      success: true,
      title: blogResult.title,
      wordCount: blogResult.wordCount,
      postId: blogResult.postId,
      slug: blogResult.slug,
      message: `「${blogResult.title}」を生成し、保存完了しました！（${blogResult.wordCount}文字）`
    };

  } catch (error) {
    console.error('❌ ブログ記事生成エラー:', error);
    return {
      success: false,
      error: error.message,
      message: '申し訳ありません。ブログ記事の生成中にエラーが発生しました。'
    };
  }
}

async function searchTrends(args) {
  try {
    console.log('🔍 トレンド検索開始:', args);
    
    const ragResponse = await fetch('http://localhost:3000/api/search-rag', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: args.query,
        rag_types: ['trend'],
        date_filter: 'latest',
        latest_news_mode: true
      })
    });

    if (!ragResponse.ok) {
      throw new Error(`トレンド検索エラー: ${ragResponse.statusText}`);
    }

    const ragData = await ragResponse.json();
    const trends = ragData.results || [];
    
    console.log('📈 トレンド検索完了:', trends.length, '件取得');

    // 結果を要約
    const trendSummary = trends.slice(0, 5).map((trend, index) => {
      const metadata = trend.metadata || {};
      return `${index + 1}. ${metadata.title || '記事タイトル'}: ${trend.content?.substring(0, 100) || '内容'}...`;
    }).join('\n');

    return {
      success: true,
      count: trends.length,
      trends: trends.slice(0, 5),
      summary: trendSummary,
      message: `最新トレンドを${trends.length}件取得しました。主なトピック:\n${trendSummary}`
    };

  } catch (error) {
    console.error('❌ トレンド検索エラー:', error);
    return {
      success: false,
      error: error.message,
      message: '申し訳ありません。トレンド検索中にエラーが発生しました。'
    };
  }
}

async function handleFunctionCall(functionName, args) {
  console.log('🔧 関数実行:', functionName, args);
  
  switch (functionName) {
    case 'execute_blog_generation':
      return await executeBlogGeneration(args);
      
    case 'search_trends':
      return await searchTrends(args);
      
    default:
      console.warn('⚠️ 未知の関数:', functionName);
      return {
        success: false,
        error: `Unknown function: ${functionName}`,
        message: '申し訳ありません。その機能は対応していません。'
      };
  }
}

wss.on('connection', async (clientWs) => {
  console.log('🎤 クライアント接続要求');
  
  // 強制的に古い接続をクリーンアップ
  const currentTime = Date.now();
  const staleConnections = Array.from(activeConnections).filter(ws => {
    const isStale = ws.readyState === WebSocket.CLOSED || 
                   ws.readyState === WebSocket.CLOSING ||
                   (ws.lastActivity && currentTime - ws.lastActivity > 30000); // 30秒でタイムアウト
    return isStale;
  });
  
  staleConnections.forEach(ws => {
    console.log('🧹 古い接続を強制削除:', ws.readyState);
    activeConnections.delete(ws);
    if (ws.readyState === WebSocket.OPEN) {
      ws.close(1001, 'Connection cleanup');
    }
  });
  
  if (staleConnections.length > 0) {
    console.log('🧹 古い接続をクリーンアップ:', staleConnections.length, '個');
  }
  
  // 接続数制限チェック
  if (activeConnections.size >= MAX_CONNECTIONS) {
    console.log('❌ 最大接続数に達しています。接続を拒否します。', activeConnections.size, '/', MAX_CONNECTIONS);
    clientWs.close(1013, 'Maximum connections reached');
    return;
  }
  
  // 接続をセットに追加（タイムスタンプ付き）
  clientWs.lastActivity = Date.now();
  activeConnections.add(clientWs);
  console.log('✅ クライアント接続承認:', activeConnections.size, '/', MAX_CONNECTIONS);
  
  let openaiWs = null;
  
  try {
    // OpenAI Realtime APIに接続
    openaiWs = new WebSocket('wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01', {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'OpenAI-Beta': 'realtime=v1'
      }
    });

    // OpenAI → Client への転送（関数呼び出し処理を含む）
    openaiWs.on('message', async (data) => {
      try {
        // バイナリデータ（音声）の場合はそのまま転送
        if (data instanceof Buffer && !isTextMessage(data)) {
          console.log('🎵 音声データ転送:', data.length, 'bytes');
          if (clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(data);
          }
          return;
        }

        // テキストメッセージの場合はJSONとして処理
        console.log('📨 プロキシでJSONメッセージ受信:', data.toString());
        const message = JSON.parse(data.toString());
        
        // 関数呼び出しの処理
        if (message.type === 'response.function_call_arguments.done') {
          const functionName = message.name;
          const args = JSON.parse(message.arguments);
          
          console.log('🔧 関数呼び出し検出:', functionName, args);
          
          // 関数を実行
          const result = await handleFunctionCall(functionName, args);
          
          // 結果をOpenAIに送信
          const functionResult = {
            type: 'conversation.item.create',
            item: {
              type: 'function_call_output',
              call_id: message.call_id,
              output: JSON.stringify(result)
            }
          };
          
          openaiWs.send(JSON.stringify(functionResult));
          
          // レスポンス生成を指示
          openaiWs.send(JSON.stringify({ type: 'response.create' }));
        }
        
        // 通常のメッセージはそのまま転送
        console.log('📤 ブラウザに転送:', message.type);
        if (clientWs.readyState === WebSocket.OPEN) {
          // JSONメッセージは明示的に文字列として送信
          const jsonString = typeof data === 'string' ? data : data.toString();
          console.log('📝 送信データ形式:', typeof jsonString, 'length:', jsonString.length);
          clientWs.send(jsonString, { binary: false });
        } else {
          console.warn('⚠️ クライアントWebSocketが閉じられています');
        }
        
      } catch (error) {
        console.error('❌ メッセージ処理エラー:', error);
        // エラーでも通常のメッセージは転送
        if (clientWs.readyState === WebSocket.OPEN) {
          // JSONメッセージは明示的に文字列として送信
          const jsonString = typeof data === 'string' ? data : data.toString();
          clientWs.send(jsonString, { binary: false });
        }
      }
    });

    // Client → OpenAI への転送
    clientWs.on('message', (data) => {
      // 活動タイムスタンプを更新
      clientWs.lastActivity = Date.now();
      
      if (openaiWs && openaiWs.readyState === WebSocket.OPEN) {
        openaiWs.send(data);
      }
    });

    // OpenAI接続確立
    openaiWs.on('open', () => {
      console.log('✅ OpenAI Realtime APIに接続成功');
      
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
- タスク開始時：「承知しました。○○を実行します」
- 進捗中：「○○を取得中です」「記事を生成中です」
- 完了時：「○○が完了しました！」
- エラー時：「申し訳ありません。○○でエラーが発生しました」

指示理解:
- 「記事生成」「ブログ作成」→ execute_blog_generation関数を呼び出す
- 「トレンド調査」→ search_trends関数を呼び出す

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
      
      console.log('📤 セッション設定をOpenAIに送信:', JSON.stringify(sessionConfig, null, 2));
      openaiWs.send(JSON.stringify(sessionConfig));
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
          details: error.message
        }
      }));
    }
  }

  // クライアント切断時のクリーンアップ
  clientWs.on('close', () => {
    console.log('👋 クライアント切断');
    activeConnections.delete(clientWs);
    console.log('📊 残り接続数:', activeConnections.size, '/', MAX_CONNECTIONS);
    if (openaiWs && openaiWs.readyState === WebSocket.OPEN) {
      openaiWs.close();
    }
  });

  clientWs.on('error', (error) => {
    console.error('❌ Client WebSocket error:', error);
    activeConnections.delete(clientWs);
    console.log('📊 残り接続数:', activeConnections.size, '/', MAX_CONNECTIONS);
    if (openaiWs && openaiWs.readyState === WebSocket.OPEN) {
      openaiWs.close();
    }
  });
});

// サーバー起動
server.listen(PORT, () => {
  console.log(`🚀 音声プロキシサーバーがポート${PORT}で起動しました`);
  console.log(`📡 WebSocket: ws://localhost:${PORT}`);
}); 