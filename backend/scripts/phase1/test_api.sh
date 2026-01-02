#!/bin/bash
# RAG API テストスクリプト

API_BASE="http://localhost:8000/api/rag"

echo "🧪 Phase 1: Django RAG API テスト"
echo "=================================="
echo ""

# 1. ヘルスチェック
echo "1️⃣ ヘルスチェック"
curl -s "${API_BASE}/health" | python -m json.tool
echo ""
echo ""

# 2. RAGデータ統計
echo "2️⃣ RAGデータ統計"
curl -s "${API_BASE}/stats" | python -m json.tool
echo ""
echo ""

# 3. ハイブリッド検索（Fragment）
echo "3️⃣ ハイブリッド検索（Fragment）"
curl -s -X POST "${API_BASE}/search" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "レリバンスエンジニアリングとは",
    "sources": ["fragment"],
    "limit": 3
  }' | python -m json.tool
echo ""
echo ""

# 4. ハイブリッド検索（Company）
echo "4️⃣ ハイブリッド検索（Company）"
curl -s -X POST "${API_BASE}/search" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "AIエージェント開発",
    "sources": ["company"],
    "limit": 3
  }' | python -m json.tool
echo ""
echo ""

# 5. マルチソース検索
echo "5️⃣ マルチソース検索（Fragment + Company）"
curl -s -X POST "${API_BASE}/search" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "AI検索最適化",
    "sources": ["fragment", "company"],
    "limit": 5
  }' | python -m json.tool
echo ""
echo ""

echo "✅ テスト完了"

