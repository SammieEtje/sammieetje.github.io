// 016:T005 The evidence record of one deploy, built from plain data so every rule is testable (016:FR-001 – 016:FR-003, 016:FR-008)
// 016:T006 CLI `record <dir>`: gather run, job and pull request data with gh and write the record
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { copyFileSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { tagPrefix } from '../src/site/evidence.ts';
import { verifyArgs } from '../src/site/provenance.ts';
import { LOCAL_PATH } from './local-path.ts';

export type Trigger = 'push' | 'schedule' | 'workflow_dispatch';

export interface PullInfo {
  number: number;
  author: string;
  mergedBy: string | null;
  gate: string | null;
}

export interface FileDigest {
  name: string;
  sha256: string;
  source: 'published' | 'normalised';
  originalSha256?: string;
}

export interface RecordInputs {
  repository: string;
  commit: string;
  run: {
    id: number;
    attempt: number;
    url: string;
    trigger: Trigger;
    actor: string;
    startedAt: string;
  };
  deployedAt: string;
  previous: string | null;
  jobs: { name: string; steps: { name: string; conclusion: string | null }[] }[];
  /** Commits since the previous record, oldest first. */
  compared: string[];
  pulls: Record<string, PullInfo | null>;
  files: FileDigest[];
}

export interface Change {
  commit: string;
  pullRequest: number | null;
  author: string | null;
  mergedBy: string | null;
  prGate: string | null;
}

export interface EvidenceRecord {
  schemaVersion: 1;
  tag: string;
  previous: string | null;
  repository: string;
  commit: string;
  run: RecordInputs['run'];
  deployedAt: string;
  gate: { job: string; step: string; conclusion: string | null; command: string | null }[];
  changes: Change[];
  files: FileDigest[];
}

export const ownJob = 'evidence';

/** The gate checks and the command that runs each locally, as in the `checks` summary table. */
const gateCommands: Record<string, string> = {
  'Known vulnerabilities': 'npm run audit',
  Formatting: 'npm run format:check',
  Lint: 'npm run lint',
  Types: 'npm run typecheck',
  'Unit tests': 'npm run test:unit',
  Traceability: 'npm run trace',
  'Bill of materials': 'npm run sbom',
  Build: 'npm run build',
  'End-to-end and accessibility tests': 'npm run test:e2e',
  'Internal links': 'npm run links',
  Budgets: 'npm run budgets',
};

const change = (commit: string, pull: PullInfo | null | undefined): Change => ({
  commit,
  pullRequest: pull?.number ?? null,
  author: pull?.author ?? null,
  mergedBy: pull?.mergedBy ?? null,
  prGate: pull?.gate ?? null,
});

export function buildRecord(inputs: RecordInputs): EvidenceRecord {
  const commits =
    inputs.run.trigger === 'push' || inputs.compared.length === 0
      ? [inputs.commit]
      : inputs.compared;
  return {
    schemaVersion: 1,
    tag: `${tagPrefix}${inputs.deployedAt.slice(0, 10)}-${inputs.run.id}`,
    previous: inputs.previous,
    repository: inputs.repository,
    commit: inputs.commit,
    run: inputs.run,
    deployedAt: inputs.deployedAt,
    gate: inputs.jobs
      .filter((job) => job.name !== ownJob)
      .flatMap((job) =>
        job.steps.map((step) => ({
          job: job.name,
          step: step.name,
          conclusion: step.conclusion,
          command: gateCommands[step.name] ?? null,
        })),
      ),
    changes: commits.map((commit) => change(commit, inputs.pulls[commit])),
    files: inputs.files,
  };
}

export function normaliseReport(text: string, workdir: string): string {
  return text.split(workdir).join('.');
}

/** Names of the files that contain a local absolute path, with the SBOM's pattern (014). */
export function findLocalPaths(files: { name: string; text: string }[]): string[] {
  return files.filter((f) => LOCAL_PATH.test(f.text)).map((f) => f.name);
}

// 016:T009 An immutable pre-release on the deployed commit, never the latest (016:FR-005)
export function releaseArgs(record: EvidenceRecord, files: string[], notesFile: string): string[] {
  return [
    'release',
    'create',
    record.tag,
    ...files,
    '--prerelease',
    '--latest=false',
    '--target',
    record.commit,
    '--title',
    `Evidence ${record.deployedAt.slice(0, 10)} ${record.commit.slice(0, 7)}`,
    '--notes-file',
    notesFile,
  ];
}

export function releaseNotes(record: EvidenceRecord): string {
  const server = `https://github.com/${record.repository}`;
  const changes = record.changes.map((c) =>
    c.pullRequest
      ? `- ${server}/pull/${c.pullRequest} by ${c.author}, merged by ${c.mergedBy ?? 'automation'}, gate ${c.prGate ?? 'unknown'}`
      : `- direct commit ${c.commit.slice(0, 7)}`,
  );
  return [
    `Evidence of the deploy of ${record.commit.slice(0, 7)} on ${record.deployedAt}.`,
    '',
    `- Trigger: ${record.run.trigger} by ${record.run.actor}`,
    `- Run: ${record.run.url}`,
    `- Previous record: ${record.previous ?? 'none'}`,
    '',
    'Changes:',
    ...changes,
    '',
    'The assets are immutable. `evidence.json` lists every job and step of the run and the digest of every other asset; `evidence.sigstore.json` is its signature.',
    '',
  ].join('\n');
}

// 016:T013 Two calendar years from the deploy; exactly two years is still kept (016:FR-007)
export interface StoredRecord {
  tag: string;
  publishedAt: string;
  commit: string;
}

export function expired(releases: StoredRecord[], now: Date): StoredRecord[] {
  const keepUntil = (publishedAt: string) => {
    const date = new Date(publishedAt);
    date.setUTCFullYear(date.getUTCFullYear() + 2);
    return date.getTime();
  };
  return releases
    .filter((r) => r.tag.startsWith(tagPrefix) && now.getTime() > keepUntil(r.publishedAt))
    .sort((a, b) => (a.publishedAt < b.publishedAt ? -1 : 1));
}

const sha256 = (data: string | Buffer) => createHash('sha256').update(data).digest('hex');
const gh = <T>(path: string): T =>
  JSON.parse(execFileSync('gh', ['api', path], { encoding: 'utf8', maxBuffer: 64 << 20 })) as T;

interface ApiRelease {
  tag_name: string;
  target_commitish: string;
  published_at: string | null;
}

function pullFor(repo: string, commit: string): PullInfo | null {
  const pulls = gh<{ number: number; merged_at: string | null }[]>(
    `repos/${repo}/commits/${commit}/pulls`,
  );
  const merged = pulls.find((p) => p.merged_at);
  if (!merged) return null;
  const pull = gh<{
    user: { login: string };
    merged_by: { login: string } | null;
    head: { sha: string };
  }>(`repos/${repo}/pulls/${merged.number}`);
  const runs = gh<{ check_runs: { conclusion: string | null }[] }>(
    `repos/${repo}/commits/${pull.head.sha}/check-runs?check_name=quality-gate`,
  );
  return {
    number: merged.number,
    author: pull.user.login,
    mergedBy: pull.merged_by?.login ?? null,
    gate: runs.check_runs[0]?.conclusion ?? null,
  };
}

function record(dir: string): void {
  const env = (name: string) => {
    const value = process.env[name];
    if (!value) throw new Error(`${name} is not set`);
    return value;
  };
  const repo = env('GITHUB_REPOSITORY');
  const commit = env('GITHUB_SHA');
  const runId = Number(env('GITHUB_RUN_ID'));
  const attempt = Number(env('GITHUB_RUN_ATTEMPT'));
  const run = gh<{ run_started_at: string; html_url: string }>(
    `repos/${repo}/actions/runs/${runId}`,
  );
  const { jobs } = gh<{
    jobs: {
      name: string;
      completed_at: string | null;
      steps?: { name: string; conclusion: string | null }[];
    }[];
  }>(`repos/${repo}/actions/runs/${runId}/attempts/${attempt}/jobs?per_page=100`);
  const releases = gh<ApiRelease[]>(`repos/${repo}/releases?per_page=100`)
    .filter((r) => r.tag_name.startsWith(tagPrefix) && r.published_at)
    .sort((a, b) => (a.published_at! < b.published_at! ? 1 : -1));
  const previous = releases[0] ?? null;
  const trigger = env('GITHUB_EVENT_NAME') as Trigger;
  const compared =
    previous && trigger !== 'push'
      ? gh<{ commits: { sha: string }[] }>(
          `repos/${repo}/compare/${previous.target_commitish}...${commit}`,
        ).commits.map((c) => c.sha)
      : [];
  const pulls = Object.fromEntries(
    (trigger === 'push' || compared.length === 0 ? [commit] : compared).map((c) => [
      c,
      pullFor(repo, c),
    ]),
  );

  // The runner's paths are replaced in the test reports; the originals' digests are kept.
  const workdir = env('GITHUB_WORKSPACE');
  const normalised: FileDigest[] = ['unit.json', 'e2e.json'].map((name) => {
    const original = readFileSync(join('reports', name), 'utf8');
    const text = normaliseReport(original, workdir);
    writeFileSync(join(dir, name), text);
    return { name, sha256: sha256(text), source: 'normalised', originalSha256: sha256(original) };
  });
  const published: FileDigest[] = readdirSync(dir)
    .filter((name) => !normalised.some((n) => n.name === name) && name !== 'evidence.json')
    .sort()
    .map((name) => ({ name, sha256: sha256(readFileSync(join(dir, name))), source: 'published' }));

  const deploy = jobs.find((j) => j.name === 'deploy');
  const evidence = buildRecord({
    repository: repo,
    commit,
    run: {
      id: runId,
      attempt,
      url: run.html_url,
      trigger,
      actor: env('GITHUB_TRIGGERING_ACTOR'),
      startedAt: run.run_started_at,
    },
    deployedAt: deploy?.completed_at ?? new Date().toISOString(),
    previous: previous?.tag_name ?? null,
    jobs: jobs.map((j) => ({ name: j.name, steps: j.steps ?? [] })),
    compared,
    pulls,
    files: [...published, ...normalised],
  });
  writeFileSync(join(dir, 'evidence.json'), `${JSON.stringify(evidence, null, 2)}\n`);

  const leaking = findLocalPaths(
    readdirSync(dir).map((name) => ({ name, text: readFileSync(join(dir, name), 'utf8') })),
  );
  if (leaking.length > 0) {
    console.error(`Local paths found in: ${leaking.join(', ')}`);
    process.exit(1);
  }
  console.log(`Wrote ${join(dir, 'evidence.json')} for ${evidence.tag}`);
}

const readRecord = (dir: string) =>
  JSON.parse(readFileSync(join(dir, 'evidence.json'), 'utf8')) as EvidenceRecord;
const run = (args: string[]) => execFileSync('gh', args, { stdio: 'inherit' });

// 016:T009 Publish: add the record's signature, then create the release with every file at once
function publish(dir: string): void {
  const bundle = process.env['BUNDLE_PATH'];
  if (!bundle) throw new Error('BUNDLE_PATH is not set');
  copyFileSync(bundle, join(dir, 'evidence.sigstore.json'));
  const evidence = readRecord(dir);
  const notes = join(process.env['RUNNER_TEMP'] ?? tmpdir(), 'evidence-notes.md');
  writeFileSync(notes, releaseNotes(evidence));
  const files = readdirSync(dir)
    .sort()
    .map((name) => join(dir, name));
  run(releaseArgs(evidence, files, notes));
}

// 016 fix: GitHub writes the release attestation shortly after publishing; try again until it is there
export async function retry<T>(
  attempt: () => T,
  options: { attempts: number; delayMs: number; sleep?: (ms: number) => Promise<void> },
): Promise<T> {
  const sleep = options.sleep ?? ((ms) => new Promise<void>((done) => setTimeout(done, ms)));
  for (let i = 1; ; i++) {
    try {
      return attempt();
    } catch (error) {
      if (i >= options.attempts) throw error;
      await sleep(options.delayMs);
    }
  }
}

// 016:T009 Verify: GitHub's release attestation, and the record's own signature (015's signer rules)
async function verify(dir: string): Promise<void> {
  const evidence = readRecord(dir);
  await retry(() => run(['release', 'verify', evidence.tag, '--repo', evidence.repository]), {
    attempts: 12,
    delayMs: 10_000,
  });
  run(
    verifyArgs({
      file: join(dir, 'evidence.json'),
      bundle: join(dir, 'evidence.sigstore.json'),
      predicateType: 'https://slsa.dev/provenance/v1',
    }),
  );
  console.log(`${evidence.tag}: release and record verified`);
}

// 016:T013 The weekly clean-up: delete expired records, and say what was removed
function storedRecords(repo: string): StoredRecord[] {
  const pages = JSON.parse(
    execFileSync('gh', ['api', '--paginate', '--slurp', `repos/${repo}/releases?per_page=100`], {
      encoding: 'utf8',
      maxBuffer: 64 << 20,
    }),
  ) as ApiRelease[][];
  return pages
    .flat()
    .filter((r) => r.published_at)
    .map((r) => ({ tag: r.tag_name, publishedAt: r.published_at!, commit: r.target_commitish }));
}

function cleanUp(): void {
  const repo = process.env['GITHUB_REPOSITORY'];
  if (!repo) throw new Error('GITHUB_REPOSITORY is not set');
  const removed = expired(storedRecords(repo), new Date());
  for (const r of removed)
    run(['release', 'delete', r.tag, '--yes', '--cleanup-tag', '--repo', repo]);
  const summary = [
    '### Evidence retention',
    removed.length === 0
      ? 'Nothing to remove: every record is younger than two years.'
      : [
          '| Tag | Deployed | Commit |',
          '|---|---|---|',
          ...removed.map((r) => `| ${r.tag} | ${r.publishedAt} | ${r.commit} |`),
        ].join('\n'),
    '',
  ].join('\n');
  if (process.env['GITHUB_STEP_SUMMARY'])
    writeFileSync(process.env['GITHUB_STEP_SUMMARY'], summary, { flag: 'a' });
  console.log(summary);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [command, dir] = process.argv.slice(2);
  if (command === 'clean-up') {
    cleanUp();
    process.exit(0);
  }
  if (command === 'record' && dir) record(dir);
  else if (command === 'publish' && dir) publish(dir);
  else if (command === 'verify' && dir) await verify(dir);
  else {
    console.error('Usage: node scripts/evidence.ts record|publish|verify <dir> | clean-up');
    process.exitCode = 1;
  }
}
