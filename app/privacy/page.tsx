import React from 'react';
import { Metadata } from 'next';

// Mike King理論準拠 - Trust Layer実装
// プライバシーポリシーページ SSR化 + PrivacyPolicy構造化データ + Fragment ID対応

export const metadata: Metadata = {
  title: "プライバシーポリシー | 株式会社エヌアンドエス - AI・DX時代のキャリア支援企業",
  description: "株式会社エヌアンドエスのプライバシーポリシー。個人情報保護に関する取り組み、AI研修・DX推進・キャリア支援サービスでの個人情報取扱いについて詳細に説明。Trust Layer完全対応。",
  keywords: "プライバシーポリシー,個人情報保護,エヌアンドエス,NANDS,AI研修,DX支援,Trust Layer",
  openGraph: {
    title: "プライバシーポリシー | 株式会社エヌアンドエス",
    description: "AI・DX時代のキャリア支援企業の個人情報保護方針。安心・安全な個人情報取扱いを保証。",
    url: "https://nands.tech/privacy",
    siteName: "株式会社エヌアンドエス",
    images: [
      {
        url: "https://nands.tech/images/privacy-og.jpg",
        width: 1200,
        height: 630,
        alt: "株式会社エヌアンドエス プライバシーポリシー"
      }
    ],
    locale: "ja_JP",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "プライバシーポリシー | 株式会社エヌアンドエス",
    description: "AI・DX時代のキャリア支援企業の個人情報保護方針。安心・安全な個人情報取扱い。",
    images: ["https://nands.tech/images/privacy-og.jpg"]
  },
  alternates: {
    canonical: "https://nands.tech/privacy"
  }
};

// 個人情報利用目的データ
const usagePurposes = [
  "生成AIリスキリング研修サービスの運営・受講サポート",
  "副業支援サービス（無料セミナー、学習支援、案件斡旋）の運営・案内",
  "法人向けAI導入コンサルティング・研修の提供",
  "退職支援サービス（退職手続き代行等）の提供",
  "給付金申請支援サービスの提供",
  "キャリアコンサルティング（転職サポート等）の提供",
  "お客様からのお問い合わせ対応・ご意見の収集",
  "サービス品質向上・改善のための分析やマーケティング活動",
  "新サービスやキャンペーン、セミナー等のご案内",
  "アンケート調査の実施、統計情報の作成",
  "各種サービス利用契約の締結・履行・契約管理"
];

// 第三者提供例外事項
const thirdPartyExceptions = [
  "法令に基づき開示が求められる場合",
  "人の生命、身体または財産の保護のために必要があり、ご本人の同意を得ることが困難な場合",
  "公衆衛生の向上または児童の健全な育成の推進のため特に必要がある場合",
  "国または地方公共団体が法令の定める事務を遂行するうえで協力する必要があり、ご本人の同意を得ることが困難な場合",
  "業務委託に伴い、当社と機密保持契約を締結した委託先に必要な範囲で開示する場合",
  "その他個人情報保護法または関連法令で認められる正当な理由がある場合"
];

// 主要ポリシー項目
const policyItems = [
  {
    id: "privacy-compliance",
    title: "1. 法令の遵守について",
    content: "当社は、個人情報の保護に関する法律（個人情報保護法）及び関連する政省令・ガイドライン、その他関係法令を遵守し、適正な個人情報の取得・利用・管理・提供を行います。",
    icon: "⚖️"
  },
  {
    id: "privacy-security",
    title: "3. 個人情報の安全管理",
    content: "当社は、取り扱う個人情報について、漏洩・滅失・毀損・不正アクセス等を防止するために、適切な技術的・組織的安全管理措置を講じます。また、これらの措置を従業員に周知徹底し、継続的に見直し・改善を図ります。",
    icon: "🔒"
  },
  {
    id: "privacy-disclosure",
    title: "5. 個人情報の開示・訂正・削除等",
    content: "当社は、ご本人から個人情報の開示・訂正・追加・削除・利用停止・消去等を求められた場合、ご本人の確認を行ったうえで、法令に基づき適切に対応いたします。",
    icon: "📋"
  },
  {
    id: "privacy-cookies",
    title: "6. Cookieの使用について",
    content: "当社ウェブサイトでは、利用者の利便性向上や利用状況の分析、サービス改善のためにCookieを使用することがあります。ブラウザの設定によりCookieの使用を制限・拒否することが可能です。",
    icon: "🍪"
  },
  {
    id: "privacy-external",
    title: "7. 外部サービスとの連携",
    content: "当社のサービス利用に際し、外部の決済代行サービス、通信プラットフォーム、クラウドサービス等を使用する場合があります。これら外部サービスの利用により、個人情報が当該事業者に提供される場合、その取り扱いは当該事業者のプライバシーポリシーに従います。",
    icon: "🔗"
  }
];

