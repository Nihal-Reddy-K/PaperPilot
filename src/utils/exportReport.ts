import type { AcademicPaper, PaperComparison, StructuredResearchGap } from '../types/paper.ts';

export interface ReportExportData {
  topic: string;
  keywords?: string;
  papers: AcademicPaper[];
  comparison: PaperComparison | null;
  gaps: StructuredResearchGap[];
}

export function generateMarkdownReport(data: ReportExportData): string {
  const { topic, keywords, papers, comparison, gaps } = data;
  const dateStr = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  let md = `# Academic Research Synthesis & Literature Review\n\n`;
  md += `**Research Focus:** ${topic}\n\n`;
  if (keywords && keywords.trim()) {
    md += `**Keywords:** ${keywords}\n\n`;
  }
  md += `**Date:** ${dateStr}  \n`;
  md += `**Tool:** PaperPilot AI Research Assistant  \n`;
  md += `**Corpus Analyzed:** ${papers.length} publications\n\n`;
  md += `---\n\n`;

  // 1. Executive Summary / Overview
  md += `## 1. Executive Research Scope\n\n`;
  md += `This literature report synthesizes key findings, comparative methodology analyses, and underexplored research gaps across ${papers.length} academic works relevant to **"${topic}"**.\n\n`;

  // 2. Comparative Synthesis
  md += `## 2. Multi-Paper Comparative Synthesis\n\n`;
  if (comparison) {
    if (comparison.commonThemes && comparison.commonThemes.length > 0) {
      md += `### 2.1 Shared Research Themes & Objectives\n\n`;
      comparison.commonThemes.forEach((theme) => {
        md += `- ${theme}\n`;
      });
      md += `\n`;
    }

    if (comparison.keyDifferences && comparison.keyDifferences.length > 0) {
      md += `### 2.2 Key Differences & Divergent Architectural Paradigms\n\n`;
      comparison.keyDifferences.forEach((diff) => {
        md += `- ${diff}\n`;
      });
      md += `\n`;
    }

    if (comparison.methodologyComparison && comparison.methodologyComparison.length > 0) {
      md += `### 2.3 Methodology Comparison Matrix\n\n`;
      const paperHeaders = papers.slice(0, 5).map((p) => p.title.slice(0, 25).trim() + '...').join(' | ');
      md += `| Evaluation Aspect | ${paperHeaders} |\n`;
      md += `|:---|${papers.slice(0, 5).map(() => ':---').join('|')}|\n`;
      comparison.methodologyComparison.forEach((m) => {
        const row = m.breakdown.slice(0, 5).map((b) => b.approach.replace(/\|/g, '-').trim()).join(' | ');
        md += `| **${m.aspect}** | ${row} |\n`;
      });
      md += `\n`;
    }

    if (comparison.benchmarkComparison && comparison.benchmarkComparison.length > 0) {
      md += `### 2.4 Benchmark & Experimental Setup Matrix\n\n`;
      md += `| Paper | Workloads / Datasets | Hardware / Testbed | Reported Key Metrics |\n`;
      md += `|:---|:---|:---|:---|\n`;
      comparison.benchmarkComparison.forEach((b) => {
        md += `| **${b.paperTitle.replace(/\|/g, '-')}** | ${b.workloadsOrDatasets.replace(/\|/g, '-')} | ${b.hardwareOrTestbed.replace(/\|/g, '-')} | ${b.reportedKeyMetrics.replace(/\|/g, '-')} |\n`;
      });
      md += `\n`;
    }

    if (comparison.tradeoffSynthesis) {
      md += `### 2.5 Consolidated Trade-off Synthesis\n\n`;
      md += `${comparison.tradeoffSynthesis}\n\n`;
    }

    if (comparison.recommendations && comparison.recommendations.length > 0) {
      md += `### 2.6 Actionable Recommendations for Researchers\n\n`;
      comparison.recommendations.forEach((rec) => {
        md += `- ${rec}\n`;
      });
      md += `\n`;
    }
  } else {
    md += `*Note: Comparative synthesis has not been generated for this selection. Run "Compare Papers" in PaperPilot to populate common themes, methodology matrices, and trade-off synthesis.*\n\n`;
  }

  md += `---\n\n`;

  // 3. Identified Research Gaps
  md += `## 3. Identified Research Gaps & Open Frontiers\n\n`;
  md += `> **Methodological Disclaimer:** Patterns and possible gaps are synthesized by AI analysis across the retrieved literature corpus. They highlight potential omissions, divergent assumptions, or evaluation boundary conditions and should be empirically verified against primary sources.\n\n`;

  if (gaps && gaps.length > 0) {
    gaps.forEach((g, idx) => {
      md += `### Gap 0${idx + 1}: ${g.possibleGap}\n\n`;
      md += `- **Why Underexplored:** ${g.whyUnderexplored}\n`;
      md += `- **Evidence from Literature:** ${g.evidenceFromLiterature}\n`;
      if (g.supportingPapers && g.supportingPapers.length > 0) {
        md += `- **Supporting Corpus Works:** ${g.supportingPapers.join('; ')}\n`;
      }
      md += `- **Potential Research Direction:** ${g.potentialResearchDirection}\n\n`;
    });
  } else {
    md += `*Note: Research gaps have not been analyzed for this session. Use "Discover Gaps" in PaperPilot to extract underexplored intersections and evaluation blindspots.*\n\n`;
  }

  md += `---\n\n`;

  // 4. Analyzed Literature Corpus
  md += `## 4. Analyzed Literature Corpus (${papers.length} Works)\n\n`;
  if (papers.length === 0) {
    md += `*No specific papers selected.*\n\n`;
  } else {
    papers.forEach((p, idx) => {
      md += `### [${idx + 1}] ${p.title}\n\n`;
      md += `- **Authors:** ${p.authors.join(', ') || 'Unknown'}\n`;
      md += `- **Venue & Year:** ${p.venue || 'Academic Publication'} (${p.year || 'N/A'})\n`;
      if (p.doi) md += `- **DOI:** [${p.doi}](https://doi.org/${p.doi})\n`;
      if (p.citationCount !== null) md += `- **Citations:** ${p.citationCount}\n`;
      if (p.sourceUrl) md += `- **Source URL:** [${p.sourceUrl}](${p.sourceUrl})\n`;
      if (p.pdfUrl) md += `- **Direct PDF:** [Open Access Link](${p.pdfUrl})\n`;
      md += `\n**Abstract:**  \n${p.abstract || 'No abstract available.'}\n\n`;
    });
  }

  md += `---\n\n`;
  md += `*Report generated by PaperPilot AI Research Assistant. Optimized for offline literature review.*`;
  return md;
}

