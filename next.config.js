/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  // 基本設定
  reactStrictMode: true,
  swcMinify: true,

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
  async headers() {
    // 開発環境かどうかを判定
    const isDev = process.env.NODE_ENV === 'development';
    
    // 共通ヘッダー
    const commonHeaders = [
      {
        key: 'X-Content-Type-Options',
        value: 'nosniff',
      },
      {
        key: 'X-Frame-Options',
        value: 'SAMEORIGIN',
      },
    ];
    
    // 開発環境の場合は制限を緩和したCSPを設定
    if (isDev) {
      return [
        {
          source: '/:path*',
          headers: [
            ...commonHeaders,
            {
              key: 'Content-Security-Policy',
              value: "default-src * 'unsafe-inline' 'unsafe-eval'; script-src * 'unsafe-inline' 'unsafe-eval'; connect-src * 'unsafe-inline'; img-src * data: blob: 'unsafe-inline'; frame-src *; style-src * 'unsafe-inline';",
            },
          ],
        },
      ];
    }
    
    // 本番環境の場合は通常のヘッダーのみ
    return [
      {
        source: '/:path*',
        headers: commonHeaders,
      },
    ];
  },
};

module.exports = nextConfig;