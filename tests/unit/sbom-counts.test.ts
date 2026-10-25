// 014:T016 The scorecard's figures come from the file that ships (014:FR-011)
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { sbomCounts } from '../../src/site/sbom.ts';

describe('sbomCounts', () => {
  it('counts shipped and pipeline components', () => {
    const file = join(mkdtempSync(join(tmpdir(), 'sbom-')), 'sbom.cdx.json');
    const components = [
      { scope: 'required' },
      { scope: 'required' },
      { scope: 'excluded' },
      { scope: 'excluded' },
      { scope: 'excluded' },
    ];
    writeFileSync(file, JSON.stringify({ bomFormat: 'CycloneDX', components }));
    expect(sbomCounts(file)).toEqual({ shipped: 2, pipeline: 3 });
  });

  it('asks for `npm run sbom` when the file is missing', () => {
    expect(() => sbomCounts('does/not/exist.json')).toThrow('Run `npm run sbom` first');
  });
});
