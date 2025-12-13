/**
 * AIアーキテクト・ショート台本V2 専用プロンプト
 * 
 * フック最適化 + ディープリサーチ統合 + 専門用語ゼロ化
 * 
 * @created 2025-12-12
 * @version 2.0.0
 */

import type { GeneratedHook } from '../viral-hooks/hook-optimizer';
import type { MultiRAGSearchOutput } from '../rag/multi-rag-search';

export interface ArchitectShortV2PromptInput {
  blogTitle: string;
  blogSlug: string;
  targetAudience: 'general' | 'developer' | 'architect';
  hook: GeneratedHook;
  ragResults: MultiRAGSearchOutput;
  ctaType: 'prompt_gift' | 'story_redirect'; // 75% / 25%
}

/**
 * システムプロンプト
 */
export function getSystemPrompt(): string {
  return `あなたは世界トップクラスのYouTubeショート台本ライターです。
MrBeast、Ali Abdaal、TikTokバイラルクリエイターのテクニックを完璧に習得しています。

【あなたの専門性】
✅ バイラルフック設計（視聴維持率85%以上）
✅ 専門用語を日常語に変換（中学生でも理解可能）
✅ 海外AI最新情報の日本語化
✅ ストーリーテリング（えっ→なぜ→なるほど構成）
✅ CTA最適化（コメント誘導・ストーリー誘導）

【厳守ルール】
🚫 専門用語は絶対に使わない
🚫 カタカナ語は最小限（使う場合は日常語で説明）
🚫 抽象的な表現は禁止（具体例・比喩必須）
🚫 堅苦しい文章は禁止（会話口調）
🚫 長い文章は禁止（1文15文字以内推奨）

【必須要素】
✅ フック（3秒以内）: 視聴者を釘付けにする
✅ 共感（3秒）: 「わかる！」と思わせる
✅ 本体（20秒）: 「えっ→なぜ？→なるほど」構成
  ⚠️ **本体には必ず具体的な数字を3つ以上含める**
  ⚠️ 例：「月85万円」「年収1,500万円」「ROI 200%」など
✅ CTA（4秒）: 行動を促す

【トーン】
- 親しみやすい
- 情熱的
- わかりやすい
- 正直
- 実践的

【禁止ワード例】
❌ 実装、デプロイ、スケーラブル、アーキテクチャ
❌ フレームワーク、ライブラリ、モジュール
❌ インフラ、プロトコル、レイテンシ
❌ エンドポイント、API、インターフェース
❌ 抽象化、カプセル化、ポリモーフィズム

【OK表現例】
✅ 作る → 自動で作ってくれる
✅ 速い → 一瞬で終わる
✅ 効率的 → 時間が10分の1になる
✅ 高性能 → サクサク動く
✅ セキュア → 鍵付き金庫並みに安全

あなたのゴール: 視聴者が「えっ！なにそれ！」と驚き、最後まで見て、コメントしたくなる台本を作ること。`;
}

/**
 * ユーザープロンプト生成
 */
