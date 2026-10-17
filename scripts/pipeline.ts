// 013:T012 `npm run pipeline`: the editorial pipeline, read from Sander's private vault
// (013:FR-001, 013:FR-004). The vault path comes from ARTICLE_VAULT_DIR and is never committed.
// Contract: specs/013-weekly-article-pipeline/contracts/pipeline-cli.md
import { statSync } from 'node:fs';
import { parseArgs } from 'node:util';
import { articles } from '../src/site/articles.ts';
import { todayIn } from '../src/site/weeks.ts';
import { readNotes } from './pipeline/notes.ts';
import { fridayReport, overview, renderOverview } from './pipeline/overview.ts';
import { markPublished, verify, type Mode } from './pipeline/publish.ts';

const USAGE = [
  'Usage: npm run pipeline',
  '       npm run pipeline -- verify|mark-published "<note>" --date yyyy-mm-dd --url <url> [--unplanned|--backfill]',
  '       npm run pipeline -- friday',
].join('\n');

function vaultDir(): string | undefined {
  const dir = process.env.ARTICLE_VAULT_DIR;
  if (!dir) return undefined;
  try {
    return statSync(dir).isDirectory() ? dir : undefined;
  } catch {
    return undefined;
  }
}

// 013:T017 verify and mark-published (013:FR-006, 013:FR-008, 013:FR-014)
function publishStep(command: string, args: string[], dir: string): number {
  const { values, positionals } = parseArgs({
    args,
    allowPositionals: true,
    options: {
      date: { type: 'string' },
      url: { type: 'string' },
      unplanned: { type: 'boolean', default: false },
      backfill: { type: 'boolean', default: false },
    },
  });
  const [key] = positionals;
  if (!key || !values.date || !values.url || (values.unplanned && values.backfill)) {
    console.error(USAGE);
    return 2;
  }
  const mode: Mode = values.backfill ? 'backfill' : values.unplanned ? 'unplanned' : 'planned';
  const step = command === 'verify' ? verify : markPublished;
  const result = step(readNotes(dir), key, { date: values.date, url: values.url, mode }, articles);
  if (!result.ok) {
    console.error(result.problems.join('\n'));
    return 1;
  }
  console.log(JSON.stringify(result.record, null, 2));
  return 0;
}

function main(argv: string[]): number {
  const dir = vaultDir();
  if (!dir) {
    console.error('ARTICLE_VAULT_DIR is not set or not readable');
    return 2;
  }
  const today = todayIn('Europe/Amsterdam');
  const [command, ...args] = argv;
  if (command === undefined) {
    console.log(renderOverview(overview(readNotes(dir), today)));
    return 0;
  }
  // 013:T014 The Friday check (013:FR-026)
  if (command === 'friday') {
    console.log(fridayReport(readNotes(dir), today));
    return 0;
  }
  if (command === 'verify' || command === 'mark-published') {
    try {
      return publishStep(command, args, dir);
    } catch (error) {
      console.error(`${(error as Error).message}\n${USAGE}`);
      return 2;
    }
  }
  console.error(USAGE);
  return 2;
}

process.exitCode = main(process.argv.slice(2));
