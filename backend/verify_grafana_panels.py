#!/usr/bin/env python3
"""
Grafana パネル検収スクリプト

Phase 3 Week 3 Task2 の最終検収として、Grafana API を通じて以下を確認します：
1. run_id 変数が存在し、正しいクエリを持っているか
2. Panel 8-13 が存在し、正しいタイトルを持っているか
3. Time series パネル (Panel 10-13) が run単位1点のSQLを使用しているか

Usage:
    python verify_grafana_panels.py

Exit codes:
    0: すべての検証に合格
    1: 検証失敗
"""

import requests
import json
import sys
from typing import Dict, List, Tuple

# Grafana設定
# Docker内から実行する場合は http://grafana:3000 を使用
GRAFANA_URL = "http://grafana:3000"
GRAFANA_USER = "admin"
GRAFANA_PASSWORD = "admin"
DASHBOARD_UID = "rag-overview"

# 期待値
EXPECTED_RUN_ID_QUERY = "SELECT er.run_id::text AS __value, er.run_id::text AS __text FROM evaluation_results er GROUP BY er.run_id ORDER BY MAX(er.created_at) DESC LIMIT 50"

EXPECTED_PANELS = {
    8: "📊 Technical カテゴリ評価指標（Selected run）",
    9: "📊 General カテゴリ評価指標（Selected run）",
    10: "📈 Technical カテゴリ MRR 推移（All runs）",
    11: "📈 General カテゴリ MRR 推移（All runs）",
    12: "📈 Technical カテゴリ NDCG@20 推移（All runs）",
    13: "📈 General カテゴリ NDCG@20 推移（All runs）",
}

# Time series パネルのSQLに含まれるべきキーワード
EXPECTED_SQL_KEYWORDS = [
    "MAX(er.created_at) AS time",
    "GROUP BY",
    "er.run_id, er.variant",
    "ORDER BY",
    "time ASC",
]


def fetch_dashboard() -> Dict:
    """Grafana APIからダッシュボードを取得"""
    url = f"{GRAFANA_URL}/api/dashboards/uid/{DASHBOARD_UID}"
    response = requests.get(url, auth=(GRAFANA_USER, GRAFANA_PASSWORD))
    
    if response.status_code != 200:
        print(f"❌ ダッシュボード取得失敗: HTTP {response.status_code}")
        sys.exit(1)
    
    return response.json()['dashboard']


def verify_run_id_variable(dashboard: Dict) -> Tuple[bool, str]:
    """run_id 変数の検証"""
    templating = dashboard.get('templating', {})
    variables = templating.get('list', [])
    
    run_id_var = next((var for var in variables if var.get('name') == 'run_id'), None)
    
    if not run_id_var:
        return False, "run_id 変数が見つかりません"
    
    actual_query = run_id_var.get('query', '').strip()
    expected_query = EXPECTED_RUN_ID_QUERY.strip()
    
    if actual_query != expected_query:
        return False, f"run_id 変数のクエリが期待値と異なります\n期待: {expected_query}\n実際: {actual_query}"
    
    return True, "run_id 変数のクエリが正しい"


def verify_dataset_version_variable(dashboard: Dict) -> Tuple[bool, str]:
    """dataset_version 変数の検証（Phase 4 Week 2）"""
    EXPECTED_DATASET_VERSION_QUERY = """SELECT
  dataset_version AS __value,
  dataset_version AS __text
FROM evaluation_results
WHERE dataset_version IS NOT NULL
GROUP BY dataset_version
ORDER BY MAX(created_at) DESC
LIMIT 50"""
    
    templating = dashboard.get('templating', {})
    variables = templating.get('list', [])
    
    dataset_version_var = next((var for var in variables if var.get('name') == 'dataset_version'), None)
    
    if not dataset_version_var:
        return False, "dataset_version 変数が見つかりません（Phase 4 Week 2で追加予定）"
    
    actual_query = dataset_version_var.get('query', '').strip().rstrip(';')
    expected_query = EXPECTED_DATASET_VERSION_QUERY.strip().rstrip(';')
    
    if actual_query != expected_query:
        return False, f"dataset_version 変数のクエリが期待値と異なります\n期待: {expected_query}\n実際: {actual_query}"
    
    return True, "dataset_version 変数のクエリが正しい（堅牢版SQL）"


