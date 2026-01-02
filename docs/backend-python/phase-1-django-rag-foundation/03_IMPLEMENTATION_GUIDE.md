# Phase 1: 実装ガイド

---

## 🎯 実装の流れ

```
Day 1-2: 環境構築
    ↓
Day 3-5: Django RAG API実装
    ↓
Day 6-7: 検索ログ記録
    ↓
Day 8-9: Grafana可視化
    ↓
Day 10-14: テスト・検証
```

---

## Day 1-2: 環境構築

### 1. ディレクトリ構成作成

```bash
cd /Users/nands/my-corporate-site

# Backendディレクトリ作成
mkdir -p backend/{rag_app,rag_api/services}

# Infraディレクトリ作成
mkdir -p infra/{grafana/provisioning/datasources,grafana/provisioning/dashboards}
```

### 2. Docker Compose作成

`docker-compose.yml`（プロジェクトルート）:

```yaml
services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    env_file:
      - .env
    volumes:
      - ./backend:/app
    networks:
      - rag_net
    depends_on:
      - grafana

  grafana:
    image: grafana/grafana:11.2.2
    ports:
      - "3001:3000"
    env_file:
      - .env
    volumes:
      - grafana_data:/var/lib/grafana
      - ./infra/grafana/provisioning:/etc/grafana/provisioning
    networks:
      - rag_net

networks:
  rag_net:
    driver: bridge

volumes:
  grafana_data:
```

### 3. Backend Dockerfile

`backend/Dockerfile`:

```dockerfile
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# psycopg2用システム依存関係
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
  && rm -rf /var/lib/apt/lists/*

COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY . /app

EXPOSE 8000

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
```

### 4. requirements.txt

`backend/requirements.txt`:

```txt
Django==5.1.3
djangorestframework==3.15.2
django-cors-headers==4.6.0
dj-database-url==2.2.0
python-dotenv==1.0.1

psycopg2-binary==2.9.9

openai==1.51.2

# Phase 2以降で追加予定
# mlflow==2.16.2
# langchain==0.2.16
# langchain-openai==0.1.23
```

### 5. .env設定

`.env`（プロジェクトルート）:

```env
# Django
DJANGO_SECRET_KEY=your-secret-key-here
DJANGO_DEBUG=1
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000

# Supabase（PostgreSQL）
DATABASE_URL=postgres://postgres:11925532kG1192@db.xhmhzhethpwjxuwksmuv.supabase.co:5432/postgres
DB_SSL_REQUIRE=1

# OpenAI
OPENAI_API_KEY=your-openai-api-key-here

# Grafana
GF_SECURITY_ADMIN_USER=admin
GF_SECURITY_ADMIN_PASSWORD=admin
GF_INSTALL_PLUGINS=

# Supabase接続情報（Grafana用）
SUPABASE_DB_HOST=db.xhmhzhethpwjxuwksmuv.supabase.co
SUPABASE_DB_PORT=5432
SUPABASE_DB_NAME=postgres
SUPABASE_DB_USER=postgres
SUPABASE_DB_PASSWORD=11925532kG1192
```

---

## Day 3-5: Django RAG API実装

### 1. Djangoプロジェクト作成

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

pip install django
django-admin startproject rag_app .
python manage.py startapp rag_api
```

### 2. settings.py設定

`backend/rag_app/settings.py`:

```python
import os
import dj_database_url

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.getenv("DJANGO_SECRET_KEY", "dev-secret-key")
DEBUG = os.getenv("DJANGO_DEBUG", "1") == "1"
ALLOWED_HOSTS = os.getenv("DJANGO_ALLOWED_HOSTS", "localhost,127.0.0.1").split(",")

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'corsheaders',
    'rest_framework',
    'rag_api',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# CORS設定（開発用）
CORS_ALLOWED_ORIGINS = os.getenv("CORS_ALLOWED_ORIGINS", "http://localhost:3000").split(",")
CORS_ALLOW_CREDENTIALS = True

ROOT_URLCONF = 'rag_app.urls'

# Supabase(Postgres)接続
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is required")

DATABASES = {
    "default": dj_database_url.parse(
        DATABASE_URL,
        conn_max_age=600,
        ssl_require=os.getenv("DB_SSL_REQUIRE", "1") == "1",
    )
}

# DRF設定
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [],
    "DEFAULT_PERMISSION_CLASSES": [],
}
```

### 3. RAG検索サービス実装

`backend/rag_api/services/rag_search_service.py`:

```python
from django.db import connection
from .openai_embeddings import OpenAIEmbeddings
import time

