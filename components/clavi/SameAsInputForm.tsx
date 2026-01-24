'use client';

import { useState, useEffect } from 'react';
import { Twitter, Linkedin, Youtube, Github, Globe, Plus, X, Check, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SameAsSettings, OrganizationSameAs, AuthorSameAs } from '@/lib/clavi/types/tenant-settings';

interface SameAsInputFormProps {
  sameAs: SameAsSettings | undefined;
  onChange: (sameAs: SameAsSettings) => void;
  isDark: boolean;
}

interface UrlInputProps {
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  isDark: boolean;
  error?: string;
}

function UrlInput({ label, icon, value, onChange, placeholder, isDark, error }: UrlInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="space-y-1.5">
      <label
        className="flex items-center gap-2 text-sm font-medium"
        style={{ color: isDark ? '#90c1cb' : '#64748b' }}
      >
        {icon}
        {label}
      </label>
      <div className="relative">
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="w-full px-4 py-2.5 rounded-xl text-sm transition-all"
          style={{
            background: isDark ? '#0c1619' : '#F8FAFC',
            border: `1px solid ${
              error
                ? 'rgba(239,68,68,0.5)'
                : isFocused
                ? 'rgba(6,182,212,0.5)'
                : isDark
                ? '#224249'
                : '#E2E8F0'
            }`,
            color: isDark ? '#F8FAFC' : '#0F172A',
            outline: 'none',
          }}
        />
        {value && !error && (
          <Check
            className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
            style={{ color: '#22c55e' }}
          />
        )}
        {error && (
          <AlertCircle
            className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
            style={{ color: '#ef4444' }}
          />
        )}
      </div>
      {error && (
        <p className="text-xs" style={{ color: '#ef4444' }}>
          {error}
        </p>
      )}
    </div>
  );
}

