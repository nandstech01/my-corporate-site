'use client';

import React, { useState } from 'react';
import Head from 'next/head';
import LatestShortsGallery from '@/components/youtube/LatestShortsGallery';

// お問い合わせフォームコンポーネント
function ContactForm() {
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxP89a1VvqlldbOXkaomiBSf_49tdd8UGVAzNBzKP7LA7rmcy1i3s9inzAVOuyYDF1jjA/exec';

      // 送信データの準備（LPページ用フィールド）
      const formData = {
        name,
        company,
        email,
        phone,
        source: 'SNS自動化LP', // データソースを識別
        message: `【SNS自動化LP】\n会社名: ${company || '未入力'}\n電話番号: ${phone}` // メッセージフィールドに会社名と電話番号を含める
      };

      // Google Apps Scriptに送信
      await fetch(GOOGLE_APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors', // CORS対策
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      // フォームをリセット
      setName('');
      setCompany('');
      setEmail('');
      setPhone('');

      // 成功メッセージを表示
      alert('お問い合わせを受け付けました。担当者より3営業日以内にご連絡いたします。');
      
    } catch (error) {
      console.error('Error:', error);
      alert('送信に失敗しました。お手数ですが、もう一度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-2xl mx-auto bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8"
    >
      {/* 名前 */}
      <div className="mb-6">
        <label htmlFor="name" className="block text-white font-medium mb-2">
          お名前 <span className="text-red-400">*</span>
        </label>
        <input
          id="name"
          type="text"
          className="w-full px-4 py-3 bg-white/90 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all text-gray-900"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="山田 太郎"
        />
      </div>

      {/* 会社名 */}
      <div className="mb-6">
        <label htmlFor="company" className="block text-white font-medium mb-2">
          会社名
        </label>
        <input
          id="company"
          type="text"
          className="w-full px-4 py-3 bg-white/90 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all text-gray-900"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="株式会社〇〇（個人の方は空欄で可）"
        />
      </div>

      {/* メール */}
      <div className="mb-6">
        <label htmlFor="email" className="block text-white font-medium mb-2">
          メールアドレス <span className="text-red-400">*</span>
        </label>
        <input
          id="email"
          type="email"
          className="w-full px-4 py-3 bg-white/90 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all text-gray-900"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="example@example.com"
        />
      </div>

      {/* 電話番号 */}
      <div className="mb-8">
        <label htmlFor="phone" className="block text-white font-medium mb-2">
          電話番号 <span className="text-red-400">*</span>
        </label>
        <input
          id="phone"
          type="tel"
          className="w-full px-4 py-3 bg-white/90 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all text-gray-900"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          placeholder="090-1234-5678"
        />
      </div>

      {/* 送信ボタン */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-lg hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-xl rounded-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        {isSubmitting ? '送信中...' : '📧 無料相談を予約する'}
      </button>

      <p className="text-xs text-gray-300 mt-4 text-center">
        ※ご入力いただいた情報は、お問い合わせ対応以外の目的では使用いたしません。
      </p>
    </form>
  );
}

export default function SNSAutomationLPPage() {
  const [activeTab, setActiveTab] = useState<'corporate' | 'individual'>('corporate');

  return (
    <>
      <Head>
        <title>1日30分で最高品質の動画を生成！月9,580円〜 | AI×SNS設計リスキリング | 株式会社エヌアンドエス</title>
        <meta name="description" content="1日30分の作業で最高品質の動画を生成。従来3-5時間→30分に短縮。法人は人材開発支援助成金で75%還付、個人は分割払い対応。バズは運じゃない。AIが設計する時代へ。" />
        <meta name="keywords" content="1日30分,動画生成,AI自動化,SNS自動化,AIリスキリング,月9580円,75%還付,最高品質,人材開発支援助成金" />
        {/* 🔒 検索エンジンにインデックスさせない（開発中） */}
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <main className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        {/* ヒーローセクション */}
        <section className="relative min-h-screen overflow-hidden">
          {/* 背景グラデーション */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.3),transparent_50%)]" />
          
          {/* 装飾的な背景要素 */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-20 right-20 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-40 right-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 md:pt-32 md:pb-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* 左カラム: テキストコンテンツ */}
              <div className="text-left">
                {/* 🔥 新登場バッジ */}
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 backdrop-blur-sm mb-6">
                  <span className="text-orange-300 font-medium text-sm">
                    🔥 法人リスキリング・個人向けプログラム対応
                  </span>
                </div>

              {/* メインキャッチコピー（H1） */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-6">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 block mb-3 text-5xl sm:text-6xl md:text-7xl">
                  1日30分の作業で
                </span>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 block mb-4 text-5xl sm:text-6xl md:text-7xl">
                  最高品質の動画を生成
                </span>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 block mb-2 text-3xl sm:text-4xl md:text-5xl">
                  月9,580円〜（法人）
                </span>
                <span className="text-gray-300 text-2xl sm:text-3xl block mb-3">
                  / 50万円〜（個人）
                </span>
                <span className="text-white text-3xl sm:text-4xl md:text-5xl block mb-2">
                  バズは運じゃない。
                </span>
                <span className="text-white text-3xl sm:text-4xl md:text-5xl block mb-2">
                  AIが設計する時代へ。
                </span>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 text-2xl sm:text-3xl md:text-4xl block">
                  SNSを動かすのは、
                  <br />
                  あなたのAIクローン。
                </span>
              </h1>

                {/* サブコピー（H2） */}
                <h2 className="text-lg md:text-xl text-gray-200 mb-6 leading-relaxed">
                  台本生成・投稿・分析まですべてAIが自動化。<br />
                  <strong className="text-orange-300">原田研司の哲学を学習したAIクローン</strong>が、あなたの代わりに最高品質を生成。
                </h2>

              {/* 3つの特徴（簡潔に） */}
              <div className="flex flex-wrap gap-4 mb-8">
                <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500/20 to-red-500/20 border-2 border-orange-400/50 backdrop-blur-md rounded-full">
                  <span className="text-2xl">⏱️</span>
                  <span className="text-orange-300 font-bold">1日30分で完了</span>
                </div>
                <div className="relative flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500/30 to-red-500/30 border-2 border-yellow-400 backdrop-blur-md rounded-full shadow-lg">
                  <span className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-black text-xs font-bold px-2 py-0.5 rounded-full">
                    ★一流の証
                  </span>
                  <span className="text-2xl">🧠</span>
                  <span className="text-orange-300 font-bold">AIクローンが設計</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full">
                  <span className="text-2xl">⚡</span>
                  <span className="text-white font-medium">完全自動化</span>
                </div>
              </div>

                {/* CTAボタン */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <a
                    href="#plans"
                    className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-lg hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-xl rounded-xl transform hover:scale-105 text-center animate-pulse"
                  >
                    🚀 料金プランを見る
                  </a>
                  <a
                    href="#contact"
                    className="px-8 py-4 border-2 border-blue-400 text-blue-400 font-bold text-lg hover:bg-blue-400 hover:text-white transition-all duration-300 rounded-xl transform hover:scale-105 text-center"
                  >
                    無料相談を予約
                  </a>
                </div>

                {/* 注意書き */}
                <p className="text-sm text-gray-400 italic">
                  ※本講座はAIによるSNS自動化設計を学ぶリスキリングプログラムです。
                </p>
              </div>

              {/* 右カラム: 画像埋め込みエリア（後で追加） */}
              <div className="hidden lg:block">
                <div className="relative aspect-square">
                  {/* 🎨 ここに画像を後から埋め込む */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-3xl border-2 border-white/20 backdrop-blur-md flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-white text-4xl font-bold mb-4">🎨</p>
                      <p className="text-gray-300 text-lg">画像埋め込みエリア</p>
                      <p className="text-gray-400 text-sm mt-2">後で追加予定</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* AI×SNS研修とは？セクション */}
        <section className="py-20 bg-gradient-to-b from-gray-900 via-slate-900 to-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">
                AI×SNS研修って、どんなサービス？
              </h2>
              <p className="text-gray-300 text-lg max-w-3xl mx-auto">
                バズる台本をAIが自動生成。あなたは1日30分、ボタンを押すだけ。<br />
                従来3-5時間かかっていた作業が、30分で最高品質に。
              </p>
            </div>

            {/* 4つの特徴 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              <div className="bg-gradient-to-br from-orange-800/80 to-red-900/80 backdrop-blur-md border-2 border-orange-400 rounded-2xl p-6 text-center hover:scale-105 transition-all duration-300">
                <div className="text-6xl mb-4">🤖</div>
                <h3 className="text-xl font-bold text-white mb-3">AIクローン構築</h3>
                <p className="text-gray-300 text-sm">
                  あなたの思考をAIが学習。<br />
                  あなたらしい台本を自動生成
                </p>
              </div>

              <div className="bg-gradient-to-br from-blue-800/80 to-blue-900/80 backdrop-blur-md border-2 border-blue-400 rounded-2xl p-6 text-center hover:scale-105 transition-all duration-300">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-xl font-bold text-white mb-3">台本自動生成</h3>
                <p className="text-gray-300 text-sm">
                  ブログ記事を選ぶだけ。<br />
                  ショート・中尺の台本を即生成
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-800/80 to-purple-900/80 backdrop-blur-md border-2 border-purple-400 rounded-2xl p-6 text-center hover:scale-105 transition-all duration-300">
                <div className="text-6xl mb-4">🎬</div>
                <h3 className="text-xl font-bold text-white mb-3">動画生成・投稿</h3>
                <p className="text-gray-300 text-sm">
                  HeyGen・Vrewで動画化。<br />
                  X・YouTube・TikTokへ自動投稿
                </p>
              </div>

              <div className="bg-gradient-to-br from-green-800/80 to-green-900/80 backdrop-blur-md border-2 border-green-400 rounded-2xl p-6 text-center hover:scale-105 transition-all duration-300">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-xl font-bold text-white mb-3">分析・改善</h3>
                <p className="text-gray-300 text-sm">
                  AIが分析レポートを自動生成。<br />
                  PDCA自動化でバズを再現
                </p>
              </div>
            </div>

            {/* ビフォー・アフター */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {/* Before */}
              <div className="bg-gray-800/80 backdrop-blur-md border border-gray-600 rounded-2xl p-8">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-500 mb-4">
                    <span className="text-3xl">😓</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">従来の手動作業</h3>
                  <p className="text-red-400 font-bold text-lg">3-5時間 / 1本</p>
                </div>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 mt-1">✗</span>
                    <span>台本作成に2時間</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 mt-1">✗</span>
                    <span>動画編集に1-2時間</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 mt-1">✗</span>
                    <span>投稿・分析に1時間</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 mt-1">✗</span>
                    <span>品質が個人差大</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 mt-1">✗</span>
                    <span>専任担当者が必要（月10万円）</span>
                  </li>
                </ul>
              </div>

              {/* After */}
              <div className="bg-gradient-to-br from-green-800/80 to-green-900/80 backdrop-blur-md border-2 border-green-400 rounded-2xl p-8 relative">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="px-4 py-1 bg-gradient-to-r from-green-500 to-cyan-500 text-white text-xs font-bold rounded-full">
                    AI活用後
                  </div>
                </div>
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 border-2 border-green-400 mb-4">
                    <span className="text-3xl">🚀</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">AI自動化後</h3>
                  <p className="text-green-300 font-bold text-lg">30分 / 1本</p>
                </div>
                <ul className="space-y-3 text-gray-200">
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">✓</span>
                    <span>台本生成が10分（AI自動）</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">✓</span>
                    <span>動画生成が10分（AI自動）</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">✓</span>
                    <span>投稿・分析が10分（AI自動）</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">✓</span>
                    <span>常に最高品質で安定</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">✓</span>
                    <span>月1.5万円（法人）で実現</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* こんな人におすすめ */}
            <div className="mt-16 max-w-4xl mx-auto bg-gradient-to-br from-blue-800/80 to-purple-900/80 backdrop-blur-md border-2 border-blue-400 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-white mb-6 text-center">
                こんな人におすすめ
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 text-gray-200">
                  <span className="text-blue-400 text-xl mt-1">👔</span>
                  <span>SNS運用に時間がかかりすぎている企業</span>
                </div>
                <div className="flex items-start gap-3 text-gray-200">
                  <span className="text-blue-400 text-xl mt-1">💼</span>
                  <span>バズるコンテンツを量産したい個人</span>
                </div>
                <div className="flex items-start gap-3 text-gray-200">
                  <span className="text-blue-400 text-xl mt-1">🎯</span>
                  <span>専任担当者を雇う予算がない</span>
                </div>
                <div className="flex items-start gap-3 text-gray-200">
                  <span className="text-blue-400 text-xl mt-1">📈</span>
                  <span>SNSからの集客を安定化させたい</span>
                </div>
                <div className="flex items-start gap-3 text-gray-200">
                  <span className="text-blue-400 text-xl mt-1">🔧</span>
                  <span>AIツールを使いこなせていない</span>
                </div>
                <div className="flex items-start gap-3 text-gray-200">
                  <span className="text-blue-400 text-xl mt-1">⚡</span>
                  <span>競合に差をつけたい</span>
                </div>
              </div>
            </div>

            {/* 実績 */}
            <div className="mt-16 text-center">
              <div className="inline-flex flex-col md:flex-row items-center gap-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8">
                <div className="text-center">
                  <p className="text-orange-300 text-5xl font-bold mb-2">90%</p>
                  <p className="text-gray-300">作業時間削減</p>
                </div>
                <div className="hidden md:block w-px h-16 bg-white/20"></div>
                <div className="text-center">
                  <p className="text-blue-300 text-5xl font-bold mb-2">10倍</p>
                  <p className="text-gray-300">動画投稿数増加</p>
                </div>
                <div className="hidden md:block w-px h-16 bg-white/20"></div>
                <div className="text-center">
                  <p className="text-green-300 text-5xl font-bold mb-2">85%</p>
                  <p className="text-gray-300">コスト削減</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 数字で見る導入効果セクション */}
        <section className="py-20 bg-gradient-to-b from-black/30 to-black/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-4">
                📊 数字で見る導入効果
              </h2>
              <p className="text-gray-300 text-lg">
                従来の手動作業と比較して、圧倒的な効率化を実現
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {/* 作業時間 */}
              <div className="bg-gradient-to-br from-orange-800/80 to-red-900/80 backdrop-blur-md border-2 border-orange-400 rounded-2xl p-8 text-center hover:scale-105 transition-all duration-300">
                <div className="text-5xl mb-4">⏱️</div>
                <h3 className="text-2xl font-bold text-white mb-4">作業時間</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-gray-300 text-sm mb-1">従来（手動）</p>
                    <p className="text-white text-3xl font-bold line-through opacity-50">3-5時間</p>
                  </div>
                  <div className="text-orange-300 text-4xl font-bold">↓</div>
                  <div>
                    <p className="text-orange-200 text-sm mb-1">AI活用後</p>
                    <p className="text-orange-300 text-5xl font-bold">30分</p>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-orange-400/30">
                  <p className="text-orange-200 font-bold text-xl">90%削減</p>
                </div>
              </div>

              {/* 品質 */}
              <div className="bg-gradient-to-br from-blue-800/80 to-blue-900/80 backdrop-blur-md border-2 border-blue-400 rounded-2xl p-8 text-center hover:scale-105 transition-all duration-300">
                <div className="text-5xl mb-4">💎</div>
                <h3 className="text-2xl font-bold text-white mb-4">動画品質</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-gray-300 text-sm mb-1">従来（手動）</p>
                    <p className="text-white text-2xl font-bold opacity-50">個人差が大きい</p>
                  </div>
                  <div className="text-blue-300 text-4xl font-bold">↓</div>
                  <div>
                    <p className="text-blue-200 text-sm mb-1">AI活用後</p>
                    <p className="text-blue-300 text-4xl font-bold">最高品質</p>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-blue-400/30">
                  <p className="text-blue-200 font-bold text-xl">常に安定</p>
                </div>
              </div>

              {/* コスト */}
              <div className="bg-gradient-to-br from-purple-800/80 to-purple-900/80 backdrop-blur-md border-2 border-purple-400 rounded-2xl p-8 text-center hover:scale-105 transition-all duration-300">
                <div className="text-5xl mb-4">💰</div>
                <h3 className="text-2xl font-bold text-white mb-4">人件費削減</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-gray-300 text-sm mb-1">従来（手動）</p>
                    <p className="text-white text-3xl font-bold line-through opacity-50">10万円/月</p>
                    <p className="text-gray-400 text-xs">※専任担当者1名換算</p>
                  </div>
                  <div className="text-purple-300 text-4xl font-bold">↓</div>
                  <div>
                    <p className="text-purple-200 text-sm mb-1">AI活用後</p>
                    <p className="text-purple-300 text-5xl font-bold">1.5万円</p>
                    <p className="text-purple-200 text-xs">※法人プラン</p>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-purple-400/30">
                  <p className="text-purple-200 font-bold text-xl">85%削減</p>
                </div>
              </div>
            </div>

            {/* 実際のワークフロー */}
            <div className="max-w-5xl mx-auto bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-md border border-gray-600 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-white mb-6 text-center">
                🎯 1日30分のワークフロー
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white/5 rounded-xl p-4 border border-orange-400/30">
                  <div className="text-center mb-3">
                    <div className="text-3xl mb-2">📝</div>
                    <p className="text-orange-300 font-bold text-sm">STEP 1</p>
                  </div>
                  <p className="text-white text-sm font-medium mb-1">ブログ記事選択</p>
                  <p className="text-gray-400 text-xs">5分</p>
                </div>

                <div className="bg-white/5 rounded-xl p-4 border border-blue-400/30">
                  <div className="text-center mb-3">
                    <div className="text-3xl mb-2">🤖</div>
                    <p className="text-blue-300 font-bold text-sm">STEP 2</p>
                  </div>
                  <p className="text-white text-sm font-medium mb-1">AI台本生成</p>
                  <p className="text-gray-400 text-xs">10分</p>
                </div>

                <div className="bg-white/5 rounded-xl p-4 border border-purple-400/30">
                  <div className="text-center mb-3">
                    <div className="text-3xl mb-2">🎬</div>
                    <p className="text-purple-300 font-bold text-sm">STEP 3</p>
                  </div>
                  <p className="text-white text-sm font-medium mb-1">動画生成・編集</p>
                  <p className="text-gray-400 text-xs">10分</p>
                </div>

                <div className="bg-white/5 rounded-xl p-4 border border-green-400/30">
                  <div className="text-center mb-3">
                    <div className="text-3xl mb-2">🚀</div>
                    <p className="text-green-300 font-bold text-sm">STEP 4</p>
                  </div>
                  <p className="text-white text-sm font-medium mb-1">投稿・分析</p>
                  <p className="text-gray-400 text-xs">5分</p>
                </div>
              </div>

              <div className="mt-6 text-center">
                <p className="text-white text-lg font-bold mb-2">
                  合計: <span className="text-orange-300 text-3xl">30分</span>
                </p>
                <p className="text-gray-300 text-sm">
                  しかも、すべて最高品質で自動化
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 専門学校との比較セクション */}
        <section className="py-20 bg-gradient-to-br from-purple-900/30 via-black to-blue-900/30 relative overflow-hidden">
          {/* 背景エフェクト */}
          <div className="absolute inset-0 bg-[url('/images/grid.svg')] opacity-5 bg-repeat" />
          
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {/* セクションヘッダー */}
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold mb-6">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-red-400">
                  専門学校と何が違うのか？
                </span>
              </h2>
              <p className="text-gray-300 text-lg max-w-3xl mx-auto">
                2年で250万円 vs 3ヶ月で50万円。圧倒的なコスパと実践力。
              </p>
            </div>

            {/* 比較テーブル */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              
              {/* 専門学校 */}
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-600/50 rounded-2xl p-8">
                <div className="text-center mb-8">
                  <div className="inline-block bg-gray-700 text-gray-300 px-4 py-2 rounded-full text-sm font-bold mb-4">
                    従来の選択肢
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-2">AI専門学校</h3>
                  <p className="text-gray-400 text-sm">一般的な専門学校の場合</p>
                </div>

                <div className="space-y-6">
                  {/* 価格 */}
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">💰</div>
                    <div className="flex-1">
                      <h4 className="text-white font-bold mb-1">価格</h4>
                      <p className="text-red-400 text-2xl font-bold">250万円</p>
                      <p className="text-gray-400 text-sm">（2年制の平均）</p>
                    </div>
                  </div>

                  {/* 期間 */}
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">⏰</div>
                    <div className="flex-1">
                      <h4 className="text-white font-bold mb-1">期間</h4>
                      <p className="text-gray-300 text-lg">2年間</p>
                      <p className="text-gray-400 text-sm">平日フルタイム</p>
                    </div>
                  </div>

                  {/* 内容 */}
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">📚</div>
                    <div className="flex-1">
                      <h4 className="text-white font-bold mb-1">学習内容</h4>
                      <p className="text-gray-300 text-sm">座学中心、基礎理論重視</p>
                      <p className="text-gray-400 text-xs mt-1">プログラミング、数学、AI理論など</p>
                    </div>
                  </div>

                  {/* 成果 */}
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">🎓</div>
                    <div className="flex-1">
                      <h4 className="text-white font-bold mb-1">得られるもの</h4>
                      <p className="text-gray-300 text-sm">専門士の資格</p>
                      <p className="text-gray-400 text-xs mt-1">就職サポートあり</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI×SNS研修 */}
              <div className="bg-gradient-to-br from-orange-900/50 to-red-900/50 backdrop-blur-sm border-2 border-orange-400 rounded-2xl p-8 relative overflow-hidden shadow-2xl">
                {/* 「おすすめ」バッジ */}
                <div className="absolute top-0 right-0 bg-gradient-to-r from-yellow-400 to-orange-400 text-black text-sm font-bold px-6 py-2 rounded-bl-2xl shadow-lg">
                  🔥 圧倒的コスパ
                </div>

                <div className="text-center mb-8 mt-4">
                  <div className="inline-block bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full text-sm font-bold mb-4">
                    NANDSTECHの提案
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-2">AI×SNS研修</h3>
                  <p className="text-orange-200 text-sm">実践・実装中心の3ヶ月集中</p>
                </div>

                <div className="space-y-6">
                  {/* 価格 */}
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">💰</div>
                    <div className="flex-1">
                      <h4 className="text-white font-bold mb-1">価格</h4>
                      <p className="text-green-400 text-2xl font-bold">50万円</p>
                      <p className="text-orange-200 text-sm">月4.2万円×12回（分割可）</p>
                      <p className="text-yellow-300 text-xs font-bold mt-1">※専門学校の1/5のコスト！</p>
                    </div>
                  </div>

                  {/* 期間 */}
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">⏰</div>
                    <div className="flex-1">
                      <h4 className="text-white font-bold mb-1">期間</h4>
                      <p className="text-white text-lg">3ヶ月（12週）</p>
                      <p className="text-orange-200 text-sm">週1回Zoom + 毎日Slack</p>
                      <p className="text-yellow-300 text-xs font-bold mt-1">※専門学校の1/8の期間！</p>
                    </div>
                  </div>

                  {/* 内容 */}
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">🚀</div>
                    <div className="flex-1">
                      <h4 className="text-white font-bold mb-1">学習内容</h4>
                      <p className="text-white text-sm">実践・実装100%</p>
                      <p className="text-orange-200 text-xs mt-1">AIクローン構築、台本生成、動画制作</p>
                      <p className="text-yellow-300 text-xs font-bold mt-1">※1日30分で最高品質を生成！</p>
                    </div>
                  </div>

                  {/* 成果 */}
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">🎯</div>
                    <div className="flex-1">
                      <h4 className="text-white font-bold mb-1">得られるもの</h4>
                      <p className="text-white text-sm">実際にバズる動画システム</p>
                      <p className="text-orange-200 text-xs mt-1">10,000再生保証（個人）</p>
                      <p className="text-yellow-300 text-xs font-bold mt-1">※すぐに収益化可能！</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* ボトムメッセージ */}
            <div className="text-center">
              <div className="inline-block bg-gradient-to-r from-purple-900/30 to-red-900/30 backdrop-blur-md border border-purple-500/30 rounded-2xl px-8 py-6">
                <p className="text-white text-2xl font-bold mb-3">
                  🎯 コスパ5倍、期間1/8、実践100%
                </p>
                <p className="text-gray-300 text-sm mb-4">
                  専門学校で2年かけて学ぶより、3ヶ月で実践的なスキルを習得。<br />
                  さらに、AIクローンがあなたの代わりに24時間働き続けます。
                </p>
                <a
                  href="#contact"
                  className="inline-block px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-lg hover:from-orange-600 hover:to-red-600 transition-all duration-300 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  📞 無料相談で詳しく聞く
                </a>
              </div>
            </div>

          </div>
        </section>

        {/* 料金プラン比較セクション */}
        <section id="plans" className="py-20 bg-black/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-4">
                💰 料金プラン比較
              </h2>
              <p className="text-gray-300 text-lg mb-8">
                法人は助成金で75%還付、個人は分割払い対応。あなたに最適なプランを。
              </p>

              {/* タブ切り替え */}
              <div className="inline-flex bg-gray-800/80 backdrop-blur-md border border-gray-600 rounded-full p-2 mb-12">
                <button
                  onClick={() => setActiveTab('corporate')}
                  className={`px-8 py-3 rounded-full font-bold transition-all duration-300 ${
                    activeTab === 'corporate'
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  🏢 法人向けプラン
                </button>
                <button
                  onClick={() => setActiveTab('individual')}
                  className={`px-8 py-3 rounded-full font-bold transition-all duration-300 ${
                    activeTab === 'individual'
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  👤 個人向けプラン
                </button>
              </div>
            </div>

            {/* 法人向けプラン */}
            {activeTab === 'corporate' && (
              <div className="animate-fade-in">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 backdrop-blur-sm mb-4">
                    <span className="text-yellow-300 font-medium">
                      💰 人材開発支援助成金で75%還付対応
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* 🥉 エントリープラン（釣り） */}
                  <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-md border-2 border-gray-600 rounded-2xl p-8 hover:border-gray-400 transition-all duration-300">
                    <div className="text-center mb-6">
                      <div className="text-4xl mb-2">🥉</div>
                      <h3 className="text-2xl font-bold text-white mb-2">
                        SNSリテラシーコース
                      </h3>
                      <p className="text-gray-400 text-sm">
                        eラーニングのみ・5人〜
                      </p>
                    </div>

                    <div className="bg-white/5 rounded-xl p-6 mb-6">
                      <div className="text-center mb-4">
                        <p className="text-gray-400 text-sm line-through">定価: 23万円</p>
                        <p className="text-yellow-300 text-sm">助成金(75%): -17.25万円</p>
                        <div className="h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent my-3" />
                        <p className="text-green-300 font-bold text-lg">実質負担: 5.75万円</p>
                      </div>
                      <div className="bg-gradient-to-r from-green-600/30 to-blue-600/30 border border-green-400/50 rounded-lg p-4">
                        <p className="text-center text-white font-bold text-3xl">
                          月9,580円
                        </p>
                        <p className="text-center text-green-200 text-xs mt-1">
                          ※6ヶ月換算
                        </p>
                      </div>
                    </div>

                    <ul className="space-y-3 mb-8">
                      <li className="flex items-start gap-2 text-gray-300">
                        <span className="text-green-400 mt-1">✓</span>
                        <span>eラーニング動画（全20本）</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-300">
                        <span className="text-green-400 mt-1">✓</span>
                        <span>SNS基礎リテラシー習得</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-300">
                        <span className="text-green-400 mt-1">✓</span>
                        <span>オンライン質問対応</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-400">
                        <span className="text-gray-600 mt-1">✗</span>
                        <span>Zoom週次セッション</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-400">
                        <span className="text-gray-600 mt-1">✗</span>
                        <span>AI駆動開発講座</span>
                      </li>
                    </ul>

                    <a
                      href="#contact"
                      className="block w-full px-6 py-3 border-2 border-gray-500 text-gray-300 font-bold text-center hover:bg-gray-700 hover:border-gray-400 transition-all duration-300 rounded-xl"
                    >
                      詳しく見る
                    </a>
                  </div>

                  {/* 🥈 スタンダードプラン */}
                  <div className="bg-gradient-to-br from-blue-800/80 to-blue-900/80 backdrop-blur-md border-2 border-blue-400 rounded-2xl p-8 hover:border-blue-300 transition-all duration-300">
                    <div className="text-center mb-6">
                      <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-500/30 border border-blue-400/50 mb-2">
                        <span className="text-blue-200 text-xs font-bold">人気</span>
                      </div>
                      <div className="text-4xl mb-2">🥈</div>
                      <h3 className="text-2xl font-bold text-white mb-2">
                        SNS設計基礎コース
                      </h3>
                      <p className="text-blue-200 text-sm">
                        eラーニング + Zoom・5人〜
                      </p>
                    </div>

                    <div className="bg-white/5 rounded-xl p-6 mb-6">
                      <div className="text-center mb-4">
                        <p className="text-gray-400 text-sm line-through">定価: 24万円</p>
                        <p className="text-yellow-300 text-sm">助成金(75%): -18万円</p>
                        <div className="h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent my-3" />
                        <p className="text-green-300 font-bold text-lg">実質負担: 6万円</p>
                      </div>
                      <div className="bg-gradient-to-r from-blue-600/30 to-cyan-600/30 border border-blue-400/50 rounded-lg p-4">
                        <p className="text-center text-white font-bold text-3xl">
                          月1万円
                        </p>
                        <p className="text-center text-blue-200 text-xs mt-1">
                          ※6ヶ月換算
                        </p>
                      </div>
                    </div>

                    <ul className="space-y-3 mb-8">
                      <li className="flex items-start gap-2 text-gray-200">
                        <span className="text-green-400 mt-1">✓</span>
                        <span>eラーニング動画（全20本）</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-200">
                        <span className="text-green-400 mt-1">✓</span>
                        <span>SNSリテラシー強化研修</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-200">
                        <span className="text-green-400 mt-1">✓</span>
                        <span>Zoom週次セッション（12週）</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-200">
                        <span className="text-green-400 mt-1">✓</span>
                        <span>Slackサポート（6ヶ月）</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-400">
                        <span className="text-gray-600 mt-1">✗</span>
                        <span>AI駆動開発講座</span>
                      </li>
                    </ul>

                    <a
                      href="#contact"
                      className="block w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold text-center hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      今すぐ申し込む
                    </a>
                  </div>

                  {/* 🥇 プレミアムプラン（本命） */}
                  <div className="bg-gradient-to-br from-orange-800/80 to-red-900/80 backdrop-blur-md border-2 border-orange-400 rounded-2xl p-8 hover:border-orange-300 transition-all duration-300 relative">
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="px-4 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold rounded-full">
                        🔥 おすすめ
                      </div>
                    </div>

                    <div className="text-center mb-6">
                      <div className="text-4xl mb-2">🥇</div>
                      <h3 className="text-2xl font-bold text-white mb-2">
                        AI×SNS設計マスターコース
                      </h3>
                      <p className="text-orange-200 text-sm">
                        完全サポート + AI駆動開発
                      </p>
                    </div>

                    <div className="bg-white/5 rounded-xl p-6 mb-6">
                      <div className="text-center mb-4">
                        <p className="text-gray-400 text-sm">1人あたり80万円（3人〜）</p>
                        <p className="text-yellow-300 text-sm">助成金(75%): -60万円</p>
                        <div className="h-px bg-gradient-to-r from-transparent via-orange-400 to-transparent my-3" />
                        <p className="text-green-300 font-bold text-lg">実質負担: 20万円</p>
                      </div>
                      <div className="bg-gradient-to-r from-orange-600/30 to-red-600/30 border border-orange-400/50 rounded-lg p-4">
                        <p className="text-center text-white font-bold text-3xl">
                          月1.5万円
                        </p>
                        <p className="text-center text-orange-200 text-xs mt-1">
                          ※6ヶ月換算 + AI駆動開発込み
                        </p>
                      </div>
                    </div>

                    <ul className="space-y-3 mb-8">
                      <li className="flex items-start gap-2 text-gray-200">
                        <span className="text-green-400 mt-1">✓</span>
                        <span>eラーニング動画（全20本）</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-200">
                        <span className="text-green-400 mt-1">✓</span>
                        <span>AI×SNS設計完全マスター</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-200">
                        <span className="text-green-400 mt-1">✓</span>
                        <span>Zoom週次セッション（12週×2）</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-200">
                        <span className="text-green-400 mt-1">✓</span>
                        <span>Slackサポート（6ヶ月）</span>
                      </li>
                      <li className="flex items-start gap-2 text-orange-300 font-semibold">
                        <span className="text-orange-400 mt-1">🔥</span>
                        <span>AI駆動開発講座（特典）</span>
                      </li>
                      <li className="flex items-start gap-2 text-orange-300 font-semibold">
                        <span className="text-orange-400 mt-1">🔥</span>
                        <span>個別コンサルティング</span>
                      </li>
                    </ul>

                    <a
                      href="#contact"
                      className="block w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-center hover:from-orange-600 hover:to-red-600 transition-all duration-300 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 animate-pulse"
                    >
                      今すぐ申し込む（推奨）
                    </a>
                  </div>
                </div>

                {/* 補足説明 */}
                <div className="mt-12 text-center">
                  <p className="text-gray-400 text-sm">
                    ※助成金申請サポートも含まれます。個別相談で最適なプランをご提案いたします。
                  </p>
                </div>
              </div>
            )}

            {/* 個人向けプラン */}
            {activeTab === 'individual' && (
              <div className="animate-fade-in">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 backdrop-blur-sm mb-4">
                    <span className="text-orange-300 font-medium">
                      💳 分割払い対応（最大12回まで）
                    </span>
                  </div>
                </div>

                <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                  {/* AI×SNS設計リスキリング */}
                  <div className="bg-gradient-to-br from-blue-800/80 to-blue-900/80 backdrop-blur-md border-2 border-blue-400 rounded-2xl p-8 hover:border-blue-300 transition-all duration-300">
                    <div className="text-center mb-6">
                      <div className="text-5xl mb-3">🎯</div>
                      <h3 className="text-2xl font-bold text-white mb-2">
                        AI×SNS設計リスキリング
                      </h3>
                      <p className="text-blue-200 text-sm">
                        バズる台本を完全マスター
                      </p>
                    </div>

                    <div className="bg-white/5 rounded-xl p-6 mb-6">
                      <div className="text-center mb-4">
                        <p className="text-white font-bold text-4xl mb-2">50万円</p>
                        <div className="h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent my-3" />
                        <p className="text-blue-200 text-sm">分割払い（12回）</p>
                        <p className="text-white font-bold text-2xl mt-2">月4.2万円</p>
                      </div>
                    </div>

                    <ul className="space-y-3 mb-8">
                      <li className="flex items-start gap-2 text-gray-200">
                        <span className="text-green-400 mt-1">✓</span>
                        <span>Zoom週1×12週（3ヶ月集中）</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-200">
                        <span className="text-green-400 mt-1">✓</span>
                        <span>Slackサポート（6ヶ月）</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-200">
                        <span className="text-green-400 mt-1">✓</span>
                        <span>AIクローン構築支援</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-200">
                        <span className="text-green-400 mt-1">✓</span>
                        <span>台本生成システム利用権</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-200">
                        <span className="text-green-400 mt-1">✓</span>
                        <span>10,000再生保証</span>
                      </li>
                    </ul>

                    <a
                      href="#contact"
                      className="block w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold text-center hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      今すぐ申し込む
                    </a>
                  </div>

                  {/* AIプログラミングスクール */}
                  <div className="bg-gradient-to-br from-purple-800/80 to-purple-900/80 backdrop-blur-md border-2 border-purple-400 rounded-2xl p-8 hover:border-purple-300 transition-all duration-300">
                    <div className="text-center mb-6">
                      <div className="text-5xl mb-3">💻</div>
                      <h3 className="text-2xl font-bold text-white mb-2">
                        AIプログラミングスクール
                      </h3>
                      <p className="text-purple-200 text-sm">
                        AI駆動開発を実践的に習得
                      </p>
                    </div>

                    <div className="bg-white/5 rounded-xl p-6 mb-6">
                      <div className="text-center mb-4">
                        <p className="text-white font-bold text-4xl mb-2">40万円</p>
                        <div className="h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent my-3" />
                        <p className="text-purple-200 text-sm">分割払い（12回）</p>
                        <p className="text-white font-bold text-2xl mt-2">月3.4万円</p>
                      </div>
                    </div>

                    <ul className="space-y-3 mb-8">
                      <li className="flex items-start gap-2 text-gray-200">
                        <span className="text-green-400 mt-1">✓</span>
                        <span>Zoom週1×12週（3ヶ月集中）</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-200">
                        <span className="text-green-400 mt-1">✓</span>
                        <span>Slackサポート（6ヶ月）</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-200">
                        <span className="text-green-400 mt-1">✓</span>
                        <span>bolt.new / Cursor実践</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-200">
                        <span className="text-green-400 mt-1">✓</span>
                        <span>AIペアプログラミング</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-200">
                        <span className="text-green-400 mt-1">✓</span>
                        <span>1システム開発保証</span>
                      </li>
                    </ul>

                    <a
                      href="#contact"
                      className="block w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-center hover:from-purple-600 hover:to-pink-600 transition-all duration-300 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      今すぐ申し込む
                    </a>
                  </div>
                </div>

                {/* セット割引 */}
                <div className="max-w-4xl mx-auto">
                  <div className="bg-gradient-to-br from-orange-800/80 to-red-900/80 backdrop-blur-md border-2 border-orange-400 rounded-2xl p-8 relative">
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="px-4 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold rounded-full">
                        🎁 セット割引
                      </div>
                    </div>

                    <div className="text-center mb-6">
                      <div className="text-5xl mb-3">🎉</div>
                      <h3 className="text-3xl font-bold text-white mb-2">
                        2コースセット割引
                      </h3>
                      <p className="text-orange-200">
                        AI×SNS設計 + AIプログラミングスクール
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      <div className="bg-white/5 rounded-xl p-4 text-center">
                        <p className="text-gray-400 text-sm mb-1">通常価格</p>
                        <p className="text-white text-2xl font-bold line-through">90万円</p>
                      </div>
                      <div className="bg-white/5 rounded-xl p-4 text-center">
                        <p className="text-yellow-300 text-sm mb-1">セット割引</p>
                        <p className="text-yellow-300 text-2xl font-bold">-15万円</p>
                      </div>
                      <div className="bg-gradient-to-r from-orange-600/30 to-red-600/30 border border-orange-400/50 rounded-xl p-4 text-center">
                        <p className="text-orange-200 text-sm mb-1">特別価格</p>
                        <p className="text-white text-2xl font-bold">75万円</p>
                      </div>
                    </div>

                    <div className="text-center mb-6">
                      <p className="text-white text-lg mb-2">分割払い（12回）</p>
                      <p className="text-orange-300 font-bold text-4xl">月6.3万円</p>
                      <p className="text-gray-300 text-sm mt-2">※通常 月7.6万円 → 月1.3万円お得</p>
                    </div>

                    <a
                      href="#contact"
                      className="block w-full px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-lg text-center hover:from-orange-600 hover:to-red-600 transition-all duration-300 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 animate-pulse"
                    >
                      🔥 セット割引で申し込む（15万円お得）
                    </a>
                  </div>
                </div>

                {/* 補足説明 */}
                <div className="mt-12 text-center">
                  <p className="text-gray-400 text-sm">
                    ※分割払いは最大12回まで対応。クレジットカード決済のみ。
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* システム設計セクション */}
        <section className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-black relative overflow-hidden">
          {/* 背景エフェクト */}
          <div className="absolute inset-0 bg-[url('/images/grid.svg')] opacity-5 bg-repeat" />
          
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {/* セクションヘッダー */}
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold mb-6">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400">
                  なぜ1日30分で最高品質なのか？
                </span>
              </h2>
              <p className="text-gray-300 text-lg max-w-3xl mx-auto">
                5つの技術が自動で連携。あなたがやることは、ボタンを押すだけ。
              </p>
            </div>

            {/* フローチャート */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-12">
              
              {/* ステップ1: ブログ記事 */}
              <div className="relative">
                <div className="bg-gradient-to-br from-blue-900/50 to-cyan-900/50 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-6 text-center h-full flex flex-col items-center justify-center">
                  <div className="text-5xl mb-4">📝</div>
                  <h3 className="text-white font-bold text-lg mb-2">ブログ記事</h3>
                  <p className="text-gray-300 text-sm">AIで自動生成された専門記事</p>
                </div>
                {/* 矢印 */}
                <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 text-cyan-400 text-3xl z-10">
                  →
                </div>
              </div>

              {/* ステップ2: ベクトル化 */}
              <div className="relative">
                <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-6 text-center h-full flex flex-col items-center justify-center">
                  <div className="text-5xl mb-4">🔗</div>
                  <h3 className="text-white font-bold text-lg mb-2">ベクトルリンク</h3>
                  <p className="text-gray-300 text-sm">AI検索最適化（Mike King理論）</p>
                </div>
                {/* 矢印 */}
                <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 text-purple-400 text-3xl z-10">
                  →
                </div>
              </div>

              {/* ステップ3: AIクローン（思想RAG） */}
              <div className="relative">
                <div className="bg-gradient-to-br from-orange-900/50 to-red-900/50 backdrop-blur-sm border border-orange-500/30 rounded-2xl p-6 text-center h-full flex flex-col items-center justify-center relative overflow-hidden">
                  {/* 「一流の証」バッジ */}
                  <div className="absolute top-2 right-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-black text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                    ★ 一流の証
                  </div>
                  <div className="text-5xl mb-4">🧠</div>
                  <h3 className="text-white font-bold text-lg mb-2">あなたのAIクローン</h3>
                  <p className="text-gray-300 text-sm">原田研司の哲学を学習したAI</p>
                </div>
                {/* 矢印 */}
                <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 text-orange-400 text-3xl z-10">
                  →
                </div>
              </div>

              {/* ステップ4: GPT-5生成 */}
              <div className="relative">
                <div className="bg-gradient-to-br from-green-900/50 to-emerald-900/50 backdrop-blur-sm border border-green-500/30 rounded-2xl p-6 text-center h-full flex flex-col items-center justify-center">
                  <div className="text-5xl mb-4">🤖</div>
                  <h3 className="text-white font-bold text-lg mb-2">GPT-5台本生成</h3>
                  <p className="text-gray-300 text-sm">最高品質の台本を自動作成</p>
                </div>
                {/* 矢印 */}
                <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 text-green-400 text-3xl z-10">
                  →
                </div>
              </div>

              {/* ステップ5: 動画生成 */}
              <div className="relative">
                <div className="bg-gradient-to-br from-red-900/50 to-pink-900/50 backdrop-blur-sm border border-red-500/30 rounded-2xl p-6 text-center h-full flex flex-col items-center justify-center">
                  <div className="text-5xl mb-4">🎬</div>
                  <h3 className="text-white font-bold text-lg mb-2">動画化・投稿</h3>
                  <p className="text-gray-300 text-sm">HeyGen + Vrew で自動生成</p>
                </div>
              </div>

            </div>

            {/* ボトムメッセージ */}
            <div className="text-center">
              <div className="inline-block bg-gradient-to-r from-cyan-900/30 to-purple-900/30 backdrop-blur-md border border-cyan-500/30 rounded-2xl px-8 py-6">
                <p className="text-white text-xl font-bold mb-2">
                  ⏱️ あなたがやることは「ボタンを押すだけ」
                </p>
                <p className="text-gray-300 text-sm">
                  5つの技術が自動で連携し、30分で最高品質の動画を生成します
                </p>
              </div>
            </div>

            {/* 差別化ポイント */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 relative overflow-hidden">
                {/* 「一流の証」バッジ */}
                <div className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-black text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                  ★ 一流の証
                </div>
                <div className="text-3xl mb-3">🎯</div>
                <h4 className="text-white font-bold text-lg mb-2">あなた専用のAIクローン</h4>
                <p className="text-gray-300 text-sm">
                  単なるAI生成ツールではなく、<strong className="text-orange-400">原田研司の哲学を学習したAIクローン</strong>があなたの代わりに台本を作成。<strong className="text-cyan-400">ベクトルリンク技術</strong>で検索最適化も自動
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                <div className="text-3xl mb-3">🔄</div>
                <h4 className="text-white font-bold text-lg mb-2">完全自動化</h4>
                <p className="text-gray-300 text-sm">
                  トレンドニュース取得からYouTube投稿まで、<strong className="text-purple-400">全ステップが自動</strong>。人の手が入るのは最終確認だけ
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                <div className="text-3xl mb-3">📈</div>
                <h4 className="text-white font-bold text-lg mb-2">検索1位の実績</h4>
                <p className="text-gray-300 text-sm">
                  「SNS自動化」でGoogle検索<strong className="text-orange-400">1位獲得</strong>。実証済みの技術力とSEO戦略
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* YouTube最新ショート動画セクション */}
        <LatestShortsGallery 
          maxResults={6}
          title="📱 実際に生成された動画をチェック"
          description="毎日自動生成・投稿されているAIショート動画。このクオリティが、1日30分の作業で実現します。"
        />

        {/* お問い合わせセクション */}
        <section id="contact" className="py-20 bg-gradient-to-br from-gray-900 via-black to-gray-900">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-6">
                無料相談を予約する
              </h2>
              <p className="text-gray-300 text-lg mb-4">
                あなたに最適なプランを、専門スタッフが無料でご提案します。<br />
                法人は助成金申請、個人は分割払いについてもお気軽にご相談ください。
              </p>
            </div>

            {/* フォーム */}
            <ContactForm />

            {/* 代替CTAボタン */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8 mb-8">
              <a
                href="/sns-automation"
                className="px-8 py-4 border-2 border-white text-white font-bold text-lg hover:bg-white hover:text-blue-900 transition-all duration-300 rounded-xl transform hover:scale-105 text-center"
              >
                システム開発サービスを見る
              </a>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
              <p className="text-gray-300 text-sm leading-relaxed">
                <strong className="text-white">法人リスキリングは2026年度で終了予定です。</strong><br />
                今後はSNS×AIプログラミングを中心に、個人・法人問わず幅広くご活用いただけるプログラムへと進化します。
              </p>
            </div>
          </div>
        </section>
      </main>

      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </>
  );
}
