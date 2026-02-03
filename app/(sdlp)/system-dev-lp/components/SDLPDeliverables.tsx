'use client'

import { motion } from 'framer-motion'
import { FileText, FileCheck, Download } from 'lucide-react'

const deliverables = [
  {
    icon: FileText,
    title: '概算見積書',
    description:
      'プロジェクト全体の費用を工程別に明確化。機能単位の費用内訳で、優先度に応じた段階的な開発プランもご提案します。',
    features: ['工程別の費用内訳', '機能単位のコスト明細', '段階開発プラン'],
    color: 'sdlp-primary',
  },
  {
    icon: FileCheck,
    title: '要件定義書',
    description:
      'システムの全体像を可視化する設計書。画面遷移図やデータ構造を含む、開発の基盤となるドキュメントを無料でご提供。',
    features: ['画面遷移図', 'データ構造設計', '機能要件一覧'],
    color: 'sdlp-accent',
  },
]

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export default function SDLPDeliverables() {
  return (
    <section className="py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-14"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={fadeInUp}
        >
          <h2 className="text-3xl font-bold text-sdlp-text mb-4">
            無料でお渡しする成果物
          </h2>
          <p className="text-sdlp-text-secondary max-w-2xl mx-auto">
            お見積もり後、以下の資料を無料でお渡しします。
            他社との比較検討にもご活用ください。
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {deliverables.map((item, i) => (
            <motion.div
              key={item.title}
              className="rounded-2xl bg-sdlp-bg-card p-8 border border-sdlp-border hover:shadow-lg transition-shadow"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              variants={fadeInUp}
              transition={{ delay: i * 0.1 }}
            >
              <div
                className={`inline-flex h-12 w-12 items-center justify-center rounded-xl mb-5 ${
                  item.color === 'sdlp-primary'
                    ? 'bg-sdlp-primary/10 text-sdlp-primary'
                    : 'bg-sdlp-accent/10 text-sdlp-accent'
                }`}
              >
                <item.icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-sdlp-text mb-3">
                {item.title}
              </h3>
              <p className="text-sdlp-text-secondary text-sm mb-5 leading-relaxed">
                {item.description}
              </p>
              <ul className="space-y-2 mb-6">
                {item.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-2 text-sm text-sdlp-text"
                  >
                    <svg
                      className="h-4 w-4 text-green-500 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className="flex items-center gap-2 text-sm font-medium text-sdlp-primary hover:text-sdlp-primary-hover transition-colors"
              >
                <Download className="h-4 w-4" />
                サンプルを見る
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
