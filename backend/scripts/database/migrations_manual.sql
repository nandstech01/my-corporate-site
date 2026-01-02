--
-- Phase 1: Django RAG Foundation - Database Migration
-- 新しいテーブルのみ作成（既存テーブルには影響なし）
--

-- RAG検索ログテーブル
CREATE TABLE IF NOT EXISTS rag_search_logs (
    id BIGSERIAL PRIMARY KEY,
    query TEXT NOT NULL,
    sources JSONB DEFAULT '[]'::jsonb,
    results_count INTEGER DEFAULT 0,
    top_similarity DOUBLE PRECISION,
    avg_similarity DOUBLE PRECISION,
    search_duration_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    ip_address INET,
    user_agent TEXT DEFAULT ''
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS rag_search__created_818daf_idx ON rag_search_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS rag_search__query_69d472_idx ON rag_search_logs (query);

-- RAGデータ統計テーブル
CREATE TABLE IF NOT EXISTS rag_data_statistics (
    id BIGSERIAL PRIMARY KEY,
    source_type VARCHAR(50) NOT NULL,
    stat_date DATE DEFAULT CURRENT_DATE NOT NULL,
    total_vectors INTEGER DEFAULT 0,
    total_searches INTEGER DEFAULT 0,
    avg_similarity DOUBLE PRECISION DEFAULT 0.0,
    avg_duration_ms DOUBLE PRECISION DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(source_type, stat_date)
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS rag_data__stat_date_idx ON rag_data_statistics (stat_date DESC);

-- Django Migrationsテーブル（既に存在する場合はスキップ）
CREATE TABLE IF NOT EXISTS django_migrations (
    id BIGSERIAL PRIMARY KEY,
    app VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    applied TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 手動でマイグレーション記録を追加
INSERT INTO django_migrations (app, name, applied)
VALUES ('rag_api', '0001_initial', NOW())
ON CONFLICT DO NOTHING;

-- 確認クエリ
SELECT 
    'rag_search_logs' as table_name, 
    COUNT(*) as record_count,
    pg_size_pretty(pg_total_relation_size('rag_search_logs')) as table_size
FROM rag_search_logs
UNION ALL
SELECT 
    'rag_data_statistics' as table_name, 
    COUNT(*) as record_count,
    pg_size_pretty(pg_total_relation_size('rag_data_statistics')) as table_size
FROM rag_data_statistics;

