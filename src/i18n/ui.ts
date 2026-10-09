// 001:T011 Typed dictionaries: Dutch is typed against the English keys (001:FR-010)
export const locales = ['en', 'nl'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

const en = {
  'site.name': 'Sander Ettema',
  'site.home': 'Sander Ettema, home',
  'skip.link': 'Skip to content',
  'nav.label': 'Primary',
  'lang.label': 'Language',
  'nav.overview.term': 'Overview',
  'nav.overview.subtitle': 'who I am',
  'page.overview.title': 'Platform transformation in highly regulated contexts',
  'page.overview.description':
    'Sander Ettema builds environments where the right thing is the easy thing: platform transformation in highly regulated contexts.',
  'profile.role': 'Manager Data & Analytics Platform at TenneT',
  'profile.positioning': 'Platform transformation in highly regulated contexts',
  'profile.headline':
    'People take the path of least resistance. I build environments where the right thing is the easy thing — together.',
  'profile.linkedin': 'Connect on LinkedIn',
  'entity.label': 'Catalog entity',
  'entity.kind': 'kind',
  'entity.kind.value': 'leader',
  'entity.lifecycle': 'lifecycle',
  'entity.lifecycle.value': 'production',
  'entity.owner': 'owner',
  'entity.owner.value': 'people & platforms',
  'footer.build': 'Build',
  'footer.source': 'Source',
  'footer.specs': 'Specifications',
  'footer.tagline': 'Built spec-first and shipped through a quality gate.',
  'notfound.title': 'Page not found',
  'notfound.description':
    'This page does not exist. Continue on the English or Dutch home page of Sander Ettema.',
  'notfound.heading': 'Page not found',
  'notfound.body': 'This address does not exist (anymore).',
  'notfound.home': 'Go to the English home page',
} as const;

export type UiKey = keyof typeof en;

const nl: Record<UiKey, string> = {
  'site.name': 'Sander Ettema',
  'site.home': 'Sander Ettema, startpagina',
  'skip.link': 'Naar de inhoud',
  'nav.label': 'Hoofdmenu',
  'lang.label': 'Taal',
  'nav.overview.term': 'Overzicht',
  'nav.overview.subtitle': 'wie ik ben',
  'page.overview.title': 'Platformtransformatie in sterk gereguleerde omgevingen',
  'page.overview.description':
    'Sander Ettema bouwt omgevingen waarin het juiste ook het makkelijkste is: platformtransformatie in sterk gereguleerde omgevingen.',
  'profile.role': 'Manager Data & Analytics Platform bij TenneT',
  'profile.positioning': 'Platformtransformatie in sterk gereguleerde omgevingen',
  'profile.headline':
    'Mensen kiezen de weg van de minste weerstand. Ik bouw omgevingen waarin het juiste het makkelijkste is — samen.',
  'profile.linkedin': 'Verbind op LinkedIn',
  'entity.label': 'Catalogusentiteit',
  'entity.kind': 'soort',
  'entity.kind.value': 'leider',
  'entity.lifecycle': 'levenscyclus',
  'entity.lifecycle.value': 'productie',
  'entity.owner': 'eigenaar',
  'entity.owner.value': 'mensen & platformen',
  'footer.build': 'Build',
  'footer.source': 'Broncode',
  'footer.specs': 'Specificaties',
  'footer.tagline': 'Spec-first gebouwd en uitgerold via een quality gate.',
  'notfound.title': 'Pagina niet gevonden',
  'notfound.description':
    'Deze pagina bestaat niet. Ga verder op de Engelse of Nederlandse startpagina van Sander Ettema.',
  'notfound.heading': 'Pagina niet gevonden',
  'notfound.body': 'Dit adres bestaat niet (meer).',
  'notfound.home': 'Naar de Nederlandse startpagina',
};

export const ui: Record<Locale, Record<UiKey, string>> = { en, nl };
