// Phase 3: GEO最適化拡張 - MDXセクション分割システム
// 既存コンテンツを構造化されたMDXセクションに自動分割

import { TOCItem } from './auto-toc-system';
import { HasPartSchema } from './haspart-schema-system';

export interface MDXSection {
  id: string;
  title: string;
  content: string;
  level: number;
  anchor: string;
  keywords: string[];
  wordCount: number;
  subsections?: MDXSection[];
  fragmentId: string;
  seoKeywords: string[];
  semanticTopics: string[];
}

export interface MDXConfiguration {
  maxSectionLength: number;
  minSectionLength: number;
  generateSubsections: boolean;
  includeKeywordAnalysis: boolean;
  enableTopicalClustering: boolean;
  targetWordCount: number; // 1万字級対応
}

export interface ContentSplitResult {
  sections: MDXSection[];
  totalWordCount: number;
  tocStructure: TOCItem[];
  hasPartSchemas: HasPartSchema[];
  mdxOutput: string;
}

/**
 * Mike King理論準拠: MDXセクション分割システム
 * 1万字級Topical-Coverage対応
 */
export class MDXSectionSystem {
  private config: MDXConfiguration;

  constructor(config: Partial<MDXConfiguration> = {}) {
    this.config = {
      maxSectionLength: 2000,
      minSectionLength: 300,
      generateSubsections: true,
      includeKeywordAnalysis: true,
      enableTopicalClustering: true,
      targetWordCount: 10000, // 1万字級対応
      ...config
    };
  }

  /**
   * HTMLコンテンツからMDXセクションに分割
   */
  splitContentToMDX(
    htmlContent: string,
    pageTitle: string,
    keywords: string[]
  ): ContentSplitResult {
    // HTMLをセクションに分割
    const rawSections = this.parseHTMLSections(htmlContent);
    
    // MDXセクションオブジェクトに変換
    const mdxSections = rawSections.map((section, index) => 
      this.createMDXSection(section, index, keywords)
    );

    // 1万字級に拡充（必要に応じて）
    const expandedSections = this.expandToTargetWordCount(mdxSections, keywords);

    // TOC構造生成
    const tocStructure = this.generateTOCFromSections(expandedSections);

    // hasPartスキーマ生成
    const hasPartSchemas = this.generateHasPartFromSections(expandedSections);

    // MDX形式で出力
    const mdxOutput = this.generateMDXOutput(expandedSections, pageTitle);

    return {
      sections: expandedSections,
      totalWordCount: this.calculateTotalWordCount(expandedSections),
      tocStructure,
      hasPartSchemas,
      mdxOutput
    };
  }

  /**
   * 既存ページコンテンツの構造化
   */
  structurizeExistingPage(
    pageContent: string,
    pageSlug: string,
    pageTitle: string,
    targetKeywords: string[]
  ): ContentSplitResult {
    // メインコンテンツエリアを抽出
    const mainContent = this.extractMainContent(pageContent);
    
    // セクション分割
    const result = this.splitContentToMDX(mainContent, pageTitle, targetKeywords);
    
    // GEO最適化拡張
    const optimizedSections = this.optimizeForGEO(result.sections, targetKeywords);
    
    return {
      ...result,
      sections: optimizedSections,
      totalWordCount: this.calculateTotalWordCount(optimizedSections)
    };
  }

