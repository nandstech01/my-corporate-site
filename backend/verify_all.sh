#!/bin/bash
# RAG評価システム 一括検証スクリプト
#
# すべての検証スクリプトを実行し、システムの正常性を確認します。
#
# 使用方法:
#   bash verify_all.sh
#
# 終了コード:
#   0: すべての検証に合格
#   1: 一部の検証に失敗

echo "🔍 RAG評価システム検証開始"
echo "================================================================================"
echo ""

# 検証1: MLflowロギング
echo "検証1/3: MLflowロギング"
echo "--------------------------------------------------------------------------------"
docker exec rag_backend python /app/verify_mlflow_logging.py
MLFLOW_STATUS=$?
echo ""

# 検証2: Grafanaパネル
echo "検証2/3: Grafanaパネル"
echo "--------------------------------------------------------------------------------"
docker exec rag_backend python /app/verify_grafana_panels.py
GRAFANA_STATUS=$?
echo ""

# 検証3: Grafana↔MLflow相互参照
echo "検証3/3: Grafana↔MLflow相互参照"
echo "--------------------------------------------------------------------------------"
docker exec rag_backend python /app/verify_task4_links.py
LINKS_STATUS=$?
echo ""

# サマリー
echo "================================================================================"
echo "🎯 検証結果サマリー"
echo "================================================================================"
echo ""
echo "  MLflowロギング検証:    $([ $MLFLOW_STATUS -eq 0 ] && echo '✅ 合格' || echo '❌ 不合格')"
echo "  Grafanaパネル検証:     $([ $GRAFANA_STATUS -eq 0 ] && echo '✅ 合格' || echo '❌ 不合格')"
echo "  相互参照リンク検証:    $([ $LINKS_STATUS -eq 0 ] && echo '✅ 合格' || echo '❌ 不合格')"
echo ""

if [ $MLFLOW_STATUS -eq 0 ] && [ $GRAFANA_STATUS -eq 0 ] && [ $LINKS_STATUS -eq 0 ]; then
    echo "✅ すべての検証に合格しました！"
    echo ""
    echo "システムは正常に動作しています。"
    echo ""
    exit 0
else
    echo "❌ 一部の検証に失敗しました。"
    echo ""
    echo "上記のエラーメッセージを確認して、問題を解決してください。"
    echo "詳細は VERIFICATION_SCRIPTS_README.md の「トラブルシューティング」を参照してください。"
    echo ""
    exit 1
fi

