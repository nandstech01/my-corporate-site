'use client'

import { useState, type FormEvent } from 'react'

type Status = 'idle' | 'sending' | 'sent' | 'error'

interface GuideContactFormProps {
  /** 問い合わせの送信元。例: guide:claude-code-guide (inquiries.source に記録される) */
  readonly source: string
}

function field(data: FormData, name: string): string {
  const value = data.get(name)
  return typeof value === 'string' ? value.trim() : ''
}

/**
 * ガイドの相談フォーム (このページで唯一のクライアント部品)。
 * /api/contact に JSON で送り、結果はページ内に文章で出す (JSON の画面にしない)。
 * 流入元 (cookie nands_ft) は同じサイトへの fetch で自動的に送られ、API 側で記録される。
 * JS が動かないときも method=post で送れる (個人情報を URL に載せないため GET にしない)。
 */
export default function GuideContactForm({ source }: GuideContactFormProps) {
  const [status, setStatus] = useState<Status>('idle')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    setStatus('sending')
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: field(data, 'name'),
          email: field(data, 'email'),
          company: field(data, 'company'),
          message: field(data, 'message'),
          source,
        }),
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      form.reset()
      setStatus('sent')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <p className="guide-form__done" role="status">
        ご相談を受け付けました。内容を確認のうえ、担当者からメールでご連絡します。
      </p>
    )
  }

  return (
    <form className="guide-form" method="post" action="/api/contact" onSubmit={handleSubmit} data-source={source}>
      <input type="hidden" name="source" value={source} />
      <label className="guide-form__field">
        <span className="guide-form__label">お名前</span>
        <input className="guide-form__input" name="name" type="text" autoComplete="name" required maxLength={100} />
      </label>
      <label className="guide-form__field">
        <span className="guide-form__label">メールアドレス</span>
        <input className="guide-form__input" name="email" type="email" autoComplete="email" required maxLength={200} />
      </label>
      <label className="guide-form__field">
        <span className="guide-form__label">会社名 (任意)</span>
        <input className="guide-form__input" name="company" type="text" autoComplete="organization" maxLength={200} />
      </label>
      <label className="guide-form__field">
        <span className="guide-form__label">ご相談内容</span>
        <textarea className="guide-form__input" name="message" required rows={5} maxLength={4000} />
      </label>
      <button className="guide-form__submit" type="submit" disabled={status === 'sending'}>
        {status === 'sending' ? '送信しています…' : '相談を送る'}
      </button>
      {status === 'error' && (
        <p className="guide-form__error" role="alert">
          送信できませんでした。時間をおいてもう一度お試しいただくか、contact@nands.tech へメールでご連絡ください。
        </p>
      )}
    </form>
  )
}
