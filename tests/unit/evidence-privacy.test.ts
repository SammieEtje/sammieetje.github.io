// 016:T003 Records carry no local paths: the runner's work directory is normalised, anything else fails (016:FR-008)
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { findLocalPaths, normaliseReport } from '../../scripts/evidence.ts';

describe('normaliseReport', () => {
  it('replaces every occurrence of the work directory with .', () => {
    const workdir = '/home/runner/work/sammieetje.github.io/sammieetje.github.io';
    const text = JSON.stringify({ a: `${workdir}/tests/x.ts`, b: [`${workdir}/y`] });
    expect(normaliseReport(text, workdir)).toBe(JSON.stringify({ a: './tests/x.ts', b: ['./y'] }));
  });
});

describe('findLocalPaths', () => {
  it('names each file that still contains a local path', () => {
    expect(
      findLocalPaths([
        { name: 'ok.json', text: '{"url":"https://example.org/home"}' },
        { name: 'mac.json', text: '{"p":"/Users/someone/x"}' },
        { name: 'linux.json', text: '{"p":"/home/runner/x"}' },
        { name: 'win.json', text: JSON.stringify({ p: 'C:\\Users\\x' }) },
      ]),
    ).toEqual(['mac.json', 'linux.json', 'win.json']);
  });

  it('uses the same pattern as the bill of materials', () => {
    for (const script of ['scripts/evidence.ts', 'scripts/sbom.ts']) {
      expect(readFileSync(script, 'utf8'), script).toMatch(
        /import \{[^}]*\bLOCAL_PATH\b[^}]*\} from '\.\/local-path\.ts'/,
      );
    }
  });
});
