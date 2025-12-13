import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    env_check: {
      YOUTUBE_CLIENT_ID: process.env.YOUTUBE_CLIENT_ID || 'NOT SET',
      YOUTUBE_CLIENT_SECRET: process.env.YOUTUBE_CLIENT_SECRET ? 'SET (hidden)' : 'NOT SET',
      YOUTUBE_REDIRECT_URI: process.env.YOUTUBE_REDIRECT_URI || 'NOT SET',
      NODE_ENV: process.env.NODE_ENV,
      all_env_keys: Object.keys(process.env).filter(key => key.includes('YOUTUBE')),
    }
  });
}

