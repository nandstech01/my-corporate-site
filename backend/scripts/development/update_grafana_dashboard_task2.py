#!/usr/bin/env python
"""
Grafanaダッシュボード更新スクリプト

Phase 3 Week 3 Task2: Technical vs General カテゴリ分離表示
- ダッシュボード変数（run_id）追加
- Technical カテゴリ評価指標（Stat）
- General カテゴリ評価指標（Stat）
- Technical カテゴリ MRR 推移（Time series）
- General カテゴリ MRR 推移（Time series）
- Technical カテゴリ NDCG@20 推移（Time series）
- General カテゴリ NDCG@20 推移（Time series）
"""

import json
from pathlib import Path
import sys

DASHBOARD_PATH = Path("/Users/nands/my-corporate-site/infra/grafana/provisioning/dashboards/rag-overview.json")
DATASOURCE_UID = "P01B10AD872D9061B"

# reviewed run_id（デフォルト値）
REVIEWED_RUN_ID = "29f25cb4-4880-463d-9a3a-2b3ce6b3ba1c"

# ダッシュボード変数定義
DASHBOARD_VARIABLE = {
    "current": {
        "selected": False,
        "text": REVIEWED_RUN_ID,
        "value": REVIEWED_RUN_ID
    },
    "datasource": {
        "type": "postgres",
        "uid": DATASOURCE_UID
    },
    "definition": "SELECT er.run_id::text AS __value, er.run_id::text AS __text FROM evaluation_results er GROUP BY er.run_id ORDER BY MAX(er.created_at) DESC LIMIT 50",
    "hide": 0,
    "includeAll": False,
    "label": "Selected run (Run ID)",
    "multi": False,
    "name": "run_id",
    "options": [],
    "query": "SELECT er.run_id::text AS __value, er.run_id::text AS __text FROM evaluation_results er GROUP BY er.run_id ORDER BY MAX(er.created_at) DESC LIMIT 50",
    "refresh": 1,
    "regex": "",
    "skipUrlSync": False,
    "sort": 0,
    "type": "query"
}

