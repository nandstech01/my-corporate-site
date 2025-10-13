-- 比喩パターンをKenji思想テーブルに追加
-- わかりやすさ最優先：小5でも理解できる説明

-- 1. ベクトルリンク
INSERT INTO kenji_harada_architect_knowledge (
  thought_id, thought_title, thought_content, thought_category, usage_context, key_terms, metadata
) VALUES (
  'analogy-vector-link',
  'ベクトルリンクの比喩',
  '専門用語: ベクトルリンク（Vector Link）

小5向け説明: 情報に「バーコード」をつける技術。お店の商品にバーコードがあるように、ブログの1つ1つの段落にもバーコードをつける。AIが「この情報使いたい！」って時に、すぐ見つけられる。

比喩パターン:
1. 本のページ番号 →「AIが引用する時、本のページ番号みたいに『ここ！』って教えてあげる」
2. お店のバーコード →「商品のバーコードみたいに、情報にもIDをつける」
3. 地図の座標 →「Google Mapの住所みたいに、情報の場所を正確に示す」

使用例: 「AIが情報を引用する時って、『どこから持ってきたの？』って分からなくなるでしょ？だから、情報1つ1つにバーコードみたいなIDをつけるんだ。これをベクトルリンクって言うんだけど、知らないとマジで損するよ」',
  'analogy', 'short_video_simplification',
  ARRAY['ベクトルリンク', 'Fragment ID', 'バーコード', 'わかりやすい説明'],
  '{"target_audience": "elementary_junior_high", "difficulty": "easy"}'::jsonb
);

-- 2. Fragment ID
INSERT INTO kenji_harada_architect_knowledge (
  thought_id, thought_title, thought_content, thought_category, usage_context, key_terms, metadata
) VALUES (
  'analogy-fragment-id',
  'Fragment IDの比喩',
  '専門用語: Fragment ID（フラグメントID）

小5向け説明: 情報の「かけら」に名札をつけること。大きな情報を小さく分けて、それぞれに名前をつける。AIが「この部分だけ欲しい」って時に便利。

比喩パターン:
1. パズルのピース →「大きなパズルを小さく分けて、1つ1つに番号をつける」
2. 引き出しの中身 →「タンスの引き出しに『Tシャツ』『靴下』ってラベル貼るでしょ？それと同じ」
3. レシピの手順 →「カレーの作り方を『1.野菜を切る』『2.炒める』って分けて、番号をつける」

使用例: 「情報って、1つの大きな塊じゃダメなんだ。パズルのピースみたいに小さく分けて、1つ1つに番号をつける。これをFragment IDって言うんだけど、AIが『この部分だけ使いたい！』って時に超便利」',
  'analogy', 'short_video_simplification',
  ARRAY['Fragment ID', 'フラグメント', 'かけら', '情報の断片'],
  '{"target_audience": "elementary_junior_high", "difficulty": "easy"}'::jsonb
);

-- 3. 再文脈化
INSERT INTO kenji_harada_architect_knowledge (
  thought_id, thought_title, thought_content, thought_category, usage_context, key_terms, metadata
) VALUES (
  'analogy-recontextualization',
  '再文脈化の比喩',
  '専門用語: 再文脈化（Re-contextualization）

小5向け説明: 散らばった情報を、AIがちゃんと組み立て直すこと。バラバラのレゴブロックを、説明書を見ながら組み立てるイメージ。

比喩パターン:
1. パズルの組み立て →「散らばったパズルを、ちゃんと絵が見えるように組み立て直す」
2. レゴブロック →「バラバラのレゴを、説明書を見ながら組み立てる」
3. 料理の盛り付け →「材料を切って炒めたものを、お皿にキレイに盛り付ける」

使用例: 「AIが情報を集める時、最初はバラバラなんだよね。パズルのピースみたいに。それを『ちゃんと意味が分かるように組み立て直す』のが再文脈化。これができないと、AIは意味不明な答えしか出せない」',
  'analogy', 'short_video_simplification',
  ARRAY['再文脈化', 'コンテキスト', '文脈', '組み立て'],
  '{"target_audience": "elementary_junior_high", "difficulty": "easy"}'::jsonb
);

-- 4. 構造化
INSERT INTO kenji_harada_architect_knowledge (
  thought_id, thought_title, thought_content, thought_category, usage_context, key_terms, metadata
) VALUES (
  'analogy-structuring',
  '構造化の比喩',
  '専門用語: 構造化（Structuring）

小5向け説明: 情報を整理整頓すること。部屋を片付ける時に、「服はクローゼット」「本は本棚」ってルールを決めるでしょ？それと同じ。

比喩パターン:
1. 部屋の整理整頓 →「散らかった部屋を、ちゃんと片付ける」
2. ファイルの整理 →「パソコンのファイルを、フォルダ分けして整理する」
3. 図書館の本棚 →「本を『小説』『漫画』『辞書』って分けて並べる」

使用例: 「AIって、情報が散らかってると迷子になるんだよね。だから、部屋を片付けるみたいに、情報をキレイに整理する。これを構造化って言うんだけど、これができると、AIが『欲しい情報はここ！』ってすぐ分かる」',
  'analogy', 'short_video_simplification',
  ARRAY['構造化', '整理整頓', 'データ整理', 'スキーマ'],
  '{"target_audience": "elementary_junior_high", "difficulty": "easy"}'::jsonb
);

