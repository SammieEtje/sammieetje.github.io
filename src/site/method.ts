// 004:T002 The method: premise, levers, assumptions, compliance and the science underneath (004:FR-002 – 004:FR-009)
// Source: Sander's approved positioning and the published post on the four assumptions.
// No percentages or other behaviour statistics (clarified 2026-10-10).
import type { Locale } from '../i18n/ui.ts';
import { releases, type Release } from './career.ts';
import type { PatternId } from './patterns.ts';

type Text = Record<Locale, string>;

export const premise: { premise: Text; principle: Text; diagnosis: Text } = {
  premise: {
    en: 'People take the path of least resistance. That is not unwillingness; it is how the brain saves energy.',
    nl: 'Mensen kiezen de weg van de minste weerstand. Dat is geen onwil; zo bespaart het brein energie.',
  },
  principle: {
    en: 'Make the right thing the easy thing.',
    nl: 'Maak het juiste het makkelijkste.',
  },
  diagnosis: {
    en: 'Most transformations fail on the wrong image of people, not on technology. They assume people change once they are convinced or told to: mandates, control layers, mandatory tooling. Models such as ADKAR address only the conscious, individual layer of behaviour change. The alternative is not to push harder, but to redesign the environment.',
    nl: 'De meeste transformaties falen op een verkeerd mensbeeld, niet op technologie. Ze gaan ervan uit dat mensen veranderen zodra ze overtuigd zijn of het opgedragen krijgen: mandaten, controlelagen, verplichte tooling. Modellen zoals ADKAR richten zich alleen op de bewuste, individuele laag van gedragsverandering. Het alternatief is niet harder duwen, maar de omgeving herontwerpen.',
  },
};

export interface Lever {
  id: 'lower' | 'raise';
  title: Text;
  instruments: Text[];
}

export const levers: readonly Lever[] = [
  {
    id: 'lower',
    title: {
      en: 'Lower the resistance on the right path',
      nl: 'Verlaag de weerstand op de juiste route',
    },
    instruments: [
      { en: 'Knowledge of the context', nl: 'Kennis van de context' },
      { en: 'Self-service tooling and golden paths', nl: 'Zelfbediening en golden paths' },
      { en: 'Community and peer support', nl: "Community en hulp van collega's" },
      {
        en: 'Visible value and quick rewards: fast feedback, green builds',
        nl: 'Zichtbare meerwaarde en snelle beloning: snelle feedback, groene builds',
      },
    ],
  },
  {
    id: 'raise',
    title: {
      en: 'Raise the resistance on the wrong path',
      nl: 'Verhoog de weerstand op de verkeerde route',
    },
    instruments: [
      { en: 'Accountability', nl: 'Verantwoordingsplicht' },
      {
        en: 'Compliance burden for whoever leaves the path',
        nl: 'Compliancelast voor wie van het pad afwijkt',
      },
      { en: 'No support off the platform', nl: 'Geen ondersteuning buiten het platform' },
    ],
  },
];

export const pragmatism: Text = {
  en: 'And the pragmatism rule: if a team leaves the standard but stays compliant and is not more expensive, we learn from them instead of correcting them.',
  nl: 'En de pragmatismeregel: als een team van de standaard afwijkt maar wel compliant is en niet duurder, leren we van hen in plaats van ze te corrigeren.',
};

export interface Assumption {
  statement: Text;
  subtitle?: Text;
  inPractice: Text;
}

export const assumptions: readonly Assumption[] = [
  {
    statement: {
      en: 'Our users are skilled engineers with good intentions',
      nl: 'Onze gebruikers zijn vakbekwame engineers met goede bedoelingen',
    },
    inPractice: {
      en: 'Self-service and quality by default instead of gates and approvals. When people take shortcuts, the right path is too hard: a design problem, not a people problem.',
      nl: 'Zelfbediening en kwaliteit als standaard in plaats van poortjes en goedkeuringen. Als mensen afsnijden, is de juiste route te moeilijk: een ontwerpprobleem, geen mensenprobleem.',
    },
  },
  {
    statement: {
      en: 'Learning requires room to fail safely',
      nl: 'Leren vraagt ruimte om veilig te falen',
    },
    inPractice: {
      en: 'Cheap, safe experiments: sandboxes, test environments and easy rollback, and a culture in which sharing what went wrong is normal.',
      nl: 'Goedkope, veilige experimenten: sandboxes, testomgevingen en eenvoudig terugdraaien, en een cultuur waarin delen wat misging normaal is.',
    },
  },
  {
    statement: { en: 'People are inherently lazy', nl: 'Mensen zijn van nature lui' },
    subtitle: {
      en: 'Not a judgement, a design constraint: people take the path of least resistance.',
      nl: 'Geen oordeel, een ontwerpvoorwaarde: mensen kiezen de weg van de minste weerstand.',
    },
    inPractice: {
      en: 'Make the easiest path the right one: golden paths, sensible defaults, self-service compliance, automated change registration.',
      nl: 'Maak de makkelijkste route de juiste: golden paths, verstandige standaarden, compliance in zelfbediening, geautomatiseerde changeregistratie.',
    },
  },
  {
    statement: {
      en: 'With great freedom comes great responsibility',
      nl: 'Met grote vrijheid komt grote verantwoordelijkheid',
    },
    inPractice: {
      en: 'Teams may configure, choose and deviate. Whoever leaves the golden path carries the compliance burden themselves: not as punishment, but because those controls were never automated.',
      nl: 'Teams mogen configureren, kiezen en afwijken. Wie het golden path verlaat, draagt zelf de compliancelast: niet als straf, maar omdat die controles nooit geautomatiseerd zijn.',
    },
  },
];

