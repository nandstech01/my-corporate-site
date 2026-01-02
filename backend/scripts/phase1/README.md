# Phase 1 検証スクリプト

**Phase**: Phase 1 - Django RAG Foundation  
**期間**: 2025年12月  
**目的**: Django RAG基盤構築と Embedding統一検証

---

## 📋 スクリプト一覧

### 1. verify_embedding_model.py
**目的**: DB保存ベクトルが text-embedding-3-large (1536d) で生成されたか検証

**実行方法**:
```bash
cd /Users/nands/my-corporate-site/backend
python verify_embedding_model.py
```

**検証内容**:
- 元テキストを再埋め込み
- DB保存ベクトルとのcosine similarityを測定
- 平均0.95+ なら統一確定

**結果**: ✅ Embedding統一確認済み（実験0）

---

### 2. test_api.sh
**目的**: RAG API の手動テスト

**実行方法**:
```bash
cd /Users/nands/my-corporate-site/backend
bash test_api.sh
```

**テスト内容**:
1. ヘルスチェック
2. RAGデータ統計
3. ハイブリッド検索（Fragment）
4. ハイブリッド検索（Company）
5. マルチソース検索（Fragment + Company）

---

## 📚 関連ドキュメント

- **Phase 1完了報告**: `docs/backend-python/phase-1-django-rag-foundation/PHASE1_COMPLETION_REPORT.md`
- **Embedding統一検証**: `docs/backend-python/phase-1-django-rag-foundation/EMBEDDING_VERIFICATION_REPORT.md`

---

**作成日**: 2026年1月2日  
**ステータス**: ✅ Phase 1完了（アーカイブ）

