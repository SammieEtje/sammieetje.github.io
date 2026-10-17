// 013:T003 The editorial planning lives in the frontmatter of Sander's article notes in his private
// vault (013:FR-001, 013:FR-002). This module reads and updates those notes; it never copies them
// into the repository. Data model: specs/013-weekly-article-pipeline/data-model.md
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';
import type { PillarId } from '../../src/site/articles.ts';
import { isDate } from '../../src/site/weeks.ts';

export type Status = 'idea' | 'draft' | 'ready' | 'published' | 'withdrawn' | 'unknown';

export interface Note {
  file: string;
  title: string;
  status: Status;
  pillar?: PillarId;
  targetWeek?: string;
  series?: { name: string; id: string; part: number };
  lang: 'en' | 'nl';
  words?: number;
  publishDate?: string;
  linkedinUrl?: string;
  problems: string[];
}

const STATUSES = new Set(['idea', 'draft', 'ready', 'published', 'withdrawn']);
// The vault's older Dutch statuses, read as their pipeline equivalent.
const ALIASES: Record<string, Status> = {
  gepubliceerd: 'published',
  ingepland: 'ready',
  scheduled: 'ready',
  geparkeerd: 'withdrawn',
};
const PILLARS: Record<string, PillarId> = {
  '1': 'people',
  '2': 'environment',
  '3': 'regulated',
  '4': 'community',
};
const TYPES = new Set(['article', 'artikel', 'content']);
const SKIPPED_DIRS = new Set(['archive', 'analytics']);
// Some notes start with a byte order mark; it is allowed before the frontmatter and kept on write.
const FRONTMATTER = /^﻿?---\n([\s\S]*?)\n---\n/;
const TITLE_PREFIX = /^(?:Week \d+, Post \d+|Deel \d+(?: \([^)]*\))?|Bonus|Draft)\s*[—–:-]\s*/;

export const kebab = (text: string) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

function markdownFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return SKIPPED_DIRS.has(entry.name) ? [] : markdownFiles(path);
    return entry.name.endsWith('.md') ? [path] : [];
  });
}

const text = (value: unknown): string | undefined => {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (value === null || value === undefined) return undefined;
  const s = String(value).trim();
  return s === '' ? undefined : s;
};

function toNote(file: string, source: string): Note | undefined {
  const match = FRONTMATTER.exec(source);
  if (!match) return undefined;
  const heading = /^# (.+)$/m.exec(source.slice(match[0].length))?.[1] ?? '';
  let fm: Record<string, unknown>;
  try {
    fm = (parse(match[1] ?? '') ?? {}) as Record<string, unknown>;
  } catch {
    // A note Sander can fix is better reported than skipped or fatal.
    if (!/^platform:\s*linkedin\s*$/im.test(match[1] ?? '')) return undefined;
    return {
      file,
      title: heading.replace(TITLE_PREFIX, '').trim(),
      status: 'unknown',
      lang: 'en',
      problems: ['frontmatter is not valid YAML'],
    };
  }
  if (!TYPES.has(String(fm.type)) || String(fm.platform).toLowerCase() !== 'linkedin') {
    return undefined;
  }

  const problems: string[] = [];
  const rawStatus = text(fm.status)?.toLowerCase();
  let status: Status = 'draft';
  if (rawStatus !== undefined) {
    if (STATUSES.has(rawStatus)) status = rawStatus as Status;
    else if (ALIASES[rawStatus]) status = ALIASES[rawStatus];
    else {
      status = 'unknown';
      problems.push(`unknown status "${rawStatus}"`);
    }
  }
  const pillar = PILLARS[/^P([1-4])\b/.exec(text(fm.pilaar) ?? '')?.[1] ?? ''];
  const seriesName = text(fm.reeks);
  const part = Number(text(fm.deel));
  const words = Number(text(fm.words));

  const note: Note = {
    file,
    title: heading.replace(TITLE_PREFIX, '').trim(),
    status,
    lang: text(fm.taal)?.toLowerCase() === 'nl' ? 'nl' : 'en',
    problems,
  };
  if (pillar) note.pillar = pillar;
  const targetWeek = text(fm.target_week);
  if (targetWeek) note.targetWeek = targetWeek;
  if (seriesName && Number.isInteger(part) && part > 0) {
    note.series = { name: seriesName, id: kebab(seriesName), part };
  }
  if (Number.isFinite(words) && words > 0) note.words = words;
  // Some notes carry a time after the date ("2026-05-13 08:00"); the date is what counts.
  const publishDate = text(fm.publish_date);
  const day = publishDate?.slice(0, 10);
  if (day && isDate(day)) note.publishDate = day;
  else if (publishDate) problems.push(`publish_date "${publishDate}" is not a date`);
  const linkedinUrl = text(fm.linkedin_url);
  if (linkedinUrl) note.linkedinUrl = linkedinUrl;
  return note;
}

export function readNotes(dir: string): Note[] {
  return markdownFiles(dir)
    .map((file) => toNote(file, readFileSync(file, 'utf8')))
    .filter((n): n is Note => n !== undefined);
}

/**
 * Sets top-level frontmatter keys by rewriting only their lines (or appending them), so every
 * other byte of the note stays as Sander wrote it.
 */
export function writeFrontmatter(file: string, updates: Record<string, string>): void {
  const source = readFileSync(file, 'utf8');
  const match = FRONTMATTER.exec(source);
  if (!match) throw new Error(`${file}: no frontmatter`);
  const lines = (match[1] ?? '').split('\n');
  for (const [key, value] of Object.entries(updates)) {
    const line = `${key}: ${value}`;
    const at = lines.findIndex((l) => l.startsWith(`${key}:`));
    if (at === -1) lines.push(line);
    else lines[at] = line;
  }
  const bom = source.startsWith('﻿') ? '﻿' : '';
  writeFileSync(file, `${bom}---\n${lines.join('\n')}\n---\n${source.slice(match[0].length)}`);
}
