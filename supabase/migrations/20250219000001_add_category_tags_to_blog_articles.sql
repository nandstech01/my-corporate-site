-- Add category_tags column to posts table for content categorization
-- This enables category-based matching between news and blog articles for short video script generation

-- Add category_tags column (array of text)
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS category_tags TEXT[] DEFAULT '{}';

-- Add index for faster category filtering
CREATE INDEX IF NOT EXISTS idx_posts_category_tags 
ON posts USING GIN (category_tags);

-- Add comment
COMMENT ON COLUMN posts.category_tags IS 'カテゴリタグ（ニュースマッチング用）: IT, 科学, スポーツ, エンタメ, 経済, ビジネス, 技術, データ分析, マーケティング など';

-- Sample category tags for existing articles (can be updated manually later)
-- These are examples and should be customized based on actual article content
UPDATE posts 
SET category_tags = ARRAY['IT', '技術', 'AI', 'データ分析']
WHERE title ILIKE '%AI%' OR title ILIKE '%ChatGPT%' OR title ILIKE '%RAG%' OR title ILIKE '%ベクトル%'
  OR content ILIKE '%AI%' OR content ILIKE '%機械学習%';

UPDATE posts 
SET category_tags = ARRAY['ビジネス', '経済', '効率化', 'DX']
WHERE title ILIKE '%業務%' OR title ILIKE '%ビジネス%' OR title ILIKE '%効率%' OR title ILIKE '%DX%'
  OR content ILIKE '%業務改善%' OR content ILIKE '%生産性%';

UPDATE posts 
SET category_tags = ARRAY['IT', '技術', 'プログラミング', '開発']
WHERE title ILIKE '%開発%' OR title ILIKE '%プログラミング%' OR title ILIKE '%コード%' OR title ILIKE '%実装%'
  OR content ILIKE '%実装%' OR content ILIKE '%コード%';

UPDATE posts 
SET category_tags = ARRAY['マーケティング', 'SNS', 'デジタル']
WHERE title ILIKE '%SNS%' OR title ILIKE '%マーケティング%' OR title ILIKE '%広告%' OR title ILIKE '%SEO%'
  OR content ILIKE '%マーケティング%' OR content ILIKE '%集客%';

