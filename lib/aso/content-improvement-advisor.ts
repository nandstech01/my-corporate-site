/**
 * ASO Content Improvement Advisor
 * 
 * Phase 4.3.3: 改善提案ロジック（Keep/Revise/Optimize）
 * - Mike King理論準拠（データドリブン改善提案）
 * - トピック一貫性スコアに基づく分類
 * - 具体的なリライト提案生成
 * 
 * @version 1.0.0
 * @date 2026-01-12
 */

export interface FragmentAnalysis {
  fragment_id: string;
  title: string;
  content: string;
  similarity_to_centroid: number; // トピック一貫性スコア（0.0-1.0）
}

export interface ImprovementProposal {
  fragmentId: string;
  fragmentTitle: string;
  category: 'keep' | 'revise' | 'optimize';
  score: number; // 0-100点
  reason: string;
  suggestions: string[];
  priority: 'high' | 'medium' | 'low';
}

export interface ImprovementReport {
  summary: {
    totalFragments: number;
    keep: number; // 80点以上
    revise: number; // 50-79点
    optimize: number; // 49点以下
  };
  proposals: ImprovementProposal[];
  quickWins: ImprovementProposal[]; // 優先度高の提案
}

export class ContentImprovementAdvisor {
  /**
   * Mike King理論: データドリブン改善提案（Keep/Revise/Optimize）
   * 
   * 分類基準:
   * - Keep (80-100点): 高品質コンテンツ（維持推奨）
   * - Revise (50-79点): 中品質コンテンツ（リライト推奨）
   * - Optimize (0-49点): 低品質コンテンツ（統合/削除推奨）
   * 
   * @param fragments - Fragment分析結果
   * @returns 改善提案レポート
   */
  generateImprovementProposals(
    fragments: FragmentAnalysis[]
  ): ImprovementReport {
    console.log(`[ContentImprovementAdvisor] 改善提案生成開始: ${fragments.length}個のFragment`);
    
    const proposals: ImprovementProposal[] = [];
    const summary = {
      totalFragments: fragments.length,
      keep: 0,
      revise: 0,
      optimize: 0
    };
    
    for (const fragment of fragments) {
      const score = Math.round(fragment.similarity_to_centroid * 100);
      const proposal = this.createProposal(fragment, score);
      
      proposals.push(proposal);
      
      // サマリーカウント
      if (proposal.category === 'keep') {
        summary.keep++;
      } else if (proposal.category === 'revise') {
        summary.revise++;
      } else {
        summary.optimize++;
      }
    }
    
    // 優先度順にソート
    proposals.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
    
    // Quick Wins（優先度高の提案）を抽出
    const quickWins = proposals.filter(p => p.priority === 'high').slice(0, 5);
    
    console.log(`[ContentImprovementAdvisor] 改善提案生成完了:`);
    console.log(`  - Keep: ${summary.keep}個`);
    console.log(`  - Revise: ${summary.revise}個`);
    console.log(`  - Optimize: ${summary.optimize}個`);
    console.log(`  - Quick Wins: ${quickWins.length}個`);
    
    return {
      summary,
      proposals,
      quickWins
    };
  }
  
  /**
   * 個別Fragment向けの改善提案を作成
   */
  private createProposal(
    fragment: FragmentAnalysis,
    score: number
  ): ImprovementProposal {
    if (score >= 80) {
      return this.createKeepProposal(fragment, score);
    } else if (score >= 50) {
      return this.createReviseProposal(fragment, score);
    } else {
      return this.createOptimizeProposal(fragment, score);
    }
  }
  
  /**
   * Keep提案（80-100点）
   */
  private createKeepProposal(
    fragment: FragmentAnalysis,
    score: number
  ): ImprovementProposal {
    return {
      fragmentId: fragment.fragment_id,
      fragmentTitle: fragment.title,
      category: 'keep',
      score,
      reason: `トピック一貫性が非常に高いです（${score}点）。このセクションは主題と強く関連しており、ユーザーにとって価値の高いコンテンツです。`,
      suggestions: [
        '現在の構成を維持してください',
        '定期的に最新情報を追加して鮮度を保つことを推奨します',
        '関連する具体例や統計データを追加すると、さらに価値が高まります',
        'このセクションを参考に、他のセクションも強化することを検討してください'
      ],
      priority: 'low' // 現状維持なので優先度は低い
    };
  }
  
  /**
   * Revise提案（50-79点）
   */
  private createReviseProposal(
    fragment: FragmentAnalysis,
    score: number
  ): ImprovementProposal {
    // スコアに応じて優先度を決定
    const priority = score < 60 ? 'high' : 'medium';
    
    const suggestions: string[] = [];
    
    if (score < 60) {
      // 50-59点: 大幅なリライトが必要
      suggestions.push(
        `主題との関連性を強化してください（現在${score}点）`,
        'セクションの冒頭で、主題とこのセクションの関連性を明確に示してください',
        '主題に関連するキーワードを自然に追加してください',
        '具体例や根拠を追加して、主題との結びつきを強化してください',
        '冗長な部分や主題と関連の薄い記述を削除してください'
      );
    } else {
      // 60-79点: 部分的なリライトが有効
      suggestions.push(
        `主題との関連性をさらに強化できます（現在${score}点）`,
        'セクション内で使用するキーワードの一貫性を確保してください',
        '具体例や統計データを追加して、説得力を高めてください',
        '見出しと本文の内容が一致していることを確認してください',
        '他の高スコアセクションを参考に、構成を見直してください'
      );
    }
    
    return {
      fragmentId: fragment.fragment_id,
      fragmentTitle: fragment.title,
      category: 'revise',
      score,
      reason: `トピック一貫性が中程度です（${score}点）。リライトにより、さらに価値の高いコンテンツに改善できます。`,
      suggestions,
      priority
    };
  }
  
