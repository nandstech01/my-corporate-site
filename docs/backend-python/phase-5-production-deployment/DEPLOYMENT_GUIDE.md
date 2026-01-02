# Phase 5: デプロイガイド（B案: Django常時 + Grafana/MLflow必要時）

**最終更新**: 2026-01-03  
**対象アーキテクチャ**: B案  
**月額コスト**: $0（完全無料）

---

## 🎯 デプロイ全体フロー

```
Day 1: GCP環境構築（30分）
  ↓
Day 2: Docker + アプリケーションデプロイ（1時間）
  ↓
Day 3: Cloudflare + ドメイン設定（30分）
  ↓
Day 4: 動作確認 + モニタリング設定（1時間）
  ↓
完成！
```

---

## 📋 事前準備

### 必要なもの

- ✅ GCPアカウント（新規の場合は$300クレジット付き）
- ✅ 既存のカスタムドメイン（`example.com`）
- ✅ Cloudflareアカウント（無料）
- ✅ GitHub リポジトリ（プライベート推奨）
- ✅ ローカルに gcloud CLI インストール済み

### 前提知識

- 基本的なLinuxコマンド
- Dockerの基礎知識
- DNS設定の基礎知識

---

## Day 1: GCP環境構築（30分）

### Step 1-1: GCPプロジェクト作成

```bash
# gcloud CLIでログイン
gcloud auth login

# 新しいプロジェクトを作成
gcloud projects create rag-eval-prod --name="RAG Evaluation Production"

# プロジェクトを設定
gcloud config set project rag-eval-prod

# Compute Engine APIを有効化
gcloud services enable compute.googleapis.com
```

---

### Step 1-2: e2-microインスタンス作成

```bash
# インスタンス作成（us-west1-b、Always Free対象）
gcloud compute instances create rag-eval-vm \
  --zone=us-west1-b \
  --machine-type=e2-micro \
  --image-family=ubuntu-2204-lts \
  --image-project=ubuntu-os-cloud \
  --boot-disk-size=30GB \
  --boot-disk-type=pd-standard \
  --tags=http-server,https-server \
  --metadata=startup-script='#!/bin/bash
apt-get update
apt-get install -y docker.io docker-compose git
systemctl enable docker
systemctl start docker
usermod -aG docker $USER'

# ファイアウォールルール作成（HTTP/HTTPS）
gcloud compute firewall-rules create allow-http \
  --allow=tcp:80 \
  --target-tags=http-server \
  --description="Allow HTTP traffic"

gcloud compute firewall-rules create allow-https \
  --allow=tcp:443 \
  --target-tags=https-server \
  --description="Allow HTTPS traffic"
```

**⏱️ 所要時間**: 5分（VM起動完了まで）

---

### Step 1-3: 静的IPアドレスの予約

```bash
# 静的IPアドレスを予約
gcloud compute addresses create rag-eval-ip \
  --region=us-west1

# IPアドレスを確認
gcloud compute addresses describe rag-eval-ip \
  --region=us-west1 \
  --format="get(address)"

# 例: 34.168.123.45
```

**💡 メモ**: このIPアドレスは後でCloudflare DNSに設定します。

---

### Step 1-4: 静的IPをVMに紐付け

```bash
# VMに静的IPを割り当て
gcloud compute instances delete-access-config rag-eval-vm \
  --zone=us-west1-b

gcloud compute instances add-access-config rag-eval-vm \
  --zone=us-west1-b \
  --address=rag-eval-ip
```

---

### Step 1-5: SSH接続確認

```bash
# SSH接続
gcloud compute ssh rag-eval-vm --zone=us-west1-b

# Dockerが動作しているか確認
docker --version
docker-compose --version

# メモリ確認
free -h

# 出力例:
#               total        used        free      shared  buff/cache   available
# Mem:          1.0Gi       150Mi       700Mi       1.0Mi       150Mi       800Mi
```

**✅ 確認ポイント**:
- Docker/Docker Composeがインストール済み
- メモリ: 約1GB（空き700MB以上）

---

## Day 2: Docker + アプリケーションデプロイ（1時間）

### Step 2-1: リポジトリをクローン

```bash
# SSHでVMにログイン
gcloud compute ssh rag-eval-vm --zone=us-west1-b

# ホームディレクトリに移動
cd ~

# リポジトリをクローン
git clone https://github.com/your-username/my-corporate-site.git
cd my-corporate-site
```

---

### Step 2-2: 環境変数ファイルを作成

