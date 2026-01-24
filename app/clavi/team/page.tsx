'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, UserPlus, Mail, Shield } from 'lucide-react';
import { createClient } from '@/lib/supabase/browser';
import { useClaviTheme } from '@/app/clavi/context';

interface TeamMember {
  id: string;
  email: string;
  role: string;
  joined_at: string;
}

export default function TeamPage() {
  const { theme } = useClaviTheme();
  const isDark = theme === 'dark';
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setMembers([{
            id: user.id,
            email: user.email || '',
            role: 'owner',
            joined_at: user.created_at || new Date().toISOString(),
          }]);
        }
      } catch (error) {
        // Team fetch failed
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
  }, []);

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    alert('招待機能は準備中です。');
    setInviteEmail('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#A5F3FC] border-t-[#06B6D4]" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
            チーム管理
          </h1>
          <p className="text-sm mt-0.5" style={{ color: isDark ? '#90c1cb' : '#64748B' }}>
            メンバーの管理と招待
          </p>
        </div>
      </div>

      {/* Invite form */}
      <div
        className="p-5 rounded-xl"
        style={{
          background: isDark ? '#182f34' : '#FFFFFF',
          border: `1px solid ${isDark ? '#224249' : '#E2E8F0'}`
        }}
      >
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
          <UserPlus className="w-4 h-4 text-[#06B6D4]" />
          メンバーを招待
        </h2>
        <form onSubmit={handleInvite} className="flex gap-2">
          <input
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="email@example.com"
            className="flex-1 px-3.5 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#06B6D4]/20"
            style={{
              background: isDark ? '#0c1619' : '#F8FAFC',
              border: `1px solid ${isDark ? '#224249' : '#E2E8F0'}`,
              color: isDark ? '#F8FAFC' : '#0F172A'
            }}
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-[#0891B2] hover:bg-[#0E7490] transition-colors"
          >
            招待
          </button>
        </form>
      </div>

      {/* Members list */}
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: isDark ? '#182f34' : '#FFFFFF',
          border: `1px solid ${isDark ? '#224249' : '#E2E8F0'}`
        }}
      >
        <div className="px-5 py-3 border-b flex items-center gap-2" style={{ borderColor: isDark ? '#224249' : '#E2E8F0' }}>
          <Users className="w-4 h-4 text-[#06B6D4]" />
          <h2 className="text-sm font-semibold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
            メンバー一覧
          </h2>
          <span className="text-xs px-1.5 py-0.5 rounded-md" style={{ background: isDark ? '#224249' : '#F1F5F9', color: isDark ? '#90c1cb' : '#64748B' }}>
            {members.length}
          </span>
        </div>

        {members.map((member) => (
          <div
            key={member.id}
            className="px-5 py-3.5 flex items-center justify-between"
            style={{ borderBottom: `1px solid ${isDark ? '#224249' : '#F1F5F9'}` }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: isDark ? '#224249' : '#E2E8F0' }}
              >
                <Mail className="w-4 h-4" style={{ color: isDark ? '#90c1cb' : '#64748B' }} />
              </div>
              <div>
                <div className="text-sm font-medium" style={{ color: isDark ? '#E2E8F0' : '#334155' }}>
                  {member.email}
                </div>
                <div className="text-xs" style={{ color: isDark ? '#6a8b94' : '#94A3B8' }}>
                  {new Date(member.joined_at).toLocaleDateString('ja-JP')} 参加
                </div>
              </div>
            </div>
            <span
              className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md"
              style={{
                background: isDark ? 'rgba(6,182,212,0.1)' : '#ECFEFF',
                color: '#06B6D4'
              }}
            >
              <Shield className="w-3 h-3" />
              {member.role === 'owner' ? 'オーナー' : 'メンバー'}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