export default function SameAsInputForm({ sameAs, onChange, isDark }: SameAsInputFormProps) {
  const [localSameAs, setLocalSameAs] = useState<SameAsSettings>(
    sameAs || { organization: {}, author: {} }
  );
  const [customUrls, setCustomUrls] = useState<string[]>(
    sameAs?.organization?.custom || []
  );
  const [newCustomUrl, setNewCustomUrl] = useState('');

  useEffect(() => {
    setLocalSameAs(sameAs || { organization: {}, author: {} });
    setCustomUrls(sameAs?.organization?.custom || []);
  }, [sameAs]);

  const updateOrganizationField = (field: keyof OrganizationSameAs, value: string) => {
    const updated: SameAsSettings = {
      ...localSameAs,
      organization: {
        ...localSameAs.organization,
        [field]: value || undefined,
      },
    };
    setLocalSameAs(updated);
    onChange(updated);
  };

  const updateAuthorField = (field: keyof AuthorSameAs, value: string) => {
    const updated: SameAsSettings = {
      ...localSameAs,
      author: {
        ...localSameAs.author,
        [field]: value || undefined,
      },
    };
    setLocalSameAs(updated);
    onChange(updated);
  };

  const addCustomUrl = () => {
    if (newCustomUrl && isValidUrl(newCustomUrl)) {
      const updated = [...customUrls, newCustomUrl];
      setCustomUrls(updated);
      setNewCustomUrl('');
      const updatedSameAs: SameAsSettings = {
        ...localSameAs,
        organization: {
          ...localSameAs.organization,
          custom: updated,
        },
      };
      setLocalSameAs(updatedSameAs);
      onChange(updatedSameAs);
    }
  };

  const removeCustomUrl = (index: number) => {
    const updated = customUrls.filter((_, i) => i !== index);
    setCustomUrls(updated);
    const updatedSameAs: SameAsSettings = {
      ...localSameAs,
      organization: {
        ...localSameAs.organization,
        custom: updated.length > 0 ? updated : undefined,
      },
    };
    setLocalSameAs(updatedSameAs);
    onChange(updatedSameAs);
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div className="space-y-6">
      {/* 組織SNS */}
      <div>
        <h3
          className="text-base font-semibold mb-4"
          style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}
        >
          組織のソーシャルリンク
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <UrlInput
            label="Twitter / X"
            icon={<Twitter className="w-4 h-4" style={{ color: '#1DA1F2' }} />}
            value={localSameAs.organization?.twitter || ''}
            onChange={(v) => updateOrganizationField('twitter', v)}
            placeholder="https://twitter.com/your_company"
            isDark={isDark}
          />
          <UrlInput
            label="LinkedIn (Company)"
            icon={<Linkedin className="w-4 h-4" style={{ color: '#0A66C2' }} />}
            value={localSameAs.organization?.linkedin || ''}
            onChange={(v) => updateOrganizationField('linkedin', v)}
            placeholder="https://linkedin.com/company/your_company"
            isDark={isDark}
          />
          <UrlInput
            label="YouTube"
            icon={<Youtube className="w-4 h-4" style={{ color: '#FF0000' }} />}
            value={localSameAs.organization?.youtube || ''}
            onChange={(v) => updateOrganizationField('youtube', v)}
            placeholder="https://youtube.com/@your_channel"
            isDark={isDark}
          />
          <UrlInput
            label="GitHub (Organization)"
            icon={<Github className="w-4 h-4" style={{ color: isDark ? '#F8FAFC' : '#24292e' }} />}
            value={localSameAs.organization?.github || ''}
            onChange={(v) => updateOrganizationField('github', v)}
            placeholder="https://github.com/your_org"
            isDark={isDark}
          />
        </div>

        {/* カスタムURL */}
        <div className="mt-4">
          <label
            className="flex items-center gap-2 text-sm font-medium mb-2"
            style={{ color: isDark ? '#90c1cb' : '#64748b' }}
          >
            <Globe className="w-4 h-4" style={{ color: '#06B6D4' }} />
            その他のURL
          </label>

          <AnimatePresence>
            {customUrls.map((url, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 mb-2"
              >
                <div
                  className="flex-1 px-3 py-2 rounded-lg text-sm truncate"
                  style={{
                    background: isDark ? 'rgba(6,182,212,0.1)' : '#ECFEFF',
                    border: `1px solid ${isDark ? 'rgba(6,182,212,0.2)' : '#A5F3FC'}`,
                    color: '#06B6D4',
                  }}
                >
                  {url}
                </div>
                <button
                  onClick={() => removeCustomUrl(index)}
                  className="p-2 rounded-lg transition-colors"
                  style={{
                    background: 'rgba(239,68,68,0.1)',
                    color: '#ef4444',
                  }}
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>

          <div className="flex items-center gap-2">
            <input
              type="url"
              value={newCustomUrl}
              onChange={(e) => setNewCustomUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addCustomUrl()}
              placeholder="https://example.com"
              className="flex-1 px-4 py-2.5 rounded-xl text-sm"
              style={{
                background: isDark ? '#0c1619' : '#F8FAFC',
                border: `1px solid ${isDark ? '#224249' : '#E2E8F0'}`,
                color: isDark ? '#F8FAFC' : '#0F172A',
                outline: 'none',
              }}
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={addCustomUrl}
              disabled={!newCustomUrl || !isValidUrl(newCustomUrl)}
              className="px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-1.5 transition-opacity"
              style={{
                background: '#06B6D4',
                color: '#F8FAFC',
                opacity: newCustomUrl && isValidUrl(newCustomUrl) ? 1 : 0.5,
              }}
            >
              <Plus className="w-4 h-4" />
              追加
            </motion.button>
          </div>
        </div>
      </div>

      {/* 区切り線 */}
      <div
        className="border-t"
        style={{ borderColor: isDark ? '#224249' : '#E2E8F0' }}
      />

      {/* 代表者SNS */}
      <div>
        <h3
          className="text-base font-semibold mb-4"
          style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}
        >
          代表者のソーシャルリンク
        </h3>
        <p className="text-sm mb-4" style={{ color: isDark ? '#6a8b94' : '#94a3b8' }}>
          代表者情報で設定した著者のSNSアカウントを追加すると、E-E-A-T向上に効果的です。
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <UrlInput
            label="Twitter / X"
            icon={<Twitter className="w-4 h-4" style={{ color: '#1DA1F2' }} />}
            value={localSameAs.author?.twitter || ''}
            onChange={(v) => updateAuthorField('twitter', v)}
            placeholder="https://twitter.com/your_name"
            isDark={isDark}
          />
          <UrlInput
            label="LinkedIn (Profile)"
            icon={<Linkedin className="w-4 h-4" style={{ color: '#0A66C2' }} />}
            value={localSameAs.author?.linkedin || ''}
            onChange={(v) => updateAuthorField('linkedin', v)}
            placeholder="https://linkedin.com/in/your_name"
            isDark={isDark}
          />
          <UrlInput
            label="YouTube"
            icon={<Youtube className="w-4 h-4" style={{ color: '#FF0000' }} />}
            value={localSameAs.author?.youtube || ''}
            onChange={(v) => updateAuthorField('youtube', v)}
            placeholder="https://youtube.com/@your_channel"
            isDark={isDark}
          />
          <UrlInput
            label="GitHub (Profile)"
            icon={<Github className="w-4 h-4" style={{ color: isDark ? '#F8FAFC' : '#24292e' }} />}
            value={localSameAs.author?.github || ''}
            onChange={(v) => updateAuthorField('github', v)}
            placeholder="https://github.com/your_name"
            isDark={isDark}
          />
        </div>
      </div>
    </div>
  );
}
