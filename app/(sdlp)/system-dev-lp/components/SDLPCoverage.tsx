'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Globe, Clock4, Users, Calculator, ArrowRight } from 'lucide-react'

const services = [
  {
    icon: Globe,
    title: 'ホームページ制作',
    description:
      'コーポレートサイト、ECサイト、LP制作まで。SEO対策込みで集客にも強いサイトを構築します。',
    price: '30万円〜',
    duration: '最短2週間',
    features: ['レスポンシブ対応', 'SEO対策', 'CMS搭載', '保守・運用'],
  },
  {
    icon: Clock4,
    title: '勤怠管理システム',
    description:
      '打刻・シフト管理・有給管理を一元化。既存の給与システムとの連携も可能です。',
    price: '80万円〜',
    duration: '約2ヶ月',
    features: ['打刻機能', 'シフト管理', '有給管理', '給与システム連携'],
  },
  {
    icon: Users,
    title: 'マッチングシステム',
    description:
      '人材マッチング、BtoBマッチングなど。検索・マッチングアルゴリズムの実装からUI設計まで。',
    price: '120万円〜',
    duration: '約3ヶ月',
    features: ['マッチングアルゴリズム', 'メッセージ機能', '管理画面', '決済連携'],
  },
  {
    icon: Calculator,
    title: '経理・会計システム',
    description:
      '請求書発行、経費精算、仕訳処理を自動化。freeeやMFとのAPI連携にも対応します。',
    price: '100万円〜',
    duration: '約2.5ヶ月',
    features: ['請求書発行', '経費精算', '仕訳自動化', '外部API連携'],
  },
]

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export default function SDLPCoverage() {
  return (
    <section className="py-20 bg-white" id="coverage">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-14"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={fadeInUp}
        >
          <h2 className="text-3xl font-bold text-sdlp-text mb-4">
            対応領域
          </h2>
          <p className="text-sdlp-text-secondary max-w-2xl mx-auto">
            多様な業界・システムに対応。以下は代表的なサービスの一例です。
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              className="group rounded-2xl bg-sdlp-bg-card p-8 border border-sdlp-border hover:border-sdlp-primary/30 hover:shadow-lg transition-all"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              variants={fadeInUp}
              transition={{ delay: i * 0.1 }}
            >
              <div className="flex items-start gap-4 mb-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sdlp-primary/10 text-sdlp-primary group-hover:bg-sdlp-primary group-hover:text-white transition-colors">
                  <service.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-sdlp-text">
                    {service.title}
                  </h3>
                  <p className="text-sm text-sdlp-text-secondary mt-1 leading-relaxed">
                    {service.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6 mb-5 text-sm">
                <div>
                  <span className="text-sdlp-text-secondary">費用目安: </span>
                  <span className="font-bold text-sdlp-primary">
                    {service.price}
                  </span>
                </div>
                <div>
                  <span className="text-sdlp-text-secondary">納期目安: </span>
                  <span className="font-bold text-sdlp-text">
                    {service.duration}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-5">
                {service.features.map((f) => (
                  <span
                    key={f}
                    className="rounded-full bg-sdlp-primary/5 px-3 py-1 text-xs font-medium text-sdlp-primary"
                  >
                    {f}
                  </span>
                ))}
              </div>

              <Link
                href="/system-dev-lp/questionnaire"
                className="inline-flex items-center gap-1 text-sm font-medium text-sdlp-primary hover:text-sdlp-primary-hover transition-colors"
              >
                この種類で見積もる
                <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
