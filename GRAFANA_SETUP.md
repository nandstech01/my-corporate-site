# Grafana Service Account Token 取得手順

**Grafana を起動して、Service Account Token を作成します。**

---

## 🔧 Step 0: Docker エラーの修正

### エラー内容
```
error getting credentials - err: exit status 1
```

### 解決方法（2つ）

#### 方法1: Docker Desktop を再起動（推奨）

1. メニューバーの **🐋 Docker アイコン**をクリック
2. **Quit Docker Desktop** を選択
3. **Docker Desktop を再起動**
   ```bash
   open /Applications/Docker.app
   ```
4. 30秒待つ

#### 方法2: Credential Helper を一時的に無効化

```bash
# バックアップ
cp ~/.docker/config.json ~/.docker/config.json.backup

# credsStore を削除
cat > ~/.docker/config.json << 'EOF'
{
  "auths": {},
  "currentContext": "desktop-linux"
}
EOF
```

---

## 🚀 Step 1: Grafana を起動

### ターミナルで実行

```bash
cd /Users/nands/my-corporate-site

# Grafana を起動
docker-compose up -d grafana

# 起動確認
docker ps | grep grafana
```

**起動成功の表示**:
```
rag_grafana   grafana/grafana:10.4.2   Up   0.0.0.0:3001->3000/tcp
```

---

## 🌐 Step 2: Grafana にアクセス

### ブラウザで開く

```bash
open http://localhost:3001
```

### ログイン

- **Username**: `admin`
- **Password**: `admin`

初回ログイン時、パスワード変更を求められます：
- **Skip** をクリック（開発環境なので）
- または新しいパスワードを設定

---

## 🔑 Step 3: Service Account を作成

### 3-1. Administration メニュー

1. 左側のメニューから **⚙️ (Administration)** をクリック
2. **Service accounts** を選択

### 3-2. Service Account を追加

1. 右上の **Add service account** をクリック
2. 以下を入力：
   - **Display name**: `MCP Server`
   - **Role**: `Admin`
3. **Create** をクリック

### 3-3. Token を生成

1. 作成した Service Account をクリック
2. **Add service account token** をクリック
3. 以下を入力：
   - **Display name**: `MCP Token`
4. **Generate token** をクリック

### 3-4. Token をコピー

**⚠️ 重要**: Token は一度しか表示されません！

```
glsa_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

この形式のトークンをコピーしてください。

---

## 📝 Step 4: Token を設定

### 4-1. mcp.json を更新

```bash
nano ~/.cursor/mcp.json
```

または Cursor で開く：
```bash
cursor ~/.cursor/mcp.json
```

### 4-2. GRAFANA_SERVICE_ACCOUNT_TOKEN に貼り付け

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

## ✅ Step 5: Cursor を再起動

```bash
# Cursor を完全に終了
# ⌘ + Q

# Cursor を再起動
open -a Cursor
```

---

## 🧪 Step 6: 動作確認

### Cursor で確認

1. **Cursor Settings → Tools & MCP**
2. **grafana** が表示されることを確認

### プロンプトでテスト

```
Use the Grafana MCP server to list all dashboards
```

---

## 📊 Step 7: Phase 1 サービス起動（完全版）

すべてのサービスを起動：

```bash
cd /Users/nands/my-corporate-site

# すべてのサービスを起動
docker-compose up -d

# 確認
docker ps
```

**起動するサービス**:
- ✅ **rag_backend** (Django) - ポート 8000
- ✅ **rag_grafana** (Grafana) - ポート 3001

---

## ❓ トラブルシューティング

### Grafana にアクセスできない

```bash
# Grafana のログを確認
docker logs rag_grafana

# Grafana を再起動
docker-compose restart grafana
```

### Service Account が見つからない

→ **Grafana のバージョンを確認**
```bash
docker exec rag_grafana grafana-cli --version
```

Grafana 9.0+ が必要です。

### Token が無効

→ **新しい Token を作成**
1. Grafana → Administration → Service accounts
2. 既存の Service Account を開く
3. 古い Token を削除
4. 新しい Token を生成

---

## 🎉 完了チェックリスト

- [ ] Docker Desktop を再起動
- [ ] Grafana を起動 (`docker-compose up -d grafana`)
- [ ] http://localhost:3001 にアクセス
- [ ] admin/admin でログイン
- [ ] Service Account を作成
- [ ] Token を生成
- [ ] Token をコピー
- [ ] `~/.cursor/mcp.json` に貼り付け
- [ ] Cursor を再起動
- [ ] Grafana MCP サーバーが動作確認

---

## 📚 関連ドキュメント

- [DOCKER_NEXT_STEPS.md](./DOCKER_NEXT_STEPS.md)
- [docs/phase-1-django-rag-foundation/08_GRAFANA_MCP_SETUP.md](./docs/phase-1-django-rag-foundation/08_GRAFANA_MCP_SETUP.md)

---

**所要時間**: 約5分  
**作成日**: 2025年12月29日

