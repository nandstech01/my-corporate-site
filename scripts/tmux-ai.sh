#!/usr/bin/env bash
set -euo pipefail

# my-corporate-site 用 tmux レイアウト
# - 既存の本番/SEO影響を考慮し「サーバー起動や破壊的コマンド」は自動では実行しない
# - 各ペインで必要に応じて `claude` を手動で起動（もしくは AUTO_START_CLAUDE=1）

SESSION="${SESSION_NAME:-nands-ai}"
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

ensure_tmux() {
  if ! command -v tmux >/dev/null 2>&1; then
    echo "tmux が見つかりません。先に tmux をインストールしてください。" >&2
    exit 1
  fi
}

new_window_shell() {
  local win="$1"
  local cmd="$2"
  tmux new-window -t "${SESSION}" -n "${win}" "bash -lc '${cmd}; exec \$SHELL -l'"
}

maybe_start_claude() {
  if [[ "${AUTO_START_CLAUDE:-0}" == "1" ]]; then
    echo "claude"
  else
    echo "echo \"Hint: claude を起動するなら 'claude'（PM/Reviewer など役割に応じて運用）\""
  fi
}

ensure_tmux

if tmux has-session -t "${SESSION}" 2>/dev/null; then
  tmux attach -t "${SESSION}"
  exit 0
fi

tmux new-session -d -s "${SESSION}" -n "CEO" "bash -lc 'echo \"CEO(横断PM): ~/.claude/agents/ceo.md を前提に運用\"; $(maybe_start_claude); exec \$SHELL -l'"

# my-corporate-site（このリポジトリ）
new_window_shell "my:pm" "cd \"${ROOT_DIR}\"; echo \"PM: my-corporate-site\"; $(maybe_start_claude)"
new_window_shell "my:eng-next" "cd \"${ROOT_DIR}\"; echo \"Engineer: Next.js（app/components/src/lib など）\"; $(maybe_start_claude)"
new_window_shell "my:eng-backend" "cd \"${ROOT_DIR}/backend\"; echo \"Engineer: backend（Django/Docker/MLflow/Grafana）※危険領域\"; $(maybe_start_claude)"
new_window_shell "my:review" "cd \"${ROOT_DIR}\"; echo \"Reviewer/QA\"; $(maybe_start_claude)"

tmux select-window -t "${SESSION}:CEO"
tmux attach -t "${SESSION}"


