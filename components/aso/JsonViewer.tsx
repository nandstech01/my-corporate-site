'use client';

import { useState } from 'react';
import { Copy, Check, ChevronDown, ChevronRight, Code2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface JsonViewerProps {
  data: any;
  title?: string;
  isDark?: boolean;
}

export default function JsonViewer({ data, title, isDark = true }: JsonViewerProps) {
  const [copied, setCopied] = useState(false);
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());
  const [showRaw, setShowRaw] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleExpand = (key: string) => {
    const newExpanded = new Set(expandedKeys);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedKeys(newExpanded);
  };

  const expandAll = () => {
    const allKeys = new Set<string>();
    const collectKeys = (obj: any, prefix: string) => {
      if (Array.isArray(obj)) {
        allKeys.add(prefix);
        obj.forEach((item, index) => {
          if (typeof item === 'object' && item !== null) {
            collectKeys(item, `${prefix}[${index}]`);
          }
        });
      } else if (typeof obj === 'object' && obj !== null) {
        allKeys.add(prefix);
        Object.keys(obj).forEach((key) => {
          if (typeof obj[key] === 'object' && obj[key] !== null) {
            collectKeys(obj[key], `${prefix}.${key}`);
          }
        });
      }
    };
    collectKeys(data, 'root');
    setExpandedKeys(allKeys);
  };

  const collapseAll = () => {
    setExpandedKeys(new Set());
  };

  const renderValue = (value: any, key: string, depth: number = 0): JSX.Element => {
    if (value === null) {
      return <span style={{ color: isDark ? '#64748b' : '#94a3b8' }}>null</span>;
    }

    if (typeof value === 'boolean') {
      return <span style={{ color: '#a855f7' }}>{value.toString()}</span>;
    }

    if (typeof value === 'number') {
      return <span style={{ color: '#22d3ee' }}>{value}</span>;
    }

    if (typeof value === 'string') {
      return <span style={{ color: '#4ade80' }}>&quot;{value}&quot;</span>;
    }

    if (Array.isArray(value)) {
      const isExpanded = expandedKeys.has(key);

      if (value.length === 0) {
        return <span style={{ color: isDark ? '#64748b' : '#94a3b8' }}>[]</span>;
      }

      return (
        <div>
          <button
            onClick={() => toggleExpand(key)}
            className="inline-flex items-center gap-1 transition-colors"
            style={{ color: isDark ? '#94a3b8' : '#64748b' }}
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
            <span style={{ color: '#f59e0b' }}>[{value.length}]</span>
          </button>
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="ml-4 pl-4 mt-1 space-y-1"
                style={{
                  borderLeft: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
                }}
              >
                {value.map((item, index) => (
                  <div key={index}>
                    <span style={{ color: isDark ? '#64748b' : '#94a3b8' }}>{index}: </span>
                    {renderValue(item, `${key}[${index}]`, depth + 1)}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }

    if (typeof value === 'object') {
      const isExpanded = expandedKeys.has(key);
      const keys = Object.keys(value);

      if (keys.length === 0) {
        return <span style={{ color: isDark ? '#64748b' : '#94a3b8' }}>{'{}'}</span>;
      }

      return (
        <div>
          <button
            onClick={() => toggleExpand(key)}
            className="inline-flex items-center gap-1 transition-colors"
            style={{ color: isDark ? '#94a3b8' : '#64748b' }}
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
            <span style={{ color: '#f59e0b' }}>{'{'}{keys.length}{'}'}</span>
          </button>
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="ml-4 pl-4 mt-1 space-y-1"
                style={{
                  borderLeft: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
                }}
              >
                {keys.map((k) => (
                  <div key={k}>
                    <span style={{ color: '#22d3ee' }}>&quot;{k}&quot;</span>
                    <span style={{ color: isDark ? '#64748b' : '#94a3b8' }}>: </span>
                    {renderValue(value[k], `${key}.${k}`, depth + 1)}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }

    return <span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>{String(value)}</span>;
  };

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: isDark
          ? 'rgba(255,255,255,0.03)'
          : 'rgba(255,255,255,0.8)',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`
      }}
    >
      {/* ヘッダー */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{
          background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
          borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'
        }}
      >
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4" style={{ color: '#a855f7' }} />
          <h3
            className="text-sm font-semibold"
            style={{ color: isDark ? '#ffffff' : '#0f172a' }}
          >
            {title || 'JSON Data'}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {/* 展開/折りたたみボタン */}
          <button
            onClick={expandAll}
            className="px-2 py-1 text-xs rounded-lg transition-colors"
            style={{
              color: isDark ? '#94a3b8' : '#64748b',
              background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'
            }}
          >
            展開
          </button>
          <button
            onClick={collapseAll}
            className="px-2 py-1 text-xs rounded-lg transition-colors"
            style={{
              color: isDark ? '#94a3b8' : '#64748b',
              background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'
            }}
          >
            折りたたみ
          </button>

          {/* RAW表示切替 */}
          <button
            onClick={() => setShowRaw(!showRaw)}
            className="px-2 py-1 text-xs rounded-lg transition-colors"
            style={{
              color: showRaw ? '#a855f7' : (isDark ? '#94a3b8' : '#64748b'),
              background: showRaw
                ? 'rgba(168,85,247,0.1)'
                : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)')
            }}
          >
            RAW
          </button>

          {/* コピーボタン */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-all"
            style={{
              background: copied
                ? 'rgba(34,211,238,0.1)'
                : 'linear-gradient(135deg, rgba(168,85,247,0.1), rgba(34,211,238,0.1))',
              color: copied ? '#22d3ee' : '#a855f7',
              border: `1px solid ${copied ? 'rgba(34,211,238,0.3)' : 'rgba(168,85,247,0.3)'}`
            }}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                コピー完了!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                コピー
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* JSON表示 */}
      <div className="p-4 overflow-x-auto max-h-[500px] overflow-y-auto">
        {showRaw ? (
          <pre
            className="font-mono text-sm whitespace-pre-wrap"
            style={{ color: isDark ? '#94a3b8' : '#64748b' }}
          >
            {JSON.stringify(data, null, 2)}
          </pre>
        ) : (
          <div className="font-mono text-sm">
            {renderValue(data, 'root')}
          </div>
        )}
      </div>
    </div>
  );
}
