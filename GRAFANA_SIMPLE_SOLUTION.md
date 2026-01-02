# Grafana 簡単セットアップ - Docker問題の回避策

**問題**: macOS Keychain と Docker の統合に問題があり、イメージのpullができません。

**解決策**: 以下の3つの方法から選択してください。

---

## 🎯 方法1: Docker Desktop UIから起動（最も簡単！推奨）

### Step 1: Docker Desktop を開く

メニューバーの 🐋 アイコンをクリック → Docker Desktop を開く

### Step 2: Grafanaイメージを検索

1. 上部の **検索バー**で `grafana/grafana` と入力
2. **Images** タブをクリック
3. **Pull** ボタンをクリック
4. **Tag**: `10.4.2` を入力
5. **Pull** をクリック

### Step 3: コンテナを起動

1. **Images** タブに移動
2. `grafana/grafana:10.4.2` を見つける
3. **Run** ボタン（▶️）をクリック
4. **Optional settings** を展開：

   **Container name**:
   ```
   rag_grafana
   ```

   **Ports**:
   ```
   Host port: 3001
   Container port: 3000
   ```

   **Environment variables** (+ボタンをクリック):
   ```
   GF_SECURITY_ADMIN_USER=admin
   GF_SECURITY_ADMIN_PASSWORD=admin
   GF_SERVER_ROOT_URL=http://localhost:3001
   ```

5. **Run** をクリック

### Step 4: Grafana にアクセス

```bash
open http://localhost:3001
```

**ログイン**:
- Username: `admin`
- Password: `admin`

---

## 🎯 方法2: Grafana Cloud を使う（アカウント作成必要）

### メリット

- ✅ Docker の問題を完全に回避
- ✅ 高可用性
- ✅ 自動バックアップ
- ✅ 無料プラン available

### Step 1: Grafana Cloud にサインアップ

```bash
open https://grafana.com/auth/sign-up/create-user
```

### Step 2: Stack を作成

1. ログイン後、**"Create a stack"** をクリック
2. Stack name: `my-corporate-site-rag`
3. **Create stack** をクリック

### Step 3: Service Account Token を作成

1. **Administration** → **Service accounts**
2. **Create service account**
3. Display name: `MCP Server`
4. Role: `Admin`
5. **Create**
6. **Add service account token**
7. Token をコピー（`glc_XXX...`の形式）

### Step 4: Grafana URL と Token を設定

`~/.cursor/mcp.json` を更新：

```json
"grafana": {
  "command": "/Users/nands/my-corporate-site/mcp-grafana",
  "args": ["-t", "stdio"],
  "env": {
    "GRAFANA_URL": "https://YOUR_STACK_NAME.grafana.net",
    "GRAFANA_SERVICE_ACCOUNT_TOKEN": "glc_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
  },
  "type": "stdio"
}
```

---

## 🎯 方法3: ローカルGrafana（Homebrewで直接インストール）

Docker を使わずに、Grafana を直接インストール：

```bash
# Grafana をインストール
brew install grafana

# Grafana を起動
brew services start grafana

# ブラウザで開く
open http://localhost:3000
```

**ログイン**:
- Username: `admin`
- Password: `admin`

**Service Account Token 作成**:
1. Administration → Service accounts
2. Add service account
3. Display name: `MCP Server`
4. Role: `Admin`
5. Create
6. Add service account token
7. Token をコピー

**mcp.json を更新**:
```json
"grafana": {
  "command": "/Users/nands/my-corporate-site/mcp-grafana",
  "args": ["-t", "stdio"],
  "env": {
    "GRAFANA_URL": "http://localhost:3000",
    "GRAFANA_SERVICE_ACCOUNT_TOKEN": "glsa_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
  },
  "type": "stdio"
}
```

---

## 🔑 Service Account Token 作成手順（共通）

すべての方法で、以下の手順でTokenを作成します：

### Step 1: Grafana にログイン

- **ローカル**: http://localhost:3001 または http://localhost:3000
- **Cloud**: https://YOUR_STACK_NAME.grafana.net

### Step 2: Service Account を作成

1. 左メニューの **⚙️ (Administration)** をクリック
2. **Service accounts** を選択
3. **Add service account** をクリック
4. **Display name**: `MCP Server`
5. **Role**: `Admin`
6. **Create** をクリック

### Step 3: Token を生成

1. 作成した Service Account をクリック
2. **Add service account token** をクリック
3. **Display name**: `MCP Token`
4. **Generate token** をクリック
5. **Token をコピー**

   ローカル:
   ```
   glsa_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   ```

   Cloud:
   ```
   glc_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   ```

⚠️ **重要**: Token は一度しか表示されません！

---

## 📝 mcp.json を更新

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
    "GRAFANA_URL": "YOUR_GRAFANA_URL",
    "GRAFANA_SERVICE_ACCOUNT_TOKEN": "YOUR_TOKEN"
  },
  "type": "stdio"
}
```

**保存**: `Ctrl + O` → `Enter` → `Ctrl + X`

---

## 🔄 Cursor を再起動

```bash
# Cursor を終了: ⌘ + Q
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

## ✅ 推奨方法

| 方法 | 難易度 | 推奨度 | 理由 |
|------|--------|--------|------|
| **Docker Desktop UI** | ⭐☆☆☆☆ | ⭐⭐⭐⭐⭐ | 最も簡単、Docker問題を回避 |
| **Grafana Cloud** | ⭐⭐☆☆☆ | ⭐⭐⭐⭐☆ | 高可用性、管理不要 |
| **Homebrew** | ⭐⭐⭐☆☆ | ⭐⭐⭐☆☆ | Dockerを使わない |

**私の推奨**: **Docker Desktop UI**（方法1）

---

## 🎉 完了後

すべてのPhase 1サービスが起動します：
- ✅ Grafana（ポート3001または3000）
- ✅ Grafana MCP Server（Cursor統合）
- 🔜 Django RAG Backend（次のステップ）

---

**作成日**: 2025年12月29日  
**所要時間**: 約5-10分（方法による）

