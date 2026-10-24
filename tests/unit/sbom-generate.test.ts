// 014:T003 Shipped or not: scope follows the installed lock file, not npm's own marker (014:FR-002)
import { describe, expect, it } from 'vitest';
import { installedPackages, markScope, type Bom, type Installed } from '../../scripts/sbom.ts';

const dev = { name: 'cdx:npm:package:development', value: 'true' };

const npm = (name: string, version: string, extra: object = {}) => ({
  'bom-ref': `${name}@${version}`,
  type: 'library',
  name,
  version,
  scope: 'required' as const,
  purl: `pkg:npm/${name.replace('@', '%40')}@${version}`,
  ...extra,
});

const bom = (components: Bom['components']): Bom => ({
  bomFormat: 'CycloneDX',
  specVersion: '1.5',
  version: 1,
  metadata: {},
  components,
});

const installed: Installed = {
  packages: {
    '': { version: '0.1.0' },
    'node_modules/astro': { version: '7.3.8' },
    'node_modules/vitest': { version: '5.0.3', dev: true },
    'node_modules/tslib': { version: '2.8.1', devOptional: true },
    'node_modules/vite/node_modules/picomatch': { version: '4.0.7' },
    'node_modules/picomatch': { version: '4.0.7' },
    'node_modules/aliased': { name: 'real-name', version: '1.0.0', dev: true },
    'node_modules/linked': { version: '1.0.0', link: true },
  },
};

describe('installedPackages', () => {
  it('lists each name@version once, named from the last path segment unless name is set', () => {
    const packages = installedPackages(installed);
    expect([...packages.keys()].sort()).toEqual([
      'astro@7.3.8',
      'picomatch@4.0.7',
      'real-name@1.0.0',
      'tslib@2.8.1',
      'vitest@5.0.3',
    ]);
  });

  it('counts dev entries as not shipped and devOptional entries as shipped', () => {
    const packages = installedPackages(installed);
    expect(packages.get('vitest@5.0.3')?.shipped).toBe(false);
    expect(packages.get('tslib@2.8.1')?.shipped).toBe(true);
    expect(packages.get('astro@7.3.8')?.shipped).toBe(true);
  });

  it('counts a name@version as shipped when any of its installed copies is shipped', () => {
    const packages = installedPackages({
      packages: {
        'node_modules/a/node_modules/x': { version: '1.0.0', dev: true },
        'node_modules/x': { version: '1.0.0' },
      },
    });
    expect(packages.get('x@1.0.0')?.shipped).toBe(true);
  });
});

describe('markScope', () => {
  const marked = markScope(
    bom([
      npm('astro', '7.3.8'),
      npm('vitest', '5.0.3', { properties: [dev] }),
      npm('tslib', '2.8.1', { properties: [dev, { name: 'other', value: 'x' }] }),
    ]),
    installed,
  );
  const byName = (name: string) => marked.components.find((c) => c.name === name)!;

  it('marks development-only packages excluded and keeps npm’s development property', () => {
    expect(byName('vitest').scope).toBe('excluded');
    expect(byName('vitest').properties).toContainEqual(dev);
  });

  it('marks shipped packages required and drops a wrong development property', () => {
    expect(byName('astro').scope).toBe('required');
    expect(byName('tslib').scope).toBe('required');
    expect(byName('tslib').properties).toEqual([{ name: 'other', value: 'x' }]);
  });

  it('adds the development property when npm left it out', () => {
    const fixed = markScope(bom([npm('vitest', '5.0.3')]), installed);
    expect(fixed.components[0]?.properties).toContainEqual(dev);
  });

  it('leaves components that are not npm packages alone', () => {
    const action = { 'bom-ref': 'a', type: 'application', name: 'x', scope: 'excluded' as const };
    expect(markScope(bom([action]), installed).components[0]).toEqual(action);
  });
});
