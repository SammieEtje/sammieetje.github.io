// 013:T011 `npm run pipeline` reads the vault from ARTICLE_VAULT_DIR and nothing else (013:FR-001, 013:FR-004)
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

let vault: string;

const run = (args: string[], env: Record<string, string | undefined>) => {
  const base: NodeJS.ProcessEnv = { ...process.env };
  delete base.ARTICLE_VAULT_DIR;
  const result = spawnSync(process.execPath, ['scripts/pipeline.ts', ...args], {
    encoding: 'utf8',
    env: { ...base, ...env } as NodeJS.ProcessEnv,
  });
  return { code: result.status, out: result.stdout, err: result.stderr };
};

beforeEach(() => {
  vault = mkdtempSync(join(tmpdir(), 'vault-'));
  writeFileSync(
    join(vault, 'a.md'),
    '---\ntype: article\nplatform: LinkedIn\nstatus: ready\npilaar: P3\nwords: 800\ntarget_week: 2099-W02\n---\n\n# Fixture article A\n',
  );
});
afterEach(() => {
  rmSync(vault, { recursive: true, force: true });
});

describe('pipeline CLI', () => {
  it('stops with exit 2 when ARTICLE_VAULT_DIR is not set or not readable', () => {
    for (const env of [{}, { ARTICLE_VAULT_DIR: '' }, { ARTICLE_VAULT_DIR: join(vault, 'nope') }]) {
      const r = run([], env);
      expect(r.code).toBe(2);
      expect(r.err).toContain('ARTICLE_VAULT_DIR is not set or not readable');
    }
  });

  it('prints the overview and exits 0', () => {
    const r = run([], { ARTICLE_VAULT_DIR: vault });
    expect(r.err).toBe('');
    expect(r.code).toBe(0);
    expect(r.out).toMatch(
      /^Pipeline on \d{4}-\d{2}-\d{2} \(\d{4}-W\d{2}\)\. Slot: Tuesday 08:00\./,
    );
    expect(r.out).toContain('Pillars without planned or published work:');
    // 013:T013 the buffer line (013:FR-019)
    expect(r.out).toContain('Buffer: ready 1 of 2. WARNING: fewer than 2 articles are ready.');
  });

  // 013:T013 the Friday check (013:FR-026)
  it('prints the Friday report and exits 0', () => {
    const r = run(['friday'], { ARTICLE_VAULT_DIR: vault });
    expect(r.code).toBe(0);
    expect(r.out).toMatch(/^Tuesday \d{4}-\d{2}-\d{2}: nothing is ready\.\nBuffer: ready 1 of 2\./);
  });

  // 013:T017 verify and mark-published (013:FR-006, 013:FR-008, 013:FR-014)
  it('verifies a note and prints the site record as JSON', () => {
    const url = 'https://www.linkedin.com/pulse/fixture-article-a';
    const r = run(['verify', 'Fixture article A', '--date', '2099-01-06', '--url', url], {
      ARTICLE_VAULT_DIR: vault,
    });
    expect(r.err).toBe('');
    expect(r.code).toBe(0);
    expect(JSON.parse(r.out)).toMatchObject({ title: 'Fixture article A', minutes: 4, url });
  });

  it('exits 1 and lists the problems when verify fails, and leaves the note alone', () => {
    const before = readFileSync(join(vault, 'a.md'), 'utf8');
    const r = run(
      ['mark-published', 'a', '--date', '2099-01-20', '--url', 'https://example.com/x'],
      { ARTICLE_VAULT_DIR: vault },
    );
    expect(r.code).toBe(1);
    expect(r.err).toContain('is not in planned week 2099-W02');
    expect(r.err).toContain('not a LinkedIn Article URL');
    expect(readFileSync(join(vault, 'a.md'), 'utf8')).toBe(before);
  });

  it('marks a note published', () => {
    const url = 'https://www.linkedin.com/pulse/fixture-article-a';
    const r = run(['mark-published', 'a', '--date', '2099-01-06', '--url', url], {
      ARTICLE_VAULT_DIR: vault,
    });
    expect(r.code).toBe(0);
    expect(readFileSync(join(vault, 'a.md'), 'utf8')).toContain(
      `status: published\npilaar: P3\nwords: 800\ntarget_week: 2099-W02\npublish_date: 2099-01-06\nlinkedin_url: ${url}\n`,
    );
  });

  it('needs a note, a date and a URL', () => {
    const r = run(['verify', 'a', '--date', '2099-01-06'], { ARTICLE_VAULT_DIR: vault });
    expect(r.code).toBe(2);
    expect(r.err).toContain('Usage:');
  });

  it('rejects an unknown subcommand with exit 2', () => {
    const r = run(['nonsense'], { ARTICLE_VAULT_DIR: vault });
    expect(r.code).toBe(2);
    expect(r.err).toContain('Usage:');
  });
});
