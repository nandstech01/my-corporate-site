import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import CardContent from '@/components/common/CardContent';
import CardHeader from '@/components/common/CardHeader';
import CardTitle from '@/components/common/CardTitle';
import CardFooter from '@/components/common/CardFooter';
import CheckCircle from '@/components/common/CheckCircle';
import Link from 'next/link';

import React from 'react';

const CourseList = () => {
  const courses = [
    {
      title: (
        <div className="text-center space-y-2">
          <span>SEO支援サービス</span>
          <br />
          <span>助成金活用プラン</span>
        </div>
      ),
      description: "費用の80%が補助される特別支援制度",
      features: [
        "最新のSEO戦略導入支援",
        "専門家による伴走サポート",
        "助成金申請のサポート",
      ],
      price: (
        <div className="space-y-2">
          <div className="text-3xl font-bold">実質負担20%</div>
          <div className="text-sm text-blue-600 font-semibold">
            100万円の施策が
            <br />
            実質20万円で実施可能
          </div>
        </div>
      ),
      duration: "令和8年度末まで",
      link: "/seo-support",
    },
    {
      title: (
        <div className="text-center space-y-2">
          <span>基礎コース</span>
          <br />
          <span>AIリテラシー研修</span>
        </div>
      ),
      description: "生成AIを使いこなすための基礎を学ぶ",
      features: [
        "プロンプトエンジニアリングの基礎",
        "ChatGPTの効果的な使用方法",
        "ビジネスでの活用事例",
      ],
      price: "¥99,000",
      duration: "4週間",
    },
    {
      title: (
        <div className="text-center space-y-2">
          <span>応用コース</span>
          <br />
          <span>実務プロンプトエンジニアリング</span>
        </div>
      ),
      description: "ビジネスシーンでのプロンプト作成",
      features: [
        "AIモデルの選択と統合",
        "実務で役立つプロンプトの設計",
        "業務改善に活かすスキルを身につける",
      ],
      price: "¥149,000",
      duration: "6週間",
    },
    {
      title: (
        <div className="text-center space-y-2">
          <span>エキスパートコース</span>
          <br />
          <span>キャリアアップ</span>
          <br />
          <span>プロンプトエンジニア</span>
        </div>
      ),
      description: "企業でのAI導入戦略を立案する",
      features: [
        "AI導入のロードマップ作成",
        "コスト分析と ROI 計算",
        "チーム編成と人材育成計画",
      ],
      price: "¥199,000",
      duration: "8週間",
    },
    {
      title: (
        <div className="text-center space-y-2">
          <span>副業コース</span>
          <br />
          <span>SEOライティング</span>
          <br />
          <span>スペシャリスト</span>
        </div>
      ),
      description: "ChatGPTを活用した効率的なEOライティング",
      features: [
        "ChatGPTを使った記事作成テクニック",
        "SEOに最適化された文章構成",
        "クライアント獲得と単価設定戦略",
      ],
      price: (
        <div className="space-y-2">
          <div className="text-3xl font-bold">¥128,000</div>
          <div className="text-sm text-blue-600 font-semibold">
            または
            <br />
            年間プラン ¥12,800/月
            <br />
            <span className="text-xs text-gray-600">（12ヶ月一括 ¥153,600）</span>
          </div>
        </div>
      ),
      duration: "",
      link: "/fukugyo",
    },
  ];

  return (
    <section id="プラン・料金" className="bg-gray-50 py- px-4"> {/* IDを追加 */}
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">コース一覧</h2> {/* 見出し下の余白を狭く */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course, index) => (
            <Card key={index} className="w-full max-w-sm mx-auto">
              <CardHeader className="text-center">
                <CardTitle className="text-xl font-bold">{course.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-center text-muted-foreground">{course.description}</p>
                <ul className="space-y-2">
                  {course.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-blue-500 mr-2" /> {/* 色を青に変更 */}
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="flex flex-col items-center space-y-4">
                <div className="text-3xl font-bold mt-6">{course.price}</div>
                <div className="text-sm text-muted-foreground">{course.duration}</div>
                {course.link ? (
                  <Link href={course.link} className="w-full">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      詳細を見る
                    </Button>
                  </Link>
                ) : (
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    申し込む
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CourseList;