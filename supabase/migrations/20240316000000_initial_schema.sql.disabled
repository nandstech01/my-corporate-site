-- Create businesses table
CREATE TABLE IF NOT EXISTS public.businesses (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    business_id BIGINT REFERENCES public.businesses(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(slug, business_id)
);

-- Create posts table
CREATE TABLE IF NOT EXISTS public.posts (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    business_id BIGINT REFERENCES public.businesses(id),
    category_id BIGINT REFERENCES public.categories(id),
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(slug, business_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_businesses_slug ON public.businesses(slug);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_business_id ON public.categories(business_id);
CREATE INDEX IF NOT EXISTS idx_posts_slug ON public.posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_business_id ON public.posts(business_id);
CREATE INDEX IF NOT EXISTS idx_posts_category_id ON public.posts(category_id);
CREATE INDEX IF NOT EXISTS idx_posts_status ON public.posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_published_at ON public.posts(published_at);

-- Insert test data
INSERT INTO public.businesses (name, slug) VALUES
('AI事業部', 'ai'),
('デジタルマーケティング事業部', 'digital-marketing')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.categories (name, slug, business_id)
SELECT 'AI開発', 'ai-development', id FROM public.businesses WHERE slug = 'ai'
ON CONFLICT ON CONSTRAINT categories_slug_business_id_key DO NOTHING;

INSERT INTO public.categories (name, slug, business_id)
SELECT 'AI研修', 'ai-training', id FROM public.businesses WHERE slug = 'ai'
ON CONFLICT ON CONSTRAINT categories_slug_business_id_key DO NOTHING;

INSERT INTO public.categories (name, slug, business_id)
SELECT 'SEO', 'seo', id FROM public.businesses WHERE slug = 'digital-marketing'
ON CONFLICT ON CONSTRAINT categories_slug_business_id_key DO NOTHING;

-- Insert test posts
INSERT INTO public.posts (
    title,
    slug,
    content,
    business_id,
    category_id,
    status,
    published_at
)
SELECT
    'AIを活用した業務効率化の実践例',
    'ai-business-efficiency',
    '# AIを活用した業務効率化の実践例\n\nAIを活用することで、多くの企業が業務効率を大幅に改善しています。\n\n## 主な活用例\n\n1. 自動データ入力\n2. 文書分類\n3. 顧客対応の自動化\n\n詳しい内容は本文をご覧ください。',
    b.id,
    c.id,
    'published',
    NOW()
FROM
    public.businesses b
    JOIN public.categories c ON c.business_id = b.id
WHERE
    b.slug = 'ai'
    AND c.slug = 'ai-development'
ON CONFLICT ON CONSTRAINT posts_slug_business_id_key DO NOTHING; 