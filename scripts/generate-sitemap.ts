const { writeFileSync } = require('fs');
const { globby } = require('globby');
const prettier = require('prettier');

async function generate() {
  const prettierConfig = (await prettier.resolveConfig('./.prettierrc.js')) || {};
  const pages = await globby([
    'app/**/*.tsx',
    '!app/**/_*.tsx',
    '!app/**/layout.tsx',
    '!app/**/not-found.tsx',
  ]);

  const sitemap = `
    <?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${pages
        .map((page: string) => {
          const path = page
            .replace('app', '')
            .replace('/page.tsx', '')
            .replace('.tsx', '');
          const route = path === '/index' ? '' : path;
          return `
            <url>
              <loc>${`https://nands.tech${route}`}</loc>
              <lastmod>${new Date().toISOString()}</lastmod>
              <changefreq>${
                route === '' ? 'weekly' : 'monthly'
              }</changefreq>
              <priority>${route === '' ? '1.0' : '0.8'}</priority>
            </url>
          `;
        })
        .join('')}
    </urlset>
  `;

  const formatted = await prettier.format(sitemap, {
    ...prettierConfig,
    parser: 'html',
  });

  writeFileSync('public/sitemap.xml', formatted);
}

generate().catch(console.error); 