'use client';

import { useState } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';

interface TextTestInterfaceProps {
  onSubmit: (text: string) => void;
  isProcessing: boolean;
}

export default function TextTestInterface({ onSubmit, isProcessing }: TextTestInterfaceProps) {
  const [inputText, setInputText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() && !isProcessing) {
      onSubmit(inputText.trim());
      setInputText('');
    }
  };

  const quickCommands = [
    '今日のChatGPTニュースでブログ記事を作って',
    'AIトレンドについてブログ記事を生成して',
    '最新のAI技術について記事を作成して',
    'OpenAIの最新情報でブログを書いて'
  ];

  return (
    <div className="p-4 bg-gray-50 border-t border-gray-200">
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">
          🧪 テキストテスト（音声の代わり）
        </h4>
        <p className="text-xs text-gray-500">
          音声認証の修正中です。テキストで既存API実行をテストできます。
        </p>
      </div>

      {/* クイックコマンド */}
      <div className="mb-4">
        <p className="text-xs text-gray-600 mb-2">クイックテスト:</p>
        <div className="space-y-1">
          {quickCommands.map((command, index) => (
            <button
              key={index}
              onClick={() => !isProcessing && onSubmit(command)}
              disabled={isProcessing}
              className="w-full text-left text-xs p-2 bg-white border border-gray-200 
                         rounded hover:bg-blue-50 hover:border-blue-300 transition-colors
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {command}
            </button>
          ))}
        </div>
      </div>

      {/* テキスト入力 */}
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="例: ChatGPTのブログ記事を作って"
          disabled={isProcessing}
          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                     disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isProcessing}
          className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg
                     hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500
                     disabled:opacity-50 disabled:cursor-not-allowed
                     flex items-center space-x-1"
        >
          <PaperAirplaneIcon className="w-4 h-4" />
          <span>実行</span>
        </button>
      </form>

      {isProcessing && (
        <div className="mt-3 flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm text-blue-600">処理中...</span>
        </div>
      )}
    </div>
  );
} 