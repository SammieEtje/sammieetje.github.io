// 013:T007 The mistakes made by hand, as rules the gate checks (013:FR-011 – 013:FR-017, 013:SC-002)
// Every problem starts with the article (or pillar) it is about. Data model:
// specs/013-weekly-article-pipeline/data-model.md
import { locales } from '../i18n/ui.ts';
import type { Article, Pillar, SeriesId } from './articles.ts';
import { styleViolations } from './style-rules.ts';
import { isDate } from './weeks.ts';

export const FIRST_ARTICLE = '2026-03-09';
export const ARTICLE_URL = /^https:\/\/www\.linkedin\.com\/pulse\/[a-z0-9-]+$/;
const FIELDS = new Set([
  'id',
  'title',
  'url',
  'published',
  'minutes',
  'pillar',
  'series',
  'excerpt',
  'lang',
]);

/** Sentences, split after . ! or ? before a capital or an opening quote. */
export const sentences = (text: string) => text.split(/(?<=[.!?])\s+(?=[A-Z"“])/).filter(Boolean);

export interface RuleContext {
  today: string;
  pillars: readonly Pillar[];
  series: Record<SeriesId, { name: Record<string, string> }>;
}

export function articleProblems(list: readonly Article[], context: RuleContext): string[] {
  const { today, pillars, series } = context;
  const out: string[] = [];
  const pillarIds = new Set<string>(pillars.map((p) => p.id));

  for (const p of pillars) {
    for (const l of locales) {
      if (!p.name[l]?.trim()) out.push(`pillar ${p.id}: name missing in ${l} (FR-015)`);
      if (!p.intro[l]?.trim()) out.push(`pillar ${p.id}: intro missing in ${l} (FR-015)`);
    }
  }
  for (const [id, s] of Object.entries(series)) {
    for (const l of locales) {
      if (!s.name[l]?.trim()) out.push(`series ${id}: name missing in ${l} (FR-015)`);
    }
  }

  const seenIds = new Set<string>();
  const seenUrls = new Map<string, string>();
  for (const a of list) {
    const p = (problem: string) => out.push(`${a.id}: ${problem}`);

    for (const key of Object.keys(a)) if (!FIELDS.has(key)) p(`unexpected field ${key} (FR-011)`);

    if (seenIds.has(a.id)) p('duplicate id (FR-012)');
    seenIds.add(a.id);
    const other = seenUrls.get(a.url);
    if (other !== undefined && other !== a.id) p(`duplicate URL, also used by ${other} (FR-012)`);
    else seenUrls.set(a.url, a.id);

    if (!ARTICLE_URL.test(a.url)) p(`not a LinkedIn Article URL: ${a.url} (FR-013)`);

    if (!isDate(a.published)) p(`invalid date ${a.published} (FR-014)`);
    else if (a.published > today) p(`date ${a.published} is in the future (FR-014)`);
    else if (a.published < FIRST_ARTICLE) {
      p(`date ${a.published} is before the first article, ${FIRST_ARTICLE} (FR-014)`);
    }

    for (const l of locales) {
      const text = a.excerpt?.[l]?.trim() ?? '';
      if (text === '') {
        p(`excerpt missing in ${l} (FR-015)`);
        continue;
      }
      const count = sentences(text).length;
      if (count > 2) p(`excerpt in ${l} has ${count} sentences, at most 2 (FR-016)`);
      for (const rule of styleViolations(text, l)) {
        p(`excerpt in ${l} breaks style rule ${rule} (FR-016)`);
      }
    }

    if (!pillarIds.has(a.pillar)) p(`missing or unknown pillar ${a.pillar} (FR-017)`);

    if (a.series) {
      const { id, part, total } = a.series;
      if (!(id in series)) p(`unknown series ${id} (006:FR-006)`);
      else if (total !== undefined && part > total) {
        p(`series part ${part} is beyond the total ${total} (006:FR-006)`);
      }
    }
  }
  return out;
}
