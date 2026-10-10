// 001:T019 Budgets from constitution principle V, measured on every built page
// 009:T004 Optional sharding (LHCI_SHARD="i/n"): each CI shard measures its share of the pages
const fs = require('node:fs');
const { chromium } = require('@playwright/test');
// Reuse Lighthouse CI's own page discovery, so shard lists match what it would measure.
const FallbackServer = require('@lhci/cli/src/collect/fallback-server.js');

const DIST = './dist';
const DEPTH = 3;

const budgets = {
  performance: 0.9,
  accessibility: 0.95,
  'best-practices': 0.95,
  seo: 0.95,
  scriptBytes: 51200,
};

/** Pages (as site-relative paths) a shard must skip; empty without a shard. */
function shardBlocklist(files, shard) {
  if (shard === undefined || shard === '') return [];
  const match = /^(\d+)\/(\d+)$/.exec(shard);
  const index = match ? Number(match[1]) : NaN;
  const total = match ? Number(match[2]) : NaN;
  if (!(index >= 1 && index <= total)) throw new Error(`Invalid LHCI_SHARD "${shard}"`);
  return [...files]
    .sort()
    .filter((_, k) => k % total !== index - 1)
    .map((file) => `/${file}`);
}

function builtPages() {
  if (!fs.existsSync(DIST)) return [];
  return FallbackServer.readHtmlFilesInDirectory(DIST, DEPTH).map(({ file }) => file);
}

module.exports = {
  budgets,
  shardBlocklist,
  ci: {
    collect: {
      staticDistDir: DIST,
      maxAutodiscoverUrls: 0,
      staticDirFileDiscoveryDepth: DEPTH,
      autodiscoverUrlBlocklist: shardBlocklist(builtPages(), process.env.LHCI_SHARD),
      numberOfRuns: 3,
      // Same browser locally and in CI: the one Playwright installs.
      chromePath: process.env.CHROME_PATH || chromium.executablePath(),
      settings: { chromeFlags: '--headless=new --no-sandbox' },
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: budgets.performance }],
        'categories:accessibility': ['error', { minScore: budgets.accessibility }],
        'categories:best-practices': ['error', { minScore: budgets['best-practices'] }],
        'categories:seo': ['error', { minScore: budgets.seo }],
        // 010:T004 JavaScript size is gated by scripts/quality-report.ts, which also counts
        // embedded script; one definition only (010:FR-003, 010:FR-006).
      },
    },
    upload: {
      target: 'filesystem',
      outputDir: '.lighthouseci/reports',
    },
  },
};
