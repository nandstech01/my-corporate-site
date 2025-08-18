import { NextRequest, NextResponse } from 'next/server';
import { getAllEntities } from '@/lib/structured-data/entity-relationships';

/**
 * 🚀 OpenAI Plugin - Fragment取得API
 * 特定ページ・Fragment IDの詳細情報を提供
 */

interface Fragment {
  id: string;
  name: string;
  url: string;
  type: 'title' | 'section' | 'faq' | 'passage';
  weight: number;
}

interface FragmentResponse {
  fragments: Fragment[];
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page');
    const fragmentId = searchParams.get('fragmentId');

    const allEntities = getAllEntities();
    const fragments: Fragment[] = [];

    if (fragmentId) {
      // 特定Fragment ID検索
      const entity = allEntities.find(e => e['@id'].includes(`#${fragmentId}`));
      if (entity) {
        fragments.push({
          id: fragmentId,
          name: entity.name,
          url: entity['@id'],
          type: getFragmentType(fragmentId),
          weight: getFragmentWeight(fragmentId)
        });
      }
    } else if (page) {
      // ページ内全Fragment検索
      const pageEntities = allEntities.filter(e => {
        const entityUrl = new URL(e['@id']).pathname;
        return entityUrl === page && e['@id'].includes('#');
      });

      pageEntities.forEach(entity => {
        const id = entity['@id'].split('#')[1];
        fragments.push({
          id,
          name: entity.name,
          url: entity['@id'],
          type: getFragmentType(id),
          weight: getFragmentWeight(id)
        });
      });
    } else {
      // AI-site専用Fragment一覧（デフォルト）
      const aiSiteEntities = allEntities.filter(e => 
        e['@id'].includes('ai-site#') || e['@id'].includes('/ai-site#')
      );

      aiSiteEntities.forEach(entity => {
        const id = entity['@id'].split('#')[1];
        fragments.push({
          id,
          name: entity.name,
          url: entity['@id'],
          type: getFragmentType(id),
          weight: getFragmentWeight(id)
        });
      });
    }

    // 重要度順にソート
    fragments.sort((a, b) => b.weight - a.weight);

    const response: FragmentResponse = {
      fragments
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=86400',
        'X-Fragment-Count': fragments.length.toString()
      }
    });

  } catch (error) {
    console.error('OpenAI Plugin Fragments API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Fragment retrieval failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Fragment IDからタイプを推定
 */
function getFragmentType(fragmentId: string): 'title' | 'section' | 'faq' | 'passage' {
  if (fragmentId === 'main-title') return 'title';
  if (fragmentId.startsWith('faq-')) return 'faq';
  if (fragmentId.startsWith('subtopic-')) return 'passage';
  return 'section';
}

/**
 * Fragment IDから重要度を算出
 */
function getFragmentWeight(fragmentId: string): number {
  if (fragmentId === 'main-title') return 1.0;
  if (fragmentId.startsWith('faq-')) return 0.9;
  if (fragmentId.startsWith('subtopic-')) return 0.7;
  if (fragmentId.includes('pricing') || fragmentId.includes('contact')) return 0.8;
  return 0.6;
} 