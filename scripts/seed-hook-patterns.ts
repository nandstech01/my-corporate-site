/**
 * フックパターンRAG 初期データ投入スクリプト
 * 
 * @usage: npx tsx scripts/seed-hook-patterns.ts
 */

import { createClient } from '@supabase/supabase-js';
import { VIRAL_HOOK_PATTERNS } from '../lib/viral-hooks/hook-templates';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedHookPatterns() {
  console.log('🚀 フックパターンRAG 初期データ投入開始...\n');

  let inserted = 0;
  let skipped = 0;
  let errors = 0;

  for (const pattern of VIRAL_HOOK_PATTERNS) {
    try {
      // 既存のパターンをチェック
      const { data: existing } = await supabase
        .from('viral_hook_patterns')
        .select('pattern_id')
        .eq('pattern_id', pattern.id)
        .single();

      if (existing) {
        console.log(`⏭️  ${pattern.id} は既に存在するのでスキップ`);
        skipped++;
        continue;
      }

      // 新規パターンを挿入
      const { error } = await supabase
        .from('viral_hook_patterns')
        .insert({
          pattern_id: pattern.id,
          name: pattern.name,
          type: pattern.type,
          template: pattern.template,
          variables: pattern.variables,
          effectiveness_score: pattern.effectiveness_score,
          target_audience: pattern.target_audience,
          description: pattern.description,
          example: pattern.example,
          source: pattern.source,
          use_cases: pattern.use_cases,
        });

      if (error) {
        console.error(`❌ ${pattern.id} の保存エラー:`, error.message);
        errors++;
      } else {
        console.log(`✅ ${pattern.id} を保存`);
        inserted++;
      }
    } catch (error: any) {
      console.error(`❌ ${pattern.id} の処理エラー:`, error.message);
      errors++;
    }
  }

  console.log(`\n📊 結果:`);
  console.log(`   新規挿入: ${inserted}件`);
  console.log(`   スキップ: ${skipped}件`);
  console.log(`   エラー: ${errors}件`);
  console.log(`   合計: ${VIRAL_HOOK_PATTERNS.length}件\n`);

  if (inserted > 0) {
    console.log('✅ フックパターンRAGの初期データ投入完了！');
  } else if (skipped === VIRAL_HOOK_PATTERNS.length) {
    console.log('ℹ️  全てのパターンが既に存在します');
  } else {
    console.log('⚠️  一部のパターンが保存できませんでした');
  }
}

// 実行
seedHookPatterns().catch((error) => {
  console.error('致命的エラー:', error);
  process.exit(1);
});

