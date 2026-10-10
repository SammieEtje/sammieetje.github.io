// 005:T002 Manager README as API documentation (005:FR-002 – 005:FR-007, 005:FR-011)
// Source rule (005:FR-006): clarified answers (2026-10-10) and Sander's published principles only.
import type { Locale } from '../i18n/ui.ts';

type Text = Record<Locale, string>;

export const readmeMeta: { updated: string; intro: Text } = {
  updated: '2026-10-10',
  intro: {
    en: "If you're thinking about working with me, this is the documentation I wish every manager published: what I value, what you can expect, how to reach me and where my known issues are. Like any API, it's versioned; tell me when it's out of date.",
    nl: 'Denk je erover om met mij te werken? Dit is de documentatie die ik elke manager zou gunnen: wat ik belangrijk vind, wat je kunt verwachten, hoe je me bereikt en waar mijn bekende problemen zitten. Zoals elke API heeft deze een versie; zeg het als hij verouderd is.',
  },
};

export interface Endpoint {
  id: string;
  method: 'GET' | 'POST' | 'PUT';
  path: string;
  title: Text;
  items: Text[];
}

export const endpoints: readonly Endpoint[] = [
  {
    id: 'values',
    method: 'GET',
    path: '/values',
    title: { en: 'What I value', nl: 'Wat ik belangrijk vind' },
    items: [
      {
        en: 'Trust by default. I assume you are a skilled engineer with good intentions.',
        nl: 'Standaard vertrouwen. Ik ga ervan uit dat je een vakbekwame engineer bent met goede bedoelingen.',
      },
      {
        en: 'The right thing should be the easy thing: for the people who use what we build, and for us.',
        nl: 'Het juiste moet het makkelijkste zijn: voor de mensen die gebruiken wat wij bouwen, en voor onszelf.',
      },
      {
        en: 'Learning over blaming. A mistake is information about the environment, not a verdict on a person.',
        nl: 'Leren boven schuld. Een fout zegt iets over de omgeving, niet over een persoon.',
      },
      {
        en: 'Build things that outlast us. A good team, platform or community keeps running when the people who started it move on.',
        nl: 'Bouw dingen die ons overleven. Een goed team, platform of community draait door als de mensen die ermee begonnen verder gaan.',
      },
    ],
  },
  {
    id: 'expect-me',
    method: 'GET',
    path: '/expectations/me',
    title: { en: 'What you can expect from me', nl: 'Wat je van mij kunt verwachten' },
    items: [
      {
        en: 'Context, not instructions. I give you the why and the boundaries; you decide the how.',
        nl: 'Context, geen instructies. Ik geef je het waarom en de kaders; jij bepaalt het hoe.',
      },
      {
        en: "I remove what's in the way: staffing, priorities, politics, and blockers you can't fix yourself.",
        nl: 'Ik haal weg wat in de weg zit: bezetting, prioriteiten, politiek en blokkades die je zelf niet kunt oplossen.',
      },
      {
        en: "Fair treatment and transparent decisions. If I can't share something, I'll say that I can't.",
        nl: 'Eerlijke behandeling en transparante besluiten. Als ik iets niet kan delen, zeg ik dat ik het niet kan delen.',
      },
    ],
  },
  {
    id: 'expect-you',
    method: 'GET',
    path: '/expectations/you',
    title: { en: 'What I expect from you', nl: 'Wat ik van jou verwacht' },
    items: [
      {
        en: 'Own the outcome for your users, not just the ticket. When the systemic fix matters more than the individual problem, choose the fix.',
        nl: 'Wees eigenaar van de uitkomst voor je gebruikers, niet alleen van het ticket. Als de structurele oplossing belangrijker is dan het losse probleem, kies dan die oplossing.',
      },
      {
        en: 'Make it visible. Share what you learn and what went wrong, early. Bad news fast is good news.',
        nl: 'Maak het zichtbaar. Deel wat je leert en wat er misging, en doe dat vroeg. Slecht nieuws dat snel komt, is goed nieuws.',
      },
      {
        en: 'Build for others: docs, golden paths, self-service. Your impact is what others can do because of you.',
        nl: 'Bouw voor anderen: documentatie, golden paths, zelfbediening. Jouw impact is wat anderen dankzij jou kunnen.',
      },
      {
        en: "Challenge me. Disagree with arguments; I'd rather be convinced than obeyed.",
        nl: 'Daag me uit. Spreek me tegen met argumenten; ik word liever overtuigd dan gehoorzaamd.',
      },
    ],
  },
  {
    id: 'one-on-ones',
    method: 'POST',
    path: '/one-on-ones',
    title: { en: 'One-on-ones', nl: 'Een-op-eengesprekken' },
    items: [
      {
        en: 'Monthly, one hour, structured, so the time goes to what matters to you and not to catching up.',
        nl: 'Maandelijks, een uur, gestructureerd, zodat de tijd naar jouw onderwerpen gaat en niet naar bijpraten.',
      },
      {
        en: "Ad hoc whenever either of us needs it. You don't have to wait for the next slot.",
        nl: 'Tussendoor wanneer een van ons het nodig heeft. Je hoeft niet op het volgende moment te wachten.',
      },
    ],
  },
  {
    id: 'contact',
    method: 'GET',
    path: '/contact',
    title: {
      en: 'Communication and response times',
      nl: 'Communicatie en reactietijden',
    },
    items: [
      {
        en: 'Chat for anything; I reply the same working day.',
        nl: 'Chat voor alles; ik reageer dezelfde werkdag.',
      },
      { en: 'Urgent? Call me.', nl: 'Dringend? Bel me.' },
      {
        en: "Rate limit: I don't expect replies in the evening or at weekends, and I try not to send messages then either.",
        nl: "Rate limit: ik verwacht geen reacties 's avonds of in het weekend, en ik probeer dan zelf ook geen berichten te sturen.",
      },
    ],
  },
  {
    id: 'feedback',
    method: 'POST',
    path: '/feedback',
    title: { en: 'Feedback', nl: 'Feedback' },
    items: [
      {
        en: 'Anytime, anywhere, including in the team if it helps everyone learn.',
        nl: 'Altijd en overal, ook in het team als iedereen ervan leert.',
      },
      {
        en: "That's how I give it too: praise in public, correction in private when it's personal.",
        nl: 'Zo geef ik het zelf ook: complimenten in het openbaar, correctie onder vier ogen als het persoonlijk is.',
      },
    ],
  },
  {
    id: 'errors',
    method: 'GET',
    path: '/errors',
    title: { en: 'How I handle mistakes', nl: 'Hoe ik met fouten omga' },
    items: [
      {
        en: 'When something goes wrong, tell me early. I will not ask who did it; I will ask what made it possible, and we change that together.',
        nl: 'Als er iets misgaat, vertel het me vroeg. Ik vraag niet wie het deed; ik vraag wat het mogelijk maakte, en dat veranderen we samen.',
      },
      {
        en: 'Room to fail safely is one of the assumptions behind everything I build.',
        nl: 'Ruimte om veilig te falen is een van de aannames onder alles wat ik bouw.',
      },
    ],
  },
  {
    id: 'known-issues',
    method: 'GET',
    path: '/known-issues',
    title: { en: 'Known issues', nl: 'Bekende problemen' },
    items: [
      {
        en: 'No release ships without known issues. These are mine, with workarounds.',
        nl: 'Geen release zonder bekende problemen. Dit zijn de mijne, met workarounds.',
      },
    ],
  },
];

