import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { AutoTOCSystem } from '@/lib/structured-data/auto-toc-system';
import { HowToFAQSchemaSystem } from '@/lib/structured-data/howto-faq-schema';
import { OpenAIEmbeddings } from '@/lib/vector/openai-embeddings';

// Service Role Key を使用してRLSをバイパス
const supabaseServiceRole = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { process_all = false, post_id = null } = await request.json();

    console.log('🔧 構造化データベクトル化開始...');

    // 対象記事の取得
    let postsQuery = supabaseServiceRole
      .from('posts')
      .select('id, title, content, slug, meta_description, meta_keywords')
      .eq('status', 'published');

    if (!process_all && post_id) {
      postsQuery = postsQuery.eq('id', post_id);
    }

    const { data: posts, error: postsError } = await postsQuery.order('created_at', { ascending: false });

    if (postsError) {
      throw new Error(`記事取得エラー: ${postsError.message}`);
    }

    if (!posts || posts.length === 0) {
      return NextResponse.json({
        success: false,
        message: '対象記事が見つかりません'
      });
    }

    console.log(`📝 処理対象記事: ${posts.length}件`);

    // Mike King理論準拠: 構造化データシステム初期化
    const autoTOCSystem = new AutoTOCSystem({
      generateFragmentIds: true,
      aiOptimization: true,
      minLevel: 2,
      maxLevel: 4
    });
    const howToFAQSystem = new HowToFAQSchemaSystem();
    const openaiEmbeddings = new OpenAIEmbeddings();

    let processedCount = 0;
    let skippedCount = 0;
    const processedPosts = [];

    for (const post of posts) {
      try {
        console.log(`🔍 記事「${post.title}」を処理中...`);

        // 既に構造化データがベクトル化されているかチェック
        const { data: existingStructuredData } = await supabaseServiceRole
          .from('company_vectors')
          .select('id')
          .eq('content_type', 'structured-data')
          .eq('metadata->>post_id', post.id.toString())
          .single();

        if (existingStructuredData) {
          console.log(`⏭️ 記事 ${post.id} の構造化データは既に存在します`);
          skippedCount++;
          continue;
        }

        // Fragment ID + TOC抽出
        const tocData = autoTOCSystem.generateTOCFromHTML(post.content);
        const hasFragmentIds = tocData.toc.length > 0;

        // FAQ・HowTo構造化データ抽出
        const faqData = howToFAQSystem.extractFAQFromContent(post.content);
        const howToData = howToFAQSystem.extractHowToFromContent(post.content, post.title);

        // 構造化データの統合
        const structuredDataContent = {
          post_info: {
            title: post.title,
            slug: post.slug,
            post_id: post.id,
            word_count: post.content.split(/\s+/).length
          },
          fragment_ids: hasFragmentIds ? tocData.toc.map((item: any, index: number) => ({
            id: item.anchor || item.id,
            title: item.title,
            level: item.level,
            position: index + 1,
            url: `https://nands.tech/posts/${post.slug}#${item.anchor || item.id}`,
            description: `${post.title}の第${index + 1}セクション: ${item.title}`
          })) : [],
          // Note: FAQPage/HowToはGoogle 2025ガイドラインで非推奨
          // ItemList + Question形式に変更
          faq_schema: faqData.length > 0 ? {
            "@context": "https://schema.org",
            "@type": "ItemList",
            itemListElement: faqData.map((faq, index) => ({
              "@type": "ListItem",
              position: index + 1,
              item: {
                "@type": "Question",
                name: faq.question,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: faq.answer
                }
              }
            }))
          } : null,
          // HowTo廃止 - Google 2024-2025でリッチリザルト機能廃止
          howto_schema: null,
          haspart_schema: hasFragmentIds ? tocData.toc.map((item: any, index: number) => ({
            "@type": "WebPageElement",
            "@id": `https://nands.tech/posts/${post.slug}#${item.anchor || item.id}`,
            name: item.title,
            description: `${post.title}の第${index + 1}セクション: ${item.title}`,
            url: `https://nands.tech/posts/${post.slug}#${item.anchor || item.id}`,
            position: index + 1,
            mainContentOfPage: false,
            speakable: {
              "@type": "SpeakableSpecification",
              cssSelector: [`#${item.anchor || item.id}`]
            }
          })) : []
        };

        // 構造化データをテキスト化（ベクトル化用）
        const structuredDataText = `# ${post.title} - 構造化データ

## Fragment IDs (セクション構造)
${structuredDataContent.fragment_ids.map(f => `- ${f.title} (#${f.id}): ${f.description}`).join('\n')}

## FAQ構造化データ
${faqData.map(faq => `Q: ${faq.question}\nA: ${faq.answer}`).join('\n\n')}

## HowTo構造化データ
${howToData.steps.map((step, i) => `Step ${i + 1}: ${step.title}\n${step.description}`).join('\n\n')}

## hasPart Schema (GEO最適化)
${structuredDataContent.haspart_schema.map(part => `${part.name}: ${part.description}`).join('\n')}

## メタデータ
- 記事ID: ${post.id}
- 語数: ${post.content.split(/\s+/).length}
- SEOキーワード: ${Array.isArray(post.meta_keywords) ? post.meta_keywords.join(', ') : (post.meta_keywords || 'N/A')}
- Fragment数: ${structuredDataContent.fragment_ids.length}
- FAQ数: ${faqData.length}
- HowTo Steps数: ${howToData.steps.length}`;

        // 構造化データをベクトル化（既存ガイドライン準拠）
        if (structuredDataText.length > 100) {
          console.log(`📊 構造化データをベクトル化中... (${structuredDataText.length}文字)`);
          
          const structuredDataEmbedding = await openaiEmbeddings.createEmbedding(structuredDataText, {});

          const structuredVectorData = {
            content_chunk: structuredDataText,
            embedding: structuredDataEmbedding,
            content_type: 'structured-data' as const,
            section_title: `${post.title} - 構造化データ`,
            metadata: {
              post_id: post.id,
              original_url: `/posts/${post.slug}`,
              word_count: structuredDataText.split(/\s+/).length,
              created_at: new Date().toISOString(),
              source_type: 'generated_blog_structured_data',
              fragment_count: structuredDataContent.fragment_ids.length,
              faq_count: faqData.length,
              howto_steps_count: howToData.steps.length
            }
          };

          const { error: structuredVectorError } = await supabaseServiceRole
            .from('company_vectors')
            .insert([structuredVectorData]);

          if (structuredVectorError) {
            console.error(`❌ 記事 ${post.id} の構造化データベクトル化エラー:`, structuredVectorError);
            continue;
          }

          console.log(`✅ 記事 ${post.id} の構造化データベクトル化完了`);
          console.log(`  - Fragment IDs: ${structuredDataContent.fragment_ids.length}個`);
          console.log(`  - FAQs: ${faqData.length}個`);
          console.log(`  - HowTo Steps: ${howToData.steps.length}個`);

          processedPosts.push({
            post_id: post.id,
            title: post.title,
            fragment_count: structuredDataContent.fragment_ids.length,
            faq_count: faqData.length,
            howto_steps_count: howToData.steps.length,
            structured_data_size: structuredDataText.length
          });

          processedCount++;
        } else {
          console.log(`⏭️ 記事 ${post.id} の構造化データが不十分 (${structuredDataText.length}文字)`);
          skippedCount++;
        }

      } catch (postError) {
        console.error(`❌ 記事 ${post.id} の処理エラー:`, postError);
        skippedCount++;
      }
    }

    // 最終統計
    const { data: finalStats } = await supabaseServiceRole
      .from('company_vectors')
      .select('content_type')
      .eq('content_type', 'structured-data');

    console.log('✅ 構造化データベクトル化完了');

    return NextResponse.json({
      success: true,
      processed_count: processedCount,
      skipped_count: skippedCount,
      total_posts: posts.length,
      total_structured_data_vectors: finalStats?.length || 0,
      processed_posts: processedPosts,
      message: `${processedCount}件の記事の構造化データをベクトル化しました`,
      recommendations: [
        "構造化データは記事と独立してベクトル検索可能になりました",
        "Fragment ID、FAQ、HowToスキーマが AI検索最適化されています",
        "今後の記事生成時にも自動で構造化データがベクトル化されます"
      ],
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ 構造化データベクトル化エラー:', error);
    return NextResponse.json({
      success: false,
      error: '構造化データベクトル化に失敗しました',
      details: (error as Error).message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 