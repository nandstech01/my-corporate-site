# Phase 4 Week 2 ゲート2: 重大不整合の修正計画

## 🔴 ユーザー指摘の3つの重大不整合

### 不整合1: 「実Fragment IDベース」の欠如
**問題**: v2.0-draft クエリ一覧が想像で作られた一般論（Phase 3の方針に逆戻り）  
**原因**: fragment_vectorsから実際のFragment IDを調査せず、想像で書いた  
**修正**: `investigate_fragment_ids.py` で実Fragment IDを取得済み → `create_v2_draft_dataset.py` を実IDで再実装

### 不整合2: dataset_version絞り込みの欠如
**問題**: `EvaluationService.run_evaluation()` が `EvaluationQuery.objects.all()` で全件取得  
**原因**: dataset_versionで絞り込んでいない（v1.0とv2.0が混ざる危険性）  
**修正**: `EvaluationQuery.objects.filter(dataset_version=dataset_version)` に修正

### 不整合3: verify_mlflow_logging.py のv2.0-draft対応不足
**問題**: Week1ゲート中心で、v2.0-draftで2runが揃ったことを機械的に検証できない  
**原因**: dataset_version検証ロジックが未実装  
**修正**: ゲート2用の検証ロジックを追加
  - MLflow param `dataset_version == v2.0-draft` が2runとも存在
  - 同じdataset_versionで `variant` が baseline/bm25 の2本ある
  - DB側でも `mlflow_run_id` がその評価結果に埋まっている

---

## 📋 修正実装計画（5ステップ）

### ✅ Step 1: fragment_vectors調査（完了）
**ファイル**: `backend/investigate_fragment_ids.py`  
**結果**: Technical/General の実Fragment ID取得済み

### 🔧 Step 2: EvaluationService dataset_version絞り込み修正
**ファイル**: `backend/rag_api/services/evaluation_service.py`  
**修正内容**:
```python
# Before (line 231)
queries = EvaluationQuery.objects.all()

# After
queries = EvaluationQuery.objects.filter(dataset_version=dataset_version)
```

### 🔧 Step 3: MLflowService dataset_versionログ確認
**ファイル**: `backend/rag_api/services/mlflow_service.py`  
**確認結果**: ✅ 既に `mlflow.log_param('dataset_version', dataset_version)` が実装済み（line 75）  
**アクション**: 修正不要

### 🔧 Step 4: verify_mlflow_logging.py v2.0-draft検証追加
**ファイル**: `backend/verify_mlflow_logging.py`  
**追加内容**:
- Gate 2用の検証関数 `verify_gate2_dataset_version()`
- MLflow params で `dataset_version` が同一の2runが存在
- 2runで `variant` が baseline / bm25 に分かれている
- DB側で該当runの `mlflow_run_id` が全行埋まっている

### 🔧 Step 5: create_v2_draft_dataset.py 実IDで再実装
**ファイル**: `backend/rag_api/management/commands/create_v2_draft_dataset.py`  
**修正内容**:
- 想像で作ったクエリ例を削除
- 実Fragment IDを使用した10件のクエリに置き換え
- Technical 6件 / General 4件（60:40維持）
- Strict idempotent（再実行時に同じ10件を作る保証）

---

## 🎯 ゲート2の合否基準（修正版）

### 目的: **「健全性チェック（壊れてない）」に限定**
- ❌ 「BM25改善維持」（10件では統計的にブレが大きい）
- ✅ 「dataset_version分離」「MLflowログ」「DB整合」「2run比較できる」

### 合否KPI
| 項目 | 確認内容 | 合格基準 |
|------|---------|---------|
| **MLflow自動ログ** | `dataset_version=v2.0-draft` のrunが2本ある | ✅ |
| **variant分離** | 2runで `variant` が baseline / bm25 | ✅ |
| **DB整合性** | v2.0-draft の evaluation_results に `mlflow_run_id` が全行埋まっている（NULL 0） | ✅ |
| **符号確認（任意）** | technicalで baseline < bm25 の符号が崩れていない | （任意） |

---

## 🚀 次のアクション

1. **Step 2〜5を実装**
2. **ゲート2実行**:
   ```bash
   python manage.py create_v2_draft_dataset
   python manage.py evaluate_final --variant baseline --dataset-version v2.0-draft
   python manage.py evaluate_final --variant bm25 --dataset-version v2.0-draft
   python backend/verify_mlflow_logging.py --gate 2
   ```
3. **合格後、ゲート3へ進む**（v2.0に昇格、50件に拡張）

---

## 📝 フォーシング・クエスチョンへの回答

### Q1: あなたのv2.0-draft 10件は本当に"実Fragment ID起点"ですか？
**A1**: ❌ 現状は想像で作っていました。  
**修正**: `investigate_fragment_ids.py` で実IDを取得済み → Step 5で再実装します。

### Q2: evaluate_final が dataset_version で "クエリ抽出" と "結果保存" の両方を分離できていますか？
**A2**: ❌ クエリ抽出が `.all()` で全件取得していました。  
**修正**: Step 2で `.filter(dataset_version=dataset_version)` に修正します。

### Q3: verify_mlflow_logging.py は「v2.0-draft の2runが揃った」を機械的に落とせますか？
**A3**: ❌ まだ未実装でした。  
**修正**: Step 4で `--gate 2` オプションを追加し、機械検証を実装します。

---

**次に進めます: Step 2〜5の実装**

