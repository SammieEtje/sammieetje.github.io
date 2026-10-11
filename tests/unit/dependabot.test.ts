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

interface Policy {
  'package-ecosystem': string;
  schedule: { interval: string; day?: string };
  cooldown?: Record<string, number>;
  groups?: Record<string, { patterns?: string[]; 'update-types'?: string[] }>;
}
const policy = (parse(readFileSync('.github/dependabot.yml', 'utf8')) as { updates: Policy[] })
  .updates;

// 011:T002 Patch and minor are grouped; majors fall outside and arrive alone (011:FR-006)
describe('dependabot.yml groups', () => {
  it('groups only patch and minor updates, per ecosystem', () => {
    for (const update of policy) {
      const groups = Object.values(update.groups ?? {});
      expect(groups, update['package-ecosystem']).toHaveLength(1);
      expect(groups[0]?.patterns).toEqual(['*']);
      expect([...(groups[0]?.['update-types'] ?? [])].sort()).toEqual(['minor', 'patch']);
    }
  });
});

// 011:T010 New releases wait 3 days; security updates are exempt by design (011:FR-005)
describe('dependabot.yml cooldown', () => {
  it('waits 3 days before proposing a version update, in both ecosystems', () => {
    for (const update of policy) {
      expect(update.cooldown, update['package-ecosystem']).toEqual({ 'default-days': 3 });
    }
  });
});

// 011:T013 npm and Actions arrive on different weekdays (011:FR-007)
describe('dependabot.yml weekdays', () => {
  it('proposes npm on Monday and Actions on Wednesday', () => {
    const day = (e: string) => policy.find((u) => u['package-ecosystem'] === e)?.schedule.day;
    expect(day('npm')).toBe('monday');
    expect(day('github-actions')).toBe('wednesday');
  });
});
