"""
Phase 4 Week 2 Task 3: Grafana dataset_version 変数追加

Grafana RAG Overview Dashboard に dataset_version 変数を追加し、
Time series trend パネルに WHERE dataset_version = '$dataset_version' フィルタを追加します。

堅牢版SQL使用:
- GROUP BY dataset_version
- ORDER BY MAX(created_at) DESC
- LIMIT 50
"""

import os
import json
import requests
from requests.auth import HTTPBasicAuth


# Grafana接続設定
# Docker内から接続する場合は http://grafana:3000 を使用
GRAFANA_URL = os.getenv("GRAFANA_URL", "http://grafana:3000")
GRAFANA_USER = os.getenv("GRAFANA_USER", "admin")
GRAFANA_PASSWORD = os.getenv("GRAFANA_PASSWORD", "admin")
DASHBOARD_UID = "rag-overview"


def get_dashboard():
    """既存ダッシュボード取得"""
    url = f"{GRAFANA_URL}/api/dashboards/uid/{DASHBOARD_UID}"
    response = requests.get(
        url,
        auth=HTTPBasicAuth(GRAFANA_USER, GRAFANA_PASSWORD)
    )
    response.raise_for_status()
    return response.json()


def add_dataset_version_variable(dashboard_json):
    """dataset_version 変数を追加（堅牢版SQL）"""
    
    # 既存の変数リストを取得
    templating = dashboard_json["dashboard"].get("templating", {})
    variables = templating.get("list", [])
    
    # 既に dataset_version 変数が存在するかチェック
    existing_var = next((v for v in variables if v["name"] == "dataset_version"), None)
    
    if existing_var:
        print("⚠️  dataset_version 変数は既に存在します。更新します...")
        variables.remove(existing_var)
    
    # dataset_version 変数定義（堅牢版SQL）
    dataset_version_var = {
        "name": "dataset_version",
        "label": "Dataset Version",
        "description": "評価データセットのバージョン",
        "type": "query",
        "datasource": {
            "type": "postgres",
            "uid": "P01B10AD872D9061B"
        },
        "query": """SELECT
  dataset_version AS __value,
  dataset_version AS __text
FROM evaluation_results
WHERE dataset_version IS NOT NULL
GROUP BY dataset_version
ORDER BY MAX(created_at) DESC
LIMIT 50;""",
        "current": {
            "selected": False,
            "text": "All",
            "value": "$__all"
        },
        "definition": "",
        "hide": 0,
        "includeAll": True,
        "multi": False,
        "options": [],
        "refresh": 1,  # On Dashboard Load
        "regex": "",
        "skipUrlSync": False,
        "sort": 0,
        "allValue": None
    }
    
    # 変数リストに追加
    variables.append(dataset_version_var)
    
    # ダッシュボードに反映
    dashboard_json["dashboard"]["templating"] = {
        "list": variables
    }
    
    print("✅ dataset_version 変数を追加しました")
    return dashboard_json


def update_time_series_panels(dashboard_json):
    """Time series パネルに dataset_version フィルタを追加"""
    
    panels = dashboard_json["dashboard"].get("panels", [])
    updated_count = 0
    
    for panel in panels:
        # Time series パネルのみ対象
        if panel.get("type") == "timeseries" and "targets" in panel:
            for target in panel["targets"]:
                if "rawSql" in target:
                    sql = target["rawSql"]
                    
                    # 既にdataset_versionフィルタがある場合はスキップ
                    if "dataset_version" in sql.lower():
                        continue
                    
                    # WHERE句がある場合
                    if "WHERE" in sql.upper():
                        # WHERE句の後に AND dataset_version = '$dataset_version' を追加
                        sql = sql.replace(
                            "WHERE",
                            "WHERE dataset_version IN ($dataset_version) AND",
                            1  # 最初のWHEREのみ置換
                        )
                    else:
                        # WHERE句がない場合、GROUP BY の前に追加
                        if "GROUP BY" in sql.upper():
                            sql = sql.replace(
                                "GROUP BY",
                                "WHERE dataset_version IN ($dataset_version)\nGROUP BY",
                                1
                            )
                        else:
                            # FROM句の後に追加
                            # evaluation_results の後に改行があるか確認
                            if "FROM evaluation_results" in sql:
                                sql = sql.replace(
                                    "FROM evaluation_results",
                                    "FROM evaluation_results\nWHERE dataset_version IN ($dataset_version)",
                                    1
                                )
                    
                    target["rawSql"] = sql
                    updated_count += 1
    
    if updated_count > 0:
        print(f"✅ {updated_count}個のTime seriesパネルにdataset_versionフィルタを追加しました")
    else:
        print("⚠️  更新対象のTime seriesパネルが見つかりませんでした")
    
    return dashboard_json


def update_dashboard(dashboard_json):
    """ダッシュボード更新"""
    url = f"{GRAFANA_URL}/api/dashboards/db"
    
    # message を追加
    dashboard_json["message"] = "Phase 4 Week 2 Task 3: dataset_version変数追加"
    
    # overwrite を有効化（バージョン衝突を回避）
    dashboard_json["overwrite"] = True
    
    response = requests.post(
        url,
        auth=HTTPBasicAuth(GRAFANA_USER, GRAFANA_PASSWORD),
        headers={"Content-Type": "application/json"},
        data=json.dumps(dashboard_json)
    )
    response.raise_for_status()
    return response.json()


def main():
    print("=" * 80)
    print("🔧 Grafana RAG Overview Dashboard 更新")
    print("   Phase 4 Week 2 Task 3: dataset_version変数追加")
    print("=" * 80)
    print()
    
    try:
        # 1. 既存ダッシュボード取得
        print("📥 既存ダッシュボード取得中...")
        dashboard = get_dashboard()
        print(f"✅ ダッシュボード取得完了（Version {dashboard['dashboard']['version']}）")
        print()
        
        # 2. dataset_version 変数追加
        print("🔧 dataset_version 変数追加中...")
        dashboard = add_dataset_version_variable(dashboard)
        print()
        
        # 3. Time series パネル更新
        print("🔧 Time series パネル更新中...")
        dashboard = update_time_series_panels(dashboard)
        print()
        
        # 4. ダッシュボード更新
        print("💾 ダッシュボード保存中...")
        result = update_dashboard(dashboard)
        print(f"✅ ダッシュボード更新完了（Version {result['version']}）")
        print(f"   URL: {result['url']}")
        print()
        
        print("=" * 80)
        print("🎉 Grafana ダッシュボード更新完了！")
        print("=" * 80)
        print()
        print("📊 追加内容:")
        print("  1. dataset_version 変数（堅牢版SQL）")
        print("  2. Time seriesパネルにdataset_versionフィルタ追加")
        print()
        print("🔗 次の手順:")
        print("  1. Grafanaにアクセス: http://localhost:3001/d/rag-overview")
        print("  2. 上部の「Dataset Version」ドロップダウンを確認")
        print("  3. v2.0 を選択してデータを確認")
        
    except requests.exceptions.RequestException as e:
        print(f"❌ エラー: {e}")
        raise


if __name__ == "__main__":
    main()

