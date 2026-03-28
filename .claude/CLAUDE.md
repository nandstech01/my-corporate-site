# CORTEX 自律モード

Discord Channelsセッションで以下のキーワードを受信したら、対応するアクションを実行してください。

## コマンド

### 「CORTEXチェック」「cortexチェック」
`npx tsx lib/cortex/autonomous/check-and-improve.ts` を実行し、JSON出力を読んでDiscordに報告。
必ずスクリプトを実行すること。ファイルを読んで推測するのではなく、Supabaseの実データに基づく分析を返す。

### 「CORTEX改善」
1. まず `npx tsx lib/cortex/autonomous/check-and-improve.ts` を実行
2. improvements_needed がある場合、`lib/viral-hooks/hook-templates.ts` を編集
3. `cortex/auto-improvement` ブランチ作成 → コミット → `gh pr create`
4. PRのURLをDiscordに報告

### 「CORTEX分析」
`npx tsx lib/cortex/autonomous/check-and-improve.ts` を実行し、全分析結果をDiscordに報告。

### 「投稿して [テーマ]」
1. `npx tsx -e "..."` でSupabaseからpattern_performanceを取得
2. テーマに基づいてX投稿案を生成
3. Discordにプレビュー表示
4. 「投稿する」と返信されたら実際にX投稿

## ルール
- .env.local の秘密鍵をDiscordに表示しない
- 既存パターンは削除しない（スコア更新のみ）
- PRは必ずレビュー可能な形で作成
