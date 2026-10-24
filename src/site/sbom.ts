// 014:T018 Scorecard figures from the bill of materials that ships with this build (014:FR-011)
import { existsSync, readFileSync } from 'node:fs';

export const sbomFile = 'public/quality/sbom.cdx.json';
export const sbomUrl = '/quality/sbom.cdx.json';

export function sbomCounts(path = sbomFile): { shipped: number; pipeline: number } {
  if (!existsSync(path)) throw new Error(`${path} is missing. Run \`npm run sbom\` first.`);
  const { components } = JSON.parse(readFileSync(path, 'utf8')) as {
    components: { scope?: string }[];
  };
  return {
    shipped: components.filter((c) => c.scope === 'required').length,
    pipeline: components.filter((c) => c.scope === 'excluded').length,
  };
}
