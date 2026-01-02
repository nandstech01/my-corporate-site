# Phase 4 Week 2 Task 4: Grafana ↔ MLflow 相互参照 - 要件定義

## 📅 基本情報
- **タスク名**: Task 4 - Grafana ↔ MLflow 相互参照
- **開始予定日**: 2026年1月2日
- **想定工数**: 2日
- **前提条件**: Task 3完了（✅ 完了済み）

---

## 🎯 目的

DjangoデータベースのEvaluationResult、Grafanaダッシュボード、MLflow Runの3つを相互参照可能にし、評価結果の追跡とデバッグを容易にする。

**現状の課題**:
- Grafanaで評価結果を見ても、対応するMLflow Runにジャンプできない
- MLflowでRunを見ても、対応するGrafanaダッシュボードにジャンプできない
- 手動でRun IDをコピー＆ペーストする必要がある

---

## 📋 Task 4の実装内容

### 1. Grafana → MLflow リンク

#### 1-1. Stat パネルに MLflow Run ID 表示

**目的**: 選択したRunのMLflow Run IDを表示し、クリックでMLflow UIに遷移

**実装方法**:
- Grafana RAG Overview Dashboard に新しいText panelを追加
- SQLクエリで現在選択されている run_id の mlflow_run_id を取得
- MLflow Run詳細ページへのリンクを生成

**追加するパネル**:
- **タイトル**: "🔗 MLflow Run Link"
- **位置**: 上部、run_id変数の近く
- **SQL**:
```sql
SELECT
  mlflow_run_id,
  'View in MLflow: ' || mlflow_run_id AS display_text,
  'http://localhost:5000/#/experiments/1/runs/' || mlflow_run_id AS mlflow_url
FROM evaluation_results
WHERE run_id = '$run_id'
LIMIT 1;
```

**リンク設定**:
- Data linkを使用して、mlflow_urlをクリック可能にする
- 新しいタブで開く設定

---

### 2. MLflow → Grafana リンク

#### 2-1. MLflow Tags に Grafana URL追加

**目的**: MLflow Run詳細ページからGrafanaダッシュボードに遷移可能にする

**実装方法**:
- `mlflow_service.py` の `log_evaluation_run()` メソッドを拡張
- `grafana_url` タグを追加
- Django run_id を変数としてGrafana URLに埋め込む

**追加するタグ**:
```python
mlflow.set_tag('grafana_url', f'http://localhost:3001/d/rag-overview?var-run_id={django_run_id}')
```

**URL形式**:
```
http://localhost:3001/d/rag-overview?var-run_id={django_run_id}
```

---

## 🛠️ 実装ファイル

### 新規作成
1. **`backend/update_grafana_dashboard_task4.py`**
   - GrafanaダッシュボードにMLflow Run Linkパネルを追加
   - Text panelとしてMLflow Run IDを表示
   - Data linkでMLflow UIに遷移可能にする

### 更新
2. **`backend/rag_api/services/mlflow_service.py`**
   - `log_evaluation_run()` メソッドに `grafana_url` タグ追加
   - Django run_idを使用してGrafanaダッシュボードURLを生成

3. **`docs/backend-python/phase-4-mlflow-integration/README.md`**
   - Task 4の実装内容を記録
   - 相互参照の使い方を追記

---

## 🔍 詳細設計

### Grafana Text Panel設計

**Panel設定**:
- **Type**: Text
- **Mode**: Markdown
- **Title**: "🔗 MLflow Run Link"
- **Transparent**: false
- **Grid position**: 最上部、run_id変数の右側

**SQLクエリ**:
```sql
SELECT
  mlflow_run_id,
  variant,
  dataset_version,
  created_at
FROM evaluation_results
WHERE run_id = '$run_id'
  AND mlflow_run_id IS NOT NULL
ORDER BY created_at DESC
LIMIT 1;
```

**Markdown Template**:
```markdown
### MLflow Run Details

- **Run ID**: `${mlflow_run_id}`
- **Variant**: `${variant}`
- **Dataset**: `${dataset_version}`
- **Created**: `${created_at}`

[View in MLflow →](http://localhost:5000/#/experiments/1/runs/${mlflow_run_id})
```

---

