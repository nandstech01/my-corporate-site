'use client'

import React from 'react';
import Link from 'next/link';

const AboutNands = () => {
  return (
    <div className="py-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold mb-8 text-center">About NANDS</h2>
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h3 className="text-2xl font-semibold mb-4">
            NANDS,  <br />
            NEXT SOLUTIONS
          </h3>
          <p className="text-xl mb-6 text-black" style={{ fontWeight: 'bold' }}>"次のステージへ"</p>
          <p className="mb-4">
            全ての働く人たちに、次のステージへを合言葉に
          </p>
          <p className="mb-4">
            エヌアンドエスは、未来を切り開くワークテックソリューションを提供します。
          </p> 
          <p className="mb-4">
            私たちは、生成AIを中心に活用したリスキリング研修をはじめ、退職、転職支援まで一貫して対応する総合キャリア支援企業です。
          </p>
          <p className="mb-4">
            技術とキャリアを繋ぐ次世代企業として、どの段階でも安心して頼れるパートナーを目指します。
          </p>
          <Link href="/about" className="mt-6 bg-blue-600 text-white hover:bg-blue-500 font-bold py-2 px-4 rounded-full shadow-md">
            View More
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AboutNands; 