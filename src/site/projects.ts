// 007:T002 Curated side projects; no volatile numbers or third-party badges (007:FR-003 – 007:FR-005)
import type { Locale } from '../i18n/ui.ts';

type Text = Record<Locale, string>;

export interface Project {
  id: string;
  name: string;
  repo: string;
  /** A live page, or 'self' for this site. */
  live?: string | 'self';
  purpose: Text;
  demonstrates: Text;
  tech: string[];
  lifecycle: 'production' | 'experimental' | 'archived';
  specs?: string;
  since: number;
}

const gh = (name: string) => `https://github.com/SammieEtje/${name}`;

export const projects: readonly Project[] = [
  {
    id: 'profile-site',
    name: 'sammieetje.github.io',
    repo: gh('sammieetje.github.io'),
    live: 'self',
    purpose: {
      en: 'This profile site, built as a developer portal.',
      nl: 'Deze profielsite, gebouwd als developer portal.',
    },
    demonstrates: {
      en: 'Spec-driven development end to end: every element traces back to a requirement, and nothing reaches production without passing the quality gate.',
      nl: 'Spec-driven development van begin tot eind: elk element is te herleiden tot een eis, en niets bereikt productie zonder de quality gate te passeren.',
    },
    tech: ['Astro', 'TypeScript', 'Playwright', 'Lighthouse CI', 'GitHub Actions', 'Spec Kit'],
    lifecycle: 'production',
    specs: `${gh('sammieetje.github.io')}/tree/main/specs`,
    since: 2026,
  },
  {
    id: 'specdriven-app',
    name: 'my-specdriven-app',
    repo: gh('my-specdriven-app'),
    purpose: {
      en: 'A small to-do app that exists to show a way of working.',
      nl: 'Een kleine takenlijst die bestaat om een manier van werken te laten zien.',
    },
    demonstrates: {
      en: 'Spec Kit with an AI assistant under human direction: click any element and it shows the requirement and the decisions behind it; every pull request passes code, security and usability checks.',
      nl: 'Spec Kit met een AI-assistent onder menselijke regie: klik op een element en je ziet de eis en de beslissingen erachter; elke pull request doorloopt controles op code, security en bruikbaarheid.',
    },
    tech: ['JavaScript', 'Vitest', 'Playwright', 'GitHub Actions', 'Spec Kit'],
    lifecycle: 'experimental',
    specs: `${gh('my-specdriven-app')}/tree/main/specs`,
    since: 2026,
  },
  {
    id: 'mypool',
    name: 'myPool',
    repo: gh('myPool'),
    purpose: {
      en: 'A Formula 1 betting pool for friends: predict the top ten, score points, follow the leaderboard.',
      nl: 'Een Formule 1-poule voor vrienden: voorspel de top tien, scoor punten, volg het klassement.',
    },
    demonstrates: {
      en: 'A complete web application, from social login with multi-factor authentication to an API, containers and a CI/CD pipeline with test coverage, maintained since 2021.',
      nl: 'Een complete webapplicatie, van social login met meerfactorauthenticatie tot een API, containers en een CI/CD-pipeline met testdekking, onderhouden sinds 2021.',
    },
    tech: ['Python', 'Django', 'Django REST Framework', 'JavaScript', 'Docker', 'GitHub Actions'],
    lifecycle: 'experimental',
    since: 2021,
  },
];
