// 012:T003 Every visitor-facing bilingual text, collected from the dictionaries and the content
// modules (012:FR-006, 012:FR-007). Plain strings (quotes, article titles, names, tags) are not
// bilingual pairs and stay out by construction. As a CLI it prints the inventory as JSON.
import { pathToFileURL } from 'node:url';
import { locales, ui, type Locale } from '../src/i18n/ui.ts';
import { sentences } from '../src/site/adoption-model.ts';
import { articles, pillars, series } from '../src/site/articles.ts';
import { releases } from '../src/site/career.ts';
import { keyNumbers } from '../src/site/key-numbers.ts';
import {
  assumptions,
  complianceSteps,
  levers,
  models,
  pragmatism,
  premise,
} from '../src/site/method.ts';
import { patterns } from '../src/site/patterns.ts';
import { projects } from '../src/site/projects.ts';
import { endpoints, knownIssues, readmeMeta, testimonial } from '../src/site/readme.ts';

export interface CopyEntry {
  id: string;
  en: string;
  nl: string;
}

const isText = (v: unknown): v is Record<Locale, string> =>
  typeof v === 'object' &&
  v !== null &&
  !Array.isArray(v) &&
  Object.keys(v).length === locales.length &&
  locales.every((l) => typeof (v as Record<string, unknown>)[l] === 'string');

/** Walks any content structure and yields every { en, nl } pair with a readable path. */
function walk(value: unknown, path: string, out: CopyEntry[]): void {
  if (isText(value)) {
    out.push({ id: path, en: value.en, nl: value.nl });
  } else if (Array.isArray(value)) {
    value.forEach((item, i) => {
      const id = (item as { id?: unknown } | null)?.id;
      walk(item, `${path}.${typeof id === 'string' ? id : i}`, out);
    });
  } else if (typeof value === 'object' && value !== null) {
    for (const [key, child] of Object.entries(value)) walk(child, `${path}.${key}`, out);
  }
}

export function collectCopy(): CopyEntry[] {
  const out: CopyEntry[] = (Object.keys(ui.en) as (keyof typeof ui.en)[]).map((key) => ({
    id: `ui:${key}`,
    en: ui.en[key],
    nl: ui.nl[key],
  }));
  for (const kind of Object.keys(sentences.en) as (keyof typeof sentences.en)[]) {
    out.push({ id: `playground:${kind}`, en: sentences.en[kind], nl: sentences.nl[kind] });
  }
  const modules: Record<string, unknown> = {
    career: releases,
    method: { premise, levers, pragmatism, assumptions, complianceSteps, models },
    readme: { readmeMeta, endpoints, knownIssues, testimonialRole: testimonial.role },
    projects,
    patterns,
    numbers: keyNumbers,
    writing: { pillars, series, articles },
  };
  for (const [name, value] of Object.entries(modules)) walk(value, name, out);
  return out;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  console.log(JSON.stringify(collectCopy(), null, 2));
}
