export const getStructuredData = () => {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "株式会社NANDS",
    "alternateName": "エヌアンドエス",
    "url": "https://nands.tech",
    "logo": "https://nands.tech/images/logo.png",
    "description": "生成AI活用のリスキリング研修から、キャリアコンサルティング、退職支援まで、全ての働く人の「次のステージ」をサポートする総合キャリア支援企業です。",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "道玄坂1-10-8 渋谷道玄坂東急ビル2F-C",
      "addressLocality": "渋谷区",
      "addressRegion": "東京都",
      "postalCode": "150-0043",
      "addressCountry": "JP"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "0120-558-551",
      "contactType": "customer service",
      "email": "contact@nands.tech"
    },
    "sameAs": [
      "https://twitter.com/nands_tech",
      "https://www.facebook.com/nands.tech",
      "https://www.linkedin.com/company/nands-tech"
    ]
  };
}; 