  /**
   * Optimize提案（0-49点）
   */
  private createOptimizeProposal(
    fragment: FragmentAnalysis,
    score: number
  ): ImprovementProposal {
    return {
      fragmentId: fragment.fragment_id,
      fragmentTitle: fragment.title,
      category: 'optimize',
      score,
      reason: `トピック一貫性が低いです（${score}点）。このセクションは主題から外れている可能性があります。統合または削除を検討してください。`,
      suggestions: [
        `主題との関連性を再検討してください（現在${score}点）`,
        'このセクションが本当に必要かを判断してください',
        '必要な場合: 主題との関連性が明確になるように、全面的に書き直してください',
        '不要な場合: 別のページへの移動、または削除を検討してください',
        '関連性のある他のセクションと統合することも選択肢です',
        'ページの目的と照らし合わせて、このセクションの役割を明確にしてください'
      ],
      priority: 'high' // 大きな改善余地があるため優先度高
    };
  }
  
  /**
   * 改善提案のMarkdownレポート生成
   */
  generateMarkdownReport(report: ImprovementReport): string {
    let markdown = '# コンテンツ改善提案レポート\n\n';
    markdown += '> Mike King理論に基づくデータドリブン分析\n\n';
    
    // サマリー
    markdown += '## 📊 サマリー\n\n';
    markdown += `- **総Fragment数**: ${report.summary.totalFragments}個\n`;
    markdown += `- **Keep (80-100点)**: ${report.summary.keep}個 ✅\n`;
    markdown += `- **Revise (50-79点)**: ${report.summary.revise}個 ⚠️\n`;
    markdown += `- **Optimize (0-49点)**: ${report.summary.optimize}個 ❌\n\n`;
    
    // 総合評価
    const keepRatio = (report.summary.keep / report.summary.totalFragments) * 100;
    let overallAssessment = '';
    
    if (keepRatio >= 70) {
      overallAssessment = '✅ **優秀**: ページ全体のトピック一貫性が非常に高いです。';
    } else if (keepRatio >= 50) {
      overallAssessment = '🟡 **良好**: トピック一貫性は良好ですが、改善の余地があります。';
    } else if (keepRatio >= 30) {
      overallAssessment = '⚠️ **要改善**: トピック一貫性が中程度です。リライトを推奨します。';
    } else {
      overallAssessment = '❌ **要見直し**: トピック一貫性が低いです。大幅な見直しが必要です。';
    }
    
    markdown += `**総合評価**: ${overallAssessment}\n\n`;
    
    // Quick Wins
    if (report.quickWins.length > 0) {
      markdown += '## 🎯 Quick Wins（優先対応推奨）\n\n';
      
      for (const proposal of report.quickWins) {
        markdown += `### ${proposal.fragmentTitle} (${proposal.score}点)\n\n`;
        markdown += `**カテゴリ**: ${this.getCategoryLabel(proposal.category)}\n\n`;
        markdown += `**理由**: ${proposal.reason}\n\n`;
        markdown += '**改善提案**:\n\n';
        
        for (const suggestion of proposal.suggestions) {
          markdown += `- ${suggestion}\n`;
        }
        
        markdown += '\n---\n\n';
      }
    }
    
    // カテゴリ別の詳細
    markdown += '## 📋 カテゴリ別詳細\n\n';
    
    // Keep
    const keepProposals = report.proposals.filter(p => p.category === 'keep');
    if (keepProposals.length > 0) {
      markdown += '### ✅ Keep（維持推奨）\n\n';
      
      for (const proposal of keepProposals) {
        markdown += `- **${proposal.fragmentTitle}** (${proposal.score}点)\n`;
      }
      
      markdown += '\n';
    }
    
    // Revise
    const reviseProposals = report.proposals.filter(p => p.category === 'revise');
    if (reviseProposals.length > 0) {
      markdown += '### ⚠️ Revise（リライト推奨）\n\n';
      
      for (const proposal of reviseProposals) {
        markdown += `- **${proposal.fragmentTitle}** (${proposal.score}点) - 優先度: ${this.getPriorityLabel(proposal.priority)}\n`;
      }
      
      markdown += '\n';
    }
    
    // Optimize
    const optimizeProposals = report.proposals.filter(p => p.category === 'optimize');
    if (optimizeProposals.length > 0) {
      markdown += '### ❌ Optimize（統合/削除検討）\n\n';
      
      for (const proposal of optimizeProposals) {
        markdown += `- **${proposal.fragmentTitle}** (${proposal.score}点)\n`;
      }
      
      markdown += '\n';
    }
    
    return markdown;
  }
  
  /**
   * カテゴリラベル取得
   */
  private getCategoryLabel(category: 'keep' | 'revise' | 'optimize'): string {
    switch (category) {
      case 'keep':
        return '✅ Keep（維持推奨）';
      case 'revise':
        return '⚠️ Revise（リライト推奨）';
      case 'optimize':
        return '❌ Optimize（統合/削除検討）';
    }
  }
  
  /**
   * 優先度ラベル取得
   */
  private getPriorityLabel(priority: 'high' | 'medium' | 'low'): string {
    switch (priority) {
      case 'high':
        return '🔴 高';
      case 'medium':
        return '🟡 中';
      case 'low':
        return '🟢 低';
    }
  }
}

