'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/browser';
import { useClaviTheme } from '@/app/clavi/context';
import { Building2, ArrowRight, Loader2 } from 'lucide-react';

export default function OnboardPage() {
  const [tenantName, setTenantName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { theme } = useClaviTheme();
  const isDark = theme === 'dark';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantName.trim()) {
      setError('組織名を入力してください');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const response = await fetch('/api/clavi/onboard', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({ tenant_name: tenantName.trim() }),
      });

      if (response.ok) {
        // Re-login to refresh JWT with tenant claims
        await supabase.auth.refreshSession();
        router.push('/clavi/dashboard');
      } else {
        const data = await response.json();
        setError(data.error || 'オンボーディングに失敗しました');
      }
    } catch {
      setError('ネットワークエラーが発生しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-[70vh] flex items-center justify-center"
    >
      <div
        className="w-full max-w-md rounded-2xl p-8"
        style={{
          background: isDark ? '#182f34' : '#FFFFFF',
          border: `1px solid ${isDark ? '#224249' : '#E2E8F0'}`,
        }}
      >
        <div className="text-center mb-6">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: isDark ? 'rgba(6,182,212,0.1)' : '#ECFEFF' }}
          >
            <Building2 className="w-6 h-6 text-[#06B6D4]" />
          </div>
          <h1
            className="text-xl font-bold"
            style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}
          >
            組織を作成
          </h1>
          <p
            className="text-sm mt-1"
            style={{ color: isDark ? '#90c1cb' : '#64748B' }}
          >
            CLAVIを使い始めるために組織名を設定してください
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              className="block text-xs font-medium mb-1.5"
              style={{ color: isDark ? '#90c1cb' : '#64748B' }}
            >
              組織名
            </label>
            <input
              type="text"
              value={tenantName}
              onChange={(e) => setTenantName(e.target.value)}
              placeholder="例: 株式会社〇〇"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-colors"
              style={{
                background: isDark ? '#102023' : '#F8FAFC',
                border: `1px solid ${isDark ? '#224249' : '#E2E8F0'}`,
                color: isDark ? '#E2E8F0' : '#334155',
              }}
              autoFocus
            />
          </div>

          {error && (
            <p className="text-xs text-red-500">{error}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !tenantName.trim()}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-white bg-[#06B6D4] hover:bg-[#0891B2] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                始める
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
