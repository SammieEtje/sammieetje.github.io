// 001:T016 Quality report from Lighthouse runs (001:FR-019)
import { describe, expect, it } from 'vitest';
import {
  budgets,
  buildQualityReport,
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

const meta = { commit: 'abc1234def', generatedAt: '2026-10-09T12:00:00.000Z' };

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
    expect(report).toMatchObject({ schemaVersion: 1, ...meta, budgets, passed: true });
    expect(report.pages).toEqual([
      { url: '/', scores: good, scriptBytes: 0 },
      { url: '/nl/', scores: good, scriptBytes: 1200 },
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
