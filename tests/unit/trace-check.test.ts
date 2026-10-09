// 001:T010 Traceability check (001:FR-018)
import { describe, expect, it } from 'vitest';
import { checkTraces } from '../../scripts/trace-check.ts';

// Fixture IDs are assembled at runtime so the real trace scan of this file does not see them.
const F = ['0', '42'].join('');
const ref = (id: string) => `${F}:${id}`;

const specs = {
  [`${F}-fixture`]: {
    spec: '- **FR-001**: something\n- **SC-002**: measurable',
    tasks: '- [ ] T001 do a thing\n- [x] T002 done thing',
  },
};

describe('checkTraces()', () => {
  it('accepts references to existing requirements, criteria and tasks', () => {
    const files = [
      { path: 'a.astro', content: `<p data-spec="${ref('FR-001')}">` },
      { path: 'b.ts', content: `// ${ref('T002')} and ${ref('SC-002')}` },
    ];
    const result = checkTraces(files, specs);
    expect(result.errors).toEqual([]);
    expect(result.references).toBe(3);
  });

  it('rejects an unknown requirement or task', () => {
    const files = [{ path: 'a.ts', content: `// ${ref('FR-009')} ${ref('T099')}` }];
    const { errors } = checkTraces(files, specs);
    expect(errors).toHaveLength(2);
    expect(errors[0]).toContain('a.ts');
    expect(errors[0]).toContain('FR-009');
  });

  it('rejects a reference to a feature folder that does not exist', () => {
    const files = [{ path: 'a.ts', content: '// 9' + '87:FR-001' }];
    const { errors } = checkTraces(files, specs);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain('987');
  });

  it('does not mistake clock times or dates for references', () => {
    const files = [{ path: 'a.ts', content: 'at 2026-10-09T20:30:47 and 100:200' }];
    expect(checkTraces(files, specs)).toEqual({ errors: [], references: 0 });
  });
});
