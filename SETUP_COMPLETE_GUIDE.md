# Phase 1: セットアップ完了ガイド

**現在の状況**: Grafana MCP Server は設定完了 ✅ / Docker インストール待ち ⏸️

---

## ✅ 完了している設定

### 1. Grafana MCP Server

- **バイナリ**: `/Users/nands/my-corporate-site/mcp-grafana` (v0.7.10)
- **Cursor MCP 設定**: `/Users/nands/.cursor/mcp.json` に追加済み

```json
"grafana": {
  "command": "/Users/nands/my-corporate-site/mcp-grafana",
  "args": ["-t", "stdio"],
  "env": {
    "GRAFANA_URL": "http://localhost:3001",
    "GRAFANA_SERVICE_ACCOUNT_TOKEN": ""
  },
  "type": "stdio"
}
```

### 2. Django RAG API

- **コード**: `backend/` ディレクトリに実装済み
- **Docker設定**: `docker-compose.yml` 作成済み

---

## 🚀 次の3ステップで完了

### Option A: Docker Desktop を使用（推奨）

#### Step 1: Docker Desktop を手動インストール

```bash
# ターミナルで実行（sudoパスワード入力が必要）
brew install --cask docker
# または
open https://www.docker.com/products/docker-desktop
```

**手動でインストール後**:

```bash
# Docker Desktop を起動
open -a Docker

# 起動確認（数秒待つ）
docker ps
```

#### Step 2: サービスを起動

```bash
cd /Users/nands/my-corporate-site

# サービス起動
docker compose up -d

# 起動確認
docker compose ps

# Django マイグレーション
docker compose exec backend python manage.py migrate
```

#### Step 3: Grafana Service Account Token を作成

1. **Grafana にアクセス**: http://localhost:3001
2. **ログイン**: admin / admin
3. **Service Account 作成**:
   - Administration → Service accounts → Add service account
   - Name: `mcp-server`, Role: `Editor`
4. **Token 生成**: Add service account token → トークンをコピー
5. **設定に追加**:
   ```bash
   # /Users/nands/.cursor/mcp.json を編集
   # "GRAFANA_SERVICE_ACCOUNT_TOKEN": "コピーしたトークン"
   ```
6. **Cursor を再起動**

---

### Option B: Grafana Cloud を使用（Docker不要）

**より簡単でDocker不要！**

#### Step 1: Grafana Cloud にサインアップ

```bash
open https://grafana.com/auth/sign-up/create-user
```

- 無料プランを選択
- スタックを作成

#### Step 2: Service Account Token を作成

1. Grafana Cloud ダッシュボードで Service Account を作成
2. Token を生成してコピー

#### Step 3: Cursor MCP 設定を更新

`/Users/nands/.cursor/mcp.json` を編集:

```json
"grafana": {
  "command": "/Users/nands/my-corporate-site/mcp-grafana",
  "args": ["-t", "stdio"],
  "env": {
    "GRAFANA_URL": "https://your-stack.grafana.net",
    "GRAFANA_SERVICE_ACCOUNT_TOKEN": "コピーしたトークン"
  },
  "type": "stdio"
}
```

#### Step 4: Cursor を再起動

完了！すぐに使えます。

---

### Option C: ローカル Grafana を Homebrew でインストール

```bash
# Grafana をインストール
brew install grafana

# 起動
brew services start grafana

# アクセス
open http://localhost:3000
```

その後、Option A の Step 3 と同じ手順で Token を作成。

---

## 🧪 動作確認

### Cursor で Grafana MCP Server をテスト

Cursor を起動して、以下のプロンプトを試してください:

```
Grafanaのダッシュボードを検索してください
```

または

```
Grafanaで利用可能なデータソースをリストしてください
```

**期待される動作**: Grafana MCP Server が `list_datasources` や `search_dashboards` ツールを呼び出す

---

## 📊 推奨: 最速セットアップ

**最も簡単な方法は Option B (Grafana Cloud) です！**

1. Grafana Cloud にサインアップ（5分）
2. Service Account Token を作成（2分）
3. Cursor MCP 設定を更新（1分）
4. Cursor を再起動（1分）

**合計約9分で完了！**

---

## 🔧 トラブルシューティング

### エラー: `connection refused`

→ GrafanaのURLが正しいか確認:
- ローカル: `http://localhost:3001` or `http://localhost:3000`
- Cloud: `https://your-stack.grafana.net`

### エラー: `401 Unauthorized`

→ Service Account Token を再生成して設定を更新

### Grafana MCP Server が Cursor で認識されない

→ 以下を確認:
1. `/Users/nands/.cursor/mcp.json` の JSON 構文が正しいか
2. Cursor を完全に再起動（タスクマネージャーでプロセスを終了）

---

## 📚 参考ドキュメント

- [08_GRAFANA_MCP_SETUP.md](./docs/phase-1-django-rag-foundation/08_GRAFANA_MCP_SETUP.md) - Grafana MCP詳細
- [09_DOCKER_SETUP.md](./docs/phase-1-django-rag-foundation/09_DOCKER_SETUP.md) - Docker セットアップ

---

## ✅ 完了チェックリスト

- [x] Grafana MCP Server バイナリ ダウンロード
- [x] Cursor MCP 設定 追加
- [ ] Docker Desktop インストール（または Grafana Cloud 使用）
- [ ] Grafana 起動
- [ ] Service Account Token 作成
- [ ] Cursor MCP 設定に Token 追加
- [ ] Cursor 再起動
- [ ] 動作確認

---

**Phase 1 セットアップ完了まであと少しです！**

推奨: **Option B (Grafana Cloud)** で最速セットアップ 🚀

---

**作成日**: 2025年12月29日  
**Phase**: 1/4  
**次のアクション**: Grafana Cloud または Docker Desktop をセットアップ

