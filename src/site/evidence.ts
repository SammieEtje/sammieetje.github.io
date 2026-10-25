// 016:T015 Where the evidence records are and how a visitor checks one (016:FR-009)
import { repo, verifyArgs } from './provenance.ts';

export const tagPrefix = 'evidence/';
export const retentionYears = 2;
export const releasesUrl = `https://github.com/${repo}/releases?q=evidence&expanded=true`;

/** Shell commands to check one record: curl and gh, the record's own signature needs no account. */
export function evidenceCommands(): string {
  const download = (file: string) =>
    `curl -sfLO https://github.com/${repo}/releases/download/<tag>/${file}`;
  const args = verifyArgs({
    file: 'evidence.json',
    bundle: 'evidence.sigstore.json',
    predicateType: 'https://slsa.dev/provenance/v1',
  });
  return [
    '# Pick a record on the releases page and put its tag in place of <tag>',
    download('evidence.json'),
    download('evidence.sigstore.json'),
    '# Verify that this repository’s pipeline signed the record on main (no account needed)',
    `gh ${args.join(' ')} && echo verified`,
    '# With a GitHub login, also verify GitHub’s own attestation of the whole release',
    `gh release verify <tag> --repo ${repo}`,
  ].join('\n');
}