class RAGSearchService:
    def __init__(self):
        self.embeddings = OpenAIEmbeddings()
    
    def hybrid_search(self, query: str, sources: list, **kwargs):
        """
        統一RAG検索
        """
        start_time = time.time()
        
        # クエリをベクトル化
        embedding = self.embeddings.embed_single(query)
        
        # パラメータ取得
        match_count = kwargs.get('match_count', 10)
        threshold = kwargs.get('threshold', 0.3)
        bm25_weight = kwargs.get('bm25_weight', 0.4)
        vector_weight = kwargs.get('vector_weight', 0.6)
        filters = kwargs.get('filters', {})
        
        results = {}
        
        # 各RAGシステムで検索
        if 'fragment' in sources:
            results['fragment'] = self.search_fragment_vectors(
                query, embedding, match_count, threshold, 
                bm25_weight, vector_weight, filters
            )
        
        if 'company' in sources:
            results['company'] = self.search_company_vectors(
                query, embedding, match_count, threshold,
                bm25_weight, vector_weight
            )
        
        if 'trend' in sources:
            results['trend'] = self.search_trend_vectors(
                query, embedding, match_count, threshold,
                bm25_weight, vector_weight
            )
        
        if 'youtube' in sources:
            results['youtube'] = self.search_youtube_vectors(
                query, embedding, match_count, threshold,
                bm25_weight, vector_weight
            )
        
        if 'kenji' in sources:
            # Kenji Thoughtsは3072次元
            embedding_3072 = self.embeddings.embed_single(query, dimensions=3072)
            results['kenji'] = self.search_kenji_thoughts(
                query, embedding_3072, match_count, threshold
            )
        
        duration_ms = int((time.time() - start_time) * 1000)
        
        return {
            'results': results,
            'duration_ms': duration_ms
        }
    
    def search_fragment_vectors(self, query, embedding, match_count, 
                                 threshold, bm25_weight, vector_weight, filters):
        """
        Fragment Vectorsをハイブリッド検索
        """
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT * FROM hybrid_search_fragment_vectors(
                    %s, %s::vector, %s, %s, %s, %s, %s, %s
                )
            """, [
                query,
                '[' + ','.join(map(str, embedding)) + ']',
                threshold,
                match_count,
                bm25_weight,
                vector_weight,
                filters.get('page_path'),
                filters.get('content_type')
            ])
            
            columns = [col[0] for col in cursor.description]
            results = [dict(zip(columns, row)) for row in cursor.fetchall()]
            
            return results
    
    # 他のRAG検索メソッドも同様に実装...
```

### 4. OpenAI Embeddings実装

`backend/rag_api/services/openai_embeddings.py`:

```python
import os
from openai import OpenAI

class OpenAIEmbeddings:
    def __init__(self):
        api_key = os.getenv('OPENAI_API_KEY')
        if not api_key:
            raise ValueError('OPENAI_API_KEY is required')
        
        self.client = OpenAI(api_key=api_key)
    
    def embed_single(self, text: str, dimensions: int = 1536):
        """
        テキストをベクトル化
        """
        model = 'text-embedding-3-large' if dimensions == 3072 else 'text-embedding-3-small'
        
        response = self.client.embeddings.create(
            input=text,
            model=model,
            dimensions=dimensions
        )
        
        return response.data[0].embedding
```

### 5. APIエンドポイント実装

`backend/rag_api/views.py`:

```python
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .services.rag_search_service import RAGSearchService

@api_view(['POST'])
def rag_search(request):
    """
    RAG統一検索API
    """
    query = request.data.get('query')
    if not query:
        return Response({
            'success': False,
            'error': 'query parameter is required'
        }, status=400)
    
    sources = request.data.get('sources', ['fragment', 'company', 'trend', 'youtube', 'kenji'])
    match_count = request.data.get('match_count', 10)
    threshold = request.data.get('threshold', 0.3)
    bm25_weight = request.data.get('bm25_weight', 0.4)
    vector_weight = request.data.get('vector_weight', 0.6)
    filters = request.data.get('filters', {})
    
    try:
        service = RAGSearchService()
        result = service.hybrid_search(
            query,
            sources,
            match_count=match_count,
            threshold=threshold,
            bm25_weight=bm25_weight,
            vector_weight=vector_weight,
            filters=filters
        )
        
        # 検索ログ記録（Day 6-7で実装）
        # log_search(query, sources, result)
        
        return Response({
            'success': True,
            'query': query,
            'sources_searched': sources,
            'total_results': sum(len(r) for r in result['results'].values()),
            'search_duration_ms': result['duration_ms'],
            'results': result['results']
        })
    
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=500)

@api_view(['GET'])
def rag_stats(request):
    """
    RAG統計情報API
    """
    # Day 6-7で実装
    return Response({'success': True, 'message': 'Not implemented yet'})

@api_view(['GET'])
def health_check(request):
    """
    ヘルスチェックAPI
    """
    return Response({'status': 'ok', 'django': 'ok'})
```

### 6. URLルーティング

`backend/rag_api/urls.py`:

```python
from django.urls import path
from . import views

urlpatterns = [
    path('search', views.rag_search),
    path('stats', views.rag_stats),
    path('health', views.health_check),
]
```

`backend/rag_app/urls.py`:

```python
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/rag/', include('rag_api.urls')),
]
```

---

## Day 6-7: 検索ログ記録

### 1. ログテーブル作成

```bash
psql "postgres://postgres:11925532kG1192@db.xhmhzhethpwjxuwksmuv.supabase.co:5432/postgres" -f supabase/migrations/create_rag_search_logs.sql
```

`supabase/migrations/create_rag_search_logs.sql`:

```sql
CREATE TABLE IF NOT EXISTS rag_search_logs (
  id BIGSERIAL PRIMARY KEY,
  query TEXT NOT NULL,
  sources TEXT[] NOT NULL,
  result_count INT,
  top_similarity FLOAT,
  avg_similarity FLOAT,
  bm25_score FLOAT,
  vector_score FLOAT,
  combined_score FLOAT,
  search_duration_ms INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rag_search_logs_created_at ON rag_search_logs(created_at DESC);
CREATE INDEX idx_rag_search_logs_sources ON rag_search_logs USING gin(sources);
```

### 2. ログ記録実装

`backend/rag_api/views.py`に追加:

```python
from django.db import connection

def log_search(query, sources, results, duration_ms):
    """
    検索ログをSupabaseに記録
    """
    all_results = []
    for source_results in results['results'].values():
        all_results.extend(source_results)
    
    result_count = len(all_results)
    
    if result_count > 0:
        top_similarity = max(r.get('vector_score', 0) for r in all_results)
        avg_similarity = sum(r.get('vector_score', 0) for r in all_results) / result_count
        avg_bm25 = sum(r.get('bm25_score', 0) for r in all_results) / result_count
        avg_combined = sum(r.get('combined_score', 0) for r in all_results) / result_count
    else:
        top_similarity = avg_similarity = avg_bm25 = avg_combined = 0.0
    
    with connection.cursor() as cursor:
        cursor.execute("""
            INSERT INTO rag_search_logs (
                query, sources, result_count, top_similarity, avg_similarity,
                bm25_score, vector_score, combined_score, search_duration_ms
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, [
            query, sources, result_count, top_similarity, avg_similarity,
            avg_bm25, avg_similarity, avg_combined, duration_ms
        ])
