import { generateMainSitemap, generateBlogSitemap, generateCategorySitemap } from '../sitemap';
import { NextResponse } from 'next/server';

export const revalidate = 3600; // 1時間ごとに再検証

export async function GET(
  request: Request,
  { params }: { params: { type?: string } }
) {
  // パラメータの検証と安全な取得
  const type = params?.type || 'main';
  let sitemap;
  
  // タイプに応じてサイトマップを生成
  switch (type) {
    case 'main':
      sitemap = await generateMainSitemap();
      break;
    case 'blog':
      sitemap = await generateBlogSitemap();
      break;
    case 'category':
      sitemap = await generateCategorySitemap();
      break;
    default:
      return new NextResponse('Not Found', { status: 404 });
  }
  
  // サイトマップが正しく生成されたか確認
  if (!sitemap || !Array.isArray(sitemap)) {
    return new NextResponse('Error generating sitemap', { status: 500 });
  }
  
  // XML形式のサイトマップに変換
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
  ${sitemap.map((entry) => `
    <url>
      <loc>${entry.url}</loc>
      <lastmod>${new Date(entry.lastModified).toISOString()}</lastmod>
      ${entry.changeFrequency ? `<changefreq>${entry.changeFrequency}</changefreq>` : ''}
      ${entry.priority !== undefined ? `<priority>${entry.priority}</priority>` : ''}
    </url>
  `).join('')}
</urlset>`;
  
  // XMLレスポンスを返す
  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600'
    }
  });
} 