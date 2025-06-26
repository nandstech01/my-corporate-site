import React from 'react';
import dynamic from 'next/dynamic';
import SystemHeroSection from './components/SystemHeroSection';
import ProjectShowcase from './components/ProjectShowcase';
import TechStackSection from './components/TechStackSection';
import DevelopmentFlow from './components/DevelopmentFlow';
import ContactCTA from './components/ContactCTA';

// 構造化データ（JSON-LD）
const structuredData = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "AIシステム開発サービス",
  "description": "株式会社エヌアンドエスのAIシステム開発サービス。13法令準拠RAGシステム、30分自動生成システム、24時間運用システムなど、業界最速・最安値でのシステム開発を提供。",
  "provider": {
    "@type": "Organization",
    "name": "株式会社エヌアンドエス",
    "url": "https://nands.tech",
    "logo": "https://nands.tech/images/logo.png",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "滋賀県大津市",
      "addressLocality": "大津市",
      "addressRegion": "滋賀県",
      "addressCountry": "JP"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+81-77-575-3757",
      "contactType": "customer service",
      "availableLanguage": "Japanese",
      "email": "info@nands.tech"
    }
  },
  "serviceType": "AIシステム開発",
  "areaServed": "JP",
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "AIシステム開発サービス",
    "itemListElement": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "RAGシステム開発",
          "description": "13法令準拠RAGシステム、ベクトル検索機能、管理画面付き"
        },
        "priceRange": "500000-",
        "priceCurrency": "JPY"
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "自動生成システム開発",
          "description": "コンテンツ自動生成、外部API連携、スケジューラー機能"
        },
        "priceRange": "800000-",
        "priceCurrency": "JPY"
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "フルスタックシステム開発",
          "description": "フロントエンド、バックエンドAPI、データベース設計"
        },
        "priceRange": "1200000-",
        "priceCurrency": "JPY"
      }
    ]
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "5.0",
    "reviewCount": "50",
    "bestRating": "5",
    "worstRating": "1"
  },
  "review": [
    {
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": "田中様"
      },
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": "5",
        "bestRating": "5"
      },
      "reviewBody": "退職代行システムの開発をお願いしました。業界最安値を実現する高品質なシステムを短期間で構築していただき、大変満足しています。"
    }
  ]
};

const SystemDevelopmentPage = () => {
  return (
    <>
      {/* 構造化データ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <main className="min-h-screen">
        {/* ヒーローセクション */}
        <SystemHeroSection />
        
        {/* プロジェクト実績 */}
        <ProjectShowcase />
        
        {/* 技術スタック */}
        <TechStackSection />
        
        {/* 開発フロー */}
        <DevelopmentFlow />
        
        {/* お問い合わせCTA */}
        <ContactCTA />
      </main>
    </>
  );
};

export default SystemDevelopmentPage; 