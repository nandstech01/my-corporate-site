'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Users, UserPlus, Mail, Shield, Clock, XCircle, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useClaviTheme } from '@/app/clavi/context';

interface TeamMember {
  user_id: string;
  email: string;
  role: string;
  joined_at: string;
}

interface Invitation {
  id: string;
  target_email: string;
  target_role: string;
  status: string;
  created_at: string;
  expires_at: string;
}

type InviteRole = 'member' | 'admin';

export default function TeamPage() {
  const { theme } = useClaviTheme();
  const isDark = theme === 'dark';

  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<InviteRole>('member');
  const [inviting, setInviting] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setError(null);
    try {
      const [membersRes, invitationsRes] = await Promise.all([
        fetch('/api/clavi/members'),
        fetch('/api/clavi/invitations'),
      ]);

      if (membersRes.ok) {
        const membersData = await membersRes.json();
        setMembers(Array.isArray(membersData) ? membersData : []);
      }

      if (invitationsRes.ok) {
        const invData = await invitationsRes.json();
        setInvitations(invData.invitations || []);
      } else if (invitationsRes.status === 403) {
        // User may not have permission to view invitations - that's ok
        setInvitations([]);
      }
    } catch {
      setError('データの取得に失敗しました。');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setInviting(true);
    setInviteError(null);
    setInviteSuccess(null);

    try {
      const res = await fetch('/api/clavi/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_email: inviteEmail.trim(),
          target_role: inviteRole,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setInviteError(data.error || '招待の送信に失敗しました。');
        return;
      }

      setInviteSuccess(`${inviteEmail} に招待を送信しました。`);
      setInviteEmail('');
      setInviteRole('member');
      fetchData();
    } catch {
      setInviteError('招待の送信に失敗しました。');
    } finally {
      setInviting(false);
    }
  };

  const handleRevokeInvitation = async (invitationId: string) => {
    try {
      const res = await fetch('/api/clavi/invitations', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invitation_id: invitationId }),
      });

      if (res.ok) {
        fetchData();
      }
    } catch {
      // Silent fail for revoke
    }
  };

  const getRoleBadge = (role: string) => {
    const labels: Record<string, string> = {
      owner: 'オーナー',
      admin: '管理者',
      member: 'メンバー',
    };
    const colors: Record<string, { bg: string; text: string }> = {
      owner: { bg: isDark ? 'rgba(6,182,212,0.1)' : '#ECFEFF', text: '#06B6D4' },
      admin: { bg: isDark ? 'rgba(139,92,246,0.1)' : '#F5F3FF', text: '#8B5CF6' },
      member: { bg: isDark ? 'rgba(100,116,139,0.1)' : '#F1F5F9', text: isDark ? '#90c1cb' : '#64748B' },
    };
    const c = colors[role] || colors.member;
    return (
      <span
        className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md"
        style={{ background: c.bg, color: c.text }}
      >
        <Shield className="w-3 h-3" />
        {labels[role] || role}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; bg: string; text: string }> = {
      pending: {
        label: '保留中',
        bg: isDark ? 'rgba(245,158,11,0.1)' : '#FFFBEB',
        text: isDark ? '#FBBF24' : '#D97706',
      },
      accepted: {
        label: '承認済',
        bg: isDark ? 'rgba(16,185,129,0.1)' : '#ECFDF5',
        text: isDark ? '#6EE7B7' : '#059669',
      },
      expired: {
        label: '期限切れ',
        bg: isDark ? 'rgba(100,116,139,0.1)' : '#F1F5F9',
        text: isDark ? '#6a8b94' : '#94A3B8',
      },
      revoked: {
        label: '取消済',
        bg: isDark ? 'rgba(239,68,68,0.1)' : '#FEF2F2',
        text: isDark ? '#FCA5A5' : '#DC2626',
      },
    };
    const c = config[status] || config.pending;
    return (
      <span
        className="text-[10px] font-medium px-1.5 py-0.5 rounded"
        style={{ background: c.bg, color: c.text }}
      >
        {c.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#A5F3FC] border-t-[#06B6D4]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 mx-auto mb-2" style={{ color: '#EF4444' }} />
          <p className="text-sm" style={{ color: isDark ? '#90c1cb' : '#64748B' }}>{error}</p>
          <button
            onClick={() => { setLoading(true); fetchData(); }}
            className="mt-3 text-sm font-medium text-[#06B6D4] hover:underline"
          >
            再試行
          </button>
        </div>
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
        <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-2">
          <input
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="email@example.com"
            required
            className="flex-1 px-3.5 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#06B6D4]/20"
            style={{
              background: isDark ? '#0c1619' : '#F8FAFC',
              border: `1px solid ${isDark ? '#224249' : '#E2E8F0'}`,
              color: isDark ? '#F8FAFC' : '#0F172A'
            }}
          />
          <select
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value as InviteRole)}
            className="px-3 py-2 rounded-lg text-sm outline-none"
            style={{
              background: isDark ? '#0c1619' : '#F8FAFC',
              border: `1px solid ${isDark ? '#224249' : '#E2E8F0'}`,
              color: isDark ? '#F8FAFC' : '#0F172A',
            }}
          >
            <option value="member">メンバー</option>
            <option value="admin">管理者</option>
          </select>
          <button
            type="submit"
            disabled={inviting}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-[#0891B2] hover:bg-[#0E7490] transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            {inviting ? '送信中...' : '招待'}
          </button>
        </form>
        {inviteSuccess && (
          <div className="flex items-center gap-2 mt-3 text-xs" style={{ color: '#10B981' }}>
            <CheckCircle2 className="w-3.5 h-3.5" />
            {inviteSuccess}
          </div>
        )}
        {inviteError && (
          <div className="flex items-center gap-2 mt-3 text-xs" style={{ color: '#EF4444' }}>
            <AlertCircle className="w-3.5 h-3.5" />
            {inviteError}
          </div>
        )}
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

        {members.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <Users className="w-6 h-6 mx-auto mb-2" style={{ color: isDark ? '#6a8b94' : '#94A3B8' }} />
            <p className="text-sm" style={{ color: isDark ? '#6a8b94' : '#94A3B8' }}>メンバーはまだいません</p>
          </div>
        ) : (
          members.map((member) => (
            <div
              key={member.user_id}
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
              {getRoleBadge(member.role)}
            </div>
          ))
        )}
      </div>

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <div
          className="rounded-xl overflow-hidden"
          style={{
            background: isDark ? '#182f34' : '#FFFFFF',
            border: `1px solid ${isDark ? '#224249' : '#E2E8F0'}`
          }}
        >
          <div className="px-5 py-3 border-b flex items-center gap-2" style={{ borderColor: isDark ? '#224249' : '#E2E8F0' }}>
            <Clock className="w-4 h-4 text-[#06B6D4]" />
            <h2 className="text-sm font-semibold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
              招待一覧
            </h2>
            <span className="text-xs px-1.5 py-0.5 rounded-md" style={{ background: isDark ? '#224249' : '#F1F5F9', color: isDark ? '#90c1cb' : '#64748B' }}>
              {invitations.length}
            </span>
          </div>

          {invitations.map((inv) => (
            <div
              key={inv.id}
              className="px-5 py-3.5 flex items-center justify-between"
              style={{ borderBottom: `1px solid ${isDark ? '#224249' : '#F1F5F9'}` }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: isDark ? '#224249' : '#E2E8F0' }}
                >
                  <Mail className="w-4 h-4" style={{ color: isDark ? '#6a8b94' : '#94A3B8' }} />
                </div>
                <div>
                  <div className="text-sm font-medium" style={{ color: isDark ? '#E2E8F0' : '#334155' }}>
                    {inv.target_email}
                  </div>
                  <div className="text-xs" style={{ color: isDark ? '#6a8b94' : '#94A3B8' }}>
                    {new Date(inv.created_at).toLocaleDateString('ja-JP')} 招待 / {inv.target_role === 'admin' ? '管理者' : 'メンバー'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(inv.status)}
                {inv.status === 'pending' && (
                  <button
                    onClick={() => handleRevokeInvitation(inv.id)}
                    className="p-1 rounded hover:bg-red-500/10 transition-colors"
                    title="招待を取り消す"
                  >
                    <XCircle className="w-4 h-4" style={{ color: isDark ? '#6a8b94' : '#94A3B8' }} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
