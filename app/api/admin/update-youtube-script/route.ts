import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { OpenAIEmbeddings } from '@/lib/vector/openai-embeddings';

const supabaseServiceRole = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * YouTubeショート台本編集API
 * 
 * 台本内容を編集すると、自動的にembeddingを再生成し、
 * fragment_vectorsも同期更新します。
 */
export async function POST(request: NextRequest) {
  try {
    const {
      scriptId,
      script_title,
      script_hook,
      script_empathy,
      script_body,
      script_cta,
      youtube_metadata
    } = await request.json();

    if (!scriptId) {
      return NextResponse.json(
        { success: false, error: 'scriptId は必須です' },
        { status: 400 }
      );
    }

    console.log('\n✏️ ========================================');
    console.log('📝 YouTubeショート台本編集開始');
    console.log(`  Script ID: ${scriptId}`);
    console.log('✏️ ========================================\n');

    // 1. 既存の台本データを取得
    console.log('📥 既存の台本データ取得中...');
    const { data: existingScript, error: fetchError } = await supabaseServiceRole
      .from('company_youtube_shorts')
      .select('*')
      .eq('id', scriptId)
      .single();

    if (fetchError || !existingScript) {
      console.error('❌ 台本データ取得エラー:', fetchError);
      return NextResponse.json(
        { success: false, error: '台本データが見つかりません' },
        { status: 404 }
      );
    }
    console.log('✅ 既存の台本データ取得完了\n');

    // 2. 更新用のコンテンツを準備
    const updatedHook = script_hook || existingScript.script_hook;
    const updatedEmpathy = script_empathy || existingScript.script_empathy;
    const updatedBody = script_body || existingScript.script_body;
    const updatedCta = script_cta || existingScript.script_cta;
    const updatedTitle = script_title || existingScript.script_title;

    // 3. content_for_embedding を再生成
    console.log('🔄 Content for Embedding再生成中...');
    const contentForEmbedding = `
台本タイトル: ${updatedTitle}

Hook（冒頭2秒）:
${updatedHook}

Empathy（共感ゾーン）:
${updatedEmpathy}

Body（本題・解決策）:
${updatedBody}

CTA（行動導線）:
${updatedCta}
`.trim();
    console.log('✅ Content for Embedding再生成完了\n');

    // 4. Embeddingを再生成
    console.log('🧮 Embedding再生成中（ベクトル化）...');
    const embeddings = new OpenAIEmbeddings();
    const newEmbedding = await embeddings.embedSingle(contentForEmbedding);
    console.log(`✅ Embedding再生成完了: ${newEmbedding.length}次元\n`);

    // 5. metadataを更新（既存のyoutube_metadataを保持）
    const updatedMetadata = {
      ...(existingScript.metadata as any || {}),
      youtube_metadata: youtube_metadata || (existingScript.metadata as any)?.youtube_metadata
    };

    // 6. company_youtube_shorts を更新
    console.log('💾 台本データ更新中...');
    const { error: updateError } = await supabaseServiceRole
      .from('company_youtube_shorts')
      .update({
        script_title: updatedTitle,
        script_hook: updatedHook,
        script_empathy: updatedEmpathy,
        script_body: updatedBody,
        script_cta: updatedCta,
        content_for_embedding: contentForEmbedding,
        embedding: newEmbedding,
        metadata: updatedMetadata,
        updated_at: new Date().toISOString()
      })
      .eq('id', scriptId);

    if (updateError) {
      console.error('❌ 台本データ更新エラー:', updateError);
      return NextResponse.json(
        { success: false, error: '台本の更新に失敗しました' },
        { status: 500 }
      );
    }
    console.log('✅ 台本データ更新完了\n');

    // 7. fragment_vectors も同期更新
    console.log('🔗 Fragment Vectors同期更新中...');
    const { error: fragmentError } = await supabaseServiceRole
      .from('fragment_vectors')
      .update({
        content_title: updatedTitle,
        content: contentForEmbedding,
        embedding: newEmbedding,
        updated_at: new Date().toISOString()
      })
      .eq('fragment_id', existingScript.fragment_id);

    if (fragmentError) {
      console.error('⚠️ Fragment Vectors同期更新エラー:', fragmentError);
      // エラーは記録するが処理は続行（台本は既に更新済み）
    } else {
      console.log('✅ Fragment Vectors同期更新完了\n');
    }

    console.log('🎉 ========================================');
    console.log('✅ YouTubeショート台本編集完了！');
    console.log(`  Script ID: ${scriptId}`);
    console.log(`  Fragment ID: ${existingScript.fragment_id}`);
    console.log('  ✨ Embeddingも自動再生成済み');
    console.log('🎉 ========================================\n');

    return NextResponse.json({
      success: true,
      scriptId,
      fragmentId: existingScript.fragment_id,
      message: '台本を更新し、Embeddingも再生成しました'
    });

  } catch (error) {
    console.error('❌ 台本編集エラー:', error);
    return NextResponse.json(
      { success: false, error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}

