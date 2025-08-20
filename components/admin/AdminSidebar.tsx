'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { 
  HomeIcon, 
  DocumentTextIcon, 
  PlusIcon, 
  StarIcon,
  BoltIcon,
  GlobeAltIcon,
  CubeIcon,
  PlayIcon,
  TrashIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  LinkIcon
} from '@heroicons/react/24/outline';
import VoiceAgentButton from './VoiceAgent/VoiceAgentButton';
import VoiceAgentModalV2 from './VoiceAgent/VoiceAgentModalV2';

interface AdminSidebarProps {
  onItemClick?: () => void;
}

export default function AdminSidebar({ onItemClick }: AdminSidebarProps) {
  const pathname = usePathname();
  const [isVoiceAgentOpen, setIsVoiceAgentOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<{ [key: string]: boolean }>({
    '記事管理': true,
    'トリプルRAG': true,
    'パートナー管理': false
  });

  const toggleMenu = (menuName: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuName]: !prev[menuName]
    }));
  };

  const navigation = [
    {
      name: 'ダッシュボード',
      href: '/admin/dashboard',
      icon: HomeIcon,
      current: pathname === '/admin/dashboard'
    },
    {
      name: '記事管理',
      icon: DocumentTextIcon,
      children: [
        {
          name: '記事一覧',
          href: '/admin/posts',
          current: pathname === '/admin/posts'
        },
        {
          name: '新規作成',
          href: '/admin/posts/new',
          current: pathname === '/admin/posts/new'
        }
      ]
    },
    {
      name: 'トリプルRAG',
      icon: CubeIcon,
      children: [
        {
          name: '自社RAG',
          href: '/admin/company-rag',
          current: pathname === '/admin/company-rag'
        },
        {
          name: 'トレンドRAG',
          href: '/admin/trend-rag',
          current: pathname === '/admin/trend-rag'
        },
        {
          name: 'YouTube RAG',
          href: '/admin/youtube-rag',
          current: pathname === '/admin/youtube-rag'
        },
        {
          name: 'コンテンツ生成',
          href: '/admin/content-generation',
          current: pathname === '/admin/content-generation'
        },
        {
          name: 'RAG削除管理',
          href: '/admin/rag-cleanup',
          current: pathname === '/admin/rag-cleanup'
        },
        {
          name: 'ディープリンク計測',
          href: '/admin/deeplink-analytics/overview',
          current: pathname === '/admin/deeplink-analytics/overview'
        },
        {
          name: '類似度追跡',
          href: '/admin/deeplink-analytics/similarity',
          current: pathname === '/admin/deeplink-analytics/similarity'
        },
        {
          name: 'AI引用計測',
          href: '/admin/deeplink-analytics/quotations',
          current: pathname === '/admin/deeplink-analytics/quotations'
        },
        {
          name: 'SNS・動画統合',
          href: '/admin/deeplink-analytics/sns-integration',
          current: pathname === '/admin/deeplink-analytics/sns-integration'
        },
        {
          name: '自動最適化',
          href: '/admin/deeplink-analytics/optimization',
          current: pathname === '/admin/deeplink-analytics/optimization'
        },
        {
          name: '🤖 AI検索アクセス検出',
          href: '/admin/deeplink-analytics/ai-detection',
          current: pathname === '/admin/deeplink-analytics/ai-detection'
        }
      ]
    },
    {
      name: 'レビュー管理',
      href: '/admin/reviews',
      icon: StarIcon,
      current: pathname === '/admin/reviews'
    },
    {
      name: 'パートナー管理',
      icon: UserGroupIcon,
      children: [
        {
          name: 'パートナー一覧',
          href: '/admin/partners',
          current: pathname === '/admin/partners'
        },
        {
          name: '申請承認',
          href: '/admin/partners/applications',
          current: pathname === '/admin/partners/applications'
        },
        {
          name: '売上入力',
          href: '/admin/partners/sales',
          current: pathname === '/admin/partners/sales'
        },
        {
          name: 'レポート',
          href: '/admin/partners/reports',
          current: pathname === '/admin/partners/reports'
        }
      ]
    }
  ];

  return (
    <div className="flex flex-col w-64 h-full bg-gray-900 border-r border-gray-800 shadow-2xl">
      {/* ヘッダー高さ分のスペース */}
      <div className="h-16"></div>
      
      {/* ロゴエリア */}
      <div className="flex items-center justify-center h-12 sm:h-16 px-4 bg-gradient-to-r from-purple-600 to-blue-600">
        <Link href="/admin/dashboard" className="text-lg sm:text-xl font-bold text-white" onClick={onItemClick}>
          <span className="flex items-center space-x-2">
            <BoltIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="hidden sm:inline">NANDS Admin</span>
            <span className="sm:hidden">NANDS</span>
          </span>
        </Link>
      </div>

      {/* 音声AIエージェント */}
      <div className="px-4 py-3 sm:py-4 border-b border-gray-800">
        <VoiceAgentButton 
          onActivate={() => setIsVoiceAgentOpen(true)}
        />
      </div>

      {/* ナビゲーション */}
      <nav className="flex-1 px-3 sm:px-4 py-4 sm:py-6 space-y-1 sm:space-y-2 overflow-y-auto">
        {navigation.map((item) => (
          <div key={item.name}>
            {item.children ? (
              // サブメニューがある場合
              <div className="space-y-1">
                <button
                  onClick={() => toggleMenu(item.name)}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <div className="flex items-center">
                    <item.icon className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 text-gray-400" />
                    <span className="text-xs sm:text-sm">{item.name}</span>
                  </div>
                  {expandedMenus[item.name] ? (
                    <ChevronDownIcon className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronRightIcon className="w-4 h-4 text-gray-400" />
                  )}
                </button>
                {expandedMenus[item.name] && (
                  <div className="ml-6 sm:ml-8 space-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={onItemClick}
                        className={`${
                          child.current
                            ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                            : 'text-gray-400 hover:text-white hover:bg-gray-800'
                        } block px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200`}
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              // 通常のメニューアイテム
              <Link
                href={item.href}
                onClick={onItemClick}
                className={`${
                  item.current
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                } flex items-center px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200`}
              >
                <item.icon className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                {item.name}
              </Link>
            )}
          </div>
        ))}
      </nav>

      {/* フッター情報 */}
      <div className="p-3 sm:p-4 border-t border-gray-800">
        <div className="text-xs text-gray-500 text-center">
          <p className="text-purple-400 font-semibold text-xs sm:text-sm">NANDS Admin</p>
          <p className="mt-1 text-gray-400 text-xs">Triple RAG v2.0.0</p>
        </div>
      </div>

      {/* 音声AIエージェントモーダル */}
      <VoiceAgentModalV2 
        isOpen={isVoiceAgentOpen}
        onClose={() => setIsVoiceAgentOpen(false)}
      />
    </div>
  );
}
