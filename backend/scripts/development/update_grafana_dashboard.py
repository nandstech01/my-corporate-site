#!/usr/bin/env python
"""
Grafanaダッシュボード更新スクリプト

Phase 2: 評価指標パネル追加
- Precision@5 時系列
- MRR 時系列  
- 最新評価結果サマリー
"""

import json
from pathlib import Path

DASHBOARD_PATH = Path("/Users/nands/my-corporate-site/infra/grafana/provisioning/dashboards/rag-overview.json")
DATASOURCE_UID = "P01B10AD872D9061B"

# 新しいパネル定義
NEW_PANELS = [
    # Panel 5: Precision@5 推移
    {
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
                    "axisLabel": "Precision@5",
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
                        {"color": "yellow", "value": 0.5},
                        {"color": "red", "value": 0.3}
                    ]
                },
                "unit": "short",
                "min": 0,
                "max": 1
            },
            "overrides": []
        },
        "gridPos": {"h": 8, "w": 12, "x": 0, "y": 16},
        "id": 5,
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
                        created_at as time,
                        variant as metric,
                        AVG(precision_at_5) as value
                    FROM evaluation_results
                    WHERE $__timeFilter(created_at)
                    GROUP BY created_at, variant
                    ORDER BY created_at
                """,
                "refId": "A",
                "select": [[{"params": ["precision_at_5"], "type": "column"}]],
                "table": "evaluation_results",
                "timeColumn": "created_at",
                "timeColumnType": "timestamp",
                "where": [{"name": "$__timeFilter", "params": [], "type": "macro"}]
            }
        ],
        "title": "Precision@5 推移（Baseline vs BM25）",
        "type": "timeseries"
    },
    
    # Panel 6: MRR 推移
    {
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
                        {"color": "yellow", "value": 0.5},
                        {"color": "red", "value": 0.3}
                    ]
                },
                "unit": "short",
                "min": 0,
                "max": 1
            },
            "overrides": []
        },
        "gridPos": {"h": 8, "w": 12, "x": 12, "y": 16},
        "id": 6,
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
                        created_at as time,
                        variant as metric,
                        AVG(mrr) as value
                    FROM evaluation_results
                    WHERE $__timeFilter(created_at)
                    GROUP BY created_at, variant
                    ORDER BY created_at
                """,
                "refId": "A",
                "select": [[{"params": ["mrr"], "type": "column"}]],
                "table": "evaluation_results",
                "timeColumn": "created_at",
                "timeColumnType": "timestamp",
                "where": [{"name": "$__timeFilter", "params": [], "type": "macro"}]
            }
        ],
        "title": "MRR 推移（Baseline vs BM25）",
        "type": "timeseries"
    },
    
    # Panel 7: 最新評価結果
    {
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
                        {"color": "red", "value": None},
                        {"color": "yellow", "value": 0.3},
                        {"color": "green", "value": 0.5}
                    ]
                },
                "unit": "short"
            },
            "overrides": []
        },
        "gridPos": {"h": 8, "w": 24, "x": 0, "y": 24},
        "id": 7,
        "options": {
            "showHeader": True
        },
        "pluginVersion": "10.4.2",
        "targets": [
            {
                "datasource": {"type": "postgres", "uid": DATASOURCE_UID},
                "format": "table",
                "group": [],
                "metricColumn": "none",
                "rawQuery": True,
                "rawSql": """
                    WITH latest_evaluation AS (
                        SELECT DISTINCT ON (variant)
                            variant,
                            AVG(precision_at_5) as avg_precision_at_5,
                            AVG(mrr) as avg_mrr,
                            COUNT(*) as query_count,
                            MAX(created_at) as last_updated
                        FROM evaluation_results
                        WHERE created_at >= NOW() - INTERVAL '7 days'
                        GROUP BY variant, created_at
                        ORDER BY variant, created_at DESC
                    )
                    SELECT 
                        variant as "バリアント",
                        ROUND(avg_precision_at_5::numeric, 4) as "Precision@5",
                        ROUND(avg_mrr::numeric, 4) as "MRR",
                        query_count as "評価クエリ数",
                        last_updated as "最終更新"
                    FROM latest_evaluation
                    ORDER BY variant
                """,
                "refId": "A",
                "select": [[{"params": ["precision_at_5"], "type": "column"}]],
                "table": "evaluation_results",
                "timeColumn": "created_at",
                "timeColumnType": "timestamp",
                "where": []
            }
        ],
        "title": "最新評価結果（7日間）",
        "type": "table"
    }
]


def main():
    print("=" * 80)
    print("📊 Grafanaダッシュボード更新")
    print("=" * 80)
    print()
    
    # 既存のダッシュボードを読み込み
    print("📖 既存のダッシュボードを読み込み中...")
    with open(DASHBOARD_PATH, 'r') as f:
        dashboard = json.load(f)
    
    existing_panel_count = len(dashboard.get('panels', []))
    print(f"   既存パネル数: {existing_panel_count}")
    print()
    
    # 新しいパネルを追加
    print("➕ 新しいパネルを追加中...")
    for panel in NEW_PANELS:
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
    print("  1. Grafanaを再起動: docker-compose restart grafana")
    print("  2. または、ダッシュボードを手動でインポート")
    print()


if __name__ == '__main__':
    main()

