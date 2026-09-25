/**
 * 本文から抜いた FAQ の質問・回答に残る Markdown の残骸を落とす。
 * 例: "コツは？ {#faq-2}" → "コツは？"、"…できます。 ###" → "…できます。"
 */
export function cleanFaqText(text: string): string {
  return text
    .replace(/\s*\{#[^}]*\}\s*/g, ' ')
    .replace(/(?:\s*#+\s*)+$/g, '')
    .replace(/^\s*#+\s*/, '')
    .replace(/\s+/g, ' ')
    .trim()
}
