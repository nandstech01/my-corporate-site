import React from 'react';
import { Metadata } from 'next';

// Mike King理論準拠 - Trust Layer実装
// 法的情報ページ SSR化 + LegalDocument構造化データ + Fragment ID対応

export const metadata: Metadata = {
  title: "法的情報 | 株式会社エヌアンドエス - AI・DX時代のキャリア支援企業",
  description: "株式会社エヌアンドエスの法的情報。特定商取引法表記、コンプライアンス、透明性の高い企業経営に関する詳細情報。Trust Layer完全対応。",
  keywords: "法的情報,特定商取引法,コンプライアンス,エヌアンドエス,NANDS,AI研修,DX支援,Trust Layer",
  openGraph: {
    title: "法的情報 | 株式会社エヌアンドエス",
    description: "AI・DX時代のキャリア支援企業の法的情報。特定商取引法表記とコンプライアンス体制。",
    url: "https://nands.tech/legal",
    siteName: "株式会社エヌアンドエス",
    images: [
      {
        url: "https://nands.tech/images/legal-compliance-og.jpg",
        width: 1200,
        height: 630,
        alt: "株式会社エヌアンドエス 法的情報"
      }
    ],
    locale: "ja_JP",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "法的情報 | 株式会社エヌアンドエス",
    description: "AI・DX時代のキャリア支援企業の法的情報。特定商取引法表記とコンプライアンス体制。",
    images: ["https://nands.tech/images/legal-compliance-og.jpg"]
  },
  alternates: {
    canonical: "https://nands.tech/legal"
  }
};

// 特定商取引法表記データ
const commercialTransactionInfo = {
  companyName: "株式会社エヌアンドエス",
  representative: "原田 賢治",
  address: "〒520-0025 滋賀県大津市皇子が丘２丁目10−25−3004号",
  phone: "0120-558-551",
  email: "contact@nands.tech",
  businessHours: "平日 10:00～19:00（土日祝日を除く）",
  website: "https://nands.tech"
};

// コンプライアンス方針
const compliancePolicies = [
  {
    id: "legal-compliance",
    title: "法令遵守",
    content: "当社は、事業活動において適用される法令・規則・社会規範を遵守し、社会的責任を果たします。",
    icon: "⚖️"
  },
  {
    id: "fair-business",
    title: "公正な事業活動",
    content: "独占禁止法、下請法等の競争法を遵守し、公正で透明な事業活動を行います。",
    icon: "🤝"
  },
  {
    id: "information-security",
    title: "情報セキュリティ",
    content: "お客様の個人情報や機密情報を適切に保護し、情報漏洩防止に努めます。",
    icon: "🔒"
  },
  {
    id: "labor-standards",
    title: "労働基準法遵守",
    content: "従業員の労働環境改善と労働基準法の完全遵守を徹底します。",
    icon: "👥"
  },
  {
    id: "anti-corruption",
    title: "反腐敗・反社会的勢力排除",
    content: "贈収賄防止と反社会的勢力との関係遮断を徹底します。",
    icon: "🚫"
  }
];

