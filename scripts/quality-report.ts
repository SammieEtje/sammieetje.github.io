// 001:T019 Condense Lighthouse results into quality-report.json and a step summary (001:FR-019)
// 009:T004 Report v2: merges shard manifests, adds test counts and pipeline timing (009:FR-003)
import { appendFileSync, existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { basename, dirname, join } from 'node:path';
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

export interface TestCounts {
  unit: number | null;
  e2e: number | null;
}

export interface QualityReport {
  schemaVersion: 2;
  commit: string;
  runStartedAt: string | null;
  generatedAt: string;
  durationSeconds: number | null;
  pages: { url: string; scores: Scores; scriptBytes: number }[];
  budgets: Budgets;
  tests: TestCounts;
  passed: boolean;
}

const categories: Category[] = ['performance', 'accessibility', 'best-practices', 'seo'];

function sitePath(url: string): string {
  return new URL(url).pathname.replace(/index\.html$/, '');
}

export function buildQualityReport(
  runs: Run[],
  meta: { commit: string; generatedAt: string; runStartedAt: string | null; tests: TestCounts },
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
  const durationSeconds = meta.runStartedAt
    ? Math.round((Date.parse(meta.generatedAt) - Date.parse(meta.runStartedAt)) / 1000)
    : null;
  return {
    schemaVersion: 2,
    commit: meta.commit,
    runStartedAt: meta.runStartedAt,
    generatedAt: meta.generatedAt,
    durationSeconds,
    pages,
    budgets,
    tests: meta.tests,
    passed,
  };
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

/** Read one or more manifests; each result file is looked up next to its own manifest. */
export function loadRuns(manifestPaths: string[]): Run[] {
  return manifestPaths.flatMap((manifestPath) => {
    const entries = JSON.parse(readFileSync(manifestPath, 'utf8')) as ManifestEntry[];
    return entries.map((entry) => ({
      url: entry.url,
      isRepresentativeRun: entry.isRepresentativeRun,
      summary: entry.summary,
      scriptBytes: entry.isRepresentativeRun
        ? scriptBytesOf(join(dirname(manifestPath), basename(entry.jsonPath)))
        : 0,
    }));
  });
}

function readJson<T>(path: string): T | null {
  try {
    return JSON.parse(readFileSync(path, 'utf8')) as T;
  } catch {
    return null;
  }
}

/** Passed tests from the Vitest and Playwright JSON reporters; null when a report is missing. */
export function countTests(unitPath: string, e2ePath: string): TestCounts {
  const unit = readJson<{ numPassedTests?: number }>(unitPath);
  const e2e = readJson<{ stats?: { expected?: number; flaky?: number } }>(e2ePath);
  return {
    unit: unit?.numPassedTests ?? null,
    e2e: e2e?.stats ? (e2e.stats.expected ?? 0) + (e2e.stats.flaky ?? 0) : null,
  };
}

function currentCommit(): string {
  if (process.env['GITHUB_SHA']) return process.env['GITHUB_SHA'];
  try {
    return execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
  } catch {
    return 'local';
  }
}

function manifests(): string[] {
  const local = '.lighthouseci/reports/manifest.json';
  const shardsDir = '.lighthouseci/shards';
  const shards = existsSync(shardsDir)
    ? readdirSync(shardsDir)
        .map((dir) => join(shardsDir, dir, 'manifest.json'))
        .filter((path) => existsSync(path))
    : [];
  return shards.length > 0 ? shards : existsSync(local) ? [local] : [];
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const report = buildQualityReport(loadRuns(manifests()), {
    commit: currentCommit(),
    generatedAt: new Date().toISOString(),
    runStartedAt: process.env['RUN_STARTED_AT'] || null,
    tests: countTests('reports/unit.json', 'reports/e2e.json'),
  });
  writeFileSync('quality-report.json', `${JSON.stringify(report, null, 2)}\n`);
  const summary = renderSummary(report);
  if (process.env['GITHUB_STEP_SUMMARY'])
    appendFileSync(process.env['GITHUB_STEP_SUMMARY'], summary);
  console.log(summary);
}
