-- ========================================
-- Viral Hook Patterns 初期データ投入
-- ========================================
-- @created 2025-12-12
-- ========================================

INSERT INTO public.viral_hook_patterns (pattern_id, name, type, template, variables, effectiveness_score, target_audience, description, example, source, use_cases)
VALUES
  -- Shock型
  ('shock-mrbeast-challenge', 'MrBeast Challenge型', 'shock', '{subject}に{amount}{unit}使ったら{unexpected_result}になった', ARRAY['subject', 'amount', 'unit', 'unexpected_result'], 0.95, 'general', '巨額投資や極端な挑戦で視聴者を釘付けにする', 'AIに300万円使ったら人生が変わった', 'MrBeast', ARRAY['ビジネス投資', 'ツール導入', 'サービス利用']),
  
  ('shock-disaster-averted', '破滅回避型', 'shock', '{action}しなかったら{disaster}するところだった', ARRAY['action', 'disaster'], 0.90, 'general', '危機回避ストーリーで共感を得る', 'この設定をしなかったら全データが消えるところだった', 'Tech TikTok', ARRAY['セキュリティ', 'バックアップ', '設定ミス']),
  
  -- Transformation型
  ('transformation-before-after', 'Before/After型', 'transformation', '{timeframe}前の{subject}と今の{subject}が別人すぎる', ARRAY['timeframe', 'subject'], 0.92, 'all', '劇的な変化を見せて希望を与える', '3ヶ月前のホームページと今のホームページが別物すぎる', 'Transformation TikTok', ARRAY['デザイン改善', 'パフォーマンス改善', 'ビジネス成長']),
  
  ('transformation-nobody-everybody', '無名→有名型', 'transformation', '{timeframe}で{nobody}が{somebody}になった方法', ARRAY['timeframe', 'nobody', 'somebody'], 0.88, 'general', '成功ストーリーで希望を与える', '6ヶ月で無名の町工場が予約3ヶ月待ちになった方法', 'Success Stories', ARRAY['ビジネス成長', 'ブランディング', 'マーケティング']),
  
  -- POV型
  ('pov-insider', 'インサイダー視点型', 'pov', '{profession}の僕が{situation}見た時の反応', ARRAY['profession', 'situation'], 0.85, 'all', '専門家の視点で信頼性を高める', 'AIエンジニアの僕がこのホームページ見た時の反応', 'POV TikTok', ARRAY['専門家レビュー', '業界あるある', 'リアクション']),
  
  ('pov-role-reversal', '立場逆転型', 'pov', 'もし{role_a}が{role_b}だったら{situation}', ARRAY['role_a', 'role_b', 'situation'], 0.82, 'general', '立場を逆転させて面白さを出す', 'もしAIがホームページ制作会社を選ぶとしたら絶対こうする', 'Comedy TikTok', ARRAY['比較', 'ユーモア', '視点転換']),
  
  -- Curiosity型
  ('curiosity-secret', '秘密暴露型', 'curiosity', '{industry}が絶対に教えたくない{secret}', ARRAY['industry', 'secret'], 0.93, 'all', '業界の裏側を見せて興味を引く', 'ホームページ制作会社が絶対に教えたくない真実', 'Exposé Content', ARRAY['業界知識', '裏側公開', '暴露系']),
  
  ('curiosity-why-nobody', 'なぜ誰も〇〇しない型', 'curiosity', 'なぜ誰も{action}しないのか？{reason}だから。', ARRAY['action', 'reason'], 0.87, 'all', '常識を疑問視して注目を集める', 'なぜ誰もAIでホームページ作らないのか？知らないだけだから。', 'Provocative Content', ARRAY['啓蒙', '常識破壊', '問題提起']),
  
  -- Contradiction型
  ('contradiction-opposite', '真逆の真実型', 'contradiction', '{common_belief}は嘘。本当は{truth}。', ARRAY['common_belief', 'truth'], 0.91, 'all', '常識を覆して注目を集める', '高いホームページが良いは嘘。本当はAI活用が9割。', 'Myth Busting', ARRAY['常識破壊', '誤解解消', '教育']),
  
  ('contradiction-counterintuitive', '逆説的成功型', 'contradiction', '{action}するほど{opposite_result}になる理由', ARRAY['action', 'opposite_result'], 0.86, 'developer', '直感に反する真実で興味を引く', 'コード書くほど遅くなる理由', 'Paradox Content', ARRAY['技術解説', 'ベストプラクティス', 'アンチパターン']),
  
  -- Question型
  ('question-what-if', 'もし〇〇だったら型', 'question', 'もし{condition}だったら{result}できる？', ARRAY['condition', 'result'], 0.84, 'all', '仮定質問で想像力を刺激', 'もしAIが全部やってくれたら何に時間使う？', 'Hypothetical Content', ARRAY['未来予測', '可能性提示', '思考実験']),
  
  ('question-why-still', 'なぜまだ〇〇してるの型', 'question', 'なぜまだ{old_way}してるの？{new_way}があるのに。', ARRAY['old_way', 'new_way'], 0.89, 'all', '時代遅れを指摘して新しい方法を提案', 'なぜまだ手動で作ってるの？AIがあるのに。', 'Disruptive Content', ARRAY['技術移行', '効率化', 'イノベーション']),
  
  -- Numbers型
  ('numbers-shocking-stat', '衝撃的な数字型', 'numbers', '{number}{unit}の人が{action}して{result}してる', ARRAY['number', 'unit', 'action', 'result'], 0.88, 'all', '具体的な数字で信憑性を高める', '83%の企業がAI導入して売上2倍にしてる', 'Data-Driven Content', ARRAY['統計紹介', 'トレンド説明', '実績アピール']),
  
  ('numbers-time-money', '時間・お金節約型', 'numbers', '{action}で{timeframe}と{amount}円を節約できた', ARRAY['action', 'timeframe', 'amount'], 0.90, 'general', '具体的な節約効果で価値を示す', 'AI活用で3週間と50万円を節約できた', 'ROI Content', ARRAY['効率化', 'コスト削減', 'ROI訴求']),
  
  -- Secret型
  ('secret-hidden-feature', '隠れ機能型', 'secret', '{subject}の99%が知らない{feature}', ARRAY['subject', 'feature'], 0.87, 'all', '知られていない情報で優越感を与える', 'AIツールの99%が知らない無料機能', 'Tips & Tricks', ARRAY['ハウツー', 'チュートリアル', '便利技']),
  
  ('secret-backdoor', '裏ルート型', 'secret', '{goal}する最短ルートは{method}だった', ARRAY['goal', 'method'], 0.85, 'all', '効率的な方法で価値を提供', 'ホームページ集客する最短ルートはAI×SEOだった', 'Shortcut Content', ARRAY['ハック', '効率化', '最適化']),
  
  -- AI/Tech特化型
  ('tech-ai-revolution', 'AI革命型', 'transformation', 'AIが{industry}を{change}した瞬間', ARRAY['industry', 'change'], 0.91, 'all', 'AI導入による劇的な変化を示す', 'AIがホームページ制作を10分にした瞬間', 'AI Content', ARRAY['AI導入', 'デジタル変革', '自動化']),
  
  ('tech-future-now', '未来は今型', 'curiosity', '{year}に来ると思ってた{technology}が今使える', ARRAY['year', 'technology'], 0.86, 'developer', 'SF的な技術が現実になったことを示す', '2030年に来ると思ってたAI秘書が今使える', 'Futurism Content', ARRAY['技術紹介', '未来予測', 'イノベーション']),
  
  -- Regional/Local特化型
  ('local-hidden-gem', '地域の隠れた宝型', 'curiosity', '{place}の人だけが知ってる{secret}', ARRAY['place', 'secret'], 0.83, 'general', '地域限定情報で興味を引く', '滋賀県の人だけが知ってるAI活用法', 'Local Content', ARRAY['地域SEO', 'ローカルビジネス', '地域特化']),
  
  ('local-vs-tokyo', '地方vs東京型', 'contradiction', '{place}が東京より{aspect}で優れてる理由', ARRAY['place', 'aspect'], 0.82, 'general', '地方の優位性を示して共感を得る', '滋賀県が東京よりAI活用で優れてる理由', 'Regional Pride', ARRAY['地域プライド', '比較', '地方創生'])

ON CONFLICT (pattern_id) DO NOTHING;

-- 投入完了確認
DO $$
DECLARE
  count_result INTEGER;
BEGIN
  SELECT COUNT(*) INTO count_result FROM public.viral_hook_patterns;
  RAISE NOTICE '✅ フックパターンRAG 初期データ投入完了: % 件', count_result;
END $$;

