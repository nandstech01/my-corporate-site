#!/usr/bin/env python3
"""
Phase 4 Week 2 Task 4: Grafana → MLflow リンク実装

Grafana RAG Overview Dashboard に以下を追加します:
1. Text panel: MLflow Run Link（選択したrun_idのMLflow Run詳細ページへのリンク）
"""

import json
import os
import sys
from typing import Dict, List

import requests

# Grafana設定
GRAFANA_URL = os.getenv("GRAFANA_URL", "http://grafana:3000")  # Docker内部からのアクセス用
GRAFANA_USER = os.getenv("GRAFANA_USER", "admin")
GRAFANA_PASSWORD = os.getenv("GRAFANA_PASSWORD", "admin")
DASHBOARD_UID = os.getenv("DASHBOARD_UID", "rag-overview")
DASHBOARD_TITLE = os.getenv("DASHBOARD_TITLE", "RAG Overview Dashboard")
POSTGRES_DATASOURCE_UID = "P01B10AD872D9061B"  # Supabase PostgreSQL datasource UID


def get_dashboard() -> Dict:
    """既存のGrafanaダッシュボードを取得する"""
    url = f"{GRAFANA_URL}/api/dashboards/uid/{DASHBOARD_UID}"
    headers = {"Content-Type": "application/json"}
    response = requests.get(url, headers=headers, auth=(GRAFANA_USER, GRAFANA_PASSWORD))
    response.raise_for_status()
    return response.json()['dashboard']


def update_dashboard(dashboard: Dict) -> Dict:
    """ダッシュボードを更新する"""
    url = f"{GRAFANA_URL}/api/dashboards/db"
    headers = {"Content-Type": "application/json"}
    payload = {
        "dashboard": dashboard,
        "folderId": 0,
        "overwrite": True  # 既存のダッシュボードを上書き
    }
    response = requests.post(url, headers=headers, json=payload, auth=(GRAFANA_USER, GRAFANA_PASSWORD))
    response.raise_for_status()
    return response.json()


