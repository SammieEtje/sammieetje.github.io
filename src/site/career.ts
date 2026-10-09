// 003:T004 Career as releases, newest first; source: the approved public LinkedIn experience text (003:FR-001)
import type { Locale } from '../i18n/ui.ts';
import type { PatternId } from './patterns.ts';
import type { YearMonth } from './period.ts';

type Text = Record<Locale, string>;

export interface ReleaseNotes {
  context: string;
  approach: string;
  result: string;
}

export interface Release {
  id: string;
  kind: 'role' | 'education';
  org: Text;
  location: string;
  start: YearMonth;
  end: YearMonth | null;
  title: Text;
  summary: Text;
  notes?: Record<Locale, ReleaseNotes>;
  patterns: PatternId[];
}

const same = (value: string): Text => ({ en: value, nl: value });

export const releases: readonly Release[] = [
  {
    id: 'tennet-dap',
    kind: 'role',
    org: same('TenneT'),
    location: 'Arnhem',
    start: '2026-05',
    end: null,
    title: same('Manager Data & Analytics Platform'),
    summary: {
      en: "Leading the team behind TenneT's Data & Analytics Platform: data and AI for the energy transition, with the least possible friction.",
      nl: 'Leiding aan het team achter het Data & Analytics Platform van TenneT: data en AI voor de energietransitie, met zo min mogelijk frictie.',
    },
    notes: {
      en: {
        context:
          'The energy transition makes data, analytics and AI pivotal for a grid operator. Teams across TenneT need a platform they can trust and use without waiting.',
        approach:
          'Run the platform as a product: self-service by default, security and compliance built in, and a team that works close to its users. First: a stable team and clear ownership.',
        result: 'In progress. This release is still being written.',
      },
      nl: {
        context:
          'De energietransitie maakt data, analytics en AI cruciaal voor een netbeheerder. Teams binnen TenneT hebben een platform nodig waarop ze kunnen vertrouwen en dat ze zonder wachten kunnen gebruiken.',
        approach:
          'Het platform runnen als product: standaard zelfbediening, security en compliance ingebouwd, en een team dat dicht bij zijn gebruikers werkt. Eerst: een stabiel team en helder eigenaarschap.',
        result: 'Loopt nog. Aan deze release wordt nog geschreven.',
      },
    },
    patterns: ['environment', 'community'],
  },
  {
    id: 'tennet-iic',
    kind: 'role',
    org: same('TenneT'),
    location: 'Arnhem',
    start: '2023-05',
    end: '2026-04',
    title: {
      en: 'Manager Infrastructure, Integration & Cloud',
      nl: 'Manager Infrastructuur, Integratie & Cloud',
    },
    summary: {
      en: 'Turned a traditional IT operations department of 130+ professionals into a platform organisation: 2.5× service volume with minimal team growth.',
      nl: 'Maakte van een traditionele IT-beheerafdeling met ruim 130 professionals een platformorganisatie: 2,5× dienstvolume met minimale teamgroei.',
    },
    notes: {
      en: {
        context:
          "The energy transition changes how power grids operate. Volatile production and consumption demand software and data capabilities that TenneT's IT organisation was not built for.",
        approach:
          'Stabilise and consolidate first: bring historically separate teams together and harmonise their processes. Then shift to platform thinking: self-service, automation-first delivery, and compliance built into the platform rather than layered on top.',
        result:
          'Service volume scaled 2.5× with minimal team growth, developer autonomy increased measurably, and teams improve their own ways of working instead of waiting for direction from the top.',
      },
      nl: {
        context:
          'De energietransitie verandert hoe elektriciteitsnetten werken. Volatiele productie en consumptie vragen om software- en datacapaciteiten waarvoor de IT-organisatie van TenneT niet was ingericht.',
        approach:
          'Eerst stabiliseren en consolideren: historisch gescheiden teams samenbrengen en hun processen harmoniseren. Daarna de stap naar platformdenken: zelfbediening, automation-first en compliance ingebouwd in het platform in plaats van eroverheen.',
        result:
          'Het dienstvolume groeide 2,5× met minimale teamgroei, de autonomie van ontwikkelteams nam aantoonbaar toe, en teams verbeteren hun eigen manier van werken in plaats van te wachten op sturing van bovenaf.',
      },
    },
    patterns: ['consolidate', 'stabilise', 'environment'],
  },
  {
    id: 'tennet-lis',
    kind: 'role',
    org: same('TenneT'),
    location: 'Arnhem',
    start: '2022-01',
    end: '2023-04',
    title: same('Lead Infrastructure Services'),
    summary: {
      en: 'Directed four infrastructure teams (60 professionals) from reactive service delivery to teams that own their improvement.',
      nl: 'Gaf leiding aan vier infrastructuurteams (60 professionals): van reactieve dienstverlening naar teams die hun eigen verbetering bezitten.',
    },
    notes: {
      en: {
        context:
          'Four teams with 60 professionals covering networking, virtualisation, Linux and Windows services.',
        approach:
          'Introduced collaborative portfolio management, so teams could see and influence priorities across the department.',
        result:
          'A shift from reactive service delivery to a model in which teams take ownership of their own improvement.',
      },
      nl: {
        context: 'Vier teams met 60 professionals voor netwerk, virtualisatie, Linux en Windows.',
        approach:
          'Gezamenlijk portfoliomanagement ingevoerd, zodat teams prioriteiten in de hele afdeling konden zien en beïnvloeden.',
        result:
          'Een verschuiving van reactieve dienstverlening naar een model waarin teams eigenaar zijn van hun eigen verbetering.',
      },
    },
    patterns: ['consolidate', 'stabilise'],
  },
  {
    id: 'tennet-lps',
    kind: 'role',
    org: same('TenneT'),
    location: 'Arnhem',
    start: '2020-09',
    end: '2022-01',
    title: same('Lead Platform Services'),
    summary: {
      en: 'My entry into TenneT: accountable for the self-hosted platforms behind software delivery, and the first case for platforms as products.',
      nl: 'Mijn start bij TenneT: verantwoordelijk voor de zelf gehoste platformen achter softwarelevering, en de eerste business case voor platformen als product.',
    },
    notes: {
      en: {
        context:
          'Seven teams running all self-hosted middleware platforms that enable software delivery: CI/CD, monitoring, integration and service mesh.',
        approach:
          'Built the case for treating platform services as products with real users, rather than cost centres to be minimised.',
        result: 'The groundwork for everything that followed at TenneT.',
      },
      nl: {
        context:
          'Zeven teams die alle zelf gehoste middlewareplatformen voor softwarelevering beheerden: CI/CD, monitoring, integratie en service mesh.',
        approach:
          'De business case gebouwd om platformdiensten te behandelen als producten met echte gebruikers, in plaats van als kostenposten die zo klein mogelijk moeten.',
        result: 'Het fundament voor alles wat daarna bij TenneT volgde.',
      },
    },
    patterns: ['environment'],
  },
  {
    id: 'rabo-da',
    kind: 'role',
    org: same('Rabobank'),
    location: 'Utrecht',
    start: '2016-10',
    end: '2020-08',
    title: same('Manager Development Automation'),
    summary: {
      en: "Founded and scaled the department behind Rabobank's CI/CD platform: 10,000 voluntary users in an IT organisation of 7,600, without a mandate.",
      nl: 'Richtte de afdeling achter het CI/CD-platform van Rabobank op en bouwde die uit: 10.000 vrijwillige gebruikers in een IT-organisatie van 7.600, zonder mandaat.',
    },
    notes: {
      en: {
        context:
          'Regulators demanded tighter controls after the financial crisis, while fintech competitors forced rapid digitalisation. DevOps was critical, but adoption could not be mandated across 400+ systems teams.',
        approach:
          'Built the CI/CD platform with 40 professionals in five scrum teams and drove adoption through environment design: self-service tooling, community support and visible value on the desired path; compliance burden and no support off it. Automation events, lean coffees and inner source; no forced training.',
        result:
          '10,000 users, and business teams joined without being asked. 85% of systems teams delivered features within one week. A real-time, data-driven compliance model strengthened security while reducing manual audit work. The community still runs today.',
      },
      nl: {
        context:
          'Toezichthouders eisten na de financiële crisis strengere beheersing, terwijl fintech-concurrenten snelle digitalisering afdwongen. DevOps was essentieel, maar adoptie viel niet af te dwingen bij meer dan 400 systeemteams.',
        approach:
          'Het CI/CD-platform gebouwd met 40 professionals in vijf scrumteams en adoptie gestuurd via omgevingsontwerp: zelfbediening, community-ondersteuning en zichtbare meerwaarde op de gewenste route; compliancelast en geen ondersteuning daarbuiten. Automation-events, lean coffees en inner source; geen verplichte trainingen.',
        result:
          '10.000 gebruikers, en businessteams sloten zich aan zonder dat het ze gevraagd werd. 85% van de systeemteams leverde features binnen een week. Een realtime, datagedreven compliancemodel versterkte de security en verminderde handmatig auditwerk. De community draait nog steeds.',
      },
    },
    patterns: ['environment', 'community'],
  },
  {
    id: 'rabo-linux',
    kind: 'role',
    org: same('Rabobank'),
    location: 'Utrecht',
    start: '2011-10',
    end: '2016-10',
    title: same('Manager Unix/Linux'),
    summary: {
      en: 'Took over a Linux team in crisis and delivered 5× infrastructure growth with a 15% smaller team.',
      nl: 'Nam een Linux-team in crisis over en leverde 5× infrastructuurgroei met een 15% kleiner team.',
    },
    notes: {
      en: {
        context:
          'Infrastructure growth from 500 to 2,500 nodes was outpacing the team: costs were climbing, stability was suffering and the team was reactive.',
        approach:
          'Not more people, but a different way of working: standardised processes, automated deployment and configuration, and self-service so users could provision what they needed without waiting in a queue.',
        result:
          '5× growth delivered with a 15% smaller team. Stability improved, costs stayed flat, and the team moved from firefighting to building capability.',
      },
      nl: {
        context:
          'De infrastructuur groeide van 500 naar 2.500 nodes, sneller dan het team aankon: de kosten stegen, de stabiliteit leed eronder en het team was reactief.',
        approach:
          'Niet meer mensen, maar een andere manier van werken: gestandaardiseerde processen, geautomatiseerde deployment en configuratie, en zelfbediening zodat gebruikers zonder wachtrij konden regelen wat ze nodig hadden.',
        result:
          '5× groei met een 15% kleiner team. De stabiliteit verbeterde, de kosten bleven gelijk en het team ging van brandjes blussen naar capaciteit bouwen.',
      },
    },
    patterns: ['stabilise', 'environment'],
  },
  {
    id: 'rabo-lan',
    kind: 'role',
    org: same('Rabobank'),
    location: 'Utrecht',
    start: '2010-03',
    end: '2011-10',
    title: same('Manager Campus LAN'),
    summary: {
      en: 'LAN, WiFi and WAN for 950 offices and 1,100 ATMs: operational control first, then improvement.',
      nl: 'LAN, wifi en WAN voor 950 kantoren en 1.100 geldautomaten: eerst grip op de operatie, dan verbeteren.',
    },
    notes: {
      en: {
        context:
          'An inherited team responsible for managed LAN, WiFi and WAN services across 950 office locations and 1,100 ATMs.',
        approach:
          'Started with the basics: proper incident, problem and change management to bring operational chaos under control. Once the team felt in control of its daily work, there was room to improve.',
        result:
          'Hardware costs down 50% through strategic procurement, and the consolidation from 1,000 to fewer than 500 locations supported without service degradation.',
      },
      nl: {
        context:
          'Een overgenomen team, verantwoordelijk voor managed LAN, wifi en WAN op 950 kantoorlocaties en 1.100 geldautomaten.',
        approach:
          'Begonnen bij de basis: goed incident-, probleem- en changemanagement om de operationele chaos onder controle te krijgen. Toen het team grip had op het dagelijkse werk, ontstond ruimte om te verbeteren.',
        result:
          'Hardwarekosten 50% lager door strategische inkoop, en de consolidatie van 1.000 naar minder dan 500 locaties ondersteund zonder verlies van dienstverlening.',
      },
    },
    patterns: ['stabilise', 'consolidate'],
  },
  {
    id: 'rabo-early',
    kind: 'role',
    org: same('Rabobank'),
    location: 'Utrecht',
    start: '2007-02',
    end: '2010-03',
    title: {
      en: 'ORMIT management trainee and IT Customer Services',
      nl: 'ORMIT-managementtrainee en IT Customer Services',
    },
    summary: {
      en: 'Entered Rabobank through the ORMIT management development programme, then joined the IT Customer Services management team.',
      nl: 'Begon bij Rabobank via het ORMIT-managementontwikkelprogramma en trad daarna toe tot het managementteam van IT Customer Services.',
    },
    notes: {
      en: {
        context:
          'Rotations in business–IT alignment, business continuity management and department management, followed by a seat on the IT Customer Services management team.',
        approach:
          'A close look at how a large regulated organisation actually works: the politics, the governance layers, the gap between strategy and execution.',
        result:
          'The understanding of regulated organisations that shapes how I approach transformation today.',
      },
      nl: {
        context:
          'Rotaties in business-IT-alignment, business continuity management en afdelingsmanagement, gevolgd door een plek in het managementteam van IT Customer Services.',
        approach:
          'Van dichtbij zien hoe een grote gereguleerde organisatie echt werkt: de politiek, de governance-lagen, de kloof tussen strategie en uitvoering.',
        result:
          'Het begrip van gereguleerde organisaties dat bepaalt hoe ik transformaties vandaag aanpak.',
      },
    },
    patterns: ['consolidate'],
  },
  {
    id: 'nocnsf',
    kind: 'role',
    org: same('NOC*NSF'),
    location: 'Arnhem',
    start: '2000-05',
    end: '2007-01',
    title: {
      en: 'Policy officer and knowledge management advisor',
      nl: 'Beleidsmedewerker en adviseur kennismanagement',
    },
    summary: {
      en: 'Elite sport policy and knowledge management for the Dutch Olympic Committee: where "change the environment to change behaviour" began.',
      nl: 'Topsportbeleid en kennismanagement voor NOC*NSF: hier begon "verander de omgeving om gedrag te veranderen".',
    },
    notes: {
      en: {
        context:
          'Supporting elite sport policy, and later information and knowledge management, for the Dutch Olympic Committee.',
        approach:
          "Moved a key subsidy process from paper to fully online, and built a BI solution to analyse the international medal chances of Dutch athletes. My thesis applied the ASE model (Fishbein & Ajzen) to how far elite athletes' behaviour can be influenced.",
        result:
          'Leadership gained data-driven insight into where to invest, and I gained the idea behind everything since: if you want to change behaviour, change the environment.',
      },
      nl: {
        context:
          'Ondersteuning van het topsportbeleid, en later informatie- en kennismanagement, voor NOC*NSF.',
        approach:
          'Een belangrijk subsidieproces van papier naar volledig online gebracht, en een BI-oplossing gebouwd om de internationale medaillekansen van Nederlandse sporters te analyseren. Mijn afstudeeronderzoek paste het ASE-model (Fishbein & Ajzen) toe op de beïnvloedbaarheid van gedrag van topsporters.',
        result:
          'De directie kreeg datagedreven inzicht in waar te investeren, en ik het idee achter alles wat volgde: wil je gedrag veranderen, verander dan de omgeving.',
      },
    },
    patterns: ['environment'],
  },
  {
    id: 'utwente',
    kind: 'education',
    org: { en: 'University of Twente', nl: 'Universiteit Twente' },
    location: 'Enschede',
    start: '1993',
    end: '2000',
    title: {
      en: 'Doctorandus (MSc), Public Governance',
      nl: 'Doctorandus Bestuurskunde',
    },
    summary: {
      en: 'Public governance: how organisations, policy and people interact.',
      nl: 'Bestuurskunde: hoe organisaties, beleid en mensen op elkaar inwerken.',
    },
    patterns: [],
  },
];
