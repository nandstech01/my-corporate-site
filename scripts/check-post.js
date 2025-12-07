const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://xhmhzhethpwjxuwksmuv.supabase.co',
  process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhobWh6aGV0aHB3anh1d2tzbXV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMxMzc2NzcsImV4cCI6MjA0ODcxMzY3N30.Ej8Ej8Ej8Ej8'
);

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