### MLflow Service 拡張設計

**現在のタグ**:
```python
mlflow.set_tag('phase', '4')
mlflow.set_tag('experiment_type', 'rag_evaluation')
mlflow.set_tag('django_run_id', django_run_id)
mlflow.set_tag('status', 'SUCCESS')
```

**追加するタグ**:
```python
mlflow.set_tag('grafana_url', f'http://localhost:3001/d/rag-overview?var-run_id={django_run_id}')
mlflow.set_tag('django_admin_url', f'http://localhost:8000/admin/rag_api/evaluationresult/?run_id={django_run_id}')
```

**理由**:
- `grafana_url`: Grafanaダッシュボードに直接遷移
- `django_admin_url`: Django管理画面で評価結果の詳細を確認（ボーナス機能）

---

## ✅ 完了判定基準

### 機能的基準
- [ ] Grafanaダッシュボードに "MLflow Run Link" パネルが表示される
- [ ] パネル内のリンクをクリックすると、MLflow Run詳細ページに遷移する
- [ ] MLflow Run詳細ページの Tags に `grafana_url` が表示される
- [ ] `grafana_url` をクリックすると、対応するGrafanaダッシュボードに遷移する
- [ ] Grafanaダッシュボードで正しいrun_idが選択されている

### 技術的基準
- [ ] Text panelのSQLクエリが正しく動作する
- [ ] MLflow tagsが正しくログされる
- [ ] URLパラメータが正しく構築される
- [ ] 新しいタブでリンクが開く

### ドキュメント基準
- [ ] Phase 4 README に相互参照の使い方を追記
- [ ] スクリーンショット付きの使用例を記載
- [ ] トラブルシューティングセクションを更新

---

## 🚨 注意事項

### URL形式の一貫性
- **ローカル開発**: `http://localhost:XXXX`
- **本番環境**: 環境変数で切り替え可能にする

### MLflow Run ID の取得
- `mlflow_run_id` が NULL の場合の処理
- エラーハンドリング（Grafana panelで "No data" を表示）

### Grafana変数の依存関係
- `run_id` 変数が選択されていない場合の挙動
- デフォルト値の設定

---

## 📊 期待される効果

### ユーザー体験の向上
1. **Grafana → MLflow**: 評価結果を見ながら、詳細なパラメータやメトリクスをMLflowで確認できる
2. **MLflow → Grafana**: 実験結果をMLflowで見つけたら、対応するGrafanaダッシュボードで可視化を確認できる

### デバッグ効率の向上
- 問題のあるRunをGrafanaで発見 → MLflowで詳細調査 → 原因特定が迅速化
- Run IDの手動コピー＆ペースト作業が不要

### 監査とレビューの容易化
- 評価結果のトレーサビリティが向上
- レビュワーが簡単に関連情報にアクセスできる

---

## 🔗 関連ドキュメント

- `docs/phase-4-week2-gate2-progress.md` - Gate 2完了レポート
- `docs/phase-4-week2-task3-progress.md` - Task 3完了レポート
- `docs/backend-python/phase-4-mlflow-integration/README.md` - Phase 4全体計画

---

## 📝 実装順序

### Step 1: MLflow → Grafana リンク実装（優先）
1. `mlflow_service.py` を更新して `grafana_url` タグを追加
2. 評価を再実行してタグが正しくログされることを確認
3. MLflow UIでタグが表示され、クリック可能なことを確認

### Step 2: Grafana → MLflow リンク実装
1. `update_grafana_dashboard_task4.py` スクリプトを作成
2. Text panelを追加してMLflow Run IDを表示
3. Data linkを設定してMLflow UIに遷移可能にする
4. Grafanaダッシュボードで動作確認

### Step 3: ドキュメント更新
1. Phase 4 README に相互参照の使い方を追記
2. スクリーンショットを撮影して追加
3. トラブルシューティングセクションを更新

### Step 4: 最終検証
1. Grafana → MLflow → Grafana の往復動作を確認
2. 複数のRunで動作を確認
3. エッジケース（NULL mlflow_run_id）の動作を確認

---

**作成日**: 2026年1月2日  
**作成者**: AI Assistant  
**ステータス**: ⏳ 要件定義完了、実装開始準備完了

