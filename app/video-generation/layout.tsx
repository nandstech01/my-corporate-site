import { Metadata } from 'next';
import './video-header.css';

export const metadata: Metadata = {
  title: 'AI動画生成サービス | 株式会社エヌアンドエス',
  description: 'Midjourney、Veo 3、RunwayMLなどの最新AI技術を活用した動画コンテンツ生成サービス。マーケティング効果を最大化する映像制作。',
  keywords: 'AI動画生成, Midjourney, Veo 3, RunwayML, 動画制作, AIマーケティング, 映像制作, コンテンツ生成',
  openGraph: {
    title: 'AI動画生成サービス | 株式会社エヌアンドエス',
    description: 'Midjourney、Veo 3、RunwayMLなどの最新AI技術を活用した動画コンテンツ生成サービス。',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI動画生成・API連携システム開発 | 株式会社エヌアンドエス',
    description: 'Midjourney、Veo 3、Runway ML等のAI動画生成APIを活用したシステム開発サービス。',
  },
  alternates: {
    canonical: 'https://nands.tech/video-generation',
  },
};

export default function VideoGenerationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            document.body.classList.add('video-generation-page');
            window.addEventListener('beforeunload', function() {
              document.body.classList.remove('video-generation-page');
            });
          `,
        }}
      />
      {children}
    </>
  );
} 