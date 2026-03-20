/**
 * 引用RT用パターンテンプレート
 *
 * 要約ではなく「実務家としての独自意見」を形成するためのテンプレート。
 * 4種類のアプローチで引用RTの多様性を確保する。
 */

import { selectPatternByBandit } from '../learning/pattern-bandit'

export interface OpinionTemplate {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly promptGuidance: string
  readonly category: 'agreement' | 'disagreement' | 'addendum' | 'prediction'
}

export const opinionTemplates: readonly OpinionTemplate[] = [
  {
    id: 'agreement_extension',
    name: '同意+拡張',
    description: '同意しつつ実務経験からの補足を追加',
    promptGuidance: `同意の立場から、実務経験に基づく具体的な補足を1つ追加。
「まさにこれ。実際に〜を運用していて感じるのは…」のような語り口。
相手の主張を認めつつ、実務家ならではの解像度を上げる視点を提供する。`,
    category: 'agreement',
  },
  {
    id: 'respectful_disagreement',
    name: '敬意ある反論',
    description: '敬意を持って異なる視点を提示',
    promptGuidance: `敬意を持ちつつ、代替視点を提示する。
「ここは少し見方が違うかも。実際に〜の現場では…」のような語り口。
人格攻撃NG。あくまで技術的・実務的な視点の違いを述べる。
反論+代替案をセットで提示する。`,
    category: 'disagreement',
  },
  {
    id: 'practitioner_addendum',
    name: '実務家の補足',
    description: '実務での実際の使用例を共有',
    promptGuidance: `実務で実際にどう使っているか・使ったかの具体例を共有。
「うちのチームでは実際にこれを〜に使っていて…」のような語り口。
抽象的な分析ではなく、具体的な実装・運用経験を語る。`,
    category: 'addendum',
  },
  {
    id: 'future_prediction',
    name: '今後の展望',
    description: '現在の発表から今後の展開を予測',
    promptGuidance: `この発表・動向が今後どう展開するかの予測を述べる。
「これが意味するのは、半年後には〜」のような語り口。
根拠のある予測（過去のパターン、業界動向）に基づく。
読者に「なるほど、そう来るか」と思わせる視点。`,
    category: 'prediction',
  },
]

/**
 * バンディット学習でテンプレートを選択する（Thompson Sampling）
 * フォールバック: ランダム選択
 */
export async function selectOpinionTemplate(): Promise<OpinionTemplate> {
  const ids = opinionTemplates.map(t => `quote_${t.id}`)
  try {
    const selected = await selectPatternByBandit(ids, 'x')
    const found = opinionTemplates.find(t => `quote_${t.id}` === selected)
    if (found) return found
  } catch { /* fallback */ }
  return opinionTemplates[Math.floor(Math.random() * opinionTemplates.length)]
}
