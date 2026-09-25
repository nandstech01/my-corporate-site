import { describe, expect, it } from 'vitest'
import { cleanFaqText } from '@/app/posts/_lib/faq-clean'

describe('cleanFaqText', () => {
  it('removes heading anchors', () => {
    expect(cleanFaqText('Character to Videoの成功率を上げるコツは？ {#faq-2}')).toBe('Character to Videoの成功率を上げるコツは？')
  })
  it('removes trailing and leading hash marks', () => {
    expect(cleanFaqText('短い動画から始めると安定します。 ###')).toBe('短い動画から始めると安定します。')
    expect(cleanFaqText('### Q. 料金は？')).toBe('Q. 料金は？')
  })
  it('keeps hashes inside the text such as C# and #1', () => {
    expect(cleanFaqText('C# と #1 の違い')).toBe('C# と #1 の違い')
  })
  it('collapses whitespace', () => {
    expect(cleanFaqText('  a \n\n b  ')).toBe('a b')
  })
})
