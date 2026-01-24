# AI Search Optimizer Cloud Run Jobs - Production

本番環境用のCloud Run Jobsコンテナイメージとジョブスクリプト。

## 📋 概要

このディレクトリには、AI Search Optimizer（CLAVI）の本番環境で実行するCloud Run Jobs用のDockerfileとジョブスクリプトが含まれています。

### 特徴

- ✅ **マルチテナント対応**: テナントIDごとにジョブ実行
- ✅ **OIDC認証**: Google Cloud OIDC IDトークンを使用した安全な認証
- ✅ **動的ジョブ切り替え**: 環境変数`JOB_TYPE`でジョブ種別を切り替え
- ✅ **セキュリティ**: 非rootユーザーで実行、最小限の依存関係
- ✅ **監査ログ対応**: すべてのジョブ実行を監査ログに記録

## 📂 ディレクトリ構成

```
jobs/production/
├── Dockerfile              # Dockerイメージ定義
├── .dockerignore           # Docker build時の除外ファイル
├── package.json            # Node.js依存関係
├── index.js                # エントリーポイント（ジョブ種別の動的切り替え）
├── jobs/                   # 各ジョブの実装
│   ├── cleanup-audit-logs.js  # 監査ログクリーンアップ
│   └── example-job.js         # サンプルジョブ（テスト用）
└── README.md               # このファイル
```

## 🚀 利用可能なジョブ

### 1. cleanup-audit-logs（監査ログクリーンアップ）

**目的**: 保持期間を過ぎた監査ログを削除

**環境変数**:
- `JOB_TYPE`: `cleanup-audit-logs`
- `AUDIT_LOG_RETENTION_DAYS`: 保持期間（デフォルト: 90日）

**実行頻度**: 週1回推奨

### 2. example-job（サンプルジョブ）

**目的**: Supabaseクライアントの動作確認用

**環境変数**:
- `JOB_TYPE`: `example-job`

**実行頻度**: テスト時のみ

## 🔧 環境変数

### 必須環境変数

| 変数名 | 説明 | 例 |
|--------|------|-----|
| `SUPABASE_URL` | SupabaseプロジェクトURL | `https://xxx.supabase.co` |
| `API_URL` | 本番APIのURL | `https://nands.tech` |
| `GCP_PROJECT_ID` | Google CloudプロジェクトID | `your-project-id` |
| `GCP_SERVICE_ACCOUNT_EMAIL` | サービスアカウントメール | `clavi-job@...` |
| `TENANT_ID` | テナントID | UUID |

### オプション環境変数

| 変数名 | 説明 | デフォルト |
|--------|------|-----------|
| `JOB_TYPE` | ジョブ種別 | `cleanup-audit-logs` |
| `AUDIT_LOG_RETENTION_DAYS` | 監査ログ保持期間 | `90` |
| `NODE_ENV` | Node.js環境 | `production` |

## 📦 ローカルビルド手順

### 1. 依存関係インストール

```bash
cd jobs/production
npm install
```

### 2. Dockerイメージビルド

```bash
# プロジェクトルートから実行
docker build -t clavi-jobs:latest -f jobs/production/Dockerfile jobs/production
```

### 3. ローカルテスト実行

```bash
docker run --rm \
  -e SUPABASE_URL="https://xxx.supabase.co" \
  -e API_URL="http://localhost:3000" \
  -e GCP_PROJECT_ID="your-project-id" \
  -e GCP_SERVICE_ACCOUNT_EMAIL="clavi-job@your-project.iam.gserviceaccount.com" \
  -e TENANT_ID="00000000-0000-0000-0000-000000000001" \
  -e JOB_TYPE="example-job" \
  clavi-jobs:latest
```

## ☁️ Cloud Runデプロイ手順

### 1. Google Artifact Registryにプッシュ

```bash
# GCPプロジェクトIDとリージョンを設定
export GCP_PROJECT_ID="your-project-id"
export GCP_REGION="us-central1"
export IMAGE_NAME="clavi-jobs"
export IMAGE_TAG="latest"

# Artifact Registryの有効化（初回のみ）
gcloud services enable artifactregistry.googleapis.com

# Dockerリポジトリ作成（初回のみ）
gcloud artifacts repositories create clavi-docker \
  --repository-format=docker \
  --location=${GCP_REGION} \
  --description="AI Search Optimizer Docker images"

# Dockerイメージをビルド
docker build -t ${GCP_REGION}-docker.pkg.dev/${GCP_PROJECT_ID}/clavi-docker/${IMAGE_NAME}:${IMAGE_TAG} \
  -f jobs/production/Dockerfile \
  jobs/production

# Docker認証設定
gcloud auth configure-docker ${GCP_REGION}-docker.pkg.dev

# イメージプッシュ
docker push ${GCP_REGION}-docker.pkg.dev/${GCP_PROJECT_ID}/clavi-docker/${IMAGE_NAME}:${IMAGE_TAG}
```

