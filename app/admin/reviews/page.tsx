'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/supabase';

interface Review {
  id: number;
  service_id: string;
  rating: number;
  title: string;
  review_body: string;
  author_name: string;
  author_email: string;
  author_company: string | null;
  author_position: string | null;
  is_public: boolean | null;
  is_approved: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

const SERVICE_NAMES: Record<string, string> = {
  'ai-agents': 'AIエージェント開発',
  'system-development': 'AIシステム開発',
  'aio-seo': 'AIO対策・レリバンス',
  'vector-rag': 'ベクトルRAG開発',
  'video-generation': 'AI動画生成開発',
  'hr-solutions': 'AI人材ソリューション',
  'sns-automation': 'SNS自動化システム',
  'chatbot-development': 'チャットボット開発',
  'mcp-servers': 'MCPサーバー開発'
};

export default function ReviewsAdminPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [serviceFilter, setServiceFilter] = useState<string>('all');

  useEffect(() => {
    fetchReviews();
  }, [filter, serviceFilter]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

      // フィルタリング
      if (filter === 'pending') {
        query = query.eq('is_approved', false);
      } else if (filter === 'approved') {
        query = query.eq('is_approved', true);
      }

      if (serviceFilter !== 'all') {
        query = query.eq('service_id', serviceFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('レビュー取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateReviewStatus = async (id: number, isApproved: boolean) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ 
          is_approved: isApproved,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      
      fetchReviews(); // リフレッシュ
    } catch (error) {
      console.error('レビュー更新エラー:', error);
    }
  };

  const deleteReview = async (id: number) => {
    if (!confirm('このレビューを削除しますか？')) return;

    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      fetchReviews(); // リフレッシュ
    } catch (error) {
      console.error('レビュー削除エラー:', error);
    }
  };

  const getStatusBadge = (review: Review) => {
    if (review.is_approved) {
      return <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">承認済み</span>;
    } else {
      return <span className="px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded-full">承認待ち</span>;
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">レビュー管理</h1>
        <div className="flex space-x-4">
          {/* ステータスフィルタ */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">すべて</option>
            <option value="pending">承認待ち</option>
            <option value="approved">承認済み</option>
          </select>

          {/* サービスフィルタ */}
          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">すべてのサービス</option>
            {Object.entries(SERVICE_NAMES).map(([id, name]) => (
              <option key={id} value={id}>{name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* レビュー一覧 */}
      <div className="space-y-6">
        {reviews.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-300 text-lg">レビューがありません</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="bg-gray-800 rounded-lg shadow-md p-6 border border-gray-600">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-white">{review.title}</h3>
                    {getStatusBadge(review)}
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-300 mb-3">
                    <span className="font-medium">{SERVICE_NAMES[review.service_id]}</span>
                    <div className="flex items-center space-x-1">
                      {renderStars(review.rating)}
                      <span className="ml-1">{review.rating}/5</span>
                    </div>
                    <span>{review.created_at ? new Date(review.created_at).toLocaleDateString('ja-JP') : '-'}</span>
                  </div>

                  <p className="text-gray-300 mb-4">{review.review_body}</p>

                  <div className="flex items-center space-x-4 text-sm text-gray-300">
                    <span><strong>投稿者:</strong> {review.author_name}</span>
                    {review.author_company && (
                      <span><strong>会社:</strong> {review.author_company}</span>
                    )}
                    {review.author_position && (
                      <span><strong>役職:</strong> {review.author_position}</span>
                    )}
                  </div>
                </div>

                <div className="flex space-x-2 ml-4">
                  {!review.is_approved ? (
                    <button
                      onClick={() => updateReviewStatus(review.id, true)}
                      className="px-3 py-1 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md"
                    >
                      承認
                    </button>
                  ) : (
                    <button
                      onClick={() => updateReviewStatus(review.id, false)}
                      className="px-3 py-1 text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 rounded-md"
                    >
                      承認取消
                    </button>
                  )}
                  
                  <button
                    onClick={() => deleteReview(review.id)}
                    className="px-3 py-1 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
                  >
                    削除
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 