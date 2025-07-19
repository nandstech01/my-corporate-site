import React from 'react';
import { Metadata } from 'next';
import EnhancedMarkdownContent from '@/components/mdx/EnhancedMarkdownContent';
import Breadcrumbs from '@/app/components/common/Breadcrumbs';

export const metadata: Metadata = {
  title: 'MDX機能デモンストレーション | NANDS',
  description: 'インタラクティブなMDXコンポーネントの動作確認とデモンストレーション',
  keywords: ['MDX', 'React', 'Markdown', 'インタラクティブコンテンツ']
};

// MDX機能をデモンストレーションするコンテンツ
const demoContent = `# MDX機能デモンストレーション

MDXを使用することで、通常のMarkdownにReactコンポーネントを埋め込むことができます。

## 🧮 インタラクティブ計算機

以下は、MDXで埋め込まれたAI効率化計算機の例です：

<Calculator baseCost={100000} aiReduction={0.3} title="AI導入効果計算機" />

この計算機は完全にインタラクティブで、リアルタイムで計算結果が更新されます。

## 📊 データ可視化

MDXではデータをビジュアルに表現することも可能です：

<Chart 
  title="AI導入効果の比較"
  data={[
    { name: "コスト削減", value: 85, color: "bg-green-500" },
    { name: "時間短縮", value: 70, color: "bg-blue-500" },
    { name: "品質向上", value: 90, color: "bg-purple-500" },
    { name: "満足度", value: 95, color: "bg-yellow-500" }
  ]}
/>

## 📋 比較表

Before/After の比較も簡単に表現できます：

<ComparisonTable 
  title="AI導入前後の変化"
  data={[
    {
      feature: "作業時間",
      before: "8時間/日",
      after: "3時間/日",
      improvement: "62.5%削減"
    },
    {
      feature: "エラー率",
      before: "5.2%",
      after: "0.8%",
      improvement: "85%改善"
    },
    {
      feature: "顧客満足度",
      before: "78%",
      after: "94%",
      improvement: "16%向上"
    },
    {
      feature: "月間コスト",
      before: "¥500,000",
      after: "¥200,000",
      improvement: "60%削減"
    }
  ]}
/>

## 💬 お客様の声

実際の導入事例も効果的に表示できます：

<Testimonial 
  name="田中様"
  company="株式会社テクノロジー"
  content="MDXを使ったコンテンツは非常にわかりやすく、特に計算機能が便利です。導入効果を具体的に確認できるのが素晴らしいです。"
  rating={5}
/>

<Testimonial 
  name="佐藤様"
  company="イノベーション合同会社"
  content="インタラクティブな要素があることで、従来の静的な資料よりもはるかに理解しやすくなりました。"
  rating={5}
/>

## ⚠️ アラートとお知らせ

重要な情報も見やすく表示できます：

<Alert type="info" title="MDX導入のポイント">
MDXを導入することで、静的なコンテンツをインタラクティブに変換できます。特にデータ可視化や計算機能が効果的です。
</Alert>

<Alert type="warning" title="注意事項">
MDXコンテンツの作成には、Markdownの知識に加えてReactの基本的な理解が必要です。
</Alert>

<Alert type="success" title="導入メリット">
- ユーザーエンゲージメントの向上
- コンテンツの差別化
- インタラクティブな体験の提供
- SEO効果の維持
</Alert>

## 🔗 従来のMarkdown機能も完全サポート

MDXは既存のMarkdown機能を完全にサポートしています：

### コードブロック

\`\`\`typescript
interface CalculatorProps {
  baseCost: number;
  aiReduction: number;
  title?: string;
}

export const Calculator: React.FC<CalculatorProps> = ({ 
  baseCost, 
  aiReduction, 
  title 
}) => {
  // インタラクティブな計算ロジック
  const [cost, setCost] = useState(baseCost);
  const savings = cost * aiReduction;
  
  return (
    <div className="calculator">
      {/* 計算機のUI */}
    </div>
  );
};
\`\`\`

### テーブル

| 機能 | Markdown | MDX |
|------|----------|-----|
| 見出し | ✅ | ✅ |
| リスト | ✅ | ✅ |
| テーブル | ✅ | ✅ |
| コードブロック | ✅ | ✅ |
| **Reactコンポーネント** | ❌ | ✅ |
| **インタラクティブ要素** | ❌ | ✅ |

### 引用

> MDXを使用することで、従来の静的なコンテンツに動的な要素を加えることができ、ユーザーエクスペリエンスが大幅に向上します。

## まとめ

MDXの導入により、以下のメリットが得られます：

1. **エンゲージメント向上**: インタラクティブな要素でユーザーの関心を引く
2. **差別化**: 競合他社との差別化を図る
3. **効果測定**: 計算機などで具体的な効果を示す
4. **ユーザビリティ**: 直感的で使いやすいコンテンツ

既存のMarkdown機能は完全に保持されるため、段階的な移行が可能です。`;

export default function MDXShowcasePage() {
  const breadcrumbItems = [
    { name: 'ホーム', path: '/' },
    { name: 'デモ', path: '/demo' },
    { name: 'MDX機能デモ', path: '/demo/mdx-showcase' }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs customItems={breadcrumbItems} />
      
      <article className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-lg mb-6">
            <h1 className="text-2xl font-bold">MDX機能デモンストレーション</h1>
            <p className="mt-2 opacity-90">
              インタラクティブなコンテンツで体験する次世代のMarkdown
            </p>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800">
              💡 <strong>このページについて:</strong> 
              このページは既存のMarkdownContentコンポーネントを拡張した
              EnhancedMarkdownContentを使用して表示されています。
              既存の機能は完全に保持しながら、MDX機能が追加されています。
            </p>
          </div>
        </div>

        <EnhancedMarkdownContent 
          content={demoContent} 
          isMDX={true}
        />
      </article>
    </div>
  );
} 