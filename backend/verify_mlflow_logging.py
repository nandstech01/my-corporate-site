#!/usr/bin/env python
"""
Phase 4 Week 1-2 検収スクリプト

MLflow自動ログが正しく動作しているかを検証:
1. MLflow UI に評価runが存在する
2. 必須params（7項目）が全て存在する
3. 必須metrics（8項目）が全て存在する
4. django_run_id と mlflow_run_id が紐付いている

Week 2 ゲート2専用検証:
- dataset_version分離の健全性チェック
- 2run（baseline/bm25）の存在確認
- DB整合性チェック
"""

import mlflow
import os
import sys
import argparse
from datetime import datetime, timedelta

# MLflow接続設定
MLFLOW_TRACKING_URI = os.getenv('MLFLOW_TRACKING_URI', 'http://localhost:5000')
EXPERIMENT_NAME = 'rag-optimization'

# 必須項目定義
REQUIRED_PARAMS = [
    'dataset_version',
    'variant',
    'top_k',
    'fusion_method',
    'embedding_model',
    'embedding_dims',
    'index_fingerprint',
]

REQUIRED_METRICS = [
    'precision_at_5',
    'mrr',
    'ndcg_at_20',
    'recall_at_20',
    'technical.mrr',
    'technical.ndcg_at_20',
    'general.mrr',
    'general.ndcg_at_20',
]

REQUIRED_TAGS = [
    'phase',
    'experiment_type',
    'django_run_id',
]


