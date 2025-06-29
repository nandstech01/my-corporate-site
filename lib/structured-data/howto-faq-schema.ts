// Mike King理論準拠: HowTo/FAQ Schema統合システム
// Phase 2: LLMO完全対応 - AI検索最適化

export interface HowToStep {
  "@type": "HowToStep";
  name: string;
  text: string;
  image?: string;
  url?: string;
  position?: number;
}

export interface HowToSchema {
  "@context": "https://schema.org";
  "@type": "HowTo";
  name: string;
  description: string;
  image?: string[];
  totalTime?: string;
  estimatedCost?: {
    "@type": "MonetaryAmount";
    currency: string;
    value: string;
  };
  supply?: Array<{
    "@type": "HowToSupply";
    name: string;
  }>;
  tool?: Array<{
    "@type": "HowToTool";
    name: string;
  }>;
  step: HowToStep[];
}

export interface FAQItem {
  "@type": "Question";
  name: string;
  acceptedAnswer: {
    "@type": "Answer";
    text: string;
  };
}

export interface FAQSchema {
  "@context": "https://schema.org";
  "@type": "FAQPage";
  mainEntity: FAQItem[];
}

export interface ProcessContent {
  title: string;
  description: string;
  steps: Array<{
    title: string;
    description: string;
    duration?: string;
    cost?: string;
    tools?: string[];
    supplies?: string[];
  }>;
}

export interface QuestionAnswerPair {
  question: string;
  answer: string;
  category?: string;
  priority?: number;
}

/**
 * HowTo/FAQ Schema自動生成システム
 */
export class HowToFAQSchemaSystem {
  private aiOptimizationKeywords: string[] = [
    'AI', 'DX', 'システム開発', '自動化', 'RAG', 'チャットボット',
    'レリバンスエンジニアリング', 'Mike King', 'AIO対策'
  ];

  /**
   * プロセスコンテンツからHowToスキーマを生成
   */
  generateHowToSchema(content: ProcessContent, options: {
    baseUrl?: string;
    imageUrls?: string[];
    estimatedCost?: { value: string; currency: string };
    totalTime?: string;
  } = {}): HowToSchema {
    const steps: HowToStep[] = content.steps.map((step, index) => ({
      "@type": "HowToStep",
      name: step.title,
      text: this.enhanceStepDescription(step.description),
      position: index + 1,
      ...(options.imageUrls && options.imageUrls[index] && {
        image: options.imageUrls[index]
      }),
      ...(options.baseUrl && {
        url: `${options.baseUrl}#step-${index + 1}`
      })
    }));

    const schema: HowToSchema = {
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: this.optimizeForAI(content.title),
      description: this.enhanceDescription(content.description),
      step: steps
    };

    // オプション項目の追加
    if (options.imageUrls && options.imageUrls.length > 0) {
      schema.image = options.imageUrls;
    }

    if (options.totalTime) {
      schema.totalTime = options.totalTime;
    }

    if (options.estimatedCost) {
      schema.estimatedCost = {
        "@type": "MonetaryAmount",
        currency: options.estimatedCost.currency,
        value: options.estimatedCost.value
      };
    }

    // ツールと材料の自動抽出
    const allTools = content.steps.flatMap(step => step.tools || []);
    const allSupplies = content.steps.flatMap(step => step.supplies || []);

    if (allTools.length > 0) {
      schema.tool = Array.from(new Set(allTools)).map(tool => ({
        "@type": "HowToTool",
        name: tool
      }));
    }

    if (allSupplies.length > 0) {
      schema.supply = Array.from(new Set(allSupplies)).map(supply => ({
        "@type": "HowToSupply",
        name: supply
      }));
    }

    return schema;
  }

