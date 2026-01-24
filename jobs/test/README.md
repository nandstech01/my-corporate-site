# Cloud Run Jobs テストスクリプト

このディレクトリには、Cloud Run JobsのOIDC認証とジョブトークン発行APIのテストスクリプトが含まれています。

## ファイル構成

```
jobs/test/
├── package.json              # Node.js依存関係
├── package-lock.json         # 依存関係ロックファイル
├── Dockerfile                # Docker image定義
├── .dockerignore             # Docker除外ファイル
├── test-oidc.js              # Task 5.1: OIDCトークン取得テスト
├── test-job-token.js         # Task 5.2: ジョブトークン発行E2Eテスト
├── check-existing-system.sh  # 既存システム確認スクリプト
└── README.md                 # このファイル
```

## テスト1: OIDC IDトークン取得（Task 5.1）

**目的**: Cloud Run Jobsがサービスアカウントを使ってOIDC IDトークンを取得できることを確認

### ローカル実行

```bash
cd /Users/nands/my-corporate-site/jobs/test
npm install
node test-oidc.js
```

### Cloud Run Jobsで実行

```bash
# ビルド・プッシュ
export PROJECT_ID="gen-lang-client-0387405309"
export REGION="europe-west1"
gcloud builds submit --tag gcr.io/${PROJECT_ID}/clavi-oidc-test:latest .

# ジョブ更新
gcloud run jobs update clavi-test-job \
  --image=gcr.io/${PROJECT_ID}/clavi-oidc-test:latest \
  --service-account=clavi-job-runner@${PROJECT_ID}.iam.gserviceaccount.com \
  --region=${REGION}

# 実行
gcloud run jobs execute clavi-test-job --region=${REGION}
```

### 期待される結果

```
✅ GoogleAuthインスタンス作成成功
✅ IDトークンクライアント取得成功
✅ IDトークン取得成功
✅ iss がGoogle
✅ aud が設定値と一致
✅ email がSAのメール
✅ exp が未来
🎉 すべてのチェック合格！
```

---

## テスト2: ジョブトークン発行E2E（Task 5.2）

**目的**: OIDC IDトークンを使ってジョブトークン発行APIを呼び出し、Supabase JWTが正しく発行されることを確認

### 前提条件

1. **Next.jsアプリが起動していること**
   ```bash
   cd /Users/nands/my-corporate-site
   npm run dev
   ```

2. **環境変数が設定されていること** (`.env.local`)
   ```bash
   # OIDC検証用
   OIDC_EXPECTED_AUDIENCE=https://nands.tech/api/clavi/job-token
   JOB_SERVICE_ACCOUNT_EMAIL=clavi-job-runner@gen-lang-client-0387405309.iam.gserviceaccount.com

   # Supabase JWT発行用
   SUPABASE_JWT_SECRET=<your-jwt-secret>
   SUPABASE_JWT_ISSUER=https://xhmhzhethpwjxuwksmuv.supabase.co/auth/v1
   SUPABASE_JWT_AUDIENCE=authenticated
   SUPABASE_JWT_ROLE=authenticated
   ```

### Dockerfile更新（Task 5.2用）

```dockerfile
FROM node:20-slim

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

# Task 5.2: test-job-token.js を実行
COPY test-job-token.js ./

CMD ["node", "test-job-token.js"]
```

### Cloud Run Jobsで実行

```bash
# Dockerfile更新（CMD行を変更）
# CMD ["node", "test-oidc.js"] → CMD ["node", "test-job-token.js"]

# ビルド・プッシュ
export PROJECT_ID="gen-lang-client-0387405309"
export REGION="europe-west1"
gcloud builds submit --tag gcr.io/${PROJECT_ID}/clavi-job-token-test:latest .

# ジョブ作成（新規）または更新
gcloud run jobs update clavi-test-job \
  --image=gcr.io/${PROJECT_ID}/clavi-job-token-test:latest \
  --service-account=clavi-job-runner@${PROJECT_ID}.iam.gserviceaccount.com \
  --set-env-vars="API_URL=https://nands.tech,TENANT_ID=test-tenant-uuid,OIDC_AUDIENCE=https://nands.tech/api/clavi/job-token" \
  --region=${REGION}

# 実行
gcloud run jobs execute clavi-test-job --region=${REGION}
```

### 期待される結果

```
Step 1: OIDC IDトークン取得...
✅ OIDC IDトークン取得成功

Step 2: ジョブトークン発行API呼び出し...
✅ ジョブトークン発行成功

Step 3: レスポンス確認...
✅ tenant_id 正しい
✅ tenant_role が member
✅ source が cloud_run_job
✅ role が authenticated
✅ exp が未来

🎉 すべてのチェック合格！
✅ Task 5.2 E2Eテスト成功！
```

---

## トラブルシューティング

### ❌ `Missing or invalid Authorization header`

**原因**: OIDC IDトークンが正しく渡されていない

**解決策**:
1. Cloud Run Jobsで`OIDC_AUDIENCE`環境変数が正しく設定されているか確認
2. サービスアカウントに`roles/iam.serviceAccountTokenCreator`が付与されているか確認

### ❌ `Invalid token audience`

**原因**: OIDC audienceが一致していない

**解決策**:
1. `OIDC_EXPECTED_AUDIENCE`（API側）と`OIDC_AUDIENCE`（Job側）を確認
2. 両方とも`https://nands.tech/api/clavi/job-token`に統一

### ❌ `Invalid service account`

**原因**: サービスアカウントのメールアドレスが一致していない

**解決策**:
1. `JOB_SERVICE_ACCOUNT_EMAIL`環境変数を確認
2. 実際のサービスアカウントのメールと一致させる

### ❌ `Server configuration error`

**原因**: `SUPABASE_JWT_SECRET`が設定されていない

**解決策**:
1. `.env.local`に`SUPABASE_JWT_SECRET`を追加
2. Supabase Dashboard → Settings → API → JWT Secretから取得

---

## 既存システム影響確認

```bash
cd /Users/nands/my-corporate-site/jobs/test
./check-existing-system.sh
```

**確認項目**:
- ✅ `/api/clavi/me` 正常応答
- ✅ `/api/clavi/tenant` 正常応答
- ✅ `/` ページ正常表示
- ✅ `/blog` ページ正常表示

---

## 関連ドキュメント

- `/docs/carve-out/PHASE5_TASKS.md` - Phase 5 タスク管理
- `/docs/carve-out/TASK_5_1_COMPLETE_GUIDE.md` - Task 5.1 完全ガイド
- `/docs/carve-out/TASKS.md` - 全体タスク管理

---

**最終更新**: 2025-01-10  
**実装ステータス**: Task 5.1 完了、Task 5.2 実装完了（テスト待ち）