### 2. Cloud Run Jobsデプロイ

```bash
# サービスアカウントを指定してデプロイ
gcloud run jobs create clavi-cleanup-audit-logs \
  --image=${GCP_REGION}-docker.pkg.dev/${GCP_PROJECT_ID}/clavi-docker/${IMAGE_NAME}:${IMAGE_TAG} \
  --region=${GCP_REGION} \
  --service-account=clavi-job@${GCP_PROJECT_ID}.iam.gserviceaccount.com \
  --set-env-vars="JOB_TYPE=cleanup-audit-logs,SUPABASE_URL=https://xxx.supabase.co,API_URL=https://nands.tech,GCP_PROJECT_ID=${GCP_PROJECT_ID},GCP_SERVICE_ACCOUNT_EMAIL=clavi-job@${GCP_PROJECT_ID}.iam.gserviceaccount.com,TENANT_ID=your-tenant-id,AUDIT_LOG_RETENTION_DAYS=90" \
  --max-retries=1 \
  --task-timeout=300s \
  --memory=512Mi \
  --cpu=1
```

### 3. ジョブ実行（手動）

```bash
gcloud run jobs execute clavi-cleanup-audit-logs --region=${GCP_REGION}
```

### 4. ジョブスケジューリング（Cloud Scheduler）

```bash
# Cloud Schedulerの有効化（初回のみ）
gcloud services enable cloudscheduler.googleapis.com

# 週1回実行（毎週日曜日 3:00 AM）
gcloud scheduler jobs create http clavi-cleanup-audit-logs-schedule \
  --location=${GCP_REGION} \
  --schedule="0 3 * * 0" \
  --time-zone="Asia/Tokyo" \
  --uri="https://${GCP_REGION}-run.googleapis.com/apis/run.googleapis.com/v1/namespaces/${GCP_PROJECT_ID}/jobs/clavi-cleanup-audit-logs:run" \
  --http-method=POST \
  --oauth-service-account-email=clavi-job@${GCP_PROJECT_ID}.iam.gserviceaccount.com
```

## 🔍 トラブルシューティング

### 1. OIDC IDトークン取得失敗

**エラー**: `Error fetching ID token`

**原因**: サービスアカウントにIAM権限が不足

**解決策**:
```bash
gcloud iam service-accounts add-iam-policy-binding \
  clavi-job@${GCP_PROJECT_ID}.iam.gserviceaccount.com \
  --role=roles/iam.serviceAccountTokenCreator \
  --member=serviceAccount:clavi-job@${GCP_PROJECT_ID}.iam.gserviceaccount.com
```

### 2. Supabase JWT取得失敗

**エラー**: `Invalid service account`

**原因**: `/api/clavi/job-token`のサービスアカウントメール検証で弾かれている

**解決策**: `GCP_SERVICE_ACCOUNT_EMAIL`環境変数が正しいか確認

### 3. RLS エラー

**エラー**: `permission denied for table xxx`

**原因**: ジョブ専用ユーザーがテナントに所属していない

**解決策**:
```sql
-- ジョブ専用ユーザーを作成
SELECT clavi.get_or_create_job_user('your-tenant-id'::uuid);
```

## 📚 関連ドキュメント

- [Task 5.1: OIDC設定](/docs/carve-out/TASK_5_1_COMPLETE_GUIDE.md)
- [Task 5.2: job-token API](/docs/carve-out/PHASE5_TASKS.md#task-52)
- [Task 5.3: job user RPC](/docs/carve-out/PHASE5_TASKS.md#task-53)
- [Task 5.4: 監査ログ](/docs/carve-out/PHASE5_TASKS.md#task-54)

## 🔐 セキュリティ考慮事項

- ✅ 非rootユーザーで実行
- ✅ OIDC認証で安全なトークン取得
- ✅ ジョブ専用ユーザーは「ログイン不能」（100年BAN、login_disabled）
- ✅ テナントIDごとにRLS適用
- ✅ 監査ログで全アクション記録

---

**作成日**: 2025-01-10  
**メンテナ**: Backend Team

