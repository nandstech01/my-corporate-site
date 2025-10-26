# Bingインデックス回復チェックリスト
**作成日: 2025年1月31日**

## 🎯 緊急対応チェックリスト

### ✅ 実施済み確認
- [x] IndexNow API実装完了
- [x] キーファイル配置完了 (`b247e7b751dc4d84164c134151ee0814.txt`)
- [x] robots.txt最適化完了
- [x] サイトマップ動的生成完了
- [x] IndexNow一括送信成功（94個のURL、2025年1月31日）

---

## 🔍 今すぐ確認すべきこと

### 1. Bing Webmaster Tools登録状態の確認
https://www.bing.com/webmasters/

#### 確認項目
- [ ] サイト（nands.tech）が登録されているか？
- [ ] サイトの所有権確認が完了しているか？
- [ ] サイトマップが送信されているか？

#### 未登録の場合の対処
1. Bing Webmaster Toolsにアクセス
2. 「サイトを追加」で `https://nands.tech` を登録
3. 所有権確認方法を選択：
   - **推奨**: XMLファイル方式
   - または: HTMLタグ方式
   - または: DNS（TXTレコード）方式

### 2. サイトマップの手動送信
IndexNowだけでは不十分な可能性があります。

#### 手順
1. Bing Webmaster Tools > サイトマップ
2. 以下のURLを送信：
   ```
   https://nands.tech/sitemap.xml
   ```
3. 送信状態を確認：
   - 送信済み: ✅
   - 処理中: ⏳ 待機
   - エラー: ❌ エラー内容を確認

### 3. URL検査ツールで主要ページを手動リクエスト

#### 最優先ページ（必須）
- [ ] `https://nands.tech/` （トップページ）
- [ ] `https://nands.tech/corporate` （法人向け）
- [ ] `https://nands.tech/ai-site` （AIサイト）
- [ ] `https://nands.tech/system-development` （システム開発）
- [ ] `https://nands.tech/aio-seo` （AIO対策）

#### 手順
1. Bing Webmaster Tools > URL検査
2. URLを入力
3. 「インデックス作成をリクエスト」をクリック
4. 各URLごとに実施

### 4. Bing検索で現在のインデックス状況を確認

#### 検索クエリ
```
site:nands.tech
```

#### 確認項目
- インデックスされているページ数: ____ ページ
- 最新の更新日: ____
- 主要ページが表示されるか: Yes / No

---

## 🚨 Bingがインデックスしない一般的な理由

### 理由1: Webmaster Toolsに未登録
**対策**: 上記「1. Bing Webmaster Tools登録状態の確認」を実施

### 理由2: robots.txtまたはメタタグでブロック
**確認済み**: ✅ robots.txtは正常（Allow: /）

### 理由3: サーバーレスポンスエラー
**確認方法**:
```bash
curl -I https://nands.tech
```
**期待値**: `HTTP/2 200`

### 理由4: サイトが新しすぎる（クロールバジェット不足）
**対策**: 
- IndexNowを週1回実行（自動化推奨）
- 主要ページを手動リクエスト
- 外部リンク獲得（被リンク戦略）

### 理由5: コンテンツ品質の問題
**確認**: Bing Webmaster Toolsの「SEOレポート」を確認

### 理由6: ペナルティ
**確認**: Bing Webmaster Toolsの「セキュリティとマニュアル アクション」を確認

---

## 🔄 週次メンテナンスタスク

### 毎週月曜日に実施
1. [ ] IndexNow再送信
   ```bash
   curl https://nands.tech/api/indexnow/submit-all
   ```

2. [ ] Bing検索でインデックス状況確認
   ```
   site:nands.tech
   ```

3. [ ] Bing Webmaster Toolsでクロール統計確認
   - クロール数: ____
   - エラー数: ____
   - インデックス数: ____

4. [ ] 新規ページがあれば個別にIndexNow送信
   ```bash
   curl "https://nands.tech/api/indexnow?url=https://nands.tech/posts/new-post"
   ```

---

## 📊 目標と進捗

### 短期目標（2週間）
- [ ] Bing Webmaster Tools登録完了
- [ ] サイトマップ送信完了
- [ ] 主要5ページのインデックス完了
- [ ] `site:nands.tech` で10ページ以上表示

### 中期目標（1ヶ月）
- [ ] 50ページ以上インデックス
- [ ] Bing経由の訪問者: 月10人以上
- [ ] クロールエラーゼロ

### 長期目標（3ヶ月）
- [ ] 90ページ以上インデックス（全ページの95%以上）
- [ ] Bing経由の訪問者: 月50人以上
- [ ] Bing検索での主要キーワードランクイン

---

## 🛠️ トラブルシューティング

### Q1: IndexNowを送信したのにインデックスされない
**A**: IndexNowは「通知」のみ。実際のインデックスはBingの判断。
- Webmaster Toolsでの手動リクエストを併用
- サイトマップを送信
- 1-2週間待つ

### Q2: Webmaster Toolsに登録できない
**A**: 所有権確認方法を変更：
- XMLファイル → HTMLタグ → DNS

### Q3: サイトマップエラーが出る
**A**: サイトマップの内容確認：
```bash
curl https://nands.tech/sitemap.xml | head -50
```

### Q4: 一部のページだけインデックスされない
**A**: 
- URL検査で個別リクエスト
- robots.txtで該当ページがDisallowになっていないか確認
- noindexメタタグがないか確認

---

## 📝 実施記録

| 日付 | 実施内容 | 結果 | 備考 |
|------|---------|------|------|
| 2025/01/10 | IndexNow初回実装 | ✅ 成功 | 110個のURL通知 |
| 2025/01/31 | IndexNow再送信 | ✅ 成功 | 94個のURL通知 |
| ____ | Webmaster Tools登録 | ⏳ 未実施 | 要確認 |
| ____ | サイトマップ送信 | ⏳ 未実施 | 要確認 |

---

## 🎯 次のアクション（優先度順）

### 優先度: 🔴 最高（今日中に実施）
1. [ ] Bing Webmaster Toolsでサイト登録状況を確認
2. [ ] 未登録の場合は至急登録・所有権確認
3. [ ] サイトマップを手動送信
4. [ ] 主要5ページを手動でインデックスリクエスト

### 優先度: 🟡 高（1週間以内）
5. [ ] Bing検索で `site:nands.tech` の結果を確認
6. [ ] クロールエラーがないか確認
7. [ ] SEOレポートを確認
8. [ ] 被リンク戦略の検討

### 優先度: 🟢 中（2週間以内）
9. [ ] 週次IndexNow自動化（Vercel Cron）
10. [ ] アナリティクス設定（Bing経由トラフィック追跡）
11. [ ] llms.txt最適化（ChatGPT Search対応）

---

## 📚 参考リンク

- **Bing Webmaster Tools**: https://www.bing.com/webmasters/
- **IndexNow公式**: https://www.indexnow.org/
- **Bing SEOガイドライン**: https://www.bing.com/webmasters/help/webmasters-guidelines-30fba23a
- **Bing サイトマップガイド**: https://www.bing.com/webmasters/help/sitemaps-3b5cf6ed

---

## ✅ 完了条件

このチェックリストは以下の条件を満たした時点で完了とします：

1. Bing検索で `site:nands.tech` が50ページ以上表示される
2. 主要サービスページ（10ページ）が全てインデックスされている
3. Bing経由の月間訪問者が10人以上
4. クロールエラーがゼロ

---

**最終更新**: 2025年1月31日  
**次回レビュー**: 2025年2月7日（1週間後）

