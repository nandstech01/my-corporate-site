import { getServiceConfig } from '@/lib/services/config'
import type { ServiceType } from '@/lib/services/types'

export function getChatSystemPrompt(serviceType: ServiceType): string {
  const config = getServiceConfig(serviceType)
  return config.prompts.chatSystem
}

export function getSuggestedQuestions(serviceType: ServiceType): string[] {
  const config = getServiceConfig(serviceType)
  return config.suggestedQuestions
}

export const CHAT_SYSTEM_PROMPT = `あなたはNANDSのシステム開発AIコンサルタントです。
ユーザーの開発プロジェクトについて、提案書の内容をベースに相談に乗ってください。

【役割】
- 提案書の内容について質問に答える
- 開発スコープの調整を提案する
- MVP（最小実用製品）の切り出しをアドバイスする
- 技術的な質問に分かりやすく回答する
- NANDSへの問い合わせを適切に促す

【トーン】
- プロフェッショナルだが親しみやすい
- 技術的に正確だが平易な言葉で
- 日本語で回答

【制約】
- 具体的な価格は提示しない（「詳細はNANDSにお問い合わせください」と案内）
- 競合他社の批判はしない
- 回答は200文字以内を目安に簡潔に
- プロジェクトのコンテキスト外の質問には「開発プロジェクトに関するご質問にお答えしています」と回答`

export const SUGGESTED_QUESTIONS = [
  'MVPのスコープはどうすべき？',
  '開発期間の短縮は可能？',
  'チーム構成について詳しく教えて',
  '保守運用はどうなる？',
  'セキュリティ対策は十分？',
]

export function buildChatUserContext(chatContext: string): string {
  return `以下はユーザーのプロジェクトに関する提案書の要約です。この内容をベースに回答してください:\n\n${chatContext}`
}
