// 010:T001 One measurement of embedded JavaScript (010:FR-001, 010:FR-002)
import { gzipSync } from 'node:zlib';
import { describe, expect, it } from 'vitest';
import { scriptBytes } from '../../src/site/script-size.ts';

const gz = (code: string) => gzipSync(code).length;
const a = 'const answer = 42; console.log(answer);';
const b = 'document.querySelector("form")?.addEventListener("change", () => {});';

describe('scriptBytes()', () => {
  it('gzips each executable embedded script and sums them', () => {
    const html = `<head><script type="module">${a}</script></head><body><script>${b}</script></body>`;
    expect(scriptBytes(html)).toBe(gz(a) + gz(b));
  });

  it('counts classic JavaScript types and attributes in any order', () => {
    const html = [
      `<script type="text/javascript">${a}</script>`,
      `<script data-x="1" type='application/javascript'>${a}</script>`,
      `<SCRIPT TYPE="MODULE">${a}</SCRIPT>`,
    ].join('');
    expect(scriptBytes(html)).toBe(3 * gz(a));
  });

  it('ignores data blocks such as JSON and structured data', () => {
    const html = [
      '<script type="application/json">{"a":1}</script>',
      '<script type="application/ld+json">{"@type":"Person"}</script>',
      '<script type="importmap">{"imports":{}}</script>',
    ].join('');
    expect(scriptBytes(html)).toBe(0);
  });

  it('leaves separate files to the network measurement', () => {
    expect(scriptBytes('<script type="module" src="/_astro/app.js"></script>')).toBe(0);
  });

  it('counts empty scripts and pages without scripts as 0', () => {
    expect(scriptBytes('<script></script><script type="module">   </script>')).toBe(0);
    expect(scriptBytes('<main><p>No script here.</p></main>')).toBe(0);
  });
});
