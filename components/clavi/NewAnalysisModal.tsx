'use client';

import { useState } from 'react';
import { X, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NewAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (url: string) => Promise<{ success: boolean; error?: string }>;
  isDark?: boolean;
}

export default function NewAnalysisModal({
  isOpen,
  onClose,
  onSubmit,
  isDark = false,
}: NewAnalysisModalProps) {
  const [url, setUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!url.trim()) {
      setError('URLを入力してください');
      return;
    }

    try {
      new URL(url);
    } catch {
      setError('有効なURLを入力してください（例: https://example.com）');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await onSubmit(url);
      if (result.success) {
        setUrl('');
        setError('');
      } else {
        setError(result.error || '分析の開始に失敗しました');
      }
    } catch {
      setError('予期しないエラーが発生しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setUrl('');
      setError('');
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 backdrop-blur-sm"
          style={{ background: 'rgba(0,0,0,0.75)' }}
          onClick={handleClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden"
          style={{
            background: isDark
              ? 'linear-gradient(135deg, rgba(12,22,25,0.95), rgba(16,32,35,0.95))'
              : 'rgba(255,255,255,0.98)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
          }}
        >
          <div
            className="flex items-center justify-between p-6 border-b"
            style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }}
          >
            <h2
              className="text-xl font-bold"
              style={{ color: isDark ? '#ffffff' : '#0f172a' }}
            >
              新規URL分析
            </h2>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                color: isDark ? '#90c1cb' : '#64748b',
                background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'
              }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: isDark ? '#6a8b94' : '#94a3b8' }}
              >
                URL
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                disabled={isSubmitting}
                className="w-full px-4 py-3 rounded-xl outline-none transition-all disabled:opacity-50"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                  color: isDark ? '#ffffff' : '#0f172a'
                }}
              />
              {error && (
                <p className="mt-2 text-sm text-red-400">{error}</p>
              )}
            </div>

            <div
              className="p-4 rounded-xl"
              style={{
                background: isDark ? 'rgba(6,182,212,0.1)' : '#ECFEFF',
                border: `1px solid ${isDark ? 'rgba(6,182,212,0.2)' : '#A5F3FC'}`
              }}
            >
              <p className="text-sm flex items-center gap-2" style={{ color: '#06B6D4' }}>
                <Sparkles className="w-4 h-4" />
                URLを入力すると、自動的に以下が抽出されます：
              </p>
              <ul
                className="mt-2 text-sm space-y-1 list-disc list-inside"
                style={{ color: isDark ? '#67E8F9' : '#0E7490' }}
              >
                <li>メタデータ（タイトル、ディスクリプション）</li>
                <li>構造化データ（JSON-LD、Microdata）</li>
                <li>見出し構造（H1-H6）</li>
                <li>品質スコア（0-100点）</li>
              </ul>
            </div>

            <div className="flex items-center gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                  color: isDark ? '#ffffff' : '#0f172a'
                }}
              >
                キャンセル
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSubmitting || !url.trim()}
                className="flex-1 px-4 py-3 rounded-xl font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ background: '#06B6D4' }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    分析中...
                  </>
                ) : (
                  '分析開始'
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
