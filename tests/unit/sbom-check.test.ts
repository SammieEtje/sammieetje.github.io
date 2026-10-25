// 014:T010 The check names every gap: missing, extra, unversioned, wrongly scoped or leaking a path (014:FR-004 – 014:FR-006)
import { describe, expect, it } from 'vitest';
import {
  actionComponent,
  check,
  type Action,
  type Bom,
  type Component,
  type Installed,
} from '../../scripts/sbom.ts';

const sha = '3d3c42e5aac5ba805825da76410c181273ba90b1';
const checkout: Action = { owner: 'actions', repo: 'checkout', path: null, sha, tag: 'v7.0.1' };

const installed: Installed = {
  packages: {
    '': { version: '0.1.0' },
    'node_modules/astro': { version: '7.3.8' },
    'node_modules/vitest': { version: '5.0.3', dev: true },
  },
};

const astro = (): Component => ({
  'bom-ref': 'astro@7.3.8',
  type: 'library',
  name: 'astro',
  version: '7.3.8',
  scope: 'required' as const,
  purl: 'pkg:npm/astro@7.3.8',
  licenses: [{ license: { id: 'MIT' } }],
});
const vitest = () => ({
  'bom-ref': 'vitest@5.0.3',
  type: 'library',
  name: 'vitest',
  version: '5.0.3',
  scope: 'excluded' as const,
  purl: 'pkg:npm/vitest@5.0.3',
});

const bom = (components: Bom['components']): Bom => ({
  bomFormat: 'CycloneDX',
  specVersion: '1.5',
  version: 1,
  metadata: {},
  components,
});

const without = (component: Component, field: string): Component => {
  const copy = { ...component };
  delete copy[field];
  return copy;
};
const complete = () => bom([astro(), vitest(), actionComponent(checkout)]);
const problems = (b: Bom, actions = [checkout]) => check(b, installed, actions).problems;

describe('check', () => {
  it('passes a complete, correctly scoped SBOM and counts it', () => {
    const result = check(complete(), installed, [checkout]);
    expect(result.problems).toEqual([]);
    expect(result.valid).toBe(true);
    expect(result.passed).toBe(true);
    expect(result.counts).toEqual({ shipped: 1, pipeline: 2, actions: 1, withoutLicence: 2 });
  });

  it('names an installed package that is missing', () => {
    expect(problems(bom([astro(), actionComponent(checkout)]))).toEqual(['vitest@5.0.3: missing']);
  });

  it('names a component that is not installed', () => {
    const extra = { ...vitest(), 'bom-ref': 'left-pad@1.0.0', name: 'left-pad', version: '1.0.0' };
    expect(problems(bom([...complete().components, extra]))).toEqual([
      'left-pad@1.0.0: not installed',
    ]);
  });

  it('names a component without a version or purl', () => {
    expect(
      problems(bom([without(astro(), 'version'), vitest(), actionComponent(checkout)])),
    ).toContain('astro: no version');
    expect(problems(bom([without(astro(), 'purl'), vitest(), actionComponent(checkout)]))).toEqual([
      'astro@7.3.8: no purl',
    ]);
  });

  it('names a component whose shipped status is wrong, in either direction', () => {
    const wrong = bom([
      { ...astro(), scope: 'excluded' },
      { ...vitest(), scope: 'required' },
      actionComponent(checkout),
    ]);
    expect(problems(wrong)).toEqual([
      'astro@7.3.8: marked not shipped but shipped',
      'vitest@5.0.3: marked shipped but development only',
    ]);
  });

  it('names a workflow action without a component, and an action component without a workflow', () => {
    expect(problems(bom([astro(), vitest()]))).toEqual([`actions/checkout@${sha}: missing`]);
    expect(problems(complete(), [])).toEqual([`actions/checkout@${sha}: not installed`]);
  });

  it('names a local path anywhere in the document', () => {
    for (const path of ['/Users/someone/x', '/home/runner/work/x', 'C:\\Users\\x']) {
      const leaking = complete();
      leaking.metadata['note'] = path;
      expect(problems(leaking)).toEqual(['sbom: contains a local path']);
    }
  });

  it('fails an invalid document', () => {
    const invalid: Partial<Bom> = complete();
    delete invalid.bomFormat;
    const result = check(invalid as Bom, installed, [checkout]);
    expect(result.valid).toBe(false);
    expect(result.passed).toBe(false);
  });

  it('counts a missing licence without failing', () => {
    const result = check(complete(), installed, [checkout]);
    expect(result.passed).toBe(true);
    expect(result.counts.withoutLicence).toBe(2);
  });
});
