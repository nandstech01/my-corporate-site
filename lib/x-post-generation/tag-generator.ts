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
   * パターンと内容に基づいてタグを自動生成（0-1個）
   */
  generateTags(options: TagGenerationOptions): GeneratedTags {
    const { content, maxTags = 1 } = options;

    const primary = this.selectPrimaryTags(content);
    const secondary: string[] = [];
    const trending: string[] = [];
    const company: string[] = [];

    const allTags = primary.slice(0, maxTags);

    return {
      primary,
      secondary,
      trending,
      company,
      all: allTags
    };
  }

  /**
   * コンテンツの主要技術キーワードに一致する場合のみ1タグ返す
   */
  private selectPrimaryTags(content: string): string[] {
    const lowerContent = content.toLowerCase();

    // 優先度順にチェック — 最初にマッチした1つだけ返す
    const keywordTagMap: [string[], string][] = [
      [['rag', 'retrieval augmented', '検索拡張'], '#RAG'],
      [['llm', 'large language model', '大規模言語モデル'], '#LLM'],
      [['claude', 'anthropic'], '#AI'],
      [['gpt', 'openai', 'chatgpt'], '#AI'],
      [['ai', '人工知能', '機械学習', 'ml'], '#AI'],
    ];

    for (const [keywords, tag] of keywordTagMap) {
      if (keywords.some(kw => lowerContent.includes(kw))) {
        // TAG_CATEGORIES.primary に含まれるもののみ
        if (TAG_CATEGORIES.primary.includes(tag)) {
          return [tag];
        }
      }
    }

    return [];
  }

  /**
   * スレッド投稿用のタグ分散（各ポスト最大1タグ）
   */
  generateThreadTags(
    content: string[],
    patternId: string,
    ragSources: string[]
  ): string[][] {
    const baseTags = this.generateTags({
      patternId,
      content: content.join(' '),
      ragSources,
      maxTags: 1,
    });

    return content.map((_, index) => {
      // 最初の投稿のみタグ付与（あれば）
      if (index === 0) {
        return baseTags.all.slice(0, 1);
      }
      return [];
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
