// 010:T004 The one measurement of embedded JavaScript: gzip size of executable inline scripts (010:FR-001, 010:FR-002)
// Separate script files are measured from the network by Lighthouse; together they make the total
// that the quality report publishes and gates against the 50 KB budget (constitution V).
import { gzipSync } from 'node:zlib';

const EXECUTABLE = new Set(['', 'module', 'text/javascript', 'application/javascript']);
const SCRIPT = /<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi;
const TYPE = /\btype\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i;
const SRC = /\bsrc\s*=/i;

export function scriptBytes(html: string): number {
  let total = 0;
  for (const [, attributes = '', code = ''] of html.matchAll(SCRIPT)) {
    if (SRC.test(attributes)) continue;
    const t = TYPE.exec(attributes);
    const type = (t?.[1] ?? t?.[2] ?? t?.[3] ?? '').trim().toLowerCase();
    if (!EXECUTABLE.has(type) || code.trim() === '') continue;
    total += gzipSync(code).length;
  }
  return total;
}
