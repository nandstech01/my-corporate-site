import { OpenAIEmbeddings } from './openai-embeddings';
import { FragmentVectorStore, FragmentVectorData } from './fragment-vector-store';

// Fragment ID情報の型定義
export interface FragmentInfo {
  fragment_id: string;
  content_title: string;
  content: string;
  content_type: 'faq' | 'service' | 'section' | 'heading' | 'author' | 'case-study' | 'problem' | 'philosophy' | 'solution' | 'pricing' | 'cta' | 'contact';
  category?: string;
  semantic_weight?: number;
  target_queries?: string[];
  related_entities?: string[];
  metadata?: any;
}

// ブログ記事のFragment ID情報
export interface BlogFragmentInfo {
  post_id: number;
  post_title: string;
  slug: string;
  page_path: string;
  fragments: FragmentInfo[];
  rag_sources?: string[];
  seo_keywords?: string[];
  category?: string;
}

export class FragmentVectorizer {
  private openaiEmbeddings: OpenAIEmbeddings;
  private fragmentVectorStore: FragmentVectorStore;

  constructor() {
    this.openaiEmbeddings = new OpenAIEmbeddings();
    this.fragmentVectorStore = new FragmentVectorStore();
  }

  /**
   * ブログ記事のFragment IDを自動ベクトル化
   */
  async vectorizeBlogFragments(blogInfo: BlogFragmentInfo): Promise<{
    success: boolean;
    vectorizedCount: number;
    totalCount: number;
    errors: string[];
  }> {
    try {
      console.log(`🔄 ブログ記事Fragment ID自動ベクトル化開始: ${blogInfo.post_title}`);
      console.log(`📊 対象Fragment数: ${blogInfo.fragments.length}個`);

      const fragmentVectorDataArray: FragmentVectorData[] = [];

      // 各Fragment IDをベクトル化データに変換
      for (const fragment of blogInfo.fragments) {
        try {
          console.log(`🔧 Fragment ID処理中: ${fragment.fragment_id}`);

          // Fragment IDのコンテンツをベクトル化
          const embedding = await this.openaiEmbeddings.embedSingle(fragment.content);

          const fragmentVectorData: FragmentVectorData = {
            fragment_id: fragment.fragment_id,
            complete_uri: `https://nands.tech${blogInfo.page_path}#${fragment.fragment_id}`,
            page_path: blogInfo.page_path,
            content_title: fragment.content_title,
            content: fragment.content,
            content_type: fragment.content_type,
            embedding: embedding,
            category: fragment.category || this.inferCategoryFromFragmentId(fragment.fragment_id),
            semantic_weight: fragment.semantic_weight || this.calculateSemanticWeight(fragment),
            target_queries: fragment.target_queries || this.generateTargetQueries(fragment),
            related_entities: fragment.related_entities || this.extractRelatedEntities(fragment),
            metadata: {
              ...fragment.metadata,
              post_id: blogInfo.post_id,
              post_title: blogInfo.post_title,
              slug: blogInfo.slug,
              rag_sources: blogInfo.rag_sources,
              seo_keywords: blogInfo.seo_keywords,
              blog_category: blogInfo.category,
              generated_at: new Date().toISOString(),
              ai_citation_optimized: true,
              mike_king_theory_compliant: true,
              auto_vectorized: true
            }
          };

          fragmentVectorDataArray.push(fragmentVectorData);

        } catch (fragmentError) {
          console.error(`❌ Fragment ID処理エラー (${fragment.fragment_id}):`, fragmentError);
          // 個別のFragment IDエラーは全体の処理を止めない
        }
      }

      // バッチでベクトル保存
      const result = await this.fragmentVectorStore.saveFragmentVectorsBatch(fragmentVectorDataArray);

      console.log(`📊 ブログFragment ID自動ベクトル化完了:`);
      console.log(`  - 成功: ${result.savedCount}/${result.totalCount}個`);
      console.log(`  - エラー: ${result.errors.length}個`);

      return {
        success: result.success,
        vectorizedCount: result.savedCount,
        totalCount: result.totalCount,
        errors: result.errors
      };

    } catch (error) {
      console.error('❌ Fragment ID自動ベクトル化エラー:', error);
      return {
        success: false,
        vectorizedCount: 0,
        totalCount: blogInfo.fragments.length,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * マークダウンコンテンツからFragment IDを抽出してベクトル化
   */
  async extractAndVectorizeFromMarkdown(
    markdownContent: string,
    pageInfo: {
      post_id: number;
      post_title: string;
      slug: string;
      page_path: string;
      category?: string;
      seo_keywords?: string[];
      rag_sources?: string[];
    }
  ): Promise<{
    success: boolean;
    extractedFragments: FragmentInfo[];
    vectorizedCount: number;
    errors: string[];
  }> {
    try {
      console.log(`🔍 マークダウンからFragment ID抽出開始: ${pageInfo.post_title}`);

      const extractedFragments: FragmentInfo[] = [];

      // 1. H1タイトルのFragment ID
      const h1FragmentId = `main-title-${pageInfo.post_title.toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 30)}`;

      extractedFragments.push({
        fragment_id: h1FragmentId,
        content_title: pageInfo.post_title,
        content: `記事タイトル: ${pageInfo.post_title}。この記事の主要テーマとキーワードを含むメインセクション。`,
        content_type: 'heading',
        category: 'title',
        semantic_weight: 0.95
      });

      // 2. FAQセクションからFragment ID抽出
      const faqSectionRegex = /## よくある質問[\s\S]*?(?=##|$)/i;
      const faqMatch = markdownContent.match(faqSectionRegex);

      if (faqMatch) {
        // FAQ全体セクション
        extractedFragments.push({
          fragment_id: 'faq-section',
          content_title: 'よくある質問セクション',
          content: faqMatch[0].substring(0, 500) + '...',
          content_type: 'section',
          category: 'faq',
          semantic_weight: 0.90
        });

        // 個別FAQ項目
        const faqQARegex = /### Q:\s*([^{]+?)(?:\s*\{#(faq-\d+)\})?\s*\n\s*A:\s*([^#]+?)(?=\n\s*###|\n\s*##|$)/g;
        let faqMatch_inner;
        let faqIndex = 1;

        while ((faqMatch_inner = faqQARegex.exec(faqMatch[0])) !== null) {
          const question = faqMatch_inner[1].trim();
          const answer = faqMatch_inner[3].trim();
          const faqId = faqMatch_inner[2] || `faq-${faqIndex}`;

          extractedFragments.push({
            fragment_id: faqId,
            content_title: question,
            content: `質問: ${question}\n\n回答: ${answer}`,
            content_type: 'faq',
            category: 'faq',
            semantic_weight: 0.88,
            target_queries: this.generateFAQQueries(question),
            related_entities: this.extractFAQEntities(question, answer)
          });

          faqIndex++;
        }
      }

      // 3. 著者情報セクションの自動抽出（HARADA_KENJI_PROFILE統合）
      // ブログ記事詳細ページの著者セクション（id="author-profile"）を想定
      const authorSectionRegex = /著者について|著者情報|Author|プロフィール/i;
      if (authorSectionRegex.test(markdownContent)) {
        // author-trust-system.tsのプロフィールデータを活用
        extractedFragments.push({
          fragment_id: 'author-profile',
          content_title: '著者プロフィール - 原田賢治',
          content: `原田賢治 - 代表取締役・AI技術責任者。Mike King理論に基づくレリバンスエンジニアリング専門家。生成AI検索最適化、ChatGPT・Perplexity対応のGEO実装、企業向けAI研修を手がける。15年以上のAI・システム開発経験を持ち、全国で企業のDX・AI活用、退職代行サービスを支援。Triple RAGベクトル検索システム構築、自動記事生成システム実用化など革新的技術開発に取り組む。X(Twitter): @NANDS_AI、LinkedIn: 原田賢治プロフィール。`,
          content_type: 'author',
          category: 'author',
          semantic_weight: 0.90, // 信頼性向上のため重み増加
          target_queries: [
            '原田賢治',
            '代表取締役',
            'AI技術責任者', 
            'レリバンスエンジニアリング専門家',
            'Mike King理論',
            'AI研修講師',
            'NANDS代表',
            'AI検索最適化専門家',
            'Triple RAGシステム',
            'ベクトル検索専門家'
          ],
          related_entities: [
            'NANDS',
            'レリバンスエンジニアリング',
            'Mike King理論',
            'AI検索最適化',
            'ChatGPT',
            'Perplexity',
            'GEO対策',
            'AI研修',
            'Triple RAG',
            'ベクトル検索システム',
            '自動記事生成システム'
          ]
        });
      }

      // 4. その他の{#id}形式Fragment ID
      const existingFragmentRegex = /\{#([^}]+)\}/g;
      let existingMatch;

      while ((existingMatch = existingFragmentRegex.exec(markdownContent)) !== null) {
        const fragmentId = existingMatch[1];
        
        // 既に処理済みのFragment IDはスキップ
        if (extractedFragments.some(f => f.fragment_id === fragmentId)) {
          continue;
        }

        // Fragment IDの前後のコンテンツを抽出
        const fragmentContext = this.extractFragmentContext(markdownContent, existingMatch.index);

        extractedFragments.push({
          fragment_id: fragmentId,
          content_title: fragmentContext.title,
          content: fragmentContext.content,
          content_type: fragmentContext.type,
          category: this.inferCategoryFromFragmentId(fragmentId),
          semantic_weight: fragmentContext.weight
        });
      }

      console.log(`📊 Fragment ID抽出完了: ${extractedFragments.length}個`);

      // ベクトル化実行
      const blogInfo: BlogFragmentInfo = {
        post_id: pageInfo.post_id,
        post_title: pageInfo.post_title,
        slug: pageInfo.slug,
        page_path: pageInfo.page_path,
        fragments: extractedFragments,
        rag_sources: pageInfo.rag_sources,
        seo_keywords: pageInfo.seo_keywords,
        category: pageInfo.category
      };

      const vectorizeResult = await this.vectorizeBlogFragments(blogInfo);

      return {
        success: vectorizeResult.success,
        extractedFragments,
        vectorizedCount: vectorizeResult.vectorizedCount,
        errors: vectorizeResult.errors
      };

    } catch (error) {
      console.error('❌ マークダウンFragment ID抽出・ベクトル化エラー:', error);
      return {
        success: false,
        extractedFragments: [],
        vectorizedCount: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  // ヘルパーメソッド

  private inferCategoryFromFragmentId(fragmentId: string): string {
    if (fragmentId.startsWith('faq-')) return 'faq';
    if (fragmentId.startsWith('service-')) return 'service';
    if (fragmentId.startsWith('main-title')) return 'title';
    if (fragmentId.includes('pricing')) return 'pricing';
    if (fragmentId.includes('tech')) return 'tech';
    if (fragmentId.includes('author')) return 'author';
    return 'general';
  }

  private calculateSemanticWeight(fragment: FragmentInfo): number {
    // Fragment IDタイプに基づく重み計算
    if (fragment.content_type === 'heading' && fragment.fragment_id.includes('main-title')) return 0.95;
    if (fragment.content_type === 'faq') return 0.88;
    if (fragment.content_type === 'service') return 0.92;
    if (fragment.content_type === 'section') return 0.85;
    return 0.80;
  }

  private generateTargetQueries(fragment: FragmentInfo): string[] {
    const baseQueries: string[] = [];

    // Fragment IDタイプ別のクエリ生成
    if (fragment.content_type === 'faq') {
      baseQueries.push(
        fragment.content_title,
        `${fragment.content_title} 回答`,
        `${fragment.content_title} 詳細`
      );
    } else if (fragment.content_type === 'service') {
      baseQueries.push(
        `${fragment.content_title} サービス`,
        `${fragment.content_title} 詳細`,
        `${fragment.content_title} 料金`
      );
    } else {
      baseQueries.push(
        fragment.content_title,
        `${fragment.content_title} について`
      );
    }

    return baseQueries.slice(0, 5); // 最大5個
  }

  private extractRelatedEntities(fragment: FragmentInfo): string[] {
    const entities: string[] = [];
    
    // コンテンツからエンティティを抽出（簡易版）
    const content = fragment.content.toLowerCase();
    
    if (content.includes('ai') || content.includes('人工知能')) entities.push('AI');
    if (content.includes('chatgpt')) entities.push('ChatGPT');
    if (content.includes('claude')) entities.push('Claude');
    if (content.includes('gemini')) entities.push('Gemini');
    if (content.includes('openai')) entities.push('OpenAI');
    if (content.includes('rag')) entities.push('RAG');
    if (content.includes('ベクトル')) entities.push('ベクトル検索');

    return entities.slice(0, 10); // 最大10個
  }

  private generateFAQQueries(question: string): string[] {
    return [
      question,
      `${question} 回答`,
      `${question} 詳細`,
      question.replace(/[？?]$/, ''),
      question.replace(/[？?]$/, ' について')
    ].slice(0, 5);
  }

  private extractFAQEntities(question: string, answer: string): string[] {
    const text = `${question} ${answer}`.toLowerCase();
    const entities: string[] = [];

    // よくあるエンティティパターン
    const entityPatterns = [
      { pattern: /ai|人工知能/, entity: 'AI' },
      { pattern: /chatgpt/, entity: 'ChatGPT' },
      { pattern: /claude/, entity: 'Claude' },
      { pattern: /gemini/, entity: 'Gemini' },
      { pattern: /openai/, entity: 'OpenAI' },
      { pattern: /rag|検索拡張生成/, entity: 'RAG' },
      { pattern: /ベクトル/, entity: 'ベクトル検索' },
      { pattern: /料金|価格|費用/, entity: '料金' },
      { pattern: /サポート|支援/, entity: 'サポート' },
      { pattern: /セキュリティ|安全/, entity: 'セキュリティ' }
    ];

    entityPatterns.forEach(({ pattern, entity }) => {
      if (pattern.test(text) && !entities.includes(entity)) {
        entities.push(entity);
      }
    });

    return entities;
  }

  private extractFragmentContext(content: string, fragmentIndex: number): {
    title: string;
    content: string;
    type: 'faq' | 'service' | 'section' | 'heading' | 'author' | 'case-study';
    weight: number;
  } {
    // Fragment ID周辺のコンテンツを抽出（簡易版）
    const beforeContent = content.substring(Math.max(0, fragmentIndex - 200), fragmentIndex);
    const afterContent = content.substring(fragmentIndex, fragmentIndex + 300);

    // 見出しを探す
    const headingMatch = beforeContent.match(/#{1,6}\s*([^\n]+)\s*$/);
    const title = headingMatch ? headingMatch[1].trim() : 'セクション';

    return {
      title,
      content: afterContent.substring(0, 250) + '...',
      type: this.inferContentType(title, afterContent),
      weight: 0.85
    };
  }

  private inferContentType(title: string, content: string): 'faq' | 'service' | 'section' | 'heading' | 'author' | 'case-study' {
    const text = `${title} ${content}`.toLowerCase();
    
    if (text.includes('質問') || text.includes('q:') || text.includes('faq')) return 'faq';
    if (text.includes('サービス') || text.includes('service')) return 'service';
    if (text.includes('著者') || text.includes('author')) return 'author';
    if (text.includes('事例') || text.includes('case')) return 'case-study';
    if (title.match(/^#{1,6}/)) return 'heading';
    return 'section';
  }
} 