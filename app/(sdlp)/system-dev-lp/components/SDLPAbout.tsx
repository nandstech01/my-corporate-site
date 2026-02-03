'use client'

import { motion } from 'framer-motion'
import { Zap, Code2, HeartHandshake } from 'lucide-react'

const comparisons = [
  {
    icon: Zap,
    title: 'コスト構造',
    traditional: {
      label: '従来の開発会社',
      items: ['大規模オフィスの維持費', '多層の管理体制', '営業コストを価格に転嫁'],
    },
    nands: {
      label: 'N&Sの場合',
      items: [
        'リモートワーク主体で固定費最小',
        'フラットな開発チーム',
        '口コミ・実績ベースの集客',
      ],
    },
  },
  {
    icon: Code2,
    title: '開発手法',
    traditional: {
      label: '従来の開発会社',
      items: ['ウォーターフォール型で変更困難', '完成まで実物が見えない', '追加費用が頻発'],
    },
    nands: {
      label: 'N&Sの場合',
      items: [
        'アジャイル開発で柔軟対応',
        '2週間ごとに成果物を確認',
        '明確な見積もりで追加費用抑制',
      ],
    },
  },
  {
    icon: HeartHandshake,
    title: 'サポート体制',
    traditional: {
      label: '従来の開発会社',
      items: ['担当者が頻繁に変わる', '納品後は別契約', '問い合わせ対応が遅い'],
    },
    nands: {
      label: 'N&Sの場合',
      items: [
        '専任チームが最後まで担当',
        '納品後3ヶ月の無料サポート',
        '即日レスポンス',
      ],
    },
  },
]

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export default function SDLPAbout() {
  return (
    <section className="py-20 bg-sdlp-bg-card" id="about">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-14"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={fadeInUp}
        >
          <h2 className="text-3xl font-bold text-sdlp-text mb-4">
            なぜN&Sは安くて高品質なのか
          </h2>
          <p className="text-sdlp-text-secondary max-w-2xl mx-auto">
            従来の開発会社との違いを、3つの視点で比較します。
          </p>
        </motion.div>

        <div className="space-y-8">
          {comparisons.map((comp, i) => (
            <motion.div
              key={comp.title}
              className="rounded-2xl bg-white p-6 sm:p-8 border border-sdlp-border"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              variants={fadeInUp}
              transition={{ delay: i * 0.1 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sdlp-primary/10 text-sdlp-primary">
                  <comp.icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-sdlp-text">
                  {comp.title}
                </h3>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Traditional */}
                <div className="rounded-xl bg-gray-50 p-5 border border-gray-200">
                  <div className="text-sm font-semibold text-gray-500 mb-3">
                    {comp.traditional.label}
                  </div>
                  <ul className="space-y-2">
                    {comp.traditional.items.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2 text-sm text-gray-600"
                      >
                        <svg
                          className="h-4 w-4 text-gray-400 shrink-0 mt-0.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M20 12H4"
                          />
                        </svg>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* N&S */}
                <div className="rounded-xl bg-sdlp-primary/5 p-5 border border-sdlp-primary/20">
                  <div className="text-sm font-semibold text-sdlp-primary mb-3">
                    {comp.nands.label}
                  </div>
                  <ul className="space-y-2">
                    {comp.nands.items.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2 text-sm text-sdlp-text"
                      >
                        <svg
                          className="h-4 w-4 text-green-500 shrink-0 mt-0.5"
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
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
