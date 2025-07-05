'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

interface Service {
  id: string;
  name: string;
  category: string;
}

interface ReviewSubmissionFormProps {
  services: Service[];
}

interface FormData {
  serviceId: string;
  rating: number;
  title: string;
  reviewBody: string;
  authorName: string;
  authorEmail: string;
  authorCompany: string;
  authorPosition: string;
  isPublic: boolean;
}

// 内部フォームコンポーネント（useSearchParamsを使用）
function ReviewFormContent({ services }: ReviewSubmissionFormProps) {
  const searchParams = useSearchParams();
  const preselectedService = searchParams ? searchParams.get('service') : null;

  const [formData, setFormData] = useState<FormData>({
    serviceId: preselectedService || '',
    rating: 0,
    title: '',
    reviewBody: '',
    authorName: '',
    authorEmail: '',
    authorCompany: '',
    authorPosition: '',
    isPublic: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errors, setErrors] = useState<string[]>([]);

  // URL パラメータでサービスが指定されている場合は事前選択
  useEffect(() => {
    if (preselectedService) {
      setFormData(prev => ({ ...prev, serviceId: preselectedService }));
    }
  }, [preselectedService]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.serviceId) newErrors.serviceId = 'サービスを選択してください';
    if (formData.rating === 0) newErrors.rating = '評価を選択してください';
    if (!formData.title.trim()) newErrors.title = 'レビュータイトルを入力してください';
    if (!formData.reviewBody.trim()) newErrors.reviewBody = 'レビュー内容を入力してください';
    if (!formData.authorName.trim()) newErrors.authorName = 'お名前を入力してください';
    if (!formData.authorEmail.trim()) newErrors.authorEmail = 'メールアドレスを入力してください';

    // メールアドレス形式チェック
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.authorEmail && !emailRegex.test(formData.authorEmail)) {
      newErrors.authorEmail = '正しいメールアドレスを入力してください';
    }

    setErrors(Object.values(newErrors));
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
        // フォームリセット
        setFormData({
          serviceId: '',
          rating: 0,
          title: '',
          reviewBody: '',
          authorName: '',
          authorEmail: '',
          authorCompany: '',
          authorPosition: '',
          isPublic: false
        });
      } else {
        setSubmitStatus('error');
        setErrors(result.details || [result.error]);
      }
    } catch (error) {
      console.error('レビュー投稿エラー:', error);
      setSubmitStatus('error');
      setErrors(['送信中にエラーが発生しました。再度お試しください。']);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // エラーをクリア
    if (errors.includes(field)) {
      setErrors(prev => prev.filter(e => e !== field));
    }
  };

  const selectedService = services.find(s => s.id === formData.serviceId);

  // 星評価コンポーネント
  const StarRating = ({ rating, onRatingChange }: { rating: number; onRatingChange: (rating: number) => void }) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange(star)}
            className={`w-8 h-8 ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            } hover:text-yellow-400 transition-colors`}
          >
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        ))}
        <span className="ml-2 text-gray-600">
          {rating > 0 ? `${rating}/5` : '評価を選択'}
        </span>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">サービスレビュー投稿</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 成功・エラーメッセージ */}
          {submitStatus === 'success' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-green-800 font-medium">レビューを投稿いただき、ありがとうございます！</p>
              </div>
              <p className="text-green-700 text-sm mt-2">
                内容確認後、サイトに掲載させていただきます。
              </p>
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <p className="text-red-800 font-medium">エラーが発生しました</p>
              </div>
              <p className="text-red-700 text-sm mt-2">
                {errors.map((error, index) => (
                  <span key={index}>• {error}</span>
                ))}
              </p>
            </div>
          )}

          {/* サービス選択 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ご利用サービス <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.serviceId}
              onChange={(e) => handleInputChange('serviceId', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.includes('serviceId') ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">サービスを選択してください</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name} ({service.category})
                </option>
              ))}
            </select>
            {errors.includes('serviceId') && <p className="text-red-500 text-sm mt-1">{errors.find(e => e === 'serviceId')}</p>}
          </div>

          {/* 評価（星） */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              評価 <span className="text-red-500">*</span>
            </label>
            <StarRating
              rating={formData.rating}
              onRatingChange={(rating) => handleInputChange('rating', rating)}
            />
            {errors.includes('rating') && <p className="text-red-500 text-sm mt-1">{errors.find(e => e === 'rating')}</p>}
          </div>

          {/* レビュータイトル */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              レビュータイトル <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="例: 期待以上の成果でした"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.includes('title') ? 'border-red-500' : 'border-gray-300'
              }`}
              maxLength={100}
            />
            {errors.includes('title') && <p className="text-red-500 text-sm mt-1">{errors.find(e => e === 'title')}</p>}
          </div>

          {/* レビュー内容 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              レビュー内容 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.reviewBody}
              onChange={(e) => handleInputChange('reviewBody', e.target.value)}
              placeholder="サービスをご利用いただいた感想をお聞かせください"
              rows={5}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.includes('reviewBody') ? 'border-red-500' : 'border-gray-300'
              }`}
              maxLength={1000}
            />
            <div className="flex justify-between items-center mt-1">
              {errors.includes('reviewBody') && (
                <p className="text-red-500 text-sm">{errors.find(e => e === 'reviewBody')}</p>
              )}
              <p className="text-gray-500 text-sm">{formData.reviewBody.length}/1000</p>
            </div>
          </div>

          {/* 投稿者情報 */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">投稿者情報</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* お名前 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  お名前 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.authorName}
                  onChange={(e) => handleInputChange('authorName', e.target.value)}
                  placeholder="山田太郎"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.includes('authorName') ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.includes('authorName') && <p className="text-red-500 text-sm mt-1">{errors.find(e => e === 'authorName')}</p>}
              </div>

              {/* メールアドレス */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  メールアドレス <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.authorEmail}
                  onChange={(e) => handleInputChange('authorEmail', e.target.value)}
                  placeholder="example@company.com"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.includes('authorEmail') ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.includes('authorEmail') && <p className="text-red-500 text-sm mt-1">{errors.find(e => e === 'authorEmail')}</p>}
                <p className="text-gray-500 text-xs mt-1">※ 公開されません</p>
              </div>

              {/* 会社名 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  会社名・組織名
                </label>
                <input
                  type="text"
                  value={formData.authorCompany}
                  onChange={(e) => handleInputChange('authorCompany', e.target.value)}
                  placeholder="株式会社◯◯"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* 役職 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  役職・部署
                </label>
                <input
                  type="text"
                  value={formData.authorPosition}
                  onChange={(e) => handleInputChange('authorPosition', e.target.value)}
                  placeholder="代表取締役"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* 公開設定 */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isPublic"
              checked={formData.isPublic}
              onChange={(e) => handleInputChange('isPublic', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="isPublic" className="ml-2 text-sm text-gray-700">
              このレビューをサイトに公開することに同意します
            </label>
          </div>

          {/* 送信ボタン */}
          <div className="pt-6">
            <button
              type="submit"
              disabled={isSubmitting || !formData.isPublic}
              className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-all duration-300 ${
                isSubmitting || !formData.isPublic
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-200'
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  送信中...
                </div>
              ) : (
                'レビューを投稿する'
              )}
            </button>
          </div>

          {/* 選択されたサービス表示 */}
          {selectedService && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">選択されたサービス</h4>
              <p className="text-blue-800">
                <span className="font-medium">{selectedService.name}</span>
                <span className="text-blue-600 ml-2">({selectedService.category})</span>
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

// メインコンポーネント（Suspenseで囲む）
function ReviewSubmissionFormMain({ services }: ReviewSubmissionFormProps) {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">サービスレビュー投稿</h2>
        
        <Suspense fallback={
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">読み込み中...</span>
          </div>
        }>
          <ReviewFormContent services={services} />
        </Suspense>
      </div>
    </div>
  );
}

export default ReviewSubmissionFormMain;
