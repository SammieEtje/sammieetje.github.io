// 009:T006 Specs shipped: folders whose tasks are all done (009:FR-011)
import { describe, expect, it } from 'vitest';
import { readSpecs, shippedSpecs } from '../../src/site/specs.ts';

describe('shippedSpecs()', () => {
  it('counts a spec as shipped only when every task is checked', () => {
    expect(
      shippedSpecs([
        { dir: '001-done', tasks: '- [x] T001 a\n- [X] T002 b' },
        { dir: '002-open', tasks: '- [x] T001 a\n- [ ] T002 b' },
        { dir: '003-no-tasks', tasks: null },
        { dir: 'notes', tasks: '- [x] T001 a' },
      ]),
    ).toEqual(['001-done']);
  });

  it('finds this repository’s specs', () => {
    const dirs = readSpecs().map((s) => s.dir);
    expect(dirs).toContain('001-platform-foundation');
    expect(dirs).toContain('009-scorecard');
    expect(shippedSpecs(readSpecs())).toContain('008-playground');
  });
});
