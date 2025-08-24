import { NextResponse } from 'next/server';
import { FragmentVectorizer, FragmentInfo } from '@/lib/vector/fragment-vectorizer';

export async function POST() {
  try {
    console.log('🚀 法的文書Fragment IDベクトル化開始...');
    
    const fragmentVectorizer = new FragmentVectorizer();
    
    // 法的文書のFragment ID情報を定義
    const legalFragments: FragmentInfo[] = [
      // プライバシーポリシー
      {
        fragment_id: 'privacy-header',
        content_title: 'プライバシーポリシー - ヘッダー',
        content: 'プライバシーポリシー。個人情報保護に関する当社の取り組み。AI・DX時代の安心・安全な個人情報管理。株式会社エヌアンドエスの個人情報保護方針について詳細に説明。最終更新：2024年11月15日。',
        content_type: 'section',
        category: 'legal',
        semantic_weight: 0.90
      },
      {
        fragment_id: 'privacy-policy',
        content_title: 'プライバシーポリシー - 基本方針',
        content: '個人情報保護に関する基本方針。法令の遵守、個人情報の安全管理、開示・訂正・削除等の対応、Cookieの使用、外部サイトのリンクについて。個人情報保護法及び関連法令を遵守し、適正な個人情報の取得・利用・管理・提供を行います。',
        content_type: 'section',
        category: 'legal',
        semantic_weight: 0.88,
        target_queries: [
          'プライバシーポリシー',
          '個人情報保護',
          'データ保護',
          '個人情報取扱い',
          'Cookie利用',
          'GDPR',
          'セキュリティ対策'
        ],
        related_entities: [
          'NANDS',
          '個人情報保護法',
          'プライバシー保護',
          'データセキュリティ',
          '安全管理措置'
        ]
      },
      {
        fragment_id: 'privacy-compliance',
        content_title: 'プライバシーポリシー - 法令遵守',
        content: '法令の遵守について。当社は、個人情報の保護に関する法律（個人情報保護法）及び関連する政省令・ガイドライン、その他関係法令を遵守し、適正な個人情報の取得・利用・管理・提供を行います。',
        content_type: 'faq',
        category: 'legal',
        semantic_weight: 0.86
      },
      {
        fragment_id: 'privacy-security',
        content_title: 'プライバシーポリシー - 安全管理',
        content: '個人情報の安全管理。当社は、取り扱う個人情報について、漏洩・滅失・毀損・不正アクセス等を防止するために、適切な技術的・組織的安全管理措置を講じます。これらの措置を従業員に周知徹底し、継続的に見直し・改善を図ります。',
        content_type: 'faq',
        category: 'legal',
        semantic_weight: 0.86
      },
      {
        fragment_id: 'privacy-disclosure',
        content_title: 'プライバシーポリシー - 開示・訂正・削除',
        content: '個人情報の開示・訂正・削除等。当社は、ご本人から個人情報の開示・訂正・追加・削除・利用停止・消去等を求められた場合、ご本人の確認を行ったうえで、法令に基づき適切に対応いたします。',
        content_type: 'faq',
        category: 'legal',
        semantic_weight: 0.86
      },
      {
        fragment_id: 'privacy-cookies',
        content_title: 'プライバシーポリシー - Cookie使用',
        content: 'Cookieの使用について。当社ウェブサイトでは、利用者の利便性向上や利用状況の分析、サービス改善のためにCookieを使用することがあります。ブラウザの設定によりCookieの使用を制限・拒否することが可能です。',
        content_type: 'faq',
        category: 'legal',
        semantic_weight: 0.84
      },
      
      // 利用規約
      {
        fragment_id: 'terms-header',
        content_title: '利用規約 - ヘッダー',
        content: '利用規約。株式会社エヌアンドエスが提供するサービスの利用に関する規約。AI研修・DX支援・キャリア支援サービスの利用条件、禁止事項、責任制限について詳細に規定。',
        content_type: 'section',
        category: 'legal',
        semantic_weight: 0.88
      },
      {
        fragment_id: 'terms-usage',
        content_title: '利用規約 - 利用条件',
        content: 'サービス利用条件。当社が提供するAI研修、DX支援、キャリア支援サービスの利用にあたっての基本的な条件と利用者の義務について規定。適正利用と禁止行為の明確化。',
        content_type: 'section',
        category: 'legal',
        semantic_weight: 0.86,
        target_queries: [
          '利用規約',
          'サービス利用条件',
          '利用者義務',
          '禁止事項',
          'AI研修利用規約',
          'DX支援利用規約'
        ],
        related_entities: [
          'NANDS',
          'AI研修サービス',
          'DX支援サービス',
          'キャリア支援',
          '利用者義務'
        ]
      },
      
      // 法的情報
      {
        fragment_id: 'legal-header',
        content_title: '法的情報 - ヘッダー',
        content: '法的情報。株式会社エヌアンドエスの法的情報。特定商取引法表記、コンプライアンス、透明性の高い企業経営に関する詳細情報。Trust Layer完全対応。',
        content_type: 'section',
        category: 'legal',
        semantic_weight: 0.88
      },
      {
        fragment_id: 'legal-compliance',
        content_title: '法的情報 - 法令遵守',
        content: '法令遵守。当社は、事業活動において適用される法令・規則・社会規範を遵守し、社会的責任を果たします。コンプライアンス体制の構築と維持。',
        content_type: 'faq',
        category: 'legal',
        semantic_weight: 0.86
      },
      {
        fragment_id: 'fair-business',
        content_title: '法的情報 - 公正な事業活動',
        content: '公正な事業活動。独占禁止法、下請法等の競争法を遵守し、公正で透明な事業活動を行います。公平な競争環境の維持と透明性の確保。',
        content_type: 'faq',
        category: 'legal',
        semantic_weight: 0.84
      },
      {
        fragment_id: 'information-security',
        content_title: '法的情報 - 情報セキュリティ',
        content: '情報セキュリティ。お客様の個人情報や機密情報を適切に保護し、情報漏洩防止に努めます。セキュリティ対策の継続的改善。',
        content_type: 'faq',
        category: 'legal',
        semantic_weight: 0.86
      },
      {
        fragment_id: 'labor-standards',
        content_title: '法的情報 - 労働基準法遵守',
        content: '労働基準法遵守。従業員の労働環境改善と労働基準法の完全遵守を徹底します。働きやすい職場環境の構築。',
        content_type: 'faq',
        category: 'legal',
        semantic_weight: 0.84
      },
      {
        fragment_id: 'anti-corruption',
        content_title: '法的情報 - 反腐敗・反社会的勢力排除',
        content: '反腐敗・反社会的勢力排除。贈収賄防止と反社会的勢力との関係遮断を徹底します。クリーンな企業経営の維持。',
        content_type: 'faq',
        category: 'legal',
        semantic_weight: 0.84
      }
    ];

    console.log(`📊 法的文書Fragment ID数: ${legalFragments.length}個`);

    // Fragment IDベクトル化実行
    const results = {
      privacy: { success: false, count: 0, errors: [] as string[] },
      terms: { success: false, count: 0, errors: [] as string[] },
      legal: { success: false, count: 0, errors: [] as string[] }
    };

    // プライバシーポリシーのFragment ID処理
    const privacyFragments = legalFragments.filter(f => f.fragment_id.startsWith('privacy-'));
    const privacyResult = await fragmentVectorizer.vectorizeBlogFragments({
      post_id: 0,
      post_title: 'プライバシーポリシー',
      slug: 'privacy',
      page_path: '/privacy',
      fragments: privacyFragments,
      category: 'legal',
      seo_keywords: ['プライバシーポリシー', '個人情報保護', 'データ保護'],
      rag_sources: ['legal-documents', 'privacy-policy']
    });

    if (privacyResult.success) {
      results.privacy.success = true;
      results.privacy.count = privacyFragments.length;
      console.log('✅ プライバシーポリシーFragment ID移行完了');
    } else {
      results.privacy.errors = privacyResult.errors;
      console.error('❌ プライバシーポリシーFragment ID移行エラー:', privacyResult.errors);
    }

    // 利用規約のFragment ID処理
    const termsFragments = legalFragments.filter(f => f.fragment_id.startsWith('terms-'));
    const termsResult = await fragmentVectorizer.vectorizeBlogFragments({
      post_id: 0,
      post_title: '利用規約',
      slug: 'terms',
      page_path: '/terms',
      fragments: termsFragments,
      category: 'legal',
      seo_keywords: ['利用規約', 'サービス利用条件', '利用者義務'],
      rag_sources: ['legal-documents', 'terms-of-service']
    });

    if (termsResult.success) {
      results.terms.success = true;
      results.terms.count = termsFragments.length;
      console.log('✅ 利用規約Fragment ID移行完了');
    } else {
      results.terms.errors = termsResult.errors;
      console.error('❌ 利用規約Fragment ID移行エラー:', termsResult.errors);
    }

    // 法的情報のFragment ID処理
    const legalInfoFragments = legalFragments.filter(f => f.fragment_id.startsWith('legal-'));
    const legalResult = await fragmentVectorizer.vectorizeBlogFragments({
      post_id: 0,
      post_title: '法的情報',
      slug: 'legal',
      page_path: '/legal',
      fragments: legalInfoFragments,
      category: 'legal',
      seo_keywords: ['法的情報', '特定商取引法', 'コンプライアンス'],
      rag_sources: ['legal-documents', 'legal-information']
    });

    if (legalResult.success) {
      results.legal.success = true;
      results.legal.count = legalInfoFragments.length;
      console.log('✅ 法的情報Fragment ID移行完了');
    } else {
      results.legal.errors = legalResult.errors;
      console.error('❌ 法的情報Fragment ID移行エラー:', legalResult.errors);
    }

    const totalSuccess = results.privacy.success && results.terms.success && results.legal.success;
    const totalCount = results.privacy.count + results.terms.count + results.legal.count;
    const totalErrors = [...results.privacy.errors, ...results.terms.errors, ...results.legal.errors];

    console.log(`📊 法的文書Fragment ID移行完了:`);
    console.log(`   総Fragment ID数: ${legalFragments.length}個`);
    console.log(`   成功Fragment数: ${totalCount}個`);
    console.log(`   エラー数: ${totalErrors.length}個`);

    return NextResponse.json({
      success: totalSuccess,
      message: '法的文書Fragment ID移行完了',
      results: {
        totalFragments: legalFragments.length,
        successCount: totalCount,
        errorCount: totalErrors.length,
        details: {
          privacy: {
            success: results.privacy.success,
            count: results.privacy.count,
            fragments: privacyFragments.length,
            errors: results.privacy.errors
          },
          terms: {
            success: results.terms.success,
            count: results.terms.count,
            fragments: termsFragments.length,
            errors: results.terms.errors
          },
          legal: {
            success: results.legal.success,
            count: results.legal.count,
            fragments: legalInfoFragments.length,
            errors: results.legal.errors
          }
        },
        errors: totalErrors
      }
    });

  } catch (error) {
    console.error('❌ 法的文書Fragment ID移行エラー:', error);
    return NextResponse.json({
      success: false,
      error: '法的文書Fragment ID移行でエラーが発生しました',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 