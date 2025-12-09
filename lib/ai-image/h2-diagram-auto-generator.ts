/**
 * H2図解自動生成ヘルパー
 * 
 * 記事生成時にH2セクションから自動的に図解を生成
 * 既存システムに影響を与えないよう、独立したモジュールとして実装
 * 
 * @module lib/ai-image/h2-diagram-auto-generator
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';

// Supabase Service Role Client
const supabaseServiceRole = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Gemini API初期化
const apiKey = process.env.GOOGLE_AI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// ============================================================
// 型定義
// ============================================================

interface H2Section {
  title: string;
  content: string;
  index: number;
}

interface DiagramResult {
  h2Title: string;
  h2Index: number;
  imageUrl: string;
  success: boolean;
  error?: string;
}

interface AutoDiagramResult {
  success: boolean;
  updatedContent: string;
  generatedDiagrams: DiagramResult[];
  errors: string[];
  totalTime: number;
}

interface DiagramStyleConfig {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  style: string;
}

// ============================================================
// スタイル設定（多様性のため10種類に拡張）
// ============================================================

const DIAGRAM_STYLES: DiagramStyleConfig[] = [
  { 
    name: 'blue-gradient',
    primary: '#1E88E5', 
    secondary: '#42A5F5', 
    accent: '#FFB300',
    style: 'フローチャート風'
  },
  { 
    name: 'green-nature',
    primary: '#2E7D32', 
    secondary: '#66BB6A', 
    accent: '#FF7043',
    style: 'カード型レイアウト'
  },
  { 
    name: 'purple-modern',
    primary: '#7B1FA2', 
    secondary: '#AB47BC', 
    accent: '#26C6DA',
    style: 'アイコン重視型'
  },
  { 
    name: 'orange-warm',
    primary: '#EF6C00', 
    secondary: '#FFA726', 
    accent: '#5C6BC0',
    style: 'ステップ図解'
  },
  { 
    name: 'teal-professional',
    primary: '#00796B', 
    secondary: '#26A69A', 
    accent: '#EC407A',
    style: 'マインドマップ風'
  },
  { 
    name: 'red-bold',
    primary: '#C62828', 
    secondary: '#EF5350', 
    accent: '#29B6F6',
    style: 'タイムライン型'
  },
  { 
    name: 'indigo-tech',
    primary: '#303F9F', 
    secondary: '#5C6BC0', 
    accent: '#FFD54F',
    style: 'データビジュアル型'
  },
  { 
    name: 'pink-creative',
    primary: '#AD1457', 
    secondary: '#EC407A', 
    accent: '#66BB6A',
    style: 'グリッドレイアウト'
  },
  { 
    name: 'brown-classic',
    primary: '#5D4037', 
    secondary: '#8D6E63', 
    accent: '#4DB6AC',
    style: 'クラシック図解'
  },
  { 
    name: 'cyan-fresh',
    primary: '#0097A7', 
    secondary: '#26C6DA', 
    accent: '#FF8A65',
    style: 'モダンインフォグラフィック'
  }
];

// ============================================================
// ヘルパー関数
// ============================================================

/**
 * Fragment ID（{#...}）を削除
 */
