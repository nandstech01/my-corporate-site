import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/supabase';

// 9つのサービス定義（バリデーション用）
const VALID_SERVICES = [
  'ai-agents',
  'system-development', 
  'aio-seo',
  'vector-rag',
  'video-generation',
  'hr-solutions',
  'sns-automation',
  'chatbot-development',
  'mcp-servers'
];

interface ReviewData {
  serviceId: string;
  rating: number;
  title: string;
  reviewBody: string;
  authorName: string;
  authorEmail: string;
  authorCompany?: string;
  authorPosition?: string;
  isPublic: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const data: ReviewData = await request.json();

    // バリデーション
    const errors: string[] = [];

    if (!data.serviceId || !VALID_SERVICES.includes(data.serviceId)) {
      errors.push('有効なサービスを選択してください');
    }

    if (!data.rating || data.rating < 1 || data.rating > 5) {
      errors.push('評価は1〜5の範囲で選択してください');
    }

    if (!data.title?.trim()) {
      errors.push('レビュータイトルを入力してください');
    }

    if (!data.reviewBody?.trim()) {
      errors.push('レビュー内容を入力してください');
    }

    if (!data.authorName?.trim()) {
      errors.push('お名前を入力してください');
    }

    if (!data.authorEmail?.trim()) {
      errors.push('メールアドレスを入力してください');
    }

    // メールアドレス形式チェック
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (data.authorEmail && !emailRegex.test(data.authorEmail)) {
      errors.push('正しいメールアドレスを入力してください');
    }

    if (!data.isPublic) {
      errors.push('公開に同意してください');
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { error: 'バリデーションエラー', details: errors },
        { status: 400 }
      );
    }

    // Supabaseにレビューデータを保存
    const { data: insertData, error } = await supabase
      .from('reviews')
      .insert({
        service_id: data.serviceId,
        rating: data.rating,
        title: data.title.trim(),
        review_body: data.reviewBody.trim(),
        author_name: data.authorName.trim(),
        author_email: data.authorEmail.trim(),
        author_company: data.authorCompany?.trim() || null,
        author_position: data.authorPosition?.trim() || null,
        is_public: data.isPublic,
        is_approved: false, // 管理者承認待ち
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();

    if (error) {
      console.error('Supabaseエラー:', error);
      return NextResponse.json(
        { error: 'データベースエラーが発生しました' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        message: 'レビューを投稿いただき、ありがとうございます',
        data: insertData
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('レビュー投稿エラー:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}

// GET: レビュー一覧取得（承認済みのみ）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get('service');

    let query = supabase
      .from('reviews')
      .select('*')
      .eq('is_approved', true)
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    // サービス指定がある場合はフィルタリング
    if (serviceId && VALID_SERVICES.includes(serviceId)) {
      query = query.eq('service_id', serviceId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('レビュー取得エラー:', error);
      return NextResponse.json(
        { error: 'データ取得エラー' },
        { status: 500 }
      );
    }

    return NextResponse.json({ reviews: data || [] });

  } catch (error) {
    console.error('レビュー取得エラー:', error);
    return NextResponse.json(
      { error: 'サーバーエラー' },
      { status: 500 }
    );
  }
} 