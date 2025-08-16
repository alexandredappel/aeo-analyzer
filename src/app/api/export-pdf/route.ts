import type { NextRequest } from 'next/server';
import puppeteer from 'puppeteer';

export const runtime = 'nodejs';

interface ScoreContribution {
  score: number;
  weight: number;
  contribution: number;
}

interface AEOScoreUI {
  totalScore: number;
  maxScore: number;
  breakdown: {
    discoverability: ScoreContribution;
    structuredData: ScoreContribution;
    llmFormatting: ScoreContribution;
    accessibility: ScoreContribution;
    readability: ScoreContribution;
  };
  completeness: string;
  metadata?: Record<string, unknown>;
}

type PerformanceStatus = 'excellent' | 'good' | 'warning' | 'error';

interface MetricCard {
  id: string;
  name: string;
  score: number;
  maxScore: number;
  status: PerformanceStatus;
  explanation: string;
  recommendations?: Array<{ problem: string; solution: string; explanation?: string; impact?: number }>;
  problems?: string[];
  solutions?: string[];
  successMessage: string;
}

interface DrawerSubSection {
  id: string;
  name: string;
  description: string;
  totalScore: number;
  maxScore: number;
  status: PerformanceStatus;
  cards: MetricCard[];
}

interface MainSectionUI {
  id: string;
  name: string;
  description: string;
  weightPercentage: number;
  totalScore: number;
  maxScore: number;
  status: PerformanceStatus;
  drawers: DrawerSubSection[];
}

interface ExportPdfRequestBody {
  url: string;
  metadata?: {
    basic?: Record<string, unknown>;
    collection?: Record<string, unknown>;
  } | null;
  analysis: {
    discoverability?: MainSectionUI;
    structuredData?: MainSectionUI;
    llmFormatting?: MainSectionUI;
    accessibility?: MainSectionUI;
    readability?: MainSectionUI;
    aeoScore?: AEOScoreUI;
  } | null;
}

