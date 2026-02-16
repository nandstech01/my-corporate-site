FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY blog_worker/ ./blog_worker/
RUN useradd -m -u 1001 worker && chown -R worker:worker /app
USER worker
ENTRYPOINT ["python", "-m", "blog_worker"]