def verify_mlflow_logging():
    """MLflow自動ログ検証"""
    print("=" * 80)
    print("🔬 Phase 4 Week 1 検収: MLflow自動ログ検証")
    print("=" * 80)
    print(f"MLflow Tracking URI: {MLFLOW_TRACKING_URI}")
    print("")
    
    try:
        mlflow.set_tracking_uri(MLFLOW_TRACKING_URI)
        
        # Experiment取得
        experiment = mlflow.get_experiment_by_name(EXPERIMENT_NAME)
        if not experiment:
            print(f"❌ Experiment '{EXPERIMENT_NAME}' が見つかりません")
            return False
        
        print(f"✅ Experiment '{EXPERIMENT_NAME}' が存在します")
        print(f"   Experiment ID: {experiment.experiment_id}")
        print("")
        
        # 直近2runを取得
        client = mlflow.tracking.MlflowClient()
        runs = client.search_runs(
            experiment_ids=[experiment.experiment_id],
            order_by=["start_time DESC"],
            max_results=2
        )
        
        if len(runs) < 2:
            print(f"⚠️  Warning: 直近2run未満です（現在: {len(runs)} runs）")
            print("   評価を2回実行してください")
            if len(runs) == 0:
                return False
        
        print(f"✅ 直近2runを取得しました")
        print("")
        
        # ゲートA: baseline vs bm25 のvariant差分検証（同じrunに上書き事故を検知）
        print("━" * 80)
        print("🔒 ゲートA: baseline vs bm25 のvariant差分検証")
        print("━" * 80)
        
        variants_in_runs = []
        for run in runs[:2]:
            variant = run.data.params.get('variant', 'N/A')
            variants_in_runs.append(variant)
            print(f"  Run {run.info.run_id[:8]}: variant={variant}")
        
        if len(set(variants_in_runs)) < 2:
            print(f"❌ ゲートA失敗: variantが重複しています ({variants_in_runs})")
            print("   → 同じrunに上書きされている可能性があります")
            all_passed = False
        else:
            print(f"✅ ゲートA合格: variantが異なります ({variants_in_runs})")
        print("")
        
        # 各runを検証
        for i, run in enumerate(runs[:2], 1):
            print("━" * 80)
            print(f"🔍 Run {i}/{len(runs[:2])} 検証")
            print("━" * 80)
            print(f"Run ID: {run.info.run_id}")
            print(f"Run Name: {run.data.tags.get('mlflow.runName', 'N/A')}")
            print(f"開始時刻: {datetime.fromtimestamp(run.info.start_time / 1000)}")
            print("")
            
            # パラメータ検証
            print("📋 パラメータ検証（7項目必須）:")
            params_passed = True
            for param in REQUIRED_PARAMS:
                if param in run.data.params:
                    value = run.data.params[param]
                    # embedding_dims, index_fingerprintの特別チェック
                    if param == 'embedding_dims':
                        try:
                            dims = int(value)
                            if dims > 0:
                                print(f"  ✅ {param}: {value}")
                            else:
                                print(f"  ❌ {param}: {value} (無効な値)")
                                params_passed = False
                        except ValueError:
                            print(f"  ❌ {param}: {value} (数値ではない)")
                            params_passed = False
                    elif param == 'index_fingerprint':
                        # フォーマット検証: "index_build:" で始まるか
                        if value and value != '' and value.startswith('index_build:'):
                            print(f"  ✅ {param}: {value}")
                        elif value and value != '':
                            print(f"  ⚠️  {param}: {value} (フォーマット不正: 'index_build:'で始まるべき)")
                            params_passed = False
                        else:
                            print(f"  ❌ {param}: 空です")
                            params_passed = False
                    else:
                        print(f"  ✅ {param}: {value}")
                else:
                    print(f"  ❌ {param}: 欠落")
                    params_passed = False
            
            if not params_passed:
                all_passed = False
            print("")
            
            # メトリクス検証
            print("📊 メトリクス検証（8項目必須）:")
            metrics_passed = True
            for metric in REQUIRED_METRICS:
                if metric in run.data.metrics:
                    value = run.data.metrics[metric]
                    print(f"  ✅ {metric}: {value:.4f}")
                else:
                    print(f"  ❌ {metric}: 欠落")
                    metrics_passed = False
            
            if not metrics_passed:
                all_passed = False
            print("")
            
            # タグ検証（相互参照用）
            print("🏷️  タグ検証（3項目必須）:")
            tags_passed = True
            for tag in REQUIRED_TAGS:
                if tag in run.data.tags:
                    value = run.data.tags[tag]
                    if tag == 'django_run_id' and (not value or value == ''):
                        print(f"  ❌ {tag}: 空です")
                        tags_passed = False
                    else:
                        print(f"  ✅ {tag}: {value}")
                else:
                    print(f"  ❌ {tag}: 欠落")
                    tags_passed = False
            
            if not tags_passed:
                all_passed = False
            print("")
        
        # ゲートB: DB完全性検証（mlflow_run_id がNULLでないか）
        print("━" * 80)
        print("🔒 ゲートB: DB完全性検証（mlflow_run_id NULL チェック）")
        print("━" * 80)
        
        try:
            import django
            django.setup()
            from rag_api.models import EvaluationResult
            
            # 各runのdjango_run_idを取得
            for run in runs[:2]:
                django_run_id = run.data.tags.get('django_run_id')
                if not django_run_id:
                    print(f"⚠️  Warning: django_run_id タグが見つかりません（Run: {run.info.run_id[:8]}）")
                    continue
                
                # DBでNULL行をカウント
                import uuid
                try:
                    django_run_uuid = uuid.UUID(django_run_id)
                    null_count = EvaluationResult.objects.filter(
                        run_id=django_run_uuid,
                        mlflow_run_id__isnull=True
                    ).count()
                    
                    total_count = EvaluationResult.objects.filter(
                        run_id=django_run_uuid
                    ).count()
                    
                    if null_count == 0 and total_count > 0:
                        print(f"  ✅ Django run_id {django_run_id[:8]}: mlflow_run_id が全行に保存（{total_count}行）")
                    elif total_count == 0:
                        print(f"  ⚠️  Django run_id {django_run_id[:8]}: evaluation_results に行が存在しません")
                    else:
                        print(f"  ❌ Django run_id {django_run_id[:8]}: mlflow_run_id が NULL の行が {null_count}/{total_count} 件存在")
                        all_passed = False
                except ValueError:
                    print(f"  ⚠️  Warning: django_run_id が UUID形式ではありません: {django_run_id}")
                
        except Exception as e:
            print(f"⚠️  Warning: DB検証をスキップ（Django未セットアップまたはDB接続失敗）: {e}")
        
        print("")
        
        # 最終判定
        print("=" * 80)
        if all_passed:
            print("✅ 検収合格: MLflow自動ログが正しく動作しています")
            print("")
            print("📍 次のステップ:")
            print("  1. MLflow UI で2つのrunを並べて表示")
            print("     → http://localhost:5000")
            print("  2. Params/Metricsの差分を確認")
            print("  3. django_run_id から該当runを検索")
            print("")
            print("🛡️  追加検証（Week 1で1回推奨）:")
            print("  4. fail-fast検証:")
            print("     → embedding_dims を意図的に0にして評価実行")
            print("     → 確実に例外で止まることを確認")
            print("     → MLflow UI でFAILED runが残ることを確認")
        else:
            print("❌ 検収不合格: 上記の問題を修正してください")
        print("=" * 80)
        
        return all_passed
        
    except Exception as e:
        print(f"❌ エラー: {e}")
        return False


