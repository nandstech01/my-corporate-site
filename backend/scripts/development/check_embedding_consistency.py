#!/usr/bin/env python
"""
Embedding Consistency Check

目的：5つのRAGソースすべてで、embeddingモデルが統一されているか検証
- 各テーブルから1件サンプルを取得
- embeddingの次元数と分布を確認
- 異なるモデルで生成されたベクトルは、統計的特徴が異なる
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
import numpy as np

def analyze_embedding_stats(table_name: str, id_field: str = 'id'):
    """テーブルからサンプルを取得してembedding統計を分析"""
    with connection.cursor() as cursor:
        # pgvectorの次元数を取得
        cursor.execute(f"""
            SELECT 
                {id_field},
                embedding
            FROM {table_name}
            LIMIT 5
        """)
        
        rows = cursor.fetchall()
        
        if not rows:
            return {
                'table': table_name,
                'count': 0,
                'dimensions': None,
                'stats': None
            }
        
        # 最初の行からembeddingを取得
        sample_id = rows[0][0]
        
        # embeddingの統計情報を計算
        embeddings = []
        for row in rows:
            # pgvector型を文字列として取得
            emb_str = str(row[1])
            # '[0.1, 0.2, ...]' → [0.1, 0.2, ...]
            emb_list = eval(emb_str)
            embeddings.append(emb_list)
        
        embeddings_array = np.array(embeddings)
        dimensions = embeddings_array.shape[1]
        
        return {
            'table': table_name,
            'sample_id': sample_id,
            'count': len(rows),
            'dimensions': dimensions,
            'stats': {
                'mean': float(np.mean(embeddings_array)),
                'std': float(np.std(embeddings_array)),
                'min': float(np.min(embeddings_array)),
                'max': float(np.max(embeddings_array)),
                'norm_avg': float(np.mean([np.linalg.norm(emb) for emb in embeddings])),
            }
        }

def main():
    print("=" * 80)
    print("🔬 Embedding Consistency Check")
    print("=" * 80)
    print()
    
    tables = [
        ('fragment_vectors', 'fragment_id'),
        ('company_vectors', 'id'),
        ('trend_vectors', 'id'),
        ('youtube_vectors', 'id'),
        ('knowledge_vectors', 'id'),
    ]
    
    results = []
    
    for table_name, id_field in tables:
        print(f"📊 Analyzing {table_name}...")
        try:
            result = analyze_embedding_stats(table_name, id_field)
            results.append(result)
            
            if result['count'] > 0:
                print(f"   ✅ Dimensions: {result['dimensions']}")
                print(f"   📈 Mean: {result['stats']['mean']:.6f}")
                print(f"   📈 Std:  {result['stats']['std']:.6f}")
                print(f"   📈 Norm: {result['stats']['norm_avg']:.6f}")
            else:
                print(f"   ⚠️  No data")
        except Exception as e:
            print(f"   ❌ Error: {e}")
            results.append({
                'table': table_name,
                'error': str(e)
            })
        print()
    
    print("=" * 80)
    print("📊 Summary")
    print("=" * 80)
    print()
    
    # 次元数の一貫性チェック
    dimensions_set = set()
    for r in results:
        if 'dimensions' in r and r['dimensions']:
            dimensions_set.add(r['dimensions'])
    
    if len(dimensions_set) == 1:
        print(f"✅ All tables have consistent dimensions: {list(dimensions_set)[0]}")
    elif len(dimensions_set) > 1:
        print(f"⚠️  INCONSISTENT dimensions found: {dimensions_set}")
        print("   This suggests different embedding models or configurations!")
    
    print()
    
    # 統計的特徴の一貫性チェック
    norms = []
    for r in results:
        if 'stats' in r and r['stats']:
            norms.append((r['table'], r['stats']['norm_avg']))
    
    if norms:
        print("📈 Embedding Norm (L2) by table:")
        for table, norm in norms:
            print(f"   {table:25s}: {norm:.6f}")
        
        norm_values = [n[1] for n in norms]
        norm_std = np.std(norm_values)
        print()
        if norm_std < 0.1:
            print(f"✅ Norm variation is low ({norm_std:.6f}) - likely same model")
        else:
            print(f"⚠️  Norm variation is high ({norm_std:.6f}) - possibly different models")
    
    print()
    print("=" * 80)
    print("🎯 Recommendation")
    print("=" * 80)
    print()
    
    if len(dimensions_set) == 1 and (not norms or np.std([n[1] for n in norms]) < 0.1):
        print("✅ Embeddings appear consistent across all tables.")
        print("   You can proceed to Phase 2 with confidence.")
    else:
        print("⚠️  Potential inconsistencies detected.")
        print("   Consider re-embedding tables with text-embedding-3-large (1536d).")
    
    print()

if __name__ == '__main__':
    main()

