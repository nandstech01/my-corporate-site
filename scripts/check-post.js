const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or ANON_KEY. Check .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPost() {
  const { data, error } = await supabase
    .from('posts')
    .select('id, slug, title, content')
    .eq('slug', 'notebooklm-180599')
    .single();
  
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  console.log('Post ID:', data.id);
  console.log('Slug:', data.slug);
  console.log('Title:', data.title);
  console.log('Content Length:', data.content?.length);
  
  // Check for problematic patterns
  const content = data.content || '';
  
  // Check for unclosed HTML tags
  const openTags = (content.match(/<[a-z]+[^>]*>/gi) || []).length;
  const closeTags = (content.match(/<\/[a-z]+>/gi) || []).length;
  console.log('Open tags:', openTags, 'Close tags:', closeTags);
  
  // Check for special characters
  if (content.includes('<script')) console.log('⚠️ Contains script tag');
  if (content.includes('<style')) console.log('⚠️ Contains style tag');
  
  // Check first 500 chars
  console.log('\nFirst 500 chars:');
  console.log(content.substring(0, 500));
}

checkPost();

