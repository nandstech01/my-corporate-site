'use client';

import React, { useEffect } from 'react';

// Mike King理論準拠 - Trust Layer実装
// 利用規約ページ CSR化 + TermsOfService構造化データ + Fragment ID対応

// Note: metadata export removed for client component

// サービス定義データ
const services = [
  {
    name: "ポータルサイト",
    description: "乙が運営する総合案内ページ。各種事業情報を集約し、甲が目的に合ったサービスを選択できるよう情報を提供。"
  },
  {
    name: "副業支援サービス", 
    description: "甲がスキル・時間を活用し収益化を目指すプログラム。AIを活用した無料セミナー、学習支援、プロジェクトの斡旋などを含む。"
  },
  {
    name: "法人向けAI導入支援サービス",
    description: "ChatGPTやAIエージェント等の生成AI技術を活用した業務効率化、DX推進をサポートするコンサルティング・研修・開発支援事業。"
  },
  {
    name: "リスキリング研修サービス",
    description: "AIリテラシーやプロンプトエンジニアリングなどの教育・指導を行う研修コース。オンライン教材やメンタリング等を通じてスキルアップを図る。"
  }
];

// 主要条項データ
const termsItems = [
  {
    id: "terms-scope",
    title: "第1条（適用範囲）",
    content: "本規約は、乙が運営する本サービスの利用に関して、乙と甲との間で締結される契約に適用されるものとする。甲は、本サービスを利用するにあたり本規約の内容に同意するものとし、本規約に同意いただけない場合は本サービスを利用できない。"
  },
  {
    id: "terms-services",
    title: "第2条（提供する役務の内容等）",
    content: "乙は、甲に対し、本契約に基づき以下のサービスを提供する。各サービスの詳細な利用条件・手続・料金等は乙が別途定めるところに従い、甲はそれに同意の上利用するものとする。"
  },
  {
    id: "terms-pricing", 
    title: "第3条（料金・契約形態）",
    content: "本サービスの利用料や契約形態、支払い方法等については、乙が別途提示する契約書、料金表、個別同意書、またはウェブサイトの表示等の指示に従うものとする。甲は、個別契約締結または利用申し込みの時点で当該料金や契約形態を確認し、同意したうえで利用を開始する。"
  },
  {
    id: "terms-period",
    title: "第4条（利用期間・延長・キャンセル）", 
    content: "各サービスの利用（受講）期間やキャンセルポリシーは、利用申し込み時または個別契約時に乙が提示する規定に準じる。リスキリング研修等で延長制度がある場合も、甲は乙の定める手続き・延長料金や条件に同意の上、申し出を行うものとする。"
  },
  {
    id: "terms-refund",
    title: "第5条（返金保証・解約）",
    content: "乙が返金保証制度を設ける場合、その対象サービスや返金手続き方法、保証期間は別途定める案内に従うものとする。甲が解約を希望する場合、乙が指定する方法（電子メール、書面等）で連絡し、解約手続を行う。"
  },
  {
    id: "terms-environment",
    title: "第6条（環境要件・免責事項）",
    content: "甲は、本サービスを利用するにあたり必要な通信環境・端末・ソフトウェア等を自己責任と費用で用意する。乙は本サービスにおいて、特定の結果や収益、キャリアアップ効果を保証するものではない。"
  },
  {
    id: "terms-ip",
    title: "第7条（知的財産権）",
    content: "本サービスで提供される教材、プログラム、ドキュメント、Webコンテンツ等に関する著作権その他の知的財産権は、乙または正当な権利者に帰属する。甲は、それらを複製、転載、改変、配布、販売、その他営利目的で利用してはならない。"
  },
  {
    id: "terms-prohibited",
    title: "第8条（禁止事項）",
    content: "甲は、本サービス利用に際し、本サービスの運営または他の利用者の活動を妨害する行為、乙または第三者の権利を侵害する行為、法令や公序良俗に反する行為、その他乙が不適切と判断する行為をしてはならない。"
  }
];

