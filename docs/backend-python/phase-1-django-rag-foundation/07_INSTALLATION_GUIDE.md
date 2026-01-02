# Phase 1: インストールガイド

**Django、Python、Grafana MCP Server の完全インストール手順**

---

## 📋 インストール概要

このガイドでは、以下を順番にインストールします:

1. **Python & Django** (Docker経由で自動インストール)
2. **Grafana MCP Server** (公式MCPサーバーを統合)
3. **動作確認**

---

## 🐍 Step 1: Python & Django のインストール

### Docker Composeによる自動インストール

**重要**: Python と Django は Docker コンテナ内に自動的にインストールされます。

#### 1-1. 環境変数の設定

既存の`.env`ファイルに以下を追加:

```bash
# プロジェクトルートで実行
cd /Users/nands/my-corporate-site

# Django用環境変数を追加
cat >> .env << 'EOF'

# ========================================
# Django RAG API 追加設定 (2025-12-29)
# ========================================
DJANGO_SECRET_KEY=django-insecure-dev-key-change-in-production
DEBUG=True
EOF
```

#### 1-2. Docker Composeでバックエンド起動

```bash
# Dockerコンテナをビルド & 起動
docker-compose up -d backend

# ログ確認
docker-compose logs -f backend
```

#### 1-3. Django マイグレーション実行

```bash
# データベーステーブル作成
docker-compose exec backend python manage.py migrate

# 確認
docker-compose exec backend python manage.py showmigrations
```

#### 1-4. Python & Django バージョン確認

```bash
# Pythonバージョン確認
docker-compose exec backend python --version
# 期待: Python 3.11.x

# Djangoバージョン確認
docker-compose exec backend python -m django --version
# 期待: 5.0.x
```

---

## 📊 Step 2: Grafana MCP Server のセットアップ

### Grafana公式MCPサーバーとは

**Grafana MCP Server** (`grafana/mcp-grafana`) は、Grafana公式が提供するModel Context Protocol (MCP) サーバーです。

- **GitHub**: https://github.com/grafana/mcp-grafana
- **機能**: ダッシュボード検索、データソース操作、Prometheus/Loki クエリ、アラート管理など
- **言語**: Go
- **トランスポート**: STDIO / SSE / Streamable HTTP

### 2-1. Grafana MCP Server のインストール

#### オプション A: バイナリをダウンロード (推奨)

```bash
# プロジェクトルートで実行
cd /Users/nands/my-corporate-site

# 最新リリースをダウンロード (macOS Apple Silicon)
curl -L https://github.com/grafana/mcp-grafana/releases/latest/download/mcp-grafana-darwin-arm64 -o mcp-grafana

# 実行権限を付与
chmod +x mcp-grafana

# バージョン確認
./mcp-grafana --help
```

#### オプション B: Dockerイメージを使用

```bash
# Dockerイメージをプル
docker pull mcp/grafana

# 動作確認 (STDIOモード)
docker run --rm -i \
  -e GRAFANA_URL=http://localhost:3001 \
  -e GRAFANA_SERVICE_ACCOUNT_TOKEN=dummy \
  mcp/grafana -t stdio --help
```

### 2-2. Grafana Service Account Token の作成

Grafana MCP Serverは、Grafana APIにアクセスするためのサービスアカウントトークンが必要です。

#### 手順:

1. **Grafana UI にアクセス**
   ```
   http://localhost:3001
   ユーザー名: admin
   パスワード: admin
   ```

2. **Service Account を作成**
   - 左メニュー: Administration → Service accounts
   - "Add service account" をクリック
   - 名前: `mcp-server`
   - ロール: `Editor` (読み取り・書き込み権限)

3. **Token を生成**
   - "Add service account token" をクリック
   - トークンをコピー

4. **`.env` に追加**
   ```bash
   # .envファイルに追加
   cat >> .env << 'EOF'
   
   # Grafana MCP Server
   GRAFANA_SERVICE_ACCOUNT_TOKEN=your-service-account-token-here
   EOF
   ```

### 2-3. Grafana MCP Server の設定

#### Claude Desktop / Cursor用の設定例

**`~/.config/claude/config.json`** (または Cursor の設定ファイル):

```json
{
  "mcpServers": {
    "grafana": {
      "command": "/Users/nands/my-corporate-site/mcp-grafana",
      "args": ["-t", "stdio"],
      "env": {
        "GRAFANA_URL": "http://localhost:3001",
        "GRAFANA_SERVICE_ACCOUNT_TOKEN": "${GRAFANA_SERVICE_ACCOUNT_TOKEN}"
      }
    }
  }
}
```

**Docker版の設定例**:

