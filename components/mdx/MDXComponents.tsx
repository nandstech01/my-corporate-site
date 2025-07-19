'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Calculator, TrendingUp, Users, BarChart3 } from 'lucide-react';

// HTMLエレメント用の型定義
type HTMLProps<T = HTMLElement> = React.HTMLAttributes<T> & {
  children?: React.ReactNode;
};

// 既存のスタイリングシステムと完全統合されたMDXコンポーネント

// インタラクティブ計算機コンポーネント
interface CalculatorProps {
  baseCost: number;
  aiReduction: number;
  title?: string;
}

export const CalculatorComponent: React.FC<CalculatorProps> = ({ 
  baseCost, 
  aiReduction, 
  title = "AI効率化計算機" 
}) => {
  const [customCost, setCustomCost] = React.useState(baseCost);
  const saved = customCost * aiReduction;
  const newCost = customCost - saved;

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 my-8 border border-blue-200">
      <div className="flex items-center gap-3 mb-6">
        <Calculator className="w-6 h-6 text-blue-600" />
        <h3 className="text-xl font-bold text-gray-800">{title}</h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            月額コスト（円）
          </label>
          <input
            type="number"
            value={customCost}
            onChange={(e) => setCustomCost(Number(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-sm text-gray-600">現在のコスト</p>
            <p className="text-2xl font-bold text-gray-800">
              ¥{customCost.toLocaleString()}
            </p>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <p className="text-sm text-green-600">削減額</p>
            <p className="text-2xl font-bold text-green-700">
              -¥{saved.toLocaleString()}
            </p>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p className="text-sm text-blue-600">AI導入後</p>
            <p className="text-2xl font-bold text-blue-700">
              ¥{newCost.toLocaleString()}
            </p>
          </div>
        </div>
        
        <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-sm text-yellow-800">
            💡 年間削減効果: <strong>¥{(saved * 12).toLocaleString()}</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

// グラフコンポーネント
interface ChartProps {
  data: Array<{ name: string; value: number; color?: string }>;
  title?: string;
  type?: 'bar' | 'line';
}

export const ChartComponent: React.FC<ChartProps> = ({ 
  data, 
  title = "データ可視化", 
  type = 'bar' 
}) => {
  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <div className="bg-white rounded-xl p-6 my-8 border border-gray-200 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <BarChart3 className="w-6 h-6 text-indigo-600" />
        <h3 className="text-xl font-bold text-gray-800">{title}</h3>
      </div>
      
      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-4">
            <div className="w-24 text-sm font-medium text-gray-700">
              {item.name}
            </div>
            <div className="flex-1">
              <div className="bg-gray-200 rounded-full h-4 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(item.value / maxValue) * 100}%` }}
                  transition={{ duration: 1, delay: index * 0.1 }}
                  className={`h-full rounded-full ${
                    item.color || 'bg-blue-500'
                  }`}
                />
              </div>
            </div>
            <div className="w-16 text-sm font-bold text-gray-800 text-right">
              {item.value}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 比較表コンポーネント
interface ComparisonTableProps {
  data: {
    feature: string;
    before: string;
    after: string;
    improvement?: string;
  }[];
  title?: string;
}

export const ComparisonTableComponent: React.FC<ComparisonTableProps> = ({ 
  data, 
  title = "Before vs After比較" 
}) => {
  return (
    <div className="bg-white rounded-xl p-6 my-8 border border-gray-200 shadow-sm overflow-hidden">
      <h3 className="text-xl font-bold text-gray-800 mb-6">{title}</h3>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-700">項目</th>
              <th className="text-left py-3 px-4 font-semibold text-red-600">導入前</th>
              <th className="text-left py-3 px-4 font-semibold text-green-600">導入後</th>
              <th className="text-left py-3 px-4 font-semibold text-blue-600">改善効果</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-4 px-4 font-medium text-gray-800">{row.feature}</td>
                <td className="py-4 px-4 text-gray-600">{row.before}</td>
                <td className="py-4 px-4 text-gray-600">{row.after}</td>
                <td className="py-4 px-4">
                  {row.improvement && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {row.improvement}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// お客様の声コンポーネント
interface TestimonialProps {
  name: string;
  company: string;
  content: string;
  avatar?: string;
  rating?: number;
}

export const TestimonialComponent: React.FC<TestimonialProps> = ({ 
  name, 
  company, 
  content, 
  avatar,
  rating = 5 
}) => {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-6 my-8 border border-gray-200">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
          {avatar ? (
            <Image src={avatar} alt={name} width={48} height={48} className="rounded-full" />
          ) : (
            name.charAt(0)
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-bold text-gray-800">{name}</h4>
            <span className="text-sm text-gray-600">({company})</span>
          </div>
          
          <div className="flex items-center gap-1 mb-3">
            {[...Array(rating)].map((_, i) => (
              <span key={i} className="text-yellow-400">★</span>
            ))}
          </div>
          
          <blockquote className="text-gray-700 italic">
            "{content}"
          </blockquote>
        </div>
      </div>
    </div>
  );
};

// アラート/注意喚起コンポーネント
interface AlertProps {
  type: 'info' | 'warning' | 'success' | 'error';
  title?: string;
  children: React.ReactNode;
}

export const AlertComponent: React.FC<AlertProps> = ({ type, title, children }) => {
  const styles = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800'
  };

  const icons = {
    info: 'ℹ️',
    warning: '⚠️',
    success: '✅',
    error: '❌'
  };

  return (
    <div className={`rounded-lg border p-4 my-6 ${styles[type]}`}>
      <div className="flex items-start gap-3">
        <span className="text-lg">{icons[type]}</span>
        <div className="flex-1">
          {title && <h4 className="font-bold mb-2">{title}</h4>}
          <div>{children}</div>
        </div>
      </div>
    </div>
  );
};

// MDXコンポーネントのマッピング（型安全な定義）
export const mdxComponents = {
  Calculator: CalculatorComponent,
  Chart: ChartComponent,
  ComparisonTable: ComparisonTableComponent,
  Testimonial: TestimonialComponent,
  Alert: AlertComponent,
  // 標準HTMLエレメントのカスタマイズ（型安全な定義）
  h1: (props: HTMLProps<HTMLHeadingElement>) => (
    <h1 {...props} className="text-3xl font-bold text-gray-900 mt-8 mb-4" />
  ),
  h2: (props: HTMLProps<HTMLHeadingElement>) => (
    <h2 {...props} className="text-2xl font-bold text-gray-800 mt-6 mb-3 pb-2 border-b border-gray-200" />
  ),
  h3: (props: HTMLProps<HTMLHeadingElement>) => (
    <h3 {...props} className="text-xl font-bold text-gray-800 mt-5 mb-3" />
  ),
  h4: (props: HTMLProps<HTMLHeadingElement>) => (
    <h4 {...props} className="text-lg font-bold text-gray-800 mt-4 mb-2" />
  ),
  h5: (props: HTMLProps<HTMLHeadingElement>) => (
    <h5 {...props} className="text-base font-bold text-gray-800 mt-3 mb-2" />
  ),
  h6: (props: HTMLProps<HTMLHeadingElement>) => (
    <h6 {...props} className="text-sm font-bold text-gray-800 mt-3 mb-2" />
  ),
  p: (props: HTMLProps<HTMLParagraphElement>) => (
    <p {...props} className="text-gray-700 leading-relaxed mb-4" />
  ),
  ul: (props: HTMLProps<HTMLUListElement>) => (
    <ul {...props} className="list-disc pl-6 mb-4 space-y-2" />
  ),
  ol: (props: HTMLProps<HTMLOListElement>) => (
    <ol {...props} className="list-decimal pl-6 mb-4 space-y-2" />
  ),
  li: (props: HTMLProps<HTMLLIElement>) => (
    <li {...props} className="text-gray-700" />
  ),
  blockquote: (props: HTMLProps<HTMLQuoteElement>) => (
    <blockquote {...props} className="border-l-4 border-blue-500 pl-4 py-2 my-4 bg-blue-50 italic text-gray-700" />
  ),
  code: (props: HTMLProps<HTMLElement>) => (
    <code {...props} className="bg-gray-100 px-2 py-1 rounded text-sm font-mono" />
  ),
  pre: (props: HTMLProps<HTMLPreElement>) => (
    <pre {...props} className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-4" />
  ),
};

export default mdxComponents; 