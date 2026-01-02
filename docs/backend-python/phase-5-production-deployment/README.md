# Phase 5: 本番デプロイ準備

**最終更新**: 2026-01-03  
**期間**: TBD（最小実験後に確定）  
**ステータス**: 📋 設計中（実装前）

---

## 🎯 Phase 5の目的

Phase 1-4で構築した**RAG評価基盤（Django + Grafana + MLflow）** を本番環境にデプロイし、継続的に活用できる状態にする。

**重要**: Phase 5は**実装前に3つの質問に答え、最小実験で検証してから**本格実装を開始します。

---

## ⚠️ Phase 5を始める前に

### 必読ドキュメント

1. **[FORCING_QUESTIONS.md](./FORCING_QUESTIONS.md)** ← **最優先**
   - 実装前に回答すべき3つの質問
   - この回答で最適なアーキテクチャが決まります

2. **[GCP_FREE_TIER_FACTS.md](./GCP_FREE_TIER_FACTS.md)**
   - GCP無料枠の正確な情報（誤解の修正含む）

3. **[ARCHITECTURE_OPTIONS.md](./ARCHITECTURE_OPTIONS.md)**
   - 3つの選択肢（A/B/C）の詳細比較

4. **[MINIMUM_EXPERIMENT.md](./MINIMUM_EXPERIMENT.md)**
   - 3日間の検証計画（無料枠で運用可能か判断）

---

## 🚨 初期提案の誤り（修正済み）

初期提案には以下の**重大な誤解**がありました：

### ❌ 誤り1: Cloudflareで GCP の転送量課金を回避できる

**初期提案**:
> Cloudflareの無料プランを使えば、GCPの転送量制限（1GB/月）を回避できる

**実際**:
- **GCP VMからのアウトバウンド通信は必ずGCPの転送量対象**
- Cloudflareは "ユーザー→Cloudflare" の転送は無料だが、"GCP VM→ユーザー" はGCPの課金対象
- つまり、Cloudflareを使っても**GCPの1GB/月制限は回避できない**

