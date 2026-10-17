// 013:T016 The /publish-article skill is the golden path, without session links (013:FR-006, 013:FR-024)
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const skill = readFileSync('.claude/skills/publish-article/SKILL.md', 'utf8');

describe('/publish-article', () => {
  it('describes itself so the agent can find it', () => {
    expect(skill).toMatch(/^---\nname: publish-article\ndescription: .+\n---\n/);
  });

  it('runs the steps of the contract in order', () => {
    const steps = [
      'npm run pipeline -- verify',
      'excerpt',
      'src/site/articles.ts',
      'npm run check',
      'gh pr create',
      'npm run pipeline -- mark-published',
      // the vault commits the note, and its post-commit hook pushes it for the Friday check
      'git -C "$ARTICLE_VAULT_DIR" commit',
    ];
    const positions = steps.map((s) => skill.indexOf(s));
    for (const [i, s] of steps.entries()) expect(positions[i], s).toBeGreaterThan(-1);
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
  });

  it('keeps session links and local paths out of what it writes', () => {
    expect(skill).not.toMatch(/claude\.ai\/(?:code|chat|share)/);
    expect(skill).not.toMatch(/^Claude-Session:/m);
    expect(skill).not.toMatch(/\/Users\/|~\/Documents/);
    expect(skill).toMatch(/session link/i);
  });

  it('never merges or publishes on LinkedIn itself', () => {
    expect(skill).not.toMatch(/gh pr merge/);
    expect(skill).toMatch(/never/i);
  });
});
