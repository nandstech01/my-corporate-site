import { config } from 'dotenv'
config({ path: '.env.local' })

import { invokeSubagent, loadSubagentDefinition } from '../lib/llm/claude-cli'

async function main(): Promise<void> {
  console.log('=== Load subagent definition ===')
  const def = await loadSubagentDefinition('cortex-x-writer')
  console.log(`name: ${def.name}`)
  console.log(`model declared: ${def.model}`)
  console.log(`systemPrompt: ${def.systemPrompt.length} chars`)

  console.log('\n=== Invoke cortex-x-writer ===')
  const start = Date.now()
  const r = await invokeSubagent(
    'cortex-x-writer',
    'CORTEXがDiscordループ経由でsubagentを呼べるようになった話を1投稿で書いて。1行目で結論を打って、最後まで読ませる構造で。',
  )
  console.log(`Done in ${((Date.now() - start) / 1000).toFixed(1)}s`)
  console.log(`Output:\n${r.text}`)
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error('FAIL:', e)
    process.exit(1)
  })
