// 009:T001 Lighthouse shards: every page exactly once, balanced (009:FR-001, 009:FR-005, 009:SC-003)
import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);
const { shardBlocklist } = require('../../lighthouserc.cjs') as {
  shardBlocklist: (files: string[], shard: string | undefined) => string[];
};

const files = [
  '404.html',
  'index.html',
  'career/index.html',
  'method/index.html',
  'nl/index.html',
  'nl/loopbaan/index.html',
  'nl/methode/index.html',
  'playground/index.html',
];

const measured = (shard: string) => {
  const blocked = new Set(shardBlocklist(files, shard));
  return files.filter((f) => !blocked.has(`/${f}`));
};

describe('shardBlocklist()', () => {
  it('blocks nothing without a shard: local runs measure every page', () => {
    expect(shardBlocklist(files, undefined)).toEqual([]);
  });

  it('assigns every page to exactly one of three shards', () => {
    const all = ['1/3', '2/3', '3/3'].flatMap(measured);
    expect(all.sort()).toEqual([...files].sort());
    expect(new Set(all).size).toBe(files.length);
  });

  it('keeps shards within one page of each other', () => {
    const sizes = ['1/3', '2/3', '3/3'].map((s) => measured(s).length);
    expect(Math.max(...sizes) - Math.min(...sizes)).toBeLessThanOrEqual(1);
  });

  it('expresses blocks as site-relative paths', () => {
    for (const entry of shardBlocklist(files, '1/3')) expect(entry).toMatch(/^\/[\w/.-]+\.html$/);
  });

  it('rejects a malformed shard', () => {
    expect(() => shardBlocklist(files, '4/3')).toThrow();
    expect(() => shardBlocklist(files, 'two')).toThrow();
  });
});
