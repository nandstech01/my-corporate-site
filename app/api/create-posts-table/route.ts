import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    
    console.log('🚀 Creating posts table...');
    
    // Create posts table
    const { data, error } = await supabase.rpc('create_posts_table');
    
    if (error) {
      console.error('❌ Error creating posts table:', error);
      return NextResponse.json({ 
        error: 'Failed to create posts table',
        details: error.message 
      }, { status: 500 });
    }
    
    console.log('✅ Posts table created successfully');
    
    return NextResponse.json({ 
      success: true,
      message: 'Posts table created successfully'
    });
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return NextResponse.json({ 
      error: 'Unexpected error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    
    console.log('🔍 Executing SQL directly...');
    
    // SQL to create posts table
    const createTableSQL = `
      -- Create posts table for blog articles
      CREATE TABLE IF NOT EXISTS posts (
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
      CREATE INDEX IF NOT EXISTS posts_business_id_idx ON posts(business_id);
      CREATE INDEX IF NOT EXISTS posts_category_id_idx ON posts(category_id);
      CREATE INDEX IF NOT EXISTS posts_status_idx ON posts(status);
      CREATE INDEX IF NOT EXISTS posts_published_at_idx ON posts(published_at);

      -- Create trigger for updating updated_at timestamp
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql';

      CREATE TRIGGER IF NOT EXISTS update_posts_updated_at
          BEFORE UPDATE ON posts
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();

      -- Add RLS (Row Level Security) policies
      ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

      -- Drop existing policies if they exist
      DROP POLICY IF EXISTS "Anyone can read published posts" ON posts;
      DROP POLICY IF EXISTS "Only authorized users can modify posts" ON posts;

      -- Policy for selecting posts (anyone can read published posts)
      CREATE POLICY "Anyone can read published posts"
          ON posts FOR SELECT
          USING (status = 'published');

      -- Policy for inserting/updating/deleting posts (allow all operations for now)
      CREATE POLICY "Allow all operations for posts"
          ON posts FOR ALL
          USING (true);
    `;

    // Execute SQL directly
    const { data, error } = await supabase.rpc('exec_sql', { sql: createTableSQL });
    
    if (error) {
      console.error('❌ Error executing SQL:', error);
      
      // Try alternative approach - create table without RLS
      const simpleCreateSQL = `
        CREATE TABLE IF NOT EXISTS posts (
            id SERIAL PRIMARY KEY,
            title TEXT NOT NULL,
            slug TEXT NOT NULL,
            content TEXT NOT NULL,
            business_id INTEGER,
            category_id INTEGER,
            thumbnail_url TEXT,
            meta_description TEXT,
            meta_keywords TEXT[],
            canonical_url TEXT,
            status TEXT DEFAULT 'draft',
            published_at TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `;
      
      const { data: simpleData, error: simpleError } = await supabase.rpc('exec_sql', { sql: simpleCreateSQL });
      
      if (simpleError) {
        return NextResponse.json({ 
          error: 'Failed to create posts table',
          details: simpleError.message,
          originalError: error.message
        }, { status: 500 });
      }
      
      return NextResponse.json({ 
        success: true,
        message: 'Posts table created successfully (simple version)',
        data: simpleData
      });
    }
    
    console.log('✅ SQL executed successfully');
    
    return NextResponse.json({ 
      success: true,
      message: 'Posts table created successfully',
      data: data
    });
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return NextResponse.json({ 
      error: 'Unexpected error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 