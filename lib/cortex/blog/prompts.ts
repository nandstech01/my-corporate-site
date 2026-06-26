/**
 * Prompt templates encoding the target article style (from the user's examples):
 * accessible, hook-driven listicle / complete guide.
 * 痛みフック → そもそも仕組み → 7選/7ステップ(具体手順) → まとめ → ソフトCTA。
 */

import type { TopicPlan } from './types'

const STYLE_DNA = `
## 文体・構成のDNA（必ず守る）
- 読者の「痛み」を1行で突くフックから始める（例:「家のPCの前にいないと作業が進まない」）。
- 次に「そもそもどう動くのか」を噛み砕いて説明（仕組みが分かれば後は応用、というトーン）。
- 本体は番号付きの「7選」または「7ステップ」。各項目は具体的な手順・実際のコマンド/設定を1つ以上含める。
- 抽象論・精神論は禁止。手を動かせる粒度で書く。
- 最後に「まとめ」＋やわらかいCTA（次の一歩を1つだけ示す）。
- トーン: カジュアルだが実務家。だ・である調と丁寧語の自然な混在可。煽りだけは禁止、必ず具体で裏付ける。
- 実装していない/確証のない固有値（バージョン番号・フラグ名・ベンチ・順位）は書かない。バージョン依存の主張は「検証済み事実」に明記がある場合のみ。
`.trim()

const ANTI_FABRICATION = `
## 捏造防止
- 検証済み事実(changelogFacts)に無いバージョン番号・新機能名・数値は書かない。
- 一般に正しいコマンド/操作(例: /config, /remote-control, /design-sync 等)は書いてよいが、存在を断定できないフラグは書かない。
- 不確かな最新性は定性的に書く。
`.trim()

export function buildOutlinePrompt(plan: TopicPlan): { system: string; user: string } {
  const system = `あなたは @nands_tech が運営する技術ブログ(nands.tech)の編集者兼ライター。
日本のエンジニア/AI活用層に刺さる、保存したくなる実用記事の「設計図(JSON)」を作る。
${STYLE_DNA}
${ANTI_FABRICATION}

## 出力(JSONのみ・前置き不要)
{
  "title": "魅力的な日本語タイトル(30〜45字・数字やベネフィットを入れる)",
  "slugBase": "ascii-kebab-case-slug (英語/ローマ字, 3〜6語, 例: claude-code-mobile-workflow)",
  "metaDescription": "120字以内のSEO説明文",
  "metaKeywords": ["主要キーワード", "...(3〜6個)"],
  "categoryTags": ["記事タグ", "...(3〜5個・日本語可)"],
  "hookBrief": "冒頭フック(痛み)で突くポイントを1〜2文で",
  "mechanismBrief": "『そもそも仕組み』セクションで説明すべき要点を2〜3文で",
  "sections": [
    { "h2": "①〜 から始まる項目見出し", "fragmentId": "ascii-id", "brief": "この項目で教える具体手順を1〜2文" }
  ],
  "conclusionBrief": "まとめ+CTAの方向性を1文で"
}
sections は本体の番号付き項目(7選なら7個, 手順なら必要数)。fragmentId は英数字とハイフンのみ。`

  const user = `## トピック
${plan.topic}

## ターゲットキーワード
${plan.targetKeyword}

## 検証済み事実(changelogFacts・最新性の唯一の根拠)
${plan.changelogFacts.length ? plan.changelogFacts.map((f) => `- ${f}`).join('\n') : '(なし: バージョン固有の主張は避ける)'}

## 参考の切り口(任意)
${plan.angleHints.length ? plan.angleHints.map((a) => `- ${a}`).join('\n') : '(なし)'}

## 検索需要のある実クエリ(GSC・あれば自然に見出し/本文へ織り込む＝SEO)
${plan.seoQueries && plan.seoQueries.length ? plan.seoQueries.map((q) => `- ${q}`).join('\n') : '(データ蓄積前: なし)'}`

  return { system, user }
}

export function buildSectionPrompt(
  title: string,
  h2: string,
  brief: string,
  changelogFacts: readonly string[],
): { system: string; user: string } {
  const system = `あなたは nands.tech の実務家ライター。記事「${title}」の1セクションだけを日本語Markdownで書く。
${STYLE_DNA}
${ANTI_FABRICATION}

## 制約
- 見出し行(##)は書かない。本文だけを返す（見出しは呼び出し側で付ける）。
- 800〜1500字。具体的な手順・コマンド/設定例を最低1つ。必要ならコードブロックを使う。
- 前置き(「このセクションでは」等)は書かない。本文のみ。`

  const user = `## このセクションの見出し
${h2}

## 書くべき内容
${brief}

## 検証済み事実(根拠)
${changelogFacts.length ? changelogFacts.map((f) => `- ${f}`).join('\n') : '(なし)'}`

  return { system, user }
}

export function buildHookPrompt(title: string, hookBrief: string): { system: string; user: string } {
  return {
    system: `あなたは nands.tech のライター。記事「${title}」の導入(フック+つかみ)を日本語Markdownで書く。痛みを突く短い一文から始め、読者を本文へ引き込む。300〜600字、見出しは付けない、本文のみ。煽りだけは禁止。`,
    user: `フックで突くポイント:\n${hookBrief}`,
  }
}

export function buildConclusionPrompt(title: string, conclusionBrief: string): { system: string; user: string } {
  return {
    system: `あなたは nands.tech のライター。記事「${title}」の「まとめ」を日本語Markdownで書く。要点を簡潔に振り返り、最後にやわらかいCTA(次の一歩を1つ)を置く。200〜400字、見出しは付けない、本文のみ。`,
    user: `まとめ/CTAの方向性:\n${conclusionBrief}`,
  }
}