```bash
# .envファイルを作成
nano .env
```

**`.env` の内容**:

```bash
# Django設定
DEBUG=False
ALLOWED_HOSTS=rag.example.com,34.168.123.45
SECRET_KEY=your-secret-key-here-change-this

# Supabase（既存の設定をコピー）
DATABASE_URL=postgresql://user:pass@db.xxxx.supabase.co:5432/postgres
DATABASE_PASSWORD=your-supabase-password

# MLflow設定
MLFLOW_TRACKING_URI=http://mlflow:5000

# Grafana設定
GF_SECURITY_ADMIN_USER=admin
GF_SECURITY_ADMIN_PASSWORD=your-secure-password
```

**⚠️ 重要**:
- `SECRET_KEY`: 本番用の長いランダム文字列に変更
- `ALLOWED_HOSTS`: あなたの実際のドメインに変更
- `GF_SECURITY_ADMIN_PASSWORD`: デフォルトから変更

---

### Step 2-3: Docker Composeファイルを確認

```bash
# docker-compose.ymlを確認
cat docker-compose.yml
```

**既存の `docker-compose.yml` をそのまま使用**:

```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: rag_backend
    ports:
      - "8000:8000"
    volumes:
      - ./backend:/app
    env_file:
      - .env
    environment:
      - PYTHONUNBUFFERED=1
      - MLFLOW_TRACKING_URI=http://mlflow:5000
    networks:
      - rag_net
    restart: always  # ← 自動再起動を有効化

  grafana:
    image: grafana/grafana:10.4.2
    container_name: rag_grafana
    ports:
      - "3001:3000"
    volumes:
      - grafana_data:/var/lib/grafana
      - ./infra/grafana/provisioning:/etc/grafana/provisioning
    env_file:
      - .env
    environment:
      - GF_SECURITY_ADMIN_USER=admin
      - GF_SECURITY_ADMIN_PASSWORD=${GF_SECURITY_ADMIN_PASSWORD}
      - GF_SERVER_ROOT_URL=https://rag.example.com/grafana
    networks:
      - rag_net
    # ← restart: always は指定しない（必要時起動）

  mlflow:
    image: ghcr.io/mlflow/mlflow:v2.16.2
    container_name: rag_mlflow
    ports:
      - "5000:5000"
    volumes:
      - mlflow_data:/mlflow
    environment:
      - MLFLOW_BACKEND_STORE_URI=sqlite:////mlflow/mlflow.db
      - MLFLOW_ARTIFACT_ROOT=/mlflow/artifacts
    command: >
      mlflow server
      --host 0.0.0.0
      --port 5000
      --backend-store-uri sqlite:////mlflow/mlflow.db
      --default-artifact-root /mlflow/artifacts
    networks:
      - rag_net
    # ← restart: always は指定しない（必要時起動）

networks:
  rag_net:
    driver: bridge

volumes:
  grafana_data:
  mlflow_data:
```

---

### Step 2-4: Djangoのみ起動

```bash
# Djangoのみ起動（Grafana/MLflowは起動しない）
docker-compose up -d backend

# 起動確認
docker-compose ps

# 出力例:
# NAME                COMMAND                  SERVICE             STATUS              PORTS
# rag_backend         "python manage.py ru…"   backend             running             0.0.0.0:8000->8000/tcp

# メモリ確認
free -h

# 出力例:
#               total        used        free      shared  buff/cache   available
# Mem:          1.0Gi       300Mi       550Mi       1.0Mi       150Mi       650Mi
```

**✅ 確認ポイント**:
- Django Backendのみ起動している
- メモリ使用量: 300MB程度（空き 550MB以上）

---

### Step 2-5: Django動作確認

```bash
# Djangoにアクセス
curl http://localhost:8000/

# または別ターミナルから
curl http://34.168.123.45:8000/
```

**期待される応答**: Django APIの応答（200 OK）

---

### Step 2-6: Nginx設定

```bash
# Nginxをインストール
sudo apt-get update
sudo apt-get install -y nginx

# Nginx設定ファイルを作成
sudo nano /etc/nginx/sites-available/rag
```

**`/etc/nginx/sites-available/rag` の内容**:

