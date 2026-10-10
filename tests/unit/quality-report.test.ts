// 001:T016 Quality report from Lighthouse runs (001:FR-019)
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  budgets,
  buildQualityReport,
  countTests,
  exitStatus,
  loadRuns,
  pageFile,
  renderSummary,
  type Run,
} from '../../scripts/quality-report.ts';

const good = { performance: 0.98, accessibility: 1, 'best-practices': 1, seo: 1 };

const runs: Run[] = [
  {
    url: 'http://localhost:9000/',
    isRepresentativeRun: false,
    summary: { ...good, performance: 0.5 },
    scriptBytes: 0,
  },
  { url: 'http://localhost:9000/', isRepresentativeRun: true, summary: good, scriptBytes: 0 },
  {
    url: 'http://localhost:9000/nl/index.html',
    isRepresentativeRun: true,
    summary: good,
    scriptBytes: 1200,
  },
];

const meta = {
  commit: 'abc1234def',
  generatedAt: '2026-10-09T12:00:00.000Z',
  runStartedAt: null,
  tests: { unit: null, e2e: null },
};

describe('buildQualityReport()', () => {
  it('uses the constitution budgets', () => {
    expect(budgets).toEqual({
      performance: 0.9,
      accessibility: 0.95,
      'best-practices': 0.95,
      seo: 0.95,
      scriptBytes: 51200,
    });
  });

  it('keeps only the representative (median) run per page, with site-relative URLs', () => {
    const report = buildQualityReport(runs, meta);
    expect(report).toMatchObject({ schemaVersion: 2, ...meta, budgets, passed: true });
    expect(report.pages).toEqual([
      { url: '/', scores: good, scriptBytes: 0, scripts: { external: 0, inline: 0 } },
      { url: '/nl/', scores: good, scriptBytes: 1200, scripts: { external: 1200, inline: 0 } },
    ]);
  });

  it('fails when any page misses any budget', () => {
    const slow: Run = { ...runs[1]!, summary: { ...good, performance: 0.89 } };
    expect(buildQualityReport([slow], meta).passed).toBe(false);
    const heavy: Run = { ...runs[1]!, scriptBytes: 51201 };
    expect(buildQualityReport([heavy], meta).passed).toBe(false);
  });

  it('fails when there are no measurements at all', () => {
    expect(buildQualityReport([], meta).passed).toBe(false);
  });
});

describe('renderSummary()', () => {
  it('renders a Markdown table with one row per page and the verdict', () => {
    const md = renderSummary(buildQualityReport(runs, meta));
    expect(md).toContain(
      '| Page | Performance | Accessibility | Best practices | SEO | JS (bytes) |',
    );
    expect(md).toContain('| `/nl/` | 98 | 100 | 100 | 100 | 1200 |');
    expect(md).toContain('All budgets met');
  });
});

// 009:T002 Report v2: merged shards, test counts, timing (009:FR-003)
describe('report v2', () => {
  it('derives the duration from the run start, or null when unknown', () => {
    const timed = buildQualityReport(runs, {
      ...meta,
      runStartedAt: '2026-10-09T11:53:00.000Z',
    });
    expect(timed.durationSeconds).toBe(420);
    expect(buildQualityReport(runs, meta).durationSeconds).toBeNull();
  });

  it('carries the test counts', () => {
    const report = buildQualityReport(runs, { ...meta, tests: { unit: 112, e2e: 270 } });
    expect(report.tests).toEqual({ unit: 112, e2e: 270 });
  });

  it('merges several shard manifests, resolving JSON paths next to each manifest', () => {
    const root = mkdtempSync(join(tmpdir(), 'shards-'));
    const lhr = (bytes: number) =>
      JSON.stringify({
        audits: {
          'resource-summary': {
            details: { items: [{ resourceType: 'script', transferSize: bytes }] },
          },
        },
      });
    for (const [i, url, bytes] of [
      [1, 'http://localhost:4000/', 0],
      [2, 'http://localhost:5000/nl/index.html', 1300],
    ] as const) {
      const dir = join(root, `shard-${i}`);
      mkdirSync(dir);
      writeFileSync(join(dir, `lhr-${i}.json`), lhr(bytes));
      writeFileSync(
        join(dir, 'manifest.json'),
        JSON.stringify([
          {
            url,
            isRepresentativeRun: true,
            // A path from another machine: only the file name is trusted.
            jsonPath: `/home/runner/work/x/.lighthouseci/reports/lhr-${i}.json`,
            summary: good,
          },
        ]),
      );
    }
    const merged = loadRuns([
      join(root, 'shard-1', 'manifest.json'),
      join(root, 'shard-2', 'manifest.json'),
    ]);
    expect(buildQualityReport(merged, meta).pages).toEqual([
      { url: '/', scores: good, scriptBytes: 0, scripts: { external: 0, inline: 0 } },
      { url: '/nl/', scores: good, scriptBytes: 1300, scripts: { external: 1300, inline: 0 } },
    ]);
  });

  it('counts passed tests from the Vitest and Playwright JSON reports', () => {
    const root = mkdtempSync(join(tmpdir(), 'counts-'));
    writeFileSync(
      join(root, 'unit.json'),
      JSON.stringify({ numPassedTests: 112, numTotalTests: 112 }),
    );
    writeFileSync(
      join(root, 'e2e.json'),
      JSON.stringify({ stats: { expected: 268, flaky: 2, unexpected: 0, skipped: 0 } }),
    );
    expect(countTests(join(root, 'unit.json'), join(root, 'e2e.json'))).toEqual({
      unit: 112,
      e2e: 270,
    });
    expect(countTests(join(root, 'missing.json'), join(root, 'nope.json'))).toEqual({
      unit: null,
      e2e: null,
    });
  });
});

// 010:T002 One JavaScript measurement: external plus embedded, gated by the report (010:FR-001, 010:FR-003)
describe('JavaScript per page (010)', () => {
  const page = (url: string, external: number, inline: number): Run => ({
    url,
    isRepresentativeRun: true,
    summary: good,
    scriptBytes: external,
    inlineScriptBytes: inline,
  });

  it('publishes the total with a breakdown', () => {
    const report = buildQualityReport(
      [page('http://localhost:1/playground/index.html', 300, 1229)],
      meta,
    );
    expect(report.pages[0]).toMatchObject({
      url: '/playground/',
      scriptBytes: 1529,
      scripts: { external: 300, inline: 1229 },
    });
  });

  it('maps page URLs to built files', () => {
    expect(pageFile('/', 'dist')).toBe('dist/index.html');
    expect(pageFile('/nl/speeltuin/', 'dist')).toBe('dist/nl/speeltuin/index.html');
    expect(pageFile('/404.html', 'dist')).toBe('dist/404.html');
  });

  it('fails the gate when embedded script alone exceeds the budget', () => {
    const over = buildQualityReport([page('http://localhost:1/', 0, 51201)], meta);
    expect(over.passed).toBe(false);
    expect(exitStatus(over)).toBe(1);
  });

  it('passes the gate within budget, even when scores are asserted elsewhere', () => {
    const fine = buildQualityReport([page('http://localhost:1/', 1000, 1229)], meta);
    expect(exitStatus(fine)).toBe(0);
    const slowButLight = buildQualityReport(
      [{ ...page('http://localhost:1/', 0, 0), summary: { ...good, performance: 0.5 } }],
      meta,
    );
    // Category scores are gated by Lighthouse CI's assertions; the report gates JavaScript only.
    expect(exitStatus(slowButLight)).toBe(0);
  });
});
