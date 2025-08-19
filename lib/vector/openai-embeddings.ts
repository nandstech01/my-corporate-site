import OpenAI from 'openai';
import { ExtractedContent } from './content-extractor';

export interface VectorData {
  id: string;
  content: string;
  metadata: {
    url: string;
    title: string;
    type: string;
    section?: string;
    wordCount: number;
    createdAt: string;
    serviceId?: string; // 追加
    category?: string; // 追加
  };
  embedding: number[];
}

export class OpenAIEmbeddings {
  private openai: OpenAI;
  private readonly model = 'text-embedding-3-large';
  private readonly maxTokens = 8192; // text-embedding-3-large の最大トークン数
  private readonly batchSize = 100; // バッチサイズ
  private readonly dimensions = 1536; // Supabaseテーブルに合わせて1536次元に設定

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API キーが設定されていません');
    }
    
    this.openai = new OpenAI({
      apiKey: apiKey,
    });
  }

  /**
   * 単一のテキストをベクトル化
   */
  async embedSingle(text: string): Promise<number[]> {
    try {
      const response = await this.openai.embeddings.create({
        model: this.model,
        input: text,
        encoding_format: 'float',
        dimensions: this.dimensions,
      });

      return response.data[0].embedding;
    } catch (error) {
      console.error('OpenAI Embeddings エラー:', error);
      throw error;
    }
  }

  /**
   * バッチでテキストをベクトル化
   */
  async embedBatch(texts: string[]): Promise<number[][]> {
    const batches = this.createBatches(texts, this.batchSize);
    const results: number[][] = [];

    for (const batch of batches) {
      try {
        const response = await this.openai.embeddings.create({
          model: this.model,
          input: batch,
          encoding_format: 'float',
          dimensions: this.dimensions,
        });

        results.push(...response.data.map(item => item.embedding));
        
        // レート制限を避けるための小さな待機
        await this.sleep(100);
      } catch (error) {
        console.error('バッチベクトル化エラー:', error);
        throw error;
      }
    }

    return results;
  }

  /**
   * ExtractedContentをVectorDataに変換
   */
  async processExtractedContent(contents: ExtractedContent[]): Promise<VectorData[]> {
    const vectorData: VectorData[] = [];
    
    for (const content of contents) {
      try {
        // コンテンツを適切なサイズに分割
        const chunks = this.splitContent(content.content, content.title);
        
        // 各チャンクをベクトル化
        const embeddings = await this.embedBatch(chunks);
        
        // VectorDataオブジェクトを作成
        for (let i = 0; i < chunks.length; i++) {
          const id = `${content.url}-chunk-${i}`;
          vectorData.push({
            id,
            content: chunks[i],
            metadata: {
              url: content.url,
              title: content.title,
              type: content.metadata.type,
              section: i > 0 ? `section-${i}` : undefined,
              wordCount: chunks[i].split(/\s+/).length,
              createdAt: new Date().toISOString(),
              // 重要: service_idを追加
              serviceId: content.metadata.serviceId,
              category: content.metadata.category
            },
            embedding: embeddings[i],
          });
        }
        
        console.log(`✅ ベクトル化完了: ${content.title} (${chunks.length}チャンク)`);
      } catch (error) {
        console.error(`❌ ベクトル化エラー: ${content.title}`, error);
        // エラーがあっても続行
      }
    }

    return vectorData;
  }

  /**
   * コンテンツを適切なサイズに分割
   */
  private splitContent(content: string, title: string): string[] {
    const maxChunkSize = 6000; // 安全なチャンクサイズ
    const chunks: string[] = [];
    
    // タイトルをプレフィックスとして追加
    const titlePrefix = `# ${title}\n\n`;
    
    if (content.length <= maxChunkSize) {
      // 小さなコンテンツはそのまま
      chunks.push(titlePrefix + content);
    } else {
      // 大きなコンテンツは段落で分割
      const paragraphs = content.split('\n\n');
      let currentChunk = titlePrefix;
      
      for (const paragraph of paragraphs) {
        if (currentChunk.length + paragraph.length <= maxChunkSize) {
          currentChunk += paragraph + '\n\n';
        } else {
          if (currentChunk.length > titlePrefix.length) {
            chunks.push(currentChunk.trim());
            currentChunk = titlePrefix + paragraph + '\n\n';
          } else {
            // 段落が長すぎる場合は強制分割
            const words = paragraph.split(' ');
            let wordChunk = titlePrefix;
            
            for (const word of words) {
              if (wordChunk.length + word.length <= maxChunkSize) {
                wordChunk += word + ' ';
              } else {
                chunks.push(wordChunk.trim());
                wordChunk = titlePrefix + word + ' ';
              }
            }
            
            if (wordChunk.length > titlePrefix.length) {
              currentChunk = wordChunk;
            } else {
              currentChunk = titlePrefix;
            }
          }
        }
      }
      
      if (currentChunk.length > titlePrefix.length) {
        chunks.push(currentChunk.trim());
      }
    }

    return chunks;
  }

  /**
   * 配列をバッチに分割
   */
  private createBatches<T>(array: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < array.length; i += batchSize) {
      batches.push(array.slice(i, i + batchSize));
    }
    return batches;
  }

  /**
   * 待機用ヘルパー
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 使用状況の取得
   */
  async getUsage(): Promise<{ model: string; maxTokens: number; batchSize: number }> {
    return {
      model: this.model,
      maxTokens: this.maxTokens,
      batchSize: this.batchSize,
    };
  }

  /**
   * 直接的な埋め込み生成 (シンプルインターフェース)
   */
  async createEmbedding(text: string, metadata: any): Promise<VectorData> {
    const embedding = await this.embedSingle(text);
    
    return {
      id: metadata.id || `embedding-${Date.now()}`,
      content: text,
      metadata: {
        url: metadata.url || '',
        title: metadata.title || '',
        type: metadata.type || 'unknown',
        section: metadata.section,
        wordCount: text.split(/\s+/).length,
        createdAt: metadata.createdAt || new Date().toISOString(),
      },
      embedding,
    };
  }
} 