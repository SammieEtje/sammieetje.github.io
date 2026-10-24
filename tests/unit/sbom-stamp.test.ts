// 014:T005 The SBOM names the build it describes, with the same commit as the quality report (014:FR-005, 014:FR-010)
import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { currentCommit } from '../../scripts/quality-report.ts';
import { stamp, type Bom } from '../../scripts/sbom.ts';

const commit = '0123456789abcdef0123456789abcdef01234567';
const repoUrl = 'https://github.com/SammieEtje/sammieetje.github.io';

const bom = (): Bom => ({
  bomFormat: 'CycloneDX',
  specVersion: '1.5',
  version: 1,
  metadata: {
    component: {
      'bom-ref': 'site@0.1.0',
      type: 'library',
      name: 'sammieetje.github.io',
      version: '0.1.0',
      externalReferences: [],
    },
  },
  components: [],
});

describe('stamp', () => {
  it('records the commit as a metadata property', () => {
    expect(stamp(bom(), { commit, repoUrl }).metadata.properties).toEqual([
      { name: 'sammieetje:build:commit', value: commit },
    ]);
  });

  it('links the site to its repository', () => {
    expect(stamp(bom(), { commit, repoUrl }).metadata.component?.externalReferences).toEqual([
      { type: 'vcs', url: repoUrl },
    ]);
  });

  it('gives the same result when applied twice', () => {
    const once = stamp(bom(), { commit, repoUrl });
    expect(stamp(once, { commit, repoUrl })).toEqual(once);
  });
});

describe('shared build identity', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('takes the commit from the quality report’s source', () => {
    expect(readFileSync('scripts/sbom.ts', 'utf8')).toMatch(
      /import \{[^}]*\bcurrentCommit\b[^}]*\} from '\.\/quality-report\.ts'/,
    );
  });

  it('uses the pipeline’s commit when it is set', () => {
    vi.stubEnv('GITHUB_SHA', commit);
    expect(currentCommit()).toBe(commit);
  });
});
