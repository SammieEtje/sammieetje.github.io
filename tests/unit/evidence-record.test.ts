// 016:T002 One complete record per deploy: run, trigger, every job and step, the changes, every file (016:FR-001 – 016:FR-003)
import { describe, expect, it } from 'vitest';
import { buildRecord, type RecordInputs } from '../../scripts/evidence.ts';

const sha = (c: string) => c.repeat(40);
const jobs: RecordInputs['jobs'] = [
  {
    name: 'checks',
    steps: [
      { name: 'Set up job', conclusion: 'success' },
      { name: 'Known vulnerabilities', conclusion: 'success' },
      { name: 'Bill of materials', conclusion: 'success' },
      { name: 'End-to-end and accessibility tests', conclusion: 'success' },
    ],
  },
  { name: 'budgets 1/3', steps: [{ name: 'Budgets', conclusion: 'success' }] },
  { name: 'sign', steps: [{ name: 'Verify the provenance', conclusion: 'success' }] },
  { name: 'deploy', steps: [{ name: 'Deploy to GitHub Pages', conclusion: 'success' }] },
  { name: 'evidence', steps: [{ name: 'Write the record', conclusion: null }] },
];
const pr23 = { number: 23, author: 'SammieEtje', mergedBy: 'SammieEtje', gate: 'success' };
const pr20 = {
  number: 20,
  author: 'dependabot[bot]',
  mergedBy: 'github-actions[bot]',
  gate: 'success',
};

const inputs = (over: Partial<RecordInputs> = {}): RecordInputs => ({
  repository: 'SammieEtje/sammieetje.github.io',
  commit: sha('a'),
  run: {
    id: 40190000000,
    attempt: 1,
    url: 'https://github.com/SammieEtje/sammieetje.github.io/actions/runs/40190000000',
    trigger: 'push',
    actor: 'SammieEtje',
    startedAt: '2026-10-26T08:40:00Z',
  },
  deployedAt: '2026-10-26T08:47:00Z',
  previous: 'evidence/2026-10-25-40179805480',
  jobs,
  compared: [sha('b'), sha('a')],
  pulls: { [sha('a')]: pr23, [sha('b')]: pr20 },
  files: [
    { name: 'report.json', sha256: 'f'.repeat(64), source: 'published' },
    {
      name: 'unit.json',
      sha256: 'e'.repeat(64),
      source: 'normalised',
      originalSha256: 'd'.repeat(64),
    },
  ],
  ...over,
});

describe('buildRecord', () => {
  it('names the record by deploy date and run, and chains it to the previous record', () => {
    const record = buildRecord(inputs());
    expect(record.schemaVersion).toBe(1);
    expect(record.tag).toBe('evidence/2026-10-26-40190000000');
    expect(record.previous).toBe('evidence/2026-10-25-40179805480');
    expect(buildRecord(inputs({ previous: null })).previous).toBeNull();
    expect(record).toMatchObject({ commit: sha('a'), deployedAt: '2026-10-26T08:47:00Z' });
  });

  it('records a push as exactly the merged pull request of its commit', () => {
    expect(buildRecord(inputs()).changes).toEqual([
      {
        commit: sha('a'),
        pullRequest: 23,
        author: 'SammieEtje',
        mergedBy: 'SammieEtje',
        prGate: 'success',
      },
    ]);
  });

  it('records a daily run as every commit since the previous record, oldest first', () => {
    const record = buildRecord(inputs({ run: { ...inputs().run, trigger: 'schedule' } }));
    expect(record.changes.map((c) => [c.commit, c.pullRequest])).toEqual([
      [sha('b'), 20],
      [sha('a'), 23],
    ]);
  });

  it('records a direct commit without a pull request', () => {
    const record = buildRecord(
      inputs({ run: { ...inputs().run, trigger: 'schedule' }, compared: [sha('c')], pulls: {} }),
    );
    expect(record.changes).toEqual([
      { commit: sha('c'), pullRequest: null, author: null, mergedBy: null, prGate: null },
    ]);
  });

  it('records a redeploy of the same commit as that commit', () => {
    const record = buildRecord(
      inputs({ run: { ...inputs().run, trigger: 'schedule' }, compared: [] }),
    );
    expect(record.changes.map((c) => c.commit)).toEqual([sha('a')]);
  });

  it('records who started a manual run', () => {
    const record = buildRecord(
      inputs({ run: { ...inputs().run, trigger: 'workflow_dispatch', actor: 'someone' } }),
    );
    expect(record.run).toMatchObject({ trigger: 'workflow_dispatch', actor: 'someone' });
  });

  it('lists every job and step except its own, with the local command of each gate check', () => {
    const { gate } = buildRecord(inputs());
    expect(gate.some((g) => g.job === 'evidence')).toBe(false);
    expect(gate).toContainEqual({
      job: 'checks',
      step: 'Known vulnerabilities',
      conclusion: 'success',
      command: 'npm run audit',
    });
    expect(gate).toContainEqual({
      job: 'checks',
      step: 'Bill of materials',
      conclusion: 'success',
      command: 'npm run sbom',
    });
    expect(gate).toContainEqual({
      job: 'budgets 1/3',
      step: 'Budgets',
      conclusion: 'success',
      command: 'npm run budgets',
    });
    expect(gate).toContainEqual({
      job: 'checks',
      step: 'Set up job',
      conclusion: 'success',
      command: null,
    });
    expect(gate).toHaveLength(7);
  });

  it('lists every file with its digest and where it came from', () => {
    expect(buildRecord(inputs()).files).toEqual(inputs().files);
  });
});
