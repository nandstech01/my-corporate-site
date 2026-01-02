"""
Django管理コマンド: 人間レビュー用CSVエクスポート

Usage:
    python manage.py export_review_csv --run-id <run_id> --queries "OpenAI GPT-4,Google Gemini,Triple RAG"
"""

import os
import sys
from pathlib import Path
import django
import csv
from django.core.management.base import BaseCommand

sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'rag_project.settings')
django.setup()

from rag_api.models import EvaluationQuery, EvaluationResult
from django.db import connection


class Command(BaseCommand):
    help = '人間レビュー用CSVエクスポート（勝ち群上位3クエリ×top20）'

    def add_arguments(self, parser):
        parser.add_argument(
            '--run-id',
            type=str,
            required=True,
            help='評価実行ID（UUID）'
        )
        parser.add_argument(
            '--queries',
            type=str,
            required=True,
            help='クエリ文字列（カンマ区切り）'
        )
        parser.add_argument(
            '--output',
            type=str,
            default='evaluation_review_top3.csv',
            help='出力CSVファイル名（デフォルト: evaluation_review_top3.csv）'
        )

    def handle(self, *args, **options):
        run_id = options['run_id']
        query_strings = [q.strip() for q in options['queries'].split(',')]
        output_file = options['output']

        self.stdout.write("=" * 80)
        self.stdout.write(self.style.SUCCESS("📋 Task3: 人間レビュー用CSVエクスポート"))
        self.stdout.write("=" * 80)
        self.stdout.write(f"\nRun ID: {run_id}")
        self.stdout.write(f"対象クエリ: {', '.join(query_strings)}")
        self.stdout.write(f"出力ファイル: {output_file}\n")

        # CSVファイルを開く
        csv_rows = []

        # ヘッダー行
        csv_rows.append([
            'query',
            'variant',
            'rank',
            'fragment_id',
            'title',
            'page_path',
            'content_preview',
            '判定',
            '判定理由'
        ])

        for query_str in query_strings:
            self.stdout.write(f"\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
            self.stdout.write(f"📊 処理中: {query_str}")
            self.stdout.write(f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")

            # EvaluationQuery を取得
            try:
                query_obj = EvaluationQuery.objects.get(query=query_str)
            except EvaluationQuery.DoesNotExist:
                self.stdout.write(self.style.ERROR(f"  ⚠️  クエリが見つかりません: {query_str}"))
                continue

            # baseline と bm25 の EvaluationResult を取得
            for variant in ['baseline', 'bm25']:
                try:
                    result = EvaluationResult.objects.get(
                        query=query_obj,
                        variant=variant,
                        run_id=run_id
                    )
                except EvaluationResult.DoesNotExist:
                    self.stdout.write(self.style.WARNING(f"  ⚠️  {variant} の結果が見つかりません"))
                    continue

                # results_json から top_20 を取得
                results_json = result.results_json
                top_20 = results_json.get('top_20', results_json.get('top_5', []))

                if not top_20:
                    self.stdout.write(self.style.WARNING(f"  ⚠️  {variant} の top_20 が空です"))
                    continue

                self.stdout.write(f"\n  📌 {variant.upper()}: {len(top_20)}件")

                # Fragment詳細を取得
                for rank, result_item in enumerate(top_20, start=1):
                    fragment_id = result_item.get('fragment_id', '')
                    title = result_item.get('title', '')
                    page_path = result_item.get('page_path', '')
                    content = result_item.get('content', '')

                    # Content冒頭200字
                    content_preview = content[:200] if content else ''

                    # CSV行を追加
                    csv_rows.append([
                        query_str,
                        variant,
                        rank,
                        fragment_id,
                        title,
                        page_path,
                        content_preview,
                        '',  # 判定（空白）
                        ''   # 判定理由（空白）
                    ])

                    # 進捗表示（上位5件のみ）
                    if rank <= 5:
                        self.stdout.write(f"    {rank:2d}. {fragment_id[:30]:<30} | {title[:40]}")

                if len(top_20) > 5:
                    self.stdout.write(f"    ... 他 {len(top_20) - 5} 件")

        # CSVファイルに書き込み
        with open(output_file, 'w', newline='', encoding='utf-8-sig') as f:
            writer = csv.writer(f)
            writer.writerows(csv_rows)

        self.stdout.write("\n" + "=" * 80)
        self.stdout.write(self.style.SUCCESS(f"✅ CSVエクスポート完了"))
        self.stdout.write("=" * 80)
        self.stdout.write(f"\n📂 出力ファイル: {output_file}")
        self.stdout.write(f"📊 総行数: {len(csv_rows) - 1}件（ヘッダー除く）")
        self.stdout.write("\n" + "=" * 80)

