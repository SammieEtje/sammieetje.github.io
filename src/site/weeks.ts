// 013:T003 ISO weeks and the weekly slot, in plain calendar dates (013:FR-020, 013:FR-005)
// Dates are yyyy-mm-dd calendar dates in Europe/Amsterdam; week arithmetic on calendar dates needs
// no time zone. Only "today" depends on the zone.

const DAY = 86_400_000;

const toUtc = (date: string) => Date.parse(`${date}T00:00:00Z`);
const fromUtc = (ms: number) => new Date(ms).toISOString().slice(0, 10);

/** Monday of ISO week 1: the week that contains 4 January. */
function weekOneMonday(year: number): number {
  const jan4 = Date.UTC(year, 0, 4);
  const weekday = (new Date(jan4).getUTCDay() + 6) % 7;
  return jan4 - weekday * DAY;
}

const format = (year: number, week: number) => `${year}-W${String(week).padStart(2, '0')}`;

function parse(week: string): { year: number; week: number } {
  const match = /^(\d{4})-W(\d{2})$/.exec(week);
  if (!match) throw new Error(`not an ISO week: ${week}`);
  return { year: Number(match[1]), week: Number(match[2]) };
}

export function isoWeek(date: string): string {
  const ms = toUtc(date);
  const thursday = ms + (3 - ((new Date(ms).getUTCDay() + 6) % 7)) * DAY;
  const year = new Date(thursday).getUTCFullYear();
  return format(year, Math.floor((thursday - weekOneMonday(year)) / (7 * DAY)) + 1);
}

/** Monday of an ISO week, as a calendar date. */
export function mondayOf(week: string): string {
  const { year, week: n } = parse(week);
  return fromUtc(weekOneMonday(year) + (n - 1) * 7 * DAY);
}

/** The publication slot: the Tuesday of the week (013:FR-020). */
export function slotOf(week: string): string {
  return fromUtc(toUtc(mondayOf(week)) + DAY);
}

export function addWeeks(week: string, n: number): string {
  return isoWeek(fromUtc(toUtc(mondayOf(week)) + n * 7 * DAY));
}

export function weeksBetween(from: string, to: string): number {
  return Math.round((toUtc(mondayOf(to)) - toUtc(mondayOf(from))) / (7 * DAY));
}

export function todayIn(timeZone: string, now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone }).format(now);
}

export const isDate = (value: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(value) && fromUtc(toUtc(value)) === value;
