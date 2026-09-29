/**
 * 本文の区画の左の列 (rail) に番号と並べて出す短い名前を、h2 の文字から作る (サーバー専用: phrases が budoux を使う)。
 *
 * 見出しは「Claude Opus 5.5 の料金と上限は？」のように主題の製品名から始まる問いの形が多いので:
 * 1. 「？」の後ろに続きがあればその続き (…は速い？安い？当社の実測 → 当社の実測)
 * 2. 無ければ問いの部分から、先頭の製品名 + 助詞 (Claude Opus 5.5 の) と末尾の「は？」「には？」を除く (→ 料金と上限)
 * 3. まだ長ければ (全角 12 字ほど) 文節の区切りで切り、末尾の助詞を落とす
 */
import { bindSpaces, phrases } from './phrases'
import { textUnits } from './text-wrap'

/** 全角 12 字ほど (英数字は textUnits で半分強に数える) */
export const RAIL_LABEL_UNITS = 12

/** 先頭の製品名 (大文字で始まる並び) とそれに続く助詞。例: "Claude Opus 5.5 の" / "Opus 5.5 と Opus 5・ Fable 5.1 は" */
const LEADING_SUBJECT = /^[A-Z][^？?。、]*?[A-Za-z0-9)）]\s*(?:とは|の|は|で)\s*(?=\S)/
/** 文全体がこの長さまでなら切らない (「about 12」の幅) */
const RAIL_LABEL_MAX_UNITS = 14

/** 末尾の問いの形を除く: MCP とは？ → MCP / 相談するには？ → 相談する / 分からないことは？ → 分からないこと */
function withoutQuestion(text: string): string {
  const body = text.replace(/\s*[？?]\s*$/, '')
  if (body === text) return text
  if (/[A-Za-z0-9)）]\s*とは$/.test(body)) return body.replace(/\s*とは$/, '')
  if (/[うくすつぬむぶぐる]には$/.test(body)) return body.replace(/には$/, '')
  return body.replace(/は$/, '')
}
/** 切ったあとの末尾に残すと不自然な助詞・約物 */
const TRAILING_PARTICLE = /\s*(?:の|と|を|は|で|に|や|か|・|、|:|：)\s*$/

const compact = (text: string) => text.replace(/[\s ]+/g, ' ').trim()

function fit(text: string): string {
  if (textUnits(text) <= RAIL_LABEL_MAX_UNITS) return text
  let label = ''
  for (const phrase of phrases(bindSpaces(text))) {
    if (label && textUnits(compact(label + phrase)) > RAIL_LABEL_UNITS) break
    label += phrase
  }
  const trimmed = compact(label).replace(TRAILING_PARTICLE, '')
  return trimmed || compact(label)
}

export function railLabel(heading: string): string {
  const text = compact(heading.replace(/\s*\{#[^}]+\}\s*$/, ''))
  if (!text) return ''
  const lastQuestion = Math.max(text.lastIndexOf('？'), text.lastIndexOf('?'))
  const rest = lastQuestion >= 0 ? compact(text.slice(lastQuestion + 1)) : ''
  if (rest) return fit(rest)
  const body = withoutQuestion(text)
  const withoutSubject = body.replace(LEADING_SUBJECT, '')
  return fit(compact(withoutSubject) || body)
}
