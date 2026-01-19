#!/usr/bin/env python
"""
Similarity Distribution Investigation

目的：なぜ cosine similarity が 0.03〜0.04 しかないのかを調査
- 固有名詞 vs 一般語でsimilarity分布を比較
- データ/embedding品質の問題を切り分け
"""

import os
import sys
import django
from pathlib import Path

# Django setup
sys.path.insert(0, str(Path(__file__).parent))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'rag_project.settings')
django.setup()

from django.db import connection
from openai import OpenAI
from django.conf import settings
import json
from datetime import datetime

client = OpenAI(api_key=settings.OPENAI_API_KEY)

# テストクエリ（固有名詞5・一般語5）
TEST_QUERIES = {
    'proper_nouns': [
        'Mike King',
        'Fragment ID',
        'ベクトルリンク',
        'Complete URI',
        'Relevance Engineering'
    ],
    'general_terms': [
        'AI開発',
        'SEO対策',
        'データ分析',
        'マーケティング',
        'ウェブサイト'
    ]
}

def get_embedding(text: str):
    """OpenAI Embeddingsでベクトル化"""
    response = client.embeddings.create(
        input=text,
        model=settings.RAG_CONFIG['EMBEDDING_MODEL'],
        dimensions=settings.RAG_CONFIG['EMBEDDING_DIMENSIONS']
    )
    return response.data[0].embedding


