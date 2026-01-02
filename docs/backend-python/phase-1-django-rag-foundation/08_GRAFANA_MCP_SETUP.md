# Phase 1: Grafana MCP Server セットアップガイド

**✅ 完了**: Cursor MCP設定に Grafana MCP Server を追加しました

---

## 📋 実装済み内容

### 1. Grafana MCP Server バイナリ

- **場所**: `/Users/nands/my-corporate-site/mcp-grafana`
- **バージョン**: v0.7.10
- **サイズ**: 約40MB
- **実行権限**: 付与済み

### 2. Cursor MCP 設定

**`/Users/nands/.cursor/mcp.json`** に以下を追加:

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

---

## 🚀 次に実施する手順

### Step 1: Docker Desktop を起動

```bash
# Docker Desktop が起動しているか確認
docker ps

# 起動していない場合、Docker Desktop アプリを起動してください
open -a Docker
```

### Step 2: Docker Composeでサービスを起動

```bash
cd /Users/nands/my-corporate-site

# Grafana と Django backend を起動
docker compose up -d

# 起動確認
docker compose ps

# ログ確認
docker compose logs -f grafana
```

### Step 3: Grafana にアクセス

```bash
# ブラウザで開く
open http://localhost:3001

# ログイン情報
# ユーザー名: admin
# パスワード: admin
```

### Step 4: Grafana Service Account Token を作成

#### 4-1. Service Account を作成

1. Grafana UI にログイン
2. 左メニュー → **Administration** → **Service accounts**
3. **Add service account** をクリック
4. **Display name**: `mcp-server`
5. **Role**: `Editor` (読み取り・書き込み権限)
6. **Create** をクリック

#### 4-2. Token を生成

1. 作成した `mcp-server` をクリック
2. **Add service account token** をクリック
3. **Display name**: `mcp-token`
4. **Generate token** をクリック
5. **トークンをコピー** (⚠️ 一度しか表示されません)

#### 4-3. Cursor MCP 設定にトークンを追加

**`/Users/nands/.cursor/mcp.json`** を編集:

```json
"grafana": {
  "command": "/Users/nands/my-corporate-site/mcp-grafana",
  "args": ["-t", "stdio"],
  "env": {
    "GRAFANA_URL": "http://localhost:3001",
    "GRAFANA_SERVICE_ACCOUNT_TOKEN": "コピーしたトークンをここに貼り付け"
  },
  "type": "stdio"
}
```

### Step 5: Cursor を再起動

Cursor を完全に再起動して、MCP 設定を読み込み直してください。

---

## ✅ 動作確認

### Cursor で Grafana MCP Server が利用可能か確認

1. Cursor を起動
2. Composer や Chat で以下のようなプロンプトを入力:

```
Grafanaのダッシュボードを検索してください
```

または

```
Grafanaで利用可能なデータソースをリストしてください
```

### 期待される動作

- Grafana MCP Server が `list_datasources` や `search_dashboards` ツールを呼び出す
- Grafana UIで作成したダッシュボードやデータソースが表示される

---

## 🔧 トラブルシューティング

### エラー: `connection refused`

→ **原因**: Grafana が起動していない  
→ **解決**:

```bash
docker compose up -d grafana
docker compose logs -f grafana
```

### エラー: `401 Unauthorized`

→ **原因**: Service Account Token が無効  
→ **解決**:
1. Grafana UI で新しいトークンを生成
2. `/Users/nands/.cursor/mcp.json` を更新
3. Cursor を再起動

### Grafana MCP Server が Cursor で認識されない

→ **解決**:
1. `/Users/nands/.cursor/mcp.json` の JSON 構文が正しいか確認
2. `mcp-grafana` バイナリのパスが正しいか確認
3. Cursor を完全に再起動（タスクマネージャーでプロセスを終了）

### Docker Desktop が起動しない

→ **解決**:
```bash
# Docker Desktop をインストール
brew install --cask docker

# 手動で起動
open -a Docker
```

---

## 📊 Grafana MCP Server の機能

### 利用可能なツール

1. **ダッシュボード操作**
   - `search_dashboards` - ダッシュボード検索
   - `get_dashboard_by_uid` - ダッシュボード取得
   - `get_dashboard_summary` - ダッシュボード概要
   - `update_dashboard` - ダッシュボード更新

2. **データソース**
   - `list_datasources` - データソース一覧
   - `get_datasource_by_uid` - データソース取得

3. **Prometheus**
   - `query_prometheus` - PromQL クエリ実行
   - `list_prometheus_metric_names` - メトリック名一覧

4. **Loki**
   - `query_loki_logs` - LogQL でログクエリ
   - `list_loki_label_names` - ラベル名一覧

5. **アラート**
   - `list_alert_rules` - アラートルール一覧
   - `get_alert_rule_by_uid` - アラートルール取得
   - `list_contact_points` - 通知先一覧

6. **その他**
   - `generate_deeplink` - Grafana リソースへのディープリンク生成
   - `get_annotations` - アノテーション取得

---

## 🎯 使用例

### プロンプト例 1: ダッシュボード検索

```
Grafanaで "Kubernetes" を含むダッシュボードを検索して、
各ダッシュボードのパネル数とタイプを教えてください
```

### プロンプト例 2: データソース確認

```
Grafanaに接続されているPrometheusデータソースを確認して、
利用可能なメトリック名を10件リストしてください
```

### プロンプト例 3: ログクエリ

```
Lokiで過去1時間のエラーログを検索して、
エラーの種類ごとに集計してください
```

---

## 📚 参考リンク

- **Grafana MCP Server GitHub**: https://github.com/grafana/mcp-grafana
- **Grafana 公式ドキュメント**: https://grafana.com/docs/
- **Model Context Protocol**: https://modelcontextprotocol.io/

---

**作成日**: 2025年12月29日  
**Phase**: 1/4  
**ステータス**: Cursor MCP 設定完了 → Service Account Token 作成待ち

