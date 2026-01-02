# Phase 1: 環境変数設定ガイド

**既存プロジェクト用**: 既存の`.env`ファイルを維持したまま、Django RAG API用の変数を追加

---

## 🚨 重要: 既存設定の保護

- ✅ **既存の`.env`ファイルは削除しない**
- ✅ **既存の環境変数は変更しない**
- ✅ **Next.jsプロジェクトの動作に影響を与えない**

---

## 📋 必要な環境変数

### 既存の.envファイルに追加する変数

既存の`.env`ファイルの**末尾に以下を追加**してください：

```bash
# ========================================
# Django RAG API 追加設定 (2025-12-29)
# ========================================

# Django Secret Key（本番環境では必ず変更）
DJANGO_SECRET_KEY=django-insecure-dev-key-change-in-production

# Debug Mode（本番環境では必ずFalseに）
DEBUG=True
```

### 既に存在するはずの変数（確認のみ）

以下の変数は既存の`.env`ファイルに存在するはずです：

```bash
# Supabase Database (既存)
DATABASE_NAME=postgres
DATABASE_USER=postgres
DATABASE_PASSWORD=11925532kG1192
DATABASE_HOST=db.xhmhzhethpwjxuwksmuv.supabase.co
DATABASE_PORT=5432

# OpenAI API (既存)
OPENAI_API_KEY=sk-...
```

**⚠️ これらは既に設定済みのはずなので、変更・追加不要です。**

---

## ✅ 設定手順

### 1. 既存の.envファイルを確認

```bash
# プロジェクトルートで実行
cd /Users/nands/my-corporate-site

# .envファイルが存在することを確認
ls -la .env
```

### 2. .envファイルに追加

既存の`.env`ファイルを開いて、**末尾に以下を追加**：

```bash
# ========================================
# Django RAG API 追加設定 (2025-12-29)
# ========================================
DJANGO_SECRET_KEY=django-insecure-dev-key-change-in-production
DEBUG=True
```

または、コマンドで追加：

```bash
cat >> .env << 'EOF'

# ========================================
# Django RAG API 追加設定 (2025-12-29)
# ========================================
DJANGO_SECRET_KEY=django-insecure-dev-key-change-in-production
DEBUG=True
EOF
```

### 3. 設定確認

```bash
# DATABASE_PASSWORD（Supabase）が設定されているか確認
grep -q "DATABASE_PASSWORD" .env && echo "✅ Supabase設定あり" || echo "❌ Supabase設定なし"

# OPENAI_API_KEYが設定されているか確認
grep -q "OPENAI_API_KEY" .env && echo "✅ OpenAI設定あり" || echo "❌ OpenAI設定なし"

# DJANGO_SECRET_KEYが設定されているか確認
grep -q "DJANGO_SECRET_KEY" .env && echo "✅ Django設定あり" || echo "❌ Django設定なし"
```

---

## 🔧 Docker Composeでの環境変数読み込み

`docker-compose.yml`は自動的にプロジェクトルートの`.env`ファイルを読み込みます。

```yaml
services:
  backend:
    env_file:
      - .env  # ← プロジェクトルートの.envを読み込む
```

**追加作業不要です。**

---

## 🧪 動作確認

### 1. Dockerコンテナ起動

```bash
docker-compose up -d
```

### 2. 環境変数がコンテナ内で読み込まれているか確認

```bash
# backendコンテナ内の環境変数確認
docker-compose exec backend env | grep DATABASE_HOST
docker-compose exec backend env | grep DJANGO_SECRET_KEY
```

### 3. Djangoで環境変数が読み込まれているか確認

```bash
# Djangoシェルで確認
docker-compose exec backend python manage.py shell

# Pythonシェル内で実行
>>> from django.conf import settings
>>> print(settings.DATABASES['default']['HOST'])
db.xhmhzhethpwjxuwksmuv.supabase.co
>>> print(settings.SECRET_KEY[:20])
django-insecure-dev-
>>> exit()
```

---

## 🔒 セキュリティ注意事項

### 本番環境では必ず変更

1. **DJANGO_SECRET_KEY**
   ```python
   # Pythonで生成
   python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
   ```

2. **DEBUG**
   ```bash
   DEBUG=False  # 本番環境では必ずFalse
   ```

3. **ALLOWED_HOSTS**
   ```python
   # settings.pyで設定
   ALLOWED_HOSTS = ['your-domain.com', 'api.your-domain.com']
   ```

---

## 📝 .envファイルの最終構成例

```bash
# ========================================
# Next.js / Supabase (既存設定)
# ========================================
NEXT_PUBLIC_SUPABASE_URL=https://xhmhzhethpwjxuwksmuv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

DATABASE_NAME=postgres
DATABASE_USER=postgres
DATABASE_PASSWORD=11925532kG1192
DATABASE_HOST=db.xhmhzhethpwjxuwksmuv.supabase.co
DATABASE_PORT=5432

OPENAI_API_KEY=sk-...

# ========================================
# Django RAG API 追加設定 (2025-12-29)
# ========================================
DJANGO_SECRET_KEY=django-insecure-dev-key-change-in-production
DEBUG=True
```

---

## ❓ トラブルシューティング

### エラー: `DJANGO_SECRET_KEY is not set`

→ `.env`ファイルに`DJANGO_SECRET_KEY`を追加してください

### エラー: `DATABASES configuration is incorrect`

→ 既存の`DATABASE_*`変数が正しく設定されているか確認

```bash
cat .env | grep DATABASE
```

### コンテナ起動後に.envを変更した場合

```bash
# コンテナを再起動して環境変数を再読み込み
docker-compose restart backend
```

---

## ✅ チェックリスト

- [ ] 既存の`.env`ファイルが存在する
- [ ] `DATABASE_PASSWORD`等のSupabase設定が既に存在する
- [ ] `OPENAI_API_KEY`が既に存在する
- [ ] `.env`ファイルの末尾に`DJANGO_SECRET_KEY`を追加した
- [ ] `.env`ファイルの末尾に`DEBUG=True`を追加した
- [ ] `docker-compose up -d`でコンテナが起動する
- [ ] `docker-compose exec backend env`で環境変数が確認できる

---

**既存プロジェクトを壊さないための原則**:
1. 既存の`.env`ファイルは削除しない
2. 既存の環境変数は変更しない
3. 追加する変数は末尾に追記のみ
4. Next.jsプロジェクトの動作に影響を与えない

---

**作成日**: 2025年12月29日  
**Phase**: 1/4  
**対象**: 既存プロジェクト用環境変数設定

