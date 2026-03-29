import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'
import type { CarouselContent } from './types'

const contentSlideSchema = z.object({
  title: z.string().default('ポイント'),
  description: z.string().default('詳細'),
  keyPoints: z.array(z.string()).default(['要点1']),
})

const summarySchema = z.object({
  type: z.enum(['comparison', 'checklist', 'pros_cons', 'numbers', 'before_after']).default('checklist'),
  title: z.string().default('まとめ'),
  items: z.array(z.string()).default(['まとめ1', 'まとめ2']),
  columns: z.array(z.string()).optional(),
  pros: z.array(z.string()).optional(),
  cons: z.array(z.string()).optional(),
})

const carouselContentSchema = z.object({
  hookLine1: z.string().default('最新のAI仕事術'),
  hookLine2: z.string().default('AIツール'),
  hookLine3: z.string().default('完全ガイド'),
  conclusionText: z.string().default('AIを使いこなす人が勝つ時代'),
  contentSlides: z.array(contentSlideSchema).default([
    { title: 'ポイント1', description: '詳細1', keyPoints: ['要点'] },
    { title: 'ポイント2', description: '詳細2', keyPoints: ['要点'] },
    { title: 'ポイント3', description: '詳細3', keyPoints: ['要点'] },
  ]),
  summary: summarySchema.default({ type: 'checklist', title: 'まとめ', items: ['要点1', '要点2'] }),
  caption: z.string().default('詳しくはプロフィールのリンクから'),
  hashtags: z.array(z.string()).default(['#AI', '#テック', '#プログラミング', '#エンジニア', '#仕事術']),
})

const SYSTEM_PROMPT = `あなたはInstagramカルーセル投稿のコンテンツライターです。
与えられたトピックから、可変枚数カルーセル用コンテンツをJSON形式で生成してください。

出力は以下のJSON構造に厳密に従ってください:

{
  "hookLine1": "カテゴリ（必ず8文字ぴったり。例: 最新のAI仕事術、知らないと損する）",
  "hookLine2": "メインキーワード（短いほど良い。例: Claude Code、ChatGPT）",
  "hookLine3": "コンテンツ種類（例: 活用術5選、完全ガイド、徹底比較）",
  "conclusionText": "結論メッセージ（2行以内、インパクト重視。例: AIを味方にした人だけが生き残る時代）",
  "contentSlides": [
    {
      "title": "ポイントのタイトル（15文字以内）",
      "description": "1-2文の説明（50文字以内）",
      "keyPoints": ["要点1（30文字以内）", "要点2"]
    }
  ],
  "summary": {
    "type": "comparison または checklist または pros_cons または numbers または before_after",
    "title": "まとめのタイトル",
    "items": ["まとめ項目1", "まとめ項目2", "まとめ項目3"],
    "pros": ["メリット1（pros_consの場合のみ）"],
    "cons": ["デメリット1（pros_consの場合のみ）"]
  },
  "caption": "Instagram投稿キャプション（300-500文字、教育的なトーン）",
  "hashtags": ["#ハッシュタグ1", "#ハッシュタグ2", "#ハッシュタグ3", "#ハッシュタグ4", "#ハッシュタグ5"]
}

ルール:
- 全て日本語で書くこと
- hookLine1は必ず8文字ぴったり（多くても少なくてもダメ）
- hookLine2は短いほど良い（短い場合は自動でフォントが大きくなる）
- contentSlidesは3〜6個（トピックに最適な数を判断すること）
  - 「5選」なら5個、「3つのコツ」なら3個
- summaryのtypeはコンテンツに最適な形式を選ぶ:
  - comparison: ツール比較、機能比較に最適
  - checklist: やることリスト、確認事項に最適
  - pros_cons: メリット・デメリット分析に最適
  - numbers: 数値の比較、統計データに最適
  - before_after: 導入前後の変化に最適
- captionは教育的で価値を提供する内容にすること
- hashtagsは5つ、関連性の高いものを選ぶこと
- JSON以外のテキストは出力しないこと`

function extractJson(text: string): unknown {
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) {
    throw new Error('No JSON object found in response')
  }
  try {
    return JSON.parse(match[0])
  } catch {
    const cleaned = match[0]
      .replace(/,\s*([}\]])/g, '$1')
      .replace(/[\r\n]+/g, ' ')
    return JSON.parse(cleaned)
  }
}

export async function generateCarouselContent(topic: string): Promise<CarouselContent> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not set')

  const client = new Anthropic({ apiKey })

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `トピック: ${topic}\n\n上記トピックについて、Instagramカルーセル用のコンテンツをJSON形式で生成してください。`,
      },
    ],
  })

  const textBlock = response.content.find((block) => block.type === 'text')
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text content in Anthropic response')
  }

  const raw = extractJson(textBlock.text)
  const parsed = carouselContentSchema.parse(raw)

  return parsed
}
