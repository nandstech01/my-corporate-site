import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { JSDOM } from 'jsdom';
import { supabase } from '@/lib/supabase';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ContentChunk {
  pageSlug: string;
  contentType: 'service' | 'company' | 'technical' | 'pricing';
  sectionTitle?: string;
  content: string;
  fragmentId?: string;
  serviceId?: string;
  relevanceScore: number;
}

interface ServicePageInfo {
  slug: string;
  serviceId: string;
  title: string;
  description: string;
  features: string[];
  pricing: string;
  technicalSpecs: string;
}

// 全9サービスページの情報
const SERVICE_PAGES: ServicePageInfo[] = [
  {
    slug: 'ai-agents',
    serviceId: 'ai-agents',
    title: 'AIエージェント開発サービス',
    description: 'Mastra Frameworkを活用したAIエージェント開発。自動化・効率化を実現する高度なAIシステム構築。',
    features: ['Mastra Framework活用', 'カスタムAIエージェント', '業務自動化', 'API統合'],
    pricing: 'スタンダード: 50万円〜、プレミアム: 100万円〜、エンタープライズ: 200万円〜',
    technicalSpecs: 'Node.js, TypeScript, Mastra Framework, OpenAI API, 各種外部API統合'
  },
  {
    slug: 'system-development',
    serviceId: 'system-development',
    title: 'システム開発サービス',
    description: 'Next.js、React、Node.jsを活用したモダンなWebアプリケーション開発。スケーラブルなシステム構築。',
    features: ['Next.js開発', 'React開発', 'Node.js開発', 'データベース設計'],
    pricing: 'ベーシック: 30万円〜、スタンダード: 80万円〜、プレミアム: 150万円〜',
    technicalSpecs: 'Next.js, React, Node.js, TypeScript, PostgreSQL, Supabase'
  },
  {
    slug: 'aio-seo',
    serviceId: 'aio-seo',
    title: 'AIO-SEO最適化サービス',
    description: 'Mike King理論に基づくレリバンスエンジニアリング。AI検索最適化によるオーガニック流入増加。',
    features: ['Mike King理論', 'レリバンスエンジニアリング', 'AI検索最適化', 'LLMO対応'],
    pricing: 'ライト: 20万円〜、スタンダード: 50万円〜、プロ: 100万円〜',
    technicalSpecs: 'レリバンスエンジニアリング、構造化データ、セマンティックSEO、AI検索対応'
  },
  {
    slug: 'vector-rag',
    serviceId: 'vector-rag',
    title: 'Vector RAGシステム構築',
    description: 'pgvectorを活用したベクトル検索システム。高精度な情報検索とAI応答システム構築。',
    features: ['pgvector活用', 'ベクトル検索', 'RAGシステム', 'セマンティック検索'],
    pricing: 'ベーシック: 40万円〜、アドバンス: 80万円〜、エンタープライズ: 150万円〜',
    technicalSpecs: 'pgvector, OpenAI Embeddings, PostgreSQL, Supabase, セマンティック検索'
  },
  {
    slug: 'video-generation',
    serviceId: 'video-generation',
    title: '動画生成AIサービス',
    description: 'AI技術を活用した動画コンテンツ自動生成。マーケティング動画から教育コンテンツまで幅広く対応。',
    features: ['AI動画生成', 'コンテンツ自動化', 'マーケティング動画', '教育コンテンツ'],
    pricing: 'スタンダード: 30万円〜、プロ: 70万円〜、エンタープライズ: 120万円〜',
    technicalSpecs: 'AI動画生成API, 動画編集自動化, コンテンツ管理システム'
  },
  {
    slug: 'hr-solutions',
    serviceId: 'hr-solutions',
    title: 'HR業務効率化ソリューション',
    description: 'AI技術を活用したHR業務の自動化・効率化。採用から人事評価まで包括的にサポート。',
    features: ['採用自動化', '人事評価システム', 'AI面接', 'データ分析'],
    pricing: 'ベーシック: 25万円〜、スタンダード: 60万円〜、プレミアム: 120万円〜',
    technicalSpecs: 'AI面接システム, 人事データ分析, 自動化ワークフロー'
  },
  {
    slug: 'sns-automation',
    serviceId: 'sns-automation',
    title: 'SNS自動化サービス',
    description: 'SNSマーケティングの自動化システム。投稿スケジューリングから効果測定まで一元管理。',
    features: ['投稿自動化', 'スケジューリング', '効果測定', 'マルチプラットフォーム'],
    pricing: 'ライト: 15万円〜、スタンダード: 40万円〜、プロ: 80万円〜',
    technicalSpecs: 'SNS API統合, 投稿自動化, 分析ダッシュボード'
  },
  {
    slug: 'chatbot-development',
    serviceId: 'chatbot-development',
    title: 'チャットボット開発サービス',
    description: 'AIチャットボットの開発・導入サービス。カスタマーサポートから営業支援まで幅広く対応。',
    features: ['AIチャットボット', 'カスタマーサポート', '営業支援', 'マルチチャネル'],
    pricing: 'ベーシック: 20万円〜、アドバンス: 50万円〜、エンタープライズ: 100万円〜',
    technicalSpecs: 'OpenAI API, チャットボットフレームワーク, マルチチャネル対応'
  },
  {
    slug: 'mcp-servers',
    serviceId: 'mcp-servers',
    title: 'MCPサーバー開発',
    description: 'Model Context Protocol (MCP)サーバーの開発・構築サービス。AI統合システムの診断・最適化。',
    features: ['MCPサーバー構築', 'AI統合診断', 'システム最適化', 'プロトコル対応'],
    pricing: 'ベーシック: 35万円〜、プロ: 70万円〜、エンタープライズ: 140万円〜',
    technicalSpecs: 'MCP Protocol, AI統合システム, 診断ツール開発'
  }
];

