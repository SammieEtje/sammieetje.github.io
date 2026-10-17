// 013:T017 The scripted half of the publish step: check a note against the plan and the site, derive
// the site record, and mark the note published (013:FR-003, 013:FR-006 – 013:FR-009, 013:FR-014).
// Contract: specs/013-weekly-article-pipeline/contracts/pipeline-cli.md
import { basename } from 'node:path';
import { ARTICLE_URL } from '../../src/site/article-rules.ts';
import type { Article, PillarId } from '../../src/site/articles.ts';
import { isDate, isoWeek, slotOf } from '../../src/site/weeks.ts';
import { writeFrontmatter, type Note } from './notes.ts';

export const WORDS_PER_MINUTE = 230;

/** planned: the normal weekly step; unplanned: never planned; backfill: already on the site. */
export type Mode = 'planned' | 'unplanned' | 'backfill';

export interface PublishInput {
  date: string;
  url: string;
  mode?: Mode;
}

export interface SiteRecord {
  title: string;
  url: string;
  published: string;
  pillar: PillarId;
  minutes: number;
  lang: 'en' | 'nl';
  series?: { name: string; id: string; part: number };
}

export type Result =
  { ok: true; note: Note; record: SiteRecord } | { ok: false; problems: string[] };

export function findNote(notes: readonly Note[], key: string): Note | undefined {
  const k = key.toLowerCase();
  return notes.find(
    (n) =>
      n.title.toLowerCase() === k ||
      basename(n.file).toLowerCase() === k ||
      basename(n.file, '.md').toLowerCase() === k,
  );
}

export function verify(
  notes: readonly Note[],
  key: string,
  input: PublishInput,
  site: readonly Article[],
): Result {
  const note = findNote(notes, key);
  if (!note) return { ok: false, problems: [`no LinkedIn note matches "${key}"`] };
  const { date, url, mode = 'planned' } = input;
  const problems: string[] = [];
  const p = (problem: string) => problems.push(`"${note.title}": ${problem}`);

  if (mode === 'planned' && note.status !== 'ready') p(`status is ${note.status}, not ready`);
  if (!isDate(date)) p(`invalid date ${date}`);
  else if (mode === 'planned') {
    if (!note.targetWeek) p('no target_week');
    else if (isoWeek(date) !== note.targetWeek) {
      p(`published ${date} is not in planned week ${note.targetWeek} (${slotOf(note.targetWeek)})`);
    }
  }

  if (!ARTICLE_URL.test(url)) p(`not a LinkedIn Article URL: ${url}`);
  const onSite = site.find((a) => a.url === url);
  if (mode === 'backfill') {
    if (!onSite) p('URL is not on the site');
    else if (onSite.published !== date) {
      p(`the site has this URL on ${onSite.published}, not ${date}`);
    }
  } else if (onSite) p(`URL is already on the site as ${onSite.id}`);

  if (!note.pillar) p('no pilaar');
  if (mode !== 'backfill' && !note.words) p('no words');

  if (problems.length > 0 || !note.pillar) return { ok: false, problems };
  const record: SiteRecord = {
    title: note.title,
    url,
    published: date,
    pillar: note.pillar,
    minutes: Math.ceil((note.words ?? 0) / WORDS_PER_MINUTE),
    lang: note.lang,
  };
  if (note.series) record.series = note.series;
  return { ok: true, note, record };
}

export function markPublished(
  notes: readonly Note[],
  key: string,
  input: PublishInput,
  site: readonly Article[],
): Result {
  const result = verify(notes, key, input, site);
  if (!result.ok) return result;
  const updates: Record<string, string> = {
    status: 'published',
    publish_date: input.date,
    linkedin_url: input.url,
  };
  if ((input.mode ?? 'planned') !== 'planned') updates.target_week = isoWeek(input.date);
  writeFrontmatter(result.note.file, updates);
  return result;
}
