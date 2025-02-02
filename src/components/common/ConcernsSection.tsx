import React from 'react';
import { Card, CardContent } from "./Card";
import Button from './Button';

const ConcernsSection = () => {
  const concerns = [
    "生成AIの可能性を感じつつも、具体的な活用方法がわからない...",
    "AI技術の進歩が速すぎて、最新情報についていけない...",
    "生成AIスキルの必要性は理解しているが、学習の糸口が見つからない...",
    "今後のキャリアにおいて、どのようなスキルが求められるのか不安...",
    "AIの台頭により、自分の仕事が将来どうなるのか心配...",
  ];

  return (
    <section 
      className="relative py-12 px-4 bg-cover bg-center bg-no-repeat" 
      style={{ backgroundImage: "url('/images/background.jpg')" }}
    >
      <div className="relative z-10 max-w-4xl mx-auto space-y-6">
      <h2 className="text-3xl md:text-4xl font-bold text-white text-center">
  あなたはこんな<br />
  <span className="text-4xl bg-gradient-to-r from-blue-600 to-cyan-500 px-2 py-1 rounded">お悩み</span> ありませんか？
</h2>
        
        <div className="overflow-hidden mb-4">
          <img
            src="/images/inner-image.jpg"
            alt="AI技術の進歩に戸惑う人々"
            className="w-full h-auto object-cover"
          />
        </div>

        <div className="space-y-4 mb-4">
          {concerns.map((concern, index) => (
            <div key={index} className="p-3 bg-white bg-opacity-70 rounded shadow-md">
              <p className="text-black">{concern}</p>
            </div>
          ))}
        </div>

        <div className="text-white space-y-4 leading-relaxed">
          <p>
            上記のような不安を抱えている方は少なくありません。
            そのような気持ちになるのも当然のことです。
          </p>
          <p>
            2022年末のChatGPTの登場、そして2023年春のGPT-4の公開により、AIの進化は加速の一途を辿っています。
          </p>
          <p>
            日々の業務や生活に追われる中で、このAI革命の波に乗り遅れてしまうのではないかと不安に感じるのは自然なことです。
          </p>
          <p>
            しかし、ここで立ち止まり、
          </p>
          <div className="inline-block bg-gradient-to-r from-blue-600 to-cyan-500 rounded px-2 py-1">
  <p className="text-white font-bold text-3xl">「現状維持」</p> {/* フォントサイズを大きくしました */}
</div>
          <p>
            を選択してよいのでしょうか？
          </p>
          <p>
            このままでは、急速に変化する時代の中で、自身のキャリアや可能性が限られてしまう恐れがあります。
          </p>
        </div>

        
        
      </div>
    </section>
  );
}

export default ConcernsSection;
