// 013:T021 CLAUDE.md points the agent at the private pipeline without leaking it (013:FR-025)
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const text = readFileSync('CLAUDE.md', 'utf8');

describe('CLAUDE.md', () => {
  it('says the pipeline lives in the vault, read through om and ARTICLE_VAULT_DIR', () => {
    expect(text).toMatch(/vault/i);
    expect(text).toContain('`om`');
    expect(text).toContain('ARTICLE_VAULT_DIR');
    expect(text).toContain('/publish-article');
  });

  it('contains no local path and no session link', () => {
    expect(text).not.toMatch(/\/Users\/|~\/|[A-Z]:\\/);
    expect(text).not.toMatch(/claude\.ai\/(?:code|chat|share)/);
  });

  it('stays short', () => {
    expect(text.split('\n').length).toBeLessThanOrEqual(40);
  });
});