// 企業情報
const COMPANY_INFO = {
  name: '株式会社エヌアンドエス',
  description: 'AI技術を活用したシステム開発・コンサルティング企業。レリバンスエンジニアリングとAI検索最適化のリーディングカンパニー。',
  services: SERVICE_PAGES.map(page => page.title),
  expertise: ['AI開発', 'システム開発', 'レリバンスエンジニアリング', 'LLMO', 'ベクトル検索'],
  technologies: ['Next.js', 'React', 'Node.js', 'TypeScript', 'OpenAI API', 'pgvector', 'Supabase'],
  mission: 'AI技術で企業の課題を解決し、デジタルトランスフォーメーションを推進する',
  vision: 'AI検索最適化のリーディングカンパニーとして、業界標準を確立する'
};

export interface ExtractedContent {
  url: string;
  title: string;
  description: string;
  content: string;
  metadata: {
    type: 'service' | 'blog' | 'corporate' | 'technical' | 'structured-data' | 'other';
    serviceType?: string;
    category?: string;
    lastModified?: string;
    wordCount: number;
    headings: string[];
    technicalConcepts?: string[];
  };
}

export class ContentExtractor {
  private baseUrl: string;
  private basePath: string;

  constructor(baseUrl: string = 'https://nands.tech', basePath: string = process.cwd()) {
    this.baseUrl = baseUrl;
    this.basePath = basePath;
  }

  /**
   * サイト全体のコンテンツを抽出
   */
  async extractAllContent(): Promise<ExtractedContent[]> {
    const contents: ExtractedContent[] = [];

    // 1. サービスページ（app/以下の各サービスディレクトリ）
    const servicePages = await this.extractServicePages();
    contents.push(...servicePages);

    // 2. 企業情報ページ
    const corporatePages = await this.extractCorporatePages();
    contents.push(...corporatePages);

    // 3. ブログ記事（既存の投稿）
    const blogPages = await this.extractBlogPages();
    contents.push(...blogPages);

    // 4. 技術情報ページ
    const techPages = await this.extractTechnicalPages();
    contents.push(...techPages);

    // 5. レリバンスエンジニアリング関連ファイル（重要！）
    const structuredDataContents = await this.extractStructuredDataFiles();
    contents.push(...structuredDataContents);

    return contents;
  }