def investigate_query(query: str, query_type: str):
    """クエリのsimilarity分布を調査"""
    print(f"\n{'='*80}")
    print(f"🔍 Query: '{query}' ({query_type})")
    print(f"{'='*80}")
    
    # Embedding生成
    query_embedding = get_embedding(query)
    query_embedding_str = str(query_embedding)
    
    results = {}
    
    # Fragment Vectors
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT
                fragment_id,
                complete_uri,
                content_title,
                content,
                1 - (embedding <=> %s::vector) as similarity
            FROM fragment_vectors
            ORDER BY similarity DESC
            LIMIT 20
        """, [query_embedding_str])
        
        rows = cursor.fetchall()
        similarities = [float(row[4]) for row in rows]
        
        if similarities:
            results['fragment'] = {
                'count': len(similarities),
                'top1': similarities[0],
                'top5_avg': sum(similarities[:5]) / min(5, len(similarities)),
                'top20_avg': sum(similarities) / len(similarities),
                'p50': sorted(similarities)[len(similarities)//2],
                'p90': sorted(similarities)[int(len(similarities)*0.9)],
                'all': similarities,
                'top3_titles': [row[2] for row in rows[:3]]
            }
    
    # Company Vectors
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT
                page_slug,
                section_title,
                content_chunk,
                1 - (embedding <=> %s::vector) as similarity
            FROM company_vectors
            ORDER BY similarity DESC
            LIMIT 20
        """, [query_embedding_str])
        
        rows = cursor.fetchall()
        similarities = [float(row[3]) for row in rows]
        
        if similarities:
            results['company'] = {
                'count': len(similarities),
                'top1': similarities[0],
                'top5_avg': sum(similarities[:5]) / min(5, len(similarities)),
                'top20_avg': sum(similarities) / len(similarities),
                'p50': sorted(similarities)[len(similarities)//2],
                'p90': sorted(similarities)[int(len(similarities)*0.9)],
                'all': similarities,
                'top3_titles': [row[1] for row in rows[:3]]
            }
    
    # Trend Vectors
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT
                trend_topic,
                content,
                1 - (embedding <=> %s::vector) as similarity
            FROM trend_vectors
            ORDER BY similarity DESC
            LIMIT 20
        """, [query_embedding_str])
        
        rows = cursor.fetchall()
        similarities = [float(row[2]) for row in rows]
        
        if similarities:
            results['trend'] = {
                'count': len(similarities),
                'top1': similarities[0],
                'top5_avg': sum(similarities[:5]) / min(5, len(similarities)),
                'top20_avg': sum(similarities) / len(similarities),
                'p50': sorted(similarities)[len(similarities)//2],
                'p90': sorted(similarities)[int(len(similarities)*0.9)],
                'all': similarities,
                'top3_titles': [row[0] for row in rows[:3]]
            }
    
    # YouTube Vectors
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT
                video_title,
                content,
                1 - (embedding <=> %s::vector) as similarity
            FROM youtube_vectors
            ORDER BY similarity DESC
            LIMIT 20
        """, [query_embedding_str])
        
        rows = cursor.fetchall()
        similarities = [float(row[2]) for row in rows]
        
        if similarities:
            results['youtube'] = {
                'count': len(similarities),
                'top1': similarities[0],
                'top5_avg': sum(similarities[:5]) / min(5, len(similarities)),
                'top20_avg': sum(similarities) / len(similarities),
                'p50': sorted(similarities)[len(similarities)//2],
                'p90': sorted(similarities)[int(len(similarities)*0.9)],
                'all': similarities,
                'top3_titles': [row[0] for row in rows[:3]]
            }
    
    # 結果表示
    for source, stats in results.items():
        print(f"\n📊 {source.upper()}")
        print(f"  Top1:      {stats['top1']:.6f}")
        print(f"  Top5 Avg:  {stats['top5_avg']:.6f}")
        print(f"  Top20 Avg: {stats['top20_avg']:.6f}")
        print(f"  P50:       {stats['p50']:.6f}")
        print(f"  P90:       {stats['p90']:.6f}")
        print(f"  Top3 Titles:")
        for i, title in enumerate(stats['top3_titles'], 1):
            print(f"    {i}. {title[:60]}...")
    
    return {
        'query': query,
        'query_type': query_type,
        'timestamp': datetime.now().isoformat(),
        'results': results
    }


def main():
    """メイン実行"""
    all_results = []
    
    print("="*80)
    print("🔬 Similarity Distribution Investigation")
    print("="*80)
    print(f"Model: {settings.RAG_CONFIG['EMBEDDING_MODEL']}")
    print(f"Dimensions: {settings.RAG_CONFIG['EMBEDDING_DIMENSIONS']}")
    threshold = settings.RAG_CONFIG.get('SEARCH_THRESHOLD')
    print(f"Current Threshold: {threshold if threshold is not None else '(not set)'}")
    print("="*80)
    
    # 固有名詞クエリ
    print("\n\n" + "="*80)
    print("📍 PROPER NOUNS (固有名詞)")
    print("="*80)
    for query in TEST_QUERIES['proper_nouns']:
        result = investigate_query(query, 'proper_noun')
        all_results.append(result)
    
    # 一般語クエリ
    print("\n\n" + "="*80)
    print("🌐 GENERAL TERMS (一般語)")
    print("="*80)
    for query in TEST_QUERIES['general_terms']:
        result = investigate_query(query, 'general_term')
        all_results.append(result)
    
    # 統計サマリー
    print("\n\n" + "="*80)
    print("📈 SUMMARY STATISTICS")
    print("="*80)
    
    proper_noun_top1 = []
    general_term_top1 = []
    
    for result in all_results:
        if result['query_type'] == 'proper_noun':
            for source, stats in result['results'].items():
                proper_noun_top1.append(stats['top1'])
        else:
            for source, stats in result['results'].items():
                general_term_top1.append(stats['top1'])
    
    if proper_noun_top1:
        print(f"\n固有名詞 Top1 Similarity:")
        print(f"  Average: {sum(proper_noun_top1)/len(proper_noun_top1):.6f}")
        print(f"  Max:     {max(proper_noun_top1):.6f}")
        print(f"  Min:     {min(proper_noun_top1):.6f}")
    
    if general_term_top1:
        print(f"\n一般語 Top1 Similarity:")
        print(f"  Average: {sum(general_term_top1)/len(general_term_top1):.6f}")
        print(f"  Max:     {max(general_term_top1):.6f}")
        print(f"  Min:     {min(general_term_top1):.6f}")
    
    # 判定
    print("\n\n" + "="*80)
    print("🎯 DIAGNOSIS")
    print("="*80)
    
    proper_avg = sum(proper_noun_top1)/len(proper_noun_top1) if proper_noun_top1 else 0
    general_avg = sum(general_term_top1)/len(general_term_top1) if general_term_top1 else 0
    
    if proper_avg > 0.3:
        print("✅ 固有名詞で高い類似度 → 正常")
    elif proper_avg > 0.1:
        print("⚠️ 固有名詞でやや低い類似度 → コーパス/クエリの特性かも")
    else:
        print("🚨 固有名詞でも低い類似度 → embedding/データ品質を疑うべき")
    
    if proper_avg > general_avg * 1.5:
        print("✅ 固有名詞 > 一般語 → 期待通りの分布")
    else:
        print("⚠️ 固有名詞と一般語の差が小さい → 要調査")
    
    # JSON保存
    output_file = f"/tmp/similarity_investigation_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(all_results, f, ensure_ascii=False, indent=2)
    
    print(f"\n📄 詳細結果: {output_file}")
    print("\n" + "="*80)


if __name__ == '__main__':
    main()

