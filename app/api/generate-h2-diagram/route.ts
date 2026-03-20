/**
 * H2セクション図解画像生成API
 * - Gemini 3 Pro Image Preview（ナノバナナプロ）を使用
 * - 記事のH2見出しを理解して図解画像を生成
 */

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';

const supabaseServiceRole = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Gemini API初期化
const apiKey = process.env.GOOGLE_AI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// タイムアウト設定（3分）
export const maxDuration = 180;
export const dynamic = 'force-dynamic';

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

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    if (!genAI) {
      return NextResponse.json(
        { success: false, error: 'GOOGLE_AI_API_KEY が設定されていません' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { 
      content,      // Markdown記事全文
      title,        // 記事タイトル（コンテキスト用）
      h2Indices,    // 生成するH2のインデックス（省略時は全て）
      maxDiagrams = 5  // 最大生成数
    } = body;

    console.log('📊 H2図解画像生成開始（Nano Banana Pro）');
    console.log(`  記事タイトル: ${title}`);

    if (!content) {
      return NextResponse.json(
        { success: false, error: '記事内容（content）は必須です' },
        { status: 400 }
      );
    }

    // 1. H2セクションを抽出
    const h2Sections = extractH2Sections(content);
    console.log(`✅ H2セクション抽出: ${h2Sections.length}件`);

    if (h2Sections.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'H2セクションが見つかりませんでした',
        diagrams: []
      });
    }

    // 生成対象のH2を決定
    let targetSections = h2Sections;
    if (h2Indices && Array.isArray(h2Indices)) {
      targetSections = h2Sections.filter(s => h2Indices.includes(s.index));
    }
    targetSections = targetSections.slice(0, maxDiagrams);

    console.log(`🎯 図解生成対象: ${targetSections.length}件`);
    targetSections.forEach(s => console.log(`  - [${s.index}] ${s.title}`));

    // 2. 各H2に対して図解を生成
    const results: DiagramResult[] = [];
    
    for (const section of targetSections) {
      console.log(`\n🖼️ 図解生成中: ${section.title}`);
      
      try {
        const diagramUrl = await generateDiagramForH2(
          section,
          title || '記事',
          genAI
        );
        
        results.push({
          h2Title: section.title,
          h2Index: section.index,
          imageUrl: diagramUrl,
          success: true
        });
        
        console.log(`✅ 生成完了: ${section.title}`);
      } catch (error: any) {
        console.error(`❌ 生成失敗: ${section.title}`, error.message);
        results.push({
          h2Title: section.title,
          h2Index: section.index,
          imageUrl: '',
          success: false,
          error: error.message
        });
      }
    }

    const generationTime = Date.now() - startTime;
    const successCount = results.filter(r => r.success).length;
    
    console.log(`\n✅ H2図解生成完了 (${generationTime}ms)`);
    console.log(`  成功: ${successCount}/${results.length}件`);

    return NextResponse.json({
      success: true,
      diagrams: results,
      totalH2s: h2Sections.length,
      generatedCount: successCount,
      generationTime
    });

  } catch (error: any) {
    console.error('❌ H2図解生成エラー:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || '図解生成に失敗しました',
        details: error.toString()
      },
      { status: 500 }
    );
  }
}

/**
 * Fragment ID（{#...}）を削除するヘルパー関数
 */
function removeFragmentId(text: string): string {
  // {#main-topic-1} のようなパターンを削除
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
    // H2を検出（## で始まる行）
    const h2Match = line.match(/^##\s+(.+)$/);
    
    if (h2Match) {
      // 前のH2セクションを保存
      if (currentH2) {
        currentH2.content = removeFragmentId(contentLines.join('\n').trim());
        sections.push(currentH2);
      }
      
      // 新しいH2セクションを開始（タイトルからFragment IDを削除）
      currentH2 = {
        title: removeFragmentId(h2Match[1].trim()),
        content: '',
        index: h2Index++
      };
      contentLines = [];
    } else if (currentH2) {
      // H3以降のヘッダーまたはコンテンツ（Fragment IDを削除）
      if (!line.match(/^#\s/)) { // H1は除外
        contentLines.push(removeFragmentId(line));
      }
    }
  }
  
  // 最後のH2セクションを保存
  if (currentH2) {
    currentH2.content = removeFragmentId(contentLines.join('\n').trim());
    sections.push(currentH2);
  }
  
  return sections;
}

// 各H2に異なるスタイルを適用するための設定
const DIAGRAM_STYLES = [
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
  }
];

/**
 * H2セクションから図解画像を生成
 */
async function generateDiagramForH2(
  section: H2Section,
  articleTitle: string,
  genAI: GoogleGenerativeAI
): Promise<string> {
  
  // 各H2に異なるスタイルを適用
  const styleIndex = section.index % DIAGRAM_STYLES.length;
  const diagramStyle = DIAGRAM_STYLES[styleIndex];
  
  const prompt = buildDiagramPrompt(section, articleTitle, diagramStyle);
  
  // Nano Banana 2 で図解生成
  const model = genAI.getGenerativeModel({
    model: 'gemini-3.1-flash-image-preview'
  });

  const result = await model.generateContent({
    contents: [{
      role: 'user',
      parts: [{ text: prompt }]
    }],
    generationConfig: {
      responseModalities: ['TEXT', 'IMAGE'],
      temperature: 0.7, // 多様性のために少し上げる
      candidateCount: 1,
      maxOutputTokens: 8192,
    } as any,
  });

  // 生成された画像を取得
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
  const fileName = `h2-diagram-${timestamp}-${randomString}.${ext}`;
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

  // 公開URLを取得
  const { data: { publicUrl } } = supabaseServiceRole.storage
    .from('blog')
    .getPublicUrl(filePath);

  return publicUrl;
}

interface DiagramStyleConfig {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  style: string;
}

/**
 * セクション内容から要点を抽出（3-5個）
 */
function extractKeyPoints(content: string): string[] {
  const points: string[] = [];
  const lines = content.split('\n').filter(l => l.trim());
  
  for (const line of lines) {
    // 箇条書きを抽出
    const bulletMatch = line.match(/^[-・•]\s*(.+)$/);
    if (bulletMatch) {
      points.push(bulletMatch[1].trim());
    }
    // 番号付きリストを抽出
    const numberedMatch = line.match(/^\d+[.、]\s*(.+)$/);
    if (numberedMatch) {
      points.push(numberedMatch[1].trim());
    }
  }
  
  // 箇条書きがなければ、文章から短いキーワードを抽出
  if (points.length === 0) {
    const sentences = content.split(/[。\n]/).filter(s => s.trim().length > 5 && s.trim().length < 50);
    points.push(...sentences.slice(0, 5));
  }
  
  return points.slice(0, 5).map(p => p.substring(0, 30)); // 各ポイントは30文字以内
}

/**
 * 図解生成用プロンプト（シンプル・多様性重視）
 */
function buildDiagramPrompt(
  section: H2Section, 
  articleTitle: string,
  style: DiagramStyleConfig
): string {
  // 要点を抽出
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

