# Phase 5: 本番デプロイ準備 - ドキュメント一覧

**最終更新**: 2026-01-03  
**ステータス**: 📋 設計中（実装前）  
**目的**: 評価基盤の本番環境デプロイ戦略の策定と実装

---

## 📚 ドキュメント構成

### 1. 基本文書

| ファイル | 説明 | ステータス |
|---------|------|-----------|
| [README.md](./README.md) | Phase 5の概要・目的・注意事項 | ✅ 作成済み |
| [FORCING_QUESTIONS.md](./FORCING_QUESTIONS.md) | 実装前に回答すべき3つの質問 | ✅ 作成済み |
| [DECISION.md](./DECISION.md) | アーキテクチャ決定記録（B案確定） | ✅ 作成済み |

### 2. 技術調査

| ファイル | 説明 | ステータス |
|---------|------|-----------|
| [GCP_FREE_TIER_FACTS.md](./GCP_FREE_TIER_FACTS.md) | GCP無料枠の正確な情報（2026年1月版） | ✅ 作成済み |
| [CLOUDFLARE_ANALYSIS.md](./CLOUDFLARE_ANALYSIS.md) | Cloudflareの役割と誤解の解消 | ✅ 作成済み |
| [ARCHITECTURE_OPTIONS.md](./ARCHITECTURE_OPTIONS.md) | 3つのアーキテクチャ選択肢の詳細比較 | ✅ 作成済み |

### 3. 実験計画

| ファイル | 説明 | ステータス |
|---------|------|-----------|
| [MINIMUM_EXPERIMENT.md](./MINIMUM_EXPERIMENT.md) | 3日間の最小実験計画（無料枠検証） | ✅ 作成済み |

### 4. 実装ガイド

| ファイル | 説明 | ステータス |
|---------|------|-----------|
| [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) | デプロイ手順書（B案向け） | ✅ 作成済み |
| SECURITY_CHECKLIST.md | セキュリティチェックリスト | ⏳ 実験合格後 |
| MONITORING_SETUP.md | モニタリング設定 | ⏳ 実験合格後 |
| TROUBLESHOOTING.md | トラブルシューティング | ⏳ 実験合格後 |

---

## 🎯 Phase 5 の進め方

### Step 1: 前提の明確化 ✅ **完了**

**目的**: 無駄な実装を避けるため、要件を明確にする

- [✅] [FORCING_QUESTIONS.md](./FORCING_QUESTIONS.md) の3つの質問に回答
- [✅] 用途: 自分の評価基盤（手動で外部に見せることもある）
- [✅] 可用性要件: 評価時のみ起動（常時稼働不要）
- [✅] 予算制約: 完全無料

### Step 2: アーキテクチャの選択 ✅ **完了**

**目的**: 最適な構成を選ぶ

- [✅] [ARCHITECTURE_OPTIONS.md](./ARCHITECTURE_OPTIONS.md) で3つの選択肢を比較
- [❌] A案: e2-microに全部載せ（非推奨）
- [✅] **B案: Django常時 + Grafana/MLflow必要時起動（確定）** ⭐
- [❌] C案: 役割分離（有料のため不採用）

**確定事項**: [DECISION.md](./DECISION.md) に記録

### Step 3: 最小実験の実施 ⏳ **次のステップ**

**目的**: 無料枠で運用可能か事実で判断

- [ ] [MINIMUM_EXPERIMENT.md](./MINIMUM_EXPERIMENT.md) に従って3日間検証
- [ ] メモリ使用量の観測
- [ ] ネットワーク転送量の観測
- [ ] OOM再起動の有無を確認

### Step 4: 本格実装 ⏳ **実験合格後**

**目的**: 検証結果をもとに実装

- [✅] [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) 作成完了
- [ ] 最小実験の実施
- [ ] 実験合格後、本格デプロイ
- [ ] セキュリティチェックリスト作成
- [ ] モニタリング設定完了

---

## ⚠️ 重要な注意事項

### ❌ 修正した誤解

以下の点は**初期提案で誤っていました**：

1. **Cloudflareで GCP の転送量課金を回避できる**
   - ❌ 誤り：GCP VMからのアウトバウンドは必ずGCPの転送量制限の対象
   - ✅ 正解：Cloudflareは"人→Cloudflare"の転送は無料だが、"GCP→人"はGCP課金

2. **e2-microで3サービス常時稼働が実用的**
   - ❌ 誤り：1GBメモリで Django + Grafana + MLflow は不安定
   - ✅ 正解：Djangoのみ常時、他は必要時起動が現実的

3. **静的IPは必要に応じて$3/月**
   - ⚠️ 補足：使用中のVMに紐づいている場合は無料、停止中や未使用は課金

### ✅ 正確な前提

- GCP Always Free: e2-micro（1GB RAM, 0.25 vCPU）は us-west1/us-central1/us-east1 で無料
- ディスク: 30GB標準永続ディスクまで無料
- ネットワーク: **北米からのアウトバウンド 1GB/月まで無料**（超過は$0.12/GB）
- GitHub Actions: 2026年3月から新課金体系（無料枠は維持）

---

## 📖 推奨読書順序

初めての方は以下の順序で読むことを推奨します：

1. **[README.md](./README.md)** - Phase 5の全体像を把握
2. **[FORCING_QUESTIONS.md](./FORCING_QUESTIONS.md)** - 3つの質問に回答
3. **[GCP_FREE_TIER_FACTS.md](./GCP_FREE_TIER_FACTS.md)** - GCP無料枠の正確な理解
4. **[CLOUDFLARE_ANALYSIS.md](./CLOUDFLARE_ANALYSIS.md)** - Cloudflareの役割を理解
5. **[ARCHITECTURE_OPTIONS.md](./ARCHITECTURE_OPTIONS.md)** - 3つの選択肢を比較
6. **[MINIMUM_EXPERIMENT.md](./MINIMUM_EXPERIMENT.md)** - 実験計画を確認

---

## 🎯 次のアクション

1. **FORCING_QUESTIONS.md の3つの質問に回答**してください
2. 回答をもとに最適なアーキテクチャを確定します
3. 最小実験を実施して、無料枠での運用可能性を検証します
4. 検証結果をもとに本格実装を開始します

**実装は "事実で判断" してから開始します。無駄な学習/実装を避けるためです。** ✅

