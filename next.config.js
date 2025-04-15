/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  // 基本設定
  reactStrictMode: true,
  swcMinify: true,

  // Webpackの設定
  webpack: (config, { isServer }) => {
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

  // パフォーマンス最適化
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // セキュリティヘッダーの設定
  headers: async () => {
    // 開発環境と本番環境で異なるヘッダーを設定
    const isDevEnvironment = process.env.NODE_ENV === 'development';
    
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // 開発環境でのみCSP制限を緩和
          ...(isDevEnvironment ? [
            {
              key: 'Content-Security-Policy',
              value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:;",
            }
          ] : [])
        ],
      },
    ];
  },
};

module.exports = nextConfig;