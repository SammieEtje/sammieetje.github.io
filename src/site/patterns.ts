// 003:T004 The four phases that recur in every role (003:FR-007)
import type { Locale } from '../i18n/ui.ts';

export type PatternId = 'consolidate' | 'stabilise' | 'environment' | 'community';

export interface PatternPhase {
  id: PatternId;
  name: Record<Locale, string>;
  explanation: Record<Locale, string>;
}

export const patterns: readonly PatternPhase[] = [
  {
    id: 'consolidate',
    name: { en: 'Consolidate', nl: 'Consolideren' },
    explanation: {
      en: 'Bring teams and tooling together and create mutual understanding.',
      nl: 'Teams en tooling samenbrengen en onderling begrip creëren.',
    },
  },
  {
    id: 'stabilise',
    name: { en: 'Stabilise', nl: 'Stabiliseren' },
    explanation: {
      en: 'Get daily work under control, automate it and build knowledge.',
      nl: 'Het dagelijkse werk onder controle krijgen, automatiseren en kennis opbouwen.',
    },
  },
  {
    id: 'environment',
    name: { en: 'Design the environment', nl: 'Omgeving ontwerpen' },
    explanation: {
      en: 'Make the right thing the easy thing: self-service, golden paths and compliance built in.',
      nl: 'Maak het juiste het makkelijkste: zelfbediening, golden paths en ingebouwde compliance.',
    },
  },
  {
    id: 'community',
    name: { en: 'Grow the community', nl: 'Community laten groeien' },
    explanation: {
      en: 'Adoption through people and visible value, not through mandates.',
      nl: 'Adoptie via mensen en zichtbare meerwaarde, niet via mandaten.',
    },
  },
];
