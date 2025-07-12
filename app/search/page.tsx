'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface SearchResult {
  id: string;
  content: string;
  source: string;
  score: number;
  metadata: {
    title?: string;
    url?: string;
    page_slug?: string;
    content_type?: string;
  };
}

function SearchContent() {
  const searchParams = useSearchParams();
  const keyword = searchParams?.get('keyword') || '';
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (keyword) {
      performSearch(keyword);
    }
  }, [keyword]);

  const performSearch = async (query: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/search-rag', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          sources: ['company', 'trend', 'youtube'],
          limit: 10,
          threshold: 0.3
        })
      });

      if (!response.ok) {
        throw new Error('検索エラー');
      }

      const data = await response.json();
      setResults(data.results || []);
    } catch (err) {
      setError('検索中にエラーが発生しました');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            検索結果
          </h1>
          {keyword && (
            <p className="text-lg text-gray-600">
              「<span className="font-semibold text-blue-600">{keyword}</span>」の検索結果
            </p>
          )}
        </div>

        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {!loading && results.length === 0 && keyword && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <p className="text-yellow-700 text-lg">
              「{keyword}」に関する情報が見つかりませんでした。
            </p>
            <p className="text-yellow-600 mt-2">
              別のキーワードで検索してみてください。
            </p>
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-6">
            {results.map((result, index) => (
              <div key={result.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <h2 className="text-xl font-semibold text-gray-900 leading-tight">
                    {result.metadata.title || `検索結果 ${index + 1}`}
                  </h2>
                  <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    類似度: {(result.score * 100).toFixed(1)}%
                  </span>
                </div>
                
                <p className="text-gray-700 mb-4 leading-relaxed">
                  {result.content.substring(0, 300)}
                  {result.content.length > 300 && '...'}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500">
                      ソース: <span className="font-medium">{result.source}</span>
                    </span>
                    {result.metadata.content_type && (
                      <span className="text-sm text-gray-500">
                        タイプ: <span className="font-medium">{result.metadata.content_type}</span>
                      </span>
                    )}
                  </div>
                  
                  {result.metadata.page_slug && (
                    <Link 
                      href={`/${result.metadata.page_slug}`}
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                    >
                      詳細を見る →
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <Link 
            href="/posts"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
          >
            ← 記事一覧に戻る
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
} 