  /**
   * レリバンスエンジニアリング関連ファイルを抽出
   */
  private async extractStructuredDataFiles(): Promise<ExtractedContent[]> {
    const contents: ExtractedContent[] = [];
    const structuredDataPath = join(this.basePath, 'lib/structured-data');
    
    try {
      const files = readdirSync(structuredDataPath);
      
      for (const file of files) {
        if (file.endsWith('.ts')) {
          const filePath = join(structuredDataPath, file);
          const fileContent = readFileSync(filePath, 'utf-8');
          
          // TypeScriptファイルからコメントと関数定義を抽出
          const extractedData = this.extractTechnicalContent(fileContent, file);
          
          contents.push({
            url: `/technical/structured-data/${file.replace('.ts', '')}`,
            title: extractedData.title,
            description: extractedData.description,
            content: extractedData.content,
            metadata: {
              type: 'structured-data',
              category: 'relevance-engineering',
              lastModified: this.getFileLastModified(filePath),
              wordCount: extractedData.content.split(/\s+/).length,
              headings: extractedData.headings,
              technicalConcepts: extractedData.technicalConcepts
            }
          });
        }
      }
    } catch (error) {
      console.error('Error extracting structured data files:', error);
    }
    
    return contents;
  }

  /**
   * TypeScriptファイルから技術的コンテンツを抽出
   */
  private extractTechnicalContent(content: string, filename: string): {
    title: string;
    description: string;
    content: string;
    headings: string[];
    technicalConcepts: string[];
  } {
    const lines = content.split('\n');
    const headings: string[] = [];
    const technicalConcepts: string[] = [];
    const contentParts: string[] = [];
    
    let title = filename.replace('.ts', '').replace(/-/g, ' ');
    let description = '';
    
    // ファイル固有のタイトル・説明を設定
    const fileMapping: { [key: string]: { title: string; description: string } } = {
      'index.ts': {
        title: 'レリバンスエンジニアリング統合システム',
        description: 'Mike King理論に基づく構造化データ統合システムのエントリーポイント'
      },
      'entity-relationships.ts': {
        title: '組織・サービスエンティティ関係システム',
        description: '組織とサービス間の関係性を定義し、セマンティックな関連性を構築'
      },
      'validation-system.ts': {
        title: '構造化データ検証システム',
        description: 'JSON-LD構造化データの検証と品質保証システム'
      },
      'auto-toc-system.ts': {
        title: '自動目次生成システム',
        description: 'フラグメント識別子とジャンプリンクを活用した自動目次生成'
      },
      'howto-faq-schema.ts': {
        title: 'HowTo・FAQスキーマシステム',
        description: 'HowToとFAQの構造化データ自動生成システム'
      },
      'semantic-links.ts': {
        title: 'セマンティックリンクシステム',
        description: 'ページ間のセマンティックな関連性に基づく内部リンク最適化'
      },
      'haspart-schema-system.ts': {
        title: 'hasPart スキーマシステム',
        description: 'GEO最適化とトピカルカバレッジのためのhasPart構造化データ生成'
      },
      'author-trust-system.ts': {
        title: '著者信頼システム',
        description: 'E-A-Tに基づく著者情報と信頼性スコアシステム'
      },
      'unified-integration.ts': {
        title: '統合システム',
        description: 'すべてのレリバンスエンジニアリング要素を統合する包括的システム'
      },
      'mdx-section-system.ts': {
        title: 'MDXセクションシステム',
        description: 'MDXベースのセクション管理とコンテンツ構造化システム'
      }
    };
    
    const fileInfo = fileMapping[filename];
    if (fileInfo) {
      title = fileInfo.title;
      description = fileInfo.description;
    }
    
    // コンテンツ解析
    for (const line of lines) {
      const trimmed = line.trim();
      
      // コメントから重要な情報を抽出
      if (trimmed.startsWith('//') || trimmed.startsWith('*')) {
        const comment = trimmed.replace(/^\/\/\s*/, '').replace(/^\*\s*/, '');
        if (comment.length > 10) {
          contentParts.push(comment);
        }
      }
      
      // 型定義、インターフェース、クラス名を抽出
      if (trimmed.includes('interface ') || trimmed.includes('class ') || trimmed.includes('type ')) {
        const match = trimmed.match(/(interface|class|type)\s+([A-Za-z0-9_]+)/);
        if (match) {
          technicalConcepts.push(match[2]);
          headings.push(match[2]);
        }
      }
      
      // 関数名を抽出
      if (trimmed.includes('function ') || trimmed.includes('export ')) {
        const functionMatch = trimmed.match(/(?:function|export)\s+([A-Za-z0-9_]+)/);
        if (functionMatch) {
          technicalConcepts.push(functionMatch[1]);
        }
      }
      
      // 重要なキーワードを抽出
      const keywords = [
        'schema', 'structured-data', 'json-ld', 'seo', 'relevance', 'entity',
        'organization', 'service', 'validation', 'toc', 'fragment', 'semantic',
        'haspart', 'author', 'trust', 'integration', 'mdx', 'section'
      ];
      
      for (const keyword of keywords) {
        if (trimmed.toLowerCase().includes(keyword)) {
          if (!technicalConcepts.includes(keyword)) {
            technicalConcepts.push(keyword);
          }
        }
      }
    }
    
    return {
      title,
      description,
      content: contentParts.join(' '),
      headings,
      technicalConcepts
    };
  }

