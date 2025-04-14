import React from 'react';
import Card from './common/Card';
import { CardContent } from './common/Card';
import { CardHeader } from './common/Card';
import { CardTitle } from './common/Card';
import FileText from './common/FileText';
import Lightbulb from './common/Lightbulb';

const WhyChooseDmmAiCamp = () => {
  return (
    <section id="選ばれる理由" className="bg-gradient-to-r from-blue-600 to-cyan-500 py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-white mb-8">
          NANDS
          <br />
          生成AIリスキング研修が
          <br />
          選ばれる理由
        </h2>

        <Card className="mb-8">
          <CardHeader>
          <CardTitle className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
  01 Process
</CardTitle>
          </CardHeader>
          <CardContent>
            <h3 className="text-xl font-semibold mb-4">
              体系的な学習プロセス：
              <span className="bg-teal-100 px-2 py-1 rounded ml-2">基礎から実践まで確実にスキルを構築</span>
            </h3>
            <p className="text-lg mb-6">
              生成AIやプロンプト入力の基礎知識が全くない方でも安心です。NANDSでは、
              <span className="text-blue-600 font-semibold">知識を深める教材によるインプット、</span>、実務シナリオに沿った
              <span className="text-blue-600 font-semibold">課題演習、</span>、
              <span className="text-blue-600 font-semibold">メンターからのフィードバック</span>
              というプロセスを体系的に設計し、プロンプトエンジニアリングを業務で活かせる形で習得できます
            </p>

            {/* SVGを画像に置き換え */}
            <div className="flex items-start space-x-4">
              <img
                src="/images/process-image.png" // 画像のパス
                alt="プロセスの説明"
                className="w-full max-w-md mx-auto" // 幅を100%にし、最大幅を指定
                style={{ height: 'auto' }} // 高さは自動調整
              />
            </div>

          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
          <CardTitle className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
  02 Contents
</CardTitle>
          </CardHeader>
          <CardContent>
            <h3 className="text-xl font-semibold mb-4">
              明日から実践できるスキル：
              <span className="bg-teal-100 px-2 py-1 rounded ml-2">業務に直結する技術</span>
              を提供
            </h3>
            <p className="text-lg mb-6">
              各コースでは実践的な内容を網羅
            </p>
            <Card className="mb-6">
              <CardHeader>
              <CardTitle className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
  基礎コースのAIリテラシー研修
</CardTitle>
              </CardHeader>
              <CardContent>
                <h4 className="text-lg font-semibold mb-2">議事録の自動生成</h4>
                <p className="mb-4">
                  生成AIを活用した議事録の自動生成など、業務で即実践できるスキルを学びます。NANDSのリスキリング研修では、成果をすぐに実感できる具体的な技術を提供します。
                </p>
                <img
                  src="/images/meeting_scene.png" // 画像のパス
                  alt="会議の様子"
                  width={600}
                  height={300}
                  className="w-full h-48 object-cover rounded-lg"
                />
              </CardContent>
            </Card>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
          <CardTitle className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
  03 Support
</CardTitle>
          </CardHeader>
          <CardContent>
            <h3 className="text-xl font-semibold mb-4">
              徹底サポート：
              <span className="bg-teal-100 px-2 py-1 rounded ml-2">スキル習得の全過程を支える体制</span>
            </h3>
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <FileText className="w-8 h-8 text-teal-600 mt-1" />
                <div>
                  <h4 className="text-lg font-semibold mb-2">無制限のチャットサポート</h4>
                  <p>
                    受講者が抱える疑問や不安に即時対応し、理解が深まるまで徹底的にサポートします
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <Lightbulb className="w-8 h-8 text-teal-600 mt-1" />
                <div>
                  <h4 className="text-lg font-semibold mb-2">受講生の進捗に応じたサポート</h4>
                  <p>
                    個々の学習進捗やスキルレベルに応じて、最適なサポートを提供します。モチベーションを維持しながら、効果的に学習を進められます。
                  </p>
                </div>
              </div>
            </div>
            {/* サポートの画像を追加 */}
            <div className="flex items-start space-x-4 mt-6">
              <img
                src="/images/support_scene.png" // 画像のパス
                alt="サポートの様子"
                width={600}
                height={300}
                className="w-full h-48 object-cover rounded-lg"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

export default WhyChooseDmmAiCamp;