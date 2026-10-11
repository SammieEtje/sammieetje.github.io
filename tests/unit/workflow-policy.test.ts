// 001:T015 Workflow policy and gate parity (001:FR-014, 001:FR-016, 001:FR-017, 001:FR-020)
import { readdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';

interface Step {
  uses?: string;
  run?: string;
}
interface Job {
  permissions?: Record<string, string>;
  needs?: string | string[];
  if?: string;
  environment?: { name: string } | string;
  steps?: Step[];
}
interface Workflow {
  on: Record<string, { branches?: string[] } | null>;
  permissions?: Record<string, string>;
  jobs: Record<string, Job>;
}

const require = createRequire(import.meta.url);
const dir = '.github/workflows';
const workflows = readdirSync(dir)
  .filter((f) => /\.ya?ml$/.test(f))
  .map((file) => {
    const text = readFileSync(join(dir, file), 'utf8');
    return { file, text, wf: parse(text) as Workflow };
  });
const pipeline = workflows.find((w) => w.file === 'pipeline.yml')?.wf;
const pkg = JSON.parse(readFileSync('package.json', 'utf8')) as { scripts: Record<string, string> };

describe('every workflow', () => {
  it('exists', () => {
    expect(workflows.length).toBeGreaterThan(0);
  });

  for (const { file, text, wf } of workflows) {
    // 011:T003 Guard: automation runs on the workflow token only, no stored secrets (011:SC-006)
    it(`${file}: references no stored secrets`, () => {
      expect(text).not.toMatch(/secrets\./);
    });

    it(`${file}: grants nothing at the top level`, () => {
      expect(wf.permissions).toEqual({});
    });

    it(`${file}: declares permissions on every job`, () => {
      for (const [name, job] of Object.entries(wf.jobs)) {
        expect(job.permissions, name).toBeTypeOf('object');
      }
    });

    it(`${file}: pins every third-party action to a full commit SHA`, () => {
      const uses = Object.values(wf.jobs).flatMap((job) =>
        (job.steps ?? []).flatMap((s) => (s.uses ? [s.uses] : [])),
      );
      for (const ref of uses.filter((u) => !u.startsWith('./'))) {
        expect(ref).toMatch(/^[\w.-]+\/[\w./-]+@[0-9a-f]{40}$/);
      }
    });
  }
});

interface MatrixJob extends Job {
  strategy?: { matrix?: { shard?: string[] } };
  'runs-on'?: string;
}

// 001:T015 originally; 009:T003 the pipeline as five jobs behind one aggregate check (009:FR-001, 009:FR-002, 009:FR-004)
describe('pipeline.yml', () => {
  const jobs = (pipeline?.jobs ?? {}) as Record<string, MatrixJob>;
  const runs = (job: string) =>
    (jobs[job]?.steps ?? []).flatMap((s) => {
      // A step that IS a check (`npm run x`), not one that mentions it in a summary.
      const m = s.run?.match(/^npm run ([\w:]+)$/m);
      return m ? [m[1]] : [];
    });

  it('runs on pull requests to main and pushes to main', () => {
    expect(pipeline?.on['pull_request']?.branches).toEqual(['main']);
    expect(pipeline?.on['push']?.branches).toEqual(['main']);
  });

  it('has checks, three budget shards, a report, the aggregate gate and a deploy', () => {
    expect(Object.keys(jobs)).toEqual(['checks', 'budgets', 'report', 'quality-gate', 'deploy']);
    expect(jobs['budgets']?.strategy?.matrix?.shard).toEqual(['1/3', '2/3', '3/3']);
    expect([jobs['budgets']?.needs].flat()).toEqual(['checks']);
    expect([jobs['report']?.needs].flat().sort()).toEqual(['budgets', 'checks']);
  });

  it('runs every script of `npm run check`, in the same order, across checks and budgets', () => {
    const local = [...pkg.scripts['check']!.matchAll(/npm run ([\w:]+)/g)].map((m) => m[1]);
    expect(local.length).toBeGreaterThan(0);
    expect([...runs('checks'), ...runs('budgets')]).toEqual(local);
  });

  it('makes quality-gate the single aggregate check that fails unless everything succeeded', () => {
    const gate = jobs['quality-gate'];
    expect((gate as { name?: string })?.name).toBe('quality-gate');
    expect(gate?.if).toContain('always()');
    expect([gate?.needs].flat().sort()).toEqual(['budgets', 'checks', 'report']);
    const script = (gate?.steps ?? []).map((s) => s.run ?? '').join('\n');
    for (const need of ['checks', 'budgets', 'report']) {
      expect(script).toContain(`needs.${need}.result`);
    }
    expect(gate?.permissions).toEqual({});
  });

  // 011:T008 A daily run re-checks main and ships what automation merged (011:FR-009)
  it('also runs once a day', () => {
    const schedule = (pipeline?.on as { schedule?: { cron: string }[] } | undefined)?.schedule;
    expect(schedule).toHaveLength(1);
    expect(schedule?.[0]?.cron).toMatch(/^\d+ \d+ \* \* \*$/);
  });

  it('deploys only after the gate, for any run on main except a pull request', () => {
    const deploy = jobs['deploy'];
    expect([deploy?.needs].flat()).toEqual(['quality-gate']);
    expect(deploy?.if).toContain("github.event_name != 'pull_request'");
    expect(deploy?.if).toContain("github.ref == 'refs/heads/main'");
    expect(deploy?.permissions).toEqual({ pages: 'write', 'id-token': 'write' });
    expect(deploy?.environment).toMatchObject({ name: 'github-pages' });
    expect(deploy?.steps?.some((s) => s.uses?.startsWith('actions/deploy-pages@'))).toBe(true);
  });

  it('grants read-only repository access, and the actions API to the report job only', () => {
    expect(jobs['checks']?.permissions).toEqual({ contents: 'read' });
    expect(jobs['budgets']?.permissions).toEqual({ contents: 'read' });
    expect(jobs['report']?.permissions).toEqual({ contents: 'read', actions: 'read' });
  });

  // 010:T003 The report measures embedded script from the built site on every run (010:FR-001, 010:FR-006)
  it('gives the report job the built site on every run, not only on main', () => {
    const get = (jobs['report']?.steps ?? []).find(
      (s) =>
        s.uses?.startsWith('actions/download-artifact@') &&
        (s as { with?: { name?: string } }).with?.name === 'dist',
    ) as { if?: string } | undefined;
    expect(get).toBeDefined();
    expect(get?.if).toBeUndefined();
  });

  it('leaves JavaScript size to the report: Lighthouse asserts category scores only', () => {
    const rc = require('../../lighthouserc.cjs') as {
      ci: { assert: { assertions: Record<string, unknown> } };
    };
    expect(Object.keys(rc.ci.assert.assertions).sort()).toEqual([
      'categories:accessibility',
      'categories:best-practices',
      'categories:performance',
      'categories:seo',
    ]);
  });

  it('packages the site with the merged report for Pages, from the report job', () => {
    const steps = jobs['report']?.steps ?? [];
    expect(steps.some((s) => s.uses?.startsWith('actions/upload-pages-artifact@'))).toBe(true);
    expect(steps.map((s) => s.run ?? '').join('\n')).toContain('dist/quality/report.json');
  });

  // 011:T008 Packaging follows the deploy rule: any run on main except a pull request (011:FR-009)
  it('packages for Pages under the same condition as the deploy', () => {
    const steps = (jobs['report']?.steps ?? []) as (Step & { name?: string; if?: string })[];
    for (const name of ['Add the report to the site', 'Package site for Pages']) {
      const step = steps.find((s) => s.name === name);
      expect(step?.if, name).toContain("github.event_name != 'pull_request'");
      expect(step?.if, name).toContain("github.ref == 'refs/heads/main'");
    }
  });

  // 011:T006 Known high or critical vulnerabilities in shipped dependencies fail the gate (011:FR-008)
  it('audits shipped dependencies first, locally and in CI', () => {
    expect(pkg.scripts['audit']).toBe('npm audit --omit=dev --audit-level=high');
    expect(pkg.scripts['check']).toMatch(/^npm run audit && /);
    expect(runs('checks')[0]).toBe('audit');
  });
});
