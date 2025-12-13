import { NextRequest, NextResponse } from 'next/server';
import { getYouTubeAuthUrl } from '@/lib/youtube/client';

export const dynamic = 'force-dynamic';

/**
 * YouTube OAuth認証を開始
 * GET /api/auth/youtube
 */
export async function GET(request: NextRequest) {
  try {
    const clientId = process.env.YOUTUBE_CLIENT_ID;
    const clientSecret = process.env.YOUTUBE_CLIENT_SECRET;
    const redirectUri = process.env.YOUTUBE_REDIRECT_URI || `${request.nextUrl.origin}/api/auth/youtube/callback`;

    // デバッグログ
    console.log('🔍 Environment Variables Check:');
    console.log('  YOUTUBE_CLIENT_ID:', clientId ? `${clientId.substring(0, 20)}...` : 'NOT SET');
    console.log('  YOUTUBE_CLIENT_SECRET:', clientSecret ? `${clientSecret.substring(0, 10)}...` : 'NOT SET');
    console.log('  YOUTUBE_REDIRECT_URI:', redirectUri);

    if (!clientId || !clientSecret) {
      console.error('❌ YouTube credentials missing!');
      return NextResponse.json(
        { 
          error: 'YouTube API credentials not configured',
          debug: {
            hasClientId: !!clientId,
            hasClientSecret: !!clientSecret,
          }
        },
        { status: 500 }
      );
    }

    const authUrl = getYouTubeAuthUrl({
      clientId,
      clientSecret,
      redirectUri,
    });

    return NextResponse.redirect(authUrl);
  } catch (error: any) {
    console.error('Error generating YouTube auth URL:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate auth URL' },
      { status: 500 }
    );
  }
}

