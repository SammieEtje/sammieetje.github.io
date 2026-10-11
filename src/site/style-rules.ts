// 012:T003 The house style as code: patterns that make copy read as machine-written (012:FR-001, 012:FR-006)
// Source: Sander's "Writing Rules - Humanise" and the humanise-text skill. Words that are proper
// names or literal terms in this copy ("framework", "alignment") are deliberately not listed.
import type { Locale } from '../i18n/ui.ts';

const WORDS: Record<Locale, string[]> = {
  en: [
    'moreover',
    'furthermore',
    'however',
    'therefore',
    'additionally',
    'consequently',
    'nonetheless',
    'thus',
    'leverage',
    'synergy',
    'scalable',
    'streamline',
    'optimise',
    'optimize',
    'empower',
    'innovative',
    'robust',
    'seamless',
    'seamlessly',
    'holistic',
    'ecosystem',
    'stakeholder',
    'stakeholders',
    'methodology',
    'ensure',
    'ensures',
    'enhance',
    'foster',
    'elevate',
    'delve',
    'vital',
    'essential',
    'pivotal',
    'cutting-edge',
    'game-changer',
    'paradigm shift',
    'thought leadership',
    'data-driven',
    'deep dive',
    'in order to',
    'as a result',
    "it's important to note",
    'a testament to',
    'ultimately',
    'subsequently',
    'despite',
  ],
  nl: [
    'bovendien',
    'echter',
    'derhalve',
    'cruciaal',
    'cruciale',
    'essentieel',
    'essentiële',
    'naadloos',
    'naadloze',
    'holistisch',
    'holistische',
    'robuust',
    'robuuste',
    'innovatief',
    'innovatieve',
    'ecosysteem',
    'stakeholder',
    'stakeholders',
    'datagedreven',
    'optimaliseren',
    'faciliteren',
  ],
};

const APOS = "['’]";

const PATTERNS: Record<Locale, [string, RegExp][]> = {
  en: [
    ['contrast:not-but', /\bnot\b[^.;:!?]{1,80}?,\s*but\b/i],
    ['contrast:trailing-not', /,\s*not\s+(?:just\s+|only\s+)?[^,.;:!?]{1,50}(?:[.;:!?]|$)/i],
    ['contrast:leading-not', /(?:^|[.!?:;]\s+)Not\s+[^,.;:!?]{1,50},/],
    [
      'contrast:is-not-it-is',
      new RegExp(
        `\\b(?:(?:is|are|was|were)\\s+not|isn${APOS}t|aren${APOS}t|wasn${APOS}t|(?:it|that|this|they)${APOS}(?:s|re)\\s+not)\\b[^.;!?]{1,60}[;,]\\s*(?:it|this|that|they)(?:${APOS}s|${APOS}re|\\s+is|\\s+are|\\s+was)\\b`,
        'i',
      ),
    ],
    ['setup:elliptical', /(?:^|[.!?]\s+)The\s+[^.?!]{1,30}\?\s+[A-Z]/],
  ],
  nl: [
    ['contrast:not-but', /\b(?:niet|geen)\b[^.;:!?]{1,80}?,\s*maar\b/i],
    ['contrast:trailing-not', /,\s*(?:niet|geen)\s+[^,.;:!?]{1,50}(?:[.;:!?]|$)/i],
    ['contrast:leading-not', /(?:^|[.!?:;]\s+)(?:Niet|Geen)\s+[^,.;:!?]{1,50},/],
    [
      'contrast:is-not-it-is',
      /\b(?:is|zijn|was)\s+(?:geen|niet)\b[^.;!?]{1,60};\s*(?:het|dat|zo|dit)\b/i,
    ],
    ['setup:elliptical', /(?:^|[.!?]\s+)(?:Het|De)\s+[^.?!]{1,30}\?\s+[A-Z]/],
  ],
};

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const wordRule = (word: string) =>
  new RegExp(`(?<![\\p{L}\\p{N}-])${escape(word).replace(/'/g, APOS)}(?![\\p{L}\\p{N}-])`, 'iu');

const RULES: Record<Locale, [string, RegExp][]> = {
  en: [
    ['em-dash', /—/],
    ...WORDS.en.map((w): [string, RegExp] => [`word:${w}`, wordRule(w)]),
    ...PATTERNS.en,
  ],
  nl: [
    ['em-dash', /—/],
    ...WORDS.nl.map((w): [string, RegExp] => [`word:${w}`, wordRule(w)]),
    ...PATTERNS.nl,
  ],
};

/** The names of the style rules a text breaks; empty when it follows the house style. */
export function styleViolations(text: string, locale: Locale): string[] {
  return RULES[locale].filter(([, re]) => re.test(text)).map(([name]) => name);
}
