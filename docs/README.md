# NANDS Corporate Site - ドキュメントルート

このディレクトリには、NANDS コーポレートサイトの全機能に関するドキュメントが格納されています。

---

## 📂 ディレクトリ構成

### 🐍 Backend Python (Django RAG / ML評価)
**ディレクトリ**: `backend-python/`

Django RAG API、ML評価システム、MLflow統合に関するすべてのドキュメント。

- Phase 1: Django RAG Foundation（完了）
- Phase 2: ML評価基盤構築（完了）
- Phase 3: ML評価システム拡張（進行中）
- Phase 4: MLflow統合（計画中）

**詳細**: [backend-python/INDEX.md](./backend-python/INDEX.md)

---

### 🎨 Frontend Features (Next.js)

#### Top Page Redesign
**ディレクトリ**: `top-page-redesign/`

トップページのデザインリニューアル。

**詳細**: [top-page-redesign/README.md](./top-page-redesign/README.md)

---

#### Hero Slider Implementation
**ファイル**: `hero-slider-implementation.md`

ヒーロースライダーの実装ドキュメント。

---

#### Thumbnail AI Generation
**ディレクトリ**: `thumbnail-ai-generation/`

AIを使用したサムネイル自動生成機能。

**詳細**: [thumbnail-ai-generation/README.md](./thumbnail-ai-generation/README.md)

---

#### YouTube Short Embed
**ディレクトリ**: `youtube-short-embed/`

YouTube Shorts の埋め込み機能。

**詳細**: [youtube-short-embed/README.md](./youtube-short-embed/README.md)

---

### 🔗 Vector Link & Entity Management

#### Vector Link Reconstruction 2025
**ディレクトリ**: `vector-link-reconstruction-2025/`

Fragment ID設計とベクトルリンクの再構築。

**詳細**: [vector-link-reconstruction-2025/README.md](./vector-link-reconstruction-2025/README.md)

---

#### Re-Vectorization
**ディレクトリ**: `re-vectorization/`

ベクトルデータの再生成プロセス。

**詳細**: [re-vectorization/README.md](./re-vectorization/README.md)

---

### 📝 Content Generation

#### Hybrid Article Generator
**ディレクトリ**: `hybrid-article-generator/`

AI + スクレイピングを組み合わせたハイブリッド記事生成システム。

**詳細**: [hybrid-article-generator/README.md](./hybrid-article-generator/README.md)

---

### 🎥 Video Management

#### Video Job System
**ディレクトリ**: `video-job/`

YouTube動画のメタデータ収集・管理システム。

**詳細**: [video-job/README.md](./video-job/README.md)

---

### 🏗️ Architect Mode

#### Architect Mode Implementation
**ファイル**: `ARCHITECT_MODE_IMPLEMENTATION.md`

AIアーキテクトモードの実装ドキュメント。

---

#### Architect Short v2
**ディレクトリ**: `architect-short-v2/`

Architect Short v2 の実装詳細。

**詳細**: [architect-short-v2/README.md](./architect-short-v2/README.md)

---

### 📊 Data & Research

#### AI Architect Market Research
**ファイル**: `AI_ARCHITECT_MARKET_RESEARCH.md`

AIアーキテクト市場調査レポート。

---

#### Kenji Thought Data Collection
**ファイル**: `KENJI_THOUGHT_DATA_COLLECTION.md`

Kenjiの思考データ収集に関するドキュメント。

---

#### Kenji Implementation Experience
**ファイル**: `KENJI_IMPLEMENTATION_EXPERIENCE.md`

Kenjiの実装経験に関するドキュメント。

---

### 🤖 GPT-5.2 Implementation
**ファイル**: `GPT-5.2_IMPLEMENTATION.md`

GPT-5.2 実装ガイド。

---

### 📋 Project Management

#### Project Tree Structure
**ファイル**: `PROJECT_TREE_STRUCTURE.md`

プロジェクトのディレクトリ構造。

---

## 🚀 クイックリンク

### Django RAG / ML評価
- [Backend Python ドキュメント](./backend-python/INDEX.md)
- [Phase 3 Week 1 作業ログ](./backend-python/phase-3-ml-evaluation-expansion/WEEK1_WORK_LOG.md)
- [タスク管理サマリー](./backend-python/TASK_MANAGEMENT_SUMMARY.md)

### フロントエンド機能
- [Top Page Redesign](./top-page-redesign/README.md)
- [Thumbnail AI Generation](./thumbnail-ai-generation/README.md)
- [YouTube Short Embed](./youtube-short-embed/README.md)

### データ管理
- [Vector Link Reconstruction](./vector-link-reconstruction-2025/README.md)
- [Re-Vectorization](./re-vectorization/README.md)
- [Hybrid Article Generator](./hybrid-article-generator/README.md)

---

## 📝 ドキュメント管理方針

### ディレクトリ整理

各機能・プロジェクトごとにディレクトリを分けて管理：
- **Backend Python系**: `backend-python/`
- **Frontend機能系**: 各機能ごとのディレクトリ
- **データ管理系**: vector-link, re-vectorization 等
- **コンテンツ生成系**: hybrid-article-generator 等

### ドキュメント更新ルール

1. **作業ログ**: 詳細な手順を `WORK_LOG.md` に記載
2. **進捗レポート**: 定期的に `PROGRESS_REPORT_YYYYMMDD.md` 作成
3. **完了報告**: Phase/機能完了時に `COMPLETION_REPORT.md` 作成
4. **README更新**: 構造変更時は必ず README を更新

---

## 🔍 ドキュメント検索

### 機能別検索

- **Django RAG**: `backend-python/`
- **ML評価**: `backend-python/phase-2-*`, `backend-python/phase-3-*`
- **Grafana**: `backend-python/phase-1-*/GRAFANA*`
- **Fragment ID**: `vector-link-reconstruction-2025/`
- **記事生成**: `hybrid-article-generator/`
- **動画管理**: `video-job/`

### ステータス別検索

- **完了**: Phase 1, Phase 2
- **進行中**: Phase 3 Week 1
- **計画中**: Phase 4

---

**最終更新**: 2025-12-29  
**管理者**: NANDS 開発チーム
