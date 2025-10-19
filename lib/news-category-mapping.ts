/**
 * News Category to Blog Article Mapping
 * 
 * Yahoo! Newsのカテゴリと、ブログ記事のカテゴリタグのマッピング定義
 * ショート動画台本生成時に、ニュースとブログ記事の親和性を判断するために使用
 */

export type YahooNewsCategory = 'IT' | '科学' | 'スポーツ' | 'エンタメ' | '経済';
export type BlogCategoryTag = string;

/**
 * Yahoo! Newsカテゴリ → ブログ記事カテゴリタグのマッピング
 * 
 * 重なり度の基準:
 * - 高親和性（70%以上）: 対立構造パターン
 * - 中親和性（40-70%）: ピボットパターン
 * - 低親和性（40%未満）: 並列紹介パターン or news-only
 */
export const NEWS_TO_BLOG_CATEGORY_MAPPING: Record<YahooNewsCategory, BlogCategoryTag[]> = {
  'IT': [
    'IT', '技術', 'AI', 'プログラミング', '開発', 'データ分析', 'システム', 
    'Web', 'アプリ', 'クラウド', 'セキュリティ', 'ネットワーク'
  ],
  '科学': [
    '技術', 'AI', 'データ分析', '研究', 'イノベーション', '先端技術',
    '機械学習', 'データサイエンス', '統計'
  ],
  'スポーツ': [
    'データ分析', 'ビジネス', '組織論', 'マネジメント', '戦略', 
    'チームビルディング', 'パフォーマンス', '最適化'
  ],
  'エンタメ': [
    'マーケティング', 'SNS', 'デジタル', 'トレンド', 'ブランディング',
    'コンテンツ', 'クリエイティブ', 'ファン', 'エンゲージメント'
  ],
  '経済': [
    'ビジネス', '経済', 'DX', '効率化', 'コスト削減', '生産性',
    'AI', '自動化', 'デジタル化', 'イノベーション', '投資'
  ]
};

/**
 * タグ重なり度を計算
 * 
 * @param newsTags - ニュースのカテゴリタグ
 * @param blogTags - ブログ記事のカテゴリタグ
 * @returns 重なり度（0-100%）
 */
export function calculateTagOverlap(newsTags: string[], blogTags: string[]): number {
  if (newsTags.length === 0 || blogTags.length === 0) {
    return 0;
  }

  // 共通タグの数をカウント
  const commonTags = newsTags.filter(tag => 
    blogTags.some(blogTag => 
      blogTag.toLowerCase() === tag.toLowerCase()
    )
  );

  // Jaccard係数を使用（重なり度）
  const union = new Set([...newsTags, ...blogTags]);
  const overlap = (commonTags.length / union.size) * 100;

  return Math.round(overlap);
}

/**
 * マッチングパターンを判定
 * 
 * @param overlapPercentage - タグ重なり度（0-100%）
 * @returns マッチングパターン
 */
export function determineMatchingPattern(overlapPercentage: number): 'direct' | 'pivot' | 'parallel' | 'news-only' {
  if (overlapPercentage >= 70) {
    return 'direct'; // 対立構造パターン
  } else if (overlapPercentage >= 40) {
    return 'pivot'; // ピボットパターン
  } else if (overlapPercentage >= 20) {
    return 'parallel'; // 並列紹介パターン
  } else {
    return 'news-only'; // ニュース解説専用
  }
}

/**
 * 結びつけフレーズ辞書
 * 
 * タグ組み合わせに応じた、自然な接続フレーズを提供
 */
export const CONNECT_PHRASES: Record<string, string> = {
  // ギャンブル × 再現性
  'ギャンブル-再現性': '運じゃなく設計で',
  'ギャンブル-データ分析': '確率と期待値で見れば',
  'ギャンブル-AI': '感情より、データで',
  
  // 速報 × 効率化
  '速報-効率化': 'スピード勝負の裏側では',
  '速報-自動化': '速さを支える仕組みは',
  
  // 失敗 × 学習
  '失敗-学習': '失敗から学ぶAIの視点',
  '失敗-改善': 'エラーを糧にする設計',
  
  // スポーツ × データ分析
  'スポーツ-データ分析': '勝敗を分けるのはデータ',
  'スポーツ-戦略': '勝つための設計図',
  
  // エンタメ × マーケティング
  'エンタメ-マーケティング': 'バズの裏側に仕掛けあり',
  'エンタメ-SNS': '拡散を生む設計',
  
  // 経済 × DX
  '経済-DX': 'デジタル化が変える世界',
  '経済-自動化': '人件費削減の裏技',
  
  // デフォルト
  'default': '一見無関係だが、AIの視点では'
};

/**
 * 結びつけフレーズを取得
 * 
 * @param newsTag - ニュースのタグ
 * @param blogTag - ブログ記事のタグ
 * @returns 結びつけフレーズ
 */
export function getConnectPhrase(newsTag: string, blogTag: string): string {
  const key1 = `${newsTag}-${blogTag}`;
  const key2 = `${blogTag}-${newsTag}`;
  
  return CONNECT_PHRASES[key1] || CONNECT_PHRASES[key2] || CONNECT_PHRASES['default'];
}

