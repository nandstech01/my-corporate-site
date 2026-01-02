# Phase 1: Docker セットアップガイド

**現状**: Docker がインストールされていません

---

## 🐳 Docker Desktop のインストール

### Option 1: Homebrew経由（推奨）

```bash
# Homebrewがインストールされているか確認
brew --version

# Docker Desktopをインストール
brew install --cask docker

# Docker Desktopを起動
open -a Docker
```

### Option 2: 公式サイトからダウンロード

1. **Docker Desktop for Mac をダウンロード**
   - https://www.docker.com/products/docker-desktop
   - Apple Silicon (M1/M2/M3) 版を選択

2. **インストール**
   - `.dmg` ファイルを開く
   - Docker.app を Applications フォルダにドラッグ

3. **起動**
   - Applications から Docker を起動
   - 初回起動時の設定を完了

---

## ✅ インストール確認

```bash
# Dockerバージョン確認
docker --version

# Docker Composeバージョン確認
docker compose version

# Dockerが動作しているか確認
docker ps
```

**期待される出力**:
```
Docker version 24.0.x, build xxxxx
Docker Compose version v2.x.x
CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS     NAMES
```

---

## 🚀 Docker インストール後の手順

### 1. Docker Composeでサービスを起動

```bash
cd /Users/nands/my-corporate-site

# Grafana と Django backend を起動
docker compose up -d

# 起動確認
docker compose ps
```

### 2. Django マイグレーション実行

```bash
# データベーステーブルを作成
docker compose exec backend python manage.py migrate

# 確認
docker compose exec backend python manage.py showmigrations
```

### 3. Grafana にアクセス

```bash
# ブラウザで開く
open http://localhost:3001

# ログイン情報
# ユーザー名: admin
# パスワード: admin
```

---

## 🔧 Docker なしの代替案

Docker をインストールしたくない場合、以下の方法があります:

### Option A: Grafana Cloud を使用

1. **Grafana Cloud にサインアップ**
   - https://grafana.com/auth/sign-up/create-user
   - 無料プランあり

2. **Cursor MCP 設定を更新**
   ```json
   "grafana": {
     "command": "/Users/nands/my-corporate-site/mcp-grafana",
     "args": ["-t", "stdio"],
     "env": {
       "GRAFANA_URL": "https://your-stack.grafana.net",
       "GRAFANA_SERVICE_ACCOUNT_TOKEN": "your-cloud-token"
     },
     "type": "stdio"
   }
   ```

### Option B: ローカル Grafana バイナリをインストール

```bash
# Homebrewでインストール
brew install grafana

# 起動
brew services start grafana

# アクセス
open http://localhost:3000
```

---

## 📊 サービス構成

### Docker Compose 構成

```yaml
services:
  backend:
    # Django RAG API
    # ポート: 8000
    
  grafana:
    # Grafana ダッシュボード
    # ポート: 3001
    # データソース: Supabase PostgreSQL
```

---

## 🧪 動作確認コマンド

```bash
# すべてのサービスが起動しているか確認
docker compose ps

# ログを確認
docker compose logs -f backend
docker compose logs -f grafana

# 特定のサービスを再起動
docker compose restart backend

# すべてのサービスを停止
docker compose down

# すべてのサービスを停止してボリュームも削除
docker compose down -v
```

---

## ❓ トラブルシューティング

### エラー: `Cannot connect to the Docker daemon`

→ **原因**: Docker Desktop が起動していない  
→ **解決**: Docker Desktop アプリを起動

```bash
open -a Docker
```

### エラー: `port 3001 is already in use`

→ **原因**: ポート 3001 が既に使用されている  
→ **解決**: 使用中のプロセスを確認して停止

```bash
# ポート3001を使用しているプロセスを確認
lsof -i :3001

# プロセスを停止
kill -9 <PID>
```

### Docker Desktop の起動が遅い

→ **対策**:
1. Docker Desktop の設定で使用するリソース（CPU、メモリ）を調整
2. 不要なコンテナやイメージを削除

```bash
# 停止中のコンテナを削除
docker container prune

# 未使用のイメージを削除
docker image prune -a
```

---

## 🎯 次のステップ

1. **Docker Desktop をインストール** ← 今ここ
2. `docker compose up -d` でサービス起動
3. Django マイグレーション実行
4. Grafana にアクセス
5. Service Account Token 作成
6. Cursor で Grafana MCP Server を使用

---

**作成日**: 2025年12月29日  
**Phase**: 1/4  
**ステータス**: Docker インストール待ち

