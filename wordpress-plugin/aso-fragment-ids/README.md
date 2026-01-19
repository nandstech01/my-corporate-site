# ASO Fragment IDs (Stable) - WordPress Plugin

**Version**: 2.0.0  
**Phase**: 4.5  
**Status**: Production Ready ✅

---

## 📝 概要

ASO SaaSで生成されたFragment IDとJSON-LDを、WordPressサイトに自動適用するプラグインです。

### 主要機能

1. **見出しへのFragment ID自動付与**
   - H2/H3見出しに安定したFragment IDを自動生成
   - DOMパーサ使用（regex依存なし）
   - Fragment ID安定性保証（ハッシュ固定）

2. **JSON-LD自動注入**
   - ASO SaaSで生成したJSON-LDを `<head>` に注入
   - Schema.org 16.0+ 準拠
   - Rich Results Test対応

3. **管理画面統合**
   - JSON-LD入力用メタボックス
   - Fragment ID一覧表示
   - リセット機能

---

## 🚀 インストール

### 方法1: 手動インストール

1. このディレクトリ全体を `/wp-content/plugins/` にアップロード
2. WordPress管理画面 > プラグイン > 「ASO Fragment IDs」を有効化

### 方法2: ZIP アップロード

1. このディレクトリをZIP圧縮
2. WordPress管理画面 > プラグイン > 新規追加 > アップロード

---

## 📖 使用方法

### Step 1: プラグイン有効化

プラグインを有効化すると、自動的にH2/H3見出しにFragment IDが付与されます。

### Step 2: JSON-LD設定

1. 投稿編集画面を開く
2. 「ASO JSON-LD設定」メタボックスを探す
3. ASO SaaSで生成されたJSON-LDを貼り付け
4. 「更新」をクリック

### Step 3: 確認

- フロントエンドで見出しにid属性が付与されていることを確認
- ページのソースを表示し、`<head>` 内にJSON-LDが注入されていることを確認
- Rich Results Testで検証

---

## 🔧 Fragment ID仕様

### 生成ルール

**形式**: `{level}-{slug}-{hash}`

- **level**: 見出しレベル（h2 or h3）
- **slug**: 見出しテキストをサニタイズ（最大30文字）
- **hash**: 初回生成時の8文字ハッシュ（固定）

**例**: `h2-pricing-overview-a3f9c2d1`

### 安定性保証

- ハッシュは**初回生成時に固定**
- 見出しテキストを変更してもハッシュは変わらない
- 外部リンクの互換性を保護

### メタデータ

Fragment IDのハッシュは `_aso_fragment_hashes` メタキーに保存されます。

---

## 🛠 技術仕様

### DOMパーサ使用

- **PHP DOMDocument** を使用
- regex依存なし（安全性向上）
- UTF-8対応
- HTML5互換

### フィルター優先度

- `the_content`: 優先度 **999**（最後に実行）
- `wp_head`: 優先度 **5**（早めに実行）

### セキュリティ

- Nonce検証（メタボックス保存時）
- `sanitize_textarea_field` でサニタイズ
- JSON形式検証
- 権限チェック（`current_user_can`）

---

## 📋 動作要件

- **WordPress**: 5.0 以上
- **PHP**: 7.4 以上（8.0+ 推奨）
- **必須拡張**: `libxml`, `dom`

---

## 🐛 トラブルシューティング

### Fragment IDが生成されない

1. 記事を一度保存してください
2. H2/H3見出しが存在することを確認
3. 他のプラグインとの競合を確認（優先度999で実行）

### JSON-LDが表示されない

1. 単一投稿ページ（is_single）であることを確認
2. `_aso_jsonld` メタデータが保存されているか確認
3. ブラウザのデベロッパーツールで `<script type="application/ld+json">` を検索

### Fragment IDをリセットしたい

1. 投稿編集画面 > サイドバー >「ASO Fragment IDs」
2. 「Fragment IDをリセット」ボタンをクリック
3. 記事を保存

---

## 📚 関連リンク

- [Rich Results Test](https://search.google.com/test/rich-results)
- [Schema.org Validator](https://validator.schema.org/)
- [ASO SaaS Documentation](https://nands.tech/aso)

---

## 📄 ライセンス

GPL v2 or later

---

## 🔄 変更履歴

### Version 2.0.0 (2026-01-12)

- DOMパーサ実装（regex依存回避）
- Fragment ID安定性仕様確定（ハッシュ固定）
- JSON-LD注入機能追加
- 管理画面メタボックス実装
- Rich Results Test統合

---

**開発**: ASO SaaS  
**サポート**: https://nands.tech/aso/support

