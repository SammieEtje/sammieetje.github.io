// 016:T014 What a visitor runs to check a record: curl and gh, the 015 signer rules (016:FR-009)
import { describe, expect, it } from 'vitest';
import { evidenceCommands, releasesUrl } from '../../src/site/evidence.ts';
import { verifyArgs } from '../../src/site/provenance.ts';

describe('evidenceCommands', () => {
  const commands = evidenceCommands();

  it('downloads the record and its signature from the release', () => {
    for (const file of ['evidence.json', 'evidence.sigstore.json']) {
      expect(commands).toContain(
        `curl -sfLO https://github.com/SammieEtje/sammieetje.github.io/releases/download/<tag>/${file}`,
      );
    }
  });

  it('verifies the record offline with the pipeline’s signer rules, and the release with a login', () => {
    const args = verifyArgs({
      file: 'evidence.json',
      bundle: 'evidence.sigstore.json',
      predicateType: 'https://slsa.dev/provenance/v1',
    });
    expect(commands).toContain(`gh ${args.join(' ')} && echo verified`);
    expect(commands).toContain('gh release verify <tag> --repo SammieEtje/sammieetje.github.io');
  });

  it('links to the evidence releases', () => {
    expect(releasesUrl).toBe(
      'https://github.com/SammieEtje/sammieetje.github.io/releases?q=evidence&expanded=true',
    );
  });
});