  /**
   * HTMLをセクションに分割
   */
  private parseHTMLSections(htmlContent: string): Array<{
    title: string;
    content: string;
    level: number;
    id?: string;
  }> {
    const sections: Array<{
      title: string;
      content: string;
      level: number;
      id?: string;
    }> = [];

    // 見出しタグでセクション分割
    const headingRegex = /<(h[1-6])([^>]*)>(.*?)<\/h[1-6]>/gi;
    const sectionRegex = /<section[^>]*id="([^"]*)"[^>]*>([\s\S]*?)<\/section>/gi;

    let match;
    let lastIndex = 0;

    // セクションベースの分割を優先
    while ((match = sectionRegex.exec(htmlContent)) !== null) {
      const sectionId = match[1];
      const sectionContent = match[2];
      
      // セクション内の見出しを取得
      const titleMatch = sectionContent.match(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/i);
      const title = titleMatch ? this.stripHTML(titleMatch[1]) : `セクション ${sections.length + 1}`;
      
      sections.push({
        title,
        content: sectionContent,
        level: 2,
        id: sectionId
      });
    }

    // セクションが見つからない場合は見出しベースで分割
    if (sections.length === 0) {
      while ((match = headingRegex.exec(htmlContent)) !== null) {
        const level = parseInt(match[1].charAt(1));
        const title = this.stripHTML(match[3]);
        const startIndex = match.index + match[0].length;
        
        let content = '';
        const nextHeadingIndex = htmlContent.substring(startIndex).search(/<h[1-6]/i);
        
        if (nextHeadingIndex !== -1) {
          content = htmlContent.substring(startIndex, startIndex + nextHeadingIndex);
        } else {
          content = htmlContent.substring(startIndex);
        }

        sections.push({
          title,
          content,
          level
        });
      }
    }

    return sections;
  }

  /**
   * MDXセクションオブジェクト作成
   */
  private createMDXSection(
    rawSection: { title: string; content: string; level: number; id?: string },
    index: number,
    keywords: string[]
  ): MDXSection {
    const cleanContent = this.stripHTML(rawSection.content);
    const wordCount = this.countWords(cleanContent);
    const fragmentId = rawSection.id || `section-${index + 1}`;
    
    return {
      id: fragmentId,
      title: rawSection.title,
      content: cleanContent,
      level: rawSection.level,
      anchor: `#${fragmentId}`,
      keywords: this.extractKeywords(cleanContent, keywords),
      wordCount,
      fragmentId,
      seoKeywords: this.analyzeSEOKeywords(cleanContent, keywords),
      semanticTopics: this.extractSemanticTopics(cleanContent)
    };
  }

  /**
   * 1万字級に拡充
   */
  private expandToTargetWordCount(
    sections: MDXSection[],
    keywords: string[]
  ): MDXSection[] {
    const currentWordCount = this.calculateTotalWordCount(sections);
    
    if (currentWordCount >= this.config.targetWordCount) {
      return sections;
    }

    const wordsNeeded = this.config.targetWordCount - currentWordCount;
    const expandedSections = [...sections];

    // 各セクションを段階的に拡充
    expandedSections.forEach((section, index) => {
      if (section.wordCount < this.config.maxSectionLength) {
        const additionalContent = this.generateAdditionalContent(
          section,
          keywords,
          Math.min(wordsNeeded / expandedSections.length, 1000)
        );
        
        expandedSections[index] = {
          ...section,
          content: section.content + '\n\n' + additionalContent,
          wordCount: section.wordCount + this.countWords(additionalContent)
        };
      }
    });

    return expandedSections;
  }

  /**
   * 追加コンテンツ生成（Topical Coverage強化）
   */
  private generateAdditionalContent(
    section: MDXSection,
    keywords: string[],
    targetWords: number
  ): string {
    const topics = this.generateTopicalCoverageTopics(section.title, keywords);
    
    let additionalContent = '';
    
    topics.forEach(topic => {
      additionalContent += `\n### ${topic.title}\n\n`;
      additionalContent += `${topic.description}\n\n`;
      additionalContent += `${topic.details.join('\n\n')}\n\n`;
    });

    return additionalContent.substring(0, targetWords * 6); // 概算で文字数制限
  }

  /**
   * Topical Coverage強化トピック生成
   */
  private generateTopicalCoverageTopics(sectionTitle: string, keywords: string[]): Array<{
    title: string;
    description: string;
    details: string[];
  }> {
    // レリバンスエンジニアリング関連のトピック拡張
    const baseTopics = [
      {
        title: `${sectionTitle}の最新動向`,
        description: `${keywords.join('・')}分野での最新の技術動向と市場の変化について詳しく解説します。`,
        details: [
          'AI技術の進歩による影響分析',
          '業界標準の変化と対応策',
          '競合他社との差別化要因',
          '今後の発展予測と準備すべき要素'
        ]
      },
      {
        title: `${sectionTitle}の実装手法`,
        description: `実際の導入プロセスと成功のためのベストプラクティスを具体的に説明します。`,
        details: [
          'ステップバイステップの実装ガイド',
          'よくある課題と解決方法',
          'ROI測定と効果測定手法',
          '継続的改善のためのフレームワーク'
        ]
      },
      {
        title: `${sectionTitle}の関連技術`,
        description: `関連する技術スタックと統合方法について詳細に解説します。`,
        details: [
          '必要な技術要件と環境設定',
          'サードパーティツールとの連携',
          'セキュリティ対策と考慮事項',
          'スケーラビリティとパフォーマンス最適化'
        ]
      }
    ];

    return baseTopics;
  }

  /**
   * TOC構造生成
   */
  private generateTOCFromSections(sections: MDXSection[]): TOCItem[] {
    return sections.map(section => ({
      id: section.fragmentId,
      title: section.title,
      level: section.level,
      anchor: section.anchor,
      children: section.subsections?.map(sub => ({
        id: sub.fragmentId,
        title: sub.title,
        level: sub.level,
        anchor: sub.anchor
      })) || []
    }));
  }

  /**
   * hasPartスキーマ生成
   */
  private generateHasPartFromSections(sections: MDXSection[]): HasPartSchema[] {
    return sections.map(section => ({
      '@type': 'CreativeWork',
      '@id': `https://nands.tech${section.anchor}`,
      name: section.title,
      url: `https://nands.tech${section.anchor}`,
      wordCount: section.wordCount,
      keywords: section.seoKeywords
    }));
  }

  /**
   * MDX形式出力
   */
  private generateMDXOutput(sections: MDXSection[], pageTitle: string): string {
    let mdxOutput = `---\ntitle: "${pageTitle}"\ntype: "structured-content"\n---\n\n`;
    
    sections.forEach(section => {
      mdxOutput += `${'#'.repeat(section.level)} ${section.title} {#${section.fragmentId}}\n\n`;
      mdxOutput += `${section.content}\n\n`;
      
      if (section.subsections) {
        section.subsections.forEach(subsection => {
          mdxOutput += `${'#'.repeat(subsection.level)} ${subsection.title} {#${subsection.fragmentId}}\n\n`;
          mdxOutput += `${subsection.content}\n\n`;
        });
      }
    });

    return mdxOutput;
  }

  // ユーティリティメソッド
  private stripHTML(html: string): string {
    return html.replace(/<[^>]*>/g, '').trim();
  }

  private countWords(text: string): number {
    return text.length; // 日本語対応：文字数でカウント
  }

  private calculateTotalWordCount(sections: MDXSection[]): number {
    return sections.reduce((total, section) => total + section.wordCount, 0);
  }

  private extractMainContent(pageContent: string): string {
    // メインコンテンツエリアを抽出（nav, footer等を除外）
    const mainMatch = pageContent.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
    if (mainMatch) return mainMatch[1];
    
    const bodyMatch = pageContent.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    return bodyMatch ? bodyMatch[1] : pageContent;
  }

  private extractKeywords(content: string, targetKeywords: string[]): string[] {
    const found: string[] = [];
    targetKeywords.forEach(keyword => {
      if (content.toLowerCase().includes(keyword.toLowerCase())) {
        found.push(keyword);
      }
    });
    return found;
  }

  private analyzeSEOKeywords(content: string, targetKeywords: string[]): string[] {
    return this.extractKeywords(content, targetKeywords);
  }

  private extractSemanticTopics(content: string): string[] {
    // 簡易的なセマンティックトピック抽出
    const commonTopics = ['AI', '機械学習', 'システム', '開発', '最適化', '効率化', '自動化'];
    return commonTopics.filter(topic => 
      content.toLowerCase().includes(topic.toLowerCase())
    );
  }

  private optimizeForGEO(sections: MDXSection[], keywords: string[]): MDXSection[] {
    return sections.map(section => ({
      ...section,
      title: this.optimizeTitleForGEO(section.title, keywords),
      content: this.optimizeContentForGEO(section.content, keywords)
    }));
  }

  private optimizeTitleForGEO(title: string, keywords: string[]): string {
    // タイトルのGEO最適化
    return title;
  }

  private optimizeContentForGEO(content: string, keywords: string[]): string {
    // コンテンツのGEO最適化
    return content;
  }
}

// 使用例エクスポート
export async function generateMDXFromPage(
  pageSlug: string,
  pageTitle: string,
  targetKeywords: string[]
): Promise<ContentSplitResult> {
  const mdxSystem = new MDXSectionSystem({
    targetWordCount: 10000, // 1万字級
    enableTopicalClustering: true,
    includeKeywordAnalysis: true
  });

  // ページコンテンツを取得（実装は使用時に調整）
  const pageContent = `<main>既存のページコンテンツ</main>`;
  
  return mdxSystem.structurizeExistingPage(
    pageContent,
    pageSlug,
    pageTitle,
    targetKeywords
  );
} 