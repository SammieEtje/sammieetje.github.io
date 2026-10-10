// 001:T024 Every built page, for checks that must hold everywhere
export const pages = [
  { path: '/', lang: 'en' },
  { path: '/nl/', lang: 'nl' },
  { path: '/404.html', lang: 'en' },
  // 003:T010 Deployment history joins every shared per-page suite
  { path: '/career/', lang: 'en' },
  { path: '/nl/loopbaan/', lang: 'nl' },
  // 004:T010 Golden paths joins every shared per-page suite
  { path: '/method/', lang: 'en' },
  { path: '/nl/methode/', lang: 'nl' },
  // 005:T007 How I lead joins every shared per-page suite
  { path: '/how-i-lead/', lang: 'en' },
  { path: '/nl/zo-leid-ik/', lang: 'nl' },
  // 006:T005 TechDocs joins every shared per-page suite
  { path: '/writing/', lang: 'en' },
  { path: '/nl/schrijven/', lang: 'nl' },
  // 007:T005 Plugins joins every shared per-page suite
  { path: '/plugins/', lang: 'en' },
  { path: '/nl/projecten/', lang: 'nl' },
  // 008:T005 Playground joins every shared per-page suite
  { path: '/playground/', lang: 'en' },
  { path: '/nl/speeltuin/', lang: 'nl' },
] as const;
