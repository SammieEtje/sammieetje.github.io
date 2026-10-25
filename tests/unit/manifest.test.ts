// 015:T002 The manifest lists every published file with its SHA-256, as sha256sum writes it (015:FR-001)
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { checkTree, listFiles, renderManifest } from '../../scripts/manifest.ts';

function site(): string {
  const dir = mkdtempSync(join(tmpdir(), 'site-'));
  mkdirSync(join(dir, 'career'), { recursive: true });
  mkdirSync(join(dir, 'quality'), { recursive: true });
  writeFileSync(join(dir, 'index.html'), '<h1>home</h1>\n');
  writeFileSync(join(dir, 'career', 'index.html'), '<h1>career</h1>\n');
  writeFileSync(join(dir, 'quality', 'sbom.cdx.json'), '{}\n');
  writeFileSync(join(dir, 'quality', 'manifest.sha256'), 'old\n');
  writeFileSync(join(dir, 'quality', 'manifest.sha256.sigstore.json'), '{}\n');
  writeFileSync(join(dir, 'quality', 'sbom.cdx.json.sigstore.json'), '{}\n');
  return dir;
}

describe('listFiles', () => {
  it('lists every file by its site path, sorted, without the manifest and the bundles', () => {
    expect(listFiles(site()).map((f) => f.path)).toEqual([
      'career/index.html',
      'index.html',
      'quality/sbom.cdx.json',
    ]);
  });

  it('gives each file its SHA-256 as lowercase hex', () => {
    for (const file of listFiles(site())) expect(file.sha256).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe('renderManifest', () => {
  it('writes one sha256sum line per file with a trailing newline', () => {
    const text = renderManifest([
      { path: 'a.html', sha256: 'a'.repeat(64) },
      { path: 'b/c.css', sha256: 'b'.repeat(64) },
    ]);
    expect(text).toBe(`${'a'.repeat(64)}  a.html\n${'b'.repeat(64)}  b/c.css\n`);
  });

  it('matches what shasum -a 256 prints for the same file', () => {
    const dir = site();
    const line = renderManifest(listFiles(dir)).split('\n')[1];
    const shasum = execFileSync('shasum', ['-a', '256', 'index.html'], {
      cwd: dir,
      encoding: 'utf8',
    }).trim();
    expect(line).toBe(shasum);
  });
});

// 015:T008 Every file is re-checked against the manifest before it ships; every gap is named (015:FR-006, 015:FR-007)
describe('checkTree', () => {
  const written = () => {
    const dir = site();
    return { dir, manifest: renderManifest(listFiles(dir)) };
  };

  it('passes an untouched tree, without reporting the manifest or bundles as unlisted', () => {
    const { dir, manifest } = written();
    expect(checkTree(dir, manifest)).toEqual({ problems: [], passed: true });
  });

  it('names a file whose content changed', () => {
    const { dir, manifest } = written();
    writeFileSync(join(dir, 'index.html'), '<h1>home</h1>\n ');
    expect(checkTree(dir, manifest).problems).toEqual(['index.html: changed']);
  });

  it('names a listed file that is gone', () => {
    const { dir, manifest } = written();
    rmSync(join(dir, 'career', 'index.html'));
    expect(checkTree(dir, manifest).problems).toEqual(['career/index.html: missing']);
  });

  it('names a file on disk that the manifest does not list', () => {
    const { dir, manifest } = written();
    writeFileSync(join(dir, 'extra.js'), 'alert(1)\n');
    expect(checkTree(dir, manifest).problems).toEqual(['extra.js: not listed']);
  });

  it('names a malformed line', () => {
    const { dir, manifest } = written();
    expect(checkTree(dir, `${manifest}not a line\n`).problems).toEqual([
      'manifest: invalid line 4',
    ]);
    expect(checkTree(dir, `${manifest}not a line\n`).passed).toBe(false);
  });
});