-- 5. AIアーキテクト
INSERT INTO kenji_harada_architect_knowledge (
  thought_id, thought_title, thought_content, thought_category, usage_context, key_terms, metadata
) VALUES (
  'analogy-ai-architect',
  'AIアーキテクトの比喩',
  '専門用語: AIアーキテクト（AI Architect）

小5向け説明: AIが迷わないように、わかりやすい「地図」を作る人。建物を設計する建築家みたいに、情報の設計図を作る。

比喩パターン:
1. 地図を作る人 →「AIが迷子にならないように、わかりやすい地図を作る」
2. 家の設計図 →「建築家が家の設計図を描くみたいに、情報の設計図を描く」
3. ゲームのステージ設計 →「マリオのステージを作る人みたいに、AIが動きやすい環境を作る」

使用例: 「AIって、ちゃんと道案内してあげないと迷子になるんだ。だから、『ここに何がある』『これとこれが繋がってる』って地図を作ってあげる。この地図を作る人を、AIアーキテクトって言うんだよ」',
  'analogy', 'short_video_simplification',
  ARRAY['AIアーキテクト', 'アーキテクチャ', '設計', '設計図'],
  '{"target_audience": "elementary_junior_high", "difficulty": "easy"}'::jsonb
);

-- 6. Triple RAG
INSERT INTO kenji_harada_architect_knowledge (
  thought_id, thought_title, thought_content, thought_category, usage_context, key_terms, metadata
) VALUES (
  'analogy-triple-rag',
  'Triple RAGの比喩',
  '専門用語: Triple RAG（トリプルRAG）

小5向け説明: 情報を3段階で探す仕組み。図書館で本を探す時、「棚→本→ページ」って絞り込むでしょ？それと同じ。

比喩パターン:
1. 図書館の本探し →「棚を探す→本を探す→ページを探すの3段階」
2. お店の商品探し →「フロアを決める→売り場を決める→商品を探すの3段階」
3. Google検索 →「キーワード入力→検索結果→詳細ページの3段階」

使用例: 「AIが情報を探す時、一気に全部見るとパンクしちゃう。だから、図書館で本を探すみたいに『まず棚、次に本、最後にページ』って3段階で絞り込む。これをTriple RAGって言うんだ」',
  'analogy', 'short_video_simplification',
  ARRAY['Triple RAG', 'RAG', '検索', '情報検索'],
  '{"target_audience": "elementary_junior_high", "difficulty": "easy"}'::jsonb
);

-- 7. レリバンスエンジニアリング
INSERT INTO kenji_harada_architect_knowledge (
  thought_id, thought_title, thought_content, thought_category, usage_context, key_terms, metadata
) VALUES (
  'analogy-relevance-engineering',
  'レリバンスエンジニアリングの比喩',
  '専門用語: レリバンスエンジニアリング（Relevance Engineering）

小5向け説明: 「関連性」をちゃんと作る技術。友達関係を作るみたいに、「この情報とこの情報は仲良し」って繋げてあげる。

比喩パターン:
1. 友達の紹介 →「『この子とこの子、気が合うよ！』って友達を紹介するみたいに、情報同士を繋げる」
2. おすすめ機能 →「YouTubeの『おすすめ動画』みたいに、関連する情報を見つける」
3. 連想ゲーム →「『リンゴ』から『赤い』『果物』『甘い』って連想するみたいに、関連情報を探す」

使用例: 「AIが『関連する情報』を見つけるって、実は超難しいんだ。だから、『この情報とこの情報は仲良し』ってちゃんと繋げてあげる。これをレリバンスエンジニアリングって言うんだけど、これができると、AIが『おすすめ』を上手に出せる」',
  'analogy', 'short_video_simplification',
  ARRAY['レリバンスエンジニアリング', '関連性', 'Relevance', 'つながり'],
  '{"target_audience": "elementary_junior_high", "difficulty": "easy"}'::jsonb
);

