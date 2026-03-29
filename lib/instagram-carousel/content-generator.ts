import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'
import type { CarouselContent } from './types'

const deepDiveSchema = z.object({
  title: z.string().default('ポイント'),
  bullets: z.array(z.string()).default(['詳細はこちら']),
})

const carouselContentSchema = z.object({
  hook: z.string().default('知らないとやばい？'),
  problemBullets: z.array(z.string()).default(['課題1', '課題2', '課題3']),
  solutionTitle: z.string().default('解決策'),
  solutionPoints: z.array(z.string()).default(['メリット1', 'メリット2', 'メリット3']),
  deepDives: z
    .tuple([deepDiveSchema, deepDiveSchema, deepDiveSchema])
    .default([
      { title: 'ポイント1', bullets: ['詳細1'] },
      { title: 'ポイント2', bullets: ['詳細2'] },
      { title: 'ポイント3', bullets: ['詳細3'] },
    ]),
  takeaways: z.array(z.string()).default(['まとめ1', 'まとめ2', 'まとめ3']),
  caption: z.string().default('詳しくはプロフィールのリンクから'),
  hashtags: z.array(z.string()).default(['#テック', '#AI', '#プログラミング', '#エンジニア', '#IT']),
})

const SYSTEM_PROMPT = `あなたはInstagramカルーセル投稿のコンテンツライターです。
与えられたトピックから、8枚スライド構成のカルーセル用コンテンツをJSON形式で生成してください。

出力は以下のJSON構造に厳密に従ってください:

{
  "hook": "1-2行、挑発的な質問や「これ知らないとやばい」スタイル（30文字以内）",
  "problemBullets": ["課題1（40文字以内）", "課題2", "課題3"],
  "solutionTitle": "解決策の名前・コンセプト（20文字以内）",
  "solutionPoints": ["メリット1（40文字以内）", "メリット2", "メリット3"],
  "deepDives": [
    { "title": "深堀りタイトル1（20文字以内）", "bullets": ["ポイント（50文字以内）", "ポイント2"] },
    { "title": "深堀りタイトル2", "bullets": ["ポイント", "ポイント2"] },
    { "title": "深堀りタイトル3", "bullets": ["ポイント", "ポイント2"] }
  ],
  "takeaways": ["まとめ1（40文字以内）", "まとめ2", "まとめ3"],
  "caption": "Instagram投稿キャプション（300-500文字、教育的なトーン）",
  "hashtags": ["#ハッシュタグ1", "#ハッシュタグ2", "#ハッシュタグ3", "#ハッシュタグ4", "#ハッシュタグ5"]
}

ルール:
- 全て日本語で書くこと
- hookは短く、スクロールを止める力があること
- problemBulletsは読者が「あるある」と共感する課題
- deepDivesは必ず3つ、各bulletは2-3個
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
    // Try cleaning common issues: trailing commas, unescaped newlines in strings
    const cleaned = match[0]
      .replace(/,\s*([}\]])/g, '$1')  // trailing commas
      .replace(/[\r\n]+/g, ' ')       // newlines that break strings
    return JSON.parse(cleaned)
  }
}

export async function generateCarouselContent(topic: string): Promise<CarouselContent> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not configured')
  }

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
