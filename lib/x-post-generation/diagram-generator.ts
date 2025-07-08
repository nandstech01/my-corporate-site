export interface DiagramRequest {
  content: string;
  diagramType: 'comparison' | 'flow' | 'ascii' | 'timeline';
  title: string;
  context?: string;
}

export interface GeneratedDiagram {
  diagram: string;
  description: string;
  instructions: string;
}

export class DiagramGenerator {
  /**
   * コンテンツに基づいて図解を生成
   */
  async generateDiagram(request: DiagramRequest): Promise<GeneratedDiagram> {
    const { content, diagramType, title, context } = request;
    
    switch (diagramType) {
      case 'comparison':
        return this.generateComparisonDiagram(content, title);
      case 'flow':
        return this.generateFlowDiagram(content, title);
      case 'ascii':
        return this.generateASCIIDiagram(content, title);
      case 'timeline':
        return this.generateTimelineDiagram(content, title);
      default:
        throw new Error(`Unsupported diagram type: ${diagramType}`);
    }
  }

  /**
   * 比較表形式の図解を生成
   */
  private generateComparisonDiagram(content: string, title: string): GeneratedDiagram {
    const prompt = `以下のコンテンツから比較表を作成してください：

内容: ${content}

要件：
- ASCII文字のみを使用
- 分かりやすい表形式
- 3つ以下の比較項目
- 各項目は簡潔に（20文字以内）
- Xに投稿できるサイズ（8行以内）`;

    // 基本的な比較表テンプレート
    const diagram = `┌──────────────┬──────────────┬──────────────┐
│   項目A      │   項目B      │   項目C      │
├──────────────┼──────────────┼──────────────┤
│ 特徴1        │ 特徴1        │ 特徴1        │
│ 特徴2        │ 特徴2        │ 特徴2        │
│ 特徴3        │ 特徴3        │ 特徴3        │
└──────────────┴──────────────┴──────────────┘`;

    return {
      diagram,
      description: `${title}の比較表`,
      instructions: 'この比較表をX投稿に含めて視覚的な理解を促進'
    };
  }

  /**
   * フロー図を生成
   */
  private generateFlowDiagram(content: string, title: string): GeneratedDiagram {
    const diagram = `┌─────────┐    ┌─────────┐    ┌─────────┐
│ STEP 1  │───▶│ STEP 2  │───▶│ STEP 3  │
└─────────┘    └─────────┘    └─────────┘
     │              │              │
     ▼              ▼              ▼
  詳細説明       詳細説明       詳細説明`;

    return {
      diagram,
      description: `${title}のプロセスフロー`,
      instructions: 'ステップごとの流れを分かりやすく図示'
    };
  }

  /**
   * ASCII図解を生成
   */
  private generateASCIIDiagram(content: string, title: string): GeneratedDiagram {
    const diagram = `    🏗️ ${title}
    
    ▲ 高度
    │
    ├── 専門レベル  ■■■■■
    ├── 中級レベル  ■■■
    ├── 初級レベル  ■
    └─────────────▶ 時間`;

    return {
      diagram,
      description: `${title}の概念図`,
      instructions: 'ASCII文字で概念を視覚化'
    };
  }

  /**
   * タイムライン図を生成
   */
  private generateTimelineDiagram(content: string, title: string): GeneratedDiagram {
    const diagram = `${title} タイムライン

2024 ●─────● 現在
     │     │
     │     └─ 技術の成熟
     │
     └─ 初期段階
     
2025 ●─────● 予測
     │     │
     │     └─ 普及段階
     │
     └─ 実用化`;

    return {
      diagram,
      description: `${title}のタイムライン`,
      instructions: '時系列での変化を視覚化'
    };
  }

  /**
   * コンテンツから最適な図解タイプを推定
   */
  suggestDiagramType(content: string): 'comparison' | 'flow' | 'ascii' | 'timeline' {
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('比較') || lowerContent.includes('vs') || lowerContent.includes('違い')) {
      return 'comparison';
    }
    
    if (lowerContent.includes('ステップ') || lowerContent.includes('フロー') || lowerContent.includes('手順')) {
      return 'flow';
    }
    
    if (lowerContent.includes('将来') || lowerContent.includes('予測') || lowerContent.includes('タイムライン')) {
      return 'timeline';
    }
    
    return 'ascii';
  }

  /**
   * 図解をX投稿に適したフォーマットに調整
   */
  formatForTwitter(diagram: string, maxLines: number = 8): string {
    const lines = diagram.split('\n');
    
    if (lines.length <= maxLines) {
      return diagram;
    }
    
    // 行数が多すぎる場合は圧縮
    const important = lines.filter((line, index) => 
      index === 0 || // タイトル行
      line.includes('─') || // 区切り線
      line.includes('│') || // 表の列
      line.includes('●') || // ポイント
      line.includes('▶') || // 矢印
      line.includes('■')    // グラフ
    );
    
    return important.slice(0, maxLines).join('\n');
  }

  /**
   * 複数の図解タイプを生成して最適なものを選択
   */
  async generateOptimalDiagram(content: string, title: string): Promise<GeneratedDiagram> {
    const suggestedType = this.suggestDiagramType(content);
    
    try {
      return await this.generateDiagram({
        content,
        diagramType: suggestedType,
        title
      });
    } catch (error) {
      // フォールバック：ASCIIタイプ
      return this.generateASCIIDiagram(content, title);
    }
  }
} 