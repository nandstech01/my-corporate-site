# データベーススクリプト

**目的**: データベース関連の手動スクリプトと履歴保存

---

## 📋 ファイル一覧

### 1. migrations_manual.sql
**目的**: 手動マイグレーションSQL（Phase 2/3で使用）

**内容**:
- `dataset_version` フィールド追加（Phase 2）
- `run_id` フィールド追加（Phase 3）
- インデックス追加

**使用方法**:
```bash
# 通常はDjangoのmigrationを使用するため、このファイルは参考用
# 必要に応じて、psqlコマンドで実行
psql -U postgres -d your_database -f migrations_manual.sql
```

**注意**: 
- Django migrationsが推奨されます（`python manage.py migrate`）
- このファイルは履歴として保存されています

---

## 📚 関連ドキュメント

- **Django Migrations**: `backend/rag_api/migrations/`
- **Phase 2完了報告**: `docs/backend-python/phase-2-ml-evaluation-foundation/README.md`
- **Phase 3完了報告**: `docs/backend-python/phase-3-ml-evaluation-expansion/README.md`

---

**作成日**: 2026年1月2日  
**ステータス**: 参考資料（履歴保存）

