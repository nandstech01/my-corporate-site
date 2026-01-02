# Phase 1: Docker MCP Toolkit 実装ガイド

**🎉 朗報**: Docker Desktop に統合された MCP Toolkit を使えば、Docker なしで MCP サーバーを実行できます！

---

## 🐳 Docker MCP Toolkit とは

**Docker MCP Toolkit** は、Docker Desktop に統合された公式機能で、コンテナ化された MCP サーバーを簡単にセットアップ・管理・実行できます。

### 主な特徴

- ✅ **セキュアなデフォルト設定**
- ✅ **Docker Desktop UI から簡単にインストール**
- ✅ **Cursor、Claude、VS Code など多数のクライアントに対応**
- ✅ **MCP Catalog から簡単にサーバーを追加**
- ✅ **OAuth 認証サポート**

---

## 📋 必要な環境

### 1. Docker Desktop (最新版)

```bash
# Docker Desktop をインストール
brew install --cask docker

# または公式サイトからダウンロード
open https://www.docker.com/products/docker-desktop
```

### 2. Docker MCP Toolkit を有効化

1. **Docker Desktop を起動**
2. **Settings (⚙️) → Beta features**
3. **"Enable Docker MCP Toolkit"** にチェック
4. **Apply** をクリック

---

## 🚀 セットアップ手順

### Step 1: MCP サーバーをインストール

#### Docker Desktop UI から (推奨)

1. **Docker Desktop を開く**
2. **MCP Toolkit** タブを選択
3. **Catalog** タブを選択
4. **GitHub Official** を検索して **+** アイコンをクリック
5. **Configuration** タブで **OAuth** を選択
6. ブラウザで GitHub 認証を完了
7. 同様に **Grafana** サーバーも追加

#### CLI から

```bash
# MCP Gateway を起動
docker mcp gateway run
```

### Step 2: Cursor に接続

#### 自動接続 (推奨)

1. **Docker Desktop を開く**
2. **MCP Toolkit → Clients** タブ
3. **Cursor** を見つけて **Connect** をクリック

#### 手動接続

`/Users/nands/.cursor/mcp.json` に以下を追加:

```json
{
  "mcpServers": {
    "MCP_DOCKER": {
      "command": "docker",
      "args": ["mcp", "gateway", "run"],
      "type": "stdio"
    }
  }
}
```

---

## ✅ 動作確認

### Cursor で確認

1. **Cursor を再起動**
2. **Cursor Settings → Tools & MCP**
3. **Installed MCP Servers** に `MCP_DOCKER` が表示されることを確認

### プロンプトでテスト

```
Use the GitHub MCP server to show me my open pull requests
```

または

```
Use the Grafana MCP server to list available dashboards
```

---

## 📊 利用可能な MCP サーバー

Docker MCP Catalog から以下のサーバーを簡単に追加できます:

### 開発ツール

- **GitHub Official** - リポジトリ、PR、Issue 管理
- **GitLab** - GitLab リポジトリ操作
- **Playwright** - ブラウザ自動化

### 監視・可視化

- **Grafana** - ダッシュボード、データソース、アラート管理
- **Prometheus** - メトリクス取得
- **Loki** - ログクエリ

### データベース

- **PostgreSQL** - データベース操作
- **MongoDB** - NoSQL データベース
- **Redis** - キャッシュ操作

### クラウド

- **AWS** - AWS リソース管理
- **Google Cloud** - GCP リソース管理
- **Azure** - Azure リソース管理

---

## 🎯 Grafana MCP Server の追加

### Docker MCP Toolkit 経由

1. **Docker Desktop → MCP Toolkit → Catalog**
2. **"Grafana"** を検索
3. **Add (+)** をクリック
4. **Configuration** で Grafana URL と Token を設定:
   ```
   GRAFANA_URL=http://localhost:3001
   GRAFANA_SERVICE_ACCOUNT_TOKEN=your-token
   ```

### 既存の mcp-grafana バイナリとの統合

既にダウンロードした `/Users/nands/my-corporate-site/mcp-grafana` も引き続き使用できます:

