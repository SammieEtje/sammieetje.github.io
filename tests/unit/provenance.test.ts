// 015:T003 One definition of what is signed and how it is verified (015:FR-002, 015:FR-005)
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { verifyPlan } from '../../scripts/provenance.ts';
import { statements, verifyArgs, visitorCommands } from '../../src/site/provenance.ts';

describe('statements', () => {
  it('are the three signed statements of every deploy', () => {
    expect(statements).toEqual([
      {
        id: 'manifest',
        subject: 'quality/manifest.sha256',
        predicateType: 'https://slsa.dev/provenance/v1',
        bundle: 'quality/manifest.sha256.sigstore.json',
      },
      {
        id: 'sbom',
        subject: 'quality/sbom.cdx.json',
        predicateType: 'https://slsa.dev/provenance/v1',
        bundle: 'quality/sbom.cdx.json.sigstore.json',
      },
      {
        id: 'sbom-attestation',
        subject: 'quality/manifest.sha256',
        predicateType: 'https://cyclonedx.org/bom',
        bundle: 'quality/manifest.sha256.sbom.sigstore.json',
      },
    ]);
  });
});

describe('verifyArgs', () => {
  it('pins the signer to this repository’s pipeline on main, on GitHub-hosted runners', () => {
    expect(
      verifyArgs({
        file: 'manifest.sha256',
        bundle: 'manifest.sha256.sigstore.json',
        predicateType: 'https://slsa.dev/provenance/v1',
      }),
    ).toEqual([
      'attestation',
      'verify',
      'manifest.sha256',
      '--bundle',
      'manifest.sha256.sigstore.json',
      '--repo',
      'SammieEtje/sammieetje.github.io',
      '--signer-workflow',
      'SammieEtje/sammieetje.github.io/.github/workflows/pipeline.yml',
      '--source-ref',
      'refs/heads/main',
      '--deny-self-hosted-runners',
      '--predicate-type',
      'https://slsa.dev/provenance/v1',
    ]);
  });
});

// 015:T009 The pipeline verifies all three statements from their bundles before it packages (015:FR-005, 015:FR-007)
describe('verifyPlan', () => {
  it('verifies each statement against its file and bundle in the site, in order', () => {
    expect(verifyPlan('dist')).toEqual(
      statements.map((s) => ({
        statement: s.id,
        args: verifyArgs({
          file: `dist/${s.subject}`,
          bundle: `dist/${s.bundle}`,
          predicateType: s.predicateType,
        }),
      })),
    );
  });

  it('takes its arguments from the definition visitors also get', () => {
    expect(readFileSync('scripts/provenance.ts', 'utf8')).toMatch(
      /import \{[^}]*\bverifyArgs\b[^}]*\} from '\.\.\/src\/site\/provenance\.ts'/,
    );
  });
});

// 015:T013 What a visitor runs: standard tools, the published files, the pipeline's own arguments (015:FR-009)
describe('visitorCommands', () => {
  const commands = visitorCommands();
  const lines = commands.split('\n');
  const base = 'https://sammieetje.github.io/quality/';

  it('downloads exactly the published manifest, SBOM and bundles', () => {
    const urls = lines.filter((l) => l.startsWith('curl -sO ')).map((l) => l.slice(9));
    expect(urls.sort()).toEqual(
      [...new Set(statements.flatMap((s) => [s.subject, s.bundle]))]
        .map((p) => `https://sammieetje.github.io/${p}`)
        .sort(),
    );
    for (const url of urls) expect(url.startsWith(base)).toBe(true);
  });

  it('verifies every statement with the pipeline’s arguments, on the downloaded files', () => {
    for (const s of statements) {
      const args = verifyArgs({
        file: s.subject.split('/').pop()!,
        bundle: s.bundle.split('/').pop()!,
        predicateType: s.predicateType,
      });
      expect(commands).toContain(`gh ${args.join(' ')} && echo verified`);
    }
  });

  it('checks a single page against the manifest', () => {
    expect(commands).toContain('curl -s https://sammieetje.github.io/career/ | shasum -a 256');
    expect(commands).toContain("grep ' career/index.html$' manifest.sha256");
  });

  it('uses only curl, gh, shasum and grep', () => {
    const tools = lines
      .filter((l) => l.trim() && !l.startsWith('#'))
      .flatMap((l) => l.split('|').map((part) => part.trim().split(' ')[0]));
    expect(new Set(tools)).toEqual(new Set(['curl', 'gh', 'shasum', 'grep']));
  });
});
