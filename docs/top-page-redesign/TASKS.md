# 📋 TASKS - タスク管理

> **トップページリデザイン進捗トラッキング**

---

## 🎯 プロジェクト概要

| 項目 | 内容 |
|-----|------|
| プロジェクト名 | NANDS TECH トップページ完全リデザイン |
| 開始日 | 2025-12-12 |
| 目標完了日 | 2025-12-26（2週間） |
| ステータス | 🟡 設計フェーズ |

---

## 📊 進捗サマリー

```
Phase 1: 魂注入     [░░░░░░░░░░] 0%
Phase 2: 構造保持   [░░░░░░░░░░] 0%
Phase 3: 視覚強化   [░░░░░░░░░░] 0%
Phase 4: 最適化     [░░░░░░░░░░] 0%

全体進捗: 0%
```

---

## Phase 1: 魂注入（2週間目標）

### 🔴 未着手

- [ ] **TASK-001**: `app/components/portal/` ディレクトリ作成
  - 優先度: 高
  - 見積もり: 5分
  - 担当: -

- [ ] **TASK-002**: `TheGreatSwitch.tsx` 実装
  - 優先度: 最高 ⭐
  - 見積もり: 2時間
  - 依存: TASK-001
  - 詳細:
    - ModeContext作成
    - スイッチUIコンポーネント
    - Dynamic Island風アニメーション

- [ ] **TASK-003**: `HeroSection.tsx` 実装
  - 優先度: 最高 ⭐
  - 見積もり: 3時間
  - 依存: TASK-002
  - 詳細:
    - キャッチコピー配置
    - スイッチ統合
    - SEO用H1（sr-only）

- [ ] **TASK-004**: `ProblemSection.tsx` 実装
  - 優先度: 高
  - 見積もり: 2時間
  - 依存: TASK-002
  - 詳細:
    - 個人モードコンテンツ
    - 法人モードコンテンツ
    - AnimatePresence切り替え

- [ ] **TASK-005**: `SolutionBentoGrid.tsx` 実装
  - 優先度: 高
  - 見積もり: 3時間
  - 依存: TASK-002
  - 詳細:
    - Bento Gridレイアウト
    - 個人/法人コンテンツ
    - 監修者カード
    - 実績カード

- [ ] **TASK-006**: `PricingSection.tsx` 実装
  - 優先度: 高
  - 見積もり: 2時間
  - 依存: TASK-002
  - 詳細:
    - 個人向け価格表示（月1万円）
    - 法人向け助成金表示
    - CTAボタン

- [ ] **TASK-007**: `PhilosophySection.tsx` 実装
  - 優先度: 最高 ⭐
  - 見積もり: 2時間
  - 依存: なし
  - 詳細:
    - 原田賢治写真配置
    - マニフェストテキスト
    - Fragment ID: #philosophy

### 🟡 進行中

（なし）

### 🟢 完了

- [x] **TASK-000**: 設計ドキュメント作成
  - 完了日: 2025-12-12
  - 成果物:
    - README.md
    - 01-concept.md
    - 02-design-system.md
    - 03-sections.md
    - 04-components.md
    - 05-structured-data.md
    - 06-implementation.md
    - TASKS.md

---

## Phase 2: 構造保持（1週間目標）

### 🔴 未着手

- [ ] **TASK-008**: `ServicesBlueprint.tsx` 実装
  - 優先度: 最高 ⭐
  - 見積もり: 2時間
  - 詳細:
    - 23個のFragment ID保持
    - 折りたたみUI
    - AI検索エンジン対応

- [ ] **TASK-009**: JSON-LD更新
  - 優先度: 高
  - 見積もり: 1時間
  - 詳細:
    - Organization更新
    - WebPage hasPart追加
    - FAQPage更新
    - HowTo追加

- [ ] **TASK-010**: Fragment ID移行確認
  - 優先度: 高
  - 見積もり: 30分
  - 詳細:
    - fragment_vectorsテーブル確認
    - 新Fragment IDベクトル化
    - deeplink_analytics確認

---

## Phase 3: 視覚強化（1週間目標）

### 🔴 未着手

- [ ] **TASK-011**: `VectorLinkBackground.tsx` 実装
  - 優先度: 中
  - 見積もり: 4時間
  - 詳細:
    - Canvas APIでノード描画
    - 線の結合アニメーション
    - パフォーマンス最適化

- [ ] **TASK-012**: デザインシステム適用
  - 優先度: 中
  - 見積もり: 2時間
  - 詳細:
    - globals.css更新
    - tailwind.config.js更新
    - フォント設定

- [ ] **TASK-013**: レスポンシブ調整
  - 優先度: 高
  - 見積もり: 2時間
  - 詳細:
    - モバイル最適化
    - タブレット最適化
    - THE SWITCH モバイル対応

---

## Phase 4: 最適化（継続）

### 🔴 未着手

- [ ] **TASK-014**: `KnowledgeShowcase.tsx` 実装
  - 優先度: 中
  - 見積もり: 1時間
  - 詳細:
    - ブログ記事カード
    - 横スクロール

- [ ] **TASK-015**: パフォーマンス最適化
  - 優先度: 中
  - 見積もり: 2時間
  - 詳細:
    - 動的インポート
    - 画像最適化
    - Lighthouse確認

- [ ] **TASK-016**: アクセシビリティ対応
  - 優先度: 中
  - 見積もり: 1時間
  - 詳細:
    - ARIA属性
    - キーボード操作
    - スクリーンリーダー

- [ ] **TASK-017**: 本番デプロイ
  - 優先度: 高
  - 見積もり: 30分
  - 依存: 全タスク完了
  - 詳細:
    - Vercelデプロイ
    - 動作確認

---

## 📝 メモ・決定事項

### 2025-12-12

1. **コンセプト決定**: "Hybrid Architecture"（Apple × デジライズ）
2. **デザイン方針**: 深海グラデーション（漆黒より柔らかく）
3. **THE SWITCH**: iPhoneのDynamic Island風UI
4. **Fragment ID**: 23個を完全保持（ServicesBlueprint内）
5. **H1戦略**: セマンティック・サンドイッチ構造（sr-only）

### 要検討事項

- [ ] 原田賢治の写真撮影/加工
- [ ] LINE誘導後のあいさつメッセージ更新
- [ ] 助成金の具体的な数字確認

---

## 🔗 関連リンク

- [README.md](./README.md) - プロジェクト概要
- [01-concept.md](./01-concept.md) - コンセプト
- [02-design-system.md](./02-design-system.md) - デザインシステム
- [03-sections.md](./03-sections.md) - セクション仕様
- [04-components.md](./04-components.md) - コンポーネント設計
- [05-structured-data.md](./05-structured-data.md) - 構造化データ
- [06-implementation.md](./06-implementation.md) - 実装ガイド

---

**最終更新**: 2025-12-12
**次回レビュー**: 実装開始時