  /**
   * Q&AペアからFAQスキーマを生成
   */
  generateFAQSchema(qaPairs: QuestionAnswerPair[]): FAQSchema {
    // 優先度でソート
    const sortedPairs = qaPairs.sort((a, b) => (b.priority || 0) - (a.priority || 0));

    const mainEntity: FAQItem[] = sortedPairs.map(pair => ({
      "@type": "Question",
      name: this.optimizeQuestionForAI(pair.question),
      acceptedAnswer: {
        "@type": "Answer",
        text: this.enhanceAnswerForAI(pair.answer)
      }
    }));

    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity
    };
  }

  /**
   * コンテンツからFAQを自動抽出
   */
  extractFAQFromContent(content: string): QuestionAnswerPair[] {
    const qaPatterns = [
      // 「Q:」「A:」形式
      /Q[：:]\s*([^QA]*?)A[：:]\s*([^QA]*?)(?=Q[：:]|$)/g,
      // 「質問:」「回答:」形式
      /質問[：:]\s*([^質回]*?)回答[：:]\s*([^質回]*?)(?=質問[：:]|$)/g,
      // FAQ形式の見出し
      /#{1,6}\s*([^#\n]*\?[^#\n]*)\n\n?([^#]*?)(?=#{1,6}|$)/g
    ];

    const extractedPairs: QuestionAnswerPair[] = [];

    qaPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const question = match[1].trim();
        const answer = match[2].trim();

        if (question && answer && question.length > 10 && answer.length > 20) {
          extractedPairs.push({
            question: this.cleanText(question),
            answer: this.cleanText(answer),
            priority: this.calculateFAQPriority(question, answer)
          });
        }
      }
    });

    return extractedPairs;
  }

  /**
   * プロセス説明からHowToコンテンツを抽出
   */
  extractHowToFromContent(content: string, title: string): ProcessContent {
    const stepPatterns = [
      // 「ステップ1:」形式
      /ステップ\s*(\d+)[：:]\s*([^ス]*?)(?=ステップ\s*\d+[：:]|$)/g,
      // 「1.」「2.」形式
      /(\d+)[．.]\s*([^1-9]*?)(?=\d+[．.]|$)/g,
      // 見出し形式
      /#{1,6}\s*(.+?)\n\n?([^#]*?)(?=#{1,6}|$)/g
    ];

    const extractedSteps: Array<{
      title: string;
      description: string;
      duration?: string;
      cost?: string;
      tools?: string[];
      supplies?: string[];
    }> = [];

    stepPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const stepTitle = this.cleanText(match[1] || match[2].split('\n')[0]);
        const stepDescription = this.cleanText(match[2]);

        if (stepTitle && stepDescription && stepDescription.length > 50) {
          const step = {
            title: stepTitle,
            description: stepDescription,
            duration: this.extractDuration(stepDescription),
            cost: this.extractCost(stepDescription),
            tools: this.extractTools(stepDescription),
            supplies: this.extractSupplies(stepDescription)
          };

          extractedSteps.push(step);
        }
      }
    });

    return {
      title: title || 'プロセスガイド',
      description: this.generateProcessDescription(extractedSteps),
      steps: extractedSteps
    };
  }

  /**
   * AI検索最適化のためのタイトル強化
   */
  private optimizeForAI(title: string): string {
    // AI検索で重要なキーワードの強調
    let optimized = title;

    this.aiOptimizationKeywords.forEach(keyword => {
      if (optimized.toLowerCase().includes(keyword.toLowerCase()) && 
          !optimized.includes(`【${keyword}】`)) {
        optimized = optimized.replace(
          new RegExp(keyword, 'gi'),
          `【${keyword}】`
        );
      }
    });

    return optimized;
  }

  /**
   * 質問のAI最適化
   */
  private optimizeQuestionForAI(question: string): string {
    let optimized = question.trim();

    // 疑問符の確認
    if (!optimized.endsWith('?') && !optimized.endsWith('？')) {
      optimized += optimized.includes('です') ? 'か？' : '？';
    }

    // AI検索キーワードの強調
    return this.optimizeForAI(optimized);
  }

  /**
   * 回答のAI強化
   */
  private enhanceAnswerForAI(answer: string): string {
    let enhanced = answer.trim();

    // 具体的な数値や期間の強調
    enhanced = enhanced.replace(
      /(\d+)([週間日時間分秒年月])/g,
      '**$1$2**'
    );

    // 料金の強調
    enhanced = enhanced.replace(
      /(\d+)([万円円])/g,
      '**$1$2**'
    );

    return enhanced;
  }

  /**
   * ステップ説明の強化
   */
  private enhanceStepDescription(description: string): string {
    let enhanced = description.trim();

    // 重要なキーワードの強調
    const importantTerms = [
      'ヒアリング', '要件定義', '設計', '開発', 'テスト', 'デプロイ',
      'RAG', 'API', 'データベース', 'AI', 'システム'
    ];

    importantTerms.forEach(term => {
      enhanced = enhanced.replace(
        new RegExp(`(${term})`, 'g'),
        `**$1**`
      );
    });

    return enhanced;
  }

  /**
   * 説明文の強化
   */
  private enhanceDescription(description: string): string {
    return this.optimizeForAI(description);
  }

  /**
   * FAQ優先度の計算
   */
  private calculateFAQPriority(question: string, answer: string): number {
    let priority = 0;

    // AI検索関連キーワードのボーナス
    this.aiOptimizationKeywords.forEach(keyword => {
      if (question.toLowerCase().includes(keyword.toLowerCase()) ||
          answer.toLowerCase().includes(keyword.toLowerCase())) {
        priority += 10;
      }
    });

    // 質問の長さによるボーナス
    if (question.length > 20 && question.length < 100) {
      priority += 5;
    }

    // 回答の充実度
    if (answer.length > 100) {
      priority += 5;
    }

    return priority;
  }

  /**
   * プロセス説明の生成
   */
  private generateProcessDescription(steps: Array<{title: string; description: string}>): string {
    return `${steps.length}ステップで完了する包括的なプロセスガイド。${steps.map(s => s.title).join('、')}の順序で進行します。`;
  }

  /**
   * 期間の抽出
   */
  private extractDuration(text: string): string | undefined {
    const match = text.match(/(\d+)[-〜～]?(\d+)?([週間日時間分])/);
    return match ? match[0] : undefined;
  }

  /**
   * コストの抽出
   */
  private extractCost(text: string): string | undefined {
    const match = text.match(/(\d+)([万円円])/);
    return match ? match[0] : undefined;
  }

  /**
   * ツールの抽出
   */
  private extractTools(text: string): string[] {
    const tools: string[] = [];
    const toolPatterns = [
      /(?:使用|利用|活用)(?:する|した)?([A-Za-z0-9\-_]+)/g,
      /(API|SDK|フレームワーク|ライブラリ|ツール)/g
    ];

    toolPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        tools.push(match[1]);
      }
    });

    return Array.from(new Set(tools));
  }

  /**
   * 材料の抽出
   */
  private extractSupplies(text: string): string[] {
    const supplies: string[] = [];
    const supplyPatterns = [
      /(データベース|ファイル|設定|情報)/g
    ];

    supplyPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        supplies.push(match[1]);
      }
    });

    return Array.from(new Set(supplies));
  }

  /**
   * テキストのクリーニング
   */
  private cleanText(text: string): string {
    return text
      .replace(/<[^>]*>/g, '') // HTMLタグ削除
      .replace(/\s+/g, ' ') // 空白正規化
      .trim();
  }
}

