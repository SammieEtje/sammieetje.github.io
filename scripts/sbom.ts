// 014:T007 Bill of materials: npm's CycloneDX output, scoped by the installed lock file, plus the
// pinned pipeline actions and the build's commit (014:FR-001 – 014:FR-005)
// 014:T008 CLI: generate, enrich and write public/quality/sbom.cdx.json (014:FR-001, 014:FR-007)
import { execFileSync } from 'node:child_process';
import { appendFileSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { Ajv, type ValidateFunction } from 'ajv';
import addFormatsModule from 'ajv-formats';
import { LOCAL_PATH } from './local-path.ts';
import { currentCommit } from './quality-report.ts';

// ajv-formats is CommonJS: its default export arrives as the module object under Node's ESM loader.
const addFormats = ((addFormatsModule as unknown as { default?: typeof addFormatsModule })
  .default ?? addFormatsModule) as unknown as (ajv: Ajv) => Ajv;

export interface Property {
  name: string;
  value: string;
}

export interface ExternalReference {
  type: string;
  url: string;
}

export interface Component {
  'bom-ref': string;
  type: string;
  name: string;
  group?: string;
  version?: string;
  scope?: 'required' | 'optional' | 'excluded';
  purl?: string;
  properties?: Property[];
  externalReferences?: ExternalReference[];
  licenses?: unknown[];
  [field: string]: unknown;
}

export interface Bom {
  bomFormat: string;
  specVersion: string;
  version: number;
  metadata: {
    timestamp?: string;
    component?: Component;
    properties?: Property[];
    [field: string]: unknown;
  };
  components: Component[];
  [field: string]: unknown;
}

export interface InstalledEntry {
  name?: string;
  version: string;
  dev?: boolean;
  devOptional?: boolean;
  link?: boolean;
  [field: string]: unknown;
}

/** npm's hidden lockfile, `node_modules/.package-lock.json`: the tree as installed. */
export interface Installed {
  packages: Record<string, InstalledEntry>;
}

export interface Action {
  owner: string;
  repo: string;
  path: string | null;
  sha: string;
  tag: string;
}

export const sbomPath = 'public/quality/sbom.cdx.json';
export const repoUrl = 'https://github.com/SammieEtje/sammieetje.github.io';
const development: Property = { name: 'cdx:npm:package:development', value: 'true' };
const commitProperty = 'sammieetje:build:commit';

export const key = (name: string, version: string | undefined) => `${name}@${version}`;
const isNpm = (component: Component) => component.purl?.startsWith('pkg:npm/') ?? false;

/** Installed packages by name@version; shipped when a production install installs any copy (`dev` not set). */
export function installedPackages(
  installed: Installed,
): Map<string, { name: string; version: string; shipped: boolean }> {
  const packages = new Map<string, { name: string; version: string; shipped: boolean }>();
  for (const [path, entry] of Object.entries(installed.packages)) {
    if (path === '' || entry.link) continue;
    const name =
      entry.name ?? path.slice(path.lastIndexOf('node_modules/') + 'node_modules/'.length);
    const id = key(name, entry.version);
    const shipped = entry.dev !== true || (packages.get(id)?.shipped ?? false);
    packages.set(id, { name, version: entry.version, shipped });
  }
  return packages;
}

/** Scope every npm component from the installed tree: `required` when shipped, `excluded` otherwise. */
export function markScope(bom: Bom, installed: Installed): Bom {
  const packages = installedPackages(installed);
  const components = bom.components.map((component) => {
    if (!isNpm(component)) return component;
    const shipped = packages.get(key(component.name, component.version))?.shipped ?? true;
    const others = (component.properties ?? []).filter((p) => p.name !== development.name);
    return {
      ...component,
      scope: shipped ? ('required' as const) : ('excluded' as const),
      properties: shipped ? others : [...others, development],
    };
  });
  return { ...bom, components };
}

const USES =
  /uses:\s*['"]?([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)((?:\/[A-Za-z0-9_.\-/]+)?)@([0-9a-f]{40})\b['"]?([^\n]*)/g;

/** Every pinned third-party action in the workflow texts, once per action and commit. */
export function pinnedActions(texts: string[]): { actions: Action[]; problems: string[] } {
  const actions = new Map<string, Action>();
  const problems = new Set<string>();
  for (const text of texts) {
    for (const [, owner, repo, subpath, sha, rest] of text.matchAll(USES)) {
      const path = subpath ? subpath.slice(1) : null;
      const uses = `${owner}/${repo}${subpath}@${sha}`;
      const tag = /#\s*(\S+)/.exec(rest ?? '')?.[1];
      if (!tag) problems.add(`${uses}: action not pinned with a tag`);
      else actions.set(uses, { owner: owner!, repo: repo!, path, sha: sha!, tag });
    }
  }
  return { actions: [...actions.values()], problems: [...problems] };
}

export function actionComponent(action: Action): Component {
  const name = action.path ? `${action.repo}/${action.path}` : action.repo;
  return {
    'bom-ref': `github-action:${action.owner}/${name}@${action.sha}`,
    type: 'application',
    group: action.owner,
    name,
    version: action.tag,
    scope: 'excluded',
    purl: `pkg:github/${action.owner}/${action.repo}@${action.sha}${action.path ? `#${action.path}` : ''}`,
    properties: [{ name: 'cdx:github:action:commit', value: action.sha }],
    externalReferences: [{ type: 'vcs', url: `https://github.com/${action.owner}/${action.repo}` }],
  };
}

/** Name the build: the commit as a metadata property and the repository as the site's source. */
export function stamp(bom: Bom, build: { commit: string; repoUrl: string }): Bom {
  const component = bom.metadata.component;
  const references = (component?.externalReferences ?? []).filter((r) => r.type !== 'vcs');
  return {
    ...bom,
    metadata: {
      ...bom.metadata,
      ...(component && {
        component: {
          ...component,
          externalReferences: [...references, { type: 'vcs', url: build.repoUrl }],
        },
      }),
      properties: [
        ...(bom.metadata.properties ?? []).filter((p) => p.name !== commitProperty),
        { name: commitProperty, value: build.commit },
      ],
    },
  };
}

// 014:T013 Valid by the official CycloneDX 1.5 schema, vendored next to this script (014:FR-006)
let schemaValidator: ValidateFunction | undefined;
function validator(): ValidateFunction {
  if (schemaValidator) return schemaValidator;
  const schema = (file: string) =>
    JSON.parse(
      readFileSync(new URL(`./sbom-schema/1.5/${file}`, import.meta.url), 'utf8'),
    ) as object;
  const ajv = new Ajv({ strict: false, allErrors: true });
  addFormats(ajv);
  // Formats the schema uses that Ajv does not implement; the structure is still validated in full.
  ajv.addFormat('iri-reference', true);
  ajv.addFormat('idn-email', true);
  ajv.addSchema(schema('spdx.schema.json'), 'spdx.schema.json');
  ajv.addSchema(schema('jsf-0.82.schema.json'), 'jsf-0.82.schema.json');
  schemaValidator = ajv.compile(schema('bom-1.5.schema.json'));
  return schemaValidator;
}

/** Schema errors as `<path> <message>`; empty when the document is valid CycloneDX 1.5. */
export function validate(bom: unknown): string[] {
  const valid = validator();
  if (valid(bom)) return [];
  return (valid.errors ?? []).map((e) => `${e.instancePath || '/'} ${e.message ?? 'is invalid'}`);
}

export interface CheckResult {
  valid: boolean;
  validation: string[];
  problems: string[];
  counts: { shipped: number; pipeline: number; actions: number; withoutLicence: number };
  passed: boolean;
}

const ACTION_REF = 'github-action:';
const actionKey = (a: Action) => `${a.owner}/${a.repo}${a.path ? `/${a.path}` : ''}@${a.sha}`;

/** Complete and correct against the installed tree and the workflows; every gap is named. */
export function check(bom: Bom, installed: Installed, actions: Action[]): CheckResult {
  const validation = validate(bom);
  const packages = installedPackages(installed);
  const problems: string[] = [];
  const listed = new Set<string>();
  const listedActions = new Set<string>();
  for (const component of bom.components ?? []) {
    if (component['bom-ref'].startsWith(ACTION_REF)) {
      listedActions.add(component['bom-ref'].slice(ACTION_REF.length));
      continue;
    }
    if (!component.version) {
      problems.push(`${component.name}: no version`);
      continue;
    }
    const id = key(component.name, component.version);
    listed.add(id);
    const known = packages.get(id);
    if (!known) problems.push(`${id}: not installed`);
    else if (!component.purl) problems.push(`${id}: no purl`);
    else if (known.shipped && component.scope !== 'required')
      problems.push(`${id}: marked not shipped but shipped`);
    else if (!known.shipped && component.scope !== 'excluded')
      problems.push(`${id}: marked shipped but development only`);
  }
  for (const id of packages.keys()) if (!listed.has(id)) problems.push(`${id}: missing`);
  const used = new Set(actions.map(actionKey));
  for (const id of used) if (!listedActions.has(id)) problems.push(`${id}: missing`);
  for (const id of listedActions) if (!used.has(id)) problems.push(`${id}: not installed`);
  if (LOCAL_PATH.test(JSON.stringify(bom))) problems.push('sbom: contains a local path');

  const components = bom.components ?? [];
  const counts = {
    shipped: components.filter((c) => c.scope === 'required').length,
    pipeline: components.filter((c) => c.scope === 'excluded').length,
    actions: listedActions.size,
    withoutLicence: components.filter((c) => !c.licenses?.length).length,
  };
  const valid = validation.length === 0;
  return { valid, validation, problems, counts, passed: valid && problems.length === 0 };
}

export function renderSummary(result: CheckResult): string {
  const c = result.counts;
  return [
    '### Bill of materials',
    '| | Count |',
    '|---|---|',
    `| Shipped components | ${c.shipped} |`,
    `| Pipeline components | ${c.pipeline} |`,
    `| of which pipeline actions | ${c.actions} |`,
    `| Without a declared licence | ${c.withoutLicence} |`,
    '',
    result.passed
      ? '✅ Bill of materials complete and valid (CycloneDX 1.5).'
      : '❌ Bill of materials incomplete or invalid.',
    ...result.validation.map((v) => `- schema: ${v}`),
    ...result.problems.map((p) => `- ${p}`),
    '',
  ].join('\n');
}

export function workflowTexts(dir = '.github/workflows'): string[] {
  return readdirSync(dir)
    .filter((file) => /\.ya?ml$/.test(file))
    .map((file) => readFileSync(join(dir, file), 'utf8'));
}

/** The complete bill of materials for the installed tree and the workflows. */
export function generate(): {
  bom: Bom;
  installed: Installed;
  actions: Action[];
  problems: string[];
} {
  const output = execFileSync('npm', ['sbom', '--sbom-format', 'cyclonedx'], {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const installed = JSON.parse(
    readFileSync('node_modules/.package-lock.json', 'utf8'),
  ) as Installed;
  const { actions, problems } = pinnedActions(workflowTexts());
  const scoped = markScope(JSON.parse(output) as Bom, installed);
  const bom = stamp(
    { ...scoped, components: [...scoped.components, ...actions.map(actionComponent)] },
    { commit: currentCommit(), repoUrl },
  );
  return { bom, installed, actions, problems };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  let generated: ReturnType<typeof generate>;
  try {
    generated = generate();
  } catch (error) {
    const stderr = (error as { stderr?: string }).stderr;
    console.error(`Bill of materials could not be generated: ${stderr || String(error)}`);
    process.exit(1);
  }
  mkdirSync(dirname(sbomPath), { recursive: true });
  writeFileSync(sbomPath, `${JSON.stringify(generated.bom, null, 2)}\n`);
  const checked = check(generated.bom, generated.installed, generated.actions);
  const result = {
    ...checked,
    problems: [...generated.problems, ...checked.problems],
    passed: checked.passed && generated.problems.length === 0,
  };
  const summary = renderSummary(result);
  if (process.env['GITHUB_STEP_SUMMARY'])
    appendFileSync(process.env['GITHUB_STEP_SUMMARY'], summary);
  console.log(summary);
  process.exitCode = result.passed ? 0 : 1;
}
