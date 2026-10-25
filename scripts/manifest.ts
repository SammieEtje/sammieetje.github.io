// 015:T005 Manifest of the published site in sha256sum format: one line per file, sorted (015:FR-001)
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
import { statements } from '../src/site/provenance.ts';

export interface Entry {
  path: string;
  sha256: string;
}

export const manifestPath = 'quality/manifest.sha256';
/** Created after the manifest, so it cannot list them. */
const unlisted = new Set([manifestPath, ...statements.map((s) => s.bundle)]);
const isUnlisted = (path: string) =>
  unlisted.has(path) || /^quality\/[^/]+\.sigstore\.json$/.test(path);

const sha256 = (file: string) => createHash('sha256').update(readFileSync(file)).digest('hex');

/** Every file under `dir` by its site path, with its SHA-256, sorted by path. */
export function listFiles(dir: string): Entry[] {
  const files = readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((d) => d.isFile())
    .map((d) => join(d.parentPath, d.name));
  return files
    .map((file) => ({ path: relative(dir, file).split(sep).join('/'), sha256: sha256(file) }))
    .filter((entry) => !isUnlisted(entry.path))
    .sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
}

export function renderManifest(entries: Entry[]): string {
  return entries.map((e) => `${e.sha256}  ${e.path}\n`).join('');
}

const LINE = /^([0-9a-f]{64}) {2}([^\n]+)$/;

// 015:T011 Re-hash the tree against the manifest; changed, missing and unlisted files are named (015:FR-006, 015:FR-007)
export function checkTree(dir: string, manifest: string): { problems: string[]; passed: boolean } {
  const problems: string[] = [];
  const listed = new Map<string, string>();
  manifest
    .split('\n')
    .slice(0, manifest.endsWith('\n') ? -1 : undefined)
    .forEach((line, i) => {
      const match = LINE.exec(line);
      if (match) listed.set(match[2]!, match[1]!);
      else problems.push(`manifest: invalid line ${i + 1}`);
    });
  const actual = new Map(listFiles(dir).map((e) => [e.path, e.sha256]));
  for (const [path, digest] of listed) {
    const found = actual.get(path);
    if (found === undefined) problems.push(`${path}: missing`);
    else if (found !== digest) problems.push(`${path}: changed`);
  }
  for (const path of actual.keys()) if (!listed.has(path)) problems.push(`${path}: not listed`);
  return { problems, passed: problems.length === 0 };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [command, dir, file] = process.argv.slice(2);
  if (command === 'write' && dir && file) {
    const entries = listFiles(dir);
    writeFileSync(file, renderManifest(entries));
    console.log(`Wrote ${file} (${entries.length} files)`);
  } else if (command === 'check' && dir && file) {
    const result = checkTree(dir, readFileSync(file, 'utf8'));
    for (const problem of result.problems) console.error(problem);
    console.log(result.passed ? `${dir} matches ${file}` : `${dir} does not match ${file}`);
    process.exitCode = result.passed ? 0 : 1;
  } else {
    console.error('Usage: node scripts/manifest.ts write|check <dir> <manifest>');
    process.exitCode = 1;
  }
}
