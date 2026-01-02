# RAG可視化・ML評価プロジェクト - 全体概要

**プロジェクト期間**: 5週間（Phase 1-4）
**最終目標**: RAG検索の精度を可視化し、ML評価で継続的に改善

---

## 🎯 プロジェクト全体像

```
Phase 1: Django RAG Foundation（2週間）
    ↓ 統一検索・ログ記録・Grafana可視化
Phase 2: RAG検索ログ分析（1週間）
    ↓ 検索パターン分析・クエリ分類
Phase 3: ML評価システム（2週間）
    ↓ Recall@k、MRR、NDCG評価・A/Bテスト
Phase 4: MLflow統合（1週間）
    ↓ 実験トラッキング・パラメータ最適化
Phase 5: Production Deployment（保留中）
    ↓ GCP無料枠・Cloudflare・GitHub Actions
Phase 6: 自動ブログ改善エンジン（2-3週間）🆕
    ↓ 自動評価→改善→生成ループ
```

---

## 📊 各Phaseの関係性

```
┌────────────────────────────────────────────────┐
│ Phase 1: Django RAG Foundation                 │
│ ✅ 基盤構築完了                                 │
│ - Django RAG API                               │
│ - 基本検索ログ記録                              │
│ - Grafana基本ダッシュボード                    │
│ - Embedding統一検証（実験0）                   │
└────────────┬───────────────────────────────────┘
             │ 出力: 検索ログ、RAG統計、Embedding検証結果
             ↓
┌────────────────────────────────────────────────┐
│ Phase 2: ML評価基盤（最小実装）⏳               │
│ ✅ 評価システムの確立                           │
│ - 評価データセット（10クエリ×3正解）           │
│ - Precision@5, MRR 実装                        │
│ - BM25 再ランキング                            │
│ - Grafana 評価指標パネル                       │
└────────────┬───────────────────────────────────┘
             │ 出力: 評価基盤、ベースライン結果
             ↓
┌────────────────────────────────────────────────┐
│ Phase 3: ML評価システム拡張 ⏳                 │
│ ✅ 評価システムの拡張と高度化                   │
│ - 評価データセット拡張（100+件）                │
│ - NDCG 実装                                    │
│ - A/Bテスト実装                                 │
│ - 検索ログ分析・クエリ分類（旧Phase 2）        │
└────────────┬───────────────────────────────────┘
             │ 出力: 本格評価システム、分析結果
             ↓
┌────────────────────────────────────────────────┐
│ Phase 4: MLflow統合 ⏳                         │
│ ✅ 実験管理の自動化                             │
│ - MLflow Tracking Server                       │
│ - 実験トラッキング                              │
│ - パラメータ最適化（Grid Search）              │
│ - MLflow UI可視化                              │
└────────────────────────────────────────────────┘
```

**🔄 旧定義からの変更点**:
- 旧Phase 2（検索ログ分析）→ 新Phase 3に統合
- 旧Phase 3（ML評価）→ 新Phase 2-3に分割
- 理由: 実験0の結論（Embedding統一証明）により、ML評価を優先

---

## 📋 Phase別サマリー

| Phase | 期間 | 主要成果物 | 完了判定 | ステータス |
|-------|------|-----------|---------|-----------|
| **Phase 1** | 2週間 | Django RAG API、Embedding統一検証、Grafanaダッシュボード | 統一検索・ログ記録・可視化が動作 | ✅ 完了 |
| **Phase 2** | 1週間 | 評価データセット（10件）、Precision@5/MRR、BM25再ランキング | ML評価基盤が動作 | ✅ 完了 |
| **Phase 3** | 2週間 | 評価データセット拡張（25件）、NDCG/Recall@20、RRF、run_id変数 | BM25で+56.5% MRR改善 | ✅ 完了 |
| **Phase 4** | 2週間 | MLflow統合、自動ログ、dataset_version変数、相互参照 | 実験管理自動化、効率67%向上 | ✅ 完了 |
| **Phase 5** | - | GCP無料枠デプロイ、Cloudflare、GitHub Actions | 本番環境構築 | ⏸️ 保留 |
| **Phase 6** | 2-3週間 | 自動評価→改善→生成ループ、A/Bテスト、ML最適化 | ブログ品質の継続的向上 | 📋 設計完了 |

**🔄 スコープ変更の経緯**: Phase 1完了後の実験0（Embedding統一検証）により、Phase 2以降のスコープを再定義しました。詳細は `archived/ARCHIVE_README.md` を参照してください。

---

## 🎯 マイルストーン

### Milestone 1: 可視化基盤完成（Phase 1完了）
- ✅ Django RAG APIが稼働
- ✅ 検索ログが記録される
- ✅ Grafanaでデータが可視化できる
- ✅ 既存システムに影響なし

### Milestone 2: 検索品質可視化（Phase 2完了）
- ✅ 検索パターンが分析できる
- ✅ クエリが自動分類される
- ✅ RAG別性能が比較できる

### Milestone 3: ML評価システム稼働（Phase 3完了）
- ✅ RAG検索精度が数値化される
- ✅ Recall@5、MRR、NDCGが計算できる
- ✅ A/Bテストが実行できる

