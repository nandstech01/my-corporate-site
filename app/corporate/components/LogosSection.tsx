'use client';

import React from 'react';
import Image from 'next/image';

export default function LogosSection() {
  return (
    <section className="py-8 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-center mb-6">
          ご利用いただいている企業（一部抜粋）
        </h2>
        <div className="flex flex-wrap justify-center items-center gap-6">
          <Image
            src="/images/google-office.jpg"
            alt="企業ロゴ1"
            width={120}
            height={40}
            className="object-contain"
          />
          <Image
            src="/images/amazon-warehouse.jpg"
            alt="企業ロゴ2"
            width={120}
            height={40}
            className="object-contain"
          />
          <Image
            src="/images/meeting_scene.png"
            alt="企業ロゴ3"
            width={120}
            height={40}
            className="object-contain"
          />
        </div>
      </div>
    </section>
  );
} 