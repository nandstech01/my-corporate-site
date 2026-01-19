#!/bin/bash
# 既存システム影響確認スクリプト
# Task 5.1完了後に実行

echo "=== 既存システム影響確認 ==="
echo ""

echo "✅ 確認1: 既存API動作確認"
echo "GET /api/aso/me"
curl -s http://localhost:3000/api/aso/me | head -n 5
echo ""

echo "GET /api/aso/tenant"
curl -s http://localhost:3000/api/aso/tenant | head -n 5
echo ""

echo "✅ 確認2: 既存ページ動作確認"
echo "GET /"
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/
echo ""

echo "GET /blog"
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/blog
echo ""

echo "✅ 確認3: データベース確認"
echo "aso.* テーブル一覧:"
psql "$DATABASE_URL" -c "SELECT tablename FROM pg_tables WHERE schemaname='aso' ORDER BY tablename;" 2>/dev/null || echo "DBアクセスにはDATABASE_URL環境変数が必要です"
echo ""

echo "✅ 確認4: 既存Docker確認"
echo "docker-compose.yml 変更なし:"
git diff docker-compose.yml 2>/dev/null || echo "Gitリポジトリではありません"
echo ""

echo "backend/Dockerfile 変更なし:"
git diff backend/Dockerfile 2>/dev/null || echo "Gitリポジトリではありません"
echo ""

echo "=== 確認完了 ==="
echo ""
echo "期待される結果:"
echo "  - すべてのAPIが正常に応答（200 OK）"
echo "  - すべてのページが正常に表示"
echo "  - データベーステーブルに変更なし"
echo "  - docker-compose.yml に変更なし"
echo "  - backend/Dockerfile に変更なし"
echo ""
echo "✅ すべて正常なら Task 5.1完了！"

