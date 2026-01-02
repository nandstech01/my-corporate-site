# 本番運用検証スクリプト

このディレクトリには、RAG評価システムの正常性を確認するための検証スクリプトが配置されています。

**使用タイミング**: デプロイ後、設定変更後、定期的な健全性チェック

---

## 📋 スクリプト一覧

### 1. verify_mlflow_logging.py ⭐
**Phase**: Phase 4 Week 1  
**目的**: MLflowロギングの完全性を検証

**検証内容**:
- ✅ **ゲートA**: variant差分検証（baseline vs bm25が正しく分離されているか）
- ✅ **ゲートB**: DB完全性検証（mlflow_run_idがNULLでないか）
- ✅ **ゲートC**: MLflow完全性検証（期待通りのパラメータ・メトリクスがログされているか）

**実行方法**:
```bash
# Docker内から実行（推奨）
docker exec rag_backend python /app/verify_mlflow_logging.py

# ローカルから実行
cd /Users/nands/my-corporate-site/backend
python verify_mlflow_logging.py
```

**成功条件**: すべてのゲート（A, B, C）に合格

**関連ドキュメント**: `docs/backend-python/phase-4-mlflow-integration/README.md`

---

### 2. verify_grafana_panels.py ⭐
**Phase**: Phase 3 Week 3 + Phase 4 Week 2  
**目的**: Grafanaダッシュボードの設定を検証

**検証内容**:
- ✅ **検証1**: run_id 変数（Phase 3）
- ✅ **検証1-2**: dataset_version 変数（Phase 4 Task 3）
- ✅ **検証1-3**: MLflow Run Link パネル（Phase 4 Task 4）
- ✅ **検証2**: Panel 8-13 の存在とタイトル
- ✅ **検証3**: Time series パネル (10-13) のSQL

**実行方法**:
```bash
# Docker内から実行（推奨）
docker exec rag_backend python /app/verify_grafana_panels.py

# ローカルから実行
cd /Users/nands/my-corporate-site/backend
python verify_grafana_panels.py
```

**成功条件**: すべての検証に合格

**関連ドキュメント**: 
- `docs/backend-python/phase-3-ml-evaluation-expansion/README.md`
- `docs/backend-python/phase-4-mlflow-integration/README.md`

---

### 3. verify_task4_links.py ⭐
**Phase**: Phase 4 Week 2 Task 4  
**目的**: Grafana ↔ MLflow 相互参照リンクの検証

**検証内容**:
- ✅ **検証1**: grafana_url タグの存在と形式
- ✅ **検証2**: django_admin_url タグの存在と形式
- ✅ **検証3**: django_run_id タグの存在

**実行方法**:
```bash
# Docker内から実行（推奨）
docker exec rag_backend python /app/verify_task4_links.py

# ローカルから実行
cd /Users/nands/my-corporate-site/backend
python verify_task4_links.py
```

**成功条件**: 最新5件のRunのうち、FAILED以外はすべて合格

**関連ドキュメント**: 
- `docs/phase-4-week2-task4-progress.md`
- `docs/phase-4-week2-task4-requirements.md`

---

## 🚀 一括検証スクリプト

すべての検証を一度に実行する場合：

```bash
#!/bin/bash
# 全検証スクリプトを実行

echo "🔍 RAG評価システム検証開始"
echo "=" * 80

echo ""
echo "検証1: MLflowロギング"
docker exec rag_backend python /app/verify_mlflow_logging.py
MLflow_STATUS=$?

echo ""
echo "検証2: Grafanaパネル"
docker exec rag_backend python /app/verify_grafana_panels.py
GRAFANA_STATUS=$?

echo ""
echo "検証3: Grafana↔MLflow相互参照"
docker exec rag_backend python /app/verify_task4_links.py
LINKS_STATUS=$?

echo ""
echo "=" * 80
echo "🎯 検証結果サマリー"
echo "=" * 80
echo "  MLflowロギング: $([ $MLflow_STATUS -eq 0 ] && echo '✅' || echo '❌')"
echo "  Grafanaパネル: $([ $GRAFANA_STATUS -eq 0 ] && echo '✅' || echo '❌')"
echo "  相互参照リンク: $([ $LINKS_STATUS -eq 0 ] && echo '✅' || echo '❌')"

if [ $MLflow_STATUS -eq 0 ] && [ $GRAFANA_STATUS -eq 0 ] && [ $LINKS_STATUS -eq 0 ]; then
    echo ""
    echo "✅ すべての検証に合格しました！"
    exit 0
else
    echo ""
    echo "❌ 一部の検証に失敗しました。上記のエラーを確認してください。"
    exit 1
fi
```

**保存先**: `backend/verify_all.sh`

---

## 📊 検証タイミング推奨

### 必須（デプロイ前）
- [ ] Phase 4完了後の初回デプロイ前
- [ ] Grafanaダッシュボード更新後
- [ ] MLflow設定変更後

### 推奨（定期実行）
- [ ] 週次: システム健全性チェック
- [ ] 評価実行後: 新しいRunが正しくログされているか確認
- [ ] トラブル発生時: 問題の切り分け

---

## 🔧 トラブルシューティング

### MLflow検証失敗時
1. MLflowサーバーが起動しているか確認: `docker ps | grep mlflow`
2. 環境変数が正しいか確認: `MLFLOW_TRACKING_URI`
3. 最新の評価が実行されているか確認: `python manage.py evaluate_final --variant baseline --dataset-version v2.0`

### Grafana検証失敗時
1. Grafanaサーバーが起動しているか確認: `docker ps | grep grafana`
2. ダッシュボードが存在するか確認: http://localhost:3001/d/rag-overview
3. データソース設定が正しいか確認: Grafana > Configuration > Data Sources

### 相互参照リンク検証失敗時
1. 最新のRunでMLflowタグがログされているか確認
2. `mlflow_service.py` でタグが追加されているか確認
3. 評価を再実行してタグを再生成: `python manage.py evaluate_final --variant baseline --dataset-version v2.0`

---

## 📚 関連ドキュメント

- **Phase 4完了報告**: `docs/backend-python/phase-4-mlflow-integration/README.md`
- **Gate 2完了報告**: `docs/backend-python/phase-4-mlflow-integration/phase-4-week2-gate2-progress.md`
- **Task 3完了報告**: `docs/backend-python/phase-4-mlflow-integration/phase-4-week2-task3-progress.md`
- **Task 4完了報告**: `docs/backend-python/phase-4-mlflow-integration/phase-4-week2-task4-progress.md`
- **タスク管理サマリー**: `docs/backend-python/TASK_MANAGEMENT_SUMMARY.md`

---

**作成日**: 2026年1月2日  
**最終更新**: 2026年1月2日  
**ステータス**: ✅ 本番運用中