-- 8. Complete URI
INSERT INTO kenji_harada_architect_knowledge (
  thought_id, thought_title, thought_content, thought_category, usage_context, key_terms, metadata
) VALUES (
  'analogy-complete-uri',
  'Complete URIの比喩',
  '専門用語: Complete URI（コンプリートURI）

小5向け説明: 情報の「完全な住所」。友達の家に行く時、「〇〇市〇〇町1-2-3」って完全な住所が必要でしょ？それと同じ。

比喩パターン:
1. 家の住所 →「『東京都渋谷区...』って、完全な住所を書く」
2. Google Mapのピン →「地図で『ここ！』ってピンを立てる」
3. 教室の座席番号 →「『3年2組の出席番号15番』って、完全に場所を特定する」

使用例: 「AIが情報を引用する時、『どこから持ってきたの？』って正確に示さないとダメなんだ。だから、Google Mapのピンみたいに『ここ！』って完全な住所を作る。これをComplete URIって言うんだよ」',
  'analogy', 'short_video_simplification',
  ARRAY['Complete URI', 'URI', 'URL', '住所'],
  '{"target_audience": "elementary_junior_high", "difficulty": "easy"}'::jsonb
);

-- 9. AIO (AI Optimization)
INSERT INTO kenji_harada_architect_knowledge (
  thought_id, thought_title, thought_content, thought_category, usage_context, key_terms, metadata
) VALUES (
  'analogy-aio',
  'AIOの比喩',
  '専門用語: AIO（AI Optimization）

小5向け説明: AIが見つけやすいように情報を最適化すること。Google検索で上位に出るための工夫（SEO）のAI版。

比喩パターン:
1. お店の看板 →「お店が目立つように、大きな看板を出す」
2. YouTubeのサムネ →「動画が目立つように、カッコいいサムネを作る」
3. プレゼンの資料 →「先生に伝わるように、分かりやすい資料を作る」

使用例: 「AIが『この情報いいね！』って見つけてくれるように工夫するのがAIO。YouTubeのサムネをカッコよくするみたいに、AIが『これだ！』って思うように情報を整える。これからは、Google検索じゃなくてAI検索の時代だから超重要」',
  'analogy', 'short_video_simplification',
  ARRAY['AIO', 'AI Optimization', 'SEO', 'AI検索'],
  '{"target_audience": "elementary_junior_high", "difficulty": "easy"}'::jsonb
);

-- 10. ベクトル埋め込み
INSERT INTO kenji_harada_architect_knowledge (
  thought_id, thought_title, thought_content, thought_category, usage_context, key_terms, metadata
) VALUES (
  'analogy-vector-embedding',
  'ベクトル埋め込みの比喩',
  '専門用語: ベクトル埋め込み（Vector Embedding）

小5向け説明: 文章を数字に変換すること。AIは文字が読めないから、「リンゴ」を「0.5, 0.8, 0.3...」みたいな数字に変える。

比喩パターン:
1. 暗号化 →「『こんにちは』を『12345』みたいな暗号に変える」
2. バーコード →「商品名を、ピッてスキャンできるバーコードに変える」
3. 音楽の楽譜 →「歌を、ドレミファソラシドの楽譜に書き起こす」

使用例: 「AIって実は文字が読めないんだ。だから、『リンゴ』って文字を『0.5, 0.8, 0.3...』みたいな数字に変換する。これをベクトル埋め込みって言うんだけど、これがないとAIは何もできない」',
  'analogy', 'short_video_simplification',
  ARRAY['ベクトル埋め込み', 'Embedding', 'ベクトル', '数値化'],
  '{"target_audience": "elementary_junior_high", "difficulty": "easy"}'::jsonb
);

-- 11. ハイブリッド検索
INSERT INTO kenji_harada_architect_knowledge (
  thought_id, thought_title, thought_content, thought_category, usage_context, key_terms, metadata
) VALUES (
  'analogy-hybrid-search',
  'ハイブリッド検索の比喩',
  '専門用語: ハイブリッド検索（Hybrid Search）

小5向け説明: 2つの方法で情報を探すこと。友達を探す時、「名前」と「見た目」の両方で探すと見つけやすいでしょ？それと同じ。

比喩パターン:
1. 友達探し →「名前と顔の両方で探す」
2. Google検索 →「キーワードと画像の両方で検索する」
3. お店探し →「料理のジャンルと場所の両方で探す」

使用例: 「AIが情報を探す時、1つの方法だと見逃しちゃうことがある。だから、『キーワード』と『意味』の2つの方法で探す。これをハイブリッド検索って言うんだけど、見つかる確率が2倍になる」',
  'analogy', 'short_video_simplification',
  ARRAY['ハイブリッド検索', 'Hybrid Search', 'BM25', 'ベクトル検索'],
  '{"target_audience": "elementary_junior_high", "difficulty": "easy"}'::jsonb
);

