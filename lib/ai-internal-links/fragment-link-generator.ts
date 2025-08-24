/**
 * Fragment ID自動内部リンク生成システム
 * AI引用最適化 + SEO強化 + ベクトルリンク活用
 * 
 * @description
 * 記事作成時に関連するFragment IDを自動検出し、
 * Complete URIでの内部リンクを生成してMarkdownに挿入する
 * 
 * @author 株式会社エヌアンドエス
 * @version 1.0.0
 */

import { createClient } from '@supabase/supabase-js';

// Fragment検索結果の型定義
interface FragmentSearchResult {
  fragment_id: string;
  complete_uri: string;
  page_path: string;
  content_title: string;
  content: string;
  category: string;
  relevanceScore: number;
}

// ===== インターフェース定義 =====

export interface FragmentInternalLink {
  /** 表示テキスト */
  displayText: string;
  /** Complete URI（Fragment ID付き） */
  completeUri: string;
  /** Fragment ID */
  fragmentId: string;
  /** 関連性スコア（0-1） */
  relevanceScore: number;
  /** ページパス */
  pagePath: string;
  /** カテゴリ */
  category: string;
  /** 挿入位置のヒント */
  insertionHint: 'paragraph' | 'list' | 'section-end';
}

export interface AutoLinkConfig {
  /** 最大リンク数 */
  maxLinks: number;
  /** 関連性閾値 */
  relevanceThreshold: number;
  /** 同一ページ除外 */
  excludeSamePage: boolean;
  /** 優先カテゴリ */
  preferredCategories?: string[];
  /** 挿入パターン */
  insertionStyle: 'inline' | 'reference' | 'sidebar';
}

// ===== メインクラス =====

export class FragmentLinkGenerator {
  private supabase;

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * メイン機能：記事内容から関連Fragment内部リンクを自動生成
   */
  async generateInternalLinks(
    content: string,
    currentPagePath: string,
    config: AutoLinkConfig = {
      maxLinks: 5,
      relevanceThreshold: 0.7,
      excludeSamePage: true,
      insertionStyle: 'inline'
    }
  ): Promise<FragmentInternalLink[]> {
    
    console.log('🔗 Fragment内部リンク自動生成開始...');
    console.log(`📄 対象ページ: ${currentPagePath}`);
    
    try {
      // 1. テキストベースの関連Fragment検索（ベクトル検索の代替）
      const relatedFragments = await this.searchRelatedFragmentsByText(
        content,
        currentPagePath,
        config
      );
      
      // 3. 関連性スコア算出とフィルタリング
      const filteredFragments = relatedFragments
        .filter(fragment => fragment.relevanceScore >= config.relevanceThreshold)
        .slice(0, config.maxLinks);
      
      // 4. 内部リンク生成
      const internalLinks: FragmentInternalLink[] = filteredFragments.map(fragment => ({
        displayText: this.generateDisplayText(fragment),
        completeUri: fragment.complete_uri,
        fragmentId: fragment.fragment_id,
        relevanceScore: fragment.relevanceScore,
        pagePath: fragment.page_path,
        category: fragment.category,
        insertionHint: this.determineInsertionHint(fragment, content)
      }));
      
      console.log(`✅ ${internalLinks.length}個の関連Fragment内部リンクを生成`);
      return internalLinks;
      
    } catch (error) {
      console.error('❌ Fragment内部リンク生成エラー:', error);
      return [];
    }
  }

  /**
   * テキストベースで関連Fragmentを検索
   */
  private async searchRelatedFragmentsByText(
    content: string,
    excludePagePath: string,
    config: AutoLinkConfig
  ): Promise<FragmentSearchResult[]> {
    try {
      // キーワード抽出（簡略版）
      const keywords = this.extractKeywords(content);
      
      // Fragment検索クエリ
      let query = this.supabase
        .from('fragment_vectors')
        .select('fragment_id, complete_uri, page_path, content_title, content, category')
        .limit(config.maxLinks * 2);
      
      // 同一ページ除外
      if (config.excludeSamePage) {
        query = query.neq('page_path', excludePagePath);
      }
      
      // カテゴリフィルタ
      if (config.preferredCategories && config.preferredCategories.length > 0) {
        query = query.in('category', config.preferredCategories);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('❌ Fragment検索エラー:', error);
        return [];
      }
      
      // テキスト類似度計算（簡略版）
      return (data || []).map((item: any) => ({
        fragment_id: item.fragment_id,
        complete_uri: item.complete_uri,
        page_path: item.page_path,
        content_title: item.content_title,
        content: item.content,
        category: item.category,
        relevanceScore: this.calculateTextSimilarity(content, item.content)
      }));
      
    } catch (error) {
      console.error('❌ テキスト検索エラー:', error);
      return [];
    }
  }

  /**
   * 簡易キーワード抽出
   */
  private extractKeywords(text: string): string[] {
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2);
    
