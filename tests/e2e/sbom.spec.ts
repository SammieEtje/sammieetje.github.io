// 014:T006 The built site ships its bill of materials next to the quality report (014:FR-009)
import { expect, test } from '@playwright/test';

interface Bom {
  bomFormat: string;
  specVersion: string;
  metadata: { properties?: { name: string; value: string }[] };
  components: { scope?: string }[];
}

test('/quality/sbom.cdx.json is a CycloneDX bill of materials of the build', async ({
  request,
}) => {
  const response = await request.get('/quality/sbom.cdx.json');
  expect(response.ok()).toBe(true);
  const bom = (await response.json()) as Bom;
  expect(bom.bomFormat).toBe('CycloneDX');
  expect(bom.specVersion).toBe('1.5');
  const commit = bom.metadata.properties?.find((p) => p.name === 'sammieetje:build:commit');
  expect(commit?.value).toMatch(/^([0-9a-f]{40}|local)$/);
  expect(bom.components.some((c) => c.scope === 'required')).toBe(true);
  expect(bom.components.some((c) => c.scope === 'excluded')).toBe(true);
});