function removeFragmentId(text: string): string {
  return text.replace(/\s*\{#[^}]+\}\s*/g, '').trim();
}

/**
 * MarkdownからH2セクションを抽出
 */
function extractH2Sections(markdown: string): H2Section[] {
  const sections: H2Section[] = [];
  const lines = markdown.split('\n');
  
  let currentH2: H2Section | null = null;
  let contentLines: string[] = [];
  let h2Index = 0;
  
  for (const line of lines) {
    const h2Match = line.match(/^##\s+(.+)$/);
    
    if (h2Match) {
      if (currentH2) {
        currentH2.content = removeFragmentId(contentLines.join('\n').trim());
        sections.push(currentH2);
      }
      
      currentH2 = {
        title: removeFragmentId(h2Match[1].trim()),
        content: '',
        index: h2Index++
      };
      contentLines = [];
    } else if (currentH2) {
      if (!line.match(/^#\s/)) {
        contentLines.push(removeFragmentId(line));
      }
    }
  }
  
  if (currentH2) {
    currentH2.content = removeFragmentId(contentLines.join('\n').trim());
    sections.push(currentH2);
  }
  
  return sections;
}

/**
 * セクション内容から要点を抽出（3-5個）
 */
function extractKeyPoints(content: string): string[] {
  const points: string[] = [];
  const lines = content.split('\n').filter(l => l.trim());
  
  for (const line of lines) {
    const bulletMatch = line.match(/^[-・•]\s*(.+)$/);
    if (bulletMatch) {
      points.push(bulletMatch[1].trim());
    }
    const numberedMatch = line.match(/^\d+[.、]\s*(.+)$/);
    if (numberedMatch) {
      points.push(numberedMatch[1].trim());
    }
  }
  
  if (points.length === 0) {
    const sentences = content.split(/[。\n]/).filter(s => s.trim().length > 5 && s.trim().length < 50);
    points.push(...sentences.slice(0, 5));
  }
  
  return points.slice(0, 5).map(p => p.substring(0, 30));
}

/**
 * ランダムなスタイルを取得（同じ記事内で重複しないように）
 */
function getRandomStyle(usedIndices: Set<number>): { style: DiagramStyleConfig; index: number } {
  const availableIndices = DIAGRAM_STYLES.map((_, i) => i).filter(i => !usedIndices.has(i));
  
  if (availableIndices.length === 0) {
    // 全て使用済みの場合はランダムに選択
    const randomIndex = Math.floor(Math.random() * DIAGRAM_STYLES.length);
    return { style: DIAGRAM_STYLES[randomIndex], index: randomIndex };
  }
  
  const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
  return { style: DIAGRAM_STYLES[randomIndex], index: randomIndex };
}

/**
 * 図解生成用プロンプト（シンプル・多様性重視）
 */
function buildDiagramPrompt(
  section: H2Section, 
  style: DiagramStyleConfig
): string {
  const keyPoints = extractKeyPoints(section.content);
  const keyPointsText = keyPoints.length > 0 
    ? keyPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')
    : '（本文から主要ポイントを抽出して表示）';

  return `日本語ビジネス図解を生成してください。

【タイトル】
${section.title}

【要点（これを図解化）】
${keyPointsText}

【デザイン指示 - 最重要】
■ シンプルさ優先
- 要素は3〜5個のみに絞る
- 文字は大きく、読みやすく
- 余白を十分に取る
- 細かい説明は入れない

■ レイアウト: ${style.style}
- カラースキーム: ${style.primary}（メイン）、${style.secondary}（サブ）、${style.accent}（アクセント）
- 背景: 白またはライトグレー
- 全体的に明るく、見やすく

■ 禁止事項
- 細かすぎる情報を入れない
- 長い文章を入れない
- 複雑なチャートを作らない
- {#...} のような技術的マークアップは絶対に含めない

【技術仕様】
- アスペクト比: 16:9（横長）
- 日本語テキストを正確に描画
- 高品質・高解像度

一目で理解できる、シンプルで美しい図解を生成してください。`;
}

/**
 * 単一のH2セクションから図解を生成
 */
async function generateDiagramForSection(
  section: H2Section,
  style: DiagramStyleConfig
): Promise<DiagramResult> {
  if (!genAI) {
    return {
      h2Title: section.title,
      h2Index: section.index,
      imageUrl: '',
      success: false,
      error: 'GOOGLE_AI_API_KEYが設定されていません'
    };
  }

  try {
    const prompt = buildDiagramPrompt(section, style);
    
    const model = genAI.getGenerativeModel({
      model: 'gemini-3-pro-image-preview'
    });

    const result = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        responseModalities: ['TEXT', 'IMAGE'],
        temperature: 0.7,
        candidateCount: 1,
        maxOutputTokens: 8192,
      } as any,
    });

    // 画像データ取得
    const response = result.response;
    let generatedImageData: string | null = null;
    let generatedMimeType = 'image/png';

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        const partAny = part as any;
        if (partAny.inlineData?.mimeType?.startsWith('image/')) {
          generatedImageData = partAny.inlineData.data;
          generatedMimeType = partAny.inlineData.mimeType;
          break;
        }
      }
    }

    if (!generatedImageData) {
      throw new Error('図解画像の生成に失敗しました');
    }

    // Supabase Storageにアップロード
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const ext = generatedMimeType.includes('png') ? 'png' : 'jpg';
    const fileName = `h2-diagram-auto-${timestamp}-${randomString}.${ext}`;
    const filePath = `images/diagrams/${fileName}`;

    const imageBuffer = Buffer.from(generatedImageData, 'base64');

    const { error: uploadError } = await supabaseServiceRole.storage
      .from('blog')
      .upload(filePath, imageBuffer, {
        contentType: generatedMimeType,
        cacheControl: '31536000',
        upsert: false
      });

    if (uploadError) {
      throw new Error(`アップロードエラー: ${uploadError.message}`);
    }

    const { data: { publicUrl } } = supabaseServiceRole.storage
      .from('blog')
      .getPublicUrl(filePath);

    return {
      h2Title: section.title,
      h2Index: section.index,
      imageUrl: publicUrl,
      success: true
    };

  } catch (error: any) {
    console.error(`❌ H2図解生成エラー (${section.title}):`, error.message);
    return {
      h2Title: section.title,
      h2Index: section.index,
      imageUrl: '',
      success: false,
      error: error.message
    };
  }
}

