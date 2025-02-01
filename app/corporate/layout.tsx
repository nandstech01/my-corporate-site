import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'NANDS - AI活用支援サービス',
  description: 'AIエージェントとエンジニアコンサルタントによる二重サポート。企業のAI活用を包括的に支援します。',
};

export default function CorporateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 