-- Create posts table for blog articles
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    content TEXT NOT NULL,
    business_id INTEGER REFERENCES businesses(id),
    category_id INTEGER REFERENCES categories(id),
    thumbnail_url TEXT,
    meta_description TEXT,
    meta_keywords TEXT[],
    canonical_url TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(business_id, slug)
);

-- Create indexes for better query performance
CREATE INDEX posts_business_id_idx ON posts(business_id);
CREATE INDEX posts_category_id_idx ON posts(category_id);
CREATE INDEX posts_status_idx ON posts(status);
CREATE INDEX posts_published_at_idx ON posts(published_at);

-- Create trigger for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_posts_updated_at
    BEFORE UPDATE ON posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add RLS (Row Level Security) policies
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Policy for selecting posts (anyone can read published posts)
CREATE POLICY "Anyone can read published posts"
    ON posts FOR SELECT
    USING (status = 'published');

-- Policy for inserting/updating/deleting posts (only authenticated users with proper role)
CREATE POLICY "Only authorized users can modify posts"
    ON posts FOR ALL
    USING (auth.role() = 'authenticated' AND auth.uid() IN (
        SELECT user_id FROM admin_users
    )); 