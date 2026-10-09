// 001:T019 Condense Lighthouse results into quality-report.json and a step summary (001:FR-019)
import { appendFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { execSync } from 'node:child_process';

const require = createRequire(import.meta.url);
const lighthouserc = require('../lighthouserc.cjs') as { budgets: Budgets };

export type Category = 'performance' | 'accessibility' | 'best-practices' | 'seo';
export type Scores = Record<Category, number>;
export type Budgets = Scores & { scriptBytes: number };

export const budgets: Budgets = lighthouserc.budgets;

export interface Run {
  url: string;
  isRepresentativeRun: boolean;
  summary: Scores;
  scriptBytes: number;
}

export interface QualityReport {
  schemaVersion: 1;
  commit: string;
  generatedAt: string;
  pages: { url: string; scores: Scores; scriptBytes: number }[];
  budgets: Budgets;
  passed: boolean;
}

const categories: Category[] = ['performance', 'accessibility', 'best-practices', 'seo'];

function sitePath(url: string): string {
  return new URL(url).pathname.replace(/index\.html$/, '');
}

export function buildQualityReport(
  runs: Run[],
  meta: { commit: string; generatedAt: string },
): QualityReport {
  const pages = runs
    .filter((run) => run.isRepresentativeRun)
    .map((run) => ({
      url: sitePath(run.url),
      scores: Object.fromEntries(categories.map((c) => [c, run.summary[c]])) as Scores,
      scriptBytes: run.scriptBytes,
    }))
    .sort((a, b) => a.url.localeCompare(b.url));
  const passed =
    pages.length > 0 &&
    pages.every(
      (page) =>
        categories.every((c) => page.scores[c] >= budgets[c]) &&
        page.scriptBytes <= budgets.scriptBytes,
    );
  return { schemaVersion: 1, ...meta, pages, budgets, passed };
}

const pct = (score: number) => Math.round(score * 100);

export function renderSummary(report: QualityReport): string {
  const rows = report.pages.map(
    (p) =>
      `| \`${p.url}\` | ${pct(p.scores.performance)} | ${pct(p.scores.accessibility)} | ` +
      `${pct(p.scores['best-practices'])} | ${pct(p.scores.seo)} | ${p.scriptBytes} |`,
  );
  const b = report.budgets;
  return [
    '### Budgets',
    '| Page | Performance | Accessibility | Best practices | SEO | JS (bytes) |',
    '|---|---|---|---|---|---|',
    ...rows,
    `| **Budget** | ≥ ${pct(b.performance)} | ≥ ${pct(b.accessibility)} | ≥ ${pct(b['best-practices'])} | ≥ ${pct(b.seo)} | ≤ ${b.scriptBytes} |`,
    '',
    report.passed ? '✅ All budgets met.' : '❌ One or more budgets missed.',
    '',
  ].join('\n');
}

interface ManifestEntry {
  url: string;
  isRepresentativeRun: boolean;
  jsonPath: string;
  summary: Scores;
}

interface LighthouseResult {
  audits: Record<
    string,
    { details?: { items?: { resourceType: string; transferSize: number }[] } }
  >;
}

function scriptBytesOf(jsonPath: string): number {
  const lhr = JSON.parse(readFileSync(jsonPath, 'utf8')) as LighthouseResult;
  const items = lhr.audits['resource-summary']?.details?.items ?? [];
  return items.find((item) => item.resourceType === 'script')?.transferSize ?? 0;
}

function currentCommit(): string {
  if (process.env['GITHUB_SHA']) return process.env['GITHUB_SHA'];
  try {
    return execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
  } catch {
    return 'local';
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const manifestPath = '.lighthouseci/reports/manifest.json';
  const manifest: ManifestEntry[] = existsSync(manifestPath)
    ? (JSON.parse(readFileSync(manifestPath, 'utf8')) as ManifestEntry[])
    : [];
  const runs: Run[] = manifest.map((entry) => ({
    url: entry.url,
    isRepresentativeRun: entry.isRepresentativeRun,
    summary: entry.summary,
    scriptBytes: entry.isRepresentativeRun ? scriptBytesOf(entry.jsonPath) : 0,
  }));
  const report = buildQualityReport(runs, {
    commit: currentCommit(),
    generatedAt: new Date().toISOString(),
  });
  writeFileSync('quality-report.json', `${JSON.stringify(report, null, 2)}\n`);
  const summary = renderSummary(report);
  if (process.env['GITHUB_STEP_SUMMARY'])
    appendFileSync(process.env['GITHUB_STEP_SUMMARY'], summary);
  console.log(summary);
}
