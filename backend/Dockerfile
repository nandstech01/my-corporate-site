FROM python:3.11-slim

# 作業ディレクトリ
WORKDIR /app

# 依存関係インストール
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# アプリケーションコピー
COPY . .

# ポート公開
EXPOSE 8000

# Django開発サーバー起動
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]