```json
{
  "mcpServers": {
    "MCP_DOCKER": {
      "command": "docker",
      "args": ["mcp", "gateway", "run"],
      "type": "stdio"
    },
    "grafana-direct": {
      "command": "/Users/nands/my-corporate-site/mcp-grafana",
      "args": ["-t", "stdio"],
      "env": {
        "GRAFANA_URL": "http://localhost:3001",
        "GRAFANA_SERVICE_ACCOUNT_TOKEN": ""
      },
      "type": "stdio"
    }
  }
}
```

---

## 🔧 高度な設定

### MCP Gateway の設定

Docker MCP Gateway は、複数の MCP サーバーを統合管理します。

#### 設定ファイルの場所

- **macOS**: `~/.docker/mcp-gateway/config.json`
- **Windows**: `%USERPROFILE%\.docker\mcp-gateway\config.json`

#### 設定例

```json
{
  "servers": {
    "github": {
      "type": "oauth",
      "provider": "github"
    },
    "grafana": {
      "type": "env",
      "env": {
        "GRAFANA_URL": "http://localhost:3001",
        "GRAFANA_SERVICE_ACCOUNT_TOKEN": "your-token"
      }
    }
  }
}
```

---

## 📝 Cursor での使用例

### プロンプト例 1: GitHub + Grafana

```
1. Use the GitHub MCP server to list my repositories
2. Use the Grafana MCP server to create a dashboard for monitoring these repos
```

### プロンプト例 2: マルチサーバー連携

```
Use the GitHub MCP server to find recent commits, 
then use the Grafana MCP server to visualize commit frequency
```

---

## 🆚 比較: Docker MCP Toolkit vs 直接バイナリ

| 特徴 | Docker MCP Toolkit | 直接バイナリ |
|------|-------------------|-------------|
| **インストール** | Docker Desktop UI | 手動ダウンロード |
| **管理** | UI で簡単 | 手動設定 |
| **更新** | 自動更新 | 手動更新 |
| **セキュリティ** | コンテナ分離 | ホスト実行 |
| **複数サーバー** | 統合管理 | 個別設定 |
| **OAuth** | サポート | 手動設定 |

**推奨**: Docker MCP Toolkit を使用（管理が簡単）

---

## ❓ トラブルシューティング

### エラー: `docker mcp: command not found`

→ **原因**: Docker MCP Toolkit が有効化されていない  
→ **解決**: Docker Desktop → Settings → Beta features → Enable Docker MCP Toolkit

### エラー: `MCP_DOCKER not showing in Cursor`

→ **解決**:
1. Cursor を完全に再起動
2. `/Users/nands/.cursor/mcp.json` の JSON 構文を確認
3. Docker Desktop で MCP Gateway が起動しているか確認

### MCP サーバーが接続できない

→ **確認事項**:
```bash
# Docker MCP Gateway の状態確認
docker ps | grep mcp

# ログ確認
docker logs $(docker ps -q --filter "name=mcp")
```

---

## 🎉 完了チェックリスト

- [ ] Docker Desktop インストール
- [ ] Docker MCP Toolkit 有効化
- [ ] MCP サーバーを追加 (GitHub, Grafana など)
- [ ] Cursor に接続
- [ ] Cursor 再起動
- [ ] MCP_DOCKER が表示されることを確認
- [ ] プロンプトでテスト

---

## 📚 参考リンク

- **Docker MCP Toolkit 公式ドキュメント**: https://docs.docker.com/ai/mcp-catalog-and-toolkit/
- **MCP Catalog**: https://docs.docker.com/ai/mcp-catalog-and-toolkit/catalog/
- **MCP Gateway**: https://docs.docker.com/ai/mcp-catalog-and-toolkit/mcp-gateway/
- **Docker Blog**: https://www.docker.com/blog/introducing-docker-mcp-catalog-and-toolkit/

---

## 🚀 次のステップ

1. **Docker Desktop をインストール** (sudo パスワード入力)
2. **Docker MCP Toolkit を有効化**
3. **Grafana MCP Server を追加**
4. **Cursor で使用開始！**

---

**作成日**: 2025年12月29日  
**Phase**: 1/4  
**ステータス**: Docker MCP Toolkit 実装ガイド完成 ✅

