'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, Code2, AlertTriangle, Plus, AlertCircle } from 'lucide-react';

interface MergeReport {
  conflicts: Array<{ path: string; message: string }>;
  additions: Array<{ path: string; message: string }>;
  warnings: Array<{ path: string; message: string }>;
}

interface Props {
  structuredData: any;
  mergeReport: MergeReport | undefined;
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

export default function JsonLdDeploy({ structuredData, mergeReport, isDark }: Props) {
  const [copied, setCopied] = useState(false);

  if (!structuredData) {
    return (
      <motion.div
        variants={itemVariants}
        className="rounded-xl p-8 text-center"
        style={{
          background: isDark ? '#182f34' : '#FFFFFF',
          border: `1px solid ${isDark ? '#224249' : '#E2E8F0'}`,
        }}
      >
        <Code2 className="w-8 h-8 mx-auto mb-3" style={{ color: isDark ? '#56737a' : '#94A3B8' }} />
        <p className="text-sm" style={{ color: isDark ? '#6a8b94' : '#94A3B8' }}>
          分析を実行してJSON-LDを生成
        </p>
      </motion.div>
    );
  }

  const jsonLdString = JSON.stringify(structuredData, null, 2);
  const scriptTag = `<script type="application/ld+json">\n${jsonLdString}\n</script>`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(scriptTag);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = scriptTag;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const deploySteps = [
    { step: 1, title: 'コピー', desc: '上の「Copy to Clipboard」ボタンでJSON-LDスクリプトタグをコピー' },
    { step: 2, title: '貼り付け', desc: 'HTMLの<head>タグ内、または</body>タグの直前に貼り付け' },
    { step: 3, title: '検証', desc: 'Google Rich Results Testで構造化データを検証' },
  ];

  return (
    <motion.div
      variants={itemVariants}
      className="rounded-xl p-6 space-y-5"
      style={{
        background: isDark ? '#182f34' : '#FFFFFF',
        border: `1px solid ${isDark ? '#224249' : '#E2E8F0'}`,
      }}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
          JSON-LD デプロイ
        </h2>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleCopy}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          style={{
            background: copied ? 'rgba(16,185,129,0.1)' : (isDark ? '#224249' : '#F1F5F9'),
            color: copied ? '#10B981' : '#06B6D4',
            border: `1px solid ${copied ? 'rgba(16,185,129,0.3)' : (isDark ? '#56737a' : '#E2E8F0')}`,
          }}
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copied!' : 'Copy to Clipboard'}
        </motion.button>
      </div>

      {/* Code block */}
      <div
        className="rounded-xl overflow-hidden"
        style={{
          border: `1px solid ${isDark ? '#224249' : '#E2E8F0'}`,
        }}
      >
        <div
          className="px-4 py-2 text-xs font-mono"
          style={{
            background: isDark ? '#142628' : '#F1F5F9',
            color: isDark ? '#6a8b94' : '#94A3B8',
            borderBottom: `1px solid ${isDark ? '#224249' : '#E2E8F0'}`,
          }}
        >
          application/ld+json
        </div>
        <pre
          className="p-4 text-xs font-mono leading-relaxed overflow-x-auto max-h-96 overflow-y-auto"
          style={{
            background: isDark ? '#0d1a1d' : '#FAFAFA',
            color: isDark ? '#90c1cb' : '#334155',
          }}
        >
          {scriptTag}
        </pre>
      </div>

      {/* Merge report */}
      {mergeReport && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
            マージレポート
          </h3>

          {mergeReport.conflicts.length > 0 && (
            <div className="space-y-1.5">
              {mergeReport.conflicts.map((c, i) => (
                <div
                  key={`conflict-${i}`}
                  className="flex items-start gap-2 p-2.5 rounded-lg text-xs"
                  style={{
                    background: isDark ? 'rgba(239,68,68,0.08)' : 'rgba(239,68,68,0.05)',
                    border: '1px solid rgba(239,68,68,0.2)',
                  }}
                >
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-red-500" />
                  <div>
                    <span className="font-mono font-medium text-red-500">{c.path}</span>
                    <span style={{ color: isDark ? '#90c1cb' : '#64748B' }}> - {c.message}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {mergeReport.additions.length > 0 && (
            <div className="space-y-1.5">
              {mergeReport.additions.map((a, i) => (
                <div
                  key={`addition-${i}`}
                  className="flex items-start gap-2 p-2.5 rounded-lg text-xs"
                  style={{
                    background: isDark ? 'rgba(16,185,129,0.08)' : 'rgba(16,185,129,0.05)',
                    border: '1px solid rgba(16,185,129,0.2)',
                  }}
                >
                  <Plus className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-500" />
                  <div>
                    <span className="font-mono font-medium text-emerald-500">{a.path}</span>
                    <span style={{ color: isDark ? '#90c1cb' : '#64748B' }}> - {a.message}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {mergeReport.warnings.length > 0 && (
            <div className="space-y-1.5">
              {mergeReport.warnings.map((w, i) => (
                <div
                  key={`warning-${i}`}
                  className="flex items-start gap-2 p-2.5 rounded-lg text-xs"
                  style={{
                    background: isDark ? 'rgba(245,158,11,0.08)' : 'rgba(245,158,11,0.05)',
                    border: '1px solid rgba(245,158,11,0.2)',
                  }}
                >
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-500" />
                  <div>
                    <span className="font-mono font-medium text-amber-500">{w.path}</span>
                    <span style={{ color: isDark ? '#90c1cb' : '#64748B' }}> - {w.message}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Deployment instructions */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
          デプロイ手順
        </h3>
        <div className="space-y-2">
          {deploySteps.map((s) => (
            <div key={s.step} className="flex items-start gap-3">
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                style={{
                  background: isDark ? 'rgba(6,182,212,0.15)' : '#ECFEFF',
                  color: '#06B6D4',
                }}
              >
                {s.step}
              </span>
              <div>
                <div className="text-sm font-medium" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                  {s.title}
                </div>
                <div className="text-xs" style={{ color: isDark ? '#6a8b94' : '#94A3B8' }}>
                  {s.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
