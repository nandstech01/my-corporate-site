# Docker Credentials エラーの解決方法

**エラー**: `error getting credentials - err: exit status 1`

このエラーは macOS Keychain の問題です。以下の方法で解決できます。

---

## 🔧 解決方法

### 方法1: Docker Desktop を完全に再起動（推奨）

#### ターミナルで実行:

```bash
# 1. Docker Desktop を完全に終了
pkill -9 -f Docker

# 2. 5秒待つ
sleep 5

# 3. Docker Desktop を再起動
open /Applications/Docker.app

# 4. 30秒待つ
sleep 30

# 5. 確認
docker ps
```

---

### 方法2: Docker Desktop UI から再起動

1. メニューバーの **🐋 Docker アイコン**をクリック
2. **"Troubleshoot"** を選択
3. **"Restart Docker Desktop"** をクリック
4. 30秒待つ

---

### 方法3: Keychain をリセット（詳細）

```bash
# 1. Keychain から Docker の認証情報を削除
security delete-internet-password -s "https://index.docker.io/v1/"

# 2. Docker config をリセット
rm ~/.docker/config.json
mkdir -p ~/.docker

# 3. 新しい config を作成
cat > ~/.docker/config.json << 'EOF'
{
  "auths": {},
  "currentContext": "desktop-linux"
}
EOF

# 4. Docker Desktop を再起動
pkill -9 -f Docker
sleep 5
open /Applications/Docker.app
sleep 30
```

---

## ✅ 再起動後の確認

```bash
# Docker が起動しているか確認
docker ps

# Grafana を起動
cd /Users/nands/my-corporate-site
docker-compose up -d grafana

# 起動確認
docker ps | grep grafana
```

**成功の表示**:
```
rag_grafana   grafana/grafana:10.4.2   Up   0.0.0.0:3001->3000/tcp
```

---

## 🌐 Grafana にアクセス

```bash
open http://localhost:3001
```

**ログイン**:
- Username: `admin`
- Password: `admin`

---

## 🔑 Service Account Token 作成

### Step 1: Administration → Service accounts

1. 左メニューの **⚙️ (Administration)** をクリック
2. **Service accounts** を選択

### Step 2: Service Account を追加

1. **Add service account** をクリック
2. **Display name**: `MCP Server`
3. **Role**: `Admin`
4. **Create** をクリック

### Step 3: Token を生成

1. 作成した Service Account をクリック
2. **Add service account token** をクリック
3. **Display name**: `MCP Token`
4. **Generate token** をクリック

### Step 4: Token をコピー

```
glsa_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

⚠️ **重要**: Token は一度しか表示されません！コピーしてください。

---

## 📝 Token を設定

### mcp.json を更新

```bash
# エディタで開く
nano ~/.cursor/mcp.json
```

### grafana セクションを更新

```json
"grafana": {
  "command": "/Users/nands/my-corporate-site/mcp-grafana",
  "args": ["-t", "stdio"],
  "env": {
    "GRAFANA_URL": "http://localhost:3001",
    "GRAFANA_SERVICE_ACCOUNT_TOKEN": "glsa_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
  },
  "type": "stdio"
}
```

**保存**: `Ctrl + O` → `Enter` → `Ctrl + X`

---

## 🔄 Cursor を再起動

```bash
# Cursor を終了
# ⌘ + Q

# Cursor を起動
open -a Cursor
```

---

## 🧪 動作確認

### Cursor で確認

1. **Cursor Settings → Tools & MCP**
2. **grafana** が表示されることを確認

### プロンプトでテスト

```
Use the Grafana MCP server to list all dashboards
```

---

## ❓ トラブルシューティング

### まだエラーが出る場合

```bash
# Docker のバージョン確認
docker --version

# Docker info
docker info

# Docker Desktop のログ確認
~/Library/Containers/com.docker.docker/Data/log/
```

### Grafana が起動しない

```bash
# ログ確認
docker logs rag_grafana

# 強制再作成
docker-compose down
docker-compose up -d --force-recreate grafana
```

---

**作成日**: 2025年12月29日

