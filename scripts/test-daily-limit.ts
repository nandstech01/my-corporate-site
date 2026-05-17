import { config } from 'dotenv'
config({ path: '.env.local' })

import { checkDailyPostLimit, getJstDayWindow } from '../lib/cortex/posting/daily-limit-checker'

async function main(): Promise<void> {
  const win = getJstDayWindow()
  console.log('JST window:', win.start.toISOString(), '->', win.end.toISOString())

  for (const platform of ['x', 'linkedin', 'threads', 'instagram'] as const) {
    const r = await checkDailyPostLimit(platform)
    console.log(`[${platform}] canPost=${r.canPost} posted=${r.postsToday}/${r.limit}`)
  }
}

main().catch((e) => {
  console.error('FAIL:', e)
  process.exit(1)
})
