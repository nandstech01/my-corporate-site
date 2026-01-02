# アーカイブドキュメント

**最終更新**: 2025-12-29

---

## 📦 このディレクトリについて

このディレクトリには、**Phase 2-4の旧定義ドキュメント**が保存されています。

### アーカイブ理由

**Phase 1完了後の実験0（Embedding統一検証）**により、Phase 2以降のスコープを再定義しました。

- **旧定義**: Phase 2で検索ログ分析 → Phase 3でML評価
- **新定義**: Phase 2でML評価基盤 → Phase 3でML評価拡張＋検索ログ分析

### アーカイブ日時

- **2025-12-29**: Phase 2-3の旧定義をアーカイブ

---

## 📁 アーカイブされたドキュメント

### 1. phase-2-search-logging/

**旧定義**: RAG検索ログ分析・強化

**主な内容**:
- 検索ログの詳細分析
- クエリ分類・パターン分析
- RAG別の検索精度比較
- Grafana高度ダッシュボード

**新定義での扱い**:
→ **Phase 3（ML評価システム拡張）に統合**

---

### 2. phase-3-ml-evaluation/

**旧定義**: ML評価システム

**主な内容**:
- RAG検索精度の自動評価
- 評価データセット構築（100+件）
- ML評価指標の実装（Recall@k、MRR、NDCG）
- A/Bテスト基盤

**新定義での扱い**:
→ **Phase 2（ML評価基盤）とPhase 3（ML評価拡張）に分割**

---

## 🔄 新旧対応表

| 旧定義 | 新定義 | 変更内容 |
|-------|-------|---------|
| Phase 1 | Phase 1 | 変更なし（Django RAG基盤） |
| Phase 2: 検索ログ分析 | Phase 3 の一部 | Phase 3に統合 |
| Phase 3: ML評価 | Phase 2 + Phase 3 | 2つのPhaseに分割 |
| Phase 4: MLflow統合 | Phase 4 | 変更なし（前提条件のみ更新） |

---

## 🎯 新定義の詳細

### Phase 2: ML評価基盤（最小実装）

**期間**: 1週間  
**目標**: Precision@5, MRR で評価基盤を確立

**成果物**:
- 評価データセット（10クエリ×3正解）
- Precision@5, MRR 実装
- BM25 再ランキング
- Grafana 評価指標パネル

**ドキュメント**: `docs/phase-2-ml-evaluation-foundation/README.md`

---

### Phase 3: ML評価システム拡張

**期間**: 2週間  
**目標**: 評価システムの拡張と高度化

**成果物**:
- 評価データセット拡張（100+件）
- NDCG 実装
- A/Bテスト実装
- **検索ログ分析・クエリ分類**（旧Phase 2から移動）

**ドキュメント**: `docs/phase-3-ml-evaluation-expansion/README.md`

---

### Phase 4: MLflow統合

**期間**: 1週間  
**目標**: 実験管理の自動化

**成果物**:
- MLflow Tracking Server
- 実験トラッキング
- パラメータ最適化

**ドキュメント**: `docs/phase-4-mlflow-integration/README.md`

---

## ✅ 最初の方針との整合性

### すべての内容が実装される

- ✅ 旧Phase 2（検索ログ分析）→ 新Phase 3で実装
- ✅ 旧Phase 3（ML評価）→ 新Phase 2-3で実装
- ✅ 実装内容は変わらず、**実装順序のみ変更**

### 変更理由

1. **実験0の結論**（Embedding統一検証）により、Phase 2の土台が安定
2. **Precision@5, MRR を最優先KPI** とすることで合意
3. **早期フィードバック重視**の原則

---

## 📚 参照すべきドキュメント

### 現在有効なドキュメント

1. **Phase 1**: `docs/phase-1-django-rag-foundation/`
2. **Phase 2**: `docs/phase-2-ml-evaluation-foundation/`
3. **Phase 3**: `docs/phase-3-ml-evaluation-expansion/`
4. **Phase 4**: `docs/phase-4-mlflow-integration/`

### 全体概要

- `docs/PHASES_OVERVIEW.md`
- `docs/TASK_MANAGEMENT_SUMMARY.md`

---

## ⚠️ 注意事項

- このディレクトリのドキュメントは**参考用**です
- 実装は**新定義のドキュメント**に従ってください
- 旧定義の内容は新定義に統合されています

---

**作成日**: 2025-12-29  
**ステータス**: アーカイブ（参考用）

