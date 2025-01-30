import React from 'react';
import { motion } from 'framer-motion';
import { AnimationConfig } from '../types';
import { PHI } from '../animations';

interface MessageProps {
  animations: AnimationConfig;
}

const Message: React.FC<MessageProps> = ({ animations }) => {
  const { sectionSpacing, sectionGap, elementGap } = animations;

  const messages = [
    {
      content: "2008年の設立以来、「人々の生活を豊かにするために」というビジョンのもと、多くの挑戦を重ねてまいりました。\n\n2020年以降、世界的な変革の波に対応し、これまで培ってきた経験と技術をもとに、働く人々のキャリアや生活を支援する新たなソリューションの提供を決意しました。",
      isHeading: true
    },
    {
      content: "その中で私たちが特に重視したのが、「本当に自分らしい働き方」を実現するための支援です。退職代行サービスを通じて、より良い環境での再スタートをサポートし、同時にスキルアップ支援を提供することで、一人ひとりが望むキャリアを実現できる環境を整えています。\n\nまた、給付金サポートサービスでは、困難な状況にある方々に寄り添い、本来受けられるべき支援を確実に受けられるようサポートしています。これは単なる手続き支援ではなく、新たな一歩を踏み出すための大切な基盤づくだと考えています。",
      isHeading: false
    },
    {
      content: "特にAI技術においては、私自身が新たな挑戦として習得に取り組み、「AIリスキリング研修」を新たにスタートさせることができました。これからの時代に不可欠なスキルを支えるプログラムを提供することで、次の世代の働く人々のキャリアを後押ししていきます。\n\n私たちは、一人ひとりの「働く」に真摯に向き合い、より良い未来への扉を開く支援を続けていきます。これからも「すべての働く人々に次のチャンスを提供する」という信念のもと、変化する時代のニーズに応え続けてまいります。",
      isHeading: false
    },
    {
      content: "そして、私たちが最も大切にしているのは、「一人ひとりの人生に寄り添う」という姿勢です。退職は単なる離職ではなく、新たな人生の章を開く重要な転換点です。その瞬間に、私たちは最大限の敬意と配慮を持って、あなたの決断をサポートいたします。\n\nこれからも、テクノロジーの進化と人間味のあるサポートを両立させながら、すべての働く人々が自分らしく輝ける社会の実現に向けて、邁進してまいります。",
      isHeading: false
    }
  ];

  return (
    <motion.section 
      {...animations.fadeIn}
      className={`${sectionSpacing} relative overflow-hidden`}
      style={{
        marginBottom: `${sectionGap}px`,
        padding: `${elementGap}px 0`
      }}
    >
      {/* 洗練された背景エフェクト */}
      <div className="absolute inset-0">
        {/* 高級感のあるグラデーション背景 */}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-gray-50/50 to-white" />
        
        {/* 動的なグリッドパターン */}
        <motion.div
          animate={{
            opacity: [0.03, 0.05, 0.03],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut"
          }}
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px'
          }}
        />

        {/* エレガントな装飾ライン */}
        <div className="absolute left-0 right-0 top-20 h-px bg-gradient-to-r from-transparent via-black/10 to-transparent" />
        <div className="absolute left-0 right-0 bottom-20 h-px bg-gradient-to-r from-transparent via-black/10 to-transparent" />
      </div>

      <div className="max-w-4xl mx-auto px-4 relative">
        <motion.h2
          initial={{ opacity: 0, y: 20 / PHI }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="text-4xl font-bold text-center mb-20 !text-black"
        >
          メッセージ
        </motion.h2>

        <div className="space-y-12">
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 / PHI }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2, duration: 0.8 }}
            >
              <p className={`whitespace-pre-line leading-relaxed ${
                message.isHeading 
                  ? 'text-xl font-medium !text-black/90'
                  : 'text-lg !text-black/80'
              }`}>
                {message.content}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 / PHI }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="text-right mt-12"
        >
          <p className="text-lg font-medium !text-black">代表取締役</p>
          <p className="text-2xl font-bold !text-black mt-2">原田 賢治</p>
        </motion.div>

        {/* 装飾的な要素 */}
        <div className="absolute top-0 right-0 w-40 h-40 opacity-5">
          <motion.div
            animate={{
              rotate: [0, 360],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              repeatType: "reverse",
            }}
            className="w-full h-full border-2 border-black rounded-full"
          />
        </div>
      </div>
    </motion.section>
  );
};

export default Message; 