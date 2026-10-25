// 014:T004 Pipeline actions are components too, with their pinned commit and tag (014:FR-003)
import { describe, expect, it } from 'vitest';
import { actionComponent, pinnedActions } from '../../scripts/sbom.ts';

const sha = '3d3c42e5aac5ba805825da76410c181273ba90b1';
const other = 'cf430e030ddbb5b0abf93d22962f4752f3646cd9';

const workflow = `
jobs:
  a:
    steps:
      - uses: actions/checkout@${sha} # v7.0.1
      - name: Upload
        uses: actions/upload-artifact@${other} # v7.0.2
      - uses: ./.github/actions/local
      - uses: docker://alpine:3.20
`;

describe('pinnedActions', () => {
  it('finds every pinned action with owner, repo, commit and tag', () => {
    const { actions, problems } = pinnedActions([workflow]);
    expect(problems).toEqual([]);
    expect(actions).toEqual([
      { owner: 'actions', repo: 'checkout', path: null, sha, tag: 'v7.0.1' },
      { owner: 'actions', repo: 'upload-artifact', path: null, sha: other, tag: 'v7.0.2' },
    ]);
  });

  it('counts the same action at the same commit in two workflows once', () => {
    expect(pinnedActions([workflow, workflow]).actions).toHaveLength(2);
  });

  it('keeps the subpath of an action that lives in a folder', () => {
    const text = `      - uses: github/codeql-action/init@${sha} # v4.1.0\n`;
    expect(pinnedActions([text]).actions[0]).toMatchObject({
      owner: 'github',
      repo: 'codeql-action',
      path: 'init',
    });
  });

  it('reports an action pinned without a tag comment', () => {
    const { actions, problems } = pinnedActions([`      - uses: actions/checkout@${sha}\n`]);
    expect(actions).toEqual([]);
    expect(problems).toEqual([`actions/checkout@${sha}: action not pinned with a tag`]);
  });
});

describe('actionComponent', () => {
  it('describes the action as an excluded application with a GitHub purl', () => {
    const action = { owner: 'actions', repo: 'checkout', path: null, sha, tag: 'v7.0.1' };
    expect(actionComponent(action)).toEqual({
      'bom-ref': `github-action:actions/checkout@${sha}`,
      type: 'application',
      group: 'actions',
      name: 'checkout',
      version: 'v7.0.1',
      scope: 'excluded',
      purl: `pkg:github/actions/checkout@${sha}`,
      properties: [{ name: 'cdx:github:action:commit', value: sha }],
      externalReferences: [{ type: 'vcs', url: 'https://github.com/actions/checkout' }],
    });
  });

  it('keeps the subpath in the name, the reference and the purl', () => {
    const action = { owner: 'github', repo: 'codeql-action', path: 'init', sha, tag: 'v4.1.0' };
    expect(actionComponent(action)).toMatchObject({
      'bom-ref': `github-action:github/codeql-action/init@${sha}`,
      name: 'codeql-action/init',
      purl: `pkg:github/github/codeql-action@${sha}#init`,
    });
  });
});
