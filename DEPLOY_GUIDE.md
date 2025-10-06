# Vercel 手動デプロイガイド

## 🚀 Vercel Web UIから手動デプロイ（推奨）

### 方法1: 最新コミットを強制デプロイ

1. **Vercelダッシュボードにアクセス**
   - https://vercel.com/dashboard
   
2. **プロジェクト「my-corporate-site」を選択**

3. **「Deployments」タブをクリック**

4. **最新のコミット `bf7295b` を探す**
   - もし表示されていない場合 → 下記の方法2へ

5. **コミットの右側にある「︙」メニューをクリック**

6. **「Redeploy」を選択**
   - ポップアップで「Use existing Build Cache」のチェックを**外す**
   - 「Redeploy」ボタンをクリック

---

### 方法2: GitHubから再デプロイをトリガー

もし最新コミットが表示されていない場合：

1. **Vercel画面で「Settings」タブをクリック**

2. **左サイドバー「Git」をクリック**

3. **「Connected Git Repository」セクションを確認**
   - Repository: `nandstech01/my-corporate-site`
   - Branch: `main`
   - 「Disconnect」と「Reconnect」ボタンがある

4. **「Reconnect」をクリック**（もしくは最初から接続されていればスキップ）

5. **「Deployments」タブに戻る**

6. **右上の「Create Deployment」ボタンをクリック**
   - Branch: `main`
   - 「Deploy」をクリック

---

### 方法3: GitHubで空コミットをプッシュ

ターミナルで以下を実行：

```bash
cd /Users/nands/my-corporate-site
git commit --allow-empty -m "trigger: Vercel再デプロイ"
git push origin main
```

これでVercelの自動デプロイが再びトリガーされます。

---

## ✅ デプロイ成功の確認

### 1. Vercel画面で確認

- 「Deployments」タブ
- 最新のビルドが「Building」→「Deploying」→「Ready」の流れ
- 通常2-5分で完了

### 2. 本番サイトで確認

https://nands.tech にアクセスして、以下を確認：

- ✅ サイトが正常に表示される
- ✅ ハイブリッド検索が動作している
- ✅ 管理画面が正常動作

### 3. ハイブリッド検索の動作確認

ブラウザのコンソールで：

```javascript
fetch('https://nands.tech/api/test-hybrid-search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: 'ChatGPT',
    source: 'company',
    limit: 3
  })
})
.then(r => r.json())
.then(data => console.log('✅ ハイブリッド検索動作:', data))
```

---

## 🔧 トラブルシューティング

### エラー: "Build failed"

1. Vercel画面で「Build Logs」を確認
2. エラーメッセージをコピー
3. ローカルで `npm run build` を実行して再現

### エラー: "Function invocation timeout"

- 環境変数が正しく設定されているか確認
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `OPENAI_API_KEY`

### 環境変数の確認方法

Vercel画面：
1. 「Settings」タブ
2. 「Environment Variables」
3. すべての必要な変数が設定されているか確認

---

## 📊 デプロイ状況の記録

| コミット | 日時 | 状態 | URL |
|---------|------|------|-----|
| bf7295b | 2025-10-06 | 🔄 デプロイ待ち | - |
| 8c61832 | 2025-10-06 | ✅ 成功 | - |
| 4ce24d0 | 2025-09-13 | ✅ 成功 | https://nands.tech |

---

## 💡 今後の推奨事項

### 1. Vercel CLI更新

```bash
npm i -g vercel@latest
```

現在: v42.3.0 → 最新: v48.1.6

### 2. 自動デプロイの確認

Vercel Settings → Git → Auto-deploy が有効になっているか確認

### 3. GitHub Actions統合（オプション）

より高度なCI/CDパイプラインが必要な場合は、GitHub Actionsとの統合を検討

---

**作成日**: 2025年10月6日  
**最終更新**: 2025年10月6日

