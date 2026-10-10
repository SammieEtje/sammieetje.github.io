// 007:T001 Project selection and links (007:FR-003 – 007:FR-005, 007:SC-001)
import { describe, expect, it } from 'vitest';
import { locales } from '../../src/i18n/ui.ts';
import { projects } from '../../src/site/projects.ts';

describe('projects', () => {
  it('are exactly the three clarified projects, in order', () => {
    expect(projects.map((p) => p.id)).toEqual(['profile-site', 'specdriven-app', 'mypool']);
  });

  it('link only to an allowlist of own repositories, so no fork or family project can appear', () => {
    const allowed = ['sammieetje.github.io', 'my-specdriven-app', 'myPool'].map(
      (name) => `https://github.com/SammieEtje/${name}`,
    );
    expect(new Set(projects.map((p) => p.repo)).size).toBe(projects.length);
    for (const p of projects) {
      expect(allowed).toContain(p.repo);
      expect(p.repo.endsWith(`/${p.name}`)).toBe(true);
      for (const url of [p.specs, p.live].filter((u) => u && u !== 'self')) {
        expect(allowed.some((repo) => url!.startsWith(`${repo}/`))).toBe(true);
      }
    }
  });

  it('link to specifications only for spec-driven projects', () => {
    expect(projects.filter((p) => p.specs).map((p) => p.id)).toEqual([
      'profile-site',
      'specdriven-app',
    ]);
    for (const p of projects.filter((x) => x.specs)) {
      expect(p.specs).toBe(`${p.repo}/tree/main/specs`);
    }
  });

  it('describe every project in every language, with a known lifecycle', () => {
    for (const p of projects) {
      expect(['production', 'experimental', 'archived']).toContain(p.lifecycle);
      expect(p.tech.length).toBeGreaterThan(0);
      for (const locale of locales) {
        expect(p.purpose[locale].trim()).not.toBe('');
        expect(p.demonstrates[locale].trim()).not.toBe('');
      }
    }
  });
});