  /**
   * サービスページを抽出
   */
  private async extractServicePages(): Promise<ExtractedContent[]> {
    const contents: ExtractedContent[] = [];
    const appPath = join(this.basePath, 'app');
    
    const serviceDirectories = [
      'ai-agents', 'chatbot-development', 'vector-rag', 'aio-seo',
      'video-generation', 'hr-solutions', 'system-development',
      'sns-automation', 'mcp-servers', 'lp', 'ai-site'
    ];
    
    for (const serviceDir of serviceDirectories) {
      const servicePath = join(appPath, serviceDir);
      if (this.directoryExists(servicePath)) {
        const content = await this.extractServicePageContent(servicePath, serviceDir);
        if (content) {
          contents.push(content);
        }
      }
    }
    
    return contents;
  }

  /**
   * 企業情報ページを抽出
   */
  private async extractCorporatePages(): Promise<ExtractedContent[]> {
    const contents: ExtractedContent[] = [];
    const corporatePages = ['about', 'corporate', 'sustainability', 'reviews'];
    
    for (const page of corporatePages) {
      const pagePath = join(this.basePath, 'app', page);
      if (this.directoryExists(pagePath)) {
        const content = await this.extractCorporatePageContent(pagePath, page);
        if (content) {
          contents.push(content);
        }
      }
    }
    
    return contents;
  }

  /**
   * ブログページを抽出
   */
  private async extractBlogPages(): Promise<ExtractedContent[]> {
    const contents: ExtractedContent[] = [];
    // 既存のブログ記事があればここで抽出
    // 現在はプレースホルダー
    return contents;
  }

  /**
   * 技術情報ページを抽出
   */
  private async extractTechnicalPages(): Promise<ExtractedContent[]> {
    const contents: ExtractedContent[] = [];
    const techPages = ['faq', 'legal', 'privacy', 'terms'];
    
    for (const page of techPages) {
      const pagePath = join(this.basePath, 'app', page);
      if (this.directoryExists(pagePath)) {
        const content = await this.extractTechnicalPageContent(pagePath, page);
        if (content) {
          contents.push(content);
        }
      }
    }
    
    return contents;
  }

  /**
   * サービスページのコンテンツを抽出
   */
  private async extractServicePageContent(servicePath: string, serviceDir: string): Promise<ExtractedContent | null> {
    try {
      const pageFile = join(servicePath, 'page.tsx');
      if (!this.fileExists(pageFile)) return null;
      
      const content = readFileSync(pageFile, 'utf-8');
      const extractedData = this.extractReactContent(content);
      
      return {
        url: `/${serviceDir}`,
        title: extractedData.title || this.formatServiceName(serviceDir),
        description: extractedData.description || `${this.formatServiceName(serviceDir)}のサービス詳細`,
        content: extractedData.content,
        metadata: {
          type: 'service',
          serviceType: serviceDir,
          lastModified: this.getFileLastModified(pageFile),
          wordCount: extractedData.content.split(/\s+/).length,
          headings: extractedData.headings
        }
      };
    } catch (error) {
      console.error(`Error extracting service page ${serviceDir}:`, error);
      return null;
    }
  }

  /**
   * 企業情報ページのコンテンツを抽出
   */
  private async extractCorporatePageContent(pagePath: string, pageType: string): Promise<ExtractedContent | null> {
    try {
      const pageFile = join(pagePath, 'page.tsx');
      if (!this.fileExists(pageFile)) return null;
      
      const content = readFileSync(pageFile, 'utf-8');
      const extractedData = this.extractReactContent(content);
      
      return {
        url: `/${pageType}`,
        title: extractedData.title || this.formatPageName(pageType),
        description: extractedData.description || `${this.formatPageName(pageType)}の詳細情報`,
        content: extractedData.content,
        metadata: {
          type: 'corporate',
          category: pageType,
          lastModified: this.getFileLastModified(pageFile),
          wordCount: extractedData.content.split(/\s+/).length,
          headings: extractedData.headings
        }
      };
    } catch (error) {
      console.error(`Error extracting corporate page ${pageType}:`, error);
      return null;
    }
  }

