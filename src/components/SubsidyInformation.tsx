import React from 'react';
import Card from './common/Card';
import { CardContent } from './common/Card';

function SubsidyInformation() {

  return (

    <section className="bg-white py-16 px-4">

<div className="max-w-4xl mx-auto">

<h2 className="text-3xl font-bold text-center mb-12">延長オプションのご案内</h2>



        

        <h3 className="text-xl font-bold mt-12 mb-6">さらなる学びと成長のために、コース期間を4週間単位で延長可能。柔軟に対応いたします</h3>

        

        

        <h3 className="text-2xl font-bold mt-12 mb-6">延長料金</h3>

        <Card>

          <CardContent>

            <div className="text-center">

            <div className="inline-block border border-teal-500 px-4 py-2 rounded-full text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 font-semibold mb-4">
  各コース・プラン共通
</div>

<div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">64,000円<span className="text-base font-normal text-gray-600">（税込）</span></div>

            </div>

            <ul className="list-disc pl-5 space-y-2 mt-4">

              <li>4週単位で延長が可能です。</li>

              <li>受講最終日の1週間前まで延長申請が可能です。</li>

              <li>支払い方法はクレジットカードによる一括払いのみとなります。</li>

            </ul>

          </CardContent>

        </Card>

      </div>

    </section>

  )

}



export default SubsidyInformation