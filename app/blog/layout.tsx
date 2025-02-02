import './blog.css';
import Header from '../../components/common/Header';

export const metadata = {
  title: 'ブログ | NANDS TECH - 生成AI時代の総合ソリューション',
  description: '副業支援、法人向けAI導入支援、個人向けリスキリングなど、生成AIを活用したキャリアと技術の最新情報をお届けします。',
  keywords: '生成AI, ChatGPT, 副業支援, 法人向けAI, リスキリング, AI導入, DX推進',
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </>
  );
} 