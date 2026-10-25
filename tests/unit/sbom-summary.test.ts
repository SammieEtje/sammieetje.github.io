// 014:T011 The run summary shows the SBOM check and its counts (014:FR-004, 014:FR-008)
import { describe, expect, it } from 'vitest';
import { renderSummary, type CheckResult } from '../../scripts/sbom.ts';

const passing: CheckResult = {
  valid: true,
  validation: [],
  problems: [],
  counts: { shipped: 198, pipeline: 523, actions: 7, withoutLicence: 8 },
  passed: true,
};

describe('renderSummary', () => {
  it('shows the four counts and a passing line', () => {
    const summary = renderSummary(passing);
    expect(summary).toContain('### Bill of materials');
    expect(summary).toContain('| Shipped components | 198 |');
    expect(summary).toContain('| Pipeline components | 523 |');
    expect(summary).toContain('| of which pipeline actions | 7 |');
    expect(summary).toContain('| Without a declared licence | 8 |');
    expect(summary).toContain('✅ Bill of materials complete and valid (CycloneDX 1.5).');
  });

  it('shows a failing line and one line per problem', () => {
    const summary = renderSummary({
      ...passing,
      valid: false,
      validation: ['/components/0 must have required property name'],
      problems: ['astro@7.3.8: no purl'],
      passed: false,
    });
    expect(summary).toContain('❌ Bill of materials incomplete or invalid.');
    expect(summary).toContain('- astro@7.3.8: no purl');
    expect(summary).toContain('- schema: /components/0 must have required property name');
    expect(summary).not.toContain('✅');
  });
});