def add_mlflow_run_link_panel(dashboard: Dict) -> None:
    """
    MLflow Run Link パネルを追加する
    
    このパネルは選択したrun_idに対応するMLflow Run IDを表示し、
    MLflow UI詳細ページへのリンクを提供します。
    """
    panels = dashboard.get('panels', [])
    
    # 既存のパネルIDの最大値を取得（重複を避ける）
    max_panel_id = 0
    for panel in panels:
        panel_id = panel.get('id', 0)
        if panel_id > max_panel_id:
            max_panel_id = panel_id
    
    new_panel_id = max_panel_id + 1
    
    # 既存の "MLflow Run Link" パネルがあれば削除
    panels_filtered = [p for p in panels if p.get('title') != '🔗 MLflow Run Link']
    
    if len(panels_filtered) < len(panels):
        print("⚠️  既存の '🔗 MLflow Run Link' パネルを削除しました")
    
    # 新しいMLflow Run Linkパネルを作成
    mlflow_run_link_panel = {
        "id": new_panel_id,
        "title": "🔗 MLflow Run Link",
        "type": "table",  # Tableパネルでデータリンクを使用
        "datasource": {
            "type": "postgres",
            "uid": POSTGRES_DATASOURCE_UID
        },
        "gridPos": {
            "x": 0,
            "y": 0,
            "w": 24,
            "h": 4
        },
        "targets": [
            {
                "datasource": {
                    "type": "postgres",
                    "uid": POSTGRES_DATASOURCE_UID
                },
                "format": "table",
                "rawSql": """SELECT
  mlflow_run_id AS "MLflow Run ID",
  variant AS "Variant",
  dataset_version AS "Dataset Version",
  precision_at_5 AS "Precision@5",
  mrr AS "MRR",
  ndcg AS "NDCG@20",
  recall_at_20 AS "Recall@20",
  created_at AS "Created At"
FROM (
  SELECT DISTINCT ON (mlflow_run_id)
    er.mlflow_run_id,
    er.variant,
    eq.dataset_version,
    er.precision_at_5,
    er.mrr,
    er.ndcg,
    er.recall_at_20,
    er.created_at
  FROM evaluation_results er
  JOIN evaluation_queries eq ON er.query_id = eq.id
  WHERE er.run_id = '$run_id'::uuid
    AND er.mlflow_run_id IS NOT NULL
  ORDER BY mlflow_run_id, er.created_at DESC
) AS latest
ORDER BY created_at DESC
LIMIT 1;""",
                "refId": "A"
            }
        ],
        "options": {
            "showHeader": True,
            "footer": {
                "show": False,
                "reducer": ["sum"],
                "fields": ""
            }
        },
        "fieldConfig": {
            "defaults": {
                "custom": {
                    "align": "auto",
                    "inspect": False
                },
                "mappings": [],
                "thresholds": {
                    "mode": "absolute",
                    "steps": [
                        {"value": None, "color": "green"}
                    ]
                },
                "links": [
                    {
                        "title": "View in MLflow",
                        "url": "http://localhost:5000/#/experiments/1/runs/${__data.fields[\"MLflow Run ID\"]}",
                        "targetBlank": True
                    }
                ]
            },
            "overrides": [
                {
                    "matcher": {
                        "id": "byName",
                        "options": "MLflow Run ID"
                    },
                    "properties": [
                        {
                            "id": "custom.width",
                            "value": 300
                        },
                        {
                            "id": "links",
                            "value": [
                                {
                                    "title": "View in MLflow",
                                    "url": "http://localhost:5000/#/experiments/1/runs/${__data.fields[\"MLflow Run ID\"]}",
                                    "targetBlank": True
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        "transparent": False
    }
    
    # パネルを追加
    panels_filtered.append(mlflow_run_link_panel)
    dashboard['panels'] = panels_filtered
    
    print(f"✅ MLflow Run Link パネルを追加しました（Panel ID: {new_panel_id}）")


def main():
    print("=" * 80)
    print("🔧 Grafana RAG Overview Dashboard 更新")
    print("   Phase 4 Week 2 Task 4: Grafana → MLflow リンク実装")
    print("=" * 80)
    print()

    # ダッシュボード取得
    print("📥 既存ダッシュボード取得中...")
    try:
        dashboard = get_dashboard()
        print(f"✅ ダッシュボード取得完了（Version {dashboard.get('version')}）")
    except requests.exceptions.RequestException as e:
        print(f"❌ エラー: ダッシュボード取得失敗 - {e}")
        sys.exit(1)

    # MLflow Run Link パネル追加
    print("\n🔧 MLflow Run Link パネル追加中...")
    add_mlflow_run_link_panel(dashboard)

    # ダッシュボード保存
    print("\n💾 ダッシュボード保存中...")
    try:
        result = update_dashboard(dashboard)
        print(f"✅ ダッシュボード更新完了（Version {result.get('version')}）")
        print(f"   URL: {result.get('url')}")
    except requests.exceptions.RequestException as e:
        print(f"❌ エラー: {e}")
        sys.exit(1)

    print("\n" + "=" * 80)
    print("🎉 Grafana ダッシュボード更新完了！")
    print("=" * 80)
    print("\n📊 追加内容:")
    print("  1. MLflow Run Link パネル（Table形式、Data Link付き）")
    print("     - MLflow Run IDをクリックでMLflow UI詳細ページに遷移")
    print("     - Variant、Dataset Version、評価メトリクスを表示")
    print("\n🔗 次の手順:")
    print("  1. Grafanaにアクセス: http://localhost:3001/d/rag-overview")
    print("  2. 上部の「Selected run (Run ID)」で任意のrun_idを選択")
    print("  3. 「🔗 MLflow Run Link」パネルを確認")
    print("  4. 「MLflow Run ID」をクリックしてMLflow UIに遷移")
    print()


if __name__ == "__main__":
    main()
