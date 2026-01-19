# ============================================
# AI Search Optimizer Cloud Run Jobs - Production Dockerfile
# ============================================
# 作成日: 2025-01-10
# 目的: 本番環境用Cloud Run Jobsコンテナイメージ
# 既存システムへの影響: なし（新規ファイル）

# ベースイメージ: Node.js 20 LTS (slim)
FROM node:20-slim

# 作業ディレクトリ
WORKDIR /app

# package.jsonとpackage-lock.jsonをコピー
COPY package*.json ./

# 依存関係インストール（本番用のみ）
RUN npm ci --only=production && \
    npm cache clean --force

# アプリケーションコードをコピー
COPY index.js ./
COPY jobs ./jobs

# セキュリティ: 非rootユーザーで実行
RUN useradd -m -u 1001 jobuser && \
    chown -R jobuser:jobuser /app
USER jobuser

# ヘルスチェック用（オプション）
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "console.log('healthy')" || exit 1

# 環境変数（デフォルト値、Cloud Runで上書き可能）
ENV NODE_ENV=production
ENV JOB_TYPE=cleanup-audit-logs

# エントリーポイント
CMD ["node", "index.js"]

