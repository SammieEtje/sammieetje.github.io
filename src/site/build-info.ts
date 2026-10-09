// 001:T040 Which source version is live, resolved at build time (001:FR-012)
import { execSync } from 'node:child_process';

export const repoUrl = 'https://github.com/SammieEtje/sammieetje.github.io';
export const specsUrl = `${repoUrl}/tree/main/specs`;

export interface BuildInfo {
  sha: string;
  shortSha: string;
  url: string;
}

const isSha = (value: string | undefined): value is string => /^[0-9a-f]{40}$/.test(value ?? '');

export function resolveBuildInfo(
  env: Record<string, string | undefined>,
  readGitHead: () => string,
): BuildInfo {
  let sha = env['GITHUB_SHA'];
  if (!isSha(sha)) {
    try {
      sha = readGitHead().trim();
    } catch {
      sha = undefined;
    }
  }
  if (!isSha(sha)) return { sha: 'local', shortSha: 'local', url: repoUrl };
  return { sha, shortSha: sha.slice(0, 7), url: `${repoUrl}/commit/${sha}` };
}

export const buildInfo = resolveBuildInfo(process.env, () =>
  execSync('git rev-parse HEAD', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }),
);