# 新しいパネル定義（IDは既存のパネル数に応じて動的に設定）
def create_new_panels(start_id=8, start_y=32):
    """
    新しいパネルを生成する
    
    Args:
        start_id: 開始パネルID
        start_y: 開始Y座標（既存パネルの下に配置）
    """
    panels = []
    current_id = start_id
    current_y = start_y
    
    # Panel 1: Technical カテゴリ評価指標（Stat）
    panels.append({
        "datasource": {
            "type": "postgres",
            "uid": DATASOURCE_UID
        },
        "fieldConfig": {
            "defaults": {
                "color": {"mode": "thresholds"},
                "mappings": [],
                "thresholds": {
                    "mode": "absolute",
                    "steps": [
                        {"color": "green", "value": None},
                        {"color": "yellow", "value": 0.3},
                        {"color": "orange", "value": 0.4},
                        {"color": "red", "value": 0.5}
                    ]
                },
                "unit": "short",
                "decimals": 4
            },
            "overrides": []
        },
        "gridPos": {"h": 8, "w": 12, "x": 0, "y": current_y},
        "id": current_id,
        "options": {
            "orientation": "auto",
            "reduceOptions": {
                "values": False,
                "calcs": ["lastNotNull"],
                "fields": ""
            },
            "showThresholdLabels": False,
            "showThresholdMarkers": True
        },
        "pluginVersion": "10.4.2",
        "targets": [
            {
                "datasource": {"type": "postgres", "uid": DATASOURCE_UID},
                "format": "table",
                "group": [],
                "metricColumn": "none",
                "rawQuery": True,
                "rawSql": f"""
                    SELECT
                      er.variant AS metric,
                      ROUND(AVG(er.mrr)::numeric, 4) AS "MRR",
                      ROUND(AVG(er.ndcg)::numeric, 4) AS "NDCG@20",
                      ROUND(AVG(er.recall_at_20)::numeric, 4) AS "Recall@20"
                    FROM
                      evaluation_results er
                      INNER JOIN evaluation_queries eq ON er.query_id = eq.id
                    WHERE
                      eq.category = 'technical'
                      AND er.run_id = '$run_id'::uuid
                      AND er.variant IN ('baseline', 'bm25')
                    GROUP BY
                      er.variant
                    ORDER BY
                      er.variant;
                """,
                "refId": "A",
                "select": [[{"params": ["mrr"], "type": "column"}]],
                "table": "evaluation_results",
                "timeColumn": "created_at",
                "timeColumnType": "timestamp",
                "where": []
            }
        ],
        "title": "📊 Technical カテゴリ評価指標（Selected run）",
        "type": "stat"
    })
    current_id += 1
    
    # Panel 2: General カテゴリ評価指標（Stat）
    panels.append({
        "datasource": {
            "type": "postgres",
            "uid": DATASOURCE_UID
        },
        "fieldConfig": {
            "defaults": {
                "color": {"mode": "thresholds"},
                "mappings": [],
                "thresholds": {
                    "mode": "absolute",
                    "steps": [
                        {"color": "green", "value": None},
                        {"color": "yellow", "value": 0.3},
                        {"color": "orange", "value": 0.4},
                        {"color": "red", "value": 0.5}
                    ]
                },
                "unit": "short",
                "decimals": 4
            },
            "overrides": []
        },
        "gridPos": {"h": 8, "w": 12, "x": 12, "y": current_y},
        "id": current_id,
        "options": {
            "orientation": "auto",
            "reduceOptions": {
                "values": False,
                "calcs": ["lastNotNull"],
                "fields": ""
            },
            "showThresholdLabels": False,
            "showThresholdMarkers": True
        },
        "pluginVersion": "10.4.2",
        "targets": [
            {
                "datasource": {"type": "postgres", "uid": DATASOURCE_UID},
                "format": "table",
                "group": [],
                "metricColumn": "none",
                "rawQuery": True,
                "rawSql": f"""
                    SELECT
                      er.variant AS metric,
                      ROUND(AVG(er.mrr)::numeric, 4) AS "MRR",
                      ROUND(AVG(er.ndcg)::numeric, 4) AS "NDCG@20",
                      ROUND(AVG(er.recall_at_20)::numeric, 4) AS "Recall@20"
                    FROM
                      evaluation_results er
                      INNER JOIN evaluation_queries eq ON er.query_id = eq.id
                    WHERE
                      eq.category = 'general'
                      AND er.run_id = '$run_id'::uuid
                      AND er.variant IN ('baseline', 'bm25')
                    GROUP BY
                      er.variant
                    ORDER BY
                      er.variant;
                """,
                "refId": "A",
                "select": [[{"params": ["mrr"], "type": "column"}]],
                "table": "evaluation_results",
                "timeColumn": "created_at",
                "timeColumnType": "timestamp",
                "where": []
            }
        ],
        "title": "📊 General カテゴリ評価指標（Selected run）",
        "type": "stat"
    })
    current_id += 1
    current_y += 8
    
    # Panel 3: Technical カテゴリ MRR 推移（Time series）
    panels.append({
        "datasource": {
            "type": "postgres",
            "uid": DATASOURCE_UID
        },
        "fieldConfig": {
            "defaults": {
                "color": {"mode": "palette-classic"},
                "custom": {
                    "axisCenteredZero": False,
                    "axisColorMode": "text",
                    "axisLabel": "MRR",
                    "axisPlacement": "auto",
                    "drawStyle": "line",
                    "fillOpacity": 10,
                    "lineWidth": 2,
                    "pointSize": 5,
                    "showPoints": "auto",
                    "spanNulls": False
                },
                "mappings": [],
                "thresholds": {
                    "mode": "absolute",
                    "steps": [
                        {"color": "green", "value": None},
                        {"color": "yellow", "value": 0.3},
                        {"color": "red", "value": 0.5}
                    ]
                },
                "unit": "short",
                "min": 0,
                "max": 1,
                "decimals": 4
            },
            "overrides": []
        },
        "gridPos": {"h": 8, "w": 12, "x": 0, "y": current_y},
        "id": current_id,
        "options": {
            "legend": {"calcs": ["mean", "last"], "displayMode": "table", "placement": "bottom"},
            "tooltip": {"mode": "single", "sort": "none"}
        },
        "targets": [
            {
                "datasource": {"type": "postgres", "uid": DATASOURCE_UID},
                "format": "time_series",
                "group": [],
                "metricColumn": "none",
                "rawQuery": True,
                "rawSql": """
                    SELECT
                      MAX(er.created_at) AS time,
                      er.variant,
                      AVG(er.mrr) AS value
                    FROM
                      evaluation_results er
                      INNER JOIN evaluation_queries eq ON er.query_id = eq.id
                    WHERE
                      eq.category = 'technical'
                      AND er.variant IN ('baseline', 'bm25')
                      AND $__timeFilter(er.created_at)
                    GROUP BY
                      er.run_id, er.variant
                    ORDER BY
                      time ASC;
                """,
                "refId": "A",
                "select": [[{"params": ["mrr"], "type": "column"}]],
                "table": "evaluation_results",
                "timeColumn": "created_at",
                "timeColumnType": "timestamp",
                "where": [{"name": "$__timeFilter", "params": [], "type": "macro"}]
            }
        ],
        "title": "📈 Technical カテゴリ MRR 推移（All runs）",
        "type": "timeseries"
    })
    current_id += 1
    
    # Panel 4: General カテゴリ MRR 推移（Time series）
    panels.append({
        "datasource": {
            "type": "postgres",
            "uid": DATASOURCE_UID
        },
        "fieldConfig": {
            "defaults": {
                "color": {"mode": "palette-classic"},
                "custom": {
                    "axisCenteredZero": False,
                    "axisColorMode": "text",
                    "axisLabel": "MRR",
                    "axisPlacement": "auto",
                    "drawStyle": "line",
                    "fillOpacity": 10,
                    "lineWidth": 2,
                    "pointSize": 5,
                    "showPoints": "auto",
                    "spanNulls": False
                },
                "mappings": [],
                "thresholds": {
                    "mode": "absolute",
                    "steps": [
                        {"color": "green", "value": None},
                        {"color": "yellow", "value": 0.3},
                        {"color": "red", "value": 0.5}
                    ]
                },
                "unit": "short",
                "min": 0,
                "max": 1,
                "decimals": 4
            },
            "overrides": []
        },
        "gridPos": {"h": 8, "w": 12, "x": 12, "y": current_y},
        "id": current_id,
        "options": {
            "legend": {"calcs": ["mean", "last"], "displayMode": "table", "placement": "bottom"},
            "tooltip": {"mode": "single", "sort": "none"}
        },
        "targets": [
            {
                "datasource": {"type": "postgres", "uid": DATASOURCE_UID},
                "format": "time_series",
                "group": [],
                "metricColumn": "none",
                "rawQuery": True,
                "rawSql": """
                    SELECT
                      MAX(er.created_at) AS time,
                      er.variant,
                      AVG(er.mrr) AS value
                    FROM
                      evaluation_results er
                      INNER JOIN evaluation_queries eq ON er.query_id = eq.id
                    WHERE
                      eq.category = 'general'
                      AND er.variant IN ('baseline', 'bm25')
                      AND $__timeFilter(er.created_at)
                    GROUP BY
                      er.run_id, er.variant
                    ORDER BY
                      time ASC;
                """,
                "refId": "A",
                "select": [[{"params": ["mrr"], "type": "column"}]],
                "table": "evaluation_results",
                "timeColumn": "created_at",
                "timeColumnType": "timestamp",
                "where": [{"name": "$__timeFilter", "params": [], "type": "macro"}]
            }
        ],
        "title": "📈 General カテゴリ MRR 推移（All runs）",
        "type": "timeseries"
    })
    current_id += 1
    current_y += 8
    
    # Panel 5: Technical カテゴリ NDCG@20 推移（Time series）
    panels.append({
        "datasource": {
            "type": "postgres",
            "uid": DATASOURCE_UID
        },
        "fieldConfig": {
            "defaults": {
                "color": {"mode": "palette-classic"},
                "custom": {
                    "axisCenteredZero": False,
                    "axisColorMode": "text",
                    "axisLabel": "NDCG@20",
                    "axisPlacement": "auto",
                    "drawStyle": "line",
                    "fillOpacity": 10,
                    "lineWidth": 2,
                    "pointSize": 5,
                    "showPoints": "auto",
                    "spanNulls": False
                },
                "mappings": [],
                "thresholds": {
                    "mode": "absolute",
                    "steps": [
                        {"color": "green", "value": None},
                        {"color": "yellow", "value": 0.3},
                        {"color": "red", "value": 0.5}
                    ]
                },
                "unit": "short",
                "min": 0,
                "max": 1,
                "decimals": 4
            },
            "overrides": []
        },
        "gridPos": {"h": 8, "w": 12, "x": 0, "y": current_y},
        "id": current_id,
        "options": {
            "legend": {"calcs": ["mean", "last"], "displayMode": "table", "placement": "bottom"},
            "tooltip": {"mode": "single", "sort": "none"}
        },
        "targets": [
            {
                "datasource": {"type": "postgres", "uid": DATASOURCE_UID},
                "format": "time_series",
                "group": [],
                "metricColumn": "none",
                "rawQuery": True,
                "rawSql": """
                    SELECT
                      MAX(er.created_at) AS time,
                      er.variant,
                      AVG(er.ndcg) AS value
                    FROM
                      evaluation_results er
                      INNER JOIN evaluation_queries eq ON er.query_id = eq.id
                    WHERE
                      eq.category = 'technical'
                      AND er.variant IN ('baseline', 'bm25')
                      AND $__timeFilter(er.created_at)
                    GROUP BY
                      er.run_id, er.variant
                    ORDER BY
                      time ASC;
                """,
                "refId": "A",
                "select": [[{"params": ["ndcg"], "type": "column"}]],
                "table": "evaluation_results",
                "timeColumn": "created_at",
                "timeColumnType": "timestamp",
                "where": [{"name": "$__timeFilter", "params": [], "type": "macro"}]
            }
        ],
        "title": "📈 Technical カテゴリ NDCG@20 推移（All runs）",
        "type": "timeseries"
    })
    current_id += 1
    
    # Panel 6: General カテゴリ NDCG@20 推移（Time series）
    panels.append({
        "datasource": {
            "type": "postgres",
            "uid": DATASOURCE_UID
        },
        "fieldConfig": {
            "defaults": {
                "color": {"mode": "palette-classic"},
                "custom": {
                    "axisCenteredZero": False,
                    "axisColorMode": "text",
                    "axisLabel": "NDCG@20",
                    "axisPlacement": "auto",
                    "drawStyle": "line",
                    "fillOpacity": 10,
                    "lineWidth": 2,
                    "pointSize": 5,
                    "showPoints": "auto",
                    "spanNulls": False
                },
                "mappings": [],
                "thresholds": {
                    "mode": "absolute",
                    "steps": [
                        {"color": "green", "value": None},
                        {"color": "yellow", "value": 0.3},
                        {"color": "red", "value": 0.5}
                    ]
                },
                "unit": "short",
                "min": 0,
                "max": 1,
                "decimals": 4
            },
            "overrides": []
        },
        "gridPos": {"h": 8, "w": 12, "x": 12, "y": current_y},
        "id": current_id,
        "options": {
            "legend": {"calcs": ["mean", "last"], "displayMode": "table", "placement": "bottom"},
            "tooltip": {"mode": "single", "sort": "none"}
        },
        "targets": [
            {
                "datasource": {"type": "postgres", "uid": DATASOURCE_UID},
                "format": "time_series",
                "group": [],
                "metricColumn": "none",
                "rawQuery": True,
                "rawSql": """
                    SELECT
                      MAX(er.created_at) AS time,
                      er.variant,
                      AVG(er.ndcg) AS value
                    FROM
                      evaluation_results er
                      INNER JOIN evaluation_queries eq ON er.query_id = eq.id
                    WHERE
                      eq.category = 'general'
                      AND er.variant IN ('baseline', 'bm25')
                      AND $__timeFilter(er.created_at)
                    GROUP BY
                      er.run_id, er.variant
                    ORDER BY
                      time ASC;
                """,
                "refId": "A",
                "select": [[{"params": ["ndcg"], "type": "column"}]],
                "table": "evaluation_results",
                "timeColumn": "created_at",
                "timeColumnType": "timestamp",
                "where": [{"name": "$__timeFilter", "params": [], "type": "macro"}]
            }
        ],
        "title": "📈 General カテゴリ NDCG@20 推移（All runs）",
        "type": "timeseries"
    })
    
    return panels


