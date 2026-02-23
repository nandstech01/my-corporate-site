/**
 * CLAVI SaaS - ブログ記事生成API
 *
 * @description
 * 分析データを基にAIでSEOに強いブログ記事を生成
 * OpenAI Chat Completions APIを使用
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignore setAll errors from Server Components
          }
        },
      },
    }
  );
}

// Extend timeout for AI generation
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { analysisId, tone, direction, wordCount } = body;

    // Validate required fields
    if (!analysisId) {
      return NextResponse.json(
        { error: 'analysisId is required' },
        { status: 400 }
      );
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(analysisId)) {
      return NextResponse.json(
        { error: 'Invalid analysis ID format' },
        { status: 400 }
      );
    }

    const validTones = ['professional', 'casual', 'enthusiastic', 'technical'];
    const selectedTone = validTones.includes(tone) ? tone : 'professional';

    const validDirections = ['guide', 'casestudy'];
    const selectedDirection = validDirections.includes(direction) ? direction : 'guide';

    const targetWordCount = Math.min(5000, Math.max(1000, Number(wordCount) || 3000));

    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    // Authenticate
    const supabase = await createSupabaseServerClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get tenant context
    let tenant_id: string | null = null;

    const { data: context, error: contextError } = await supabase
      .rpc('get_current_tenant_context');

    if (!contextError && context?.tenant_id) {
      tenant_id = context.tenant_id;
    } else {
      const { data: membership, error: membershipError } = await supabase
        .rpc('get_user_tenant_by_id', { p_user_id: user.id })
        .single<{ tenant_id: string; role: string }>();

      if (membershipError || !membership) {
        return NextResponse.json(
          { error: 'No tenant context. Please select or join a tenant.' },
          { status: 403 }
        );
      }

      tenant_id = membership.tenant_id;
    }

    if (!tenant_id) {
      return NextResponse.json(
        { error: 'No tenant context' },
        { status: 403 }
      );
    }

    // Fetch analysis data
    const { data: analysis, error: fetchError } = await supabase
      .from('clavi_client_analyses')
      .select('id, url, company_name, analysis_data, ai_structure_score, status')
      .eq('id', analysisId)
      .eq('tenant_id', tenant_id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Analysis not found or access denied' },
          { status: 404 }
        );
      }
      console.error('[CLAVI Blog] Fetch error:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch analysis' },
        { status: 500 }
      );
    }

    if (analysis.status !== 'completed') {
      return NextResponse.json(
        { error: 'Analysis is not yet completed' },
        { status: 400 }
      );
    }

    const analysisData = analysis.analysis_data || {};

    // Extract useful context from analysis data
    const pageTitle = analysisData.title || analysisData.pageTitle || analysis.url;
    const headings = analysisData.headings || analysisData.haspart_schemas?.map((s: any) => s.name || s.headline).filter(Boolean) || [];
    const entities = analysisData.entities || analysisData.key_entities || [];
    const improvements = analysisData.improvements || analysisData.content_improvements || [];
    const keywords = analysisData.keywords || analysisData.key_topics || [];

    const toneDescriptions: Record<string, string> = {
      professional: 'Professional and authoritative, suitable for business executives',
      casual: 'Casual and conversational, easy to understand',
      enthusiastic: 'Enthusiastic and energetic, engaging the reader',
      technical: 'Technical and detailed, for expert readers',
    };

    const directionDescriptions: Record<string, string> = {
      guide: 'a comprehensive guide article with step-by-step explanations',
      casestudy: 'a case study article with real-world examples and outcomes',
    };

    const systemPrompt = `You are an expert SEO content writer specializing in Japanese business content. Generate a blog article based on the analysis data provided.

Requirements:
- Write in Japanese
- Target approximately ${targetWordCount} characters
- Use the tone: ${toneDescriptions[selectedTone]}
- Write as ${directionDescriptions[selectedDirection]}
- Include proper heading structure (H2, H3) for SEO
- Include relevant keywords naturally throughout the content
- End with a clear call-to-action

Response format (JSON):
{
  "title": "Article title in Japanese",
  "content": "Full article content in markdown format",
  "metaDescription": "150-character meta description in Japanese",
  "suggestedTags": ["tag1", "tag2", "tag3"],
  "wordCount": <approximate character count>
}`;

    const userPrompt = `Based on the following analysis data, generate an SEO-optimized blog article:

Page: ${pageTitle}
URL: ${analysis.url}
Company: ${analysis.company_name || 'N/A'}
Structure Score: ${analysis.ai_structure_score || 'N/A'}/100

Key Headings:
${headings.slice(0, 10).map((h: string) => `- ${h}`).join('\n')}

Key Entities/Topics:
${entities.slice(0, 10).map((e: any) => typeof e === 'string' ? `- ${e}` : `- ${e.name || e.label || JSON.stringify(e)}`).join('\n')}

Keywords:
${keywords.slice(0, 10).map((k: any) => typeof k === 'string' ? `- ${k}` : `- ${k.keyword || k.topic || JSON.stringify(k)}`).join('\n')}

Improvement Suggestions:
${improvements.slice(0, 5).map((imp: any) => typeof imp === 'string' ? `- ${imp}` : `- ${imp.suggestion || imp.description || JSON.stringify(imp)}`).join('\n')}

Generate the article now.`;

    // Call OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 4000,
        response_format: { type: 'json_object' },
      }),
    });

    if (!openaiResponse.ok) {
      const errText = await openaiResponse.text();
      console.error('[CLAVI Blog] OpenAI error:', errText);
      return NextResponse.json(
        { error: 'Failed to generate article' },
        { status: 502 }
      );
    }

    const openaiData = await openaiResponse.json();
    const generatedContent = openaiData.choices?.[0]?.message?.content;

    if (!generatedContent) {
      return NextResponse.json(
        { error: 'No content generated' },
        { status: 502 }
      );
    }

    let article;
    try {
      article = JSON.parse(generatedContent);
    } catch {
      // If JSON parsing fails, wrap raw content
      article = {
        title: pageTitle,
        content: generatedContent,
        metaDescription: '',
        suggestedTags: [],
        wordCount: generatedContent.length,
      };
    }

    return NextResponse.json(
      {
        title: article.title || '',
        content: article.content || '',
        metaDescription: article.metaDescription || '',
        suggestedTags: article.suggestedTags || [],
        wordCount: article.wordCount || article.content?.length || 0,
        analysisId: analysis.id,
        sourceUrl: analysis.url,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[CLAVI Blog] Error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
