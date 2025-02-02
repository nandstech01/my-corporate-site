export const generateSlug = (text: string): string => {
  if (!text || text.trim().length === 0) {
    throw new Error('タイトルが無効です');
  }

  return text
    .toLowerCase()
    .replace(/[^a-z0-9ぁ-んァ-ン一-龯]/g, '-') // 日本語文字も許可
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
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