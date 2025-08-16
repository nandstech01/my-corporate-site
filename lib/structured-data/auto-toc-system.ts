// Mike King理論準拠: Fragment ID + TOC自動生成システム
// Phase 2: LLMO完全対応

export interface TOCItem {
  id: string;
  title: string;
  level: number;
  anchor: string;
  children?: TOCItem[];
}

export interface FragmentData {
  id: string;
  title: string;
  content: string;
  level: number;
  keywords: string[];
  semanticScore: number;
}

export interface TOCConfiguration {
  minLevel: number;
  maxLevel: number;
  generateFragmentIds: boolean;
  includeNumbering: boolean;
  aiOptimization: boolean;
}

/**
 * コンテンツ解析とTOC自動生成クラス
 */
export class AutoTOCSystem {
  private config: TOCConfiguration;

  constructor(config: Partial<TOCConfiguration> = {}) {
    this.config = {
      minLevel: 2,
      maxLevel: 4,
      generateFragmentIds: true,
      includeNumbering: false,
      aiOptimization: true,
      ...config
    };
  }

  /**
   * HTMLコンテンツからTOCを自動生成
   */
  generateTOCFromHTML(htmlContent: string): {
    toc: TOCItem[];
    fragmentIds: string[];
    enhancedContent: string;
  } {
    const headings = this.extractHeadingsFromHTML(htmlContent);
    const fragments = this.createFragments(headings);
    
    // 🎯 NEW: H1タイトルのFragment ID化（Mike King理論準拠）
    const enhancedFragments = this.addH1FragmentId(fragments, htmlContent);
    
    const toc = this.buildTOCHierarchy(enhancedFragments);
    const enhancedContent = this.injectFragmentIds(htmlContent, enhancedFragments);

    return {
      toc,
      fragmentIds: enhancedFragments.map(f => f.id),
      enhancedContent
    };
  }

  /**
   * React/TSXコンテンツからTOCを生成
   */
  generateTOCFromTSX(tsxContent: string, componentStructure: any): {
    toc: TOCItem[];
    suggestedFragments: FragmentData[];
  } {
    const sections = this.extractSectionsFromTSX(tsxContent);
    const fragments = this.createSemanticFragments(sections, componentStructure);
    const toc = this.buildTOCHierarchy(fragments);

    return {
      toc,
      suggestedFragments: fragments
    };
  }

