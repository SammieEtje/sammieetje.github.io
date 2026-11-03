// 017:T006 Serve the built site under the live host and answer the analytics host locally (research R6)
// Nothing reaches GoatCounter or any other host: the statistics stay clean and the tests offline.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';
import type { BrowserContext } from '@playwright/test';
import { endpoint, productionHost } from '../../src/site/analytics.ts';
import { pageFile } from '../../scripts/quality-report.ts';

export const live = `https://${productionHost}`;
export const analyticsOrigin = new URL(endpoint).origin;

const types: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
  '.json': 'application/json',
  '.xml': 'application/xml',
  '.txt': 'text/plain',
};

/** Every built HTML file under a directory. */
export function htmlFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return htmlFiles(path);
    return entry.name.endsWith('.html') ? [path] : [];
  });
}

/** The file GitHub Pages would serve for a path, or the 404 page. */
function resolve(pathname: string): { file: string; status: number } {
  const direct = pageFile(decodeURIComponent(pathname), 'dist');
  if (existsSync(direct) && statSync(direct).isFile()) return { file: direct, status: 200 };
  const dir = pageFile(`${pathname}/`, 'dist');
  if (existsSync(dir)) return { file: dir, status: 200 };
  return { file: 'dist/404.html', status: 404 };
}

export interface Traffic {
  /** Requests to the analytics host, as their query parameters. */
  counts: Record<string, string>[];
  /** Every request to a host other than the live site and the analytics host. */
  foreign: string[];
}

/** Route the context: live site from dist/, analytics host recorded and answered, the rest aborted. */
export async function serveLive(
  context: BrowserContext,
  options: { analytics?: 'answer' | 'abort'; allow?: (url: URL) => boolean } = {},
): Promise<Traffic> {
  const traffic: Traffic = { counts: [], foreign: [] };
  await context.route('**/*', async (route) => {
    const url = new URL(route.request().url());
    if (['data:', 'blob:'].includes(url.protocol)) return route.fallback();
    if (url.origin === live) {
      const { file, status } = resolve(url.pathname);
      return route.fulfill({
        status,
        body: readFileSync(file),
        contentType: types[extname(file)] ?? 'application/octet-stream',
      });
    }
    if (url.origin === analyticsOrigin) {
      traffic.counts.push(Object.fromEntries(url.searchParams));
      return options.analytics === 'abort' ? route.abort() : route.fulfill({ status: 204 });
    }
    traffic.foreign.push(url.href);
    if (options.allow?.(url)) {
      return route.fulfill({ status: 200, contentType: 'text/html', body: '<title>ok</title>' });
    }
    return route.abort();
  });
  return traffic;
}

/** Wait until the page has gone quiet, so every count it would send has been sent. */
export async function settle(page: { waitForLoadState: (s: 'networkidle') => Promise<void> }) {
  await page.waitForLoadState('networkidle');
}
