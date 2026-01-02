#!/usr/bin/env python3
"""
Phase 4 Week 2 Task 4: Grafana ↔ MLflow 相互参照の検証スクリプト

このスクリプトは以下を検証します:
1. MLflow Run に grafana_url タグが存在する
2. MLflow Run に django_admin_url タグが存在する
3. タグのURL形式が正しい
4. django_run_idとの紐付けが正しい
"""

import os
import sys
import mlflow
from mlflow.tracking import MlflowClient

# MLflow設定
MLFLOW_TRACKING_URI = os.getenv('MLFLOW_TRACKING_URI', 'http://mlflow:5000')
EXPERIMENT_NAME = 'rag-optimization'

def verify_mlflow_tags():
    """MLflow Runのタグ検証"""
    print("=" * 80)
    print("📋 Phase 4 Week 2 Task 4: MLflow → Grafana リンク検証")
    print("=" * 80)
    print()
    
    # MLflow設定
    mlflow.set_tracking_uri(MLFLOW_TRACKING_URI)
    client = MlflowClient()
    
    # 実験取得
    try:
        experiment = client.get_experiment_by_name(EXPERIMENT_NAME)
        if not experiment:
            print(f"❌ エラー: 実験 '{EXPERIMENT_NAME}' が見つかりません")
            return False
    except Exception as e:
        print(f"❌ エラー: 実験の取得に失敗 - {e}")
        return False
    
    # 最新のRunを取得
    runs = client.search_runs(
        experiment_ids=[experiment.experiment_id],
        order_by=["start_time DESC"],
        max_results=5
    )
    
    if not runs:
        print(f"❌ エラー: 実験 '{EXPERIMENT_NAME}' にRunが見つかりません")
        return False
    
    print(f"✅ 実験 '{EXPERIMENT_NAME}' の最新5件のRunを検証します")
    print()
    
    all_passed = True
    for i, run in enumerate(runs, 1):
        print("=" * 80)
        print(f"検証 {i}/5: Run ID {run.info.run_id}")
        print("=" * 80)
        
        tags = run.data.tags
        run_name = tags.get('mlflow.runName', 'Unknown')
        django_run_id = tags.get('django_run_id', None)
        status = tags.get('status', 'Unknown')
        
        print(f"  Run Name: {run_name}")
        print(f"  Status: {status}")
        print(f"  Django Run ID: {django_run_id}")
        print()
        
        # status が FAILED の場合はスキップ
        if status == 'FAILED':
            print("  ⚠️  スキップ: status=FAILED のため、タグ検証をスキップします")
            print()
            continue
        
        # 検証1: grafana_url タグの存在
        print("  🔍 検証1: grafana_url タグ")
        grafana_url = tags.get('grafana_url', None)
        if not grafana_url:
            print("    ❌ grafana_url タグが見つかりません")
            all_passed = False
        else:
            print(f"    ✅ 存在: {grafana_url}")
            
            # URL形式の検証
            expected_pattern = f"http://localhost:3001/d/rag-overview?var-run_id={django_run_id}"
            if grafana_url == expected_pattern:
                print(f"    ✅ URL形式が正しい")
            else:
                print(f"    ❌ URL形式が正しくありません")
                print(f"       期待: {expected_pattern}")
                print(f"       実際: {grafana_url}")
                all_passed = False
        print()
        
        # 検証2: django_admin_url タグの存在
        print("  🔍 検証2: django_admin_url タグ")
        django_admin_url = tags.get('django_admin_url', None)
        if not django_admin_url:
            print("    ❌ django_admin_url タグが見つかりません")
            all_passed = False
        else:
            print(f"    ✅ 存在: {django_admin_url}")
            
            # URL形式の検証
            expected_pattern = f"http://localhost:8000/admin/rag_api/evaluationresult/?run_id={django_run_id}"
            if django_admin_url == expected_pattern:
                print(f"    ✅ URL形式が正しい")
            else:
                print(f"    ❌ URL形式が正しくありません")
                print(f"       期待: {expected_pattern}")
                print(f"       実際: {django_admin_url}")
                all_passed = False
        print()
        
        # 検証3: django_run_id タグの存在
        print("  🔍 検証3: django_run_id タグ")
        if not django_run_id:
            print("    ❌ django_run_id タグが見つかりません")
            all_passed = False
        else:
            print(f"    ✅ 存在: {django_run_id}")
        print()
    
    # 最終結果
    print("=" * 80)
    print("🎯 最終結果")
    print("=" * 80)
    
    if all_passed:
        print("✅ すべての検証に合格しました！")
        print()
        print("📊 確認方法:")
        print("  1. MLflow UI にアクセス: http://localhost:5000")
        print("  2. rag-optimization 実験を開く")
        print("  3. 任意のRunをクリック")
        print("  4. 'Tags' セクションに 'grafana_url' と 'django_admin_url' が表示される")
        print("  5. URLをクリックして、Grafana/Django Adminに遷移できることを確認")
        print()
        return True
    else:
        print("❌ 検証に失敗しました。上記のエラーを確認してください。")
        print()
        return False

def main():
    try:
        success = verify_mlflow_tags()
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"❌ 予期しないエラー: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == '__main__':
    main()

