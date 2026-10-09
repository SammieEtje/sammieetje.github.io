// 002:T011 Key numbers, each with organisation and period so a past role never reads as current (002:FR-004)
import type { Locale } from '../i18n/ui.ts';

export interface KeyNumber {
  id: string;
  value: number;
  suffix: '' | '×';
  label: Record<Locale, string>;
  context: Record<Locale, string>;
}

export const keyNumbers: readonly KeyNumber[] = [
  {
    id: 'adoption',
    value: 10000,
    suffix: '',
    label: {
      en: 'voluntary users on the CI/CD platform, in an IT organisation of 7,600 — without a mandate',
      nl: 'vrijwillige gebruikers op het CI/CD-platform, in een IT-organisatie van 7.600 — zonder mandaat',
    },
    context: { en: 'Rabobank · 2016–2020', nl: 'Rabobank · 2016–2020' },
  },
  {
    id: 'scale',
    value: 5,
    suffix: '×',
    label: {
      en: 'infrastructure growth (500 → 2,500 Linux nodes) with a 15% smaller team',
      nl: 'groei van de infrastructuur (500 → 2.500 Linux-nodes) met een 15% kleiner team',
    },
    context: { en: 'Rabobank · 2011–2016', nl: 'Rabobank · 2011–2016' },
  },
  {
    id: 'volume',
    value: 2.5,
    suffix: '×',
    label: {
      en: 'service volume with minimal team growth',
      nl: 'dienstvolume met minimale teamgroei',
    },
    context: {
      en: 'TenneT · Infrastructure, Integration & Cloud · 2023–2026',
      nl: 'TenneT · Infrastructuur, Integratie & Cloud · 2023–2026',
    },
  },
];
