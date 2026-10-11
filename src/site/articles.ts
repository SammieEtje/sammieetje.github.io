// 006:T002 Published articles, grouped by content pillar (006:FR-002 – 006:FR-007)
// Titles, URLs and dates: public LinkedIn article metadata (fetched 2026-10-10); dates in
// Europe/Amsterdam. Reading time: vault word count / 230, rounded up. Excerpts are original summaries.
import type { Locale } from '../i18n/ui.ts';

type Text = Record<Locale, string>;

export type PillarId = 'people' | 'environment' | 'regulated' | 'community';

export interface Pillar {
  id: PillarId;
  name: Text;
  intro: Text;
}

export const pillars: readonly Pillar[] = [
  {
    id: 'people',
    name: { en: 'The wrong image of people', nl: 'Het verkeerde mensbeeld' },
    intro: {
      en: 'Why IT transformations so often stall on psychology.',
      nl: 'Waarom IT-transformaties zo vaak vastlopen op psychologie.',
    },
  },
  {
    id: 'environment',
    name: { en: 'The environment as the instrument', nl: 'De omgeving als instrument' },
    intro: {
      en: 'How to make the right path the easiest one, in practice.',
      nl: 'Hoe je de juiste route in de praktijk de makkelijkste maakt.',
    },
  },
  {
    id: 'regulated',
    name: { en: 'Regulated and fast', nl: 'Gereguleerd én snel' },
    intro: {
      en: 'How compliance can make a regulated organisation faster.',
      nl: 'Hoe compliance een gereguleerde organisatie sneller kan maken.',
    },
  },
  {
    id: 'community',
    name: { en: 'Community as the engine', nl: 'Community als motor' },
    intro: {
      en: 'Why adoption spreads through people, and what that means for a roll-out.',
      nl: 'Waarom adoptie zich via mensen verspreidt, en wat dat betekent voor een uitrol.',
    },
  },
];

export const series = {
  'platform-as-product': {
    name: { en: 'Running the platform as a product', nl: 'Het platform runnen als product' },
  },
} as const satisfies Record<string, { name: Text }>;

export type SeriesId = keyof typeof series;

export interface Article {
  id: string;
  title: string;
  url: string;
  published: string;
  minutes: number;
  pillar: PillarId;
  series?: { id: SeriesId; part: number; total: number };
  excerpt: Text;
}

const pulse = (slug: string) => `https://www.linkedin.com/pulse/${slug}`;

