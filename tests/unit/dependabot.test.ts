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
