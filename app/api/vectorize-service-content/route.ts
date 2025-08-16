import { NextResponse } from 'next/server';

export async function POST() {
  console.log('⚠️ vectorize-service-content APIは廃止されました');
  
  return NextResponse.json({
    success: false,
    error: 'このAPIは廃止されました。代わりに /api/vectorize-all-content を使用してください。',
    recommendation: {
      message: '全コンテンツベクトル化APIを使用することで、重複を防ぎながら安全にベクトル化できます。',
      endpoint: '/api/vectorize-all-content',
      method: 'POST'
    }
  }, { status: 410 }); // 410 Gone
} 