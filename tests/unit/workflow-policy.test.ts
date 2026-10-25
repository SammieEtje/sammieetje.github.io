// 001:T015 Workflow policy and gate parity (001:FR-014, 001:FR-016, 001:FR-017, 001:FR-020)
import { readdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import { statements } from '../../src/site/provenance.ts';

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

  // 015:T004 A signing job between the gate and the deploy (015:FR-002, 015:FR-005)
  it('has checks, three budget shards, a report, the gate, a signing job and a deploy', () => {
    expect(Object.keys(jobs)).toEqual([
      'checks',
      'budgets',
      'report',
      'quality-gate',
      'sign',
      'deploy',
    ]);
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

  it('deploys only after the gate and signing, for any run on main except a pull request', () => {
    const deploy = jobs['deploy'];
    expect([deploy?.needs].flat()).toEqual(['sign']);
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

  // 015:T004 report hands the site with its report to sign; only sign packages for Pages (015:FR-005)
  it('keeps the site with the merged report for signing, from the report job', () => {
    const steps = (jobs['report']?.steps ?? []) as (Step & { with?: Record<string, unknown> })[];
    expect(steps.some((s) => s.uses?.startsWith('actions/upload-pages-artifact@'))).toBe(false);
    expect(steps.map((s) => s.run ?? '').join('\n')).toContain('dist/quality/report.json');
    const keep = steps.at(-1);
    expect(keep?.uses).toMatch(/^actions\/upload-artifact@/);
    expect(keep?.with).toMatchObject({ name: 'site', path: 'dist' });
  });

  // 011:T008 Packaging follows the deploy rule: any run on main except a pull request (011:FR-009)
  it('prepares the site for Pages under the same condition as the deploy', () => {
    const steps = (jobs['report']?.steps ?? []) as (Step & { name?: string; if?: string })[];
    for (const name of ['Add the report to the site', 'Keep the site']) {
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

// 014:T012 The bill of materials is a gate step before the build, locally and in CI (014:FR-001, 014:FR-007 – 014:FR-009)
describe('bill of materials in the pipeline', () => {
  type NamedStep = Step & { name?: string; id?: string; with?: Record<string, unknown> };
  const steps = (pipeline?.jobs['checks']?.steps ?? []) as NamedStep[];
  const index = (name: string) => steps.findIndex((s) => s.name === name);

  it('runs `npm run sbom` as its own step after traceability and before the build', () => {
    const step = steps[index('Bill of materials')];
    expect(step).toMatchObject({ id: 'sbom', run: 'npm run sbom' });
    expect(index('Bill of materials')).toBeGreaterThan(index('Traceability'));
    expect(index('Bill of materials')).toBeLessThan(index('Build'));
  });

  it('shows the outcome in the run summary with the local command', () => {
    const summary = steps.find((s) => s.name === 'Summary') as NamedStep & {
      env?: Record<string, string>;
    };
    expect(summary.env?.['SBOM']).toBe('${{ steps.sbom.outcome }}');
    expect(summary.run).toContain('| Bill of materials | $SBOM | \\`npm run sbom\\` |');
  });

  it('keeps the SBOM of every run as its own artifact', () => {
    const keep = steps.find(
      (s) => s.uses?.startsWith('actions/upload-artifact@') && s.with?.['name'] === 'sbom',
    );
    expect(keep?.with?.['path']).toBe('public/quality/sbom.cdx.json');
  });

  it('runs `npm run sbom` in `npm run check` after trace and before build', () => {
    const local = [...pkg.scripts['check']!.matchAll(/npm run ([\w:]+)/g)].map((m) => m[1]);
    expect(local.indexOf('sbom')).toBe(local.indexOf('trace') + 1);
    expect(local.indexOf('build')).toBe(local.indexOf('sbom') + 1);
  });
});

// 014:T015 What Pages publishes is the dist that checks built, SBOM included (014:FR-009, 014:FR-010)
describe('published bill of materials', () => {
  it('packages the tested build: the dist download comes before the site is kept for signing', () => {
    const steps = (pipeline?.jobs['report']?.steps ?? []) as (Step & { name?: string })[];
    const get = steps.findIndex((s) => s.name === 'Get the tested build');
    const pack = steps.findIndex((s) => s.name === 'Keep the site');
    expect(get).toBeGreaterThanOrEqual(0);
    expect(pack).toBeGreaterThan(get);
  });
});

// 015:T004 Signing: one job, main only, the pipeline's own identity, three statements (015:FR-002 – 015:FR-004, 015:FR-008)
describe('signing job', () => {
  type SignStep = Step & { name?: string; id?: string; with?: Record<string, string> };
  type SignJob = Job & { needs?: string | string[] };
  const jobs = (pipeline?.jobs ?? {}) as Record<string, SignJob>;
  const sign = jobs['sign'];
  const steps = (sign?.steps ?? []) as SignStep[];
  const names = steps.map((s) => s.name);
  const attest = 'actions/attest@1e69f48acb82d1966a394da916b4c1698aa569d6';

  it('runs after the gate, on main only, never for a pull request', () => {
    expect([sign?.needs].flat()).toEqual(['quality-gate']);
    expect(sign?.if).toBe(jobs['deploy']?.if);
  });

  it('has exactly the permissions signing needs', () => {
    expect(sign?.permissions).toEqual({
      contents: 'read',
      'id-token': 'write',
      attestations: 'write',
    });
  });

  it('is the only job that can sign', () => {
    for (const [name, job] of Object.entries(jobs)) {
      if (name === 'sign') continue;
      expect(job.permissions?.['attestations'], name).toBeUndefined();
      if (name !== 'deploy') expect(job.permissions?.['id-token'], name).toBeUndefined();
    }
  });

  it('writes the manifest of the site it got from report, then signs three statements', () => {
    const get = steps.find((s) => s.name === 'Get the site');
    expect(get?.uses).toMatch(/^actions\/download-artifact@/);
    expect(get?.with).toMatchObject({ name: 'site', path: 'dist' });
    expect(steps.find((s) => s.name === 'Write the manifest')?.run).toBe(
      'node scripts/manifest.ts write dist dist/quality/manifest.sha256',
    );
    const signing = steps.filter((s) => s.uses?.startsWith('actions/attest@'));
    expect(signing.map((s) => [s.name, s.uses, s.with])).toEqual([
      ['Sign the manifest', attest, { 'subject-path': 'dist/quality/manifest.sha256' }],
      ['Sign the bill of materials', attest, { 'subject-path': 'dist/quality/sbom.cdx.json' }],
      [
        'Attest the bill of materials',
        attest,
        {
          'subject-path': 'dist/quality/manifest.sha256',
          'sbom-path': 'dist/quality/sbom.cdx.json',
        },
      ],
    ]);
    expect(names.indexOf('Write the manifest')).toBeGreaterThan(names.indexOf('Get the site'));
    expect(names.indexOf('Sign the manifest')).toBeGreaterThan(names.indexOf('Write the manifest'));
  });

  it('publishes each bundle at its path next to the signed file', () => {
    const publish = steps.find((s) => s.name === 'Publish the signatures');
    for (const { id, bundle } of statements) {
      const step = steps.find((s) => s.uses?.startsWith('actions/attest@') && s.id === id);
      expect(step, id).toBeDefined();
      expect(publish?.run).toContain(`"\${{ steps.${id}.outputs.bundle-path }}" "dist/${bundle}"`);
    }
    expect(names.indexOf('Publish the signatures')).toBeGreaterThan(
      names.indexOf('Attest the bill of materials'),
    );
  });

  // 015:T010 Nothing is packaged before all three statements and every file have been verified (015:FR-005 – 015:FR-007)
  it('verifies the provenance, then every file, between publishing the signatures and packaging', () => {
    const verify = names.indexOf('Verify the provenance');
    const check = names.indexOf('Check the files against the manifest');
    expect(steps[verify]?.run).toBe('node scripts/provenance.ts verify dist');
    expect(steps[check]?.run).toBe(
      'node scripts/manifest.ts check dist dist/quality/manifest.sha256',
    );
    expect(verify).toBeGreaterThan(names.indexOf('Publish the signatures'));
    expect(check).toBeGreaterThan(verify);
    expect(names.indexOf('Package site for Pages')).toBeGreaterThan(check);
  });

  it('never continues past a failed step', () => {
    for (const step of steps) {
      expect((step as { 'continue-on-error'?: unknown })['continue-on-error'], step.name).toBe(
        undefined,
      );
    }
  });

  it('packages for Pages as its last step', () => {
    expect(steps.at(-1)?.name).toBe('Package site for Pages');
    expect(steps.at(-1)?.uses).toMatch(/^actions\/upload-pages-artifact@/);
    expect(steps.at(-1)?.with).toMatchObject({ path: 'dist' });
  });
});

// 015:T014 The link check skips only the files that exist after signing (015:FR-010)
describe('links check', () => {
  it('skips external links and exactly the four signed-at-deploy paths', () => {
    const skips = [...pkg.scripts['links']!.matchAll(/--skip "([^"]+)"/g)].map((m) => m[1]);
    expect(skips).toEqual([
      '^https?://(?!localhost|127\\.0\\.0\\.1)',
      '/quality/manifest\\.sha256$',
      '/quality/[^/]+\\.sigstore\\.json$',
    ]);
  });
});
