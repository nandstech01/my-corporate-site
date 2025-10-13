-- 話題性のある一般ニュースを追加（20件）

-- 1. 生成AI関連
INSERT INTO trend_rag (trend_title, trend_content, trend_url, trend_category, trend_source, is_active)
VALUES (
  'ChatGPT-5リリース、性能が大幅向上',
  'OpenAIがChatGPT-5をリリースしました。従来モデルと比較して推論能力が大幅に向上し、専門家からは「革命的」と評価されています。',
  'https://example.com/news/chatgpt5',
  'general',
  'manual',
  TRUE
);

-- 2. 働き方改革
INSERT INTO trend_rag (trend_title, trend_content, trend_url, trend_category, trend_source, is_active)
VALUES (
  '週休3日制を導入する企業が急増',
  '大手企業を中心に週休3日制を導入する動きが加速しています。労働生産性の向上と従業員の満足度向上が目的とされています。',
  'https://example.com/news/4day-week',
  'general',
  'manual',
  TRUE
);

-- 3. 教育
INSERT INTO trend_rag (trend_title, trend_content, trend_url, trend_category, trend_source, is_active)
VALUES (
  '小学校でプログラミング必修化が本格化',
  '全国の小学校でプログラミング教育が本格化しています。AIリテラシーを育てる取り組みとして注目されています。',
  'https://example.com/news/programming-education',
  'general',
  'manual',
  TRUE
);

-- 4. 環境問題
INSERT INTO trend_rag (trend_title, trend_content, trend_url, trend_category, trend_source, is_active)
VALUES (
  '記録的な猛暑、気候変動の影響が顕著に',
  '今年の夏は記録的な猛暑となり、気候変動の影響が顕著になっています。専門家は「適応策が急務」と警鐘を鳴らしています。',
  'https://example.com/news/climate-change',
  'general',
  'manual',
  TRUE
);

-- 5. 交通
INSERT INTO trend_rag (trend_title, trend_content, trend_url, trend_category, trend_source, is_active)
VALUES (
  '自動運転タクシーが都内で試験運用開始',
  '東京都内で自動運転タクシーの試験運用が始まりました。2026年の本格導入を目指しています。',
  'https://example.com/news/autonomous-taxi',
  'general',
  'manual',
  TRUE
);

-- 6. エンタメ
INSERT INTO trend_rag (trend_title, trend_content, trend_url, trend_category, trend_source, is_active)
VALUES (
  '話題のアニメ映画が興行収入100億円突破',
  '今年公開されたアニメ映画が興行収入100億円を突破しました。SNSでも大きな話題となっています。',
  'https://example.com/news/anime-movie',
  'entertainment',
  'manual',
  TRUE
);

-- 7. スポーツ
INSERT INTO trend_rag (trend_title, trend_content, trend_url, trend_category, trend_source, is_active)
VALUES (
  '日本代表が歴史的勝利、ワールドカップ出場決定',
  'サッカー日本代表が強豪国を破り、ワールドカップ出場を決めました。国中が歓喜に沸いています。',
  'https://example.com/news/world-cup',
  'sports',
  'manual',
  TRUE
);

-- 8. 経済
INSERT INTO trend_rag (trend_title, trend_content, trend_url, trend_category, trend_source, is_active)
VALUES (
  '日経平均株価が史上最高値を更新',
  '日経平均株価が史上最高値を更新しました。円安と企業業績の好調が背景にあります。',
  'https://example.com/news/nikkei-high',
  'general',
  'manual',
  TRUE
);

-- 9. 健康
INSERT INTO trend_rag (trend_title, trend_content, trend_url, trend_category, trend_source, is_active)
VALUES (
  'インフルエンザが例年より早く流行、予防接種呼びかけ',
  '今年はインフルエンザが例年より早く流行しています。厚生労働省は早めの予防接種を呼びかけています。',
  'https://example.com/news/flu',
  'general',
  'manual',
  TRUE
);

-- 10. テクノロジー
INSERT INTO trend_rag (trend_title, trend_content, trend_url, trend_category, trend_source, is_active)
VALUES (
  'iPhoneの新モデル発表、AI機能が大幅強化',
  'Appleが新型iPhoneを発表しました。AI機能が大幅に強化され、音声アシスタントの性能が向上しています。',
  'https://example.com/news/iphone',
  'general',
  'manual',
  TRUE
);

