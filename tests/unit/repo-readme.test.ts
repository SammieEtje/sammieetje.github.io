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
    expect(roadmap).toMatch(/\| 014 +\|[^\n]*\| (this PR|live) +\|/);
    for (const spec of ['011', '012', '013']) {
      expect(roadmap).toMatch(new RegExp(`\\| ${spec} +\\|[^\\n]*\\| live +\\|`));
    }
  });
});

// 015:T016 The README describes the provenance and shows sign in the pipeline (015:FR-011)
describe('README provenance', () => {
  it('has a provenance section: what is signed, where, and how to verify without an account', () => {
    const provenance = section('Provenance');
    for (const term of [
      'manifest.sha256',
      'sigstore.json',
      'gh attestation verify',
      'no account',
    ]) {
      expect(provenance, term).toContain(term);
    }
  });

  it('shows the signing job in the pipeline diagram', () => {
    expect(section('Pipeline')).toMatch(/quality-gate ──► sign ──► deploy/);
  });

  it('lists 014 as live and 015 as this PR', () => {
    const roadmap = section('Roadmap');
    expect(roadmap).toMatch(/\| 014 +\|[^\n]*\| live +\|/);
    expect(roadmap).toMatch(/\| 015 +\|[^\n]*\| this PR +\|/);
  });
});
