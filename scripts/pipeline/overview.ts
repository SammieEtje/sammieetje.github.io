// 013:T012 The private overview: the coming weeks, gaps, missed weeks and notes that need attention
// (013:FR-002, 013:FR-004, 013:FR-005). Contract: specs/013-weekly-article-pipeline/contracts/pipeline-cli.md
import { pillars, type PillarId } from '../../src/site/articles.ts';
import { addWeeks, isoWeek, slotOf, weeksBetween } from '../../src/site/weeks.ts';
import type { Note } from './notes.ts';

export const HORIZON = 8;
// 013:T014 Two ready articles ahead (013:FR-019)
export const BUFFER_TARGET = 2;

export type WeekState = 'covered' | 'planned' | 'double-booked' | 'gap';

export interface Week {
  week: string;
  tuesday: string;
  state: WeekState;
  notes: Note[];
}

export interface Overview {
  today: string;
  currentWeek: string;
  weeks: Week[];
  lastPublished?: { date: string; week: string };
  missed: number;
  pillarGaps: PillarId[];
  attention: string[];
  ready: number;
}

const UNPUBLISHED = new Set(['idea', 'draft', 'ready']);

const isPublished = (n: Note): n is Note & { publishDate: string } =>
  n.status === 'published' && n.publishDate !== undefined;

/** The first week whose Tuesday slot is today or later. */
export function firstOpenWeek(today: string): string {
  const current = isoWeek(today);
  return today <= slotOf(current) ? current : addWeeks(current, 1);
}

function attentionFor(n: Note, firstOpen: string): string[] {
  const out = [...n.problems];
  if (n.status === 'ready') {
    if (!n.targetWeek) out.push('ready without target_week');
    if (!n.words) out.push('ready without words');
    if (!n.pillar) out.push('ready without pilaar');
  }
  if (n.status === 'published') {
    if (!n.linkedinUrl) out.push('published without linkedin_url');
    if (!n.publishDate) out.push('published without publish_date');
  }
  if (UNPUBLISHED.has(n.status) && n.targetWeek && n.targetWeek < firstOpen) {
    out.push(`planned for ${n.targetWeek}, which has passed`);
  }
  return out.map((problem) => `"${n.title}": ${problem}`);
}

export function overview(notes: readonly Note[], today: string): Overview {
  const currentWeek = isoWeek(today);
  const start = firstOpenWeek(today);
  const published = notes.filter(isPublished);
  const planned = notes.filter((n) => UNPUBLISHED.has(n.status) && n.targetWeek);

  const weeks: Week[] = Array.from({ length: HORIZON }, (_, i) => {
    const week = addWeeks(start, i);
    const covering = published.filter((n) => isoWeek(n.publishDate) === week);
    const planning = planned.filter((n) => n.targetWeek === week);
    const state: WeekState =
      covering.length > 0
        ? 'covered'
        : planning.length > 1
          ? 'double-booked'
          : planning.length === 1
            ? 'planned'
            : 'gap';
    return { week, tuesday: slotOf(week), state, notes: covering.length ? covering : planning };
  });

  const last = published
    .map((n) => n.publishDate)
    .sort()
    .at(-1);
  const lastPublished = last ? { date: last, week: isoWeek(last) } : undefined;
  const lastPassed = addWeeks(start, -1);
  const missed = lastPublished ? Math.max(0, weeksBetween(lastPublished.week, lastPassed)) : 0;

  const pillarGaps = pillars
    .map((p) => p.id)
    .filter(
      (id) =>
        !published.some((n) => n.pillar === id) &&
        !planned.some((n) => n.pillar === id && n.targetWeek! >= start),
    );

  const attention = notes.flatMap((n) => attentionFor(n, start));
  return {
    today,
    currentWeek,
    weeks,
    ...(lastPublished ? { lastPublished } : {}),
    missed,
    pillarGaps,
    attention,
    ready: notes.filter((n) => n.status === 'ready').length,
  };
}

// 013:T014 The buffer line, with a warning below target (013:FR-019)
export function bufferLine(ready: number): string {
  const line = `Buffer: ready ${ready} of ${BUFFER_TARGET}.`;
  return ready < BUFFER_TARGET
    ? `${line} WARNING: fewer than ${BUFFER_TARGET} articles are ready.`
    : line;
}

// 013:T014 The Friday check: what is ready for the next slot (013:FR-026)
export function fridayReport(notes: readonly Note[], today: string): string {
  const o = overview(notes, today);
  const next = o.weeks[0]!;
  const readyNote = next.notes.find((n) => n.status === 'ready');
  const line = readyNote
    ? `Tuesday ${next.tuesday}: "${readyNote.title}" is ready.`
    : `Tuesday ${next.tuesday}: nothing is ready.`;
  return `${line}\n${bufferLine(o.ready)}`;
}

const pad = (text: string, width: number) => text.padEnd(width);

export function renderOverview(o: Overview): string {
  const rows = o.weeks.flatMap((w) => {
    const notes = w.notes.length ? w.notes : [undefined];
    return notes.map((n) =>
      [
        pad(w.week, 9),
        pad(w.tuesday, 11),
        pad(w.state, 13),
        pad(n?.title ?? '-', 48),
        pad(n?.pillar ?? '', 12),
        n?.status ?? '',
      ]
        .join(' ')
        .trimEnd(),
    );
  });
  const header = [
    pad('Week', 9),
    pad('Tuesday', 11),
    pad('State', 13),
    pad('Article', 48),
    pad('Pillar', 12),
    'Status',
  ].join(' ');
  const missed =
    o.missed > 0 && o.lastPublished
      ? `Missed: ${o.missed} weeks since the last article (${o.lastPublished.date}, ${o.lastPublished.week}).`
      : 'Missed: none.';
  const gaps = o.pillarGaps.length ? o.pillarGaps.join(', ') : 'none';
  const attention = o.attention.length
    ? `Needs attention:\n${o.attention.map((a) => `- ${a}`).join('\n')}`
    : 'Needs attention: none.';
  return [
    `Pipeline on ${o.today} (${o.currentWeek}). Slot: Tuesday 08:00.`,
    '',
    header,
    ...rows,
    '',
    missed,
    `Pillars without planned or published work: ${gaps}.`,
    attention,
    bufferLine(o.ready),
  ].join('\n');
}
