# 🎨 AIサムネイル生成機能 実装ガイド

## 📌 概要

このドキュメントは、ナノバナナプロ（Gemini 3 Pro Image Preview）を使用した
AIサムネイル生成機能の実装タスクをまとめたものです。

## 🎯 実装する機能

### 機能1: 記事編集画面でのAIサムネイル生成
- 3枚のベース画像から選択
- 記事タイトル・内容を分析
- AIでサムネイルを生成
- Supabase Storageに保存

### 機能2: H2見出しから図解画像生成 ✅
- 記事編集画面でH2セクションを選択
- 各H2の内容を理解してAIが図解を生成
- 生成結果をMarkdownにコピー可能

## 📂 タスク一覧

| No | タスク | ファイル | ステータス |
|----|--------|----------|------------|
| 1 | 環境構築・パッケージ設定 | [TASK-01-setup.md](./TASK-01-setup.md) | ✅ 完了 |
| 2 | ベース画像の準備・アップロード | [TASK-02-base-images.md](./TASK-02-base-images.md) | ✅ 完了 |
| 3 | サムネイル生成APIの作成 | [TASK-03-api-endpoint.md](./TASK-03-api-endpoint.md) | ✅ 完了 |
| 4 | 記事編集画面UIの実装 | [TASK-04-edit-page-ui.md](./TASK-04-edit-page-ui.md) | ✅ 完了 |
| 5 | テスト・動作確認 | [TASK-05-testing.md](./TASK-05-testing.md) | ✅ 完了 |

## ⚠️ 重要な制約事項

### 顔の一貫性について
- Gemini 3 Pro Image Previewは**参照画像の顔を維持することが困難**
- **推奨アプローチ**: ベース画像をそのまま使用し、テキストのみAI生成して合成

### 既存機能への影響
- ✅ 既存の記事生成システム (`generate-rag-blog`) には一切触れない
- ✅ 既存のベクトル化・構造化データには影響なし
- ✅ 新規API・コンポーネントのみ追加

## 🔧 技術スタック

- **AI画像生成**: Gemini 3 Pro Image Preview (`@google/generative-ai`)
- **ストレージ**: Supabase Storage (`blog` バケット)
- **フロントエンド**: React (Next.js 14)
- **画像合成**: Canvas API / Sharp（オプション）

## 📅 進行状況

- **開始日**: 2025/12/09
- **現在のフェーズ**: 計画・設計
- **次のアクション**: TASK-01 環境構築

---

## 🔗 関連ファイル

- 記事編集画面: `app/admin/posts/[slug]/edit/page.tsx`
- 画像アップロードAPI: `app/api/upload-image/route.ts`
- サムネイルストック管理: `app/admin/content-generation/components/ThumbnailStockManager.tsx`