-- 12. プロンプトエンジニアリング
INSERT INTO kenji_harada_architect_knowledge (
  thought_id, thought_title, thought_content, thought_category, usage_context, key_terms, metadata
) VALUES (
  'analogy-prompt-engineering',
  'プロンプトエンジニアリングの比喩',
  '専門用語: プロンプトエンジニアリング（Prompt Engineering）

小5向け説明: AIへの「お願いの仕方」を工夫すること。先生に質問する時、言い方を変えると答えが変わるでしょ？それと同じ。

比喩パターン:
1. 質問の仕方 →「『教えて』より『なぜ〜なの？』の方が詳しく教えてくれる」
2. お願いの仕方 →「『お願い！』より『理由はね...だからお願い』の方が聞いてもらえる」
3. 検索キーワード →「Google検索で、キーワードを工夫すると欲しい情報が出る」

使用例: 「AIって、質問の仕方で答えが全然変わるんだ。『要約して』より『小学生でも分かるように3つのポイントで要約して』の方が、良い答えが返ってくる。この『お願いの仕方を工夫する技術』をプロンプトエンジニアリングって言うんだよ」',
  'analogy', 'short_video_simplification',
  ARRAY['プロンプトエンジニアリング', 'プロンプト', 'Prompt', '質問'],
  '{"target_audience": "elementary_junior_high", "difficulty": "easy"}'::jsonb
);

-- 13. コンテキストウィンドウ
INSERT INTO kenji_harada_architect_knowledge (
  thought_id, thought_title, thought_content, thought_category, usage_context, key_terms, metadata
) VALUES (
  'analogy-context-window',
  'コンテキストウィンドウの比喩',
  '専門用語: コンテキストウィンドウ（Context Window）

小5向け説明: AIが一度に覚えられる情報の量。人間の「短期記憶」みたいなもの。メモ帳のページ数が決まってるイメージ。

比喩パターン:
1. メモ帳のページ数 →「メモ帳が10ページしかないと、11ページ目は書けない」
2. 短期記憶 →「覚えられることに限界がある」
3. カバンの容量 →「カバンに入る教科書の数は決まってる」

使用例: 「AIって、一度に全部は覚えられないんだ。メモ帳のページ数が決まってるみたいに、覚えられる量に限界がある。これをコンテキストウィンドウって言うんだけど、だから長い文章は分けて渡す必要がある」',
  'analogy', 'short_video_simplification',
  ARRAY['コンテキストウィンドウ', 'Context Window', 'トークン', '記憶容量'],
  '{"target_audience": "elementary_junior_high", "difficulty": "easy"}'::jsonb
);

-- 14. ファインチューニング
INSERT INTO kenji_harada_architect_knowledge (
  thought_id, thought_title, thought_content, thought_category, usage_context, key_terms, metadata
) VALUES (
  'analogy-fine-tuning',
  'ファインチューニングの比喩',
  '専門用語: ファインチューニング（Fine-tuning）

小5向け説明: AIに「専門知識」を教え込むこと。サッカー選手が「シュート練習」を繰り返すみたいに、AIに特定のスキルを集中トレーニングする。

比喩パターン:
1. 部活の練習 →「サッカー部で、シュート練習を100回繰り返す」
2. 漢字ドリル →「同じ漢字を何度も書いて覚える」
3. ピアノの練習 →「同じ曲を何度も弾いて上手くなる」

使用例: 「AIって最初は『何でも屋さん』なんだけど、専門知識は弱い。だから、医療AIなら医療データで集中トレーニングする。これをファインチューニングって言うんだけど、これで『専門家AI』になる」',
  'analogy', 'short_video_simplification',
  ARRAY['ファインチューニング', 'Fine-tuning', '学習', 'トレーニング'],
  '{"target_audience": "elementary_junior_high", "difficulty": "easy"}'::jsonb
);

-- 15. トークン
INSERT INTO kenji_harada_architect_knowledge (
  thought_id, thought_title, thought_content, thought_category, usage_context, key_terms, metadata
) VALUES (
  'analogy-token',
  'トークンの比喩',
  '専門用語: トークン（Token）

小5向け説明: AIが文章を読む時の「単位」。文章を小さく切った「かけら」。「こんにちは」を「こん」「に」「ち」「は」って分けるイメージ。

比喩パターン:
1. 文章の区切り →「『今日は晴れ』を『今日』『は』『晴れ』って分ける」
2. レゴブロック →「大きな作品を、小さなブロックに分解する」
3. パズルのピース →「絵を小さく切ったピース1つ1つ」

使用例: 「AIが文章を読む時、『こんにちは』を一気に読むんじゃなくて、『こん』『に』『ち』『は』って小さく分けて読むんだ。この1つ1つをトークンって言うんだけど、AIはこれを数えながら文章を理解してる」',
  'analogy', 'short_video_simplification',
  ARRAY['トークン', 'Token', '単語', '文字数'],
  '{"target_audience": "elementary_junior_high", "difficulty": "easy"}'::jsonb
);
