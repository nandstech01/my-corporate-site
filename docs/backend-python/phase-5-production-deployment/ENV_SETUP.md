# Phase 5: 本番環境 .env 設定ガイド

**最終更新**: 2026-01-03  
**ドメイン**: `rag.nands.tech`

---

## 📝 本番環境用 .env 設定

GCP VMにデプロイする際に必要な`.env`ファイルの設定です。

### ファイルパス
```
/home/user/my-corporate-site/.env
```

---

## 🔧 設定内容

```bash
# ========================================
# Django 設定
# ========================================
DEBUG=False
SECRET_KEY=<本番用の長いランダム文字列に変更>
ALLOWED_HOSTS=rag.nands.tech,<GCP_VM_IP>

# ========================================
# Supabase Database（既存の設定をコピー）
# ========================================
DATABASE_URL=postgresql://user:password@db.xxxx.supabase.co:5432/postgres
DATABASE_PASSWORD=<既存のSupabaseパスワード>

# ========================================
# MLflow 設定
# ========================================
MLFLOW_TRACKING_URI=http://mlflow:5000

# ========================================
# Grafana 設定
# ========================================
GF_SECURITY_ADMIN_USER=admin
GF_SECURITY_ADMIN_PASSWORD=<adminから変更>
GF_SERVER_ROOT_URL=https://rag.nands.tech/grafana

# ========================================
# 本番環境固有の設定
# ========================================
ENVIRONMENT=production
LOG_LEVEL=INFO

# ========================================
# CORS設定（必要に応じて）
# ========================================
CORS_ALLOWED_ORIGINS=https://rag.nands.tech,https://nands.tech
```

---

## ⚠️ 変更が必要な項目

### 1. SECRET_KEY（必須）

**現在**: デフォルトまたは開発用の値  
**変更先**: 本番用の長いランダム文字列

**生成方法**:
```bash
python3 -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

**例**:
```
SECRET_KEY=django-insecure-abc123xyz789...（50文字以上）
```

---

### 2. ALLOWED_HOSTS（必須）

**現在**: `localhost,127.0.0.1`（開発用）  
**変更先**: `rag.nands.tech,<GCP_VM_IP>`

**例**:
```
ALLOWED_HOSTS=rag.nands.tech,34.168.123.45
```

**注意**: GCP VMのIPアドレスは後で確定

---

### 3. GF_SECURITY_ADMIN_PASSWORD（必須）

**現在**: `admin`（デフォルト）  
**変更先**: 強力なパスワード

**例**:
```
GF_SECURITY_ADMIN_PASSWORD=MySecureGrafanaPass2024!
```

---

### 4. DATABASE_URL（確認）

**既存の`.env`から値をコピー**

Supabaseの接続情報を確認してください：
```
DATABASE_URL=postgresql://postgres.xxxx:password@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres
```

---

### 5. DATABASE_PASSWORD（確認）

**既存の`.env`から値をコピー**

---

## 📋 設定チェックリスト

デプロイ前に以下を確認：

- [ ] `DEBUG=False`（本番環境では必須）
- [ ] `SECRET_KEY`を本番用に変更
- [ ] `ALLOWED_HOSTS`に`rag.nands.tech`と GCP VM IP を追加
- [ ] `GF_SECURITY_ADMIN_PASSWORD`をデフォルトから変更
- [ ] `DATABASE_URL`が正しい（Supabase）
- [ ] `GF_SERVER_ROOT_URL=https://rag.nands.tech/grafana`

---

## 🚀 デプロイ時の手順

### Step 1: ローカルの.envを確認

```bash
cd /Users/nands/my-corporate-site
cat .env
```

### Step 2: 本番用.envを作成

```bash
# 既存の.envをベースに本番用を作成
cp .env .env.production

# 本番用設定を編集
nano .env.production
```

### Step 3: GCP VMにアップロード

```bash
# SSHでVMにログイン後
cd ~/my-corporate-site

# .envファイルを作成
nano .env

# 上記の本番用設定を貼り付け
```

---

## 🔐 セキュリティ注意事項

1. **`.env`ファイルは絶対にGitにコミットしない**
   - `.gitignore`に必ず含める

2. **SECRET_KEYは絶対に共有しない**
   - 本番環境専用の値を使用

3. **パスワードは強力なものを使用**
   - 最低12文字、英数字+記号

4. **定期的にパスワードを変更**
   - 3-6ヶ月ごと

---

## 📚 参考

- Django SECRET_KEY: https://docs.djangoproject.com/en/4.2/ref/settings/#secret-key
- Grafana Security: https://grafana.com/docs/grafana/latest/setup-grafana/configure-security/
- Supabase Connection: https://supabase.com/docs/guides/database/connecting-to-postgres

---

**デプロイ時にこのドキュメントを参照して.envファイルを設定してください** ✅