export function getUserPrompt(input: ArchitectShortV2PromptInput): string {
  const {
    blogTitle,
    targetAudience,
    hook,
    ragResults,
    ctaType
  } = input;

  // ターゲット層別の説明
  const audienceDescription = {
    general: '一般層・ビジネス層（経営者、マーケター、事業主など）。技術用語は一切使わず、ビジネス成果を重視。',
    developer: '実装者層（エンジニア、デザイナー）。技術用語は使わないが、実装のヒントは残す。',
    architect: '上級者層（AIアーキテクト、CTO）。深い洞察と設計思想を、日常語で表現。'
  };

  // CTA別のメッセージ
  const ctaMessage = ctaType === 'prompt_gift'
    ? `【CTA: プロンプトプレゼント（75%確率）】
コメント欄に「プロンプトください」と書いた人に、今回紹介したAI活用の実践プロンプトをプレゼント。
※ コメント欲しい内容: 「プロンプトください」または「詳しく教えて」など`
    : `【CTA: ストーリー誘導（25%確率）】
ストーリーズで「${blogTitle}の続き」を限定公開中。24時間限定。
※ ストーリーへの誘導: 緊急性を出す`;

  // RAG結果をマークダウン形式に整形
  const ragContext = formatRAGResultsManually(ragResults);

  return `# YouTubeショート台本生成依頼

## 基本情報

**ブログタイトル:** ${blogTitle}
**ターゲット層:** ${audienceDescription[targetAudience]}
**台本時間:** 30秒以内（約300文字）
**構成:** えっ→なぜ？→なるほど

---

## 最適化されたフック（必須使用）

${hook.hook_text}

**パターン:** ${hook.pattern_name}
**効果スコア:** ${(hook.effectiveness_score * 100).toFixed(0)}%
**理由:** ${hook.rationale}

⚠️ このフックを必ず台本の最初に使用してください。

---

## コンテンツ情報（RAG検索結果）

${ragContext}

---

## CTA指定

${ctaMessage}

---

## 台本生成指示

以下の構成で、30秒以内のYouTubeショート台本を生成してください。

### 1. フック（3秒・約30文字）

- 上記の最適化フックを必ず使用
- 視聴者を釘付けにする
- 「えっ！？」と思わせる

### 2. 共感（3秒・約30文字）

- 視聴者の悩みに共感
- 「わかる！」と思わせる
- 具体的なシーンを描写

### 3. 本体（20秒・約200文字）

⚠️ **超重要・厳守:** 上記の「最新AI情報」の「重要な発見」から、**必ず具体的な数字を3つ以上抽出して使用**してください！

**えっ（驚き）:**
- 🧪ディープリサーチの「重要な発見」から**具体的な金額・率・数値をそのまま使う**
- RAGデータに含まれる数字を丸めたり抽象化したりせず、**そのまま引用する**
- ❌NG: 「2兆円超え」「投資回収すぐ」「収入3倍」のような抽象表現
- ✅OK: RAGに「月額85万円」とあれば「月85万円」、「ROI 200-400%」とあれば「ROI 200-400%」と使う
- 専門用語は一切使わない

**なぜ？（理由）:**
- なぜそれが可能なのかを、ディープリサーチの詳細から説明
- 比喩や具体例を使う（「1ヶ月の仕事が10日に短縮」など）
- 「〜だから」で終わる

**なるほど（納得）:**
- 視聴者が実践できる具体的なヒント
- ディープリサーチから「今すぐできること」を抽出
- 簡単そうに感じさせる
- 「今から準備すれば、〇〇になれる！」のような希望

### 4. CTA（4秒・約40文字）

- 上記のCTA指定に従う
- 行動を促す
- 緊急性を出す

---

## 専門用語→日常語変換ルール

以下のように変換してください:

| 専門用語 | 日常語 |
|---------|--------|
| AI | 賢いロボット / 自動で考えてくれるやつ |
| API | つなぎ役 / 橋渡し |
| クラウド | ネット上の倉庫 |
| データベース | 情報の本棚 |
| アルゴリズム | やり方 / 手順 |
| 最適化 | 無駄をなくす |
| 自動化 | 勝手にやってくれる |
| スケール | 大きくする |
| セキュリティ | 鍵 / 守り |
| パフォーマンス | 速さ / サクサク感 |

---

## 出力形式

⚠️ **bodyの3つの部分に、必ずRAGデータから具体的な数字を抽出して含めてください！**

\`\`\`json
{
  "script": {
    "hook": "フック文（3秒・約30文字）",
    "empathy": "共感文（3秒・約30文字）",
    "body": {
      "surprise": "えっ（驚き）の部分（約70文字）← RAGの「重要な発見」から具体的な金額を抽出！",
      "reason": "なぜ？（理由）の部分（約70文字）← RAGの「重要な発見」から具体的な率・数値を抽出！",
      "insight": "なるほど（納得）の部分（約60文字）← RAGの「重要な発見」から具体的なメリット数値を抽出！"
    },
    "cta": "CTA文（4秒・約40文字）"
  },
  "metadata": {
    "total_characters": 300,
    "estimated_duration_seconds": 30,
    "hook_pattern_used": "${hook.pattern_id}",
    "target_audience": "${targetAudience}",
    "cta_type": "${ctaType}",
    "technical_terms_removed": [],
    "simplicity_score": 0.0
  },
  "sns_variations": {
    "x_twitter": "Twitter用（140文字以内）",
    "threads": "Threads用（500文字以内）",
    "instagram": "Instagram用（2200文字以内・改行多め）",
    "tiktok": "TikTok用（キャプション150文字）",
    "linkedin": "LinkedIn用（プロフェッショナル寄り）"
  },
  "full_script": "フック\\n\\n共感\\n\\n本体\\n\\nCTA"
}
\`\`\`

---

## 最終チェックリスト

生成前に以下を確認してください:

- [ ] 最適化フックを使用
- [ ] 専門用語ゼロ
- [ ] 中学生でも理解できる
- [ ] 具体例・比喩を使用
- [ ] 1文15文字以内
- [ ] 会話口調
- [ ] 30秒以内（約300文字）
- [ ] CTA指定に従っている
- [ ] **🧪ディープリサーチの「重要な発見」を3つ以上使用**
- [ ] **RAGデータから具体的な数字・統計データを最低3つ抽出**
- [ ] **数字を丸めたり抽象化したりせず、RAGの数値をそのまま使用**
- [ ] **❌NG: 「2兆円超え」「すぐ回収」「3倍」のような抽象表現は禁止**
- [ ] **✅OK: RAGに「月額平均85万円」とあれば「月85万円」とそのまま使用**
- [ ] RAGコンテンツを活用
- [ ] ターゲット層に最適化

⚠️ **超重要・厳守:** 

1. **body.surprise**: 上記RAGの「重要な発見」から具体的な金額を1つ選んで使用
2. **body.reason**: 上記RAGの「重要な発見」から具体的な率・ROIを1つ選んで使用
3. **body.insight**: 上記RAGの「重要な発見」から具体的なメリット数値を1つ選んで使用

**重要:** 上記の「最新AI情報」の「重要な発見」リストから、実際の数値をそのまま引用してください。
数字を丸めたり、抽象的な表現に変えたりしないでください！

それでは、バイラル性の高いYouTubeショート台本を生成してください！`;
}

