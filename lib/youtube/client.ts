/**
 * YouTube API Client
 * OAuth 2.0認証とVideo Upload機能を提供
 */

import { google } from 'googleapis';
import type { Readable } from 'stream';

export interface YouTubeAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export interface YouTubeAuthTokens {
  access_token: string;
  refresh_token: string;
  expires_at: string;
  scope: string;
}

export interface YouTubeVideoMetadata {
  title: string;
  description?: string;
  tags?: string[];
  privacyStatus: 'public' | 'private' | 'unlisted';
  categoryId?: string; // デフォルト: '22' (People & Blogs)
}

export interface YouTubeUploadResult {
  videoId: string;
  videoUrl: string;
  uploadedAt: string;
}

/**
 * YouTube OAuth 2.0 認証URLを生成
 */
export function getYouTubeAuthUrl(config: YouTubeAuthConfig): string {
  const oauth2Client = new google.auth.OAuth2(
    config.clientId,
    config.clientSecret,
    config.redirectUri
  );

  const scopes = [
    'https://www.googleapis.com/auth/youtube.upload',
    'https://www.googleapis.com/auth/youtube',
  ];

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent', // 常にリフレッシュトークンを取得
  });
}

/**
 * 認証コードからトークンを取得
 */
export async function getYouTubeTokensFromCode(
  config: YouTubeAuthConfig,
  code: string
): Promise<YouTubeAuthTokens> {
  const oauth2Client = new google.auth.OAuth2(
    config.clientId,
    config.clientSecret,
    config.redirectUri
  );

  const { tokens } = await oauth2Client.getToken(code);

  if (!tokens.access_token || !tokens.refresh_token) {
    throw new Error('Failed to obtain tokens from YouTube OAuth');
  }

  const expiresAt = new Date();
  expiresAt.setSeconds(expiresAt.getSeconds() + (tokens.expiry_date || 3600));

  return {
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expires_at: expiresAt.toISOString(),
    scope: tokens.scope || '',
  };
}

/**
 * リフレッシュトークンで新しいアクセストークンを取得
 */
export async function refreshYouTubeAccessToken(
  config: YouTubeAuthConfig,
  refreshToken: string
): Promise<YouTubeAuthTokens> {
  const oauth2Client = new google.auth.OAuth2(
    config.clientId,
    config.clientSecret,
    config.redirectUri
  );

  oauth2Client.setCredentials({
    refresh_token: refreshToken,
  });

  const { credentials } = await oauth2Client.refreshAccessToken();

  if (!credentials.access_token) {
    throw new Error('Failed to refresh YouTube access token');
  }

  const expiresAt = new Date();
  expiresAt.setSeconds(expiresAt.getSeconds() + (credentials.expiry_date || 3600));

  return {
    access_token: credentials.access_token,
    refresh_token: refreshToken, // リフレッシュトークンは変わらない
    expires_at: expiresAt.toISOString(),
    scope: credentials.scope || '',
  };
}

/**
 * YouTube に動画をアップロード
 * @param tokens OAuth トークン
 * @param videoStream 動画ファイルのストリーム
 * @param metadata 動画メタデータ
 */
export async function uploadVideoToYouTube(
  config: YouTubeAuthConfig,
  tokens: YouTubeAuthTokens,
  videoStream: Readable,
  metadata: YouTubeVideoMetadata
): Promise<YouTubeUploadResult> {
  const oauth2Client = new google.auth.OAuth2(
    config.clientId,
    config.clientSecret,
    config.redirectUri
  );

  oauth2Client.setCredentials({
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
  });

  const youtube = google.youtube({
    version: 'v3',
    auth: oauth2Client,
  });

  const response = await youtube.videos.insert({
    part: ['snippet', 'status'],
    requestBody: {
      snippet: {
        title: metadata.title,
        description: metadata.description || '',
        tags: metadata.tags || [],
        categoryId: metadata.categoryId || '22', // People & Blogs
      },
      status: {
        privacyStatus: metadata.privacyStatus,
        selfDeclaredMadeForKids: false,
      },
    },
    media: {
      body: videoStream,
    },
  });

  const videoId = response.data.id;
  if (!videoId) {
    throw new Error('Failed to get video ID from YouTube response');
  }

  return {
    videoId,
    videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
    uploadedAt: new Date().toISOString(),
  };
}

