# Phase 5: 最小実験計画（3日間検証）

**最終更新**: 2026-01-03  
**目的**: 選択したアーキテクチャが無料枠で運用可能か、**事実で判断**する

---

## 🎯 最小実験の目的

### なぜ実験が必要か？

Phase 5 の実装前に、**「無料枠で運用できるか」を事実で判断**し、無駄な実装・学習・トラブルシューティングを避けるためです。

### 実験で明らかにすること

1. **メモリ使用量**: 常時稼働時と評価時のメモリ使用量
2. **OOM再起動**: 1週間でOOM（Out of Memory）再起動が何回発生するか
3. **ネットワーク転送量**: 月間転送量の推定値
4. **CPU使用率**: ピーク時のCPU使用率
5. **応答時間**: API応答時間（スワップ発生時の影響）

---

## 📋 実験計画（3日間）

### Day 1: 環境構築 + Django常時稼働

#### 実施内容

1. **GCP e2-microインスタンス作成**
   - リージョン: us-west1-b
   - マシンタイプ: e2-micro（1GB RAM）
   - ディスク: 30GB標準永続ディスク
   - ファイアウォール: 80, 443, 8000, 3001, 5000

2. **Docker + Docker Compose インストール**

3. **Django Backendのみ常時稼働**
   ```bash
   # docker-compose.ymlから Grafana/MLflow を一時的にコメントアウト
   docker-compose up -d backend
   ```

4. **モニタリングツールのセットアップ**
   ```bash
   # メモリ監視スクリプト
   watch -n 60 free -h >> /var/log/memory_usage.log
   
   # Docker stats 記録
   docker stats --no-stream --format "table {{.Name}}\t{{.MemUsage}}\t{{.CPUPerc}}" >> /var/log/docker_stats.log
   ```

#### KPI（測定指標）

- ✅ Django Backend起動成功
- ✅ メモリ使用量: 300-450MB（空き: 550-700MB）
- ✅ OOM再起動: 0回

---

### Day 2: Grafana/MLflow手動起動 + 評価実行

#### 実施内容

1. **Grafana/MLflowを起動**
   ```bash
   docker-compose up -d grafana mlflow
   
   # メモリ確認
   free -h
   ```

2. **評価を実行**
   ```bash
   docker exec rag_backend python /app/rag_api/management/commands/evaluate_final.py baseline v2.0
   ```

3. **Grafana/MLflow UIにアクセス**
   - Grafana: http://VM_IP:3001
   - MLflow: http://VM_IP:5000

4. **評価終了後、Grafana/MLflowを停止**
   ```bash
   docker-compose stop grafana mlflow
   
   # メモリ確認
   free -h
   ```

5. **転送量を記録**
   ```bash
   # ネットワーク統計を取得
   ifconfig eth0 | grep "RX bytes"
   ifconfig eth0 | grep "TX bytes"
   ```

#### KPI（測定指標）

- ✅ Grafana/MLflow起動成功
- ✅ 評価時メモリ使用量: 650-950MB（空き: 50-350MB）
- ✅ OOM再起動: 0回
- ✅ 評価実行時間: 5分以内
- ✅ Grafanaダッシュボード表示成功
- ✅ 転送量: 10MB以下（1回の評価）

---

### Day 3: 1週間分のデータ分析 + 判定

#### 実施内容

1. **ログ分析**
   ```bash
   # メモリ使用量の推移
   cat /var/log/memory_usage.log
   
   # Docker stats
   cat /var/log/docker_stats.log
   
   # OOM再起動の確認
   grep -i "out of memory" /var/log/syslog
   ```

2. **転送量の推定**
   ```bash
   # 1回の評価での転送量を記録
   # 月間回数を想定（週2回 → 月8回）
   # 月間転送量 = 1回の転送量 × 8回
   ```

3. **判定**
   - ✅ 合格基準を満たすか確認
   - ❌ 不合格の場合、原因分析と対策検討

