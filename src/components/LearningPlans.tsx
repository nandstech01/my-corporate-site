import Card from './common/Card';
import CardContent from './common/CardContent';
import CardHeader from './common/CardHeader';
import CardTitle from './common/CardTitle';

import React from 'react';


function LearningPlans() {

  return (

    <section className="bg-gray-100 py-16 px-4">

      <div className="max-w-4xl mx-auto">

        <h2 className="text-4xl font-bold text-center mb-12">学習プラン</h2>

        <div className="space-y-8">

          <Card>

            <CardHeader>

              <CardTitle className="text-2xl font-bold text-teal-600">単体プラン</CardTitle>

            </CardHeader>

            <CardContent>

              <div className="grid grid-cols-2 gap-4">

                <div className="font-semibold">4週間プラン</div>

                <div>

                  <div className="font-bold text-xl">198,000円</div>

                  <div className="text-sm text-gray-600">分割払い例 17,400円〜/月*1</div>

                  <div className="mt-2 bg-pink-100 text-pink-700 p-2 rounded-md text-sm">

                    リスキリング補助金適用で<br />最大70%還元

                  </div>

                  <div className="mt-2 font-bold text-2xl text-pink-600">72,000円</div>

                </div>

                <div className="col-span-2 mt-4">

                  <div className="grid grid-cols-2 gap-2 text-sm">

                    <div>課題フィードバック</div>

                    <div>無制限</div>

                    <div>チャットサポート</div>

                    <div>無制限</div>

                    <div>学習時間</div>

                    <div>約31.75〜34.5時間</div>

                  </div>

                </div>

              </div>

            </CardContent>

          </Card>

          <Card>

            <CardHeader>

              <CardTitle className="text-2xl font-bold text-blue-600">セットプラン</CardTitle>

            </CardHeader>

            <CardContent>

              <p className="mb-4 text-center">基礎コースと職業別コースとのお得なセットプラン</p>

              <div className="grid grid-cols-2 gap-4">

                <div className="font-semibold">6週間プラン</div>

                <div>

                  <div className="font-bold text-xl">297,000円</div>

                  <div className="text-sm text-gray-600">分割払い例 26,200円〜/月*1</div>

                  <div className="mt-2 bg-pink-100 text-pink-700 p-2 rounded-md text-sm">

                    リスキリング補助金適用で<br />最大70%還元

                  </div>

                  <div className="mt-2 font-bold text-2xl text-pink-600">108,000円</div>

                </div>

                <div className="col-span-2 mt-4">

                  <div className="grid grid-cols-2 gap-2 text-sm">

                    <div>課題フィードバック</div>

                    <div>無制限</div>

                    <div>チャットサポート</div>

                    <div>無制限</div>

                    <div>学習時間</div>

                    <div>約64.5〜66時間</div>

                  </div>

                </div>

              </div>

            </CardContent>

          </Card>

        </div>

      </div>

    </section>

  )

}



export default LearningPlans