#!/usr/bin/env python
"""
Embedding Model Verification - 再埋め込み一致テスト

目的：DB保存ベクトルが本当に text-embedding-3-large (1536d) で生成されたか検証
方法：元テキストを再埋め込みして、DB保存ベクトルとのcosine similarityを測定
判定：平均0.95+ なら統一確定、0.5〜0.8 ならモデル/前処理差分の可能性
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
from django.conf import settings
from openai import OpenAI
import numpy as np
from typing import List, Tuple

client = OpenAI(api_key=settings.OPENAI_API_KEY)

def get_embedding(text: str) -> List[float]:
    """現在の設定で埋め込みを生成"""
    response = client.embeddings.create(
        input=text,
        model=settings.RAG_CONFIG['EMBEDDING_MODEL'],
        dimensions=settings.RAG_CONFIG['EMBEDDING_DIMENSIONS']
    )
    return response.data[0].embedding

def cosine_similarity(vec1: List[float], vec2: List[float]) -> float:
    """2つのベクトルのcosine similarityを計算"""
    v1 = np.array(vec1)
    v2 = np.array(vec2)
    return float(np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2)))

def verify_table(table_name: str, id_field: str, text_field: str, limit: int = 5) -> dict:
    """テーブルのembedding一致を検証"""
    print(f"\n{'='*80}")
    print(f"📊 Verifying: {table_name}")
    print(f"{'='*80}")
    
    with connection.cursor() as cursor:
        cursor.execute(f"""
            SELECT 
                {id_field},
                {text_field},
                embedding
            FROM {table_name}
            WHERE {text_field} IS NOT NULL 
              AND {text_field} != ''
              AND LENGTH({text_field}) > 50
            ORDER BY RANDOM()
            LIMIT {limit}
        """)
        
        rows = cursor.fetchall()
        
        if not rows:
            print("⚠️  No valid samples found")
            return {
                'table': table_name,
                'count': 0,
                'similarities': [],
                'avg_similarity': None,
                'status': 'no_data'
            }
        
        similarities = []
        
        for i, row in enumerate(rows, 1):
            sample_id = row[0]
            text = row[1]
            db_embedding_str = str(row[2])
            
            # DB保存ベクトルをパース
            db_embedding = eval(db_embedding_str)
            
            # テキストの最初の200文字を表示
            text_preview = text[:200] if text else "(empty)"
            print(f"\n[Sample {i}/{len(rows)}] ID: {sample_id}")
            print(f"Text: {text_preview}...")
            
            # 再埋め込み
            print(f"🔄 Re-embedding with {settings.RAG_CONFIG['EMBEDDING_MODEL']} ({settings.RAG_CONFIG['EMBEDDING_DIMENSIONS']}d)...")
            new_embedding = get_embedding(text)
            
            # Cosine similarity計算
            similarity = cosine_similarity(db_embedding, new_embedding)
            similarities.append(similarity)
            
            print(f"✅ Cosine Similarity: {similarity:.6f}", end="")
            
            if similarity >= 0.95:
                print(" (✅ MATCH - Same model)")
            elif similarity >= 0.80:
                print(" (⚠️  MAYBE - Close but not perfect)")
            else:
                print(" (❌ MISMATCH - Different model/preprocessing)")
        
        avg_similarity = np.mean(similarities) if similarities else 0.0
        
        print(f"\n{'─'*80}")
        print(f"📈 Average Similarity: {avg_similarity:.6f}")
        
        if avg_similarity >= 0.95:
            status = 'verified'
            print(f"✅ VERIFIED: {table_name} uses {settings.RAG_CONFIG['EMBEDDING_MODEL']} ({settings.RAG_CONFIG['EMBEDDING_DIMENSIONS']}d)")
        elif avg_similarity >= 0.80:
            status = 'uncertain'
            print(f"⚠️  UNCERTAIN: Close match but not perfect")
        else:
            status = 'mismatch'
            print(f"❌ MISMATCH: Likely different model or preprocessing")
        
        return {
            'table': table_name,
            'count': len(similarities),
            'similarities': similarities,
            'avg_similarity': avg_similarity,
            'min_similarity': min(similarities),
            'max_similarity': max(similarities),
            'status': status
        }

def main():
    print("\n" + "="*80)
    print("🔬 Embedding Model Verification Test")
    print("="*80)
    print(f"Current Config:")
    print(f"  Model: {settings.RAG_CONFIG['EMBEDDING_MODEL']}")
    print(f"  Dimensions: {settings.RAG_CONFIG['EMBEDDING_DIMENSIONS']}")
    print("="*80)
    
    # テーブル定義
    tables = [
        ('fragment_vectors', 'fragment_id', 'content'),
        ('company_vectors', 'id', 'content_chunk'),
        ('trend_vectors', 'id', 'content'),  # content_chunk → content
        ('youtube_vectors', 'id', 'content'),  # content_chunk → content
    ]
    
    results = []
    
    for table_name, id_field, text_field in tables:
        try:
            result = verify_table(table_name, id_field, text_field, limit=5)
            results.append(result)
        except Exception as e:
            print(f"\n❌ Error processing {table_name}: {e}")
            results.append({
                'table': table_name,
                'status': 'error',
                'error': str(e)
            })
    
    # 最終レポート
    print("\n" + "="*80)
    print("📊 FINAL REPORT")
    print("="*80)
    print()
    
    verified_count = 0
    uncertain_count = 0
    mismatch_count = 0
    
    for result in results:
        if result['status'] == 'verified':
            status_icon = "✅"
            verified_count += 1
        elif result['status'] == 'uncertain':
            status_icon = "⚠️ "
            uncertain_count += 1
        elif result['status'] == 'mismatch':
            status_icon = "❌"
            mismatch_count += 1
        else:
            status_icon = "⚪"
        
        table_name = result['table']
        
        if result.get('avg_similarity') is not None:
            avg_sim = result['avg_similarity']
            print(f"{status_icon} {table_name:25s}: {avg_sim:.6f} ({result['count']} samples)")
        else:
            print(f"{status_icon} {table_name:25s}: {result['status']}")
    
    print()
    print("="*80)
    print("🎯 CONCLUSION")
    print("="*80)
    print()
    
    if verified_count == len([r for r in results if r['status'] in ['verified', 'uncertain', 'mismatch']]):
        print("✅ ALL TABLES VERIFIED")
        print(f"   All {verified_count} tables are confirmed to use")
        print(f"   {settings.RAG_CONFIG['EMBEDDING_MODEL']} ({settings.RAG_CONFIG['EMBEDDING_DIMENSIONS']}d)")
        print()
        print("✅ You can proceed to Phase 2 with confidence.")
        print("   No re-embedding is needed.")
    elif mismatch_count > 0:
        print(f"❌ MISMATCH DETECTED ({mismatch_count} tables)")
        print("   Some tables appear to use a different embedding model.")
        print()
        print("⚠️  RECOMMENDATION:")
        print("   1. Re-embed mismatched tables with text-embedding-3-large (1536d)")
        print("   2. Or adjust RAG_CONFIG to match the existing model")
    elif uncertain_count > 0:
        print(f"⚠️  UNCERTAIN ({uncertain_count} tables)")
        print("   Similarity is close but not perfect (0.80-0.95).")
        print("   This could be due to:")
        print("   - Text preprocessing differences")
        print("   - OpenAI API variations")
        print()
        print("📊 RECOMMENDATION:")
        print("   Monitor Phase 2 metrics closely.")
        print("   If evaluation is unstable, consider re-embedding.")
    
    print()
    print("="*80)

if __name__ == '__main__':
    main()

