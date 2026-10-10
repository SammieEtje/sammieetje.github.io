// 001:T005 End-to-end tests run against the built site, exactly what gets deployed
import { defineConfig, devices } from '@playwright/test';

const port = 4321;

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 1 : 0,
  // 009:T004 JSON results for the quality report, locally and in CI (009:FR-003)
  reporter: [
    ...(process.env['CI'] ? [['github'] as const] : []),
    ['list'],
    ['json', { outputFile: 'reports/e2e.json' }],
  ],
  use: {
    baseURL: `http://localhost:${port}`,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `npx astro preview --port ${port} --ignore-lock`,
    url: `http://localhost:${port}`,
    reuseExistingServer: !process.env['CI'],
  },
});
