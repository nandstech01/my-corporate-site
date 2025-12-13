/** @type {import('next').NextConfig} */
const path = require('path');

// MDX設定の追加
const withMDX = require('@next/mdx')({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
    // MDXファイル内でJSXを使用可能にする
    providerImportSource: "@mdx-js/react",
  },
})

const nextConfig = {
  // 基本設定（音声AI開発中のみStrictMode無効化）
  reactStrictMode: false, // 開発中は無効化（音声接続の重複防止）
  swcMinify: true,

  // MDXページルートの設定
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],

  // 実験的機能でパフォーマンス向上（レリバンスエンジニアリング対応）
  experimental: {
    optimizePackageImports: [
      'framer-motion',
      '@react-three/fiber',
      '@react-three/drei',
      '@react-spring/web',
      'three',
      'postprocessing'
    ],
    // MDXサポートを有効化
    mdxRs: false, // 安定性のためfalseに設定
  },

  // Webpackの設定
  webpack: (config, { isServer, dev }) => {
    // エイリアスの設定
    config.resolve.alias['@'] = path.resolve(__dirname);
    
    // フォールバックの設定
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      canvas: false,
      encoding: false,
      bufferutil: false,
      'utf-8-validate': false,
    };
    
    // canvasモジュールをwebpackの対象から除外
    if (isServer) {
      config.externals = [...(config.externals || []), 'canvas'];
    }

    // 重いライブラリを分離（SEO最適化）
    if (!isServer) {
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks.cacheGroups,
          // Three.js関連の重いライブラリを分離
          heavy3d: {
            test: /[\\/]node_modules[\\/](@react-three|three|postprocessing)[\\/]/,
            name: 'heavy-3d',
            chunks: 'async',
            priority: 10,
            enforce: true,
          },
          // アニメーションライブラリを分離
          animations: {
            test: /[\\/]node_modules[\\/](framer-motion|@react-spring)[\\/]/,
            name: 'animations', 
            chunks: 'async',
            priority: 9,
            enforce: true,
          },
          // WebGLライブラリを分離
          webgl: {
            test: /[\\/]node_modules[\\/](ogl|matter-js)[\\/]/,
            name: 'webgl',
            chunks: 'async',
            priority: 8,
            enforce: true,
          }
        }
      }
    }
    
    return config;
  },

  // TypeScriptの設定
  typescript: {
    ignoreBuildErrors: true, // ビルド時の型エラーを無視
  },

  // 画像ドメインの設定
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'xhmhzhethpwjxuwksmuv.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
        pathname: '/vi/**',
      }
    ],
    unoptimized: false,
  },

  // 開発インジケーターの設定
  devIndicators: {
    buildActivity: true
  },

  // 環境変数の設定
  env: {
    API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:3000',
  },

  // パフォーマンス最適化（SEO向上）
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // ヘッダー設定（SEO強化）
  // 注意: Content-Security-Policyはvercel.jsonで管理
  // vercel.jsonが優先されるため、ここではCSPを設定しない
  async headers() {
    return [
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, stale-while-revalidate=86400',
          },
        ],
      },
    ];
  },

  // リダイレクト設定（SEO最適化）
  async redirects() {
    return [
      // 404エラー修正：古いページURLを適切なページへリダイレクト
      {
        source: '/company',
        destination: '/about',
        permanent: true, // 301リダイレクト
      },
      {
        source: '/services',
        destination: '/',
        permanent: true,
      },
      {
        source: '/contact',
        destination: '/',
        permanent: true,
      },
      {
        source: '/recruit',
        destination: '/about',
        permanent: true,
      },
      // 長いAIO記事URLから短縮URLへの301リダイレクト
      {
        source: '/posts/aio%E5%AF%BE%E7%AD%96%E5%AE%8C%E5%85%A8%E3%82%AC%E3%82%A4%E3%83%89-2025%E5%B9%B4%E6%9C%80%E6%96%B0%E7%89%88-google-ai%E3%81%AB-%E9%81%B8%E3%81%B0%E3%82%8C%E3%82%8B-%E6%96%B0%E5%B8%B8%E8%AD%98-%E3%83%AC%E3%83%AA%E3%83%90%E3%83%B3%E3%82%B9%E3%82%A8%E3%83%B3%E3%82%B8%E3%83%8B%E3%82%A2%E3%83%AA%E3%83%B3%E3%82%B0%E3%81%A8%E3%81%AF-%E6%88%90%E5%8A%9F%E4%BA%8B%E4%BE%8B%E3%81%A7%E8%A8%BC%E6%98%8E',
        destination: '/posts/aio-レリバンスエンジニアリング-2025-構造化データ',
        permanent: true, // 301リダイレクト
      },
      {
        source: '/posts/aio対策完全ガイド-2025年最新版-google-aiに-選ばれる-新常識-レリバンスエンジニアリングとは-成功事例で証明',
        destination: '/posts/aio-レリバンスエンジニアリング-2025-構造化データ',
        permanent: true,
      },
      // 将来の長いURLパターンにも対応
      {
        source: '/posts/:slug(.*)',
        has: [
          {
            type: 'query',
            key: 'redirect',
            value: 'short'
          }
        ],
        destination: '/posts/:slug',
        permanent: true,
      }
    ]
  },
};

// MDX設定を適用してエクスポート
module.exports = withMDX(nextConfig);