export const articles: readonly Article[] = [
  {
    id: 'intake-form',
    title: "Ninety percent of that intake form wasn't a customer question",
    url: pulse('ninety-percent-intake-form-wasnt-customer-question-sander-ettema-rrhbe'),
    published: '2026-06-02',
    minutes: 5,
    pillar: 'people',
    excerpt: {
      en: 'When most of an intake form asks for things the platform team could settle itself, the form is pointing at design work that is still open.',
      nl: 'Als een intakeformulier vooral vraagt naar wat het platformteam zelf kan regelen, wijst het formulier op ontwerpwerk dat nog openligt.',
    },
  },
  {
    id: 'developer-portal',
    title:
      'The developer portal is the surface that observes what engineers actually do on your platform',
    url: pulse('developer-portal-surface-observes-what-engineers-actually-ettema-icp7e'),
    published: '2026-05-18',
    minutes: 5,
    pillar: 'environment',
    series: { id: 'platform-as-product', part: 5, total: 5 },
    excerpt: {
      en: 'Your developer portal is the richest source of behavioural data about your platform. What engineers search for, request and abandon tells you more than any uptime figure.',
      nl: 'Je developer portal is de rijkste bron van gedragsdata over je platform. Waar engineers naar zoeken, wat ze aanvragen en waar ze afhaken, zegt meer dan elk uptimecijfer.',
    },
  },
  {
    id: 'it4it-conversations',
    title: "IT4IT doesn't describe the conversations. That's your job.",
    url: pulse('it4it-doesnt-describe-conversations-thats-your-job-sander-ettema-26vpe'),
    published: '2026-05-13',
    minutes: 5,
    pillar: 'environment',
    series: { id: 'platform-as-product', part: 4, total: 5 },
    excerpt: {
      en: 'A dashboard on its own changes nothing. Improvement starts when leaders ask questions about the platform signals, and enabling teams and Scrum Masters help teams act on them.',
      nl: 'Een dashboard alleen verandert niets. Verbetering begint als leiders vragen stellen over de platformsignalen, en enabling teams en Scrum Masters teams helpen ermee aan de slag te gaan.',
    },
  },
  {
    id: 'uptime',
    title: 'Uptime is not a product metric',
    url: pulse('uptime-product-metric-sander-ettema-afwze'),
    published: '2026-04-28',
    minutes: 6,
    pillar: 'environment',
    series: { id: 'platform-as-product', part: 3, total: 5 },
    excerpt: {
      en: "Dashboards and on-call rotations say little about whether a platform is healthy. Google's HEART framework, applied to internal engineers, gives a much better picture.",
      nl: 'Dashboards en on-call-diensten zeggen weinig over de gezondheid van een platform. Het HEART-framework van Google, toegepast op interne engineers, geeft een veel beter beeld.',
    },
  },
  {
    id: 'teaches-by-doing',
    title: 'The platform that teaches by doing.',
    url: pulse('platform-teaches-doing-sander-ettema-hun7e'),
    published: '2026-04-21',
    minutes: 4,
    pillar: 'environment',
    series: { id: 'platform-as-product', part: 2, total: 5 },
    excerpt: {
      en: 'A mature platform runs on IT4IT and also offers its building blocks, such as observability and change tracking, as golden paths that every team can pick up.',
      nl: 'Een volwassen platform draait op IT4IT en biedt de bouwstenen ervan ook aan, zoals observability en changeregistratie, als golden paths die elk team kan oppakken.',
    },
  },
  {
    id: 'shipped-platform',
    title: 'We shipped the platform. We forgot to build the product',
    url: pulse('we-shipped-platform-forgot-build-product-sander-ettema-mnxbe'),
    published: '2026-04-14',
    minutes: 6,
    pillar: 'environment',
    series: { id: 'platform-as-product', part: 1, total: 5 },
    excerpt: {
      en: 'An internal platform is a product that keeps changing after go-live. IT4IT gives the platform team an improvement cycle that keeps it honest about whether it still serves engineers.',
      nl: 'Een intern platform is een product dat na de livegang blijft veranderen. IT4IT geeft het platformteam een verbetercyclus die het eerlijk houdt over de vraag of het engineers nog dient.',
    },
  },
  {
    id: 'community',
    title: 'The community that drives change',
    url: pulse('community-drives-change-sander-ettema-0ctde'),
    published: '2026-03-31',
    minutes: 6,
    pillar: 'community',
    excerpt: {
      en: 'Adoption spreads from person to person. This is how a community built around its people kept running for years after I left Rabobank.',
      nl: 'Adoptie gaat van mens tot mens. Zo bleef een community die rond haar mensen was gebouwd nog jaren draaien nadat ik bij Rabobank vertrok.',
    },
  },
  {
    id: 'golden-cage',
    title: 'Why your golden path became a golden cage',
    url: pulse('why-your-golden-path-became-cage-sander-ettema-r938e'),
    published: '2026-03-24',
    minutes: 6,
    pillar: 'environment',
    excerpt: {
      en: 'A golden path becomes a golden cage the moment choice disappears. Keep the mandate with leadership and let the platform remove the friction of meeting it.',
      nl: 'Een golden path wordt een gouden kooi zodra de keuze verdwijnt. Laat het mandaat bij het leiderschap en laat het platform de frictie wegnemen om eraan te voldoen.',
    },
  },
  {
    id: 'people-lazy',
    title: 'People are lazy, engineers are trustworthy, and failure should be free',
    url: pulse('people-lazy-engineers-trustworthy-failure-should-free-sander-ettema-njqle'),
    published: '2026-03-17',
    minutes: 5,
    pillar: 'people',
    excerpt: {
      en: 'The four explicit assumptions behind every platform decision at Rabobank: trust engineers, make failure cheap, design for the path of least resistance, and pair freedom with responsibility.',
      nl: 'De vier expliciete aannames achter elke platformbeslissing bij Rabobank: vertrouw engineers, maak falen goedkoop, ontwerp voor de weg van de minste weerstand en koppel vrijheid aan verantwoordelijkheid.',
    },
  },
  {
    id: 'elite-sports',
    title: 'What elite sports taught me about IT transformation',
    url: pulse('what-elite-sports-taught-me-transformation-sander-ettema-zumce'),
    published: '2026-03-09',
    minutes: 4,
    pillar: 'community',
    excerpt: {
      en: 'I once wanted to be a professional athlete. What I learned instead, studying behaviour change at the Dutch Olympic Committee, became the basis of how I approach every transformation.',
      nl: 'Ik wilde ooit topsporter worden. Wat ik in plaats daarvan leerde over gedragsverandering bij NOC*NSF, werd de basis van hoe ik elke transformatie aanpak.',
    },
  },
];

export function articlesFor(pillar: PillarId): Article[] {
  return articles
    .filter((a) => a.pillar === pillar)
    .sort((a, b) => b.published.localeCompare(a.published));
}

export function articleById(id: string): Article {
  const article = articles.find((a) => a.id === id);
  if (!article) throw new Error(`Unknown article: ${id}`);
  return article;
}