/**
 * デフォルトインスタンス
 */
export const howToFAQSchema = new HowToFAQSchemaSystem();

/**
 * 便利関数
 */
export const HowToFAQHelpers = {
  /**
   * システム開発プロセス用HowToスキーマ生成
   */
  generateSystemDevelopmentHowTo: (steps: Array<{title: string; description: string; duration: string}>) => {
    const content: ProcessContent = {
      title: '【AIシステム開発】完全ガイド - 業界最速・最安値での実装プロセス',
      description: 'レリバンスエンジニアリング・RAGシステム・AIO対策を含む包括的なAIシステム開発プロセス',
      steps: steps.map(step => ({
        title: step.title,
        description: step.description,
        duration: step.duration,
        tools: ['AI', 'RAG', 'API', 'データベース'],
        supplies: ['要件定義書', '設計書', 'テストデータ']
      }))
    };

    return howToFAQSchema.generateHowToSchema(content, {
      totalTime: 'P2W', // 2週間
      estimatedCost: { value: '500000', currency: 'JPY' }
    });
  },

  /**
   * 相談プロセス用HowToスキーマ生成
   */
  generateConsultationHowTo: () => {
    const content: ProcessContent = {
      title: '【無料相談】AIシステム開発相談プロセス',
      description: '業界最速・最安値でのAIシステム開発について、無料で詳細にご相談いただけるプロセス',
      steps: [
        {
          title: 'お問い合わせフォーム送信',
          description: 'ご要望・課題・予算などを詳しくお聞かせください',
          duration: '1分',
          tools: ['Webフォーム'],
          supplies: ['ご要望内容']
        },
        {
          title: '初回ヒアリング（無料）',
          description: '詳細な要件定義と最適なソリューションのご提案',
          duration: '30分',
          tools: ['オンライン会議'],
          supplies: ['要件資料']
        },
        {
          title: 'お見積もり・提案書作成',
          description: '具体的な開発計画と費用をご提案',
          duration: '1日',
          tools: ['提案書', '見積書'],
          supplies: ['技術仕様書']
        }
      ]
    };

    return howToFAQSchema.generateHowToSchema(content, {
      totalTime: 'P1D',
      estimatedCost: { value: '0', currency: 'JPY' }
    });
  },

  /**
   * システム開発FAQ生成
   */
  generateSystemDevelopmentFAQ: () => {
    const qaPairs: QuestionAnswerPair[] = [
      {
        question: 'AIシステム開発の期間はどのくらいですか？',
        answer: '**1-3週間**で完了します。RAGシステム開発は**2週間**、チャットボット開発は**1週間**、フルスタックシステムは**3週間**が目安です。業界最速の開発フレームワークとAI支援により、従来の**1/3の期間**での開発を実現しています。',
        priority: 100
      },
      {
        question: '開発費用はどのくらいかかりますか？',
        answer: 'RAGシステムは**50万円〜**、チャットボットは**40万円〜**、フルスタックシステムは**120万円〜**となります。業界最安値での提供を実現しており、運用コストも従来の**1/10**に削減可能です。',
        priority: 95
      },
      {
        question: 'レリバンスエンジニアリング（Mike King理論）対応は可能ですか？',
        answer: '完全対応しています。**AI検索最適化（AIO対策）**、**セマンティック検索対応**、**エンティティベース最適化**など、Mike King理論に基づくレリバンスエンジニアリングを実装いたします。',
        priority: 90
      },
      {
        question: '24時間運用は本当に可能ですか？',
        answer: '**99.9%稼働率**を保証しています。自動監視システム、障害自動復旧、24時間サポート体制により、**24時間365日**の安定運用を実現しています。',
        priority: 85
      },
      {
        question: '法令準拠は大丈夫ですか？',
        answer: '**13法令完全準拠**のRAGシステムを構築しており、**372項目**の法令データベースを**リアルタイム更新**しています。弁護士監修による法的根拠の確実性も担保しています。',
        priority: 80
      }
    ];

    return howToFAQSchema.generateFAQSchema(qaPairs);
  }
}; 