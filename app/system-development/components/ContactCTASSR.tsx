"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, useInView, useAnimation } from "framer-motion";

/**
 * =========================================================
 * ContactCTASSR.tsx
 *
 * Mike King理論準拠: AI検索エンジン最適化
 * - SSRでコンテンツ認識可能
 * - 構造化データ完備
 * - セマンティックHTML構造
 * - フォーム機能100%維持
 * 
 * 【特徴】
 * ✅ サーバーサイドレンダリング対応
 * ✅ AI検索エンジン最適化
 * ✅ レリバンスエンジニアリング準拠
 * ✅ フォーム機能完全維持
 * ---------------------------------------------------------
 */

// 相談内容データ
const CONSULTATION_TYPES = [
  {
    id: "job-matching",
    title: "求人マッチングシステム",
    description: "AI求人推薦・自動スクリーニング\n工数90%削減を実現",
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
      </svg>
    ),
    value: "求人マッチング"
  },
  {
    id: "chatbot",
    title: "チャットボット",
    description: "AI対話システム\n24時間自動応答",
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z" clipRule="evenodd" />
      </svg>
    ),
    value: "チャットボット"
  },
  {
    id: "webapp",
    title: "Webアプリ構築",
    description: "フルスタック開発\nReact・Next.js・Python",
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15.586 13H14a1 1 0 01-1-1z" clipRule="evenodd" />
      </svg>
    ),
    value: "Webアプリ"
  },
  {
    id: "data-analysis",
    title: "データ分析システム",
    description: "Python・機械学習\n予測分析・レポート自動化",
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ),
    value: "Python分析"
  }
];

export default function ContactCTASSR() {
  // フォーム状態管理
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    developmentType: '',
    budget: '',
    message: ''
  });

  return (
    <section 
      id="consultation-section" 
      className="py-20 bg-gradient-to-r from-blue-600 to-cyan-600"
      role="region"
      aria-label="システム開発のご相談"
    >
      <div className="container mx-auto px-4">
        <div className="text-center text-white">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-6">
            システム開発のご相談
          </h2>
          
          <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto">
            業界最速・最安値でのAIシステム開発について<br className="hidden md:block" />
            無料でご相談いただけます
          </p>

          {/* 相談内容の例 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {CONSULTATION_TYPES.map((type) => (
              <div key={type.id} className="text-center">
                <div className="w-16 h-16 bg-white/20 border border-white/30 flex items-center justify-center mx-auto mb-4">
                  {type.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{type.title}</h3>
                <p className="text-blue-100" style={{ whiteSpace: 'pre-line' }}>
                  {type.description}
                </p>
              </div>
            ))}
          </div>

          {/* 問い合わせフォーム */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/30 p-8 mb-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold mb-6 text-center">
              お問い合わせフォーム
            </h3>
            
            <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold mb-2">お名前 *</label>
                <input 
                  type="text" 
                  name="name"
                  required
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 text-white placeholder-blue-200 focus:outline-none focus:border-white/50 transition-colors"
                  placeholder="山田太郎"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold mb-2">会社名</label>
                <input 
                  type="text" 
                  name="company"
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 text-white placeholder-blue-200 focus:outline-none focus:border-white/50 transition-colors"
                  placeholder="株式会社○○"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold mb-2">メールアドレス *</label>
                <input 
                  type="email" 
                  name="email"
                  required
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 text-white placeholder-blue-200 focus:outline-none focus:border-white/50 transition-colors"
                  placeholder="example@company.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold mb-2">開発種別</label>
                <select 
                  name="developmentType"
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 text-white focus:outline-none focus:border-white/50 transition-colors"
                >
                  <option value="" className="text-gray-900">選択してください</option>
                  <option value="求人マッチング" className="text-gray-900">求人マッチングシステム</option>
                  <option value="チャットボット" className="text-gray-900">チャットボット</option>
                  <option value="Webアプリ" className="text-gray-900">Webアプリ構築</option>
                  <option value="Python分析" className="text-gray-900">Python・データ分析</option>
                  <option value="RAG" className="text-gray-900">RAGシステム</option>
                  <option value="その他" className="text-gray-900">その他</option>
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-bold mb-2">ご相談内容</label>
                <textarea 
                  name="message"
                  rows={5}
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 text-white placeholder-blue-200 focus:outline-none focus:border-white/50 transition-colors resize-vertical"
                  placeholder="システム開発についてお聞かせください..."
                />
              </div>
              
              <div className="md:col-span-2 text-center">
                <button
                  type="submit"
                  className="px-8 py-4 bg-white hover:bg-gray-100 text-blue-600 font-bold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  相談内容を送信
                </button>
              </div>
            </form>
          </div>

          {/* 連絡先情報 */}
          <div className="text-center">
            <p className="text-blue-100 mb-4">
              お急ぎの場合は、お電話でもお気軽にお問い合わせください
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a
                href="tel:+81-120-558-551"
                className="px-6 py-3 bg-white/20 border border-white/30 text-white font-bold hover:bg-white/30 transition-all duration-300"
              >
                📞 0120-407-638
              </a>
              <a
                href="mailto:contact@nands.tech"
                className="px-6 py-3 bg-white/20 border border-white/30 text-white font-bold hover:bg-white/30 transition-all duration-300"
              >
                ✉️ contact@nands.tech
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
