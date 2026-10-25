// 015:T006 What every deploy signs and how anyone verifies it, for the pipeline and for visitors (015:FR-002, 015:FR-005, 015:FR-009)
export const repo = 'SammieEtje/sammieetje.github.io';
export const signerWorkflow = `${repo}/.github/workflows/pipeline.yml`;
export const siteUrl = 'https://sammieetje.github.io';

const slsa = 'https://slsa.dev/provenance/v1';
const cyclonedx = 'https://cyclonedx.org/bom';

export interface Statement {
  id: 'manifest' | 'sbom' | 'sbom-attestation';
  /** The signed file, as a path in the site. */
  subject: string;
  predicateType: string;
  /** Where its Sigstore bundle is published, as a path in the site. */
  bundle: string;
}

export const statements: readonly Statement[] = [
  {
    id: 'manifest',
    subject: 'quality/manifest.sha256',
    predicateType: slsa,
    bundle: 'quality/manifest.sha256.sigstore.json',
  },
  {
    id: 'sbom',
    subject: 'quality/sbom.cdx.json',
    predicateType: slsa,
    bundle: 'quality/sbom.cdx.json.sigstore.json',
  },
  {
    id: 'sbom-attestation',
    subject: 'quality/manifest.sha256',
    predicateType: cyclonedx,
    bundle: 'quality/manifest.sha256.sbom.sigstore.json',
  },
];

const fileName = (path: string) => path.slice(path.lastIndexOf('/') + 1);

// 015:T013 The visitor's commands, generated from the arguments the pipeline runs (015:FR-009)
/** Shell commands a visitor runs to verify the live site: no account, standard tools only. */
export function visitorCommands(): string {
  const downloads = [...new Set(statements.flatMap((s) => [s.subject, s.bundle]))].map(
    (path) => `curl -sO ${siteUrl}/${path}`,
  );
  const verifications = statements.map(
    (s) =>
      `gh ${verifyArgs({ file: fileName(s.subject), bundle: fileName(s.bundle), predicateType: s.predicateType }).join(' ')} && echo verified`,
  );
  return [
    '# Download the manifest, the bill of materials and their signatures',
    ...downloads,
    '# Verify that this repository’s pipeline signed them on main (no account needed)',
    ...verifications,
    '# Check a page you received against the manifest: both lines show the same checksum',
    `curl -s ${siteUrl}/career/ | shasum -a 256`,
    "grep ' career/index.html$' manifest.sha256",
  ].join('\n');
}

/** `gh` arguments that verify one statement offline from its bundle, pinned to this pipeline on main. */
export function verifyArgs(input: {
  file: string;
  bundle: string;
  predicateType: string;
}): string[] {
  return [
    'attestation',
    'verify',
    input.file,
    '--bundle',
    input.bundle,
    '--repo',
    repo,
    '--signer-workflow',
    signerWorkflow,
    '--source-ref',
    'refs/heads/main',
    '--deny-self-hosted-runners',
    '--predicate-type',
    input.predicateType,
  ];
}
