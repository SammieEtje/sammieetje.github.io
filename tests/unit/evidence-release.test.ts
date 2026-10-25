// 016:T007 The record is published as an immutable pre-release, never the latest (016:FR-005)
import { describe, expect, it } from 'vitest';
import {
  buildRecord,
  releaseArgs,
  releaseNotes,
  type RecordInputs,
} from '../../scripts/evidence.ts';

const sha = 'a'.repeat(40);
const record = buildRecord({
  repository: 'SammieEtje/sammieetje.github.io',
  commit: sha,
  run: {
    id: 40190000000,
    attempt: 1,
    url: 'https://github.com/SammieEtje/sammieetje.github.io/actions/runs/40190000000',
    trigger: 'schedule',
    actor: 'SammieEtje',
    startedAt: '2026-10-26T04:23:00Z',
  },
  deployedAt: '2026-10-26T04:31:00Z',
  previous: null,
  jobs: [{ name: 'deploy', steps: [{ name: 'Deploy to GitHub Pages', conclusion: 'success' }] }],
  compared: ['b'.repeat(40), sha],
  pulls: {
    ['b'.repeat(40)]: { number: 20, author: 'dependabot[bot]', mergedBy: null, gate: 'success' },
    [sha]: null,
  },
  files: [],
} satisfies RecordInputs);

describe('releaseArgs', () => {
  it('creates a pre-release on the deployed commit that is never marked latest', () => {
    expect(
      releaseArgs(record, ['evidence/evidence.json', 'evidence/report.json'], 'notes.md'),
    ).toEqual([
      'release',
      'create',
      'evidence/2026-10-26-40190000000',
      'evidence/evidence.json',
      'evidence/report.json',
      '--prerelease',
      '--latest=false',
      '--target',
      sha,
      '--title',
      'Evidence 2026-10-26 aaaaaaa',
      '--notes-file',
      'notes.md',
    ]);
  });
});

describe('releaseNotes', () => {
  it('links the run and every pull request, and names direct commits', () => {
    const notes = releaseNotes(record);
    expect(notes).toContain(record.run.url);
    expect(notes).toContain('schedule');
    expect(notes).toContain('https://github.com/SammieEtje/sammieetje.github.io/pull/20');
    expect(notes).toContain(`direct commit ${sha.slice(0, 7)}`);
  });
});
