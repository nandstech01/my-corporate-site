# TASK-02: ベース画像の準備・アップロード

## 📌 概要

サムネイル生成のベースとなる3枚の画像を準備し、
システムで使用できるようにします。

## ✅ チェックリスト

- [ ] 3枚のベース画像を確認・取得
- [ ] Supabase Storageにアップロード
- [ ] データベースに参照画像として登録
- [ ] 画像のメタデータを設定

## 🖼️ ベース画像の要件

### 画像仕様
- **解像度**: 1920×1080 以上推奨（16:9）
- **フォーマット**: JPEG / PNG / WebP
- **ファイルサイズ**: 5MB以下
- **用途**: サムネイルのベース（人物部分を維持）

### 3パターンの画像
1. **パターンA**: （説明を追加）
2. **パターンB**: （説明を追加）
3. **パターンC**: （説明を追加）

## 💾 データベース設計

### 新規テーブル: `thumbnail_base_images`

```sql
CREATE TABLE IF NOT EXISTS thumbnail_base_images (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  pattern_type VARCHAR(50) NOT NULL, -- 'pattern_a', 'pattern_b', 'pattern_c'
  text_position JSON, -- テキスト配置位置 {"x": 0.5, "y": 0.2, "width": 0.8}
  color_scheme JSON, -- 推奨カラースキーム {"primary": "#fff", "secondary": "#000"}
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- サンプルデータ
INSERT INTO thumbnail_base_images (name, description, url, pattern_type, text_position, color_scheme) VALUES
('パターンA - メイン', '明るい背景の人物画像', 'URL_HERE', 'pattern_a', '{"x": 0.5, "y": 0.15, "width": 0.8}', '{"primary": "#FFFFFF", "secondary": "#000000"}'),
('パターンB - サブ', '技術的な背景の人物画像', 'URL_HERE', 'pattern_b', '{"x": 0.5, "y": 0.2, "width": 0.7}', '{"primary": "#FFFFFF", "secondary": "#333333"}'),
('パターンC - アクセント', 'カラフルな背景の人物画像', 'URL_HERE', 'pattern_c', '{"x": 0.5, "y": 0.15, "width": 0.85}', '{"primary": "#FFFFFF", "secondary": "#FF6B00"}');
```

## 📤 アップロード先

```
Supabase Storage
└── blog/
    └── thumbnail-bases/
        ├── pattern-a.jpg
        ├── pattern-b.jpg
        └── pattern-c.jpg
```

## 🎯 画像提供待ち事項

> **ユーザーへの確認事項:**
> 1. 3枚のベース画像のURLまたはファイルを共有してください
> 2. 各画像のテキスト配置位置の希望はありますか？
> 3. 各画像で使用する色の指定はありますか？

## 📝 完了条件

1. 3枚のベース画像がStorageにアップロードされている
2. `thumbnail_base_images` テーブルが作成されている
3. 各画像のメタデータが登録されている

## ⏭️ 次のタスク

→ [TASK-03: サムネイル生成APIの作成](./TASK-03-api-endpoint.md)

