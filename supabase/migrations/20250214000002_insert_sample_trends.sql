-- サンプルトレンドニュースを挿入（テスト用）

-- 1. 熊のニュース
INSERT INTO trend_rag (
  trend_title,
  trend_content,
  trend_url,
  trend_category,
  trend_source,
  is_active
) VALUES (
  '北海道でクマが小熊と町に出現、住民の食べ物を食べる',
  '北海道の山間部の町で、クマの親子が住宅街に現れ、住民が置いていた食べ物を食べる姿が目撃されました。専門家は「食べ物が不足しているため、町に降りてくる可能性がある」と指摘しています。',
  'https://example.com/news/bear',
  'general',
  'manual',
  TRUE
);

-- 2. 大谷翔平選手のニュース
INSERT INTO trend_rag (
  trend_title,
  trend_content,
  trend_url,
  trend_category,
  trend_source,
  is_active
) VALUES (
  '大谷翔平選手、今季初ホームラン！ファン歓喜',
  'メジャーリーグで活躍する大谷翔平選手が、今季初となるホームランを放ちました。ファンからは「待ってました！」と歓喜の声が上がっています。',
  'https://example.com/news/ohtani',
  'sports',
  'manual',
  TRUE
);

-- 3. 桜の開花ニュース
INSERT INTO trend_rag (
  trend_title,
  trend_content,
  trend_url,
  trend_category,
  trend_source,
  is_active
) VALUES (
  '東京で桜が開花、例年より1週間早く',
  '東京都内で桜の開花が確認されました。例年よりも1週間早い開花で、気象庁は「暖かい日が続いたため」と説明しています。',
  'https://example.com/news/sakura',
  'general',
  'manual',
  TRUE
);

-- 4. SNS炎上ニュース
INSERT INTO trend_rag (
  trend_title,
  trend_content,
  trend_url,
  trend_category,
  trend_source,
  is_active
) VALUES (
  'SNSで大炎上、著名人の発言が物議を醸す',
  'ある著名人のSNS投稿が炎上し、多くの批判コメントが寄せられています。投稿は削除されましたが、議論は続いています。',
  'https://example.com/news/sns',
  'general',
  'manual',
  TRUE
);

-- 5. AI関連ニュース
INSERT INTO trend_rag (
  trend_title,
  trend_content,
  trend_url,
  trend_category,
  trend_source,
  is_active
) VALUES (
  'AIが医療診断で人間を上回る精度を達成',
  '最新の研究で、AIによる医療画像診断が人間の専門医を上回る精度を達成したことが報告されました。専門家は「AIと人間の協働が重要」と指摘しています。',
  'https://example.com/news/ai-medical',
  'general',
  'manual',
  TRUE
);

-- コメント
COMMENT ON COLUMN trend_rag.trend_title IS 'トレンドニュースのタイトル';
COMMENT ON COLUMN trend_rag.trend_content IS 'トレンドニュースの本文（要約）';

