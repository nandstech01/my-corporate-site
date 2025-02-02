import { Metadata } from 'next';
import Image from 'next/image';

export const metadata: Metadata = {
  title: '退職あんしん代行編集部について | 退職あんしん代行',
  description: '退職に関する専門知識を持つ編集チームが、あなたの退職に関する不安や悩みを解消するための情報を提供します。',
  openGraph: {
    title: '退職あんしん代行編集部について | 退職あんしん代行',
    description: '退職に関する専門知識を持つ編集チームが、あなたの退職に関する不安や悩みを解消するための情報を提供します。',
    type: 'article',
  }
};

export default function AboutEditorialPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <article className="prose lg:prose-lg mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          退職あんしん代行編集部について
        </h1>

        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            私たちの使命
          </h2>
          <p className="text-gray-600 mb-6">
            退職あんしん代行編集部は、退職に関する不安や悩みを抱える方々に、正確で実践的な情報を提供することを使命としています。
            私たちは、退職代行の現場で培った豊富な経験と専門知識を活かし、あなたの新しい一歩を支援します。
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            編集方針
          </h2>
          <ul className="list-disc pl-6 space-y-4 text-gray-600">
            <li>
              <strong>正確性：</strong>
              法的な観点を含め、すべての情報を慎重に確認・検証しています。
            </li>
            <li>
              <strong>実践的：</strong>
              実際の退職相談や代行業務から得た知見を基に、具体的で実用的な情報を提供します。
            </li>
            <li>
              <strong>中立性：</strong>
              読者の立場に立ち、公平で偏りのない情報提供を心がけています。
            </li>
            <li>
              <strong>最新性：</strong>
              法改正や社会情勢の変化に応じて、記事を定期的に更新しています。
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            品質への取り組み
          </h2>
          <div className="text-gray-600 space-y-4">
            <p>
              各記事は以下のプロセスを経て、慎重に作成・公開されています：
            </p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>退職相談の実例に基づくテーマ選定</li>
              <li>専門チームによる記事作成</li>
              <li>法的観点からの内容確認</li>
              <li>実務経験者による実践的アドバイスの追加</li>
              <li>最終編集と品質チェック</li>
            </ol>
            <p className="mt-4">
              また、記事の品質向上のため、最新のテクノロジーも活用しています。
              ただし、すべての記事は専門スタッフが監修し、正確性と有用性を担保しています。
            </p>
          </div>
        </div>
      </article>
    </div>
  );
} 