'use client'

import { useState, type FormEvent, type ReactNode } from 'react'
import { CONTACT_ERROR_MESSAGE, CONTACT_SENT_MESSAGE, GUIDE_CONTACT_ERROR_ID, GUIDE_CONTACT_SENT_ID } from './contact-messages'

type Status = 'idle' | 'sending' | 'sent' | 'error'


interface GuideContactFormProps {
  /** 問い合わせの送信元。例: guide:claude-code-guide (inquiries.source に記録される) */
  readonly source: string
  /** 送信ボタンの隣の副の操作 (関連記事などへのリンク) */
  readonly secondary?: { readonly label: string; readonly href: string }
  /** 送信後の文章 (サーバーで文節の区切りを入れたもの)。無ければ既定の文 */
  readonly messages?: { readonly sent: ReactNode; readonly error: ReactNode }
}

function field(data: FormData, name: string): string {
  const value = data.get(name)
  return typeof value === 'string' ? value.trim() : ''
}


/**
 * ガイドの相談フォーム (このページで唯一のクライアント部品)。
 * JS があれば /api/contact に JSON で送り、結果はページ内に文章で出す (JSON の画面にしない)。
 * JS が動かないときは method=post で送り、API が同じ記事の #guide-contact-sent (失敗は #guide-contact-error) へ
 * 303 で戻す。その文章は CSS の :target で表示する (個人情報を URL に載せないため GET にしない)。
 * 流入元 (cookie nands_ft) は同じサイトへの送信で自動的に送られ、API 側で記録される。
 */
export default function GuideContactForm({ source, secondary, messages }: GuideContactFormProps) {
  const [status, setStatus] = useState<Status>('idle')
  const sent = messages?.sent ?? CONTACT_SENT_MESSAGE
  const failed = messages?.error ?? CONTACT_ERROR_MESSAGE

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
        {sent}
      </p>
    )
  }

  return (
    <div className="guide-form-wrap">
      <p id={GUIDE_CONTACT_SENT_ID} className="guide-form__notice" data-kind="sent" role="status">
        {sent}
      </p>
      <p id={GUIDE_CONTACT_ERROR_ID} className="guide-form__notice" data-kind="error">
        {failed}
      </p>
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
        <label className="guide-form__field" data-wide="">
          <span className="guide-form__label">会社名 (任意)</span>
          <input className="guide-form__input" name="company" type="text" autoComplete="organization" maxLength={200} />
        </label>
        <label className="guide-form__field" data-wide="">
          <span className="guide-form__label">ご相談の内容</span>
          <textarea className="guide-form__input" name="message" required rows={5} maxLength={4000} />
        </label>
        <div className="guide-actions" data-wide="">
          <button className="guide-button" data-kind="primary" type="submit" disabled={status === 'sending'}>
            {status === 'sending' ? '送信しています' : '相談を送る'}
          </button>
          {secondary && (
            <a
              className="guide-button"
              data-kind="secondary"
              href={secondary.href}
              {...(secondary.href.startsWith('https://') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            >
              {secondary.label}
            </a>
          )}
        </div>
        {status === 'error' && (
          <p className="guide-form__error" role="alert" data-wide="">
            {failed}
          </p>
        )}
      </form>
    </div>
  )
}
