import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing env vars. Check .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false }
});

async function runMigration() {
  console.log('Testing connection...');
  
  // Test by calling a simple query
  const { data: testData, error: testError } = await supabase
    .from('aso.user_tenants')
    .select('count')
    .limit(1);
  
  if (testError) {
    console.log('Direct table access failed (expected):', testError.message);
  }
  
  // Use raw SQL via REST API with service role
  // Unfortunately Supabase JS doesn't support raw SQL directly
  // We need to use the Database REST endpoint or psql
  
  console.log('');
  console.log('=== MANUAL MIGRATION REQUIRED ===');
  console.log('Please copy the migration SQL to Supabase Dashboard SQL Editor:');
  console.log('https://supabase.com/dashboard/project/xhmhzhethpwjxuwksmuv/sql');
  console.log('');
  console.log('Migration file: supabase/migrations/20260121000000_create_list_client_analyses_rpc.sql');
}

runMigration().catch(console.error);
