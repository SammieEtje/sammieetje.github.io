// 014:T009 The SBOM is valid CycloneDX 1.5 by the standard's own schema (014:FR-006)
import { describe, expect, it } from 'vitest';
import { validate } from '../../scripts/sbom.ts';

const valid = () => ({
  bomFormat: 'CycloneDX',
  specVersion: '1.5',
  version: 1,
  metadata: {
    component: {
      type: 'library',
      name: 'site',
      externalReferences: [{ type: 'vcs', url: 'https://example.org/repo' }],
      author: 'someone',
    },
  },
  components: [
    {
      'bom-ref': 'a@1.0.0',
      type: 'library',
      name: 'a',
      version: '1.0.0',
      purl: 'pkg:npm/a@1.0.0',
      licenses: [{ license: { id: 'MIT' } }],
    },
  ],
});

describe('validate', () => {
  it('accepts a valid CycloneDX 1.5 document', () => {
    expect(validate(valid())).toEqual([]);
  });

  it('rejects a document without bomFormat', () => {
    const bom: Partial<ReturnType<typeof valid>> = valid();
    delete bom.bomFormat;
    expect(validate(bom)).not.toEqual([]);
  });

  it('rejects a component without a name', () => {
    const bom = valid() as { components: Record<string, unknown>[] };
    delete bom.components[0]!['name'];
    expect(validate(bom).join('\n')).toMatch(/name/);
  });

  it('accepts the formats the CycloneDX schema uses that Ajv does not know', () => {
    const bom = valid() as ReturnType<typeof valid> & { metadata: { authors?: unknown } };
    bom.metadata.authors = [{ name: 'x', email: 'ö@example.org' }];
    expect(() => validate(bom)).not.toThrow();
    expect(validate(bom)).toEqual([]);
  });
});
