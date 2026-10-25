// 014:T019 The repository README describes the bill of materials and lists 014 (014:FR-012)
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const readme = readFileSync('README.md', 'utf8');
const section = (heading: string) => {
  const start = readme.indexOf(`\n## ${heading}\n`);
  if (start < 0) return '';
  const end = readme.indexOf('\n## ', start + 1);
  return readme.slice(start, end < 0 ? undefined : end);
};

describe('README', () => {
  it('has a bill of materials section: what it contains, where it is, how to run it', () => {
    const sbom = section('Bill of materials');
    for (const term of ['npm run sbom', '/quality/sbom.cdx.json', 'CycloneDX', 'not shipped']) {
      expect(sbom, term).toContain(term);
    }
  });

  it('lists `npm run sbom` among the gate scripts', () => {
    expect(section('The golden path')).toMatch(/\| `npm run sbom` +\|/);
  });

  it('lists 014 on the roadmap and no older spec as this PR', () => {
    const roadmap = section('Roadmap');
    expect(roadmap).toMatch(/\| 014 +\|[^\n]*\| this PR +\|/);
    for (const spec of ['011', '012', '013']) {
      expect(roadmap).toMatch(new RegExp(`\\| ${spec} +\\|[^\\n]*\\| live +\\|`));
    }
  });
});
