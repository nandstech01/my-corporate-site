# OIDC IDトークン取得テスト用Dockerfile
# 既存システムへの影響: なし（新規ファイル）

FROM node:20-slim

WORKDIR /app

# package.jsonとpackage-lock.jsonをコピー
COPY package*.json ./

# 依存関係インストール
RUN npm ci --only=production

# アプリケーションコードをコピー
COPY test-oidc.js ./

# 実行
CMD ["node", "test-oidc.js"]

