import { TAG_CATEGORIES } from './pattern-templates';

export interface GeneratedTags {
  primary: string[];
  secondary: string[];
  trending: string[];
  company: string[];
  all: string[];
}

export interface TagGenerationOptions {
  patternId: string;
  content: string;
  ragSources: string[];
  maxTags?: number;
}

export class TagGenerator {
  /**
   * パターンと内容に基づいてタグを自動生成
   */
  generateTags(options: TagGenerationOptions): GeneratedTags {
    const { patternId, content, ragSources, maxTags = 3 } = options;
    
    const primary = this.selectPrimaryTags(patternId, content);
    const secondary = this.selectSecondaryTags(content, ragSources);
    const trending = this.selectTrendingTags(content);
    const company = this.selectCompanyTags();
    
    // 重複除去とタグ数制限（より厳選）
    const allTags = [
      ...primary.slice(0, 2),
      ...secondary.slice(0, 1)
    ].slice(0, maxTags);
    
    return {
      primary,
      secondary,
      trending,
      company,
      all: allTags
    };
  }

  /**
   * パターンIDに基づいてプライマリタグを選択
   */
  private selectPrimaryTags(patternId: string, content: string): string[] {
    const patternTagMap: Record<string, string[]> = {
      'breaking_insight': ['#AI動向', '#速報'],
      'data_analysis': ['#データ分析', '#実態解明'],
      'trend_forecast': ['#トレンド分析', '#未来予測'],
      'tech_explanation': ['#技術解説', '#理解促進'],
      'company_comparison': ['#企業比較', '#業界分析'],
      'use_case': ['#活用事例', '#実用性'],
      'learning_guide': ['#学習ガイド', '#スキルアップ'],
      'question_answer': ['#疑問解決', '#Q&A']
    };

    let tags = patternTagMap[patternId] || ['#AI動向'];
    
    // コンテンツベースの追加タグ
    if (this.containsKeywords(content, ['AI', '人工知能'])) {
      tags.push('#AI');
    }
    if (this.containsKeywords(content, ['DX', 'デジタル変革'])) {
      tags.push('#DX');
    }
    if (this.containsKeywords(content, ['ChatGPT', 'OpenAI'])) {
      tags.push('#ChatGPT');
    }
    
    return tags.slice(0, 3);
  }

  /**
   * コンテンツとRAGソースに基づいてセカンダリタグを選択
   */
  private selectSecondaryTags(content: string, ragSources: string[]): string[] {
    const tags: string[] = [];
    
    // RAGソースベースのタグ
    if (ragSources.includes('trend')) {
      tags.push('#最新情報');
    }
    if (ragSources.includes('youtube')) {
      tags.push('#教育');
    }
    if (ragSources.includes('company')) {
      tags.push('#専門知識');
    }
    
    // コンテンツベースのセカンダリタグ
    if (this.containsKeywords(content, ['実装', '開発', 'システム'])) {
      tags.push('#実装');
    }
    if (this.containsKeywords(content, ['比較', '違い', 'vs'])) {
      tags.push('#比較分析');
    }
    if (this.containsKeywords(content, ['学習', '教育', 'ガイド'])) {
      tags.push('#学習');
    }
    if (this.containsKeywords(content, ['ビジネス', '企業', '事業'])) {
      tags.push('#ビジネス');
    }
    
    return Array.from(new Set(tags));
  }

  /**
   * トレンドタグを選択
   */
  private selectTrendingTags(content: string): string[] {
    const currentYear = new Date().getFullYear();
    const tags = [`#AI${currentYear}`];
    
    // 時期に基づくトレンドタグ
    const month = new Date().getMonth() + 1;
    if (month <= 3) {
      tags.push('#新年度準備');
    } else if (month <= 6) {
      tags.push('#春のDX');
    } else if (month <= 9) {
      tags.push('#夏の技術トレンド');
    } else {
      tags.push('#年末技術総括');
    }
    
    // コンテンツベースのトレンドタグ
    if (this.containsKeywords(content, ['最新', '新機能', 'アップデート'])) {
      tags.push('#最新技術');
    }
    if (this.containsKeywords(content, ['革新', 'イノベーション', '画期的'])) {
      tags.push('#イノベーション');
    }
    
    return tags.slice(0, 2);
  }

  /**
   * 企業タグを選択
   */
  private selectCompanyTags(): string[] {
    return ['#エヌアンドエス', '#nands_tech'];
  }

  /**
   * キーワード含有チェック
   */
  private containsKeywords(content: string, keywords: string[]): boolean {
    const lowerContent = content.toLowerCase();
    return keywords.some(keyword => 
      lowerContent.includes(keyword.toLowerCase())
    );
  }

  /**
   * スレッド投稿用のタグ分散
   */
  generateThreadTags(
    content: string[], 
    patternId: string, 
    ragSources: string[]
  ): string[][] {
    const baseTags = this.generateTags({
      patternId,
      content: content.join(' '),
      ragSources
    });

    return content.map((post, index) => {
      const isFirst = index === 0;
      const isLast = index === content.length - 1;
      
      if (isFirst) {
        // 最初の投稿：メインタグ
        return [
          ...baseTags.primary.slice(0, 2),
          ...baseTags.company.slice(0, 1)
        ];
      } else if (isLast) {
        // 最後の投稿：トレンドタグとまとめタグ
        return [
          ...baseTags.trending.slice(0, 1),
          '#まとめ',
          ...baseTags.company.slice(0, 1)
        ];
      } else {
        // 中間投稿：セカンダリタグ
        return [
          ...baseTags.secondary.slice(0, 2)
        ];
      }
    });
  }

  /**
   * タグのフォーマット（#を確実に付与）
   */
  formatTags(tags: string[]): string[] {
    return tags.map(tag => tag.startsWith('#') ? tag : `#${tag}`);
  }

  /**
   * タグを文字列として結合
   */
  joinTags(tags: string[], separator: ' '): string {
    return this.formatTags(tags).join(separator);
  }
} 