// 001:T004 Lint TypeScript and Astro with the recommended rule sets
import tseslint from 'typescript-eslint';
import astro from 'eslint-plugin-astro';

export default tseslint.config(
  {
    ignores: [
      'dist/',
      '.astro/',
      'node_modules/',
      'coverage/',
      'test-results/',
      'playwright-report/',
      '.lighthouseci/',
      '.specify/',
      '.claude/',
    ],
  },
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,
  {
    // CommonJS config files (Lighthouse CI) must use require().
    files: ['**/*.cjs'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: { require: 'readonly', module: 'writable', process: 'readonly' },
    },
    rules: { '@typescript-eslint/no-require-imports': 'off' },
  },
);