  /**
   * HTMLからヘッダー要素を抽出
   * 🎯 Fragment ID形式 {#id} を正しく認識するように修正
   */
  private extractHeadingsFromHTML(htmlContent: string): Array<{
    level: number;
    text: string;
    id?: string;
  }> {
    // 🎯 Fragment ID形式に対応した正規表現: ## タイトル {#fragment-id}
    const headingRegex = /<h([1-6])[^>]*>(.*?)<\/h[1-6]>/gi;
    const headings: Array<{level: number, text: string, id?: string}> = [];
    let match;

    while ((match = headingRegex.exec(htmlContent)) !== null) {
      const level = parseInt(match[1]);
      const fullText = match[2].trim();
      
      // 🎯 Fragment ID パターン検出: {#id} 形式
      const fragmentIdMatch = fullText.match(/^(.*?)\s*\{#([^}]+)\}\s*$/);
      
      if (fragmentIdMatch) {
        // Fragment ID付きヘッダー
        const cleanText = fragmentIdMatch[1].trim();
        const fragmentId = fragmentIdMatch[2];
        
        headings.push({
          level,
          text: cleanText,
          id: fragmentId
        });
        
        console.log(`🔍 Fragment ID検出: "${cleanText}" → #${fragmentId}`);
      } else {
        // 通常のヘッダー（Fragment IDなし）
        headings.push({
          level,
          text: fullText
        });
      }
    }
    
    console.log(`📊 抽出されたヘッダー数: ${headings.length}個`);
    console.log(`🎯 Fragment ID付きヘッダー数: ${headings.filter(h => h.id).length}個`);

    return headings;
  }

  /**
   * TSXからセクション構造を抽出
   */
  private extractSectionsFromTSX(tsxContent: string): Array<{
    title: string;
    component: string;
    level: number;
    keywords: string[];
  }> {
    const sections = [];
    
    // セクションコンポーネントを検出
    const sectionRegex = /<section[^>]*>(.*?)<\/section>/gi;
    const componentRegex = /<([A-Z][A-Za-z]*)[^>]*>/g;
    
    let sectionMatch;
    while ((sectionMatch = sectionRegex.exec(tsxContent)) !== null) {
      const sectionContent = sectionMatch[1];
      
      // h1-h6タグを検出
      const headingMatch = sectionContent.match(/<h([1-6])[^>]*>([^<]+)<\/h[1-6]>/);
      if (headingMatch) {
        const level = parseInt(headingMatch[1]);
        const title = this.cleanHeadingText(headingMatch[2]);
        
        // コンポーネント名を検出
        let componentMatch;
        const components = [];
        while ((componentMatch = componentRegex.exec(sectionContent)) !== null) {
          components.push(componentMatch[1]);
        }
        
        sections.push({
          title,
          component: components[0] || 'Unknown',
          level,
          keywords: this.extractKeywordsFromContent(sectionContent)
        });
      }
    }
    
    return sections;
  }

  /**
   * フラグメントデータの作成
   */
  private createFragments(headings: Array<{level: number, text: string, id?: string}>): FragmentData[] {
    return headings.map((heading, index) => ({
              id: heading.id || this.generateBasicFragmentId(heading.text),
      title: heading.text,
      content: '', // 実際の実装では隣接コンテンツを抽出
      level: heading.level,
      keywords: this.extractKeywordsFromText(heading.text),
      semanticScore: this.calculateSemanticScore(heading.text, index)
    }));
  }

  /**
   * セマンティックフラグメントの作成
   */
  private createSemanticFragments(
    sections: Array<{title: string, component: string, level: number, keywords: string[]}>,
    componentStructure: any
  ): FragmentData[] {
    return sections.map((section, index) => ({
              id: this.generateBasicFragmentId(section.title),
      title: section.title,
      content: section.component,
      level: section.level,
      keywords: section.keywords,
      semanticScore: this.calculateSemanticScore(section.title, index, section.keywords)
    }));
  }

  /**
   * TOC階層構造の構築
   */
  private buildTOCHierarchy(fragments: FragmentData[]): TOCItem[] {
    const toc: TOCItem[] = [];
    const stack: TOCItem[] = [];

    fragments.forEach(fragment => {
      const tocItem: TOCItem = {
        id: fragment.id,
        title: fragment.title,
        level: fragment.level,
        anchor: `#${fragment.id}`,
        children: []
      };

      // 階層構造の構築
      while (stack.length > 0 && stack[stack.length - 1].level >= fragment.level) {
        stack.pop();
      }

      if (stack.length === 0) {
        toc.push(tocItem);
      } else {
        const parent = stack[stack.length - 1];
        if (!parent.children) parent.children = [];
        parent.children.push(tocItem);
      }

      stack.push(tocItem);
    });

    return toc;
  }

  /**
   * HTMLにフラグメントIDを注入
   */
  private injectFragmentIds(htmlContent: string, fragments: FragmentData[]): string {
    let enhancedContent = htmlContent;

    fragments.forEach(fragment => {
      const headingRegex = new RegExp(
        `<h([1-6])([^>]*)>\\s*${this.escapeRegex(fragment.title)}\\s*</h[1-6]>`,
        'gi'
      );
      
      enhancedContent = enhancedContent.replace(
        headingRegex,
        `<h$1$2 id="${fragment.id}">$3</h$1>`
      );
    });

    return enhancedContent;
  }

  /**
   * H1タイトルにFragment IDを追加（AI引用最適化）
   * Mike King理論: H1タイトルのFragment ID化でAI引用率向上
   */
  private addH1FragmentId(fragments: FragmentData[], htmlContent: string): FragmentData[] {
    // H1タイトルを抽出
    const h1Match = htmlContent.match(/<h1[^>]*>(.*?)<\/h1>/i);
    if (!h1Match) return fragments;

    const h1Text = h1Match[1].replace(/<[^>]*>/g, '').trim();
    const h1FragmentId = this.generateFragmentId(h1Text, 'main-title');

    // H1 Fragment IDを最初に追加
    const h1Fragment: FragmentData = {
      id: h1FragmentId,
      title: h1Text,
      content: h1Text,
      level: 1, // H1レベル
      keywords: this.extractKeywordsFromText(h1Text),
      semanticScore: 1.0 // 最高スコア（メインタイトル）
    };

    // H1を最初に、その他の見出しを続ける
    return [h1Fragment, ...fragments];
  }

  /**
   * 基本Fragment ID生成（既存システム互換）
   */
  private generateBasicFragmentId(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 50);
  }

  /**
   * 拡張Fragment ID生成（H1タイトル用）
   */
  private generateFragmentId(text: string, prefix: string = 'section'): string {
    const cleanText = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    
    return `${prefix}-${cleanText}`;
  }

  /**
   * ヘッダーテキストのクリーニング
   */
  private cleanHeadingText(text: string): string {
    return text
      .replace(/&[a-zA-Z0-9]+;/g, '') // HTMLエンティティ削除
      .replace(/<[^>]*>/g, '') // HTMLタグ削除
      .trim();
  }

  /**
   * コンテンツからキーワード抽出
   */
  private extractKeywordsFromContent(content: string): string[] {
    const text = content.replace(/<[^>]*>/g, '').toLowerCase();
    const words = text.match(/\b[a-zA-Z\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]{3,}\b/g);
    
    if (!words) return [];
    
    // 頻出単語をキーワードとして抽出
    const frequency: {[key: string]: number} = {};
    words.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1;
    });
    
