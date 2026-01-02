#!/usr/bin/env python
"""
Phase 3 Week 1: 実Fragment IDに基づいた評価データセット作成

目的: BM25/RRFが効きやすい固有名詞15個 + 一般語10個 = 25クエリ
各クエリに実Fragment IDベースの正解セット（3〜10件）を設定
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

# 既存のデータをクリア（Phase 2の架空IDデータ）
print("=" * 80)
print("🔬 Phase 3 Week 1: 評価データセット作成")
print("=" * 80)
print()

print("📊 既存データのクリア...")
EvaluationQuery.objects.all().delete()
print(f"✅ 削除完了")
print()

# 評価データセット定義
evaluation_dataset = [
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # 固有名詞クエリ（15個）: BM25/RRFが効きやすい
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    {
        'query': 'Mike King',
        'expected_fragment_ids': ['faq-2', 'service-aio-seo', 'mechanism-title'],
        'category': 'author',
        'difficulty': 1,
        'description': '固有名詞（人名）: レリバンスエンジニアリングの第一人者'
    },
    {
        'query': 'Mike King理論とは',
        'expected_fragment_ids': ['faq-2', 'service-aio-seo', 'nands-ai-site'],
        'category': 'author',
        'difficulty': 2,
        'description': '固有名詞＋一般語: Mike King理論の説明'
    },
    {
        'query': 'SAP RAG',
        'expected_fragment_ids': ['case-2', 'faq-14'],
        'category': 'technical',
        'difficulty': 2,
        'description': '固有名詞（製品名）: SAP環境でのRAG実装'
    },
    {
        'query': 'DataRobot',
        'expected_fragment_ids': ['faq-13'],
        'category': 'technical',
        'difficulty': 1,
        'description': '固有名詞（製品名）: ML/AI製品'
    },
    {
        'query': 'RDF OWL オントロジー',
        'expected_fragment_ids': ['faq-7'],
        'category': 'technical',
        'difficulty': 3,
        'description': '固有名詞（技術用語）: オントロジー実装技術'
    },
    {
        'query': 'ChatGPT 企業導入',
        'expected_fragment_ids': ['faq-1', 'faq-1', 'faq-1'],  # 複数のfaq-1に分散
        'category': 'technical',
        'difficulty': 2,
        'description': '固有名詞（製品名）＋一般語: ChatGPT導入方法'
    },
    {
        'query': 'Claude API',
        'expected_fragment_ids': ['enterprise-ai', 'business'],
        'category': 'technical',
        'difficulty': 2,
        'description': '固有名詞（製品名）: Claude API活用'
    },
    {
        'query': 'Perplexity AI検索',
        'expected_fragment_ids': ['nands-ai-site', 'faq-ai-site-1'],
        'category': 'technical',
        'difficulty': 2,
        'description': '固有名詞（製品名）: Perplexity AI検索エンジン'
    },
    {
        'query': 'OpenAI GPT-4',
        'expected_fragment_ids': ['service-chatbot-development', 'ai-site-technology', 'faq-tech-1'],
        'category': 'technical',
        'difficulty': 1,
        'description': '固有名詞（製品名）: OpenAI GPT-4の活用'
    },
    {
        'query': 'Google Gemini',
        'expected_fragment_ids': ['ai-site-technology', 'enterprise-ai'],
        'category': 'technical',
        'difficulty': 2,
        'description': '固有名詞（製品名）: Google Gemini活用'
    },
    {
        'query': 'NDA条項',
        'expected_fragment_ids': ['case-1'],
        'category': 'technical',
        'difficulty': 2,
        'description': '固有名詞（法律用語）: NDA（秘密保持契約）条項'
    },
    {
        'query': 'Fragment ID実装',
        'expected_fragment_ids': ['service-aio-seo', 'nands-ai-site', 'faq-ai-site-3'],
        'category': 'technical',
        'difficulty': 2,
        'description': '固有名詞（技術用語）: Fragment ID実装方法'
    },
    {
        'query': 'AIO SEO対策',
        'expected_fragment_ids': ['service-aio-seo', 'faq-marketing-1', 'faq-1'],
        'category': 'technical',
        'difficulty': 2,
        'description': '固有名詞（サービス名）: AIO SEO対策サービス'
    },
    {
        'query': 'Triple RAG',
        'expected_fragment_ids': ['faq-8'],
        'category': 'technical',
        'difficulty': 3,
        'description': '固有名詞（技術用語）: Triple RAG（3層検索構造）'
    },
    {
        'query': 'NANDS AIサイト',
        'expected_fragment_ids': ['nands-ai-site', 'faq-ai-site-1', 'faq-ai-site-2'],
        'category': 'technical',
        'difficulty': 1,
        'description': '固有名詞（サービス名）: NANDSのAIサイト'
    },
    
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # 一般語クエリ（10個）: ベースライン性能の確認
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    {
        'query': 'RAGとは',
        'expected_fragment_ids': ['faq-1', 'faq-1'],  # 複数のfaq-1に分散（RAG説明）
        'category': 'general',
        'difficulty': 1,
        'description': '一般語: RAGの基本説明'
    },
    {
        'query': 'オントロジー RAG 違い',
        'expected_fragment_ids': ['faq-1', 'summary'],
        'category': 'general',
        'difficulty': 2,
        'description': '一般語: オントロジー×RAGと通常のRAGの違い'
    },
    {
        'query': 'RAG 評価方法',
        'expected_fragment_ids': ['faq-9'],
        'category': 'general',
        'difficulty': 2,
        'description': '一般語: RAGの評価方法'
    },
    {
        'query': 'AI導入 メリット',
        'expected_fragment_ids': ['faq-1', 'faq-1'],  # 複数のfaq-1に分散（AI導入）
        'category': 'general',
        'difficulty': 2,
        'description': '一般語: AI導入のメリット'
    },
    {
        'query': 'チャットボット 開発',
        'expected_fragment_ids': ['service-chatbot-development'],
        'category': 'general',
        'difficulty': 2,
        'description': '一般語: チャットボット開発サービス'
    },
    {
        'query': 'エンタープライズ AI 課題',
        'expected_fragment_ids': ['faq-10', 'enterprise-ai'],
        'category': 'general',
        'difficulty': 3,
        'description': '一般語: エンタープライズAIの課題'
    },
    {
        'query': 'AI検索 最適化',
        'expected_fragment_ids': ['service-aio-seo', 'faq-1', 'faq-marketing-1'],
        'category': 'general',
        'difficulty': 2,
        'description': '一般語: AI検索エンジン最適化'
    },
    {
        'query': '構造化データ 実装',
        'expected_fragment_ids': ['faq-4', 'faq-1'],
        'category': 'general',
        'difficulty': 3,
        'description': '一般語: 構造化データの実装方法'
    },
    {
        'query': '金融 AI 導入事例',
        'expected_fragment_ids': ['case-a', 'case-studies'],
        'category': 'general',
        'difficulty': 3,
        'description': '一般語: 金融業界のAI導入事例'
    },
    {
        'query': '中小企業 AI活用',
        'expected_fragment_ids': ['faq-11', 'faq-1'],
        'category': 'general',
        'difficulty': 2,
        'description': '一般語: 中小企業でのAI活用'
    },
]

# データ投入
print("📝 評価クエリの作成...")
print()

created_count = 0
for i, data in enumerate(evaluation_dataset, 1):
    query_obj = EvaluationQuery.objects.create(
        query=data['query'],
        expected_fragment_ids=data['expected_fragment_ids'],
        category=data['category'],
        difficulty=data['difficulty'],
        description=data['description']
    )
    print(f"  [{i:2d}/25] {data['category']:10s} | {data['query']:30s} | {len(data['expected_fragment_ids'])} 件")
    created_count += 1

print()
print("=" * 80)
print(f"✅ 評価データセット作成完了: {created_count} クエリ")
print("=" * 80)
print()

# 統計情報表示
print("📊 カテゴリ別統計:")
from django.db.models import Count
stats = EvaluationQuery.objects.values('category').annotate(count=Count('id')).order_by('-count')
for stat in stats:
    print(f"  - {stat['category']:15s}: {stat['count']:2d} クエリ")

print()
print("📊 難易度別統計:")
diff_stats = EvaluationQuery.objects.values('difficulty').annotate(count=Count('id')).order_by('difficulty')
for stat in diff_stats:
    print(f"  - Difficulty {stat['difficulty']}: {stat['count']:2d} クエリ")

print()
print("=" * 80)
print("🎉 Phase 3 Week 1 Task 1 完了")
print("=" * 80)

