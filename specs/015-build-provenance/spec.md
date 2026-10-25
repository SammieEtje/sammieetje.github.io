# Feature Specification: Signed Build Provenance

**Feature Branch**: `015-build-provenance`

**Created**: 2026-10-25

**Status**: Draft

**Input**: User description: "Signed build provenance. Every deploy from main is accompanied by a
signed attestation of where the build came from (SLSA build provenance: which repository, commit,
workflow and run produced it), for the exact site that goes live and for its bill of materials,
signed with Sigstore through the pipeline's own identity, without stored keys. Anyone can verify,
with standard public tooling and without access to the repository, that the live site and its SBOM
were built by this repository's pipeline from a specific commit and have not been altered since.
The pipeline verifies the attestation before it deploys; a build without a valid attestation is not
deployed. The site and README explain how a visitor can verify it themselves."

## Context

The site already proves a lot about each build: the quality gate, the quality report and, since
014, a bill of materials of every component. What it cannot prove yet is that the files a visitor
receives are the ones that gate produced. Anyone who could change the published files, or publish
from somewhere else, would leave no trace a visitor could check.

Signed build provenance closes that gap. A signed statement records which repository, commit,
workflow and run built a file. The signature uses the pipeline's own short-lived identity, so there
is no key to store or leak, and the signing event is written to a public transparency log. Anyone
can then check a live file against that statement with standard public tooling. This is the
"signed artefacts" control the site's own method describes, applied to the site itself.

## Clarifications

### Session 2026-10-25

- Q: Must a visitor be able to verify without any account? → A: Yes. The Sigstore bundles are
  published next to the manifest and the SBOM, so verification needs no account and works
  offline; the attestations are also stored on the hosting platform.
- Q: Is the SBOM also attested as describing the build? → A: Yes. A signed CycloneDX SBOM
  attestation has the manifest as its subject, next to the provenance of the manifest and the SBOM.
- Q: How does a visitor check a single page against the manifest? → A: With standard commands
  (download, SHA-256, compare with the manifest line); no verification script is shipped.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Every deploy carries signed provenance (Priority: P1)

Sander (the owner) gets a signed provenance statement for every build that is deployed from main.
It covers the bill of materials and a manifest that lists every published file with its checksum.
The statement names the repository, the commit, the workflow and the run.

**Why this priority**: without the signed statement there is nothing to verify; every other story
depends on it.

**Independent Test**: after a deploy from main, the provenance statements for the manifest and the
SBOM exist. They name this repository, the deployed commit and the pipeline workflow, and the
manifest lists every published file with a checksum that matches it.

**Acceptance Scenarios**:

1. **Given** a run on main that passes the gate, **When** it reaches the deploy, **Then** signed
   provenance exists for the published manifest and for the published SBOM of exactly that build.
2. **Given** the provenance of a deploy, **When** its contents are read, **Then** they name this
   repository, the commit that was built, the workflow file and the run.
3. **Given** a pull request run, **When** it finishes, **Then** no provenance is created, because
   nothing from that run is published.
4. **Given** the signing step, **When** it runs, **Then** it uses no stored key or secret.

---

### User Story 2 - Nothing is deployed without valid provenance (Priority: P1)

The pipeline verifies the provenance of the build before deploying it. A build whose provenance is
missing, invalid, signed by another identity, or whose files do not match the manifest, is not
deployed, and the live site stays on the last verified build.

**Why this priority**: a signature nobody checks is decoration. Verifying before deploying makes it
a control.

**Independent Test**: tamper with one published file after signing, or with the manifest; the
verification fails and the deploy does not run.

**Acceptance Scenarios**:

