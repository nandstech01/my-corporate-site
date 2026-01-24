'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Search,
  Code2,
  Link2,
  PenTool,
  Share2,
  Settings,
  Users,
} from 'lucide-react';

interface ClaviSidebarProps {
  onItemClick: () => void;
}

const mainMenuItems = [
  {
    icon: LayoutDashboard,
    label: 'ダッシュボード',
    labelEn: 'Dashboard',
    href: '/clavi/dashboard',
  },
  {
    icon: Search,
    label: '分析',
    labelEn: 'Analyze',
    href: '/clavi/analyses',
  },
  {
    icon: Code2,
    label: '生成',
    labelEn: 'Generate',
    href: '/clavi/generate',
  },
  {
    icon: Link2,
    label: 'リンク',
    labelEn: 'Links',
    href: '/clavi/links',
  },
  {
    icon: PenTool,
    label: 'ブログ生成',
    labelEn: 'Blog Gen',
    href: '/clavi/blog-gen',
  },
  {
    icon: Share2,
    label: 'SNS配信',
    labelEn: 'SNS',
    href: '/clavi/sns',
  },
];

const settingsMenuItems = [
  {
    icon: Settings,
    label: '設定',
    labelEn: 'Settings',
    href: '/clavi/settings',
  },
  {
    icon: Users,
    label: 'チーム',
    labelEn: 'Team',
    href: '/clavi/team',
  },
];

export default function ClaviSidebar({ onItemClick }: ClaviSidebarProps) {
  const pathname = usePathname();

  const renderMenuItem = (item: typeof mainMenuItems[0]) => {
    const Icon = item.icon;
    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={onItemClick}
        className={`relative flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors overflow-hidden ${
          isActive
            ? 'text-white bg-[#224249]'
            : 'text-[#90c1cb] hover:text-white hover:bg-[#182f34]'
        }`}
      >
        {isActive && (
          <div className="absolute inset-y-0 left-0 w-1 bg-[#06B6D4]" />
        )}
        <Icon
          className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-[#06B6D4]' : ''}`}
          strokeWidth={1.5}
        />
        <span>{item.label}</span>
      </Link>
    );
  };

  return (
    <aside className="h-full flex flex-col bg-[#102023] text-white border-r border-[#224249] shadow-2xl">
      {/* Logo */}
      <div className="flex items-center justify-center px-6 py-5 border-b border-[#224249]/50">
        <Link href="/clavi/dashboard">
          <Image
            src="/clavi-logo-dark.png"
            alt="CLAVE"
            width={120}
            height={120}
          />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-bold text-[#56737a] uppercase tracking-widest mb-2">
            Main
          </p>
          {mainMenuItems.map(renderMenuItem)}
        </div>

        <div className="space-y-1">
          <p className="px-3 text-[10px] font-bold text-[#56737a] uppercase tracking-widest mb-2">
            Settings
          </p>
          {settingsMenuItems.map(renderMenuItem)}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[#224249]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#224249] flex items-center justify-center text-xs font-bold">
            CL
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-white">CLAVI</span>
            <span className="text-xs text-[#90c1cb]">Pro Plan</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