```

---

## Day 8-9: Grafana可視化

### 1. Grafana Datasource設定

`infra/grafana/provisioning/datasources/supabase.yml`:

```yaml
apiVersion: 1

datasources:
  - name: Supabase-Postgres
    type: postgres
    access: proxy
    url: ${SUPABASE_DB_HOST}:${SUPABASE_DB_PORT}
    user: ${SUPABASE_DB_USER}
    secureJsonData:
      password: ${SUPABASE_DB_PASSWORD}
    jsonData:
      database: ${SUPABASE_DB_NAME}
      sslmode: "require"
      postgresVersion: 1500
      timescaledb: false
    isDefault: true
```

### 2. ダッシュボードJSON作成

`infra/grafana/provisioning/dashboards/rag_stats.json`（後で作成）

---

## Day 10-14: テスト・検証

実装完了後、`04_TEST_PLAN.md`に従ってテストを実行

---

## 🚀 起動手順

```bash
# 環境変数設定
cp .env.example .env
# .envを編集してOPENAI_API_KEY等を設定

# Docker起動
docker compose up --build

# 別ターミナルでテスト
curl http://localhost:8000/api/rag/health
```

---

## 🔗 次のステップ

- [04_TEST_PLAN.md](./04_TEST_PLAN.md): テスト計画