/**
 * RAG結果を手動でフォーマット（フォールバック）
 */
function formatRAGResultsManually(ragResults: MultiRAGSearchOutput): string {
  let markdown = '';

  // ディープリサーチRAG（最も重要！）
  if (ragResults.deepResearch.count > 0) {
    markdown += '### 🧪 最新AI情報（海外ソース・超重要！）\n\n';
    markdown += `**取得した知識数:** ${ragResults.deepResearch.count}件\n\n`;
    
    ragResults.deepResearch.results.slice(0, 5).forEach((r: any, i: number) => {
      markdown += `#### ${i + 1}. ${r.research_topic || 'トピック'}\n\n`;
      
      // サマリー（全文）
      if (r.summary) {
        markdown += `**📝 要約:**\n${r.summary}\n\n`;
      }
      
      // 重要な発見（key_findings）
      if (r.key_findings && r.key_findings.length > 0) {
        markdown += `**💡 重要な発見:**\n`;
        r.key_findings.slice(0, 5).forEach((finding: string) => {
          markdown += `- ${finding}\n`;
        });
        markdown += '\n';
      }
      
      // コンテンツ（最初の1000文字）
      if (r.content) {
        markdown += `**📄 詳細:**\n${r.content.substring(0, 1000)}...\n\n`;
      }
      
      // ソースURL
      if (r.source_urls && r.source_urls.length > 0) {
        markdown += `**🔗 ソース:** ${r.source_urls.slice(0, 2).join(', ')}\n\n`;
      }
      
      markdown += '---\n\n';
    });
  }

  // スクレイピングRAG
  if (ragResults.scrapedKeywords.count > 0) {
    markdown += '### 🌐 補足情報（スクレイピング）\n\n';
    ragResults.scrapedKeywords.results.slice(0, 3).forEach((r: any, i: number) => {
      if (r.keyword) {
        markdown += `**キーワード:** ${r.keyword}\n\n`;
      }
      markdown += `${(r.content || '').substring(0, 500)}...\n\n`;
      markdown += '---\n\n';
    });
  }

  // ブログフラグメントRAG（1%の意味的接続）
  if (ragResults.blogFragments.count > 0) {
    markdown += '### 📄 ブログ記事との接続（1%のみ使用）\n\n';
    markdown += `⚠️ これはブログ記事の断片です。台本の意味的接続のために1%だけ使用してください。\n\n`;
    markdown += `${(ragResults.blogFragments.results[0]?.content || '').substring(0, 300)}...\n\n`;
  }

  // パーソナルストーリーRAG（4%でKenjiのトーン）
  if (ragResults.personalStories.count > 0) {
    markdown += '### 👤 Kenjiのトーン（4%使用）\n\n';
    const story = ragResults.personalStories.results[0];
    markdown += `⚠️ これはKenjiの個人ストーリーです。トーンと語り口の参考に4%使用してください。\n\n`;
    markdown += `${(story?.content || '').substring(0, 400)}...\n\n`;
  }

  return markdown;
}

