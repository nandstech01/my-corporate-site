"""
Django管理コマンド: expected_fragment_ids の更新

Usage:
    python manage.py update_expected_ids
"""

import os
import sys
from pathlib import Path
import django

sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'rag_project.settings')
django.setup()

from django.core.management.base import BaseCommand
from rag_api.models import EvaluationQuery


class Command(BaseCommand):
    help = 'expected_fragment_ids を人間レビュー結果で更新（勝ち群3クエリ）'

    def handle(self, *args, **options):
        self.stdout.write("=" * 80)
        self.stdout.write(self.style.SUCCESS("📝 expected_fragment_ids 更新"))
        self.stdout.write("=" * 80)
        self.stdout.write("\n対象: 勝ち群3クエリ（人間レビュー結果を反映）\n")

        # 更新データ（人間レビュー結果より）
        updates = [
            {
                'query': 'OpenAI GPT-4',
                'expected_ids': ['faq-tech-1'],
                'reason': 'BM25で1位、content中に「OpenAI GPT-4」完全一致'
            },
            {
                'query': 'Google Gemini',
                'expected_ids': ['ai-site-technology'],
                'reason': 'BM25で2位、「Google Gemini」を使用技術として明記'
            },
            {
                'query': 'Triple RAG',
                'expected_ids': ['faq-8', 'features-title', 'subtopic-3-1'],
                'reason': 'BM25 top5に正解4件（faq-8, features-title, subtopic-3-1×2）'
            }
        ]

        for update_data in updates:
            query_str = update_data['query']
            expected_ids = update_data['expected_ids']
            reason = update_data['reason']

            try:
                query_obj = EvaluationQuery.objects.get(query=query_str)
                
                # 更新前の値を保存（ログ用）
                old_ids = query_obj.expected_fragment_ids
                
                # 更新
                query_obj.expected_fragment_ids = expected_ids
                query_obj.save()

                self.stdout.write(f"\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
                self.stdout.write(self.style.SUCCESS(f"✅ 更新完了: {query_str}"))
                self.stdout.write(f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
                self.stdout.write(f"  更新前: {old_ids}")
                self.stdout.write(f"  更新後: {expected_ids}")
                self.stdout.write(f"  理由: {reason}")

            except EvaluationQuery.DoesNotExist:
                self.stdout.write(self.style.ERROR(f"\n⚠️  クエリが見つかりません: {query_str}"))

        self.stdout.write("\n" + "=" * 80)
        self.stdout.write(self.style.SUCCESS("✅ 全3クエリの更新完了"))
        self.stdout.write("=" * 80)
        self.stdout.write("\n次のステップ: 再評価を実行してください")
        self.stdout.write("  python manage.py test_task2 --dataset-version v1.0\n")