```nginx
# HTTP → HTTPS リダイレクト
server {
    listen 80;
    server_name rag.example.com;
    
    # Let's EncryptのHTTP-01チャレンジ用（後で使用）
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
    # その他は全てHTTPSへリダイレクト
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS
server {
    listen 443 ssl http2;
    server_name rag.example.com;
    
    # SSL証明書（Cloudflare Originサーバー証明書を後で設定）
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    
    # Django Backend（ルート）
    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Grafana
    location /grafana/ {
        proxy_pass http://localhost:3001/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket対応（Grafanaのリアルタイム更新用）
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
    
    # MLflow
    location /mlflow/ {
        proxy_pass http://localhost:5000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

### Step 2-7: Nginx有効化（SSL証明書設定は後で）

```bash
# シンボリックリンクを作成
sudo ln -s /etc/nginx/sites-available/rag /etc/nginx/sites-enabled/

# デフォルト設定を無効化
sudo rm /etc/nginx/sites-enabled/default

# Nginx設定テスト（SSL証明書がないのでエラーが出るが無視）
sudo nginx -t

# Nginxを再起動（HTTPのみ有効）
sudo systemctl reload nginx
```

---

## Day 3: Cloudflare + ドメイン設定（30分）

### Step 3-1: Cloudflare DNSレコード追加

1. **Cloudflareダッシュボードにログイン**
2. 既存ドメイン（`example.com`）を選択
3. **DNS** → **Records** → **Add record**

#### 設定内容

| Type | Name | Content | Proxy status | TTL |
|------|------|---------|--------------|-----|
| A | rag | 34.168.123.45 | ✅ Proxied（オレンジ雲） | Auto |

**💡 ポイント**:
- **Proxy status**: 必ず "Proxied"（オレンジ雲）を選択
- これによりCloudflareのCDN、SSL、DDoS保護が有効化

---

### Step 3-2: Cloudflare SSL/TLS設定

1. **SSL/TLS** → **Overview**
2. **Encryption mode** を **Full (strict)** に設定

**なぜFull (strict)か？**:
- Cloudflare → GCP VM の通信も暗号化
- 最も安全な設定

---

### Step 3-3: Cloudflare Originサーバー証明書の発行

1. **SSL/TLS** → **Origin Server**
2. **Create Certificate** をクリック
3. 以下の設定で作成：
   - **Hostnames**: `rag.example.com`
   - **Expiration**: 15 years
   - **Key format**: PEM

4. 生成された証明書をコピー：
   - **Origin Certificate**: `cert.pem`
   - **Private Key**: `key.pem`

---

### Step 3-4: GCP VMにSSL証明書を配置

```bash
# SSHでVMにログイン
gcloud compute ssh rag-eval-vm --zone=us-west1-b

# SSL証明書ディレクトリを作成
sudo mkdir -p /etc/nginx/ssl

# cert.pemを作成
sudo nano /etc/nginx/ssl/cert.pem
# （Cloudflareでコピーした Origin Certificate を貼り付け）

# key.pemを作成
sudo nano /etc/nginx/ssl/key.pem
# （Cloudflareでコピーした Private Key を貼り付け）

