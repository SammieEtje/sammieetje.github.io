// 017:T003 The one analytics host and the rule for when the site counts (017:FR-004 – 017:FR-006)
// Kept free of other site modules: the page script bundles this file as it is.

/** GoatCounter's documented count endpoint; the only host besides the site itself (research R8). */
export const endpoint = 'https://sammieetje.goatcounter.com/count';

/** The live site's host. Tests, Lighthouse, dev and preview all run elsewhere (research R4). */
export const productionHost = 'sammieetje.github.io';

export interface Environment {
  hostname: string;
  gpc: boolean | undefined;
  dnt: string | null | undefined;
}

export function shouldCount({ hostname, gpc, dnt }: Environment): boolean {
  return hostname === productionHost && gpc !== true && dnt !== '1';
}

// 017:T007 What is sent: never a query string or fragment, never more than this (017:FR-007, research R5)
const cacheBuster = () => Math.random().toString(36).slice(2, 10);

function count(params: Record<string, string>): string {
  return `${endpoint}?${new URLSearchParams({ ...params, rnd: cacheBuster() })}`;
}

function parseUrl(url: string): URL | undefined {
  try {
    return new URL(url);
  } catch {
    return undefined;
  }
}

export interface PageView {
  pathname: string;
  referrer: string;
  title: string;
  width: number;
  ownOrigin: string;
}

export function pageViewUrl({ pathname, referrer, title, width, ownOrigin }: PageView): string {
  const from = parseUrl(referrer);
  return count({
    p: pathname.split(/[?#]/)[0] ?? '/',
    r: from && from.origin !== ownOrigin ? `${from.origin}${from.pathname}` : '',
    t: title,
    s: String(width),
  });
}

export function articleClickUrl({ id, title }: { id: string; title: string }): string {
  return count({ p: id, t: title, e: 'true' });
}
