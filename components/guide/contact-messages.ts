/**
 * ガイドの相談フォームの送信後の文 (サーバー部品の ConsultCta とクライアント部品の GuideContactForm で共通)。
 * 'use client' のファイルから値を export するとサーバー側では参照 (文字列ではない) になるので、ここに分けている。
 */
export const CONTACT_SENT_MESSAGE = 'ご相談を受け付けました。内容を確認のうえ、担当者からメールでご連絡します。'
export const CONTACT_ERROR_MESSAGE =
  '送信できませんでした。時間をおいてもう一度お試しいただくか、contact@nands.tech へメールでご連絡ください。'

/** JS が動かないときの送信後の戻り先 (/api/contact が 303 でこのアンカーへ戻す)。app/api/contact/source.ts と同じ値 */
export const GUIDE_CONTACT_SENT_ID = 'guide-contact-sent'
export const GUIDE_CONTACT_ERROR_ID = 'guide-contact-error'
