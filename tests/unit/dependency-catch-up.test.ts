// 011:T011 Selecting and catching up approved updates that are behind main (011:FR-010)
import { describe, expect, it } from 'vitest';
import {
  behind,
  catchUpCommands,
  runAll,
  type UpdatePr,
} from '../../scripts/dependency-catch-up.ts';

const pr = (over: Partial<UpdatePr>): UpdatePr => ({
  number: 1,
  headRefName: 'dependabot/npm_and_yarn/npm-abc',
  mergeStateStatus: 'BEHIND',
  autoMergeRequest: { enabledAt: '2026-10-12T05:00:00Z' },
  author: { login: 'app/dependabot' },
  ...over,
});

describe('behind()', () => {
  it('selects Dependabot pull requests that are armed and behind main', () => {
    const prs = [pr({ number: 1 }), pr({ number: 2, author: { login: 'dependabot[bot]' } })];
    expect(behind(prs).map((p) => p.number)).toEqual([1, 2]);
  });

  it('leaves current, blocked, conflicting, unarmed and other authors alone', () => {
    const prs = [
      pr({ number: 3, mergeStateStatus: 'CLEAN' }),
      pr({ number: 4, mergeStateStatus: 'BLOCKED' }),
      pr({ number: 5, mergeStateStatus: 'DIRTY' }),
      pr({ number: 6, autoMergeRequest: null }),
      pr({ number: 7, author: { login: 'SammieEtje' } }),
    ];
    expect(behind(prs)).toEqual([]);
  });
});

describe('catchUpCommands()', () => {
  it('updates each branch, then starts the pipeline on it', () => {
    const repo = 'SammieEtje/sammieetje.github.io';
    const prs = [pr({ number: 12, headRefName: 'dependabot/github_actions/actions-x' })];
    expect(catchUpCommands(prs, repo)).toEqual([
      ['pr', 'update-branch', '12', '--repo', repo],
      [
        'workflow',
        'run',
        'pipeline.yml',
        '--ref',
        'dependabot/github_actions/actions-x',
        '--repo',
        repo,
      ],
    ]);
  });

  it('gives no commands when nothing is behind', () => {
    expect(catchUpCommands([], 'a/b')).toEqual([]);
  });
});

describe('runAll()', () => {
  it('runs every command even when one fails, and returns the failures', () => {
    const ran: string[][] = [];
    const failed = runAll([['a'], ['b'], ['c']], (argv) => {
      ran.push(argv);
      if (argv[0] === 'b') throw new Error('refused');
    });
    expect(ran).toEqual([['a'], ['b'], ['c']]);
    expect(failed).toEqual([['b']]);
  });
});