/**
 * 図解をMarkdownに挿入
 */
function insertDiagramsIntoContent(
  content: string,
  diagrams: DiagramResult[]
): string {
  let updatedContent = content;
  
  // 成功した図解のみ処理（逆順で処理して位置がずれないように）
  const successfulDiagrams = diagrams
    .filter(d => d.success && d.imageUrl)
    .sort((a, b) => b.h2Index - a.h2Index);

  for (const diagram of successfulDiagrams) {
    // H2見出しを検索（Fragment ID付き・なし両方に対応）
    const h2Pattern = new RegExp(
      `(##\\s+${escapeRegExp(diagram.h2Title)}(?:\\s*\\{#[^}]+\\})?)`,
      'g'
    );
    
    const imageMarkdown = `\n\n![${diagram.h2Title}の図解](${diagram.imageUrl})\n*${diagram.h2Title}の図解*\n`;
    
    // H2見出しの直後に図解を挿入
    updatedContent = updatedContent.replace(h2Pattern, `$1${imageMarkdown}`);
  }
  
  return updatedContent;
}

/**
 * 正規表現用エスケープ
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ============================================================
// メイン関数（エクスポート）
// ============================================================

/**
 * 記事コンテンツからH2図解を自動生成
 * 
 * @param content - Markdown記事本文
 * @param options - オプション設定
 * @returns 更新されたコンテンツと生成結果
 * 
 * @example
 * const result = await generateH2DiagramsAuto(content, { maxDiagrams: 3 });
 * if (result.success) {
 *   // result.updatedContent を使用
 * }
 */
