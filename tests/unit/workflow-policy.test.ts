// 001:T015 Workflow policy and gate parity (001:FR-014, 001:FR-016, 001:FR-017, 001:FR-020)
import { readdirSync, readFileSync } from 'node:fs';
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

const dir = '.github/workflows';
const workflows = readdirSync(dir)
  .filter((f) => /\.ya?ml$/.test(f))
  .map((file) => ({ file, wf: parse(readFileSync(join(dir, file), 'utf8')) as Workflow }));
const pipeline = workflows.find((w) => w.file === 'pipeline.yml')?.wf;
const pkg = JSON.parse(readFileSync('package.json', 'utf8')) as { scripts: Record<string, string> };

describe('every workflow', () => {
  it('exists', () => {
    expect(workflows.length).toBeGreaterThan(0);
  });

  for (const { file, wf } of workflows) {
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

describe('pipeline.yml', () => {
  it('runs on pull requests to main and pushes to main', () => {
    expect(pipeline?.on['pull_request']?.branches).toEqual(['main']);
    expect(pipeline?.on['push']?.branches).toEqual(['main']);
  });

  it('runs every script of `npm run check`, in the same order', () => {
    const local = [...pkg.scripts['check']!.matchAll(/npm run ([\w:]+)/g)].map((m) => m[1]);
    const ci = (pipeline?.jobs['quality-gate']?.steps ?? []).flatMap((s) => {
      const m = s.run?.match(/^npm run ([\w:]+)$/m);
      return m ? [m[1]] : [];
    });
    expect(local.length).toBeGreaterThan(0);
    expect(ci).toEqual(local);
  });

  it('deploys only after the gate, only for pushes to main', () => {
    const deploy = pipeline?.jobs['deploy'];
    expect([deploy?.needs].flat()).toContain('quality-gate');
    expect(deploy?.if).toContain("github.event_name == 'push'");
    expect(deploy?.if).toContain("github.ref == 'refs/heads/main'");
    expect(deploy?.permissions).toEqual({ pages: 'write', 'id-token': 'write' });
    expect(deploy?.environment).toMatchObject({ name: 'github-pages' });
    expect(deploy?.steps?.some((s) => s.uses?.startsWith('actions/deploy-pages@'))).toBe(true);
  });

  it('gives the gate read-only access to the repository', () => {
    expect(pipeline?.jobs['quality-gate']?.permissions).toEqual({ contents: 'read' });
  });
});
