// 011:T014 Daily catch-up: approved Dependabot updates that fell behind main are brought up to date
// and checked again (011:FR-010). Branch protection requires up-to-date branches, and an update made
// with the workflow token starts no pipeline by itself, so the pipeline is dispatched explicitly.
// Contract: specs/011-auto-dependency-updates/contracts/dependency-automation.md
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

export interface UpdatePr {
  number: number;
  headRefName: string;
  mergeStateStatus: string;
  autoMergeRequest: unknown;
  author: { login: string };
}

const DEPENDABOT = new Set(['app/dependabot', 'dependabot[bot]']);

export function behind(prs: UpdatePr[]): UpdatePr[] {
  return prs.filter(
    (pr) =>
      DEPENDABOT.has(pr.author.login) &&
      pr.autoMergeRequest != null &&
      pr.mergeStateStatus === 'BEHIND',
  );
}

export function catchUpCommands(prs: UpdatePr[], repo: string): string[][] {
  return prs.flatMap((pr) => [
    ['pr', 'update-branch', String(pr.number), '--repo', repo],
    ['workflow', 'run', 'pipeline.yml', '--ref', pr.headRefName, '--repo', repo],
  ]);
}

export function runAll(commands: string[][], exec: (argv: string[]) => void): string[][] {
  const failed: string[][] = [];
  for (const argv of commands) {
    try {
      exec(argv);
    } catch {
      failed.push(argv);
    }
  }
  return failed;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const repo = process.env['GITHUB_REPOSITORY'] ?? 'SammieEtje/sammieetje.github.io';
  const gh = (argv: string[]) => execFileSync('gh', argv, { encoding: 'utf8' });
  const prs = JSON.parse(
    gh([
      'pr',
      'list',
      '--repo',
      repo,
      '--author',
      'app/dependabot',
      '--state',
      'open',
      '--json',
      'number,headRefName,mergeStateStatus,autoMergeRequest,author',
    ]),
  ) as UpdatePr[];
  const due = behind(prs);
  console.log(`${prs.length} open update(s), ${due.length} behind main with auto-merge armed`);
  const failed = runAll(catchUpCommands(due, repo), (argv) => {
    console.log(`gh ${argv.join(' ')}`);
    gh(argv);
  });
  for (const argv of failed) console.error(`failed: gh ${argv.join(' ')}`);
  if (failed.length > 0) process.exit(1);
}
