'use client'

import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { Zap, Code2, HeartHandshake, Brain } from 'lucide-react'

const SdlpAboutPlayer = dynamic(
  () => import('@/components/sdlp/SdlpAboutPlayer').then((m) => m.SdlpAboutPlayer),
  {
    ssr: false,
    loading: () => (
      <div className="w-full aspect-[8/5] rounded-2xl bg-[#0A1628]/50 animate-pulse" />
    ),
  },
)

const comparisons = [
  {
    icon: Brain,
    title: 'AI活用力',
    traditional: {
      label: '従来の開発会社',
      items: ['AI非対応、または別途高額オプション', 'AI人材不足で外注依存', '最新モデルへの追従が遅い'],
    },
    nands: {
      label: 'NANDSの場合',
      items: [
        'ChatGPT・Claude等のAI実装が標準',
        'AI専門エンジニアが社内に在籍',
        '最新AIモデルを即座に検証・導入',
      ],
    },
  },
  {
    icon: Zap,
    title: 'コスト構造',
    traditional: {
      label: '従来の開発会社',
      items: ['大規模オフィスの維持費', '多層の管理体制', '手作業中心で工数が膨大'],
    },
    nands: {
      label: 'NANDSの場合',
      items: [
        'AI活用で開発工数を40%削減',
        'フラットな開発チーム',
        'AIコードレビューで品質担保',
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
      label: 'NANDSの場合',
      items: [
        'AI支援アジャイルで高速開発',
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
      label: 'NANDSの場合',
      items: [
        '専任チームが最後まで担当',
        '納品後3ヶ月の無料サポート',
        'AI監視で障害を未然に検知',
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
            なぜNANDSは安くて高品質なのか
          </h2>
          <p className="text-sdlp-text-secondary max-w-2xl mx-auto">
            AI活用と効率的な体制で、従来の開発会社との違いを生み出しています。
          </p>
        </motion.div>

        <motion.div
          className="max-w-3xl mx-auto mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="rounded-2xl overflow-hidden border border-slate-700/50">
            <SdlpAboutPlayer />
          </div>
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

                {/* NANDS */}
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