const LegalPage = () => {
  // LegalDocument構造化データ
  const legalSchema = {
    "@context": "https://schema.org",
    "@type": "LegalDocument",
    "name": "株式会社エヌアンドエス 法的情報",
    "url": "https://nands.tech/legal",
    "publisher": {
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
    "description": "AI・DX時代のキャリア支援企業の法的情報。特定商取引法表記、事業許可、コンプライアンス体制について詳細に記載。",
    "text": "株式会社エヌアンドエスは、AIリスキリング研修、副業支援、法人向けAI導入支援等の事業において、関連法令を遵守し、透明性の高い企業経営を行っています。",
    "jurisdiction": "Japan",
    "governingLaw": "日本法",
    "inLanguage": "ja",
    "category": "Legal Information",
    "audience": {
      "@type": "Audience",
      "audienceType": "customers, business partners, stakeholders"
    }
  };

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  return (
    <>
      {/* 構造化データ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(legalSchema)
        }}
      />

      <div className="pt-16 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        {/* Fragment ID for Entity Map - Hidden from users */}
        <div id="company" style={{ display: 'none' }} aria-hidden="true" />
        
        {/* ヘッダーセクション - Fragment ID: legal-header */}
        <section id="legal-header" className="py-16 bg-gradient-to-br from-slate-700 to-blue-800 text-white">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">法的情報</h1>
            <p className="text-xl text-blue-100 leading-relaxed">
              透明性の高い企業経営<br />
              コンプライアンス体制と法的情報
            </p>
            <div className="mt-8 inline-block bg-white/10 rounded-lg px-6 py-3">
              <span className="text-sm font-semibold">最終更新：2024年11月15日</span>
            </div>
          </div>
        </section>

        {/* 特定商取引法表記 - Fragment ID: commercial-transaction */}
        <section id="commercial-transaction" className="py-16">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-800 mb-6">特定商取引法に基づく表記</h2>
              <div className="w-24 h-1 bg-blue-600 mx-auto mb-8"></div>
              <p className="text-slate-600 leading-relaxed">
                特定商取引に関する法律第11条に基づき、以下の通り表示いたします。
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-slate-700 p-6">
                <h3 className="text-2xl font-bold text-white text-center">事業者情報</h3>
              </div>
              
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <dt className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">事業者名</dt>
                      <dd className="text-lg font-semibold text-slate-800">{commercialTransactionInfo.companyName}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">代表者</dt>
                      <dd className="text-lg font-semibold text-slate-800">{commercialTransactionInfo.representative}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">所在地</dt>
                      <dd className="text-lg font-semibold text-slate-800">{commercialTransactionInfo.address}</dd>
                    </div>

                  </div>

                  <div className="space-y-6">
                    <div>
                      <dt className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">電話番号</dt>
                      <dd className="text-lg font-semibold text-slate-800">
                        <a href={`tel:${commercialTransactionInfo.phone}`} className="hover:text-blue-600 transition-colors">
                          {commercialTransactionInfo.phone}
                        </a>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">メールアドレス</dt>
                      <dd className="text-lg font-semibold text-slate-800">
                        <a href={`mailto:${commercialTransactionInfo.email}`} className="hover:text-blue-600 transition-colors">
                          {commercialTransactionInfo.email}
                        </a>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">営業時間</dt>
                      <dd className="text-lg font-semibold text-slate-800">{commercialTransactionInfo.businessHours}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">ホームページ</dt>
                      <dd className="text-lg font-semibold text-slate-800">
                        <a href={commercialTransactionInfo.website} className="hover:text-blue-600 transition-colors">
                          {commercialTransactionInfo.website}
                        </a>
                      </dd>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* コンプライアンス方針 - Fragment ID: compliance */}
        <section id="compliance" className="py-16">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-800 mb-6">コンプライアンス方針</h2>
              <div className="w-24 h-1 bg-blue-600 mx-auto mb-8"></div>
              <p className="text-slate-600 leading-relaxed">
                当社は、社会的責任を果たし、持続可能な企業経営を実現するため、<br />
                以下のコンプライアンス方針を定めています。
              </p>
            </div>

            <div className="space-y-8">
              {compliancePolicies.map((policy, index) => (
                <div key={index} id={policy.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 to-slate-700 p-6">
                    <h3 className="text-xl font-bold text-white flex items-center">
                      <span className="text-2xl mr-3">{policy.icon}</span>
                      {policy.title}
                    </h3>
                  </div>
                  <div className="p-6">
                    <p className="text-slate-700 leading-relaxed">{policy.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 苦情・相談窓口 - Fragment ID: complaint-desk */}
        <section id="complaint-desk" className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-800 mb-6">苦情・相談窓口</h2>
              <div className="w-24 h-1 bg-blue-600 mx-auto"></div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-orange-600 to-red-600 p-8 text-white text-center">
                <h3 className="text-2xl font-bold mb-4">コンプライアンス相談窓口</h3>
                <p className="text-orange-100">
                  法的問題やコンプライアンスに関するご相談・ご意見を承ります。<br />
                  匿名でのご相談も可能です。
                </p>
              </div>
              
              <div className="p-8">
                <div className="space-y-8">
                  <div className="max-w-2xl mx-auto">
                    <div>
                      <h4 className="text-lg font-bold text-slate-800 mb-4">内部通報窓口</h4>
                      <div className="space-y-3 text-slate-700">
                        <p><strong>電話：</strong><a href="tel:0120-558-551" className="text-blue-600 hover:underline">0120-558-551</a></p>
                        <p><strong>メール：</strong><a href="mailto:contact@nands.tech" className="text-blue-600 hover:underline">contact@nands.tech</a></p>
                        <p><strong>郵送：</strong>〒520-0025<br />滋賀県大津市皇子が丘２丁目10−25−3004号<br />株式会社エヌアンドエス コンプライアンス窓口 宛</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                    <h4 className="text-lg font-bold text-yellow-800 mb-3">通報者保護について</h4>
                    <p className="text-yellow-700 leading-relaxed">
                      当社は、内部通報を行った方に対する不利益取扱いを禁止しており、通報者の秘密保持を徹底いたします。
                      また、公益通報者保護法に基づき、適切な対応を行います。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 免責事項 */}
        <section className="py-16 bg-gradient-to-br from-blue-600 to-slate-700 text-white">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">免責事項</h2>
            <div className="text-left bg-white/10 rounded-xl p-8">
              <div className="space-y-4 text-blue-100 leading-relaxed">
                <p>
                  • 当社ウェブサイトの情報は、予告なく変更される場合があります。
                </p>
                <p>
                  • 掲載情報の正確性については細心の注意を払っておりますが、その完全性・正確性を保証するものではありません。
                </p>
                <p>
                  • 当社ウェブサイトを利用することで生じたいかなる損害についても、当社は責任を負いかねます。
                </p>
                <p>
                  • 外部リンク先の内容については、当社が管理・運営するものではなく、その内容について責任を負いません。
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
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

export default LegalPage;