const TermsPage = () => {
  // メタデータ設定
  useEffect(() => {
    document.title = "利用規約 | 株式会社エヌアンドエス - AI・DX時代のキャリア支援企業";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', "株式会社エヌアンドエスの利用規約。ポータルサイト、副業支援、法人向けAI導入支援、リスキリング研修サービスに関する利用条件を明記。Trust Layer完全対応。");
    }
  }, []);

  // Fragment IDスクロール処理
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash) {
        const targetId = hash.substring(1); // # を除去
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          // ヘッダーの高さを考慮してオフセット調整
          const headerOffset = 80;
          const elementPosition = targetElement.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });

          // 一時的なハイライト効果
          targetElement.style.backgroundColor = '#dbeafe';
          targetElement.style.transition = 'background-color 0.5s ease';
          setTimeout(() => {
            targetElement.style.backgroundColor = '';
          }, 2000);
        }
      }
    };

    // 初期ロード時のハッシュ処理
    if (window.location.hash) {
      setTimeout(handleHashChange, 100);
    }

    // ハッシュ変更の監視
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // TermsOfService構造化データ
  const termsSchema = {
    "@context": "https://schema.org",
    "@type": "TermsOfService",
    "name": "株式会社エヌアンドエス 利用規約",
    "url": "https://nands.tech/terms",
    "provider": {
      "@type": "Organization",
      "name": "株式会社エヌアンドエス",
      "url": "https://nands.tech",
      "telephone": "0120-558-551",
      "email": "contact@nands.tech"
    },
    "datePublished": "2024-11-15",
    "dateModified": "2024-11-15",
    "description": "AI・DX時代のキャリア支援サービス（ポータルサイト、副業支援、法人向けAI導入支援、リスキリング研修）に関する利用規約",
    "text": "本規約は、株式会社エヌアンドエスが提供するAI・DX時代のキャリア支援サービスに関し、申込者または利用者との間で締結される一切の契約に適用される。",
    "jurisdiction": "Japan",
    "governingLaw": "日本法",
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
          __html: JSON.stringify(termsSchema)
        }}
      />

      <div className="pt-16 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        {/* Fragment ID for Entity Map - Hidden from users */}
        <div id="company" style={{ display: 'none' }} aria-hidden="true" />
        
        {/* ヘッダーセクション - Fragment ID: terms-header */}
        <section id="terms-header" className="py-16 bg-gradient-to-br from-slate-700 to-blue-800 text-white">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">利用規約</h1>
            <p className="text-xl text-blue-100 leading-relaxed">
              AI・DX時代のキャリア支援サービス<br />
              透明性の高い利用条件
            </p>
            <div className="mt-8 inline-block bg-white/10 rounded-lg px-6 py-3">
              <span className="text-sm font-semibold">最終更新：2024年11月15日</span>
            </div>
          </div>
        </section>

        {/* 重要事項 - Fragment ID: terms-overview */}
        <section id="terms-overview" className="py-16">
          <div className="max-w-4xl mx-auto px-4">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-8 rounded-lg shadow-md mb-12">
              <h2 className="text-2xl font-bold text-yellow-800 mb-4">重要事項</h2>
              <p className="text-yellow-700 leading-relaxed">
                本契約を締結するにあたっては本規約を熟読のうえ、十分にご検討ください。
                本規約は、株式会社エヌアンドエス（以下、「乙」という。）が提供する以下の各サービス（以下、「本サービス」という。）に関し、
                申込者または利用者（以下、「甲」という。）との間で締結される一切の契約に適用されるものとします。
              </p>
            </div>
          </div>
        </section>

        {/* 対象サービス - Fragment ID: terms-services */}
        <section id="terms-services" className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-800 mb-6">対象となる本サービス</h2>
              <div className="w-24 h-1 bg-blue-600 mx-auto"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {services.map((service, index) => (
                <div key={index} className="bg-gradient-to-br from-blue-50 to-slate-50 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                  <h3 className="text-xl font-bold text-slate-800 mb-4">{service.name}</h3>
                  <p className="text-slate-600 leading-relaxed">{service.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 主要条項 - Fragment ID: terms-usage */}
        <section id="terms-usage" className="py-16">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-800 mb-6">主要条項</h2>
              <div className="w-24 h-1 bg-blue-600 mx-auto"></div>
            </div>

            <div className="space-y-8">
              {termsItems.map((item, index) => (
                <div key={index} id={item.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 to-slate-700 p-6">
                    <h3 className="text-xl font-bold text-white">{item.title}</h3>
                  </div>
                  <div className="p-6">
                    <p className="text-slate-700 leading-relaxed">{item.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 詳細条項 - Fragment ID: terms-details */}
        <section id="terms-details" className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-800 mb-6">詳細条項</h2>
              <div className="w-24 h-1 bg-blue-600 mx-auto"></div>
            </div>

            <div className="space-y-8">
              {/* 第9条 秘密保持 */}
              <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-8 shadow-md">
                <h3 className="text-xl font-bold text-slate-800 mb-4">第9条（秘密保持）</h3>
                <p className="text-slate-700 leading-relaxed">
                  甲は、本サービスを利用する過程で知り得た乙および他の利用者の機密情報、営業秘密、個人情報等を、第三者へ漏洩または開示してはならない。本条の義務は本契約終了後も継続する。
                </p>
              </div>

              {/* 第10条 損害賠償 */}
              <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-8 shadow-md">
                <h3 className="text-xl font-bold text-slate-800 mb-4">第10条（損害賠償）</h3>
                <p className="text-slate-700 leading-relaxed">
                  甲が本規約または個別契約に違反し、乙または第三者に損害を与えた場合、甲はその損害を賠償する責任を負う。乙は、乙に故意または重大な過失がある場合を除き、甲が被る損害について一切の責任を負わない。
                </p>
              </div>

              {/* 第11条 個人情報 */}
              <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-8 shadow-md">
                <h3 className="text-xl font-bold text-slate-800 mb-4">第11条（個人情報の取扱い）</h3>
                <p className="text-slate-700 leading-relaxed">
                  乙は、甲の個人情報をプライバシーポリシーおよび関連法令に基づき適切に取り扱う。詳細は乙のウェブサイト上に掲載するプライバシーポリシーを参照すること。
                </p>
              </div>

              {/* 第12条 反社会的勢力の排除 */}
              <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-8 shadow-md">
                <h3 className="text-xl font-bold text-slate-800 mb-4">第12条（反社会的勢力の排除）</h3>
                <p className="text-slate-700 leading-relaxed">
                  甲および乙は、それぞれが反社会的勢力に該当しないこと、および反社会的勢力と一切の取引関係を有しないことを表明し保証する。本条に違反した場合、相手方は何らの催告を要せずに契約を解除できる。
                </p>
              </div>

              {/* 第13条 規約の変更 */}
              <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-8 shadow-md">
                <h3 className="text-xl font-bold text-slate-800 mb-4">第13条（規約の変更）</h3>
                <p className="text-slate-700 leading-relaxed">
                  乙は、必要に応じて本規約を変更できるものとし、変更後の規約は乙が運営するウェブサイトに掲載した時点、または乙が定める効力発生日に効力を生じる。甲は、規約変更後も本サービスを利用する場合、変更後の規約に同意したものとみなされる。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* お問い合わせ */}
        <section className="py-16 bg-gradient-to-br from-blue-600 to-slate-700 text-white">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">利用規約に関するお問い合わせ</h2>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              ご不明な点がございましたら、<br />
              お気軽にお問い合わせください。
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
            <p className="text-slate-300">最終更新日：2024年11月15日</p>
            <p className="text-slate-300 mt-2">株式会社エヌアンドエス</p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default TermsPage;
