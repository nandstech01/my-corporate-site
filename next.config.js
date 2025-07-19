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
  // 基本設定
  reactStrictMode: true,
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
    ignoreBuildErrors: false,
  },

  // 画像ドメインの設定
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'xhmhzhethpwjxuwksmuv.supabase.co',
        pathname: '/storage/v1/object/public/**',
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
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
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
      // 旧URLから新URLへのリダイレクト例
      // {
      //   source: '/old-path',
      //   destination: '/new-path',
      //   permanent: true,
      // },
    ];
  },
};

// MDX設定を適用してエクスポート
module.exports = withMDX(nextConfig);