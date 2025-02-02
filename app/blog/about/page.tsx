import { Metadata } from 'next';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'NANDS編集部について | 生成AI時代の総合情報メディア',
  description: '生成AI時代を生き抜くための総合情報メディア。副業支援、法人向けAI導入、個人向けリスキリングなど、最新のAI活用情報を提供します。',
  openGraph: {
    title: 'NANDS編集部について | 生成AI時代の総合情報メディア',
    description: '生成AI時代を生き抜くための総合情報メディア。副業支援、法人向けAI導入、個人向けリスキリングなど、最新のAI活用情報を提供します。',
    type: 'article',
  }
};

export default function AboutEditorialPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <article className="prose lg:prose-lg mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          NANDS編集部について
        </h1>

        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            私たちのミッション
          </h2>
          <p className="text-gray-600 mb-6">
            NANDS編集部は、生成AI時代を生きる全ての人々に、実践的で価値ある情報を提供することをミッションとしています。
            私たちは、AI技術の進化がもたらす変化を的確に捉え、あなたのキャリアや事業の成長を支援します。
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            編集方針
          </h2>
          <ul className="list-disc pl-6 space-y-4 text-gray-600">
            <li>
              <strong>実践重視：</strong>
              理論だけでなく、実際のビジネスシーンで活用できる具体的な情報を提供します。
            </li>
            <li>
              <strong>最新性：</strong>
              急速に進化するAI技術の最新動向を常に追跡し、タイムリーな情報をお届けします。
            </li>
            <li>
              <strong>多角的視点：</strong>
              個人、企業、社会それぞれの視点から、AIがもたらす変化と機会を分析します。
            </li>
            <li>
              <strong>信頼性：</strong>
              専門家の知見と実証データに基づいた、信頼できる情報を提供します。
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            コンテンツの特徴
          </h2>
          <div className="text-gray-600 space-y-4">
            <p>
              私たちのコンテンツは、以下の特徴を持っています：
            </p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>実務者・専門家による監修</li>
              <li>最新のAI技術トレンド分析</li>
              <li>具体的な活用事例の紹介</li>
              <li>ステップバイステップのチュートリアル</li>
              <li>業界別のAI導入ガイド</li>
            </ol>
            <p className="mt-4">
              また、私たち自身もAI技術を積極的に活用し、より質の高いコンテンツ制作を実現しています。
              ただし、すべての記事は人間の専門家が監修し、正確性と実用性を担保しています。
            </p>
          </div>
        </div>
      </article>
    </div>
  );
} 