// 011:T001 Dependabot patch and minor updates arm auto-merge; nothing else does (011:FR-001..FR-004)
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';

interface Step {
  id?: string;
  if?: string;
  uses?: string;
  run?: string;
  with?: Record<string, unknown>;
  env?: Record<string, string>;
}
interface Job {
  if?: string;
  permissions?: Record<string, string>;
  steps?: Step[];
}
interface Workflow {
  on: {
    pull_request?: { branches?: string[] };
    schedule?: { cron: string }[];
    workflow_dispatch?: unknown;
  };
  jobs: Record<string, Job>;
}

const wf = parse(readFileSync('.github/workflows/dependency-updates.yml', 'utf8')) as Workflow;

describe('dependency-updates.yml: auto-merge', () => {
  const job = wf.jobs['auto-merge'];
  const steps = job?.steps ?? [];
  const merge = steps.find((s) => s.run?.includes('gh pr merge'));

  it('runs on pull requests to main', () => {
    expect(wf.on.pull_request?.branches).toEqual(['main']);
  });

  it('acts only on pull requests opened by Dependabot in this repository', () => {
    expect(job?.if).toContain("github.event_name == 'pull_request'");
    expect(job?.if).toContain("github.event.pull_request.user.login == 'dependabot[bot]'");
    expect(job?.if).toContain("github.repository == 'SammieEtje/sammieetje.github.io'");
  });

  it('may write contents and pull requests, nothing more', () => {
    expect(job?.permissions).toEqual({ contents: 'write', 'pull-requests': 'write' });
  });

  it('never checks out, so no code from the pull request runs with that token', () => {
    expect(steps.some((s) => s.uses?.startsWith('actions/checkout@'))).toBe(false);
  });

  it('reads the update type with fetch-metadata', () => {
    expect(steps.some((s) => s.uses?.startsWith('dependabot/fetch-metadata@'))).toBe(true);
  });

  it('arms auto-merge for exactly patch and minor updates', () => {
    const types = [...(merge?.if ?? '').matchAll(/version-update:semver-(\w+)/g)].map((m) => m[1]);
    expect(types.sort()).toEqual(['minor', 'patch']);
  });

  it('waits for branch protection instead of bypassing it', () => {
    expect(merge?.run).toMatch(/gh pr merge --auto --squash/);
    expect(merge?.run).not.toContain('--admin');
  });
});

// 011:T012 Approved updates that fall behind main are brought up to date daily (011:FR-010)
describe('dependency-updates.yml: catch-up', () => {
  const job = wf.jobs['catch-up'];
  const steps = job?.steps ?? [];

  it('runs once a day and on demand, never for a pull request', () => {
    expect(wf.on.schedule).toHaveLength(1);
    expect(wf.on.schedule?.[0]?.cron).toMatch(/^\d+ \d+ \* \* \*$/);
    expect('workflow_dispatch' in wf.on).toBe(true);
    expect(job?.if).toContain("github.event_name != 'pull_request'");
  });

  it('may update branches and start the pipeline, nothing more', () => {
    expect(job?.permissions).toEqual({
      contents: 'write',
      'pull-requests': 'write',
      actions: 'write',
    });
  });

  it('runs the trusted script from main without credentials left on disk or installs', () => {
    const checkout = steps.find((s) => s.uses?.startsWith('actions/checkout@'));
    expect(checkout?.with?.['persist-credentials']).toBe(false);
    expect(steps.some((s) => s.run === 'node scripts/dependency-catch-up.ts')).toBe(true);
    expect(steps.some((s) => s.run?.includes('npm ci'))).toBe(false);
  });
});
