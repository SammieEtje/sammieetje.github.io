// 001:T017 Automated weekly update proposals (001:FR-021)
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';

interface Update {
  'package-ecosystem': string;
  directory: string;
  schedule: { interval: string };
}

describe('dependabot.yml', () => {
  it('proposes weekly updates for npm packages and GitHub Actions', () => {
    const config = parse(readFileSync('.github/dependabot.yml', 'utf8')) as {
      version: number;
      updates: Update[];
    };
    expect(config.version).toBe(2);
    const byEcosystem = Object.fromEntries(config.updates.map((u) => [u['package-ecosystem'], u]));
    for (const ecosystem of ['npm', 'github-actions']) {
      expect(byEcosystem[ecosystem]?.directory).toBe('/');
      expect(byEcosystem[ecosystem]?.schedule.interval).toBe('weekly');
    }
  });
});

// 002:T022 Ignore majors the toolchain cannot accept yet (001:FR-021 follow-up, research R8 of 002)
describe('dependabot.yml ignore rules', () => {
  it('skips TypeScript >= 6.1 and major @types/node updates', () => {
    const config = parse(readFileSync('.github/dependabot.yml', 'utf8')) as {
      updates: { 'package-ecosystem': string; ignore?: Record<string, unknown>[] }[];
    };
    const npm = config.updates.find((u) => u['package-ecosystem'] === 'npm');
    expect(npm?.ignore).toEqual(
      expect.arrayContaining([
        { 'dependency-name': 'typescript', versions: ['>=6.1.0'] },
        { 'dependency-name': '@types/node', 'update-types': ['version-update:semver-major'] },
      ]),
    );
  });
});
