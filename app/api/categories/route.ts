/**
 * Stage 2A: 技術カテゴリAPI
 * - 完全静的データ（技術分野・専門カテゴリ）
 * - 認証不要
 * - ランニングコスト: 0円
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Service Role Key を使用してRLSをバイパス
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// 環境変数のチェック
if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.warn('Supabase credentials not found');
}

const supabaseServiceRole = supabaseUrl && supabaseServiceRoleKey 
  ? createClient(supabaseUrl, supabaseServiceRoleKey)
  : null;

export async function GET(request: NextRequest) {
  try {
    if (!supabaseServiceRole) {
      return NextResponse.json(
        { error: 'Database configuration not available' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('business_id');

    // 事業カテゴリを取得
    const { data: businesses, error: businessError } = await supabaseServiceRole
      .from('businesses')
      .select('id, slug, name, description')
      .order('id');

    if (businessError) {
      console.error('事業カテゴリ取得エラー:', businessError);
      throw businessError;
    }

    // 記事カテゴリを取得
    let categoriesQuery = supabaseServiceRole
      .from('categories')
      .select('id, slug, name, description, business_id')
      .order('business_id, id');

    if (businessId) {
      categoriesQuery = categoriesQuery.eq('business_id', businessId);
    }

    const { data: categories, error: categoryError } = await categoriesQuery;

    if (categoryError) {
      console.error('記事カテゴリ取得エラー:', categoryError);
      throw categoryError;
    }

    // 事業カテゴリごとに記事カテゴリをグループ化
    const businessesWithCategories = businesses.map(business => ({
      ...business,
      categories: categories.filter(category => category.business_id === business.id)
    }));

    return NextResponse.json({
      success: true,
      businesses: businessesWithCategories,
      categories: categories,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ カテゴリ取得エラー:', error);
    return NextResponse.json(
      { 
        error: 'カテゴリ取得でエラーが発生しました',
        details: (error as Error).message 
      },
      { status: 500 }
    );
  }
} 