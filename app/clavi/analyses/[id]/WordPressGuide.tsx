'use client';

import { motion } from 'framer-motion';
import { Globe, Download, Key, RefreshCw, Code2 } from 'lucide-react';

interface Props {
  isDark: boolean;
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }
  }
};

const steps = [
  {
    icon: Download,
    title: 'プラグインをインストール',
    desc: 'WordPressの管理画面から「CLAVI Structured Data」プラグインをインストール',
  },
  {
    icon: Key,
    title: 'APIキーを貼り付け',
    desc: 'プラグイン設定画面にCLAVIのAPIキーを入力して接続',
  },
  {
    icon: RefreshCw,
    title: '自動同期',
    desc: '分析結果が自動的にWordPressの各ページに適用される',
  },
];

export default function WordPressGuide({ isDark }: Props) {
  return (
    <motion.div
      variants={itemVariants}
      className="rounded-xl p-6 space-y-5"
      style={{
        background: isDark ? '#182f34' : '#FFFFFF',
        border: `1px solid ${isDark ? '#224249' : '#E2E8F0'}`,
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{
            background: isDark ? 'rgba(6,182,212,0.1)' : '#ECFEFF',
          }}
        >
          <Globe className="w-5 h-5" style={{ color: '#06B6D4' }} />
        </div>
        <div>
          <h2 className="text-lg font-semibold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
            WordPress プラグイン
          </h2>
          <p className="text-xs" style={{ color: isDark ? '#6a8b94' : '#94A3B8' }}>
            ワンクリックで構造化データを適用
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <div key={i} className="flex items-start gap-3">
              <span
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                style={{
                  background: isDark ? 'rgba(6,182,212,0.15)' : '#ECFEFF',
                  color: '#06B6D4',
                }}
              >
                {i + 1}
              </span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" style={{ color: '#06B6D4' }} />
                  <span className="text-sm font-medium" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                    {step.title}
                  </span>
                </div>
                <p className="text-xs mt-1" style={{ color: isDark ? '#6a8b94' : '#94A3B8' }}>
                  {step.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <a
        href="https://wordpress.org/plugins/clavi-structured-data/"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-[#0891B2] hover:bg-[#0E7490] transition-colors"
      >
        <Download className="w-4 h-4" />
        プラグインをダウンロード
      </a>

      <div
        className="flex items-start gap-2 p-3 rounded-xl text-xs"
        style={{
          background: isDark ? '#142628' : '#F8FAFC',
          border: `1px solid ${isDark ? '#1e3a3f' : '#F1F5F9'}`,
          color: isDark ? '#6a8b94' : '#94A3B8',
        }}
      >
        <Code2 className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#06B6D4' }} />
        <span>
          または、上の「JSON-LD デプロイ」セクションからJSON-LDをコピーして、テーマのheader.phpに手動で貼り付けることもできます。
        </span>
      </div>
    </motion.div>
  );
}