  /**
   * 技術情報ページのコンテンツを抽出
   */
  private async extractTechnicalPageContent(pagePath: string, pageType: string): Promise<ExtractedContent | null> {
    try {
      const pageFile = join(pagePath, 'page.tsx');
      if (!this.fileExists(pageFile)) return null;
      
      const content = readFileSync(pageFile, 'utf-8');
      const extractedData = this.extractReactContent(content);
      
      return {
        url: `/${pageType}`,
        title: extractedData.title || this.formatPageName(pageType),
        description: extractedData.description || `${this.formatPageName(pageType)}の詳細情報`,
        content: extractedData.content,
        metadata: {
          type: 'technical',
          category: pageType,
          lastModified: this.getFileLastModified(pageFile),
          wordCount: extractedData.content.split(/\s+/).length,
          headings: extractedData.headings
        }
      };
    } catch (error) {
      console.error(`Error extracting technical page ${pageType}:`, error);
      return null;
    }
  }

  /**
   * Reactコンテンツから情報を抽出
   */
  private extractReactContent(content: string): {
    title: string;
    description: string;
    content: string;
    headings: string[];
  } {
    const lines = content.split('\n');
    const headings: string[] = [];
    const contentParts: string[] = [];
    let title = '';
    let description = '';
    
    // JSX内のテキストコンテンツを抽出
    for (const line of lines) {
      const trimmed = line.trim();
      
      // タイトルを抽出
      if (trimmed.includes('<h1') || trimmed.includes('<title')) {
        const match = trimmed.match(/>([^<]+)</);
        if (match && !title) {
          title = match[1];
        }
      }
      
      // 見出しを抽出
      if (trimmed.includes('<h2') || trimmed.includes('<h3')) {
        const match = trimmed.match(/>([^<]+)</);
        if (match) {
          headings.push(match[1]);
        }
      }
      
      // テキストコンテンツを抽出
      if (trimmed.includes('<p') || trimmed.includes('<li') || trimmed.includes('<span')) {
        const match = trimmed.match(/>([^<]+)</);
        if (match && match[1].length > 10) {
          contentParts.push(match[1]);
        }
      }
    }
    
    return {
      title,
      description,
      content: contentParts.join(' '),
      headings
    };
  }

  /**
   * サービス名をフォーマット
   */
  private formatServiceName(serviceDir: string): string {
    const nameMap: { [key: string]: string } = {
      'ai-agents': 'AIエージェント開発',
      'chatbot-development': 'チャットボット開発',
      'vector-rag': 'ベクトルRAGシステム',
      'aio-seo': 'AIO SEO対策',
      'video-generation': 'AI動画生成',
      'hr-solutions': 'HR支援ソリューション',
      'system-development': 'システム開発',
      'sns-automation': 'SNS自動化',
      'mcp-servers': 'MCPサーバー開発'
    };
    
    return nameMap[serviceDir] || serviceDir;
  }

  /**
   * ページ名をフォーマット
   */
  private formatPageName(pageType: string): string {
    const nameMap: { [key: string]: string } = {
      'about': '会社概要',
      'corporate': '企業情報',
      'sustainability': '持続可能性',
      'reviews': 'お客様の声',
      'faq': 'よくある質問',
      'legal': '法的情報',
      'privacy': 'プライバシーポリシー',
      'terms': '利用規約'
    };
    
    return nameMap[pageType] || pageType;
  }

  /**
   * ファイルの最終更新日を取得
   */
  private getFileLastModified(filePath: string): string {
    try {
      const stats = statSync(filePath);
      return stats.mtime.toISOString();
    } catch {
      return new Date().toISOString();
    }
  }

  /**
   * ディレクトリ存在確認
   */
  private directoryExists(path: string): boolean {
    try {
      return statSync(path).isDirectory();
    } catch {
      return false;
    }
  }

  /**
   * ファイル存在確認
   */
  private fileExists(path: string): boolean {
    try {
      return statSync(path).isFile();
    } catch {
      return false;
    }
  }
}

// 実行用の関数
export async function extractAndVectorizeContent(): Promise<void> {
  const extractor = new ContentExtractor();
  await extractor.extractAllContent();
} 