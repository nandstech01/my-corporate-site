export const generateSlug = (text: string): string => {
  if (!text || text.trim().length === 0) {
    throw new Error('タイトルが無効です');
  }

  let slug = text
    .toLowerCase()
    .replace(/[^a-z0-9ぁ-んァ-ン一-龯]/g, '-') // 日本語文字も許可
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');

  // Slugの長さを100文字に制限（URL制限対策）
  if (slug.length > 100) {
    // 重要な単語を保持しながら短縮
    const words = slug.split('-');
    let shortSlug = '';
    for (const word of words) {
      if ((shortSlug + '-' + word).length <= 100) {
        shortSlug = shortSlug ? shortSlug + '-' + word : word;
      } else {
        break;
      }
    }
    slug = shortSlug || slug.substring(0, 100);
  }

  return slug;
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