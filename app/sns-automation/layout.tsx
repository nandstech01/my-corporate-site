import { Metadata } from 'next';
import './sns-header.css';

export const metadata: Metadata = {
  title: 'SNS自動化システム開発 | 株式会社エヌアンドエス',
  description: 'X（Twitter）、Instagram、FacebookなどのSNS投稿を自動化し、マーケティング効果を最大化するシステムを開発します。リサーチ機能、分析機能も搭載。',
  keywords: 'SNS自動化, X自動化, Twitter自動化, Instagram自動化, Facebook自動化, SNSマーケティング, API連携, 投稿自動化',
  openGraph: {
    title: 'SNS自動化システム開発 | 株式会社エヌアンドエス',
    description: 'X（Twitter）、Instagram、FacebookなどのSNS投稿を自動化し、マーケティング効果を最大化するシステムを開発します。',
    type: 'website',
  },
};

function BodyClassAdder() {
  if (typeof window !== 'undefined') {
    document.body.classList.add('sns-automation-page');
    return () => {
      document.body.classList.remove('sns-automation-page');
    };
  }
  return null;
}

export default function SNSAutomationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            document.body.classList.add('sns-automation-page');
            window.addEventListener('beforeunload', function() {
              document.body.classList.remove('sns-automation-page');
            });
          `,
        }}
      />
      {children}
    </>
  );
}