export const complianceSteps: readonly Text[] = [
  {
    en: 'Identify which compliance requirements lend themselves to automation.',
    nl: 'Bepaal welke compliance-eisen zich lenen voor automatisering.',
  },
  {
    en: 'Build them in as platform properties: policy as code, automated auditing, built-in logging.',
    nl: 'Bouw ze in als eigenschap van het platform: policy as code, geautomatiseerde audits, ingebouwde logging.',
  },
  {
    en: 'Make the alternative, manual compliance, heavier than using the platform.',
    nl: 'Maak het alternatief, handmatige compliance, zwaarder dan het platform gebruiken.',
  },
  {
    en: 'Teams choose the platform not despite compliance, but because of it.',
    nl: 'Teams kiezen het platform niet ondanks compliance, maar vanwege compliance.',
  },
];

export interface Model {
  id: string;
  manifest: string;
  name: Text;
  authors: string;
  year: number;
  takeaway: Text;
}

export const models: readonly Model[] = [
  {
    id: 'dual-process',
    manifest: 'kahneman/dual-process@2011',
    name: {
      en: 'Dual-process theory (System 1 and 2)',
      nl: 'Duale-procestheorie (Systeem 1 en 2)',
    },
    authors: 'Kahneman',
    year: 2011,
    takeaway: {
      en: 'Most everyday decisions are made fast and automatically. Design for System 1, not only for persuasion.',
      nl: 'De meeste dagelijkse beslissingen gaan snel en automatisch. Ontwerp voor Systeem 1, niet alleen voor overtuiging.',
    },
  },
  {
    id: 'tpb',
    manifest: 'ajzen/planned-behaviour@1991',
    name: { en: 'Theory of Planned Behaviour', nl: 'Theorie van gepland gedrag' },
    authors: 'Ajzen',
    year: 1991,
    takeaway: {
      en: 'Behaviour follows attitude, social norm and perceived control: what the environment enables and expects matters as much as what people think.',
      nl: 'Gedrag volgt uit attitude, sociale norm en ervaren controle: wat de omgeving mogelijk maakt en verwacht, telt net zo zwaar als wat mensen vinden.',
    },
  },
  {
    id: 'ase',
    manifest: 'de-vries/ase-model@1988',
    name: { en: 'ASE model', nl: 'ASE-model' },
    authors: 'De Vries, Dijkstra & Kuhlman, building on Fishbein & Ajzen',
    year: 1988,
    takeaway: {
      en: 'Social influence and self-efficacy weigh as heavily as personal conviction.',
      nl: 'Sociale invloed en eigen-effectiviteit wegen net zo zwaar als persoonlijke overtuiging.',
    },
  },
  {
    id: 'nudge',
    manifest: 'thaler-sunstein/nudge@2008',
    name: { en: 'Nudge and choice architecture', nl: 'Nudge en keuzearchitectuur' },
    authors: 'Thaler & Sunstein',
    year: 2008,
    takeaway: {
      en: 'Defaults are the strongest instrument: people rarely leave the standard.',
      nl: 'Standaarden zijn het sterkste instrument: mensen wijken zelden af van de standaard.',
    },
  },
  {
    id: 'fogg',
    manifest: 'fogg/behavior-model@2009',
    name: { en: 'Fogg Behavior Model', nl: 'Fogg-gedragsmodel' },
    authors: 'Fogg',
    year: 2009,
    takeaway: {
      en: 'Behaviour needs motivation, ability and a prompt at the same moment. Making it easier often works better than raising motivation.',
      nl: 'Gedrag vraagt motivatie, vermogen en een aanleiding op hetzelfde moment. Het makkelijker maken werkt vaak beter dan motivatie verhogen.',
    },
  },
  {
    id: 'habit',
    manifest: 'duhigg/habit-loop@2012',
    name: { en: 'Habit loop', nl: 'Gewoontelus' },
    authors: 'Duhigg',
    year: 2012,
    takeaway: {
      en: 'Cue, routine, reward: habits run without deliberation, so design the loop, not the belief.',
      nl: 'Aanleiding, routine, beloning: gewoontes lopen zonder nadenken, dus ontwerp de lus, niet de overtuiging.',
    },
  },
];

/** Releases from the deployment history that show a phase: the proof, derived, never listed by hand. */
export function phaseProofs(phase: PatternId): Release[] {
  return releases.filter((r) => r.patterns.includes(phase));
}