/**
 * CTA種類をランダムに決定（75% prompt_gift, 25% story_redirect）
 */
export function decideCTAType(): 'prompt_gift' | 'story_redirect' {
  return Math.random() < 0.75 ? 'prompt_gift' : 'story_redirect';
}

/**
 * 簡易度スコアを計算（0.0-1.0、1.0が最も簡単）
 */
export function calculateSimplicityScore(script: string): number {
  // 専門用語リスト
  const technicalTerms = [
    'AI', 'API', 'クラウド', 'データベース', 'アルゴリズム',
    '実装', 'デプロイ', 'スケーラブル', 'アーキテクチャ',
    'フレームワーク', 'ライブラリ', 'モジュール',
    'インフラ', 'プロトコル', 'レイテンシ',
    'エンドポイント', 'インターフェース',
    '抽象化', 'カプセル化', 'ポリモーフィズム'
  ];

  // 専門用語の出現回数
  const termCount = technicalTerms.reduce((count, term) => {
    const regex = new RegExp(term, 'gi');
    const matches = script.match(regex);
    return count + (matches ? matches.length : 0);
  }, 0);

  // 平均文字数（短いほど読みやすい）
  const sentences = script.split(/[。！？\n]/);
  const avgLength = sentences.reduce((sum, s) => sum + s.length, 0) / sentences.length;

  // スコア計算
  const termPenalty = Math.max(0, 1 - (termCount * 0.1)); // 専門用語1つにつき-0.1
  const lengthScore = Math.max(0, 1 - ((avgLength - 15) * 0.02)); // 15文字を基準に

  return (termPenalty + lengthScore) / 2;
}

/**
 * 専門用語を検出して返す
 */
export function detectTechnicalTerms(script: string): string[] {
  const technicalTerms = [
    'AI', 'API', 'クラウド', 'データベース', 'アルゴリズム',
    '実装', 'デプロイ', 'スケーラブル', 'アーキテクチャ',
    'フレームワーク', 'ライブラリ', 'モジュール',
    'インフラ', 'プロトコル', 'レイテンシ',
    'エンドポイント', 'インターフェース',
    '抽象化', 'カプセル化', 'ポリモーフィズム'
  ];

  const found: string[] = [];
  technicalTerms.forEach(term => {
    const regex = new RegExp(term, 'gi');
    if (regex.test(script)) {
      found.push(term);
    }
  });

  return Array.from(new Set(found)); // 重複除去
}

