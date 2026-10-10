// 005:T001 README content invariants (005:FR-002, 005:FR-003, 005:FR-005 – 005:FR-007, 005:FR-011, 005:SC-002)
import { describe, expect, it } from 'vitest';
import { locales } from '../../src/i18n/ui.ts';
import { endpoints, knownIssues, readmeMeta, testimonial } from '../../src/site/readme.ts';

const byId = (id: string) => endpoints.find((e) => e.id === id)!;

describe('README meta', () => {
  it('has a valid last-updated date and an intro per language', () => {
    expect(readmeMeta.updated).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(Number.isNaN(Date.parse(readmeMeta.updated))).toBe(false);
    for (const locale of locales) expect(readmeMeta.intro[locale].trim()).not.toBe('');
  });
});

describe('endpoints', () => {
  it('are the eight agreed endpoints, in order, with unique paths', () => {
    expect(endpoints.map((e) => e.id)).toEqual([
      'values',
      'expect-me',
      'expect-you',
      'one-on-ones',
      'contact',
      'feedback',
      'errors',
      'known-issues',
    ]);
    const paths = endpoints.map((e) => e.path);
    expect(new Set(paths).size).toBe(paths.length);
    for (const e of endpoints) {
      expect(['GET', 'POST', 'PUT']).toContain(e.method);
      expect(e.path).toMatch(/^\/[a-z/-]+$/);
    }
  });

  it('have a title and content in every language', () => {
    for (const e of endpoints) {
      for (const locale of locales) {
        expect(e.title[locale].trim(), `${e.id}.title.${locale}`).not.toBe('');
        for (const item of e.items) expect(item[locale].trim(), `${e.id}.${locale}`).not.toBe('');
      }
    }
  });

  it('state the clarified practices', () => {
    expect(
      byId('one-on-ones')
        .items.map((i) => i.en)
        .join(' '),
    ).toMatch(/monthly.*one hour/i);
    expect(
      byId('one-on-ones')
        .items.map((i) => i.en)
        .join(' '),
    ).toMatch(/ad hoc/i);
    expect(
      byId('contact')
        .items.map((i) => i.en)
        .join(' '),
    ).toMatch(/same working day/);
    expect(
      byId('feedback')
        .items.map((i) => i.en)
        .join(' '),
    ).toMatch(/in the team/);
    expect(byId('expect-me').items).toHaveLength(3);
    expect(byId('expect-you').items).toHaveLength(4);
  });
});

describe('known issues', () => {
  it('are the two clarified issues, each with a workaround', () => {
    expect(knownIssues).toHaveLength(2);
    expect(knownIssues[0]!.description.en).toMatch(/blunt/);
    expect(knownIssues[1]!.description.en).toMatch(/process/);
    for (const issue of knownIssues) {
      for (const locale of locales) expect(issue.workaround[locale].trim()).not.toBe('');
    }
  });
});

describe('testimonial', () => {
  it('is attributed to Chris Stapper, with a clean LinkedIn link', () => {
    expect(testimonial.author).toBe('Chris Stapper');
    expect(testimonial.url).toBe('https://www.linkedin.com/in/chrisstapper');
    expect(testimonial.quote).toMatch(/^I always felt Sander could be the Satoru Iwata of DevOps/);
  });
});