def verify_gate2_dataset_version(dataset_version='v2.0-draft'):
    """
    Phase 4 Week 2 ゲート2専用検証
    
    目的: dataset_version分離の健全性チェック
    
    検証項目:
    - ゲート2-A: MLflowで dataset_version=v2.0-draft のrunが2本ある
    - ゲート2-B: その2本の variant が baseline と bm25 で重複なし
    - ゲート2-C: DBで dataset_version=v2.0-draft の evaluation_results の mlflow_run_id NULL=0
    
    Args:
        dataset_version: 検証対象のdataset_version（デフォルト: v2.0-draft）
    
    Returns:
        bool: 全ての検証に合格したらTrue
    """
    try:
        print("=" * 80)
        print("🔬 Phase 4 Week 2 ゲート2検証")
        print("=" * 80)
        print(f"Dataset Version: {dataset_version}")
        print("")
        
        # MLflow接続
        mlflow.set_tracking_uri(MLFLOW_TRACKING_URI)
        client = mlflow.tracking.MlflowClient()
        
        # Experiment取得
        try:
            experiment = client.get_experiment_by_name(EXPERIMENT_NAME)
            if experiment is None:
                print(f"❌ Experiment '{EXPERIMENT_NAME}' が見つかりません")
                return False
            experiment_id = experiment.experiment_id
        except Exception as e:
            print(f"❌ Experiment取得エラー: {e}")
            return False
        
        all_passed = True
        
        # ゲート2-A: dataset_version=v2.0-draft のrunが2本ある
        print("━" * 80)
        print("📊 ゲート2-A: dataset_version分離チェック")
        print("━" * 80)
        
        # 全runを取得してdataset_versionでフィルタ
        runs = client.search_runs(
            experiment_ids=[experiment_id],
            order_by=["start_time DESC"],
            max_results=100
        )
        
        target_runs = []
        for run in runs:
            params = run.data.params
            if params.get('dataset_version') == dataset_version:
                target_runs.append(run)
        
        print(f"  dataset_version={dataset_version} のrun数: {len(target_runs)}")
        
        if len(target_runs) < 2:
            print(f"  ❌ 不合格: 2本以上必要（現在: {len(target_runs)}本）")
            all_passed = False
        else:
            print(f"  ✅ 合格: {len(target_runs)}本のrunが存在")
        
        # ゲート2-B: variant が baseline と bm25 で重複なし
        print("")
        print("━" * 80)
        print("📊 ゲート2-B: variant分離チェック")
        print("━" * 80)
        
        variants = set()
        for run in target_runs[:2]:  # 最新2本のみチェック
            variant = run.data.params.get('variant', 'unknown')
            variants.add(variant)
            print(f"  Run ID: {run.info.run_id[:8]}... → variant={variant}")
        
        expected_variants = {'baseline', 'bm25'}
        if variants != expected_variants:
            print(f"  ❌ 不合格: variant={expected_variants}が必要（現在: {variants}）")
            all_passed = False
        else:
            print(f"  ✅ 合格: baseline と bm25 が揃っています")
        
        # ゲート2-C: DBで dataset_version=v2.0-draft の evaluation_results の mlflow_run_id NULL=0
        print("")
        print("━" * 80)
        print("📊 ゲート2-C: DB整合性チェック")
        print("━" * 80)
        
        try:
            # Django設定を動的にロード
            import django
            os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'rag_project.settings')
            django.setup()
            
            from rag_api.models import EvaluationResult, EvaluationQuery
            
            # dataset_versionのクエリ数
            query_count = EvaluationQuery.objects.filter(
                dataset_version=dataset_version
            ).count()
            print(f"  dataset_version={dataset_version} のクエリ数: {query_count}")
            
            # evaluation_resultsの行数
            result_count = EvaluationResult.objects.filter(
                query__dataset_version=dataset_version
            ).count()
            print(f"  evaluation_resultsの行数: {result_count}")
            
            # mlflow_run_id NULL数
            null_count = EvaluationResult.objects.filter(
                query__dataset_version=dataset_version,
                mlflow_run_id__isnull=True
            ).count()
            print(f"  mlflow_run_id NULL数: {null_count}")
            
            if null_count > 0:
                print(f"  ❌ 不合格: mlflow_run_id が NULL の行が {null_count} 件あります")
                all_passed = False
            else:
                print(f"  ✅ 合格: 全行に mlflow_run_id が埋まっています")
                
        except Exception as e:
            print(f"  ❌ DB接続エラー: {e}")
            all_passed = False
        
        # 最終判定
        print("")
        print("=" * 80)
        if all_passed:
            print("✅ ゲート2検収合格: dataset_version分離が正しく動作しています")
            print("")
            print("📍 次のステップ:")
            print("  1. ゲート3へ進む（v2.0に昇格、50件に拡張）")
            print("  2. MLflow UI で v1.0-reviewed vs v2.0-draft を比較")
            print("     → http://localhost:5000")
        else:
            print("❌ ゲート2検収不合格: 上記の問題を修正してください")
        print("=" * 80)
        
        return all_passed
        
    except Exception as e:
        print(f"❌ エラー: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == '__main__':
    # コマンドライン引数解析
    parser = argparse.ArgumentParser(description='MLflow自動ログ検証スクリプト')
    parser.add_argument(
        '--gate',
        type=int,
        default=1,
        help='検証ゲート番号（1: Week 1基本検証, 2: Week 2 dataset_version分離検証）'
    )
    parser.add_argument(
        '--dataset-version',
        type=str,
        default='v2.0-draft',
        help='ゲート2で検証するdataset_version（デフォルト: v2.0-draft）'
    )
    args = parser.parse_args()
    
    # ゲート番号に応じて検証実行
    if args.gate == 2:
        success = verify_gate2_dataset_version(dataset_version=args.dataset_version)
    else:
        success = verify_mlflow_logging()
    
    sys.exit(0 if success else 1)

