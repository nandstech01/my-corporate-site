import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '法人向けAIリスキリング研修・業務効率化支援 | 株式会社エヌアンドエス',
  description: '株式会社エヌアンドエスの法人向けAIリスキリング研修・業務効率化支援サービス。生成AIを活用した業務改善、DX推進、人材育成を通じて企業の競争力を高めます。企業規模や業種に合わせたカスタマイズ研修で、組織全体のAIリテラシー向上を実現。',
};

export default function CorporateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 