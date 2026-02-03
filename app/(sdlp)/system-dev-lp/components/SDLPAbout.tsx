'use client'

import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'

const SdlpAboutPlayer = dynamic(
  () => import('@/components/sdlp/SdlpAboutPlayer').then((m) => m.SdlpAboutPlayer),
  {
    ssr: false,
    loading: () => (
      <div className="w-full aspect-[8/5] rounded-2xl bg-[#0A1628]/50 animate-pulse" />
    ),
  },
)

const SdlpComparisonPlayer = dynamic(
  () => import('@/components/sdlp/SdlpComparisonPlayer').then((m) => m.SdlpComparisonPlayer),
  {
    ssr: false,
    loading: () => (
      <div className="w-full aspect-[8/5] rounded-2xl bg-[#0A1628]/50 animate-pulse" />
    ),
  },
)

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
          className="max-w-6xl mx-auto mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="-mx-4 sm:mx-0 overflow-x-auto sm:overflow-visible">
            <div className="min-w-[640px] sm:min-w-0 px-4 sm:px-0">
              <div className="rounded-2xl overflow-hidden border border-slate-700/50">
                <SdlpAboutPlayer />
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="max-w-6xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="-mx-4 sm:mx-0 overflow-x-auto sm:overflow-visible">
            <div className="min-w-[640px] sm:min-w-0 px-4 sm:px-0">
              <div className="rounded-2xl overflow-hidden border border-slate-700/50">
                <SdlpComparisonPlayer />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
