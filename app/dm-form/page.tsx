'use client';

import React, { useState } from 'react';

// フォームデータの型定義
interface FormValues {
  company: string;
  name: string;
  email: string;
  phone: string;
  consultationType: string;
  preferredDateTime: string;
}

// フィールドごとのエラーメッセージ
interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  consultationType?: string;
  preferredDateTime?: string;
}

const DmFormPage: React.FC = () => {
  const [formData, setFormData] = useState<FormValues>({
    company: '',
    name: '',
    email: '',
    phone: '',
    consultationType: '',
    preferredDateTime: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // バリデーション関数
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // お名前（必須）
    if (!formData.name.trim()) {
      newErrors.name = 'お名前は必須です';
    }

    // メールアドレス（必須・フォーマットチェック）
    if (!formData.email.trim()) {
      newErrors.email = 'メールアドレスは必須です';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      newErrors.email = 'メールアドレスの形式が正しくありません';
    }

    // 電話番号（必須）
    if (!formData.phone.trim()) {
      newErrors.phone = '電話番号は必須です';
    }

    // 相談内容（必須）
    if (!formData.consultationType) {
      newErrors.consultationType = '相談内容を選択してください';
    }

    // 希望日時（必須）
    if (!formData.preferredDateTime.trim()) {
      newErrors.preferredDateTime = '希望日時は必須です';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // フォーム送信処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // バリデーション実行
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Google Apps Script URL（既存のトップページフォームと同じ）
      const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxP89a1VvqlldbOXkaomiBSf_49tdd8UGVAzNBzKP7LA7rmcy1i3s9inzAVOuyYDF1jjA/exec';
      
      const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors', // CORS対策
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source: 'dm-form', // シート2に保存するための識別子
          company: formData.company,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          consultationType: formData.consultationType,
          preferredDateTime: formData.preferredDateTime,
        }),
      });

      // no-corsの場合、レスポンスは読み取れないが送信は成功している
      setSubmitStatus('success');
      // フォームをクリア
      setFormData({
        company: '',
        name: '',
        email: '',
        phone: '',
        consultationType: '',
        preferredDateTime: '',
      });
      setErrors({});
    } catch (error) {
      console.error('送信エラー:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 入力変更処理
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // エラーをクリア
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-24 pb-8 px-4 sm:pt-28 sm:pb-12 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* ページタイトル・説明 */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            AI時代の検索対策・SNS自動化
            <br />
            無料相談フォーム
          </h1>
          <p className="text-base sm:text-lg text-gray-700 leading-relaxed px-4">
            Instagram広告からお越しいただき
            <br />
            ありがとうございます。
            <br />
            以下の項目をご入力いただきましたら担当
            <br />
            より日程調整のご連絡をいたします。
          </p>
        </div>

        {/* 成功メッセージ */}
        {submitStatus === 'success' && (
          <div className="mb-6 p-4 sm:p-6 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 text-base sm:text-lg font-medium text-center">
              送信ありがとうございました。
              <br />
              24時間以内に原田よりご連絡いたします。
            </p>
          </div>
        )}

        {/* エラーメッセージ */}
        {submitStatus === 'error' && (
          <div className="mb-6 p-4 sm:p-6 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-base sm:text-lg font-medium text-center">
              送信に失敗しました。
              <br />
              お手数ですが時間をおいて再度お試しください。
            </p>
          </div>
        )}

        {/* フォーム */}
        <div className="bg-white shadow-xl rounded-lg p-6 sm:p-8 md:p-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 会社名（任意） */}
            <div>
              <label htmlFor="company" className="block text-base sm:text-lg font-semibold text-gray-900 mb-2">
                会社名
              </label>
              <input
                type="text"
                id="company"
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder="例：株式会社サンプル"
                className="w-full px-4 py-3 sm:py-4 text-base sm:text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            {/* お名前（必須） */}
            <div>
              <label htmlFor="name" className="block text-base sm:text-lg font-semibold text-gray-900 mb-2">
                お名前 <span className="text-red-500 text-sm">※必須</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="例：山田 太郎"
                className={`w-full px-4 py-3 sm:py-4 text-base sm:text-lg border rounded-lg transition-colors ${
                  errors.name 
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                }`}
              />
              {errors.name && (
                <p className="mt-2 text-sm sm:text-base text-red-600">{errors.name}</p>
              )}
            </div>

            {/* メールアドレス（必須） */}
            <div>
              <label htmlFor="email" className="block text-base sm:text-lg font-semibold text-gray-900 mb-2">
                メールアドレス <span className="text-red-500 text-sm">※必須</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="例：sample@example.com"
                className={`w-full px-4 py-3 sm:py-4 text-base sm:text-lg border rounded-lg transition-colors ${
                  errors.email 
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                }`}
              />
              {errors.email && (
                <p className="mt-2 text-sm sm:text-base text-red-600">{errors.email}</p>
              )}
            </div>

            {/* 電話番号（必須） */}
            <div>
              <label htmlFor="phone" className="block text-base sm:text-lg font-semibold text-gray-900 mb-2">
                電話番号 <span className="text-red-500 text-sm">※必須</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="例：090-1234-5678"
                className={`w-full px-4 py-3 sm:py-4 text-base sm:text-lg border rounded-lg transition-colors ${
                  errors.phone 
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                }`}
              />
              {errors.phone && (
                <p className="mt-2 text-sm sm:text-base text-red-600">{errors.phone}</p>
              )}
            </div>

            {/* 相談内容（必須） */}
            <div>
              <label className="block text-base sm:text-lg font-semibold text-gray-900 mb-3">
                相談内容 <span className="text-red-500 text-sm">※必須</span>
              </label>
              <div className="space-y-3">
                <label className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.consultationType === 'AI時代の検索対策について相談したい'
                    ? 'border-blue-500 bg-blue-50'
                    : errors.consultationType
                    ? 'border-red-300 bg-white hover:bg-gray-50'
                    : 'border-gray-300 bg-white hover:bg-gray-50'
                }`}>
                  <input
                    type="radio"
                    name="consultationType"
                    value="AI時代の検索対策について相談したい"
                    checked={formData.consultationType === 'AI時代の検索対策について相談したい'}
                    onChange={handleChange}
                    className="mt-1 h-5 w-5 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-base sm:text-lg text-gray-900">
                    AI時代の検索対策について相談したい
                  </span>
                </label>

                <label className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.consultationType === 'SNS自動化について相談したい'
                    ? 'border-blue-500 bg-blue-50'
                    : errors.consultationType
                    ? 'border-red-300 bg-white hover:bg-gray-50'
                    : 'border-gray-300 bg-white hover:bg-gray-50'
                }`}>
                  <input
                    type="radio"
                    name="consultationType"
                    value="SNS自動化について相談したい"
                    checked={formData.consultationType === 'SNS自動化について相談したい'}
                    onChange={handleChange}
                    className="mt-1 h-5 w-5 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-base sm:text-lg text-gray-900">
                    SNS自動化について相談したい
                  </span>
                </label>

                <label className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.consultationType === 'その他、相談したい内容があります'
                    ? 'border-blue-500 bg-blue-50'
                    : errors.consultationType
                    ? 'border-red-300 bg-white hover:bg-gray-50'
                    : 'border-gray-300 bg-white hover:bg-gray-50'
                }`}>
                  <input
                    type="radio"
                    name="consultationType"
                    value="その他、相談したい内容があります"
                    checked={formData.consultationType === 'その他、相談したい内容があります'}
                    onChange={handleChange}
                    className="mt-1 h-5 w-5 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-base sm:text-lg text-gray-900">
                    その他、相談したい内容があります
                  </span>
                </label>

                <label className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.consultationType === 'AI時代の検索対策の「実演無料相談」について相談したい'
                    ? 'border-blue-500 bg-blue-50'
                    : errors.consultationType
                    ? 'border-red-300 bg-white hover:bg-gray-50'
                    : 'border-gray-300 bg-white hover:bg-gray-50'
                }`}>
                  <input
                    type="radio"
                    name="consultationType"
                    value="AI時代の検索対策の「実演無料相談」について相談したい"
                    checked={formData.consultationType === 'AI時代の検索対策の「実演無料相談」について相談したい'}
                    onChange={handleChange}
                    className="mt-1 h-5 w-5 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-base sm:text-lg text-gray-900">
                    AI時代の検索対策の「実演無料相談」について相談したい
                  </span>
                </label>
              </div>
              {errors.consultationType && (
                <p className="mt-2 text-sm sm:text-base text-red-600">{errors.consultationType}</p>
              )}
            </div>

            {/* 希望日時（必須） */}
            <div>
              <label htmlFor="preferredDateTime" className="block text-base sm:text-lg font-semibold text-gray-900 mb-2">
                希望日時 <span className="text-red-500 text-sm">※必須</span>
              </label>
              <textarea
                id="preferredDateTime"
                name="preferredDateTime"
                value={formData.preferredDateTime}
                onChange={handleChange}
                placeholder="例：第1希望 11/20 15:00&#10;第2希望 11/21 10:00"
                rows={4}
                className={`w-full px-4 py-3 sm:py-4 text-base sm:text-lg border rounded-lg transition-colors ${
                  errors.preferredDateTime 
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                }`}
              />
              {errors.preferredDateTime && (
                <p className="mt-2 text-sm sm:text-base text-red-600">{errors.preferredDateTime}</p>
              )}
            </div>

            {/* 送信ボタン */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-4 sm:py-5 px-6 text-base sm:text-lg font-bold text-white rounded-lg transition-all duration-300 ${
                  isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 hover:shadow-lg transform hover:-translate-y-1'
                }`}
              >
                {isSubmitting ? '送信中...' : '無料相談を申し込む'}
              </button>
            </div>
          </form>
        </div>

        {/* 補足情報 */}
        <div className="mt-8 text-center">
          <p className="text-sm sm:text-base text-gray-600">
            ご入力いただいた情報は、お問い合わせ対応のためにのみ使用いたします。
          </p>
        </div>
      </div>
    </div>
  );
};

export default DmFormPage;

