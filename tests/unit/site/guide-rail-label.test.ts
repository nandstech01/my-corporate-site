import { describe, expect, it } from 'vitest'
import { railLabel } from '@/components/guide/rail-label'
import { textUnits } from '@/components/guide/text-wrap'

describe('左の列の節の名前 (h2 から作る)', () => {
  it.each([
    // 先頭の製品名 + 助詞と、末尾の「は？」を除く
    ['Claude Opus 5.5 の料金と上限は？ {#guide-pricing}', '料金と上限'],
    ['Claude Opus 5.5 の導入を相談するには？', '導入を相談する'],
    ['Claude Opus 5.5 でまだ分からないことは？', 'まだ分からないこと'],
    ['Opus 5.5 と Opus 5・ Fable 5.1 はどれを選ぶ？', 'どれを選ぶ'],
    // 「？」の後ろに続きがあれば続き
    ['Claude Opus 5.5 は速い？安い？当社の実測', '当社の実測'],
    ['Opus 5.5 は Opus 5 よりどれだけ安く速い？当社の検証', '当社の検証'],
    // 短い見出しはそのまま。小文字で始まる語は製品名として除かない
    ['よくある質問', 'よくある質問'],
    ['effort の選び方', 'effort の選び方'],
    ['MCP とは？', 'MCP'],
  ])('%s → %s', (heading, label) => {
    expect(railLabel(heading)).toBe(label)
  })

  it('長いときは文節の区切りで 12 字ほどに切り、末尾の助詞を落とす', () => {
    const label = railLabel('Claude Opus 5.5 とは？適応的な思考と effort の仕組み')
    expect(label).toBe('適応的な思考')
    expect(textUnits(label)).toBeLessThanOrEqual(12)
  })
})