1. **Given** a signed build, **When** the pipeline verifies it before deploying, **Then** it checks
   the signer (this repository's pipeline workflow), the subject checksums and the provenance type.
2. **Given** a published file that differs from its manifest entry, **When** the pipeline verifies,
   **Then** the deploy does not run and the run names the file.
3. **Given** missing or invalid provenance, **When** the pipeline verifies, **Then** the deploy does
   not run.
4. **Given** a failed verification, **When** the run ends, **Then** the live site is unchanged.

---

### User Story 3 - A visitor can verify the live site themselves (Priority: P2)

An engineer or auditor visiting the site downloads the manifest and the SBOM and verifies, with
standard public tooling and without access to the repository, that both were built by this
repository's pipeline from a stated commit. With the manifest, they then check any page they
received against its listed checksum.

**Why this priority**: this is what makes the provenance useful to someone other than the owner;
it depends on Stories 1 and 2.

**Independent Test**: from a machine with only public tooling, follow the published instructions
against the live site; verification succeeds, and changing one byte of a downloaded file makes it
fail.

**Acceptance Scenarios**:

1. **Given** the live manifest and SBOM, **When** a visitor runs the documented verification,
   **Then** it succeeds and shows the repository, commit and workflow.
2. **Given** a page downloaded from the live site, **When** its checksum is compared with the
   verified manifest, **Then** they match.
3. **Given** a downloaded file changed by one byte, **When** it is verified, **Then** verification
   fails.
4. **Given** a visitor who is not signed in anywhere, **When** they follow the instructions,
   **Then** verification still works. The signature bundles are published next to
   the manifest and the SBOM, so verification needs no account and works offline.

---

### User Story 4 - The site and README explain how (Priority: P3)

The scorecard page and the README explain, in plain words and in both languages on the site, what
the provenance proves, where the manifest and its signature are, and the exact commands to verify
them.

**Why this priority**: a check nobody knows how to run is not used; it is a small addition to
existing pages.

**Independent Test**: the scorecard page (EN and NL) and the README contain the explanation, links
to the manifest, and verification commands that work when copied as they are.

**Acceptance Scenarios**:

1. **Given** the scorecard page in either language, **When** a visitor reads it, **Then** it
   explains what the provenance proves and links to the manifest.
2. **Given** the verification commands on the page and in the README, **When** they are copied and
   run against the live site, **Then** they succeed.
3. **Given** a visitor without JavaScript, **When** they open the scorecard page, **Then** the
   explanation, links and commands are all visible.

### Edge Cases

- A deploy that is re-run for the same commit: it produces new provenance for the same files, and
  both statements verify.
- The daily run on main deploys a commit that was already deployed: it signs again; the manifest
  and SBOM checksums may differ (generation time), and the newest statement matches what is live.
- The quality report is added to the site after the build: the manifest covers the files exactly as
  published, report included.
- The transparency log or signing service is unavailable: signing fails, the deploy does not run,
  and the live site stays on the last verified build.
- Files that a visitor's browser receives but are not in the build (none today): out of scope.
- An old deploy's provenance remains valid for the files of that deploy; it does not match the
  current live files.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Every run on main that passes the gate MUST produce a manifest listing every file it
  publishes with its SHA-256 checksum, and MUST publish the manifest with the site at a stable
  address next to the quality report.
- **FR-002**: Every such run MUST create signed SLSA build provenance for the manifest and for the
  SBOM, naming the repository, commit, workflow and run that built them. It MUST also create a
  signed SBOM attestation (CycloneDX) whose subject is the manifest, stating that the SBOM
  describes that build.
- **FR-003**: Signing MUST use the pipeline's own short-lived identity, MUST NOT use a stored key or
  secret, and MUST record the signature in a public transparency log.
- **FR-004**: Pull request runs MUST NOT create provenance.
- **FR-005**: Before deploying, the pipeline MUST verify the provenance of the manifest and the
  SBOM, and the SBOM attestation of the manifest: the signer MUST be this repository's pipeline
  workflow, the predicates MUST be SLSA build provenance and CycloneDX respectively, and the
  subjects MUST match the files to be published.
- **FR-006**: Before deploying, the pipeline MUST check that every file to be published matches its
  manifest entry and that the manifest lists no file that is not published.
- **FR-007**: When any check in FR-005 or FR-006 fails, the deploy MUST NOT run, and the failure
  MUST name the cause.
- **FR-008**: The job that signs MUST have only the permissions signing needs, and only on main;
  no other job gains new permissions.
- **FR-009**: A visitor MUST be able to verify the live manifest and SBOM with standard public
  tooling, without access to the repository, following the published instructions. The
  signature bundle of each signed file MUST be published next to it, so verification needs no
  account and works offline. To check a single page, the instructions MUST use standard commands only (download, SHA-256,
  compare with the manifest); the site MUST NOT ship its own verification script.
- **FR-010**: The scorecard page MUST explain, in English and Dutch, what the provenance proves,
  link to the manifest, and show the verification commands; all of it MUST work without
  JavaScript.
- **FR-011**: The README MUST describe the provenance: what is signed, how, where it is published
  and how to verify it.

### Key Entities

- **Manifest**: per deploy; the commit, and every published file with its path and SHA-256.
- **Provenance statement**: per signed file (manifest, SBOM), plus one SBOM attestation per deploy
  with the manifest as subject and the SBOM as content. Each names the subject checksum and the
  repository, commit, workflow and run, and is signed with a transparency log entry.
- **Signature bundle**: per statement (three per deploy); the statement with its signature, certificate
  and transparency log proof, in the standard Sigstore bundle format, published next to the file.
- **Verification result**: per deploy; passes when signer, predicate, subjects and every file
  check out, fails with a named cause otherwise.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of deploys from main have verified provenance for the manifest and the SBOM;
  0 deploys happen without it.
- **SC-002**: A change of one byte to any published file, after signing, is detected before deploy
  in 100% of cases.
- **SC-003**: A visitor following the published instructions verifies the live site in under five
  minutes, without access to the repository.
- **SC-004**: The feature adds 0 stored secrets or keys, 0 runtime dependencies and 0 client-side
  JavaScript.

## Assumptions

- The repository is public, so its pipeline's signing identity and the transparency log entries
  are publicly visible.
- "Standard public tooling" means the hosting platform's command-line tool or the Sigstore
  project's own verifier; which one the instructions use is a plan decision.
- The manifest's stable address is a sibling of the quality report, for example
  `/quality/manifest.json`; the exact path is a plan decision.
- Signing the commits themselves, retaining evidence beyond the platform's defaults, and verifying
  the provenance of third-party dependencies are separate features.
- Pages are served by the hosting platform as published; what happens between the platform and
  the visitor (for example a proxy) is covered by HTTPS, not by this feature.
