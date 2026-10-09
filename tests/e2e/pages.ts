// 001:T024 Every built page, for checks that must hold everywhere
export const pages = [
  { path: '/', lang: 'en' },
  { path: '/nl/', lang: 'nl' },
  { path: '/404.html', lang: 'en' },
  // 003:T010 Deployment history joins every shared per-page suite
  { path: '/career/', lang: 'en' },
  { path: '/nl/loopbaan/', lang: 'nl' },
] as const;