```json
{
  "mcpServers": {
    "grafana": {
      "command": "docker",
      "args": [
        "run", "--rm", "-i",
        "-e", "GRAFANA_URL",
        "-e", "GRAFANA_SERVICE_ACCOUNT_TOKEN",
        "mcp/grafana",
        "-t", "stdio"
      ],
      "env": {
        "GRAFANA_URL": "http://localhost:3001",
        "GRAFANA_SERVICE_ACCOUNT_TOKEN": "${GRAFANA_SERVICE_ACCOUNT_TOKEN}"
      }
    }
  }
}
```

---

## 🧪 Step 3: 動作確認

### 3-1. Django RAG API の動作確認

```bash
# Health Check
curl http://localhost:8000/api/rag/health

# RAG Search (テスト)
curl -X POST http://localhost:8000/api/rag/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "AIエージェント開発について教えてください",
    "sources": ["fragment", "company"],
    "threshold": 0.3,
    "limit": 3
  }'
```

### 3-2. Grafana の動作確認

```bash
# Grafana UIにアクセス
open http://localhost:3001

# ログイン
# ユーザー名: admin
# パスワード: admin
```

### 3-3. Grafana MCP Server の動作確認

#### STDIO モードでテスト (手動)

```bash
# 環境変数を設定
export GRAFANA_URL=http://localhost:3001
export GRAFANA_SERVICE_ACCOUNT_TOKEN=your-service-account-token

# MCPサーバーを起動 (STDIOモード)
./mcp-grafana -t stdio
```

**期待される出力**: MCPサーバーが起動し、標準入出力で通信可能な状態になります。

#### Claude Desktop / Cursor から確認

1. Claude Desktop または Cursor を再起動
2. "Grafana MCP Server" が利用可能なツールとして表示されることを確認
3. 以下のようなプロンプトでテスト:
   ```
   Grafanaのダッシュボードを検索してください
   ```

---

## 📂 インストール後のディレクトリ構成

```
/Users/nands/my-corporate-site/
├── backend/                    # Django RAG API
│   ├── Dockerfile             # Python 3.11 + Django 5.0
│   ├── requirements.txt       # Python依存関係
│   ├── manage.py
│   ├── rag_project/           # Django プロジェクト
│   └── rag_api/               # RAG API アプリ
├── docker-compose.yml         # Docker Compose設定
├── mcp-grafana                # Grafana MCP Server バイナリ
├── infra/
│   └── grafana/
│       └── provisioning/      # Grafana自動設定
└── .env                       # 環境変数 (Django + Grafana)
```

---

## ✅ インストール完了チェックリスト

- [ ] `.env`ファイルに`DJANGO_SECRET_KEY`と`DEBUG`を追加
- [ ] `docker-compose up -d backend`でDjangoコンテナ起動
- [ ] `docker-compose exec backend python manage.py migrate`でマイグレーション実行
- [ ] `curl http://localhost:8000/api/rag/health`でDjango API動作確認
- [ ] Grafana UI (`http://localhost:3001`) にアクセス可能
- [ ] Grafana Service Account Token を作成し、`.env`に追加
- [ ] `mcp-grafana`バイナリをダウンロードし、実行権限付与
- [ ] Claude Desktop / Cursor の設定ファイルに Grafana MCP Server を追加
- [ ] Claude Desktop / Cursor から Grafana MCP Server が利用可能

---

## 🔧 トラブルシューティング

### エラー: `django-admin: command not found`

→ **解決**: Djangoは Docker コンテナ内にインストールされます。ローカルにインストールする必要はありません。

### エラー: `docker-compose: command not found`

→ **解決**: Docker Desktop をインストールしてください。

```bash
# macOS (Homebrew)
brew install --cask docker
```

### エラー: `GRAFANA_SERVICE_ACCOUNT_TOKEN is not set`

→ **解決**: Grafana UIでサービスアカウントトークンを作成し、`.env`ファイルに追加してください。

### エラー: `mcp-grafana: permission denied`

→ **解決**: 実行権限を付与してください。

```bash
chmod +x mcp-grafana
```

### Grafana MCP Server が Claude Desktop で認識されない

→ **解決**:
1. Claude Desktop を完全に再起動
2. 設定ファイルのパスが正しいか確認
3. `mcp-grafana`のフルパスを指定

---

## 📚 参考リンク

- **Grafana MCP Server GitHub**: https://github.com/grafana/mcp-grafana
- **Model Context Protocol**: https://modelcontextprotocol.io/
- **Django 公式ドキュメント**: https://docs.djangoproject.com/
- **Docker Compose 公式ドキュメント**: https://docs.docker.com/compose/

---

**作成日**: 2025年12月29日  
**Phase**: 1/4  
**対象**: Django、Python、Grafana MCP Server のインストール

