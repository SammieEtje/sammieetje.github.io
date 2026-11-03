// 012:T002 Phrases that stay word for word through any rewrite (012:FR-004)
import { describe, expect, it } from 'vitest';
import { ui } from '../../src/i18n/ui.ts';
import { articles } from '../../src/site/articles.ts';
import { assumptions, premise } from '../../src/site/method.ts';
import { testimonial } from '../../src/site/readme.ts';

describe('protected copy', () => {
  it('keeps the core message', () => {
    expect(ui.en['profile.headline']).toContain('People take the path of least resistance.');
    expect(ui.en['profile.headline']).toContain('the right thing is the easy thing');
    expect(ui.nl['profile.headline']).toContain('Mensen kiezen de weg van de minste weerstand.');
    expect(ui.nl['profile.headline']).toContain('het juiste het makkelijkste');
    expect(premise.premise.en).toContain('People take the path of least resistance.');
    expect(premise.premise.nl).toContain('Mensen kiezen de weg van de minste weerstand.');
    expect(premise.principle).toEqual({
      en: 'Make the right thing the easy thing.',
      nl: 'Maak het juiste het makkelijkste.',
    });
  });

  it('keeps the four assumptions as published', () => {
    expect(assumptions.map((a) => a.statement)).toEqual([
      {
        en: 'Our users are skilled engineers with good intentions',
        nl: 'Onze gebruikers zijn vakbekwame engineers met goede bedoelingen',
      },
      { en: 'Learning requires room to fail safely', nl: 'Leren vraagt ruimte om veilig te falen' },
      { en: 'People are inherently lazy', nl: 'Mensen zijn van nature lui' },
      {
        en: 'With great freedom comes great responsibility',
        nl: 'Met grote vrijheid komt grote verantwoordelijkheid',
      },
    ]);
  });

  it("keeps Chris Stapper's words", () => {
    expect(testimonial.quote).toBe(
      'I always felt Sander could be the Satoru Iwata of DevOps. Like Iwata understood gamers as the Nintendo CEO, Sander has a complete understanding of the needs of developers and how to build an organisation around these needs so his teams can grow.',
    );
  });

  it('keeps the published article titles', () => {
    expect(articles.map((a) => a.title)).toEqual([
      'Wat kun je direct laten zien als het misgaat?',
      "Ninety percent of that intake form wasn't a customer question",
      'The developer portal is the surface that observes what engineers actually do on your platform',
      "IT4IT doesn't describe the conversations. That's your job.",
      'Uptime is not a product metric',
      'The platform that teaches by doing.',
      'We shipped the platform. We forgot to build the product',
      'The community that drives change',
      'Why your golden path became a golden cage',
      'People are lazy, engineers are trustworthy, and failure should be free',
      'What elite sports taught me about IT transformation',
    ]);
  });
});