#### KPI（測定指標）

- ✅ 週あたりOOM再起動: 0回
- ✅ 平常時メモリ空き: 200MB以上
- ✅ 月間転送量推定: < 1GB
- ✅ API応答時間: < 1秒（平常時）

---

## ✅ 合格基準

### 必須条件（すべて満たす必要あり）

| 項目 | 合格基準 | 不合格時の影響 |
|------|---------|---------------|
| **OOM再起動** | 週あたり 0回 | サービス停止、データ損失 |
| **メモリ空き（平常時）** | 200MB以上 | OOMリスク高、不安定 |
| **メモリ空き（評価時）** | 50MB以上 | 評価実行時にOOM |
| **月間転送量推定** | < 1GB | 超過課金（$0.12/GB） |

### 推奨条件（満たすと望ましい）

| 項目 | 推奨基準 | 影響 |
|------|---------|------|
| **API応答時間（平常時）** | < 500ms | ユーザー体験に影響 |
| **API応答時間（評価時）** | < 2秒 | 評価実行時間に影響 |
| **CPU使用率（ピーク時）** | < 80% | スワップ発生リスク |

---

## 📊 データ収集

### 1. メモリ使用量

#### 記録方法

```bash
# 1時間ごとにメモリ使用量を記録
crontab -e

# 以下を追加
0 * * * * free -h >> /var/log/memory_usage.log
0 * * * * docker stats --no-stream --format "table {{.Name}}\t{{.MemUsage}}\t{{.CPUPerc}}" >> /var/log/docker_stats.log
```

#### 分析方法

```bash
# 最小/最大メモリ使用量を確認
cat /var/log/memory_usage.log | grep "Mem:" | awk '{print $3}'

# Djangoのメモリ使用量
cat /var/log/docker_stats.log | grep "rag_backend"
```

---

### 2. OOM再起動の確認

#### 記録方法

```bash
# システムログでOOMを検索
sudo grep -i "out of memory" /var/log/syslog
sudo grep -i "killed process" /var/log/syslog
```

#### 分析方法

```bash
# OOMが発生した場合、どのプロセスが停止したか確認
# 例:
# kernel: Out of memory: Killed process 1234 (python) 
#        total-vm:500000kB, anon-rss:400000kB, file-rss:0kB
```

---

### 3. ネットワーク転送量

#### 記録方法

```bash
# 評価実行前の転送量を記録
TX_BEFORE=$(ifconfig eth0 | grep "TX bytes" | awk '{print $5}')

# 評価実行
docker exec rag_backend python /app/rag_api/management/commands/evaluate_final.py baseline v2.0

# ダッシュボード表示（Grafana）
# ブラウザで http://VM_IP:3001 にアクセス

# 評価実行後の転送量を記録
TX_AFTER=$(ifconfig eth0 | grep "TX bytes" | awk '{print $5}')

# 1回の評価での転送量
echo "Transfer: $((TX_AFTER - TX_BEFORE)) bytes"
```

#### 分析方法

```bash
# 月間転送量の推定
# 1回の転送量 × 月間評価回数（週2回 → 月8回）

# 例:
# 1回の転送量: 10MB
# 月間転送量: 10MB × 8回 = 80MB（無料枠1GBの8%）
```

---

### 4. API応答時間

#### 記録方法

```bash
# Django API応答時間を測定
time curl http://VM_IP:8000/api/health/

# 評価実行時の応答時間
time curl -X POST http://VM_IP:8000/api/evaluate/ -H "Content-Type: application/json" -d '{"query": "test"}'
```

#### 分析方法

```bash
# 平常時: < 500ms
# 評価時: < 2秒

# スワップ発生時は応答時間が10秒以上に増加
```

---

## 🧪 実験結果の判定

### ケース1: すべての合格基準を満たす ✅

**判定**: **合格**

**次のアクション**:
1. 選択したアーキテクチャ（B案推奨）で本格実装へ
2. CI/CD構築
3. モニタリング設定
4. ドキュメント作成