export async function generateH2DiagramsAuto(
  content: string,
  options: {
    maxDiagrams?: number;      // 最大生成数（デフォルト: 3）
    targetH2Indices?: number[]; // 対象H2インデックス（省略時は先頭から）
    skipFAQ?: boolean;         // FAQセクションをスキップ（デフォルト: true）
  } = {}
): Promise<AutoDiagramResult> {
  const startTime = Date.now();
  const errors: string[] = [];
  const generatedDiagrams: DiagramResult[] = [];
  
  const {
    maxDiagrams = 3,
    targetH2Indices,
    skipFAQ = true
  } = options;

  console.log('\n🖼️ ========================================');
  console.log('📊 H2図解自動生成開始（Nano Banana Pro）');
  console.log(`  最大生成数: ${maxDiagrams}枚`);
  console.log('🖼️ ========================================\n');

  // API Key チェック
  if (!genAI) {
    const error = 'GOOGLE_AI_API_KEYが設定されていないため、H2図解生成をスキップします';
    console.warn(`⚠️ ${error}`);
    return {
      success: true, // エラーでも記事生成は成功扱い
      updatedContent: content,
      generatedDiagrams: [],
      errors: [error],
      totalTime: Date.now() - startTime
    };
  }

  try {
    // H2セクション抽出
    const h2Sections = extractH2Sections(content);
    console.log(`📝 H2セクション検出: ${h2Sections.length}件`);

    if (h2Sections.length === 0) {
      console.log('ℹ️ H2セクションが見つかりませんでした');
      return {
        success: true,
        updatedContent: content,
        generatedDiagrams: [],
        errors: [],
        totalTime: Date.now() - startTime
      };
    }

    // FAQセクションを除外
    let targetSections = h2Sections;
    if (skipFAQ) {
      targetSections = h2Sections.filter(s => 
        !s.title.includes('よくある質問') && 
        !s.title.includes('FAQ') &&
        !s.title.includes('まとめ') &&
        !s.title.includes('はじめに')
      );
      console.log(`📝 FAQ/まとめ/はじめに除外後: ${targetSections.length}件`);
    }

    // 対象インデックスが指定されている場合はフィルタリング
    if (targetH2Indices && targetH2Indices.length > 0) {
      targetSections = targetSections.filter(s => targetH2Indices.includes(s.index));
    }

    // 最大数に制限
    targetSections = targetSections.slice(0, maxDiagrams);
    
    if (targetSections.length === 0) {
      console.log('ℹ️ 図解生成対象のH2セクションがありません');
      return {
        success: true,
        updatedContent: content,
        generatedDiagrams: [],
        errors: [],
        totalTime: Date.now() - startTime
      };
    }

    console.log(`🎯 図解生成対象: ${targetSections.length}件`);
    targetSections.forEach(s => console.log(`  - [${s.index}] ${s.title}`));

    // 使用済みスタイルを追跡（重複防止）
    const usedStyleIndices = new Set<number>();

    // 各H2に対して図解生成
    for (const section of targetSections) {
      console.log(`\n🖼️ 図解生成中: ${section.title}`);
      
      // ランダムなスタイルを取得（重複しないように）
      const { style, index: styleIndex } = getRandomStyle(usedStyleIndices);
      usedStyleIndices.add(styleIndex);
      console.log(`  スタイル: ${style.name} (${style.style})`);
      
      const result = await generateDiagramForSection(section, style);
      generatedDiagrams.push(result);
      
      if (result.success) {
        console.log(`  ✅ 生成完了: ${result.imageUrl}`);
      } else {
        console.log(`  ❌ 生成失敗: ${result.error}`);
        errors.push(`${section.title}: ${result.error}`);
      }
    }

    // 図解をコンテンツに挿入
    const updatedContent = insertDiagramsIntoContent(content, generatedDiagrams);
    const successCount = generatedDiagrams.filter(d => d.success).length;
    
    const totalTime = Date.now() - startTime;

    console.log('\n🖼️ ========================================');
    console.log('✅ H2図解自動生成完了');
    console.log(`  成功: ${successCount}/${generatedDiagrams.length}件`);
    console.log(`  所要時間: ${(totalTime / 1000).toFixed(1)}秒`);
    console.log('🖼️ ========================================\n');

    return {
      success: true,
      updatedContent,
      generatedDiagrams,
      errors,
      totalTime
    };

  } catch (error: any) {
    console.error('❌ H2図解自動生成エラー:', error.message);
    errors.push(error.message);
    
    // エラーが発生しても元のコンテンツを返す（記事生成は継続）
    return {
      success: false, // 処理自体は失敗だが、記事生成には影響しない
      updatedContent: content,
      generatedDiagrams,
      errors,
      totalTime: Date.now() - startTime
    };
  }
}

/**
 * H2図解自動生成が有効かどうかをチェック
 */
export function isH2DiagramGenerationEnabled(): boolean {
  return !!process.env.GOOGLE_AI_API_KEY;
}