-- 11. 社会問題
INSERT INTO trend_rag (trend_title, trend_content, trend_url, trend_category, trend_source, is_active)
VALUES (
  '子育て支援策が拡充、育児休業給付金が引き上げ',
  '政府が子育て支援策を拡充し、育児休業給付金が引き上げられました。少子化対策の一環として期待されています。',
  'https://example.com/news/childcare-support',
  'general',
  'manual',
  TRUE
);

-- 12. 食
INSERT INTO trend_rag (trend_title, trend_content, trend_url, trend_category, trend_source, is_active)
VALUES (
  '代替肉市場が急成長、環境負荷低減に期待',
  '植物由来の代替肉市場が急成長しています。環境負荷低減と健康志向の高まりが背景にあります。',
  'https://example.com/news/alternative-meat',
  'general',
  'manual',
  TRUE
);

-- 13. 宇宙
INSERT INTO trend_rag (trend_title, trend_content, trend_url, trend_category, trend_source, is_active)
VALUES (
  '日本の月面探査機が打ち上げ成功',
  'JAXAの月面探査機が打ち上げに成功しました。2025年の月面着陸を目指しています。',
  'https://example.com/news/moon-mission',
  'general',
  'manual',
  TRUE
);

-- 14. エネルギー
INSERT INTO trend_rag (trend_title, trend_content, trend_url, trend_category, trend_source, is_active)
VALUES (
  '太陽光発電の普及が加速、家庭用設置が急増',
  '太陽光発電の普及が加速しています。補助金制度の拡充により、家庭用設置が急増しています。',
  'https://example.com/news/solar-power',
  'general',
  'manual',
  TRUE
);

-- 15. 観光
INSERT INTO trend_rag (trend_title, trend_content, trend_url, trend_category, trend_source, is_active)
VALUES (
  '訪日外国人観光客が過去最高を記録',
  '訪日外国人観光客数が過去最高を記録しました。円安と入国制限緩和が追い風となっています。',
  'https://example.com/news/tourism',
  'general',
  'manual',
  TRUE
);

-- 16. セキュリティ
INSERT INTO trend_rag (trend_title, trend_content, trend_url, trend_category, trend_source, is_active)
VALUES (
  'サイバー攻撃が急増、企業のセキュリティ対策が課題',
  'サイバー攻撃が急増しており、企業のセキュリティ対策が課題となっています。ランサムウェア被害が深刻化しています。',
  'https://example.com/news/cyber-attack',
  'general',
  'manual',
  TRUE
);

-- 17. 災害
INSERT INTO trend_rag (trend_title, trend_content, trend_url, trend_category, trend_source, is_active)
VALUES (
  '大規模な地震に備える防災訓練、全国で実施',
  '全国で大規模な防災訓練が実施されました。南海トラフ地震に備える動きが加速しています。',
  'https://example.com/news/disaster-drill',
  'general',
  'manual',
  TRUE
);

-- 18. 交通渋滞
INSERT INTO trend_rag (trend_title, trend_content, trend_url, trend_category, trend_source, is_active)
VALUES (
  'GW渋滞予測、過去最長50kmの渋滞も',
  'ゴールデンウィークの渋滞予測が発表されました。高速道路では最長50kmの渋滞が予想されています。',
  'https://example.com/news/traffic-jam',
  'general',
  'manual',
  TRUE
);

-- 19. ペット
INSERT INTO trend_rag (trend_title, trend_content, trend_url, trend_category, trend_source, is_active)
VALUES (
  'ペット同伴可の施設が増加、ペット経済圏が拡大',
  'ペット同伴可の施設が増加しています。ペット経済圏の拡大が注目されています。',
  'https://example.com/news/pet-economy',
  'general',
  'manual',
  TRUE
);

-- 20. リモートワーク
INSERT INTO trend_rag (trend_title, trend_content, trend_url, trend_category, trend_source, is_active)
VALUES (
  'リモートワーク定着、地方移住が増加傾向',
  'リモートワークの定着により、地方移住が増加傾向にあります。都市部から地方への人口流出が加速しています。',
  'https://example.com/news/remote-work',
  'general',
  'manual',
  TRUE
);

