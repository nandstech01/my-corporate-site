'use client';

import { useState, useMemo } from 'react';
import { ChartBarIcon, PhotoIcon, XMarkIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface H2Section {
  title: string;
  index: number;
  selected: boolean;
}

interface DiagramResult {
  h2Title: string;
  h2Index: number;
  imageUrl: string;
  success: boolean;
  error?: string;
}

interface H2DiagramGeneratorProps {
  title: string;
  content: string;
  onDiagramsGenerated?: (diagrams: DiagramResult[]) => void;
}

export default function H2DiagramGenerator({
  title,
  content,
  onDiagramsGenerated
}: H2DiagramGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<DiagramResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());

  // H2セクションを抽出
  const h2Sections = useMemo(() => {
    const sections: H2Section[] = [];
    const lines = content.split('\n');
    let index = 0;
    
    for (const line of lines) {
      const match = line.match(/^##\s+(.+)$/);
      if (match) {
        sections.push({
          title: match[1].trim(),
          index: index++,
          selected: false
        });
      }
    }
    
    return sections;
  }, [content]);

  // 選択トグル
  const toggleSelection = (index: number) => {
    const newSet = new Set(selectedIndices);
    if (newSet.has(index)) {
      newSet.delete(index);
    } else {
      if (newSet.size < 5) { // 最大5つまで
        newSet.add(index);
      }
    }
    setSelectedIndices(newSet);
  };

  // 全選択/解除
  const toggleAll = () => {
    if (selectedIndices.size === Math.min(h2Sections.length, 5)) {
      setSelectedIndices(new Set());
    } else {
      setSelectedIndices(new Set(h2Sections.slice(0, 5).map(s => s.index)));
    }
  };

  // 図解生成
  const handleGenerate = async () => {
    if (selectedIndices.size === 0) {
      setError('図解を生成するH2セクションを選択してください');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setResults([]);

    try {
      const response = await fetch('/api/generate-h2-diagram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          title,
          h2Indices: Array.from(selectedIndices),
          maxDiagrams: 5
        })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || '図解生成に失敗しました');
      }

      setResults(result.diagrams || []);
      
      if (onDiagramsGenerated) {
        onDiagramsGenerated(result.diagrams);
      }

      console.log(`✅ H2図解生成完了: ${result.generatedCount}/${result.totalH2s}件`);
    } catch (err: any) {
      console.error('H2図解生成エラー:', err);
      setError(err.message || '図解生成に失敗しました');
    } finally {
      setIsGenerating(false);
    }
  };

  // Markdownに画像を挿入
  const getMarkdownInsert = (diagram: DiagramResult) => {
    return `\n![${diagram.h2Title}の図解](${diagram.imageUrl})\n`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="mt-4">
      {/* 展開ボタン */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center px-4 py-2 border border-blue-300 rounded-md shadow-sm text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
      >
        <ChartBarIcon className="w-4 h-4 mr-2" />
        {isOpen ? 'H2図解生成を閉じる' : 'H2図解を生成 📊'}
      </button>

      {/* パネル */}
      {isOpen && (
        <div className="mt-4 bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-5 space-y-4 shadow-sm">
          {/* ヘッダー */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-blue-800 flex items-center">
              <ChartBarIcon className="w-5 h-5 mr-2" />
              H2セクション図解生成（Nano Banana Pro）
            </h3>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* 説明 */}
          <p className="text-xs text-gray-600">
            H2見出しを選択すると、その内容を理解した図解画像をAIが生成します。
            最大5つまで同時に生成できます。
          </p>

          {/* H2セクション一覧 */}
          {h2Sections.length === 0 ? (
            <div className="text-center py-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-700 text-sm">
                H2セクション（## で始まる見出し）が見つかりません
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {h2Sections.length}件のH2セクション（{selectedIndices.size}件選択中）
                </span>
                <button
                  type="button"
                  onClick={toggleAll}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  {selectedIndices.size === Math.min(h2Sections.length, 5) ? '全解除' : '全選択（最大5件）'}
                </button>
              </div>
              
              <div className="max-h-48 overflow-y-auto space-y-1 bg-white rounded-lg p-2 border border-gray-200">
                {h2Sections.map((section) => (
                  <label
                    key={section.index}
                    className={`flex items-center p-2 rounded cursor-pointer transition-colors ${
                      selectedIndices.has(section.index)
                        ? 'bg-blue-100 border border-blue-300'
                        : 'hover:bg-gray-50 border border-transparent'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedIndices.has(section.index)}
                      onChange={() => toggleSelection(section.index)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      disabled={!selectedIndices.has(section.index) && selectedIndices.size >= 5}
                    />
                    <span className="ml-2 text-sm text-gray-700 truncate">
                      {section.index + 1}. {section.title}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* 生成ボタン */}
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating || selectedIndices.size === 0 || h2Sections.length === 0}
            className="w-full inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                図解生成中... (1件あたり約30秒)
              </>
            ) : (
              <>
                <ChartBarIcon className="w-5 h-5 mr-2" />
                📊 {selectedIndices.size}件の図解を生成
              </>
            )}
          </button>

          {/* エラー表示 */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-700 text-sm font-medium">エラー</p>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          )}

          {/* 生成結果 */}
          {results.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700">生成結果</h4>
              {results.map((diagram, idx) => (
                <div
                  key={idx}
                  className={`rounded-lg p-3 ${
                    diagram.success
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-red-50 border border-red-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center">
                      {diagram.success ? (
                        <CheckCircleIcon className="w-5 h-5 text-green-600 mr-2" />
                      ) : (
                        <XMarkIcon className="w-5 h-5 text-red-600 mr-2" />
                      )}
                      <span className="text-sm font-medium">
                        {diagram.h2Title}
                      </span>
                    </div>
                    {diagram.success && (
                      <button
                        type="button"
                        onClick={() => copyToClipboard(getMarkdownInsert(diagram))}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Markdownコピー
                      </button>
                    )}
                  </div>
                  
                  {diagram.success ? (
                    <img
                      src={diagram.imageUrl}
                      alt={`${diagram.h2Title}の図解`}
                      className="mt-2 w-full rounded-lg shadow-sm"
                    />
                  ) : (
                    <p className="mt-1 text-sm text-red-600">{diagram.error}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

