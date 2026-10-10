// 009:T008 Specs shipped: Spec Kit features whose tasks are all complete (009:FR-011)
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export interface SpecEntry {
  dir: string;
  tasks: string | null;
}

export function shippedSpecs(entries: SpecEntry[]): string[] {
  return entries
    .filter((e) => /^\d{3}-/.test(e.dir) && e.tasks !== null && !/^\s*- \[ \]/m.test(e.tasks))
    .map((e) => e.dir)
    .sort();
}

export function readSpecs(root = process.cwd()): SpecEntry[] {
  const dir = join(root, 'specs');
  if (!existsSync(dir)) return [];
  return readdirSync(dir).map((name) => {
    const tasks = join(dir, name, 'tasks.md');
    return { dir: name, tasks: existsSync(tasks) ? readFileSync(tasks, 'utf8') : null };
  });
}
