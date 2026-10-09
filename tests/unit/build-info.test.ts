// 001:T038 Build identity (001:FR-012)
import { describe, expect, it } from 'vitest';
import { repoUrl, resolveBuildInfo, specsUrl } from '../../src/site/build-info.ts';

const sha = 'f4b21b0c3a9e1d2f4b21b0c3a9e1d2f4b21b0c3a';
const otherSha = '0123456789abcdef0123456789abcdef01234567';

describe('resolveBuildInfo()', () => {
  it('uses the commit the pipeline is building', () => {
    const info = resolveBuildInfo({ GITHUB_SHA: sha }, () => otherSha);
    expect(info).toEqual({
      sha,
      shortSha: 'f4b21b0',
      url: `${repoUrl}/commit/${sha}`,
    });
  });

  it('falls back to the local git HEAD', () => {
    expect(resolveBuildInfo({}, () => otherSha).shortSha).toBe('0123456');
  });

  it('reports "local" and links to the repository when git is unavailable', () => {
    const info = resolveBuildInfo({}, () => {
      throw new Error('not a git repository');
    });
    expect(info).toEqual({ sha: 'local', shortSha: 'local', url: repoUrl });
  });

  it('ignores values that are not commit SHAs', () => {
    expect(resolveBuildInfo({ GITHUB_SHA: 'nope' }, () => 'also nope').sha).toBe('local');
  });
});

describe('repository links', () => {
  it('point to the public repository and its specs folder', () => {
    expect(repoUrl).toBe('https://github.com/SammieEtje/sammieetje.github.io');
    expect(specsUrl).toBe(`${repoUrl}/tree/main/specs`);
  });
});