export interface KnownIssue {
  description: Text;
  workaround: Text;
}

export const knownIssues: readonly KnownIssue[] = [
  {
    description: {
      en: "I'm direct and can come across as blunt.",
      nl: 'Ik ben direct en kan bot overkomen.',
    },
    workaround: {
      en: "Tell me when it lands wrong; I'd rather know.",
      nl: 'Zeg het als het verkeerd valt; ik weet het liever.',
    },
  },
  {
    description: {
      en: 'I get impatient with process that no longer serves a purpose.',
      nl: 'Ik word ongeduldig van processen die geen doel meer dienen.',
    },
    workaround: {
      en: "Show me the purpose, and I'm on board.",
      nl: 'Laat me het doel zien, en ik doe mee.',
    },
  },
];

export interface Testimonial {
  quote: string;
  author: string;
  role: Text;
  url: string;
}

export const testimonial: Testimonial = {
  quote:
    'I always felt Sander could be the Satoru Iwata of DevOps. Like Iwata understood gamers as the Nintendo CEO, Sander has a complete understanding of the needs of developers and how to build an organisation around these needs so his teams can grow.',
  author: 'Chris Stapper',
  role: {
    en: 'community manager in my team at Rabobank, LinkedIn recommendation',
    nl: 'communitymanager in mijn team bij Rabobank, LinkedIn-aanbeveling',
  },
  url: 'https://www.linkedin.com/in/chrisstapper',
};