**参考**: [Google Cloud Documentation - Free Cloud Features](https://docs.cloud.google.com/free/docs/free-cloud-features)

---

### ❌ 誤り2: e2-micro（1GB RAM）で3サービス常時稼働が実用的

**初期提案**:
> Django + Grafana + MLflow を e2-micro で常時稼働させる

**実際**:
- **1GBメモリで3サービスは極めて不安定**
- アイドル時でも600-800MB消費、ピーク時はOOM（Out of Memory）で再起動
- スワップ領域を作っても、CPU性能（0.25 vCPU）でスワップ処理が追いつかない

**現実的な構成**:
- **選択肢B**: Django常時稼働 + Grafana/MLflowは必要時だけ起動（推奨）
- または月数ドル許容して上位プランへ

---

### ⚠️ 補足: 静的IPの課金

**初期提案**:
> 静的IPは$3/月（必要に応じて）

**実際**:
- **使用中のVMに紐づいている場合は無料**
- 停止中のVMや未使用の予約IPは課金対象（$3/月程度）

**参考**: [Stack Overflow - Google Compute Engine Static IP Pricing](https://stackoverflow.com/questions/49501329/google-compute-engine-assigning-static-ip-pricing)

---

## 📊 正確な前提情報

### GCP Always Free（e2-micro）

| 項目 | 無料枠 | 制限事項 |
|------|--------|---------|
| **インスタンス** | 1台のe2-micro | us-west1, us-central1, us-east1 のみ |
| **vCPU** | 0.25（バースト可能） | 継続的な高負荷には不向き |
| **メモリ** | 1GB | **最大の制約** |
| **ディスク** | 30GB 標準永続ディスク | SSDは課金対象 |
| **ネットワーク（アウト）** | 1GB/月（北米） | **超過は$0.12/GB** |
| **静的IP** | 使用中VMなら無料 | 停止中/未使用は課金 |

**参考**: [Google Cloud Documentation - Free Cloud Features](https://docs.cloud.google.com/free/docs/free-cloud-features)

### Cloudflare 無料プラン

| 項目 | 内容 | GCPへの影響 |
|------|------|-----------|
| **CDN** | 無制限 | ✅ 静的アセットのキャッシュは有効 |
| **SSL/TLS** | 無料証明書 | ✅ HTTPS化が簡単 |
| **DDoS保護** | 基本的な保護 | ✅ セキュリティ向上 |
| **帯域** | 無制限（Cloudflare側） | ❌ GCPのアウトバウンドは別途課金 |

**重要**: Cloudflareは"ユーザー→Cloudflare"の転送を無料にするが、**"GCP→Cloudflare→ユーザー"の最初の部分（GCP→Cloudflare）はGCPの転送量対象**。

### GitHub Actions

| 項目 | 無料枠 | 変更予定 |
|------|--------|---------|
| **パブリックリポジトリ** | 無制限 | 維持 |
| **プライベートリポジトリ** | 2,000分/月 | 維持 |
| **新課金体系** | - | 2026/3/1から$0.002/分（無料枠は維持） |

**参考**: [GitHub Blog - Update to GitHub Actions pricing](https://github.blog/changelog/2025-12-16-coming-soon-simpler-pricing-and-a-better-experience-for-github-actions/)

---

## 🎯 Phase 5 の進め方（正しい手順）

### Step 0: 前提の明確化（実装前）

**必須**: [FORCING_QUESTIONS.md](./FORCING_QUESTIONS.md) の3つの質問に回答

1. これは「外部公開」用途ですか？それとも「自分の評価基盤」用途ですか？
2. Grafana/MLflowは**常時見る必要**がありますか？それとも「評価するときだけ」で足りますか？
3. "無料に固執して不安定"と "月数ドルで安定"なら、どちらがあなたのKPI（時間・信用・学習効率）に効きますか？

**この回答で最適なアーキテクチャが確定します。**

---

### Step 1: アーキテクチャの選択

[ARCHITECTURE_OPTIONS.md](./ARCHITECTURE_OPTIONS.md) で3つの選択肢を比較：

#### A案: e2-microに全部載せ（非推奨）

**構成**: Django + Grafana + MLflow を1台のe2-microで常時稼働

- ✅ 長所: 学習効果は高い
- ❌ 短所: **不安定**（1GBが厳しい）、転送量も1GB/月で不足しやすい
- 💰 コスト: 無料枠内（ただし不安定）

**推奨度**: ★☆☆☆☆（学習目的以外は非推奨）

---

#### B案: Django常時 + Grafana/MLflow必要時起動（推奨）⭐

**構成**: 
- Django Backend: 常時稼働（RAG API提供）
- Grafana/MLflow: 評価時のみ手動起動（またはcron）

- ✅ 長所: **無料枠で安定稼働**、無駄が少ない、転送量も抑えられる
- ❌ 短所: 常時ダッシュボード閲覧はできない
- 💰 コスト: 無料枠内

**推奨度**: ★★★★★（最もバランスが良い）

**向いている用途**:
- 自分の評価基盤として使う
- 評価結果は定期的に確認すれば良い
- 無料枠を最大限活用したい

---

#### C案: 役割分離（Django別VM、Grafana/MLflow別）

**構成**:
- VM1（e2-micro無料枠）: Django Backend
- VM2（有料）: Grafana + MLflow

- ✅ 長所: 安定、運用も明確、スケールしやすい
- ❌ 短所: **無料枠に収まらない**（月$10-20程度）
- 💰 コスト: 月$10-20

**推奨度**: ★★★☆☆（予算があれば最も安定）

**向いている用途**:
- 外部公開で複数人が使う
- 常時ダッシュボード表示が必要
- 月数ドル許容できる

---

### Step 2: 最小実験（3日間）

[MINIMUM_EXPERIMENT.md](./MINIMUM_EXPERIMENT.md) に従って、**無料枠で運用可能か事実で判断**：

#### 実験の目的

「選択したアーキテクチャが無料枠で運用できるか」を**実データ**で検証し、無駄な実装を避ける。

#### 実験手順（3日間）

1. **Day 1**: e2-microでDjangoのみ常時稼働
2. **Day 2**: 手動でGrafana/MLflowを起動→使用→停止
3. **Day 3**: 1週間分のメモリ/CPU/転送量を分析

#### KPI（合格基準）

- ✅ 週あたりOOM再起動 0回
- ✅ 平常時メモリ空き 200MB以上
- ✅ 月間アウトバウンド推定 < 1GB

#### 判定

- **合格**: 選択したアーキテクチャで本格実装へ
- **不合格**: 上位プランへ移行、またはアーキテクチャ変更

---

### Step 3: 本格実装（実験合格後）

実験合格後、以下のドキュメントを作成して実装：

- `DEPLOYMENT_GUIDE.md` - デプロイ手順書
- `SECURITY_CHECKLIST.md` - セキュリティチェックリスト
- `MONITORING_SETUP.md` - モニタリング設定
- `TROUBLESHOOTING.md` - トラブルシューティング

---

## 🚀 推奨プラン（B案を前提）

### 構成

```
┌─────────────────────────────────────────────────────────┐
│                    Cloudflare (無料)                     │
│  - CDN（静的アセットのみキャッシュ）                      │
│  - SSL/TLS                                               │
│  - DDoS保護                                              │
└─────────────────┬───────────────────────────────────────┘
                  │ HTTPS
                  ↓
┌─────────────────────────────────────────────────────────┐
│           GCP Compute Engine (e2-micro)                  │
│           リージョン: us-west1 (無料枠)                   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Docker Compose                                   │  │
│  │  ┌────────────────────────────────────────────┐  │  │
│  │  │  Django Backend :8000 （常時稼働）        │  │  │
│  │  └────────────────────────────────────────────┘  │  │
│  │                                                   │  │
│  │  ┌────────────────────────────────────────────┐  │  │
│  │  │  Grafana :3001 （評価時のみ起動）         │  │  │
│  │  └────────────────────────────────────────────┘  │  │
│  │                                                   │  │
│  │  ┌────────────────────────────────────────────┐  │  │
│  │  │  MLflow :5000 （評価時のみ起動）          │  │  │
│  │  └────────────────────────────────────────────┘  │  │
│  │                                                   │  │
│  │         ┌──────────────────┐                     │  │
│  │         │  Nginx Reverse   │                     │  │
│  │         │  Proxy :80/:443  │                     │  │
│  │         └──────────────────┘                     │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────────────────────┐
│                  Supabase (外部)                         │
│                  PostgreSQL Database                     │
└─────────────────────────────────────────────────────────┘
```

### サービス起動/停止スクリプト

```bash
# 評価開始時
docker-compose start grafana mlflow

# 評価終了時
docker-compose stop grafana mlflow

# Django は常時稼働
docker-compose start backend  # 常時稼働
```

### メモリ使用量（想定）

| サービス | 常時稼働時 | 評価時（全起動） |
|---------|-----------|----------------|
| Django Backend | 200-300MB | 200-300MB |
| Grafana | - | 200-300MB |
| MLflow | - | 150-200MB |
| システム/その他 | 100-150MB | 100-150MB |
| **合計** | **300-450MB** | **650-950MB** |
| **空きメモリ** | **550-700MB** ✅ | **50-350MB** ⚠️ |

**評価時は一時的に負荷が上がるが、短時間なら許容範囲**

---

## 📋 次のアクション

### 1. FORCING_QUESTIONS.md に回答 ← **今すぐ実施**

3つの質問に答えてください：
- 外部公開 vs 自分の評価基盤？
- Grafana/MLflow常時表示が必要？
- 無料固執 vs 月数ドル許容？

### 2. アーキテクチャを確定

回答をもとに A/B/C のいずれかを選択

### 3. 最小実験を実施（3日間）

選択したアーキテクチャが無料枠で運用可能か検証

### 4. 本格実装

実験合格後、本格的にデプロイ

---

## 🎓 Phase 5 で学べること

- ✅ GCP無料枠の**現実的な制約**の理解
- ✅ リソース制約下での**最適化設計**
- ✅ "事実で判断"する**実験駆動の意思決定**
- ✅ Cloudflareの**正しい使い方**（誤解の修正）
- ✅ CI/CD構築の実践
- ✅ 本番環境のセキュリティ対策

**重要**: "無料枠で全部できる" という楽観ではなく、**制約を理解した上で最適解を選ぶ**スキルが身につきます。

---

## 📚 参考資料

- [Google Cloud - Free Cloud Features](https://docs.cloud.google.com/free/docs/free-cloud-features)
- [Stack Overflow - GCE Static IP Pricing](https://stackoverflow.com/questions/49501329/google-compute-engine-assigning-static-ip-pricing)
- [GitHub Blog - Actions Pricing Update](https://github.blog/changelog/2025-12-16-coming-soon-simpler-pricing-and-a-better-experience-for-github-actions/)

---

**まずは [FORCING_QUESTIONS.md](./FORCING_QUESTIONS.md) に答えてください！** 🙏

