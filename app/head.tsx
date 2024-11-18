// app/head.tsx

import Head from 'next/head';

export default function CustomHead() {
  return (
    <>
      <title>株式会社NANDS | 生成AI活用・キャリア支援の総合企業</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta charSet="utf-8" />
      <meta name="format-detection" content="telephone=no" />
      
      {/* SEO関連のメタタグ */}
      <meta name="description" content="NANDSは、生成AI活用のリスキリング研修から、キャリアコンサルティング、退職支援まで、全ての働く人の「次のステージ」をサポートする総合キャリア支援企業です。2008年の設立以来、時代のニーズに応じたソリューションを提供し続けています。" />
      <meta name="keywords" content="NANDS,エヌアンドエス,AI研修,リスキリング,キャリア支援,退職支援,転職支援,生成AI,人材育成" />
      
      {/* OGP設定 */}
      <meta property="og:title" content="株式会社NANDS | 生成AI活用・キャリア支援の総合企業" />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://nands.tech/" />
      <meta property="og:image" content="https://nands.tech/images/ogp.jpg" />
      <meta property="og:site_name" content="株式会社NANDS" />
      <meta property="og:description" content="NANDSは、生成AI活用のリスキリング研修から、キャリアコンサルティング、退職支援まで、全ての働く人の「次のステージ」をサポートする総合キャリア支援企業です。" />
      
      {/* Twitter Card設定 */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="株式会社NANDS | 生成AI活用・キャリア支援の総合企業" />
      <meta name="twitter:description" content="NANDSは、生成AI活用のリスキリング研修から、キャリアコンサルティング、退職支援まで、全ての働く人の「次のステージ」をサポートする総合キャリア支援企業です。" />
      <meta name="twitter:image" content="https://nands.tech/images/ogp.jpg" />
      
      {/* その他の重要なメタタグ */}
      <meta name="robots" content="index, follow" />
      <meta name="author" content="株式会社NANDS" />
      <meta name="copyright" content="© 2024 NANDS Inc." />
      <link rel="canonical" href="https://nands.tech/about" />
      
      {/* ファビコンとアプリアイコン */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    </>
  );
}
