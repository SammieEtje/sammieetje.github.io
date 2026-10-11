// 012:T001 The house style as rules: the patterns that make copy read as machine-written (012:FR-001, 012:FR-006)
import { describe, expect, it } from 'vitest';
import { styleViolations } from '../../src/site/style-rules.ts';

const en = (text: string) => styleViolations(text, 'en');
const nl = (text: string) => styleViolations(text, 'nl');

describe('styleViolations()', () => {
  it('flags the em dash in both languages, never the en dash of a range', () => {
    expect(en('I build it — together.')).toContain('em-dash');
    expect(nl('Ik bouw het — samen.')).toContain('em-dash');
    expect(en('Rabobank · 2016–2020')).toEqual([]);
  });

  it('flags forbidden words and expressions', () => {
    expect(en('Data is pivotal for a grid operator.')).toContain('word:pivotal');
    expect(en('A data-driven compliance model.')).toContain('word:data-driven');
    expect(en('DevOps was essential.')).toContain('word:essential');
    expect(en('We ensure quality.')).toContain('word:ensure');
    expect(en('In order to grow, we automated.')).toContain('word:in order to');
    expect(nl('Data is cruciaal voor een netbeheerder.')).toContain('word:cruciaal');
    expect(nl('DevOps was essentieel.')).toContain('word:essentieel');
    expect(nl('Een datagedreven model.')).toContain('word:datagedreven');
  });

  it('flags "not X, but Y"', () => {
    expect(en('Not more people, but a different way of working.')).toContain('contrast:not-but');
    expect(en('Teams choose the platform not despite compliance, but because of it.')).toContain(
      'contrast:not-but',
    );
    expect(nl('Niet meer mensen, maar een andere manier van werken.')).toContain(
      'contrast:not-but',
    );
  });

  it('flags a trailing "…, not Y."', () => {
    expect(
      en('When people take shortcuts, it is a design problem, not a people problem.'),
    ).toContain('contrast:trailing-not');
    expect(en('Compliance as an accelerator, not a brake.')).toContain('contrast:trailing-not');
    expect(nl('Het is een ontwerpprobleem, geen mensenprobleem.')).toContain(
      'contrast:trailing-not',
    );
    expect(nl('Compliance als versneller, niet als rem.')).toContain('contrast:trailing-not');
  });

  it('flags a leading "Not X, Y" and "X, not Y." as the first words', () => {
    expect(en('Not a judgement, a design constraint.')).toContain('contrast:leading-not');
    expect(en('Context, not instructions.')).toContain('contrast:trailing-not');
    expect(nl('Geen oordeel, een ontwerpvoorwaarde.')).toContain('contrast:leading-not');
    expect(nl('Context, geen instructies.')).toContain('contrast:trailing-not');
  });

  it('flags "is not X; it is Y"', () => {
    expect(en('That is not unwillingness; it is how the brain saves energy.')).toContain(
      'contrast:is-not-it-is',
    );
    expect(en("It isn't about speed, it's about precision.")).toContain('contrast:is-not-it-is');
    expect(en("It's not speed, it's precision.")).toContain('contrast:is-not-it-is');
    expect(en('They’re not users, they’re customers.')).toContain('contrast:is-not-it-is');
    expect(nl('Dat is geen onwil; zo bespaart het brein energie.')).toContain(
      'contrast:is-not-it-is',
    );
  });

  it('flags the elliptical setup', () => {
    expect(en('The best part? You do nothing.')).toContain('setup:elliptical');
    expect(nl('Het mooiste? Je doet niets.')).toContain('setup:elliptical');
  });

  it('leaves ordinary negations and questions alone', () => {
    for (const text of [
      'This page does not exist.',
      "If I can't share something, I'll say that I can't.",
      "I don't expect replies in the evening or at weekends, and I try not to send messages then either.",
      'Urgent? Call me.',
      'Want to work together?',
      'Nothing is typed in by hand.',
    ]) {
      expect(en(text), text).toEqual([]);
    }
    for (const text of [
      'Het zijn geen metingen.',
      'Als ik iets niet kan delen, zeg ik dat ik het niet kan delen.',
      'Dit adres bestaat niet (meer).',
      'Dringend? Bel me.',
    ]) {
      expect(nl(text), text).toEqual([]);
    }
  });
});