def main():
    print("=" * 80)
    print("📊 Grafanaダッシュボード更新（Phase 3 Week 3 Task2）")
    print("=" * 80)
    print()
    
    # 既存のダッシュボードを読み込み
    print("📖 既存のダッシュボードを読み込み中...")
    if not DASHBOARD_PATH.exists():
        print(f"❌ エラー: ダッシュボードファイルが見つかりません: {DASHBOARD_PATH}")
        sys.exit(1)
    
    with open(DASHBOARD_PATH, 'r') as f:
        dashboard = json.load(f)
    
    existing_panel_count = len(dashboard.get('panels', []))
    print(f"   既存パネル数: {existing_panel_count}")
    print()
    
    # ダッシュボード変数を追加（存在しない場合のみ）
    print("➕ ダッシュボード変数を追加中...")
    if 'templating' not in dashboard:
        dashboard['templating'] = {'list': []}
    
    # run_id 変数を更新または追加
    existing_vars = dashboard['templating']['list']
    run_id_index = next((i for i, var in enumerate(existing_vars) if var['name'] == 'run_id'), None)
    
    if run_id_index is not None:
        # 既存の変数を更新
        existing_vars[run_id_index] = DASHBOARD_VARIABLE
        print("   ✅ run_id 変数を更新")
    else:
        # 新規追加
        dashboard['templating']['list'].append(DASHBOARD_VARIABLE)
        print("   ✅ run_id 変数を追加")
    print()
    
    # 最大パネルIDを取得
    max_id = max([panel.get('id', 0) for panel in dashboard['panels']], default=0)
    max_y = max([panel.get('gridPos', {}).get('y', 0) + panel.get('gridPos', {}).get('h', 0) 
                 for panel in dashboard['panels']], default=0)
    
    print(f"   最大パネルID: {max_id}")
    print(f"   最大Y座標: {max_y}")
    print()
    
    # 新しいパネルを生成
    new_panels = create_new_panels(start_id=max_id + 1, start_y=max_y)
    
    # 新しいパネルを追加
    print("➕ 新しいパネルを追加中...")
    for panel in new_panels:
        dashboard['panels'].append(panel)
        print(f"   Panel {panel['id']}: {panel['title']}")
    
    new_panel_count = len(dashboard['panels'])
    print()
    print(f"✅ 合計パネル数: {existing_panel_count} → {new_panel_count}")
    print()
    
    # 保存
    print("💾 ダッシュボードを保存中...")
    with open(DASHBOARD_PATH, 'w') as f:
        json.dump(dashboard, f, indent=2, ensure_ascii=False)
    
    print("✅ 保存完了!")
    print()
    print("=" * 80)
    print("🎉 ダッシュボード更新完了")
    print("=" * 80)
    print()
    print("次のステップ:")
    print("  1. Grafanaを再起動: cd /Users/nands/my-corporate-site/infra && docker-compose restart grafana")
    print("  2. ブラウザでダッシュボードを確認: http://localhost:3001/d/rag-overview/rag-overview-dashboard")
    print("  3. 右上の変数ドロップダウンから 'run_id' を選択可能")
    print()


if __name__ == '__main__':
    main()