    // 重複除去
    const uniqueWords = words.filter((word, index) => words.indexOf(word) === index);
    return uniqueWords.slice(0, 10);
  }

  /**
   * 簡易テキスト類似度計算
   */
  private calculateTextSimilarity(text1: string, text2: string): number {
    const words1 = this.extractKeywords(text1);
    const words2 = this.extractKeywords(text2);
    
    const common = words1.filter(word => words2.includes(word));
    const allWords = words1.concat(words2);
    const uniqueWords = allWords.filter((word, index) => allWords.indexOf(word) === index);
    const total = uniqueWords.length;
    
    return total > 0 ? common.length / total : 0;
  }

  /**
   * 表示テキスト生成
   */
  private generateDisplayText(fragment: any): string {
    // Fragment IDからカテゴリを判定
    if (fragment.fragment_id.startsWith('faq-')) {
      return `よくある質問: ${fragment.content_title}`;
    }
    
    if (fragment.fragment_id.startsWith('service-')) {
      return `サービス詳細: ${fragment.content_title}`;
    }
    
    if (fragment.category === 'section') {
      return `関連記事: ${fragment.content_title}`;
    }
    
    return fragment.content_title;
  }

  /**
   * 挿入位置のヒント決定
   */
  private determineInsertionHint(fragment: any, content: string): 'paragraph' | 'list' | 'section-end' {
    // FAQは段落内
    if (fragment.fragment_id.startsWith('faq-')) {
      return 'paragraph';
    }
    
    // サービスはリスト形式
    if (fragment.fragment_id.startsWith('service-')) {
      return 'list';
    }
    
    // その他はセクション末尾
    return 'section-end';
  }

  /**
   * Markdown内容に内部リンクを自動挿入
   */
  async enhanceMarkdownWithInternalLinks(
    markdown: string,
    currentPagePath: string,
    config?: AutoLinkConfig
  ): Promise<string> {
    
    const internalLinks = await this.generateInternalLinks(markdown, currentPagePath, config);
    
    if (internalLinks.length === 0) {
      return markdown;
    }
    
    let enhancedMarkdown = markdown;
    
    // 挿入スタイルに応じて処理
    switch (config?.insertionStyle || 'inline') {
      case 'inline':
        enhancedMarkdown = this.insertInlineLinks(enhancedMarkdown, internalLinks);
        break;
      case 'reference':
        enhancedMarkdown = this.insertReferenceLinks(enhancedMarkdown, internalLinks);
        break;
      case 'sidebar':
        enhancedMarkdown = this.insertSidebarLinks(enhancedMarkdown, internalLinks);
        break;
    }
    
    return enhancedMarkdown;
  }

  /**
   * インライン内部リンク挿入
   */
  private insertInlineLinks(markdown: string, links: FragmentInternalLink[]): string {
    let enhanced = markdown;
    
    // セクション末尾にリンクを挿入
    const sectionEndLinks = links.filter(link => link.insertionHint === 'section-end');
    
    if (sectionEndLinks.length > 0) {
      const linkSection = '\n\n### 🔗 関連情報\n\n' +
        sectionEndLinks.map(link => 
          `- [${link.displayText}](${link.completeUri})`
        ).join('\n') + '\n';
      
      enhanced += linkSection;
    }
    
    return enhanced;
  }

  /**
   * 参照形式内部リンク挿入
   */
  private insertReferenceLinks(markdown: string, links: FragmentInternalLink[]): string {
    let enhanced = markdown;
    
    // 記事末尾に参照リンク追加
    const referenceSection = '\n\n---\n\n### 📚 参考資料\n\n' +
      links.map((link, index) => 
        `${index + 1}. [${link.displayText}](${link.completeUri}) (関連度: ${(link.relevanceScore * 100).toFixed(0)}%)`
      ).join('\n') + '\n';
    
    enhanced += referenceSection;
    
    return enhanced;
  }

  /**
   * サイドバー形式内部リンク挿入
   */
  private insertSidebarLinks(markdown: string, links: FragmentInternalLink[]): string {
    // サイドバー用のメタデータとして追加（フロントエンドで処理）
    const sidebarData = {
      relatedFragments: links.map(link => ({
        title: link.displayText,
        url: link.completeUri,
        relevance: link.relevanceScore
      }))
    };
    
    // Markdownのフロントマターに追加
    const frontmatterAddition = `relatedFragments: ${JSON.stringify(sidebarData.relatedFragments)}\n`;
    
    if (markdown.startsWith('---\n')) {
      // 既存のフロントマターに追加
      const frontmatterEnd = markdown.indexOf('\n---\n', 4);
      if (frontmatterEnd !== -1) {
        return markdown.slice(0, frontmatterEnd) + 
               '\n' + frontmatterAddition + 
               markdown.slice(frontmatterEnd);
      }
    }
    
    // フロントマターが無い場合は先頭に追加
    return `---\n${frontmatterAddition}---\n\n${markdown}`;
  }
}

// ===== ユーティリティ関数 =====

/**
 * Fragment ID内部リンク自動生成のヘルパー関数
 */
export async function autoGenerateFragmentLinks(
  content: string,
  currentPath: string,
  options?: Partial<AutoLinkConfig>
): Promise<FragmentInternalLink[]> {
  const generator = new FragmentLinkGenerator();
  return generator.generateInternalLinks(content, currentPath, {
    maxLinks: 5,
    relevanceThreshold: 0.7,
    excludeSamePage: true,
    insertionStyle: 'inline',
    ...options
  });
}

/**
 * Markdown記事のFragment内部リンク強化
 */
export async function enhanceMarkdownWithFragmentLinks(
  markdown: string,
  currentPath: string,
  config?: AutoLinkConfig
): Promise<string> {
  const generator = new FragmentLinkGenerator();
  return generator.enhanceMarkdownWithInternalLinks(markdown, currentPath, config);
} 