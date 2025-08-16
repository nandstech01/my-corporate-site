import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/',  // 管理画面はクロール対象外
        '/api/',    // API エンドポイントもクロール対象外
      ],
    },
    sitemap: 'https://nands.tech/sitemap.xml',
    host: 'https://nands.tech',
  };
} 