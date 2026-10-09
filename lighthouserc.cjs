// 001:T019 Budgets from constitution principle V, measured on every built page
const { chromium } = require('@playwright/test');

const budgets = {
  performance: 0.9,
  accessibility: 0.95,
  'best-practices': 0.95,
  seo: 0.95,
  scriptBytes: 51200,
};

module.exports = {
  budgets,
  ci: {
    collect: {
      staticDistDir: './dist',
      maxAutodiscoverUrls: 0,
      staticDirFileDiscoveryDepth: 3,
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
        'resource-summary:script:size': ['error', { maxNumericValue: budgets.scriptBytes }],
      },
    },
    upload: {
      target: 'filesystem',
      outputDir: '.lighthouseci/reports',
    },
  },
};