    return Object.entries(frequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);
  }

  /**
   * テキストからキーワード抽出
   */
  private extractKeywordsFromText(text: string): string[] {
    const keywords = text
      .toLowerCase()
      .split(/[\s\-_]+/)
      .filter(word => word.length > 2);
    
    return Array.from(new Set(keywords));
  }

  /**
   * セマンティックスコア計算
   */
  private calculateSemanticScore(text: string, position: number, keywords: string[] = []): number {
    let score = 0.5; // ベーススコア
    
    // ポジション重要度
    score += Math.max(0, 0.3 - position * 0.05);
    
    // キーワード重要度
    if (keywords.length > 0) {
      score += Math.min(0.3, keywords.length * 0.05);
    }
    
    // Mike King理論関連キーワード
    const mikeKingTerms = [
      'relevance', 'engineering', 'レリバンスエンジニアリング',
      'ai', 'search', 'optimization', 'semantic', 'entity'
    ];
    
    const hasMikeKingTerms = mikeKingTerms.some(term => 
      text.toLowerCase().includes(term)
    );
    
    if (hasMikeKingTerms) {
      score += 0.2;
    }
    
    return Math.min(1.0, score);
  }

  /**
   * 正規表現エスケープ
   */
  private escapeRegex(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}

/**
 * TOCレンダリング用のReactコンポーネント生成
 */
export function generateTOCComponent(toc: TOCItem[], className?: string): string {
  const renderTOCItems = (items: TOCItem[], level: number = 0): string => {
    return items.map(item => {
      const hasChildren = item.children && item.children.length > 0;
      
      return `
        <li className="toc-item level-${item.level}" key="${item.id}">
          <a 
            href="${item.anchor}" 
            className="toc-link hover:text-blue-600 transition-colors"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('${item.id}')?.scrollIntoView({behavior: 'smooth'});
            }}
          >
            ${item.title}
          </a>
          ${hasChildren ? `
            <ul className="toc-children ml-4 mt-2">
              ${renderTOCItems(item.children!, level + 1)}
            </ul>
          ` : ''}
        </li>
      `;
    }).join('');
  };

  return `
    <nav className="table-of-contents ${className || 'bg-gray-50 p-6 border border-gray-200'}">
      <h3 className="text-lg font-bold text-gray-900 mb-4">目次</h3>
      <ul className="toc-list space-y-2">
        ${renderTOCItems(toc)}
      </ul>
    </nav>
  `;
}

/**
 * デフォルトインスタンス
 */
export const autoTOC = new AutoTOCSystem();

/**
 * 便利関数
 */
export const TOCHelpers = {
  /**
   * 簡易TOC生成
   */
  generateSimpleTOC: (htmlContent: string) => autoTOC.generateTOCFromHTML(htmlContent),
  
  /**
   * TSX用TOC生成
   */
  generateTSXTOC: (tsxContent: string, structure?: any) => 
    autoTOC.generateTOCFromTSX(tsxContent, structure),
  
  /**
   * フラグメントID生成
   */
  generateId: (text: string) => autoTOC['generateBasicFragmentId'](text)
}; 