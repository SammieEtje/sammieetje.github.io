// 001:T026 Public profile facts; wording per locale lives in the dictionaries
import type { UiKey } from '../i18n/ui.ts';

export const profile = {
  name: 'Sander Ettema',
  initials: 'SE',
  linkedin: 'https://www.linkedin.com/in/sanderettema/',
} as const;

// 002:T015 Public profiles for the Links card (002:FR-008)
export interface ProfileLink {
  id: string;
  name: string;
  handle: string;
  url: string;
  labelKey: UiKey;
}

export const profileLinks: readonly ProfileLink[] = [
  {
    id: 'linkedin',
    name: 'LinkedIn',
    handle: 'in/sanderettema',
    url: profile.linkedin,
    labelKey: 'links.linkedin',
  },
  {
    id: 'github',
    name: 'GitHub',
    handle: 'SammieEtje',
    url: 'https://github.com/SammieEtje',
    labelKey: 'links.github',
  },
];
