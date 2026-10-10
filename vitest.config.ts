// 001:T005 Unit tests live in tests/unit
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/unit/**/*.test.ts'],
    // 009:T004 Machine-readable results for the quality report (009:FR-003)
    reporters: ['default', 'json'],
    outputFile: { json: 'reports/unit.json' },
  },
});