const PrivacyPage = () => {
  // PrivacyPolicy構造化データ
  const privacySchema = {
    "@context": "https://schema.org",
    "@type": "PrivacyPolicy",
    "name": "株式会社エヌアンドエス プライバシーポリシー",
    "url": "https://nands.tech/privacy",
    "provider": {
      "@type": "Organization",
      "name": "株式会社エヌアンドエス",
      "url": "https://nands.tech",
      "telephone": "0120-558-551",
      "email": "contact@nands.tech",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "皇子が丘２丁目10−25−3004号",
        "addressLocality": "大津市",
        "addressRegion": "滋賀県",
        "postalCode": "520-0025",
        "addressCountry": "JP"
      }
    },
    "datePublished": "2024-11-15",
    "dateModified": "2024-11-15",
    "description": "AI・DX時代のキャリア支援サービスにおける個人情報保護方針。GDPR準拠の透明性の高い個人情報取扱い。",
    "text": "株式会社エヌアンドエスは、AIリスキリング研修、副業支援、法人向けAI導入支援、退職支援、給付金支援、キャリアコンサルティングなど多岐にわたる事業を実施する上で、個人情報の重要性を認識し、これを適切に取り扱うことが社会的責務であると考えます。",
    "jurisdiction": "Japan",
    "governingLaw": "日本国個人情報保護法",
    "inLanguage": "ja",
    "applicableLocation": {
      "@type": "Country",
      "name": "Japan"
    }
  };

  return (
    <>
      {/* 構造化データ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(privacySchema)
        }}
      />

      <div className="pt-16 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        {/* ヘッダーセクション - Fragment ID: privacy-header */}
        <section id="privacy-header" className="py-16 bg-gradient-to-br from-slate-700 to-blue-800 text-white">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">プライバシーポリシー</h1>
            <p className="text-xl text-blue-100 leading-relaxed">
              個人情報保護に関する当社の取り組み<br />
              AI・DX時代の安心・安全な個人情報管理
            </p>
            <div className="mt-8 inline-block bg-white/10 rounded-lg px-6 py-3">
              <span className="text-sm font-semibold">最終更新：2024年11月15日</span>
            </div>
          </div>
        </section>

        {/* 基本方針 - Fragment ID: privacy-policy */}
        <section id="privacy-policy" className="py-16">
          <div className="max-w-4xl mx-auto px-4">
            <div className="bg-blue-50 border-l-4 border-blue-400 p-8 rounded-lg shadow-md mb-12">
              <h2 className="text-2xl font-bold text-blue-800 mb-4">個人情報保護方針</h2>
              <p className="text-blue-700 leading-relaxed">
                株式会社エヌアンドエス（以下「当社」といいます。）は、AIリスキリング研修、副業支援、法人向けAI導入支援、退職支援、給付金支援、キャリアコンサルティングなど
                多岐にわたる事業（以下「本サービス」といいます。）を実施する上で、個人情報の重要性を認識し、
                これを適切に取り扱うことが社会的責務であると考えます。<br />
                当社は、個人情報の適切な取り扱いに組織として取り組むため、以下の方針を定め、従業員に周知徹底し、個人情報の保護に努めます。
              </p>
            </div>
          </div>
        </section>

        {/* 利用目的 - Fragment ID: privacy-usage */}
        <section id="privacy-usage" className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-800 mb-6">2. 個人情報の利用目的</h2>
              <div className="w-24 h-1 bg-blue-600 mx-auto mb-8"></div>
              <p className="text-slate-600 leading-relaxed">
                当社は、取得した個人情報を以下の目的で利用いたします。<br />
                これらの目的を超えて利用する必要が生じた場合、あらためてご本人の同意を得るものとします。
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {usagePurposes.map((purpose, index) => (
                <div key={index} className="bg-gradient-to-br from-blue-50 to-slate-50 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center">
                    <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                      {index + 1}
                    </span>
                    <p className="text-slate-700 text-sm leading-relaxed">{purpose}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 主要ポリシー項目 - Fragment ID: privacy-main */}
        <section id="privacy-main" className="py-16">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-800 mb-6">主要ポリシー項目</h2>
              <div className="w-24 h-1 bg-blue-600 mx-auto"></div>
            </div>

            <div className="space-y-8">
              {policyItems.map((item, index) => (
                <div key={index} id={item.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 to-slate-700 p-6">
                    <h3 className="text-xl font-bold text-white flex items-center">
                      <span className="text-2xl mr-3">{item.icon}</span>
                      {item.title}
                    </h3>
                  </div>
                  <div className="p-6">
                    <p className="text-slate-700 leading-relaxed">{item.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 第三者提供 - Fragment ID: privacy-third-party */}
        <section id="privacy-third-party" className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-800 mb-6">4. 個人情報の第三者提供</h2>
              <div className="w-24 h-1 bg-blue-600 mx-auto mb-8"></div>
              <p className="text-slate-600 leading-relaxed">
                当社は、以下の場合を除き、あらかじめご本人の同意を得ることなく個人情報を第三者に提供しません。
              </p>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-xl p-8">
              <h3 className="text-xl font-bold text-red-800 mb-6 flex items-center">
                <span className="text-2xl mr-3">⚠️</span>
                第三者提供の例外事項
              </h3>
              <div className="space-y-4">
                {thirdPartyExceptions.map((exception, index) => (
                  <div key={index} className="flex items-start">
                    <span className="w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-1 flex-shrink-0">
                      {index + 1}
                    </span>
                    <p className="text-red-700 leading-relaxed">{exception}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* お問い合わせ窓口 - Fragment ID: privacy-contact */}
        <section id="privacy-contact" className="py-16">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-800 mb-6">8. お問い合わせ窓口</h2>
              <div className="w-24 h-1 bg-blue-600 mx-auto"></div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-blue-600 p-8 text-white text-center">
                <h3 className="text-2xl font-bold mb-4">個人情報保護管理者</h3>
                <p className="text-green-100">
                  個人情報の取り扱いに関するご質問や、開示・訂正・削除等のお申し出、<br />
                  その他ご意見などは下記までお問い合わせください。
                </p>
              </div>
              
              <div className="p-8">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-lg font-bold text-slate-800 mb-4">連絡先情報</h4>
                      <div className="space-y-3 text-slate-700">
                        <p><strong>会社名：</strong>株式会社エヌアンドエス</p>
                        <p><strong>住所：</strong>〒520-0025<br />滋賀県大津市皇子が丘２丁目10−25−3004号</p>
                        <p><strong>電話：</strong><a href="tel:0120-558-551" className="text-blue-600 hover:underline">0120-558-551</a></p>
                        <p><strong>メール：</strong><a href="mailto:contact@nands.tech" className="text-blue-600 hover:underline">contact@nands.tech</a></p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-bold text-slate-800 mb-4">受付時間</h4>
                      <div className="bg-blue-50 rounded-lg p-4">
                        <p className="text-slate-700"><strong>平日：</strong>10:00～19:00</p>
                        <p className="text-slate-600 text-sm mt-2">※土日祝日を除く</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 改定について */}
        <section className="py-16 bg-gradient-to-br from-blue-600 to-slate-700 text-white">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">9. プライバシーポリシーの改定</h2>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              当社は、事業内容の変更や法令の改正などに応じて、<br />
              本プライバシーポリシーを適宜見直し、改定することがあります。<br />
              重要な変更がある場合は、当社ウェブサイト上で告知いたします。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="tel:0120-558-551"
                className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                📞 0120-558-551
              </a>
              <a 
                href="mailto:contact@nands.tech"
                className="border-2 border-white hover:bg-white hover:text-blue-600 px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                ✉️ contact@nands.tech
              </a>
            </div>
          </div>
        </section>

        {/* フッター情報 */}
        <footer className="py-8 bg-slate-800 text-white">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <p className="text-slate-300">2024年11月15日 改定</p>
            <p className="text-slate-300 mt-2">株式会社エヌアンドエス</p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default PrivacyPage;
