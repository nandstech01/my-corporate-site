// 重要キーワードのリスト（優先度順）
const IMPORTANT_KEYWORDS = [
  'レリバンスエンジニアリング',
  'relevance-engineering',
  '構造化データ',
  'structured-data',
  'ssr',
  'seo',
  'aio',
  '2025',
  '2024',
  'ai',
  'chatgpt',
  'google',
  'ベクトル',
  'vector',
  'rag',
  'llm',
  'api',
  'nextjs',
  'react',
  'typescript',
  'javascript',
  'データベース',
  'database',
  'supabase',
  'マーケティング',
  'marketing',
  'ビジネス',
  'business',
  '開発',
  'development',
  '解説',
  'guide',
  'ガイド',
  '完全',
  '最新',
  '対策',
  '成功',
  '事例',
  '実装',
  '活用',
  '効果',
  '方法',
  '手順'
];

export const generateSlug = (text: string): string => {
  if (!text || text.trim().length === 0) {
    throw new Error('タイトルが無効です');
  }

  // 基本的なslug変換
  let slug = text
    .toLowerCase()
    .replace(/[^a-z0-9ぁ-んァ-ン一-龯]/g, '-') // 日本語文字も許可
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');

  // 50文字以下の場合はそのまま返す
  if (slug.length <= 50) {
    return slug;
  }

  console.log(`🔧 長いslug検出 (${slug.length}文字): ${slug}`);
  
  // 重要キーワードを抽出して短縮版を生成
  const shortSlug = generateShortSlug(text, slug);
  
  console.log(`✅ 短縮slug生成 (${shortSlug.length}文字): ${shortSlug}`);
  
  return shortSlug;
};

// 重要キーワードを保持しながら短いslugを生成
const generateShortSlug = (originalText: string, basicSlug: string): string => {
  const words = basicSlug.split('-').filter(word => word.length > 0);
  const importantWords: string[] = [];
  const remainingWords: string[] = [];

  // 重要キーワードを優先的に抽出
  for (const word of words) {
    const isImportant = IMPORTANT_KEYWORDS.some(keyword => 
      word.includes(keyword.toLowerCase()) || keyword.toLowerCase().includes(word)
    );
    
    if (isImportant) {
      importantWords.push(word);
    } else {
      remainingWords.push(word);
    }
  }

  // 重要キーワードから開始
  let result = importantWords.slice(0, 6).join('-'); // 最大6個の重要キーワード

  // 残りの文字数で追加の単語を含める
  for (const word of remainingWords) {
    const potential = result + '-' + word;
    if (potential.length <= 45) { // 5文字の余裕を持つ
      result = potential;
    } else {
      break;
    }
  }

  // それでも空の場合は、最初の3つの単語を使用
  if (!result || result.length === 0) {
    result = words.slice(0, 3).join('-');
  }

  // 最終的に45文字以下に制限
  if (result.length > 45) {
    result = result.substring(0, 45).replace(/-[^-]*$/, '');
  }

  return result || 'article-' + Date.now().toString(36);
};

export const ensureUniqueSlug = async (baseSlug: string, existingSlugs: string[]): Promise<string> => {
  let slug = baseSlug;
  let counter = 1;

  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}; 