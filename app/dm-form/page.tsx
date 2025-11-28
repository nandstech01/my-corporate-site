'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

// フォームステップの型定義
type FormStep = 'company-type' | 'industry' | 'position' | 'form' | 'terms';

// フォームデータの型定義
interface FormData {
  companyType: 'corporate' | 'freelance' | 'influencer' | '';
  industry: string;
  position: string;
  email: string;
  phone: string;
  company: string;
  lastName: string;
  firstName: string;
}

const DmFormPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<FormStep>('company-type');
  const [formData, setFormData] = useState<FormData>({
    companyType: '',
    industry: '',
    position: '',
    email: '',
    phone: '',
    company: '',
    lastName: '',
    firstName: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const emailInputRef = useRef<HTMLInputElement>(null);

  // フォームページに移動したら最初の入力欄にフォーカスしてオートフィルを促す
  useEffect(() => {
    if (currentStep === 'form' && emailInputRef.current) {
      // 少し遅延させてからフォーカス（スムーズな遷移のため）
      setTimeout(() => {
        emailInputRef.current?.focus();
        // フォーカス後すぐにクリックイベントを発火してオートフィル候補を表示
        emailInputRef.current?.click();
      }, 100);
    }
  }, [currentStep]);

  // フォーム入力完了時の処理（利用規約ページへ遷移）
  const handleFormNext = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep('terms');
  };

  // 最終送信処理
  const handleSubmit = async () => {
    
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Google Apps Script URL
      const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxmbR1M3S1qdxRSMxvbkB92Pu9249gRbxuRj6LOMLVXRNbMKQNKi00rJxMyIpSeVQkoAw/exec';
      
      const sendData = {
        source: 'dm-form',
        companyType: formData.companyType === 'corporate' ? '会社' : formData.companyType === 'freelance' ? 'フリーランス' : 'インフルエンサー',
        industry: formData.industry || '（個人）',
        position: formData.position || '（個人）',
        company: formData.company,
        name: `${formData.lastName} ${formData.firstName}`,
        email: formData.email,
        phone: formData.phone,
        consultationType: 'Instagram広告からの申し込み',
        preferredDateTime: '後ほどご連絡',
      };

      // デバッグ用：送信データをコンソールに表示
      console.log('送信データ:', sendData);
      console.log('formData状態:', formData);
      console.log('JSON文字列:', JSON.stringify(sendData));
      
      await fetch(GOOGLE_APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sendData),
      });

      console.log('送信完了（no-corsモード）');

      setSubmitStatus('success');
      // フォームをリセット
      setFormData({
        companyType: '',
        industry: '',
        position: '',
        email: '',
        phone: '',
        company: '',
        lastName: '',
        firstName: '',
      });
      setCurrentStep('company-type');
    } catch (error) {
      console.error('送信エラー:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white fixed inset-0 z-[9999] overflow-y-auto">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* ヘッダー（ロゴエリア） */}
        <div className="text-center mb-8">
          <div className="inline-block">
            <Image
              src="/images/logo.svg"
              alt="N&S Logo"
              width={120}
              height={120}
              className="mx-auto"
              priority
            />
          </div>
        </div>

        {/* 成功メッセージ */}
        {submitStatus === 'success' && (
          <div className="mb-6 p-6 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 text-lg font-medium text-center">
              送信ありがとうございました。
              <br />
              24時間以内に担当よりご連絡いたします。
            </p>
          </div>
        )}

        {/* エラーメッセージ */}
        {submitStatus === 'error' && (
          <div className="mb-6 p-6 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-lg font-medium text-center">
              送信に失敗しました。
              <br />
              お手数ですが時間をおいて再度お試しください。
            </p>
          </div>
        )}

        {/* ステップ1: 企業形態選択 */}
        {currentStep === 'company-type' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">企業形態を選択してください</h3>
            
            <button
              onClick={() => {
                setFormData((prev) => ({ ...prev, companyType: 'corporate' }));
                setTimeout(() => setCurrentStep('industry'), 500);
              }}
              className={`w-full px-5 py-4 border rounded-xl transition-all duration-200 text-left group ${
                formData.companyType === 'corporate'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-lg font-medium text-gray-900">会社</span>
                <div className={`w-6 h-6 rounded-full border ${
                  formData.companyType === 'corporate'
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-gray-400 group-hover:border-blue-500'
                }`}>
                  {formData.companyType === 'corporate' && (
                    <svg className="w-full h-full text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
            </button>

            <button
              onClick={() => {
                setFormData((prev) => ({ ...prev, companyType: 'freelance' }));
                setTimeout(() => setCurrentStep('form'), 500);
              }}
              className={`w-full px-5 py-4 border rounded-xl transition-all duration-200 text-left group ${
                formData.companyType === 'freelance'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-lg font-medium text-gray-900">フリーランス</span>
                <div className={`w-6 h-6 rounded-full border ${
                  formData.companyType === 'freelance'
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-gray-400 group-hover:border-blue-500'
                }`}>
                  {formData.companyType === 'freelance' && (
                    <svg className="w-full h-full text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
            </button>

            <button
              onClick={() => {
                setFormData((prev) => ({ ...prev, companyType: 'influencer' }));
                setTimeout(() => setCurrentStep('form'), 500);
              }}
              className={`w-full px-5 py-4 border rounded-xl transition-all duration-200 text-left group ${
                formData.companyType === 'influencer'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-lg font-medium text-gray-900">インフルエンサー</span>
                <div className={`w-6 h-6 rounded-full border ${
                  formData.companyType === 'influencer'
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-gray-400 group-hover:border-blue-500'
                }`}>
                  {formData.companyType === 'influencer' && (
                    <svg className="w-full h-full text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
            </button>

            {/* 次へボタン */}
            <div className="pt-4">
              <button
                onClick={() => {
                  if (formData.companyType === 'corporate') {
                    setCurrentStep('industry');
                  } else if (formData.companyType === 'freelance' || formData.companyType === 'influencer') {
                    setCurrentStep('form');
                  }
                }}
                disabled={!formData.companyType}
                className={`w-full py-3 px-6 text-base font-bold text-white rounded-xl transition-all duration-300 ${
                  formData.companyType
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                次へ
              </button>
            </div>
          </div>
        )}

        {/* ステップ2: 業種選択（法人のみ） */}
        {currentStep === 'industry' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">業種を選択してください</h3>
            
            {[
              'A　農業、林業',
              'B　漁業',
              'C　鉱業、採石業、砂利採取業',
              'D　建設業',
              'E　製造業',
              'F　電気・ガス・熱供給・水道業',
              'G　情報通信業',
              'H　運輸業、郵便業',
              'I　卸売業、小売業',
              'J　金融業、保険業',
              'K　不動産業、物品賃貸業',
              'L　学術研究、専門・技術サービス業',
              'M　宿泊業、飲食サービス業',
              'N　生活関連サービス業、娯楽業',
              'O　教育、学習支援業',
              'P　医療、福祉',
              'Q　複合サービス事業',
              'R　サービス業（他に分類されないもの）',
              'S　公務（他に分類されるものを除く）',
              'T　分類不能の産業',
            ].map((industry) => (
              <button
                key={industry}
                onClick={() => {
                  setFormData((prev) => ({ ...prev, industry }));
                  setTimeout(() => setCurrentStep('position'), 500);
                }}
                className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 text-left group mb-2 ${
                  formData.industry === industry
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-base font-medium text-gray-900">{industry}</span>
                  <div className={`w-6 h-6 rounded-full border ${
                    formData.industry === industry
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-400 group-hover:border-blue-500'
                  }`}>
                    {formData.industry === industry && (
                      <svg className="w-full h-full text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
              </button>
            ))}

            {/* 戻る・次へボタン */}
            <div className="pt-4 flex gap-3">
              <button
                onClick={() => setCurrentStep('company-type')}
                className="flex-1 py-3 px-5 text-base font-bold text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-xl transition-all duration-300"
              >
                戻る
              </button>
              <button
                onClick={() => setCurrentStep('position')}
                disabled={!formData.industry}
                className={`flex-1 py-3 px-5 text-base font-bold text-white rounded-xl transition-all duration-300 ${
                  formData.industry
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                次へ
              </button>
            </div>
          </div>
        )}

        {/* ステップ3: 役職選択（法人のみ） */}
        {currentStep === 'position' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">役職</h3>
            
            {[
              '経営者・役員',
              '部長',
              '課長',
              '係長・主任',
              '一般社員',
              '契約・派遣・嘱託等',
            ].map((position) => (
              <button
                key={position}
                onClick={() => {
                  setFormData((prev) => ({ ...prev, position }));
                  setTimeout(() => setCurrentStep('form'), 500);
                }}
                className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 text-left group mb-2 ${
                  formData.position === position
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-base font-medium text-gray-900">{position}</span>
                  <div className={`w-6 h-6 rounded-full border ${
                    formData.position === position
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-400 group-hover:border-blue-500'
                  }`}>
                    {formData.position === position && (
                      <svg className="w-full h-full text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
              </button>
            ))}

            {/* 戻る・次へボタン */}
            <div className="pt-4 flex gap-3">
              <button
                onClick={() => setCurrentStep('industry')}
                className="flex-1 py-3 px-5 text-base font-bold text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-xl transition-all duration-300"
              >
                戻る
              </button>
              <button
                onClick={() => setCurrentStep('form')}
                disabled={!formData.position}
                className={`flex-1 py-3 px-5 text-base font-bold text-white rounded-xl transition-all duration-300 ${
                  formData.position
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                次へ
              </button>
            </div>
          </div>
        )}

        {/* ステップ4: フォーム入力 */}
        {currentStep === 'form' && (
          <div className="space-y-4">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">連絡先情報</h3>
              <p className="text-sm text-gray-600">
                ご入力いただいたメールアドレス宛に視聴用リンクを送付します。
              </p>
            </div>

            <form onSubmit={handleFormNext} className="space-y-4">
              {/* 仕事用メールアドレス */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  仕事用メールアドレス
                </label>
                <input
                  ref={emailInputRef}
                  type="email"
                  id="email"
                  name="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="例：sample@example.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              {/* 電話番号 */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  電話番号
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="tel"
                  autoComplete="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="例：090-1234-5678"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              {/* 会社名 */}
              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                  会社名
                </label>
                <input
                  type="text"
                  id="company"
                  name="organization"
                  autoComplete="organization"
                  required
                  value={formData.company}
                  onChange={(e) => setFormData((prev) => ({ ...prev, company: e.target.value }))}
                  placeholder="例：株式会社サンプル"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              {/* 姓 */}
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                  姓
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="family-name"
                  autoComplete="family-name"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))}
                  placeholder="例：山田"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              {/* 名 */}
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                  名
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="given-name"
                  autoComplete="given-name"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value }))}
                  placeholder="例：太郎"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              {/* 戻る・次へボタン */}
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep(formData.companyType === 'corporate' ? 'position' : 'company-type')}
                  className="flex-1 py-3 px-5 text-base font-bold text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-xl transition-all duration-300"
                >
                  戻る
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-5 text-base font-bold text-white rounded-xl transition-all duration-300 bg-blue-600 hover:bg-blue-700"
                >
                  次へ
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ステップ5: 利用規約同意 */}
        {currentStep === 'terms' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">利用規約</h3>
            
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 max-h-[400px] overflow-y-auto space-y-4">
              <div>
                <h4 className="font-bold text-base text-gray-900 mb-2">
                  本サービス「AIアーキテクト無料相談」に関する特約とプライバシーポリシーへの同意
                </h4>
                <p className="text-sm text-gray-700 leading-relaxed mb-4">
                  株式会社エヌアンドエス（以下「弊社」といいます。）
                </p>
              </div>

              <div className="space-y-3 text-sm text-gray-700">
                <p className="font-medium">【確認事項】</p>
                
                <p>1. 本無料相談の実施にあたり、本サービスの利用規約を遵守させること。</p>
                
                <p>2. 本無料相談は、AIアーキテクトとしてのキャリア構築および収益化手法について実演を交えながらご説明する無料相談会です。今後も同様の利用条件が保証されるものではないこと。</p>
                
                <p>3. 本無料相談に関して知り得た情報を第三者に提供又は漏洩してはならないこと。</p>
                
                <p>4. 本無料相談の日程は、別途、電子メール又はLINEにて通知されること。</p>
                
                <p>5. 本無料相談の延長、または再相談をする場合は事前に弊社から承諾を得ること。</p>
                
                <p>6. 本無料相談終了後、必要に応じてアンケートやヒアリングにご協力いただくこと。</p>
                
                <p>7. 本無料相談に伴い弊社に生じた損害について、貴社に故意または重過失がある場合を除き、弊社が賠償義務を負わないこと。</p>
                
                <p>8. 本無料相談に伴い弊社の責めに帰すべき事由により貴社に損害が生じた場合、弊社が賠償義務を負うこと。</p>
              </div>

              <div className="pt-4 border-t border-gray-300">
                <p className="text-sm text-gray-700 leading-relaxed mb-2">
                  <span className="font-bold">AIアーキテクトとは？</span>
                </p>
                <p className="text-sm text-gray-700 leading-relaxed mb-4">
                  生成AIを活用して、業務自動化・システム構築・データ分析などを行う次世代の専門職です。プログラミング経験がなくても、AIツールを組み合わせることで高度な価値提供が可能になります。
                </p>
                
                <p className="text-sm text-gray-700 leading-relaxed mb-2">
                  <span className="font-bold">どうやって稼いでいくのか？</span>
                </p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  無料相談会では、実際のAIツール操作を目の前で実演しながら、具体的な収益化手法・案件獲得方法・価格設定まで全て公開します。月5社限定・完全無料でご参加いただけます。
                </p>
              </div>

              <div className="pt-4 border-t border-gray-300">
                <p className="text-xs text-gray-600 leading-relaxed">
                  ［送信］をクリックすることで、弊社にあなたの情報を送信し、弊社がその
                  <a href="https://nands.tech/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">プライバシーポリシー</a>
                  にそってその情報を使用することに同意するものとします。またInstagramもプライバシーポリシーにそって、広告フォームの自動入力などにこの情報を使用します。あなたの情報は、以前回答を送信した広告やInstagramプロフィール、リンクされたFacebookプロフィールからこの広告に自動入力される可能性があります。
                </p>
              </div>
            </div>

            {/* 同意チェックボックス */}
            <label className="flex items-start p-4 border border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 transition-all">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1 h-5 w-5 text-blue-600 focus:ring-blue-500 rounded"
              />
              <span className="ml-3 text-sm text-gray-900">
                上記の利用規約およびプライバシーポリシーに同意します
              </span>
            </label>

            {/* 送信・後でボタン */}
            <div className="pt-4 space-y-3">
              <button
                onClick={handleSubmit}
                disabled={!agreedToTerms || isSubmitting}
                className={`w-full py-4 px-6 text-base font-bold text-white rounded-xl transition-all duration-300 ${
                  agreedToTerms && !isSubmitting
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? '送信中...' : '送信する'}
              </button>
              
              <button
                onClick={() => setCurrentStep('form')}
                className="w-full py-3 px-6 text-base font-medium text-blue-600 hover:text-blue-700 transition-all duration-300"
              >
                後で
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DmFormPage;
