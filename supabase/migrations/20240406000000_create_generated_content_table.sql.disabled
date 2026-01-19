-- Create generated_content table for RAG blog generation
CREATE TABLE IF NOT EXISTS public.generated_content (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL DEFAULT 'rag-blog',
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    query TEXT,
    rag_sources TEXT[],
    word_count INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_generated_content_type ON public.generated_content(type);
CREATE INDEX IF NOT EXISTS idx_generated_content_created_at ON public.generated_content(created_at);
CREATE INDEX IF NOT EXISTS idx_generated_content_status ON public.generated_content(status);

-- Enable RLS (Row Level Security)
ALTER TABLE public.generated_content ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users
CREATE POLICY "Allow authenticated users to manage generated content" ON public.generated_content
    FOR ALL USING (auth.role() = 'authenticated');

-- Create policy for service role
CREATE POLICY "Allow service role full access to generated content" ON public.generated_content
    FOR ALL USING (auth.role() = 'service_role');

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_generated_content_updated_at BEFORE UPDATE ON public.generated_content
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 