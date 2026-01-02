#!/usr/bin/env python
"""
評価データセット投入スクリプト

Phase 2: ML評価基盤
- 10クエリ×3正解のデータを投入
"""

import os
import sys
import django
from pathlib import Path

# Django setup
sys.path.insert(0, str(Path(__file__).parent))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'rag_project.settings')
django.setup()

from rag_api.models import EvaluationQuery

# 評価データセット（10クエリ×3正解）
EVALUATION_DATASET = [
    # 固有名詞クエリ（5個）
    {
        "query": "Mike King",
        "expected_fragment_ids": [
            "author-profile-mike-king",
            "relevance-engineering-intro",
            "seo-expert-profile"
        ],
        "category": "author",
        "difficulty": 1,
        "description": "著者プロフィール、Relevance Engineering理論の検索"
    },
    {
        "query": "Fragment ID",
        "expected_fragment_ids": [
            "fragment-id-structure",
            "fragment-id-design",
            "complete-uri-explanation"
        ],
        "category": "technical",
        "difficulty": 2,
        "description": "Fragment ID構造、設計思想の検索"
    },
    {
        "query": "Complete URI",
        "expected_fragment_ids": [
            "complete-uri-design",
            "fragment-id-vs-complete-uri",
            "structured-data-uri"
        ],
        "category": "technical",
        "difficulty": 2,
        "description": "Complete URI設計、Fragment IDとの関係性の検索"
    },
    {
        "query": "Relevance Engineering",
        "expected_fragment_ids": [
            "relevance-engineering-intro",
            "mike-king-theory",
            "rag-relevance-optimization"
        ],
        "category": "technical",
        "difficulty": 3,
        "description": "Relevance Engineering理論、RAG最適化の検索"
    },
    {
        "query": "GEO",
        "expected_fragment_ids": [
            "geo-seo-strategy",
            "generative-engine-optimization",
            "ai-search-optimization"
        ],
        "category": "technical",
        "difficulty": 2,
        "description": "Generative Engine Optimization、AIサーチ最適化の検索"
    },
    
    # 一般語クエリ（5個）
    {
        "query": "AI開発",
        "expected_fragment_ids": [
            "ai-development-guide",
            "ai-agent-implementation",
            "ai-project-workflow"
        ],
        "category": "general",
        "difficulty": 3,
        "description": "AI開発ガイド、エージェント実装の検索"
    },
    {
        "query": "SEO対策",
        "expected_fragment_ids": [
            "seo-strategy-2025",
            "technical-seo-guide",
            "seo-optimization-tips"
        ],
        "category": "general",
        "difficulty": 3,
        "description": "SEO戦略、技術的SEOの検索"
    },
    {
        "query": "データ分析",
        "expected_fragment_ids": [
            "data-analysis-guide",
            "rag-data-analysis",
            "analytics-dashboard"
        ],
        "category": "general",
        "difficulty": 3,
        "description": "データ分析ガイド、RAGデータ分析の検索"
    },
    {
        "query": "マーケティング",
        "expected_fragment_ids": [
            "digital-marketing-strategy",
            "content-marketing-guide",
            "marketing-automation"
        ],
        "category": "general",
        "difficulty": 4,
        "description": "デジタルマーケティング、コンテンツマーケティングの検索"
    },
    {
        "query": "ウェブサイト開発",
        "expected_fragment_ids": [
            "website-development-guide",
            "nextjs-implementation",
            "web-architecture"
        ],
        "category": "general",
        "difficulty": 4,
        "description": "ウェブサイト開発、Next.js実装の検索"
    }
]


def main():
    print("=" * 80)
    print("評価データセット投入")
    print("=" * 80)
    print()
    
    # 既存のデータを確認
    existing_count = EvaluationQuery.objects.count()
    print(f"既存の評価クエリ数: {existing_count}")
    
    if existing_count > 0:
        response = input("既存のデータを削除しますか？ (yes/no): ")
        if response.lower() == 'yes':
            EvaluationQuery.objects.all().delete()
            print("✅ 既存データを削除しました")
    
    print()
    print("📝 新しい評価データを投入します...")
    print()
    
    created_count = 0
    for i, data in enumerate(EVALUATION_DATASET, 1):
        query_obj = EvaluationQuery.objects.create(
            query=data['query'],
            expected_fragment_ids=data['expected_fragment_ids'],
            category=data['category'],
            difficulty=data['difficulty'],
            description=data['description']
        )
        created_count += 1
        print(f"  [{i:2d}/10] ✅ {query_obj.query:30s} ({query_obj.category}, 難易度: {query_obj.difficulty})")
    
    print()
    print("=" * 80)
    print(f"✅ 評価データセット投入完了: {created_count}件")
    print("=" * 80)
    print()
    
    # 投入結果の確認
    print("📊 カテゴリ別統計:")
    for category in ['author', 'technical', 'general']:
        count = EvaluationQuery.objects.filter(category=category).count()
        print(f"  - {category:10s}: {count}件")
    
    print()
    print("📊 難易度別統計:")
    for difficulty in range(1, 6):
        count = EvaluationQuery.objects.filter(difficulty=difficulty).count()
        print(f"  - 難易度 {difficulty}: {count}件")
    
    print()
    print("🎉 準備完了！評価システムの実装を開始できます。")
    print()


if __name__ == '__main__':
    main()

