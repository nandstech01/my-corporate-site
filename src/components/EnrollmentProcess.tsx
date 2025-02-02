import Button from './common/Button';
import React from 'react';


function EnrollmentProcess() {

  return (

    <section id="受講までの流れ" className="bg-gray-100 py-16 px-4"> {/* IDを追加 */}

      <div className="max-w-4xl mx-auto">

        <h2 className="text-4xl font-bold text-center mb-12">受講までの流れ</h2>

        <div className="space-y-8">

          <div className="flex items-center space-x-4">

          <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">1</div>

            <div className="flex-grow">

              <h3 className="text-xl font-semibold mb-2">無料相談申し込み</h3>

              <Button className="bg-orange-500 hover:bg-orange-600 text-white">

                無料相談を予約する

              </Button>

              <p className="mt-2 text-sm text-gray-600">上記ボタン、もしくはページ下部のフォームからお申し込み</p>

            </div>

          </div>

          <div className="flex items-center space-x-4">

          <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">2</div>

            <div className="flex-grow">

              <h3 className="text-xl font-semibold mb-2">無料相談/個別相談</h3>

              <ul className="list-disc pl-5 space-y-1">

                <li>コースで具体的に学べる内容</li>

                <li>自分の業務に役立てられるか</li>

                <li>メンターの返信スピード etc.</li>

              </ul>

              <p className="mt-2">何でもご相談ください</p>

            </div>

          </div>

          <div className="flex items-center space-x-4">

          <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">3</div>

            <div className="flex-grow">

              <h3 className="text-xl font-semibold mb-2">受講申し込み</h3>

              <Button className="bg-orange-500 hover:bg-orange-600 text-white">

                コースに申し込む

              </Button>

              <p className="mt-2 text-sm text-gray-600">上記ボタン、もしくはページ下部のフォームからお申し込み</p>

              <p className="mt-1 text-sm text-gray-600">※無料相談なしでもお申し込み可能です</p>

            </div>

          </div>

          <div className="flex items-center space-x-4">

          <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">4</div>

            <div className="flex-grow">

              <h3 className="text-xl font-semibold mb-2">受講開始</h3>

              <p>申込時に決定した受講開始日より受講可能になります。</p>

            </div>

          </div>

        </div>

      </div>

    </section>

  )

}



export default EnrollmentProcess