def verify_panels(dashboard: Dict) -> Tuple[bool, List[str]]:
    """Panel 8-13 の検証"""
    panels = dashboard.get('panels', [])
    messages = []
    all_passed = True
    
    # パネルの存在とタイトル確認
    for expected_id, expected_title in EXPECTED_PANELS.items():
        panel = next((p for p in panels if p.get('id') == expected_id), None)
        
        if not panel:
            messages.append(f"❌ Panel {expected_id} が見つかりません")
            all_passed = False
            continue
        
        actual_title = panel.get('title', '')
        if actual_title != expected_title:
            messages.append(f"❌ Panel {expected_id} のタイトルが期待値と異なります\n期待: {expected_title}\n実際: {actual_title}")
            all_passed = False
        else:
            messages.append(f"✅ Panel {expected_id}: {actual_title}")
    
    return all_passed, messages


def verify_timeseries_sql(dashboard: Dict) -> Tuple[bool, List[str]]:
    """Time series パネル (Panel 10-13) のSQL検証"""
    panels = dashboard.get('panels', [])
    messages = []
    all_passed = True
    
    # Panel 10-13 (Time series) を検証
    for panel_id in range(10, 14):
        panel = next((p for p in panels if p.get('id') == panel_id), None)
        
        if not panel:
            messages.append(f"⚠️  Panel {panel_id} が見つかりません（スキップ）")
            continue
        
        # SQLを取得
        targets = panel.get('targets', [])
        if not targets:
            messages.append(f"❌ Panel {panel_id}: targets が見つかりません")
            all_passed = False
            continue
        
        raw_sql = targets[0].get('rawSql', '')
        
        # 期待されるキーワードが含まれているか確認
        missing_keywords = []
        for keyword in EXPECTED_SQL_KEYWORDS:
            if keyword not in raw_sql:
                missing_keywords.append(keyword)
        
        if missing_keywords:
            messages.append(f"❌ Panel {panel_id}: SQLに期待されるキーワードが不足しています")
            messages.append(f"   不足: {', '.join(missing_keywords)}")
            all_passed = False
        else:
            messages.append(f"✅ Panel {panel_id}: SQLがrun単位1点に正しく設定されています")
    
    return all_passed, messages


def verify_mlflow_run_link_panel(dashboard: Dict) -> Tuple[bool, str]:
    """MLflow Run Link パネルの検証（Phase 4 Week 2 Task 4）"""
    panels = dashboard.get('panels', [])
    
    # "🔗 MLflow Run Link" パネルを検索
    mlflow_panel = next((p for p in panels if p.get('title') == '🔗 MLflow Run Link'), None)
    
    if not mlflow_panel:
        return False, "🔗 MLflow Run Link パネルが見つかりません（Phase 4 Week 2 Task 4で追加予定）"
    
    # パネルタイプの検証（tableである必要がある）
    panel_type = mlflow_panel.get('type')
    if panel_type != 'table':
        return False, f"MLflow Run Link パネルのタイプが正しくありません（期待: table、実際: {panel_type}）"
    
    # SQLクエリの検証
    targets = mlflow_panel.get('targets', [])
    if not targets:
        return False, "MLflow Run Link パネルにtargetsが定義されていません"
    
    sql = targets[0].get('rawSql', '').strip()
    
    # 必須キーワードの検証
    required_keywords = [
        'mlflow_run_id',
        'evaluation_results',
        '$run_id',
        'variant',
        'dataset_version'
    ]
    
    missing_keywords = [kw for kw in required_keywords if kw not in sql]
    if missing_keywords:
        return False, f"MLflow Run Link パネルのSQLに必須キーワードが含まれていません: {', '.join(missing_keywords)}"
    
    # Data linkの検証
    field_config = mlflow_panel.get('fieldConfig', {})
    overrides = field_config.get('overrides', [])
    
    mlflow_run_id_override = None
    for override in overrides:
        matcher = override.get('matcher', {})
        if matcher.get('id') == 'byName' and matcher.get('options') == 'MLflow Run ID':
            mlflow_run_id_override = override
            break
    
    if not mlflow_run_id_override:
        return False, "MLflow Run Link パネルに 'MLflow Run ID' フィールドのオーバーライドが設定されていません"
    
    # リンクの検証
    properties = mlflow_run_id_override.get('properties', [])
    links_prop = next((p for p in properties if p.get('id') == 'links'), None)
    
    if not links_prop:
        return False, "MLflow Run Link パネルの 'MLflow Run ID' フィールドにリンクが設定されていません"
    
    links = links_prop.get('value', [])
    if not links:
        return False, "MLflow Run Link パネルのリンクが空です"
    
    # リンクURLの検証
    link_url = links[0].get('url', '')
    if 'http://localhost:5000' not in link_url or '/experiments/' not in link_url:
        return False, f"MLflow Run Link パネルのリンクURLが正しくありません: {link_url}"
    
    return True, "MLflow Run Link パネルが正しく設定されている（Phase 4 Week 2 Task 4）"


