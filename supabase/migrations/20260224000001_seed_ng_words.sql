-- Seed NG words for brand safety (nands.tech - Japanese AI company)

INSERT INTO safety_ng_words (word, severity, category, platform) VALUES
-- profanity: block severity (hateful/threatening content)
('殺す', 'block', 'profanity', '{x,linkedin,instagram}'),
('死ね', 'block', 'profanity', '{x,linkedin,instagram}'),
('差別', 'block', 'profanity', '{x,linkedin,instagram}'),
('ヘイト', 'block', 'profanity', '{x,linkedin,instagram}'),
('人種差別', 'block', 'profanity', '{x,linkedin,instagram}'),
('性差別', 'block', 'profanity', '{x,linkedin,instagram}'),
('障害者差別', 'block', 'profanity', '{x,linkedin,instagram}'),
('テロ', 'block', 'profanity', '{x,linkedin,instagram}'),

-- competitor: flag severity (competitor bashing)
('競合他社の悪口', 'flag', 'competitor', '{x,linkedin,instagram}'),
('OpenAIは劣っている', 'flag', 'competitor', '{x,linkedin,instagram}'),
('Googleはダメ', 'flag', 'competitor', '{x,linkedin,instagram}'),
('Microsoft批判', 'flag', 'competitor', '{x,linkedin,instagram}'),
('他社より優れている', 'flag', 'competitor', '{x,linkedin,instagram}'),

-- legal: flag severity (overpromising / legal risk)
('100%保証', 'flag', 'legal', '{x,linkedin,instagram}'),
('確実に成功', 'flag', 'legal', '{x,linkedin,instagram}'),
('絶対に儲かる', 'flag', 'legal', '{x,linkedin,instagram}'),
('必ず結果が出る', 'flag', 'legal', '{x,linkedin,instagram}'),
('効果を保証', 'flag', 'legal', '{x,linkedin,instagram}'),
('損害賠償', 'flag', 'legal', '{x,linkedin,instagram}'),
('返金不可', 'flag', 'legal', '{x,linkedin,instagram}'),
('業界No.1', 'flag', 'legal', '{x,linkedin,instagram}'),
('世界最高', 'flag', 'legal', '{x,linkedin,instagram}'),

-- sensitivity: flag severity (political/religious/controversial)
('政治的主張', 'flag', 'sensitivity', '{x,linkedin,instagram}'),
('宗教的見解', 'flag', 'sensitivity', '{x,linkedin,instagram}'),
('陰謀論', 'flag', 'sensitivity', '{x,linkedin,instagram}'),
('反ワクチン', 'flag', 'sensitivity', '{x,linkedin,instagram}'),
('AI脅威論', 'flag', 'sensitivity', '{x,linkedin,instagram}'),
('AIが人類を滅ぼす', 'flag', 'sensitivity', '{x,linkedin,instagram}'),
('軍事利用', 'flag', 'sensitivity', '{x,linkedin,instagram}');
