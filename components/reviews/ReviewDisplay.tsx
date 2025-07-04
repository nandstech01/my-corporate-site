import React from 'react';
import { getReviewStats } from '@/lib/supabase/client';

interface ReviewDisplayProps {
  serviceId: string;
  fallbackRating?: number;
  fallbackCount?: number;
  textColor?: string;
  starColor?: string;
}

export default async function ReviewDisplay({ 
  serviceId, 
  fallbackRating = 4.8, 
  fallbackCount = 15,
  textColor = "text-white",
  starColor = "text-yellow-400"
}: ReviewDisplayProps) {
  const reviewStats = await getReviewStats(serviceId);
  
  const displayRating = reviewStats?.averageRating || fallbackRating;
  const displayCount = reviewStats?.totalReviews || fallbackCount;

  return (
    <div className="flex items-center justify-center lg:justify-start mb-4">
      <div className="flex items-center mr-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-5 h-5 ${
              star <= Math.floor(displayRating)
                ? starColor
                : star === Math.ceil(displayRating) && displayRating % 1 !== 0
                ? starColor
                : 'text-gray-400'
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      <span className={`${textColor} font-semibold text-lg`}>
        {displayRating}/5.0
      </span>
      <span className={`${textColor.replace('text-white', 'text-blue-200').replace('text-gray-900', 'text-gray-600')} ml-2`}>
        ({displayCount}件のレビュー)
      </span>
    </div>
  );
} 