def main():
    """メイン実行"""
    print("=" * 80)
    print("🔍 Grafana パネル検収（Task2 最終検証）")
    print("=" * 80)
    print()
    
    # ダッシュボード取得
    print(f"📥 ダッシュボード取得中... ({GRAFANA_URL}/d/{DASHBOARD_UID})")
    dashboard = fetch_dashboard()
    print(f"✅ ダッシュボード取得成功: {dashboard.get('title', 'Unknown')}")
    print()
    
    # 検証1: run_id 変数
    print("=" * 80)
    print("検証1: run_id 変数")
    print("=" * 80)
    var_passed, var_message = verify_run_id_variable(dashboard)
    print(f"{'✅' if var_passed else '❌'} {var_message}")
    print()
    
    # 検証1-2: dataset_version 変数（Phase 4 Week 2）
    print("=" * 80)
    print("検証1-2: dataset_version 変数（Phase 4 Week 2）")
    print("=" * 80)
    dataset_var_passed, dataset_var_message = verify_dataset_version_variable(dashboard)
    print(f"{'✅' if dataset_var_passed else '⚠️ '} {dataset_var_message}")
    print()
    
    # 検証1-3: MLflow Run Link パネル（Phase 4 Week 2 Task 4）
    print("=" * 80)
    print("検証1-3: MLflow Run Link パネル（Phase 4 Week 2 Task 4）")
    print("=" * 80)
    mlflow_panel_passed, mlflow_panel_message = verify_mlflow_run_link_panel(dashboard)
    print(f"{'✅' if mlflow_panel_passed else '❌'} {mlflow_panel_message}")
    print()
    
    # 検証2: Panel 8-13 の存在とタイトル
    print("=" * 80)
    print("検証2: Panel 8-13 の存在とタイトル")
    print("=" * 80)
    panels_passed, panel_messages = verify_panels(dashboard)
    for msg in panel_messages:
        print(msg)
    print()
    
    # 検証3: Time series パネルのSQL
    print("=" * 80)
    print("検証3: Time series パネル (10-13) のSQL")
    print("=" * 80)
    sql_passed, sql_messages = verify_timeseries_sql(dashboard)
    for msg in sql_messages:
        print(msg)
    print()
    
    # 最終結果
    print("=" * 80)
    print("🎯 最終結果")
    print("=" * 80)
    
    # Phase 4 Week 2: dataset_version検証とMLflow Run Link検証を最終判定に含める
    all_passed = var_passed and dataset_var_passed and mlflow_panel_passed and panels_passed and sql_passed
    
    print(f"  run_id変数検証: {'✅' if var_passed else '❌'}")
    print(f"  dataset_version変数検証: {'✅' if dataset_var_passed else '❌'}")
    print(f"  MLflow Run Linkパネル検証: {'✅' if mlflow_panel_passed else '❌'}")
    print(f"  パネル検証: {'✅' if panels_passed else '❌'}")
    print(f"  SQL検証: {'✅' if sql_passed else '❌'}")
    print()
    
    if all_passed:
        print("✅ すべての検証に合格しました！")
        print()
        print("📊 次のステップ:")
        print("  - Grafanaダッシュボードを開いて動作を確認してください")
        print(f"  - URL: {GRAFANA_URL}/d/{DASHBOARD_UID}")
        print("  - dataset_version変数で v2.0 を選択してデータを確認してください")
        print()
        sys.exit(0)
    else:
        print("❌ 検証に失敗しました。上記のエラーを確認してください。")
        print()
        sys.exit(1)


if __name__ == "__main__":
    main()

