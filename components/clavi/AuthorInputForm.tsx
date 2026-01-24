'use client';

import { useState, useEffect, useRef } from 'react';
import { User, Briefcase, FileText, Image, Tag, X, Plus, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { AuthorSettings } from '@/lib/clavi/types/tenant-settings';

interface AuthorInputFormProps {
  author: AuthorSettings | undefined;
  onChange: (author: AuthorSettings | undefined) => void;
  isDark: boolean;
}

export default function AuthorInputForm({ author, onChange, isDark }: AuthorInputFormProps) {
  const [localAuthor, setLocalAuthor] = useState<AuthorSettings | undefined>(author);
  const [newExpertise, setNewExpertise] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const expertiseInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalAuthor(author);
  }, [author]);

  const updateField = <K extends keyof AuthorSettings>(
    field: K,
    value: AuthorSettings[K]
  ) => {
    const updated: AuthorSettings = {
      ...localAuthor,
      name: localAuthor?.name || '',
      [field]: value,
    };

    // バリデーション
    const newErrors = { ...errors };

    if (field === 'name') {
      if (typeof value === 'string' && value.length > 100) {
        newErrors.name = '100文字以内にしてください';
      } else {
        delete newErrors.name;
      }
    }

    if (field === 'jobTitle') {
      if (typeof value === 'string' && value.length > 100) {
        newErrors.jobTitle = '100文字以内にしてください';
      } else {
        delete newErrors.jobTitle;
      }
    }

    if (field === 'description') {
      if (typeof value === 'string' && value.length > 500) {
        newErrors.description = '500文字以内にしてください';
      } else {
        delete newErrors.description;
      }
    }

    if (field === 'image') {
      if (typeof value === 'string' && value && !isValidUrl(value)) {
        newErrors.image = '有効なURLを入力してください';
      } else {
        delete newErrors.image;
      }
    }

    setErrors(newErrors);
    setLocalAuthor(updated);

    // 名前が空の場合はundefinedを返す
    if (!updated.name) {
      onChange(undefined);
    } else {
      onChange(updated);
    }
  };

  const addExpertise = () => {
    if (!newExpertise.trim()) return;

    const currentExpertise = localAuthor?.expertise || [];

    if (currentExpertise.length >= 10) {
      setErrors({ ...errors, expertise: '専門分野は最大10個までです' });
      return;
    }

    if (currentExpertise.includes(newExpertise.trim())) {
      setErrors({ ...errors, expertise: 'すでに追加されています' });
      return;
    }

    const updated = [...currentExpertise, newExpertise.trim()];
    updateField('expertise', updated);
    setNewExpertise('');
    delete errors.expertise;
    setErrors({ ...errors });
  };

  const removeExpertise = (index: number) => {
    const updated = (localAuthor?.expertise || []).filter((_, i) => i !== index);
    updateField('expertise', updated.length > 0 ? updated : undefined);
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const clearAuthor = () => {
    setLocalAuthor(undefined);
    onChange(undefined);
    setErrors({});
  };

  const inputStyle = (hasError: boolean = false, isFocused: boolean = false) => ({
    background: isDark ? '#0c1619' : '#F8FAFC',
    border: `1px solid ${
      hasError
        ? 'rgba(239,68,68,0.5)'
        : isFocused
        ? 'rgba(6,182,212,0.5)'
        : isDark
        ? '#224249'
        : '#E2E8F0'
    }`,
    color: isDark ? '#F8FAFC' : '#0F172A',
    outline: 'none',
  });

  return (
    <div className="space-y-5">
      {/* 説明 */}
      <div
        className="p-4 rounded-xl"
        style={{
          background: isDark ? 'rgba(6,182,212,0.1)' : '#ECFEFF',
          border: `1px solid ${isDark ? 'rgba(6,182,212,0.2)' : '#A5F3FC'}`,
        }}
      >
        <p className="text-sm" style={{ color: isDark ? '#67E8F9' : '#0E7490' }}>
          代表者情報を設定すると、Schema.orgのPerson（著者）スキーマが生成され、
          Google Knowledge GraphでのE-E-A-T（専門性・権威性・信頼性）評価が向上します。
        </p>
      </div>

      {/* 氏名（必須） */}
      <div className="space-y-1.5">
        <label
          className="flex items-center gap-2 text-sm font-medium"
          style={{ color: isDark ? '#90c1cb' : '#64748b' }}
        >
          <User className="w-4 h-4" style={{ color: '#06B6D4' }} />
          氏名 <span style={{ color: '#ef4444' }}>*</span>
        </label>
        <input
          type="text"
          value={localAuthor?.name || ''}
          onChange={(e) => updateField('name', e.target.value)}
          placeholder="山田 太郎"
          className="w-full px-4 py-2.5 rounded-xl text-sm"
          style={inputStyle(!!errors.name)}
        />
        {errors.name && (
          <p className="text-xs flex items-center gap-1" style={{ color: '#ef4444' }}>
            <AlertCircle className="w-3 h-3" />
            {errors.name}
          </p>
        )}
      </div>

      {/* 役職 */}
      <div className="space-y-1.5">
        <label
          className="flex items-center gap-2 text-sm font-medium"
          style={{ color: isDark ? '#90c1cb' : '#64748b' }}
        >
          <Briefcase className="w-4 h-4" style={{ color: '#06B6D4' }} />
          役職
        </label>
        <input
          type="text"
          value={localAuthor?.jobTitle || ''}
          onChange={(e) => updateField('jobTitle', e.target.value)}
          placeholder="代表取締役 / CTO / プロダクトマネージャー"
          className="w-full px-4 py-2.5 rounded-xl text-sm"
          style={inputStyle(!!errors.jobTitle)}
        />
        {errors.jobTitle && (
          <p className="text-xs flex items-center gap-1" style={{ color: '#ef4444' }}>
            <AlertCircle className="w-3 h-3" />
            {errors.jobTitle}
          </p>
        )}
      </div>

      {/* 説明文 */}
      <div className="space-y-1.5">
        <label
          className="flex items-center gap-2 text-sm font-medium"
          style={{ color: isDark ? '#90c1cb' : '#64748b' }}
        >
          <FileText className="w-4 h-4" style={{ color: '#f59e0b' }} />
          説明文
        </label>
        <textarea
          value={localAuthor?.description || ''}
          onChange={(e) => updateField('description', e.target.value)}
          placeholder="10年以上のWebマーケティング経験を持ち、AI検索最適化の専門家として活動..."
          rows={3}
          className="w-full px-4 py-2.5 rounded-xl text-sm resize-none"
          style={inputStyle(!!errors.description)}
        />
        <div className="flex justify-between items-center">
          {errors.description ? (
            <p className="text-xs flex items-center gap-1" style={{ color: '#ef4444' }}>
              <AlertCircle className="w-3 h-3" />
              {errors.description}
            </p>
          ) : (
            <span />
          )}
          <p className="text-xs" style={{ color: isDark ? '#56737a' : '#94a3b8' }}>
            {localAuthor?.description?.length || 0}/500
          </p>
        </div>
      </div>

      {/* プロフィール画像URL */}
      <div className="space-y-1.5">
        <label
          className="flex items-center gap-2 text-sm font-medium"
          style={{ color: isDark ? '#90c1cb' : '#64748b' }}
        >
          <Image className="w-4 h-4" style={{ color: '#22c55e' }} />
          プロフィール画像URL
        </label>
        <input
          type="url"
          value={localAuthor?.image || ''}
          onChange={(e) => updateField('image', e.target.value)}
          placeholder="https://example.com/profile.jpg"
          className="w-full px-4 py-2.5 rounded-xl text-sm"
          style={inputStyle(!!errors.image)}
        />
        {errors.image && (
          <p className="text-xs flex items-center gap-1" style={{ color: '#ef4444' }}>
            <AlertCircle className="w-3 h-3" />
            {errors.image}
          </p>
        )}
        {localAuthor?.image && isValidUrl(localAuthor.image) && (
          <div className="mt-2 flex items-center gap-3">
            <img
              src={localAuthor.image}
              alt="Preview"
              className="w-12 h-12 rounded-full object-cover"
              style={{
                border: `2px solid ${isDark ? 'rgba(6,182,212,0.3)' : '#A5F3FC'}`,
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <span className="text-xs" style={{ color: isDark ? '#6a8b94' : '#94a3b8' }}>
              プレビュー
            </span>
          </div>
        )}
      </div>

      {/* 専門分野（タグ入力） */}
      <div className="space-y-1.5">
        <label
          className="flex items-center gap-2 text-sm font-medium"
          style={{ color: isDark ? '#90c1cb' : '#64748b' }}
        >
          <Tag className="w-4 h-4" style={{ color: '#ec4899' }} />
          専門分野（最大10個）
        </label>

        {/* 追加済みタグ */}
        <AnimatePresence>
          {localAuthor?.expertise && localAuthor.expertise.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-wrap gap-2 mb-2"
            >
              {localAuthor.expertise.map((tag, index) => (
                <motion.span
                  key={tag}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm"
                  style={{
                    background: isDark ? 'rgba(6,182,212,0.15)' : '#ECFEFF',
                    color: '#06B6D4',
                    border: `1px solid ${isDark ? 'rgba(6,182,212,0.3)' : '#A5F3FC'}`,
                  }}
                >
                  {tag}
                  <button
                    onClick={() => removeExpertise(index)}
                    className="hover:opacity-70 transition-opacity"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </motion.span>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 新規タグ入力 */}
        <div className="flex items-center gap-2">
          <input
            ref={expertiseInputRef}
            type="text"
            value={newExpertise}
            onChange={(e) => setNewExpertise(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addExpertise();
              }
            }}
            placeholder="AI検索最適化"
            className="flex-1 px-4 py-2.5 rounded-xl text-sm"
            style={inputStyle()}
          />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={addExpertise}
            disabled={!newExpertise.trim() || (localAuthor?.expertise?.length || 0) >= 10}
            className="px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-1.5 transition-opacity"
            style={{
              background: '#06B6D4',
              color: '#F8FAFC',
              opacity: newExpertise.trim() && (localAuthor?.expertise?.length || 0) < 10 ? 1 : 0.5,
            }}
          >
            <Plus className="w-4 h-4" />
            追加
          </motion.button>
        </div>
        {errors.expertise && (
          <p className="text-xs flex items-center gap-1" style={{ color: '#ef4444' }}>
            <AlertCircle className="w-3 h-3" />
            {errors.expertise}
          </p>
        )}
        <p className="text-xs" style={{ color: isDark ? '#56737a' : '#94a3b8' }}>
          {localAuthor?.expertise?.length || 0}/10 - Enterキーで追加できます
        </p>
      </div>

      {/* クリアボタン */}
      {localAuthor?.name && (
        <div className="pt-2">
          <button
            onClick={clearAuthor}
            className="text-sm px-4 py-2 rounded-lg transition-colors"
            style={{
              background: 'rgba(239,68,68,0.1)',
              color: '#ef4444',
              border: '1px solid rgba(239,68,68,0.2)',
            }}
          >
            代表者情報をクリア
          </button>
        </div>
      )}
    </div>
  );
}
