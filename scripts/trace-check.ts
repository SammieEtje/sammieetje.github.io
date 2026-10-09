// 001:T014 Traceability check: every NNN:FR-xxx / NNN:SC-xxx / NNN:Txxx reference must exist (001:FR-018)
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { pathToFileURL } from 'node:url';

export interface SourceFile {
  path: string;
  content: string;
}

export interface FeatureDocs {
  spec: string;
  tasks?: string;
}

export interface TraceResult {
  errors: string[];
  references: number;
}

const REFERENCE = /(?<![\d:])(\d{3}):((?:FR|SC)-\d{3}|T\d{3})\b/g;

function escape(id: string): string {
  return id.replace(/[-]/g, '\\-');
}

export function checkTraces(files: SourceFile[], specs: Record<string, FeatureDocs>): TraceResult {
  const errors: string[] = [];
  let references = 0;
  const byNumber = new Map(Object.entries(specs).map(([dir, docs]) => [dir.slice(0, 3), docs]));

  for (const file of files) {
    for (const match of file.content.matchAll(REFERENCE)) {
      references += 1;
      const [whole, feature = '', id = ''] = match;
      const docs = byNumber.get(feature);
      if (!docs) {
        errors.push(
          `${file.path}: ${whole} refers to feature ${feature}, which has no specs folder`,
        );
        continue;
      }
      const found = id.startsWith('T')
        ? new RegExp(`^\\s*- \\[[ xX]\\] ${id}\\b`, 'm').test(docs.tasks ?? '')
        : new RegExp(`\\b${escape(id)}\\b`).test(docs.spec);
      if (!found) {
        const where = id.startsWith('T') ? 'tasks.md' : 'spec.md';
        errors.push(`${file.path}: ${whole} does not exist in ${feature}'s ${where}`);
      }
    }
  }
  return { errors, references };
}

const SCAN_DIRS = ['src', 'tests', 'scripts', '.github'];
const SCAN_ROOT_FILES = [
  'astro.config.mjs',
  'eslint.config.js',
  'vitest.config.ts',
  'playwright.config.ts',
  'lighthouserc.cjs',
];
const EXTENSIONS = /\.(ts|astro|mjs|js|cjs|css|ya?ml|json)$/;

function walk(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : EXTENSIONS.test(name) ? [path] : [];
  });
}

export function loadRepository(root: string): {
  files: SourceFile[];
  specs: Record<string, FeatureDocs>;
} {
  const paths = [
    ...SCAN_DIRS.flatMap((dir) => walk(join(root, dir))),
    ...SCAN_ROOT_FILES.map((file) => join(root, file)).filter((path) => existsSync(path)),
  ];
  const files = paths.map((path) => ({
    path: relative(root, path),
    content: readFileSync(path, 'utf8'),
  }));
  const specsDir = join(root, 'specs');
  const specs: Record<string, FeatureDocs> = {};
  for (const dir of existsSync(specsDir) ? readdirSync(specsDir) : []) {
    const specPath = join(specsDir, dir, 'spec.md');
    if (!/^\d{3}-/.test(dir) || !existsSync(specPath)) continue;
    const tasksPath = join(specsDir, dir, 'tasks.md');
    specs[dir] = {
      spec: readFileSync(specPath, 'utf8'),
      ...(existsSync(tasksPath) ? { tasks: readFileSync(tasksPath, 'utf8') } : {}),
    };
  }
  return { files, specs };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { files, specs } = loadRepository(process.cwd());
  const { errors, references } = checkTraces(files, specs);
  if (errors.length > 0) {
    console.error(`Trace check failed: ${errors.length} unknown reference(s)`);
    for (const error of errors) console.error(`  ${error}`);
    process.exit(1);
  }
  console.log(`Trace check passed: ${references} reference(s) in ${files.length} files`);
}
