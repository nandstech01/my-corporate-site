# Docker MCP Toolkit クイックスタート

**最速セットアップ**: Docker Desktop + MCP Toolkit で Grafana MCP Server を使う

---

## 🎯 3ステップで完了

### Step 1: Docker Desktop をインストール (5分)

```bash
# ターミナルで実行（sudo パスワード入力が必要）
brew install --cask docker

# Docker Desktop を起動
open -a Docker

# 起動確認（数秒待つ）
docker ps
```

### Step 2: Docker MCP Toolkit を有効化 (1分)

1. **Docker Desktop を開く**
2. **⚙️ Settings → Beta features**
3. **"Enable Docker MCP Toolkit"** にチェック
4. **Apply** をクリック

### Step 3: Cursor に接続 (1分)

**自動接続**:
1. **Docker Desktop → MCP Toolkit → Clients**
2. **Cursor** を見つけて **Connect** をクリック

**または手動**: `/Users/nands/.cursor/mcp.json` は既に設定済み ✅

```json
"MCP_DOCKER": {
  "command": "docker",
  "args": ["mcp", "gateway", "run"],
  "type": "stdio"
}
```

---

## ✅ 動作確認

### 1. Cursor を再起動

### 2. MCP サーバーを追加

**Docker Desktop で**:
1. **MCP Toolkit → Catalog**
2. **"GitHub Official"** を検索 → **Add (+)**
3. **OAuth** で GitHub 認証
4. **"Grafana"** も同様に追加

### 3. Cursor でテスト

```
Use the GitHub MCP server to list my repositories
```

---

## 🎉 完了！

これで Docker MCP Toolkit 経由で複数の MCP サーバーを使えます：

- ✅ GitHub
- ✅ Grafana
- ✅ Playwright
- ✅ その他 MCP Catalog のすべてのサーバー

---

## 📚 詳細ドキュメント

- [10_DOCKER_MCP_TOOLKIT.md](./docs/phase-1-django-rag-foundation/10_DOCKER_MCP_TOOLKIT.md)
- [Docker 公式ドキュメント](https://docs.docker.com/ai/mcp-catalog-and-toolkit/)

---

**合計所要時間**: 約7分  
**難易度**: ⭐☆☆☆☆ (とても簡単)