function escapeHtml(input: unknown): string {
  const str = String(input ?? '');
  return str
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function formatSection(section: MainSectionUI): string {
  const lines: string[] = [];
  lines.push(`<h2>${escapeHtml(section.name)}</h2>`);
  // Main section: keep score only (no weights)
  lines.push(`<div>Score: ${section.totalScore}/${section.maxScore}</div>`);
  if (section.description) {
    lines.push(`<div>${escapeHtml(section.description)}</div>`);
  }
  for (const drawer of section.drawers || []) {
    // Sub-section: remove scores and statuses; show only names and optional description
    lines.push(`<h3>${escapeHtml(drawer.name)}</h3>`);
    if (drawer.description) {
      lines.push(`<div>${escapeHtml(drawer.description)}</div>`);
    }
    lines.push('<ul>');
    for (const card of drawer.cards || []) {
      // Metric card: remove score/status; show only name, then explanation/recommendations
      lines.push(`<li><strong>${escapeHtml(card.name)}</strong>`);
      if (card.explanation) {
        lines.push(`<div>Explanation: ${escapeHtml(card.explanation)}</div>`);
      }
      if (Array.isArray(card.recommendations) && card.recommendations.length > 0) {
        lines.push('<div>Recommendations:</div>');
        lines.push('<ul>');
        for (const rec of card.recommendations) {
          const impact = typeof rec.impact === 'number' ? ` (impact ${rec.impact}/10)` : '';
          lines.push(`<li>Problem: ${escapeHtml(rec.problem)}${impact}<br/>Solution: ${escapeHtml(rec.solution)}${rec.explanation ? `<br/>Note: ${escapeHtml(rec.explanation)}` : ''}</li>`);
        }
        lines.push('</ul>');
      } else if (Array.isArray(card.problems) && Array.isArray(card.solutions) && card.problems.length === card.solutions.length && card.problems.length > 0) {
        lines.push('<div>Recommendations:</div>');
        lines.push('<ul>');
        for (let i = 0; i < card.problems.length; i++) {
          lines.push(`<li>Problem: ${escapeHtml(card.problems[i])}<br/>Solution: ${escapeHtml(card.solutions[i])}</li>`);
        }
        lines.push('</ul>');
      } else if (card.successMessage) {
        lines.push(`<div>Success: ${escapeHtml(card.successMessage)}</div>`);
      }
      lines.push('</li>');
    }
    lines.push('</ul>');
  }
  return lines.join('\n');
}

function buildPlainHtmlReport(payload: ExportPdfRequestBody): string {
  const { url, metadata, analysis } = payload;
  const title = (metadata?.basic as any)?.title || 'AEO Report';
  const description = (metadata?.basic as any)?.description || '';
  const now = new Date().toISOString();

  const parts: string[] = [];
  parts.push('<!doctype html>');
  parts.push('<html lang="en">');
  parts.push('<head>');
  parts.push('<meta charset="utf-8" />');
  parts.push('<meta name="viewport" content="width=device-width, initial-scale=1" />');
  parts.push(`<title>${escapeHtml(title)}</title>`);
  // Style minimal, proche d'un document brut
  parts.push(`
<style>
body{font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; color:#111; line-height:1.4; font-size:12px;}
h1{font-size:20px;margin:0 0 8px 0}
h2{font-size:16px;margin:16px 0 4px 0}
h3{font-size:13px;margin:10px 0 4px 0}
ul{margin:4px 0 8px 16px;padding:0}
li{margin:2px 0}
hr{border:none;border-top:1px solid #ccc;margin:10px 0}
.meta{font-size:12px;margin-bottom:8px}
.small{color:#555}
</style>`);
  parts.push('</head>');
  parts.push('<body>');
  // Top meta with labels
  parts.push(`<div><strong>Title:</strong> ${escapeHtml(title)}</div>`);
  if (description) parts.push(`<div><strong>Description:</strong> ${escapeHtml(description)}</div>`);
  parts.push(`<div class="meta">URL: ${escapeHtml(url)}<br/>Generated at: ${escapeHtml(now)}</div>`);
  parts.push('<hr/>');

  if (analysis?.aeoScore) {
    const a = analysis.aeoScore;
    // Rename AEO → GEO and remove percent display
    parts.push(`<div><strong>GEO Score:</strong> ${a.totalScore}/${a.maxScore}</div>`);
    parts.push('<ul>');
    parts.push(`<li>Discoverability: ${a.breakdown.discoverability.score}</li>`);
    parts.push(`<li>Structured Data: ${a.breakdown.structuredData.score}</li>`);
    parts.push(`<li>LLM Formatting: ${a.breakdown.llmFormatting.score}</li>`);
    parts.push(`<li>Accessibility: ${a.breakdown.accessibility.score}</li>`);
    parts.push(`<li>Readability: ${a.breakdown.readability.score}</li>`);
    parts.push('</ul>');
    parts.push('<hr/>');
  }

  const sectionOrder: Array<keyof NonNullable<ExportPdfRequestBody['analysis']>> = [
    'discoverability','structuredData','llmFormatting','accessibility','readability'
  ];
  for (const key of sectionOrder) {
    const section = analysis?.[key] as MainSectionUI | undefined;
    if (!section) continue;
    parts.push(formatSection(section));
    parts.push('<hr/>');
  }

  parts.push('</body></html>');
  return parts.join('\n');
}

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const payload = (await request.json()) as ExportPdfRequestBody;
    if (!payload || !payload.url || !payload.analysis) {
      return Response.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const html = buildPlainHtmlReport(payload);

    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      headless: true
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '12mm', right: '12mm', bottom: '12mm', left: '12mm' }
    });
    await page.close();
    await browser.close();

    // Filename from domain
    // Filename: "GEO Report - {{urlanalyzed}} - {{date}}"
    const now = new Date();
    const yyyy = String(now.getFullYear());
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    let analyzed = 'site';
    try {
      const u = new URL(payload.url);
      analyzed = u.hostname;
    } catch {
      // sanitize general string
      analyzed = payload.url.replace(/https?:\/\//, '').replace(/[^a-zA-Z0-9.-]+/g, '_');
    }
    const filename = `GEO Report - ${analyzed} - ${yyyy}-${mm}-${dd}.pdf`;

    return new Response(pdf, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store'
      }
    });
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
}


