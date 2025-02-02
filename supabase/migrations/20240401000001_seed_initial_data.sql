-- Insert businesses
INSERT INTO businesses (slug, name, description) VALUES
('fukugyo', '副業支援', '副業支援事業の説明文をここに記載'),
('corporate', '法人向けAI導入', '法人向けAI導入事業の説明文をここに記載'),
('reskilling', '法人向けリスキリング', '法人向けリスキリング事業の説明文をここに記載');

-- Insert categories for fukugyo (business_id = 1)
INSERT INTO categories (business_id, slug, name, description) VALUES
(1, 'seo-writing', 'SEOライティング', 'SEOライティングに関する記事カテゴリ'),
(1, 'image-video-generation', '画像・動画生成', 'AI画像・動画生成に関する記事カテゴリ'),
(1, 'data-analysis', 'データ分析', 'データ分析に関する記事カテゴリ'),
(1, 'business-admin', 'ビジネス事務', 'ビジネス事務に関する記事カテゴリ'),
(1, 'programming', 'プログラミング', 'プログラミングに関する記事カテゴリ'),
(1, 'ai-consultant', '生成AIコンサルタント', '生成AIコンサルタントに関する記事カテゴリ'),
(1, 'ai-translation', 'AI翻訳・字幕作成', 'AI翻訳・字幕作成に関する記事カテゴリ'),
(1, 'ai-short-video', 'AIショート動画/UGCマーケ支援', 'AIショート動画/UGCマーケ支援に関する記事カテゴリ'),
(1, 'nocode-ai', 'No-code × AIアプリ構築', 'No-code × AIアプリ構築に関する記事カテゴリ'),
(1, 'ai-voice', 'AI音声合成/ナレーション', 'AI音声合成/ナレーションに関する記事カテゴリ');

-- Insert categories for corporate (business_id = 2)
INSERT INTO categories (business_id, slug, name, description) VALUES
(2, 'ai-consulting', 'AI導入コンサルティング', 'AI導入コンサルティングに関する記事カテゴリ'),
(2, 'chatbot', 'チャットボット/対話AI活用', 'チャットボット/対話AI活用に関する記事カテゴリ'),
(2, 'ai-automation', '生成AIで実現する業務自動化', '生成AIで実現する業務自動化に関する記事カテゴリ'),
(2, 'ai-ocr', 'AI画像認識・OCR導入', 'AI画像認識・OCR導入に関する記事カテゴリ'),
(2, 'rpa-dx', 'RPA×AIでのDX推進', 'RPA×AIでのDX推進に関する記事カテゴリ'),
(2, 'ai-talent', 'AI人材育成・組織体制構築', 'AI人材育成・組織体制構築に関する記事カテゴリ'),
(2, 'security-governance', 'セキュリティ・ガバナンス', 'セキュリティ・ガバナンスに関する記事カテゴリ'),
(2, 'cloud-ai', 'クラウドAI活用事例', 'クラウドAI活用事例に関する記事カテゴリ'),
(2, 'ai-project', 'AIプロジェクトマネジメント', 'AIプロジェクトマネジメントに関する記事カテゴリ'),
(2, 'case-study', '導入企業インタビュー・成功事例', '導入企業インタビュー・成功事例に関する記事カテゴリ');

-- Insert categories for reskilling (business_id = 3)
INSERT INTO categories (business_id, slug, name, description) VALUES
(3, 'finance', '金融業界向けリスキリング', '金融業界向けリスキリングに関する記事カテゴリ'),
(3, 'manufacturing', '製造業界向けリスキリング', '製造業界向けリスキリングに関する記事カテゴリ'),
(3, 'logistics', '物流・運輸業界向けリスキリング', '物流・運輸業界向けリスキリングに関する記事カテゴリ'),
(3, 'retail', '小売・EC業界向けリスキリング', '小売・EC業界向けリスキリングに関する記事カテゴリ'),
(3, 'healthcare', '医療・介護業界向けリスキリング', '医療・介護業界向けリスキリングに関する記事カテゴリ'),
(3, 'construction', '建設・不動産業界向けリスキリング', '建設・不動産業界向けリスキリングに関する記事カテゴリ'),
(3, 'it-software', 'IT・ソフトウェア業界向けリスキリング', 'IT・ソフトウェア業界向けリスキリングに関する記事カテゴリ'),
(3, 'hr-service', '人材サービス業界向けリスキリング', '人材サービス業界向けリスキリングに関する記事カテゴリ'),
(3, 'marketing', '広告・マーケティング業界向けリスキリング', '広告・マーケティング業界向けリスキリングに関する記事カテゴリ'),
(3, 'government', '自治体・公共機関向けリスキリング', '自治体・公共機関向けリスキリングに関する記事カテゴリ'); 