export function downloadMarkdownFile(content: string, filename: string = 'research_synthesis.md') {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function generateHtmlReport(data: ReportExportData): string {
  const { topic, keywords, papers, comparison, gaps } = data;
  const dateStr = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Literature Review & Research Gaps - ${escapeHtml(topic)}</title>
  <style>
    @page {
      margin: 18mm 16mm;
      size: A4 portrait;
    }
    * {
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      line-height: 1.6;
      color: #171717;
      background: #ffffff;
      padding: 24px;
      margin: 0 auto;
      max-width: 900px;
      font-size: 10pt;
    }
    .header-bar {
      border-bottom: 2px solid #111827;
      padding-bottom: 14px;
      margin-bottom: 24px;
    }
    .brand-tag {
      font-size: 8.5pt;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #6b7280;
      font-weight: 700;
      margin-bottom: 6px;
    }
    h1 {
      font-size: 20pt;
      font-weight: 700;
      color: #111827;
      margin: 0 0 10px 0;
      line-height: 1.25;
    }
    .meta-line {
      font-size: 9.5pt;
      color: #4b5563;
      margin-top: 6px;
    }
    .meta-item {
      display: inline-block;
      margin-right: 14px;
    }
    h2 {
      font-size: 13pt;
      font-weight: 700;
      color: #111827;
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 6px;
      margin-top: 32px;
      margin-bottom: 14px;
      page-break-after: avoid;
    }
    h3 {
      font-size: 10.5pt;
      font-weight: 600;
      color: #1f2937;
      margin-top: 20px;
      margin-bottom: 8px;
      page-break-after: avoid;
    }
    p, li {
      font-size: 9.5pt;
      color: #374151;
    }
    ul {
      margin: 6px 0 16px 20px;
      padding: 0;
    }
    li {
      margin-bottom: 6px;
    }
    .abstract-callout {
      background: #f9fafb;
      border-left: 3px solid #9ca3af;
      padding: 8px 12px;
      margin: 8px 0 16px 0;
      font-size: 9pt;
      color: #4b5563;
      line-height: 1.5;
    }
    .paper-entry {
      margin-bottom: 22px;
      padding-bottom: 14px;
      border-bottom: 1px solid #f3f4f6;
      page-break-inside: avoid;
    }
    .paper-entry:last-child {
      border-bottom: none;
    }
    .paper-title {
      font-size: 11pt;
      font-weight: 600;
      color: #111827;
      margin-bottom: 3px;
    }
    .paper-meta {
      font-size: 8.5pt;
      color: #6b7280;
      margin-bottom: 8px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 14px 0 22px 0;
      font-size: 8.5pt;
      page-break-inside: avoid;
    }
    th, td {
      border: 1px solid #e5e7eb;
      padding: 7px 10px;
      text-align: left;
      vertical-align: top;
    }
    th {
      background: #f3f4f6;
      font-weight: 600;
      color: #111827;
    }
    tr:nth-child(even) td {
      background: #fafafa;
    }
    .gap-box {
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      padding: 12px 16px;
      margin-bottom: 16px;
      page-break-inside: avoid;
      background: #fdfdfd;
    }
    .gap-badge {
      display: inline-block;
      font-size: 7.5pt;
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 0.5px;
      background: #e5e7eb;
      color: #374151;
      padding: 2px 7px;
      border-radius: 3px;
      margin-bottom: 6px;
    }
    .gap-title {
      font-size: 11pt;
      font-weight: 600;
      color: #111827;
      margin-top: 2px;
      margin-bottom: 8px;
    }
    .disclaimer-box {
      font-size: 8.5pt;
      color: #6b7280;
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      padding: 8px 12px;
      border-radius: 4px;
      margin: 12px 0 20px 0;
    }
    .footer {
      border-top: 1px solid #e5e7eb;
      padding-top: 12px;
      margin-top: 36px;
      font-size: 8pt;
      color: #9ca3af;
      display: flex;
      justify-content: space-between;
    }
    @media print {
      body {
        padding: 0;
        max-width: 100%;
      }
      .no-print {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="header-bar">
    <div class="brand-tag">PaperPilot AI • Literature Review & Synthesis</div>
    <h1>${escapeHtml(topic)}</h1>
    <div class="meta-line">
      <span class="meta-item"><strong>Date:</strong> ${dateStr}</span>
      <span class="meta-item"><strong>Corpus Size:</strong> ${papers.length} publications</span>
      ${keywords ? `<span class="meta-item"><strong>Keywords:</strong> ${escapeHtml(keywords)}</span>` : ''}
    </div>
  </div>

  ${comparison ? `
    <h2>1. Multi-Paper Comparative Synthesis</h2>
    
    ${comparison.commonThemes && comparison.commonThemes.length > 0 ? `
      <h3>1.1 Shared Research Themes & Objectives</h3>
      <ul>
        ${comparison.commonThemes.map(t => `<li>${escapeHtml(t)}</li>`).join('')}
      </ul>
    ` : ''}

    ${comparison.keyDifferences && comparison.keyDifferences.length > 0 ? `
      <h3>1.2 Key Differences & Divergent Approaches</h3>
      <ul>
        ${comparison.keyDifferences.map(d => `<li>${escapeHtml(d)}</li>`).join('')}
      </ul>
    ` : ''}

    ${comparison.methodologyComparison && comparison.methodologyComparison.length > 0 ? `
      <h3>1.3 Methodology Comparison Matrix</h3>
      <table>
        <thead>
          <tr>
            <th style="width: 25%;">Evaluation Dimension</th>
            ${papers.slice(0, 5).map((p, i) => `<th>[${i + 1}] ${escapeHtml(p.title.slice(0, 28))}...</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${comparison.methodologyComparison.map(m => `
            <tr>
              <td><strong>${escapeHtml(m.aspect)}</strong></td>
              ${m.breakdown.slice(0, 5).map(b => `<td>${escapeHtml(b.approach)}</td>`).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    ` : ''}

    ${comparison.benchmarkComparison && comparison.benchmarkComparison.length > 0 ? `
      <h3>1.4 Benchmark & Evaluation Setup Matrix</h3>
      <table>
        <thead>
          <tr>
            <th>Paper</th>
            <th>Workloads / Datasets</th>
            <th>Hardware / Testbed</th>
            <th>Reported Key Metrics</th>
          </tr>
        </thead>
        <tbody>
          ${comparison.benchmarkComparison.map(b => `
            <tr>
              <td><strong>${escapeHtml(b.paperTitle)}</strong></td>
              <td>${escapeHtml(b.workloadsOrDatasets)}</td>
              <td>${escapeHtml(b.hardwareOrTestbed)}</td>
              <td>${escapeHtml(b.reportedKeyMetrics)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    ` : ''}

    ${comparison.tradeoffSynthesis ? `
      <h3>1.5 Consolidated Trade-off Synthesis</h3>
      <p>${escapeHtml(comparison.tradeoffSynthesis)}</p>
    ` : ''}

    ${comparison.recommendations && comparison.recommendations.length > 0 ? `
      <h3>1.6 Actionable Recommendations for Research</h3>
      <ul>
        ${comparison.recommendations.map(r => `<li>${escapeHtml(r)}</li>`).join('')}
      </ul>
    ` : ''}
  ` : ''}

  ${gaps && gaps.length > 0 ? `
    <h2>2. Identified Research Gaps & Open Frontiers</h2>
    <div class="disclaimer-box">
      <strong>Methodological Note:</strong> Patterns and possible research gaps identified across the selected literature. These observations highlight boundary conditions and underexplored intersections and should be verified against primary sources.
    </div>

    ${gaps.map((g, idx) => `
      <div class="gap-box">
        <span class="gap-badge">Possible Research Gap 0${idx + 1}</span>
        <div class="gap-title">${escapeHtml(g.possibleGap)}</div>
        <p><strong>Why Underexplored:</strong> ${escapeHtml(g.whyUnderexplored)}</p>
        <p><strong>Evidence from Literature:</strong> <em>${escapeHtml(g.evidenceFromLiterature)}</em></p>
        ${g.supportingPapers && g.supportingPapers.length > 0 ? `
          <p><strong>Supporting Works:</strong> ${g.supportingPapers.map(p => escapeHtml(p)).join('; ')}</p>
        ` : ''}
        <p><strong>Potential Research Direction:</strong> ${escapeHtml(g.potentialResearchDirection)}</p>
      </div>
    `).join('')}
  ` : ''}

  <h2>3. Analyzed Publications Corpus (${papers.length} Works)</h2>
  ${papers.map((p, idx) => `
    <div class="paper-entry">
      <div class="paper-title">[${idx + 1}] ${escapeHtml(p.title)}</div>
      <div class="paper-meta">
        ${escapeHtml(p.authors.join(', ') || 'Unknown')} &nbsp;•&nbsp; 
        <em>${escapeHtml(p.venue || 'Academic Publication')}</em> (${p.year || 'N/A'})
        ${p.doi ? `&nbsp;•&nbsp; DOI: ${escapeHtml(p.doi)}` : ''}
        ${p.citationCount !== null ? `&nbsp;•&nbsp; ${p.citationCount} citations` : ''}
      </div>
      <div class="abstract-callout">${escapeHtml(p.abstract || 'No abstract available.')}</div>
    </div>
  `).join('')}

  <div class="footer">
    <span>Generated by PaperPilot AI Research Assistant</span>
    <span>Synthesis Date: ${dateStr}</span>
  </div>
</body>
</html>`;
}

/**
 * Triggers the native browser Print / Save as PDF dialog without window.open or window.alert.
 * Uses a hidden iframe injected into the document, which respects iframe sandboxing rules.
 */
export function printOrSavePdfReport(data: ReportExportData): boolean {
  try {
    const html = generateHtmlReport(data);
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.visibility = 'hidden';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      document.body.removeChild(iframe);
      // Fallback: download standalone HTML
      downloadHtmlReport(data);
      return false;
    }

    doc.open();
    doc.write(html);
    doc.close();

    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (err) {
        console.error('Print trigger error:', err);
        downloadHtmlReport(data);
      } finally {
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 1500);
      }
    }, 350);

    return true;
  } catch (err) {
    console.error('Failed to trigger PDF printing:', err);
    downloadHtmlReport(data);
    return false;
  }
}

export function downloadHtmlReport(data: ReportExportData, filename?: string) {
  const html = generateHtmlReport(data);
  const defaultFilename = `research_report_${data.topic.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 30)}.html`;
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || defaultFilename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
