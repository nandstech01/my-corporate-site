"""
Phase 4 Week 2 ゲート2: 実Fragment ID調査

目的:
- fragment_vectorsから実際のFragment IDを取得
- Technical / General カテゴリに分類
- BM25が効きやすいクエリ（固有名詞中心）を選定
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'rag_project.settings')
django.setup()

from django.db import connection

def investigate_technical_fragments():
    """Technical系のFragment ID調査"""
    tech_keywords = [
        'API', 'authentication', 'deployment', 'TypeScript', 
        'React', 'Next.js', 'Supabase', 'Claude', 'GraphQL', 'Vercel'
    ]
    
    cursor = connection.cursor()
    results = []
    
    print("=" * 80)
    print("🔍 Technical Fragment ID 調査")
    print("=" * 80)
    print()
    
    for keyword in tech_keywords:
        cursor.execute('''
            SELECT DISTINCT fragment_id, content_title, LEFT(content, 150) as content_preview
            FROM fragment_vectors
            WHERE (content_title ILIKE %s OR content ILIKE %s)
            AND fragment_id IS NOT NULL
            LIMIT 5
        ''', [f'%{keyword}%', f'%{keyword}%'])
        
        rows = cursor.fetchall()
        if rows:
            print(f"[{keyword}]")
            for row in rows:
                fragment_id, content_title, content_preview = row
                results.append({
                    'keyword': keyword,
                    'fragment_id': fragment_id,
                    'content_title': content_title,
                    'content_preview': content_preview
                })
                print(f"  ID: {fragment_id}")
                print(f"  Title: {content_title[:80] if content_title else 'N/A'}")
                print()
    
    return results


def investigate_general_fragments():
    """General系のFragment ID調査"""
    general_keywords = [
        'web development', 'performance', 'optimization', 
        'design', 'database', 'architecture'
    ]
    
    cursor = connection.cursor()
    results = []
    
    print("=" * 80)
    print("🔍 General Fragment ID 調査")
    print("=" * 80)
    print()
    
    for keyword in general_keywords:
        cursor.execute('''
            SELECT DISTINCT fragment_id, content_title, LEFT(content, 150) as content_preview
            FROM fragment_vectors
            WHERE (content_title ILIKE %s OR content ILIKE %s)
            AND fragment_id IS NOT NULL
            LIMIT 3
        ''', [f'%{keyword}%', f'%{keyword}%'])
        
        rows = cursor.fetchall()
        if rows:
            print(f"[{keyword}]")
            for row in rows:
                fragment_id, content_title, content_preview = row
                results.append({
                    'keyword': keyword,
                    'fragment_id': fragment_id,
                    'content_title': content_title,
                    'content_preview': content_preview
                })
                print(f"  ID: {fragment_id}")
                print(f"  Title: {content_title[:80] if content_title else 'N/A'}")
                print()
    
    return results


if __name__ == '__main__':
    print("\n")
    tech_results = investigate_technical_fragments()
    print("\n")
    general_results = investigate_general_fragments()
    
    print("=" * 80)
    print("📊 調査結果サマリー")
    print("=" * 80)
    print(f"Technical fragments found: {len(tech_results)}")
    print(f"General fragments found: {len(general_results)}")
    print()
    print("✅ 次のステップ:")
    print("  1. 上記から10件を選定（technical 6 / general 4）")
    print("  2. create_v2_draft_dataset.py を実Fragment IDで再実装")
    print("=" * 80)
