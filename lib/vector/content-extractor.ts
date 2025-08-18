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

// 全14サービスページの情報（完全版）
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
    title: 'AIO SEO対策サービス',
    description: 'AI検索時代に対応したGEO（Generative Engine Optimization）とAIO（AI Optimization）の包括的SEO戦略。',
    features: ['GEO最適化', 'AI検索対応', 'レリバンスエンジニアリング', 'コンテンツ最適化'],
    pricing: 'ライト: 15万円〜、スタンダード: 30万円〜、プレミアム: 60万円〜',
    technicalSpecs: 'レリバンスエンジニアリング、構造化データ、セマンティックSEO、AI検索最適化'
  },
  {
    slug: 'vector-rag',
    serviceId: 'vector-rag',
    title: 'ベクトルRAGシステム開発',
    description: 'Triple RAG（Company・Trend・YouTube）統合によるAI検索・引用最適化システム。OpenAI Embeddingsとベクトル検索の高度活用。',
    features: ['Triple RAG統合', 'ベクトル検索', 'AI引用最適化', 'リアルタイム学習'],
    pricing: 'ベーシック: 80万円〜、プロフェッショナル: 150万円〜、エンタープライズ: 300万円〜',
    technicalSpecs: 'OpenAI Embeddings, Supabase Vector, PostgreSQL pgvector, Next.js'
  },
  {
    slug: 'chatbot-development',
    serviceId: 'chatbot-development',
    title: 'AIチャットボット開発',
    description: 'OpenAI APIとRAGシステムを統合した高精度チャットボット。カスタマーサポートと営業効率を大幅向上。',
    features: ['OpenAI統合', 'RAG検索連携', '多言語対応', 'カスタマイズ可能'],
    pricing: 'ベーシック: 25万円〜、スタンダード: 50万円〜、プレミアム: 100万円〜',
    technicalSpecs: 'OpenAI GPT-4, RAGシステム, WebSocket, React'
  },

  {
    slug: 'hr-solutions',
    serviceId: 'hr-solutions',
    title: 'HR支援ソリューション',
    description: 'AI活用による人事業務効率化。採用、評価、研修管理を統合したデジタルHRプラットフォーム。',
    features: ['採用支援AI', '人事評価システム', 'スキル管理', '研修プラットフォーム'],
    pricing: 'スタンダード: 20万円〜、プレミアム: 40万円〜、エンタープライズ: 80万円〜',
    technicalSpecs: 'AI分析エンジン, データベース統合, セキュリティ対応'
  },
  {
    slug: 'sns-automation',
    serviceId: 'sns-automation',
    title: 'SNS自動化システム',
    description: 'AI駆動のSNSマーケティング自動化。コンテンツ生成から投稿スケジューリングまで一括管理。',
    features: ['自動投稿', 'コンテンツ生成', '分析レポート', '複数プラットフォーム対応'],
    pricing: 'ベーシック: 8万円〜、スタンダード: 15万円〜、プロ: 30万円〜',
    technicalSpecs: 'SNS API統合, AI コンテンツ生成, スケジューリングシステム'
  },
  {
    slug: 'mcp-servers',
    serviceId: 'mcp-servers',
    title: 'MCPサーバー開発',
    description: 'Model Context Protocol（MCP）準拠のサーバー開発。Claude DesktopやCursor等のAIツール連携を実現。',
    features: ['MCP準拠開発', 'AIツール統合', 'カスタム機能実装', 'セキュア通信'],
    pricing: 'ベーシック: 30万円〜、スタンダード: 60万円〜、エンタープライズ: 120万円〜',
    technicalSpecs: 'MCP Protocol, TypeScript, Node.js, セキュリティ対応'
  },
  {
    slug: 'lp',
    serviceId: 'lp',
    title: '個人向けAIリスキリング研修',
    description: '人材開発支援助成金を活用した個人向けAI研修プログラム。ChatGPT活用、SNS自動運用、AI副業支援などの実践的スキル習得。',
    features: ['助成金対応研修', 'ChatGPT実践活用', 'AI副業支援', 'SNS運用技術', 'キャリアアップ支援'],
    pricing: '基本プラン: 5万円〜、充実プラン: 15万円〜、包括プラン: 30万円〜（助成金活用可能）',
    technicalSpecs: '個別指導対応, オンライン学習, 実践課題, 就職・転職サポート'
  },
  {
    slug: 'ai-site',
    serviceId: 'ai-site',
    title: 'AIサイト開発（Triple RAG統合）',
    description: 'Triple RAGシステム統合による次世代Webサイト。AI検索最適化、自動コンテンツ生成、Fragment ID実装で完全自動化を実現。',
    features: ['Triple RAG統合', '自動ブログ生成', 'Fragment ID実装', 'AI検索最適化'],
    pricing: 'スタンダード: 100万円〜、プレミアム: 200万円〜、フルパッケージ: 400万円〜',
    technicalSpecs: 'Next.js 14, OpenAI Embeddings, Supabase Vector, 構造化データ, レリバンスエンジニアリング'
  },
  {
    slug: 'fukugyo',
    serviceId: 'fukugyo',
    title: 'AI副業支援サービス',
    description: 'ChatGPTを活用したSEOライティングや副業ノウハウをサポート。AI時代の新しい働き方を実現する包括的副業支援プラットフォーム。',
    features: ['ChatGPT活用技術', 'SEOライティング', '副業戦略立案', 'AI活用スキル習得'],
    pricing: 'ベーシック: 5万円〜、スタンダード: 12万円〜、プレミアム: 25万円〜',
    technicalSpecs: 'ChatGPT API, SEO最適化ツール, コンテンツ管理システム, 収益分析ダッシュボード'
  },
  {
    slug: 'corporate',
    serviceId: 'corporate',
    title: '法人向けAIソリューション',
    description: '企業のDX推進と生成AI活用を支援する包括的なソリューション。業界別カスタマイズ対応により組織全体のAIリテラシー向上を実現。',
    features: ['AIリスキリング研修', 'DX推進支援', '業務自動化コンサルティング', 'AI戦略・ガバナンス構築'],
    pricing: 'AIリスキリング研修: 300万円〜、DX推進支援: 500万円〜、業務自動化: 200万円〜、AI戦略: 800万円〜',
    technicalSpecs: '業界別カスタマイズ、包括的サポート体制、ROI計算ツール、継続的フォローアップ'
  },
  {
    slug: 'video-generation',
    serviceId: 'video-generation',
    title: 'AI動画生成サービス',
    description: 'Midjourney、Veo 3、Runway MLなどの最新AI動画生成APIを活用し、コンテンツ制作を革新的に効率化するシステムを構築。',
    features: ['テキスト→動画生成', '画像→動画変換', 'AI画像生成統合', 'バッチ処理システム'],
    pricing: 'テキスト→動画: 300万円〜、画像→動画: 250万円〜、AI画像統合: 400万円〜、バッチ処理: 600万円〜',
    technicalSpecs: 'Midjourney API, Veo 3, Runway ML, DALL-E 3, Stable Diffusion, バッチ処理対応'
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
    serviceId?: string; // サービスページの場合に追加
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
  async extractServicePages(): Promise<ExtractedContent[]> {
    const contents: ExtractedContent[] = [];
    const appPath = join(this.basePath, 'app');
    
    // SERVICE_PAGESから動的にディレクトリリストを生成（重複防止）
    const serviceDirectories = SERVICE_PAGES.map(page => page.slug);
    
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
   * サービスページのコンテンツを抽出（改善版 - 定義済みデータ優先使用）
   */
  private async extractServicePageContent(servicePath: string, serviceDir: string): Promise<ExtractedContent | null> {
    try {
      // まず SERVICE_PAGES から定義済みデータを取得
      const serviceInfo = SERVICE_PAGES.find(service => service.slug === serviceDir);
      
      if (serviceInfo) {
        // 定義済みデータが存在する場合、それを優先使用
        const content = [
          serviceInfo.description,
          `主な機能: ${serviceInfo.features.join('、')}`,
          `料金体系: ${serviceInfo.pricing}`,
          `技術仕様: ${serviceInfo.technicalSpecs}`
        ].join(' ');
        
        console.log(`✅ 定義済みデータ使用: ${serviceInfo.title}`);
        
        return {
          url: `/${serviceDir}`,
          title: serviceInfo.title,
          description: serviceInfo.description,
          content: content,
          metadata: {
            type: 'service',
            serviceId: serviceInfo.serviceId,
            category: serviceDir,
            lastModified: new Date().toISOString(),
            wordCount: content.split(/\s+/).length,
            headings: serviceInfo.features.map(feature => `機能: ${feature}`)
          }
        };
      }
      
      // フォールバック: 既存のReactファイル解析
      const pageFile = join(servicePath, 'page.tsx');
      if (!this.fileExists(pageFile)) {
        console.warn(`⚠️ サービスページが見つかりません: ${serviceDir}`);
        return null;
      }
      
      const content = readFileSync(pageFile, 'utf-8');
      const extractedData = this.extractReactContent(content);
      
      // Reactファイルから抽出したデータが不完全な場合の補完
      const title = extractedData.title || this.formatServiceName(serviceDir);
      const description = extractedData.description || `${title}サービスの詳細情報`;
      const finalContent = extractedData.content || `${title}に関するサービス情報`;
      
      console.log(`⚠️ フォールバック解析使用: ${title}`);
      
      return {
        url: `/${serviceDir}`,
        title: title,
        description: description,
        content: finalContent,
        metadata: {
          type: 'service',
          serviceId: serviceDir,
          category: serviceDir,
          lastModified: this.getFileLastModified(pageFile),
          wordCount: finalContent.split(/\s+/).length,
          headings: extractedData.headings
        }
      };
    } catch (error) {
      console.error(`❌ サービスページ抽出エラー ${serviceDir}:`, error);
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
   * Reactコンテンツから情報を抽出（改善版 - プレースホルダー除去対応）
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
    
    // プレースホルダーやJavaScript式を除去するヘルパー関数
    const cleanText = (text: string): string => {
      return text
        // {variable} や {function()} パターンを除去
        .replace(/\{[^}]+\}/g, '')
        // HTML entities をデコード
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        // 余分な空白を正規化
        .replace(/\s+/g, ' ')
        .trim();
    };
    
    // JSX内のテキストコンテンツを抽出
    for (const line of lines) {
      const trimmed = line.trim();
      
      // コメント行やimport文をスキップ
      if (trimmed.startsWith('//') || 
          trimmed.startsWith('/*') || 
          trimmed.startsWith('import ') ||
          trimmed.startsWith('export ') ||
          trimmed.includes('className=') ||
          trimmed.includes('onClick=') ||
          trimmed.includes('useState') ||
          trimmed.includes('useEffect')) {
        continue;
      }
      
      // タイトルを抽出
      if (trimmed.includes('<h1') || trimmed.includes('<title')) {
        const match = trimmed.match(/>([^<]+)</);
        if (match && !title) {
          const cleanedTitle = cleanText(match[1]);
          if (cleanedTitle.length > 0) {
            title = cleanedTitle;
          }
        }
      }
      
      // 見出しを抽出
      if (trimmed.includes('<h2') || trimmed.includes('<h3')) {
        const match = trimmed.match(/>([^<]+)</);
        if (match) {
          const cleanedHeading = cleanText(match[1]);
          if (cleanedHeading.length > 0) {
            headings.push(cleanedHeading);
          }
        }
      }
      
      // テキストコンテンツを抽出
      if (trimmed.includes('<p') || trimmed.includes('<li') || trimmed.includes('<span')) {
        const match = trimmed.match(/>([^<]+)</);
        if (match) {
          const cleanedContent = cleanText(match[1]);
          // 意味のあるテキストのみを保存（10文字以上、プレースホルダーでない）
          if (cleanedContent.length > 10 && 
              !cleanedContent.includes('{') && 
              !cleanedContent.includes('}') &&
              !cleanedContent.includes('map(') &&
              !cleanedContent.includes('filter(') &&
              !cleanedContent.includes('useState') &&
              !cleanedContent.includes('useEffect')) {
            contentParts.push(cleanedContent);
          }
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
      'mcp-servers': 'MCPサーバー開発',
      'lp': '人材開発支援助成金対応AI研修',
      'ai-site': 'AIサイト開発（Triple RAG統合）'
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