---

### ケース2: OOM再起動が発生 ❌

**判定**: **不合格**

**原因分析**:
- メモリ使用量が1GBを超えた
- 3サービス（Django + Grafana + MLflow）の同時稼働は不可

**対策**:
1. **B案へ変更**: Django常時 + Grafana/MLflow必要時起動
2. **C案へ変更**: 役割分離（有料だが安定）
3. **A案を諦める**: 3サービス常時稼働は不可

---

### ケース3: 転送量が1GB/月を超える見込み ❌

**判定**: **要注意**

**原因分析**:
- 外部公開で複数人がアクセス
- Grafanaダッシュボードの画像が大きい

**対策**:
1. **Cloudflare導入**: 静的アセットのキャッシュで70%削減
2. **転送量監視**: GCP Consoleで日次確認
3. **画像最適化**: Grafanaの画像埋め込みを最小化
4. **有料プラン検討**: 月$5-10で転送量制限を緩和

---

### ケース4: API応答時間が遅い（2秒以上）⚠️

**判定**: **要改善**

**原因分析**:
- スワップが発生している
- CPU性能（0.25 vCPU）が不足

**対策**:
1. **メモリ使用量削減**: 不要なサービスを停止
2. **スワップ領域削減**: swappiness設定の変更
3. **有料プラン検討**: e2-small（2GB RAM, $13/月）へ

---

## 📝 実験レポートのテンプレート

### 実験結果サマリー

```markdown
## Phase 5 最小実験結果

**実験期間**: 2026-XX-XX ~ 2026-XX-XX（3日間）
**アーキテクチャ**: B案（Django常時 + Grafana/MLflow必要時）

### 測定結果

| 項目 | 合格基準 | 測定結果 | 判定 |
|------|---------|---------|------|
| OOM再起動（週） | 0回 | 0回 | ✅ |
| メモリ空き（平常時） | 200MB以上 | 550MB | ✅ |
| メモリ空き（評価時） | 50MB以上 | 150MB | ✅ |
| 月間転送量推定 | < 1GB | 80MB | ✅ |
| API応答時間（平常時） | < 500ms | 250ms | ✅ |
| API応答時間（評価時） | < 2秒 | 800ms | ✅ |

### 総合判定

**✅ 合格**

### 次のアクション

1. B案で本格実装へ進む
2. CI/CD構築
3. モニタリング設定
4. DEPLOYMENT_GUIDE.md作成

### 補足・備考

- Djangoのメモリ使用量は安定（200-300MB）
- 評価時にGrafana/MLflowを起動しても余裕あり
- 転送量は月間80MBと余裕（無料枠1GBの8%）
- OOM再起動は一度も発生せず
```

---

## 🎯 実験成功のコツ

### 1. 正確なデータ収集

- ✅ 1時間ごとにメモリ使用量を記録
- ✅ 評価前後の転送量を記録
- ✅ システムログでOOMを確認

### 2. 現実的な使用パターンを再現

- ✅ 実際の評価クエリを使用
- ✅ 実際のダッシュボード表示を実施
- ✅ 週2回の評価を想定

### 3. 複数回のテスト

- ✅ 1回だけでなく、3-5回評価を実施
- ✅ ピーク時とアイドル時の両方を測定

---

## 📚 次のステップ

### 実験合格後

1. **DEPLOYMENT_GUIDE.md作成**（デプロイ手順書）
2. **SECURITY_CHECKLIST.md作成**（セキュリティチェックリスト）
3. **MONITORING_SETUP.md作成**（モニタリング設定）
4. **本格実装開始**

### 実験不合格時

1. **原因分析**（なぜ合格基準を満たせなかったか）
2. **対策検討**（アーキテクチャ変更、有料プラン検討）
3. **再実験**（対策後、再度3日間検証）

---

**まずは3日間の実験で、事実を確認しましょう！** 🚀