# パーミッション設定
sudo chmod 600 /etc/nginx/ssl/*.pem
sudo chown root:root /etc/nginx/ssl/*.pem
```

---

### Step 3-5: Nginx再起動

```bash
# Nginx設定テスト
sudo nginx -t

# 出力例:
# nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
# nginx: configuration file /etc/nginx/nginx.conf test is successful

# Nginx再起動
sudo systemctl reload nginx

# Nginx状態確認
sudo systemctl status nginx
```

---

### Step 3-6: 動作確認

#### 1. HTTPアクセス（自動的にHTTPSへリダイレクト）

```bash
curl -I http://rag.example.com

# 期待される応答:
# HTTP/1.1 301 Moved Permanently
# Location: https://rag.example.com/
```

#### 2. HTTPSアクセス（Django API）

```bash
curl -I https://rag.example.com

# 期待される応答:
# HTTP/2 200
```

#### 3. ブラウザでアクセス

- https://rag.example.com （Django API）
- https://rag.example.com/grafana/ （まだ起動していないのでエラー）
- https://rag.example.com/mlflow/ （まだ起動していないのでエラー）

**✅ Django APIが動作していればOK！**

---

## Day 4: 動作確認 + モニタリング設定（1時間）

### Step 4-1: Grafana/MLflowを手動起動

```bash
# SSHでVMにログイン
gcloud compute ssh rag-eval-vm --zone=us-west1-b

# プロジェクトディレクトリに移動
cd ~/my-corporate-site

# Grafana/MLflowを起動
docker-compose up -d grafana mlflow

# 起動確認
docker-compose ps

# メモリ確認
free -h

# 出力例:
#               total        used        free      shared  buff/cache   available
# Mem:          1.0Gi       750Mi       150Mi       1.0Mi       100Mi       200Mi
```

**✅ 確認ポイント**:
- 3サービス全て起動している
- メモリ使用量: 750MB程度（空き 200MB以上）

---

### Step 4-2: Grafana/MLflow動作確認

#### Grafana

1. ブラウザで https://rag.example.com/grafana/ にアクセス
2. ログイン: `admin` / `.env`で設定したパスワード
3. ダッシュボードが表示されればOK

#### MLflow

1. ブラウザで https://rag.example.com/mlflow/ にアクセス
2. Experimentリストが表示されればOK

---

### Step 4-3: 評価を実行

```bash
# 評価を実行
docker exec rag_backend python /app/rag_api/management/commands/evaluate_final.py baseline v2.0

# Grafanaで結果確認
# ブラウザで https://rag.example.com/grafana/ にアクセス
```

**✅ 評価結果がGrafanaに表示されればOK！**

---

### Step 4-4: Grafana/MLflowを停止

```bash
# 評価終了後、Grafana/MLflowを停止
docker-compose stop grafana mlflow

# メモリ確認
free -h

# 出力例:
#               total        used        free      shared  buff/cache   available
# Mem:          1.0Gi       300Mi       550Mi       1.0Mi       150Mi       650Mi
```

**✅ Djangoのみ稼働、メモリ空き 550MB以上**

---

### Step 4-5: モニタリングスクリプトの設定

```bash
# モニタリングスクリプトを作成
nano ~/monitor.sh
```

**`~/monitor.sh` の内容**:

```bash
#!/bin/bash

# メモリ使用量をログに記録
echo "=== $(date) ===" >> ~/monitor.log
free -h >> ~/monitor.log
docker stats --no-stream >> ~/monitor.log
echo "" >> ~/monitor.log
```

```bash
# 実行権限を付与
chmod +x ~/monitor.sh

# cronに登録（1時間ごとに実行）
crontab -e

# 以下を追加
0 * * * * ~/monitor.sh
```

---

### Step 4-6: 自動起動スクリプトの作成

```bash
# Grafana/MLflow起動スクリプト
nano ~/start_eval.sh
```

**`~/start_eval.sh` の内容**:

```bash
#!/bin/bash

cd ~/my-corporate-site
docker-compose up -d grafana mlflow

echo "Grafana: https://rag.example.com/grafana/"
echo "MLflow: https://rag.example.com/mlflow/"
```

```bash
# Grafana/MLflow停止スクリプト
nano ~/stop_eval.sh
```

**`~/stop_eval.sh` の内容**:

```bash
#!/bin/bash

cd ~/my-corporate-site
docker-compose stop grafana mlflow

echo "Grafana/MLflow stopped."
free -h
```

```bash
# 実行権限を付与
chmod +x ~/start_eval.sh ~/stop_eval.sh
```

---

## ✅ デプロイ完了！

### 確認事項

- ✅ Django Backend: 常時稼働（https://rag.example.com/）
- ✅ Grafana: 必要時起動（https://rag.example.com/grafana/）
- ✅ MLflow: 必要時起動（https://rag.example.com/mlflow/）
- ✅ メモリ: 平常時 300MB、評価時 750MB
- ✅ コスト: $0/月（完全無料）

---

## 📝 運用マニュアル

### 評価を実施する場合

```bash
# 1. Grafana/MLflowを起動
~/start_eval.sh

# 2. 評価を実行
docker exec rag_backend python /app/rag_api/management/commands/evaluate_final.py baseline v2.0

# 3. Grafanaで結果確認
# https://rag.example.com/grafana/

# 4. 評価終了後、Grafana/MLflowを停止
~/stop_eval.sh
```

---

### 外部に見せる場合

```bash
# 1. Grafana/MLflowを起動
~/start_eval.sh

# 2. URLを共有
echo "Grafana: https://rag.example.com/grafana/"
echo "MLflow: https://rag.example.com/mlflow/"

# 3. デモ終了後、停止
~/stop_eval.sh
```

---

## 🚀 次のステップ

1. **最小実験の完了確認**
   - 1週間運用して、OOM再起動がないか確認
   - 転送量が1GB/月以内か確認

2. **CI/CD構築**（オプション）
   - GitHub Actionsでデプロイ自動化

3. **セキュリティ強化**
   - ファイアウォールルールの最適化
   - SSH鍵認証の強制

---

**デプロイお疲れ様でした！** 🎉

