import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'
import type { CarouselContent } from './types'
import type { ResearchContext } from './topic-researcher'

const contentSlideSchema = z.object({
  title: z.string().default('ポイント'),
  points: z.array(z.string()).default(['要点1']),
  callout: z.string().default('補足コメント'),
})

const summaryTableSchema = z.object({
  type: z.literal('table'),
  title: z.string(),
  headers: z.array(z.string()),
  rows: z.array(z.object({
    label: z.string(),
    values: z.array(z.string()),
  })),
})

const summaryTakeawaySchema = z.object({
  type: z.literal('takeaway'),
  title: z.string(),
  items: z.array(z.object({
    text: z.string(),
    detail: z.string(),
  })),
})

const summarySchema = z.discriminatedUnion('type', [summaryTableSchema, summaryTakeawaySchema])

const carouselContentSchema = z.object({
  hookLine1: z.string().default('最新のAI仕事術'),
  hookLine2: z.string().default('AIツール'),
  hookLine3: z.string().default('完全ガイド'),
  bridgeText: z.string().default('AIを使いこなす人が勝つ時代'),
  contentSlides: z.array(contentSlideSchema).default([
    { title: 'ポイント1', points: ['要点'], callout: '補足' },
  ]),
  summary: summarySchema.default({ type: 'takeaway', title: 'まとめ', items: [{ text: '要点1', detail: '詳細' }] }),
  caption: z.string().default('詳しくはプロフィールのリンクから'),
  hashtags: z.array(z.string()).default(['#AI', '#テック', '#プログラミング', '#エンジニア', '#仕事術']),
})

const SYSTEM_PROMPT = `あなたはInstagramカルーセル投稿のコンテンツライターです。
与えられたトピックから、**ブログ記事1本分の濃さ**のカルーセル用コンテンツをJSON形式で生成してください。

重要: 各スライドのコンテンツは省略せず、具体的な情報（コマンド名、数値、手順、比較データ）を含めること。
「一般論」や「〜が重要です」だけで終わるスライドは禁止。必ず「具体的に何をどうするか」を書くこと。

出力は以下のJSON構造に厳密に従ってください:

{
  "hookLine1": "カテゴリ（必ず8文字ぴったり。例: 最新のAI仕事術、知らないと損する）",
  "hookLine2": "メインキーワード（短いほど良い。例: Claude Code、ChatGPT）",
  "hookLine3": "コンテンツ種類（7文字以内厳守。例: 活用術5選、完全ガイド、徹底比較）",
  "bridgeText": "結論メッセージ（2行以内、体験・数値・断言を含むインパクト重視。例: 僕はこれで月40時間削減した）",
  "contentSlides": [
    {
      "title": "ポイントのタイトル（12文字以内）",
      "points": [
        "具体的なポイント1（40-80文字。コマンド名、数値、手順を含む詳細な説明）",
        "具体的なポイント2（同上。抽象論禁止、実践的な内容のみ）",
        "具体的なポイント3（同上）",
        "具体的なポイント4（同上）"
      ],
      "callout": "このスライドの要約・注意点（30-50文字。💡的な補足）"
    }
  ],
  "summary": {
    "type": "table または takeaway",
    ... (下記参照)
  },
  "caption": "Instagram投稿キャプション（300-500文字、教育的なトーン、一次情報・体験を含む）",
  "hashtags": ["#ハッシュタグ1", "#ハッシュタグ2", "#ハッシュタグ3", "#ハッシュタグ4", "#ハッシュタグ5"]
}

■ summaryのtype別構造:

type: "table"（ツール比較、機能比較に最適）の場合:
{
  "type": "table",
  "title": "比較表のタイトル",
  "headers": ["ツールA", "ツールB", "ツールC"],
  "rows": [
    { "label": "機能名", "values": ["✅", "❌", "✅"] },
    { "label": "月額", "values": ["$20", "$0", "$20"] }
  ]
}

type: "takeaway"（まとめリスト）の場合:
{
  "type": "takeaway",
  "title": "今日のまとめ",
  "items": [
    { "text": "要点タイトル（15文字以内）", "detail": "補足説明（25文字以内）" }
  ]
}

ルール:
- 全て日本語で書くこと
- hookLine1は必ず8文字ぴったり
- hookLine2は短いほど良い
- hookLine3は7文字以内
- bridgeTextは具体的な体験・数値・断言を含むこと（一般論禁止）
- contentSlidesは3〜6個（トピックに最適な数を判断）
  - 各スライドのpointsは3〜5個
  - pointsは40-80文字で具体的に書く（コマンド名、設定値、手順を含む）
  - 「〜が重要」「〜が大事」で終わる抽象的な記述は禁止
- summaryのtableは最低6行、takeawayは3-5項目
- captionは300-500文字で教育的かつ一次情報を含む
- hashtagsは5つ
- JSON以外のテキストは出力しないこと

■ リサーチデータの活用ルール（リサーチデータが提供されている場合）:
- 各スライドのpointsに、リサーチデータの具体的な数値・事例・ツール名を必ず1つ以上含めること
- 「〜と言われている」ではなく「〜社の調査によると」のように出典を示唆すること
- statisticsの数値データはそのまま引用すること
- captionにもリサーチから得た一次情報を反映すること
- リサーチデータがない場合は自身の知識で具体的に書くこと`

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

function buildResearchBlock(research: ResearchContext): string {
  const parts: string[] = []

  if (research.keyFacts.length > 0) {
    parts.push(`■ 主要ファクト:\n${research.keyFacts.map((f, i) => `${i + 1}. ${f}`).join('\n')}`)
  }
  if (research.statistics.length > 0) {
    parts.push(`■ 統計データ:\n${research.statistics.map((s, i) => `${i + 1}. ${s}`).join('\n')}`)
  }
  if (research.examples.length > 0) {
    parts.push(`■ 具体事例:\n${research.examples.map((e, i) => `${i + 1}. ${e}`).join('\n')}`)
  }
  if (research.sourceUrls.length > 0) {
    parts.push(`■ 参考ソース:\n${research.sourceUrls.slice(0, 3).join('\n')}`)
  }

  return parts.length > 0
    ? `\n\n【リサーチ結果（以下の情報を必ずコンテンツに反映すること）】\n\n${parts.join('\n\n')}`
    : ''
}

export async function generateCarouselContent(
  topic: string,
  research?: ResearchContext,
): Promise<CarouselContent> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not set')

  const client = new Anthropic({ apiKey })
  const researchBlock = research ? buildResearchBlock(research) : ''

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 6144,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `トピック: ${topic}\n\n上記トピックについて、ブログ記事1本分の濃さでInstagramカルーセル用コンテンツをJSON形式で生成してください。各ポイントは具体的なコマンド名、数値、手順を含めること。${researchBlock}`,
      },
    ],
  })

  const textBlock = response.content.find((block) => block.type === 'text')
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text content in Anthropic response')
  }

  const raw = extractJson(textBlock.text)
  const parsed = carouselContentSchema.parse(raw)

  return parsed as CarouselContent
}
