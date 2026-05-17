import { config } from 'dotenv'
config({ path: '.env.local' })

import { invokeClaude } from '../lib/llm/claude-cli'

async function main(): Promise<void> {
  const longText = Array.from({ length: 200 }, (_, i) =>
    `source ${i}: lorem ipsum dolor sit amet consectetur adipiscing elit. `
  ).join('')
  console.log('prompt length:', longText.length, 'chars')

  const start = Date.now()
  const r = await invokeClaude(longText + '\n\n要約して', {
    system: 'あなたは要約専門。1文で出力。',
    model: 'claude-haiku-4-5-20251001',
  })
  console.log(`OK ${((Date.now() - start) / 1000).toFixed(1)}s`)
  console.log('output:', r.text.slice(0, 200))
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error('FAIL:', e)
    process.exit(1)
  })
