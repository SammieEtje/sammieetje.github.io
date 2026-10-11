// 004:T002 ASE attribution corrected (004:FR-009)
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
      en: "Leading the team behind TenneT's Data & Analytics Platform, which brings data and AI to the energy transition. The aim is a platform people can use with as little friction as possible.",
      nl: 'Leiding aan het team achter het Data & Analytics Platform van TenneT, dat data en AI levert voor de energietransitie. Het doel is een platform dat mensen met zo min mogelijk frictie kunnen gebruiken.',
    },
    notes: {
      en: {
        context:
          'For a grid operator in the energy transition, data, analytics and AI are becoming central to the work. Teams across TenneT need a platform they can trust and can use without waiting for anyone.',
        approach:
          'Running the platform as a product, with self-service by default, security and compliance built in, and a team that works close to its users. The first step is a stable team with clear ownership.',
        result: 'In progress. This release is still being written.',
      },
      nl: {
        context:
          'Voor een netbeheerder in de energietransitie worden data, analytics en AI steeds centraler. Teams binnen TenneT hebben een platform nodig waarop ze kunnen vertrouwen en dat ze kunnen gebruiken zonder op iemand te wachten.',
        approach:
          'Het platform runnen als product, met standaard zelfbediening, ingebouwde security en compliance, en een team dat dicht bij zijn gebruikers werkt. De eerste stap is een stabiel team met helder eigenaarschap.',
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
      en: 'Turned a traditional IT operations department of 130+ professionals into a platform organisation. Service volume grew 2.5× while the team barely grew.',
      nl: 'Maakte van een traditionele IT-beheerafdeling met ruim 130 professionals een platformorganisatie. Het dienstvolume groeide 2,5×, terwijl het team nauwelijks groeide.',
    },
    notes: {
      en: {
        context:
          "The energy transition changes how power grids operate. Volatile production and consumption demand software and data capabilities that TenneT's IT organisation was not built for.",
        approach:
          'Stabilised and consolidated first, bringing historically separate teams together and harmonising their processes. Then moved to platform thinking, with self-service, automation-first delivery and compliance built into the platform itself.',
        result:
          'Service volume grew 2.5× with hardly any extra people. Developers have measurably more autonomy, and teams now improve their own ways of working without waiting to be told.',
      },
      nl: {
        context:
          'De energietransitie verandert hoe elektriciteitsnetten werken. Volatiele productie en consumptie vragen om software- en datacapaciteiten waarvoor de IT-organisatie van TenneT niet was ingericht.',
        approach:
          'Eerst gestabiliseerd en geconsolideerd, door historisch gescheiden teams samen te brengen en hun processen gelijk te trekken. Daarna de stap naar platformdenken, met zelfbediening, automation-first en compliance die in het platform zelf zit.',
        result:
          'Het dienstvolume groeide 2,5× met nauwelijks extra mensen. Ontwikkelteams hebben aantoonbaar meer autonomie, en teams verbeteren nu hun eigen manier van werken zonder te wachten tot iemand het zegt.',
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
      en: 'Led four infrastructure teams (60 professionals) away from reactive service delivery, towards owning their own improvement.',
      nl: 'Gaf leiding aan vier infrastructuurteams (60 professionals) en bracht ze van reactieve dienstverlening naar eigenaarschap over hun eigen verbetering.',
    },
    notes: {
      en: {
        context:
          'Four teams with 60 professionals covering networking, virtualisation, Linux and Windows services.',
        approach:
          'Introduced collaborative portfolio management, so teams could see and influence priorities across the department.',
        result: 'Teams stopped only reacting to requests and started to own their own improvement.',
      },
      nl: {
        context: 'Vier teams met 60 professionals voor netwerk, virtualisatie, Linux en Windows.',
        approach:
          'Gezamenlijk portfoliomanagement ingevoerd, zodat teams prioriteiten in de hele afdeling konden zien en beïnvloeden.',
        result:
          'Teams reageerden niet langer alleen op verzoeken en werden eigenaar van hun eigen verbetering.',
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
      en: 'My first role at TenneT. I was accountable for the self-hosted platforms behind software delivery and made the first case for running platforms as products.',
      nl: 'Mijn eerste rol bij TenneT. Ik was verantwoordelijk voor de zelf gehoste platformen achter softwarelevering en maakte de eerste business case voor platformen als product.',
    },
    notes: {
      en: {
        context:
          'Seven teams running all self-hosted middleware platforms that enable software delivery: CI/CD, monitoring, integration and service mesh.',
        approach:
          'Built the case for treating platform services as products with real users. Until then they were mostly seen as cost centres to keep as small as possible.',
        result: 'This laid the groundwork for everything that followed at TenneT.',
      },
      nl: {
        context:
          'Zeven teams die alle zelf gehoste middlewareplatformen voor softwarelevering beheerden: CI/CD, monitoring, integratie en service mesh.',
        approach:
          'De business case gebouwd om platformdiensten te behandelen als producten met echte gebruikers. Tot dan toe werden ze vooral gezien als kostenposten die zo klein mogelijk moesten blijven.',
        result: 'Dit legde het fundament voor alles wat daarna bij TenneT volgde.',
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
      en: "Founded and grew the department behind Rabobank's CI/CD platform. It reached 10,000 voluntary users in an IT organisation of 7,600, without a mandate.",
      nl: 'Richtte de afdeling achter het CI/CD-platform van Rabobank op en bouwde die uit. Het platform kreeg 10.000 vrijwillige gebruikers in een IT-organisatie van 7.600, zonder mandaat.',
    },
    notes: {
      en: {
        context:
          'Regulators demanded tighter controls after the financial crisis, while fintech competitors forced rapid digitalisation. DevOps was critical, but adoption could not be mandated across 400+ systems teams.',
        approach:
          'Built the CI/CD platform with 40 professionals in five scrum teams. Adoption came from environment design. On the platform, teams got self-service tooling, community support and value they could see. Off the platform, they carried the compliance burden themselves and got no support. We organised automation events, lean coffees and inner source, and never made training mandatory.',
        result:
          '10,000 users, and business teams joined without being asked. 85% of systems teams delivered features within a week. A real-time compliance model based on data made security stronger and cut manual audit work. The community still runs today.',
      },
      nl: {
        context:
          'Toezichthouders eisten na de financiële crisis strengere beheersing, terwijl fintech-concurrenten snelle digitalisering afdwongen. DevOps was onmisbaar, maar adoptie viel niet af te dwingen bij meer dan 400 systeemteams.',
        approach:
          'Het CI/CD-platform gebouwd met 40 professionals in vijf scrumteams. Adoptie kwam uit omgevingsontwerp. Op het platform kregen teams zelfbediening, steun uit de community en meerwaarde die ze konden zien. Daarbuiten droegen ze zelf de compliancelast en kregen ze geen ondersteuning. We organiseerden automation-events, lean coffees en inner source, en maakten trainingen nooit verplicht.',
        result:
          '10.000 gebruikers, en businessteams sloten zich aan zonder dat iemand het vroeg. 85% van de systeemteams leverde features binnen een week. Een realtime compliancemodel op basis van data maakte de security sterker en verminderde handmatig auditwerk. De community draait nog steeds.',
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
          'We changed how the team worked. Processes were standardised, deployment and configuration were automated, and users got self-service, so they could provision what they needed without waiting in a queue.',
        result:
          'The team handled 5× growth while it shrank by 15%. Stability improved and costs stayed flat. Best of all, the team got out of firefighting mode and started building.',
      },
      nl: {
        context:
          'De infrastructuur groeide van 500 naar 2.500 nodes, sneller dan het team aankon: de kosten stegen, de stabiliteit leed eronder en het team was reactief.',
        approach:
          'We veranderden hoe het team werkte. Processen werden gestandaardiseerd, deployment en configuratie geautomatiseerd, en gebruikers kregen zelfbediening, zodat ze zonder wachtrij konden regelen wat ze nodig hadden.',
        result:
          'Het team verwerkte 5× groei en werd tegelijk 15% kleiner. De stabiliteit verbeterde en de kosten bleven gelijk. Het mooiste: het team kwam uit de brandjes en ging weer bouwen.',
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
      en: 'LAN, WiFi and WAN for 950 offices and 1,100 ATMs. First we got operations under control, then we improved them.',
      nl: 'LAN, wifi en WAN voor 950 kantoren en 1.100 geldautomaten. Eerst kregen we grip op de operatie, daarna konden we verbeteren.',
    },
    notes: {
      en: {
        context:
          'An inherited team responsible for managed LAN, WiFi and WAN services across 950 office locations and 1,100 ATMs.',
        approach:
          'Started with the basics: proper incident, problem and change management to bring operational chaos under control. Once the team felt in control of its daily work, there was room to improve.',
        result:
          'Hardware costs went down 50% through strategic procurement. We also supported the consolidation from 1,000 to fewer than 500 locations without the service getting worse.',
      },
      nl: {
        context:
          'Een overgenomen team, verantwoordelijk voor managed LAN, wifi en WAN op 950 kantoorlocaties en 1.100 geldautomaten.',
        approach:
          'Begonnen bij de basis: goed incident-, probleem- en changemanagement om de operationele chaos onder controle te krijgen. Toen het team grip had op het dagelijkse werk, ontstond ruimte om te verbeteren.',
        result:
          'De hardwarekosten gingen 50% omlaag door strategische inkoop. Ook ondersteunden we de consolidatie van 1.000 naar minder dan 500 locaties zonder dat de dienstverlening eronder leed.',
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
          'I got a close look at how a large regulated organisation really works, including the politics, the layers of governance and the gap between strategy and execution.',
        result:
          'That is where I learned how regulated organisations work, and it still shapes how I approach transformation.',
      },
      nl: {
        context:
          'Rotaties in business-IT-alignment, business continuity management en afdelingsmanagement, gevolgd door een plek in het managementteam van IT Customer Services.',
        approach:
          'Ik zag van dichtbij hoe een grote gereguleerde organisatie echt werkt, met de politiek, de lagen van governance en de kloof tussen strategie en uitvoering.',
        result:
          'Daar leerde ik hoe gereguleerde organisaties werken, en dat bepaalt nog steeds hoe ik transformaties aanpak.',
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
      en: 'Elite sport policy and knowledge management for the Dutch Olympic Committee. This is where the idea of changing the environment to change behaviour started for me.',
      nl: 'Topsportbeleid en kennismanagement voor NOC*NSF. Hier begon voor mij het idee dat je gedrag verandert door de omgeving te veranderen.',
    },
    notes: {
      en: {
        context:
          'Supporting elite sport policy, and later information and knowledge management, for the Dutch Olympic Committee.',
        approach:
          "Moved a key subsidy process from paper to fully online, and built a BI solution to analyse the international medal chances of Dutch athletes. My thesis applied the ASE model (De Vries et al., building on Fishbein & Ajzen) to how far elite athletes' behaviour can be influenced.",
        result:
          'Management could now see in the data where to invest. I came away with the idea behind everything I have done since: if you want to change behaviour, change the environment.',
      },
      nl: {
        context:
          'Ondersteuning van het topsportbeleid, en later informatie- en kennismanagement, voor NOC*NSF.',
        approach:
          'Een belangrijk subsidieproces van papier naar volledig online gebracht, en een BI-oplossing gebouwd om de internationale medaillekansen van Nederlandse sporters te analyseren. Mijn afstudeeronderzoek paste het ASE-model (De Vries e.a., voortbouwend op Fishbein & Ajzen) toe op de beïnvloedbaarheid van gedrag van topsporters.',
        result:
          'De directie kon nu in de data zien waar ze moest investeren. Ik hield er het idee aan over dat achter alles zit wat ik daarna deed: wil je gedrag veranderen, verander dan de omgeving.',
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