### Milestone 4: 実験管理自動化（Phase 4完了）
- ✅ 実験がMLflowに自動記録される
- ✅ パラメータ最適化が実行できる
- ✅ 最適パラメータが特定できる

---

## 🔗 ドキュメント構成

```
docs/
├── PHASES_OVERVIEW.md                  # このファイル（全体概要）
│
├── phase-1-django-rag-foundation/      # Phase 1: Django RAG基盤 ✅ 完了
│   ├── 00_DATABASE_SURVEY.md          # データベース調査結果
│   ├── 01_README.md                    # Phase 1概要
│   ├── 02_API_SPEC.md                  # APIエンドポイント仕様
│   ├── 03_IMPLEMENTATION_GUIDE.md      # 実装ガイド
│   ├── 04_TEST_PLAN.md                 # テスト計画
│   ├── EMBEDDING_VERIFICATION_REPORT.md # 実験0: Embedding統一検証
│   ├── PHASE1_COMPLETION_REPORT.md     # Phase 1完了報告
│   └── SUMMARY.md                      # Phase 1サマリー
│
├── phase-2-ml-evaluation-foundation/   # Phase 2: ML評価基盤（最小）⏳ 実装中
│   └── README.md                       # Phase 2実装計画
│
├── phase-3-ml-evaluation-expansion/    # Phase 3: ML評価拡張 ⏳ 計画中
│   └── README.md                       # Phase 3実装計画
│
├── phase-4-mlflow-integration/         # Phase 4: MLflow統合 ✅ 完了
│   └── README.md                       # Phase 4実装計画
│
├── phase-5-production-deployment/     # Phase 5: 本番デプロイ ⏸️ 保留
│   ├── README.md                       # Phase 5概要
│   ├── ARCHITECTURE_OPTIONS.md         # アーキテクチャ選択肢
│   ├── DECISION.md                     # 最終決定事項
│   └── DEPLOYMENT_GUIDE.md             # デプロイガイド
│
├── phase-6-auto-blog-improvement/     # Phase 6: 自動ブログ改善エンジン 🆕 設計完了
│   ├── INDEX.md                        # ドキュメント索引
│   ├── README.md                       # Phase 6概要・実装計画
│   └── ARCHITECTURE.md                 # 技術アーキテクチャ設計書
│
└── archived/                           # アーカイブドキュメント（旧定義）
    ├── ARCHIVE_README.md               # アーカイブ説明
    ├── phase-2-search-logging/         # 旧Phase 2: 検索ログ分析
    └── phase-3-ml-evaluation/          # 旧Phase 3: ML評価システム
```

**⚠️ 重要**: Phase 2-3 は実験0（Embedding統一検証）の結論を反映してスコープを再定義しました。
旧定義は `archived/` に保存されています。詳細は `archived/ARCHIVE_README.md` を参照してください。

---

## 📊 技術スタック

| 層 | 技術 | 用途 |
|---|------|------|
| **Frontend** | Next.js 14 | 既存システム（変更なし） |
| **Backend** | Django 5 + DRF | RAG API、ML評価システム |
| **Database** | Supabase PostgreSQL + pgvector | RAGデータ、検索ログ |
| **Embeddings** | OpenAI API（text-embedding-3-small/large） | ベクトル化 |
| **Monitoring** | Grafana | RAGデータ可視化、検索ログ分析 |
| **Experiment Tracking** | MLflow | 実験トラッキング、パラメータ最適化 |
| **Infrastructure** | Docker Compose | ローカル開発環境 |

---

## 🚨 重要な原則

### 1. 既存システム保護（Phase 1-5全体）
- ✅ 既存Next.js APIに一切影響を与えない
- ✅ Fragment IDベクトル化は保護
- ✅ ハイブリッド記事生成は保護
- ✅ 構造化データは保護

### 2. 段階的実装
- ✅ 各Phaseは独立して完成する
- ✅ 前Phaseが完了してから次Phaseへ
- ✅ 必要に応じてPhaseを調整可能

### 3. 柔軟性の確保
- ✅ ML評価指標は追加・変更可能
- ✅ 最適化手法は変更可能
- ✅ MLflow Backendは変更可能

---

## 📝 次のアクション

### 現在の状況
- ✅ Phase 1設計完了
- ✅ Phase 2、3、4の骨組み作成完了
- ⏳ Phase 1実装待ち

### 次のステップ
1. Phase 1実装開始（Day 1-2: 環境構築）
2. Phase 1完了後、Phase 2へ
3. Phase 2完了後、Phase 3へ
4. Phase 3完了後、Phase 4へ

---

## 💡 成功の定義

### Phase 1完了時
RAG検索の**現状が可視化**されている

### Phase 3完了時
RAG検索の**精度が数値化**されている

### Phase 4完了時
RAG検索の**最適パラメータが特定**されている

### 最終ゴール
RAG検索の**継続的改善サイクル**が確立されている

---

## 🎉 期待される効果

1. **RAG検索精度の向上**: 最適パラメータで+5-10%精度向上
2. **検索品質の可視化**: 検索ログからパターン分析
3. **A/Bテストの実施**: データドリブンな意思決定
4. **継続的改善**: MLflowで実験履歴を管理

---

**作成日**: 2025年12月29日
**ステータス**: Phase 1設計完了、Phase 2-4骨組み完了

