// 016:T011 Records are kept for two years from their deploy, and no longer (016:FR-007)
import { describe, expect, it } from 'vitest';
import { expired } from '../../scripts/evidence.ts';

const release = (tag: string, publishedAt: string, commit = 'a'.repeat(40)) => ({
  tag,
  publishedAt,
  commit,
});

describe('expired', () => {
  const now = new Date('2028-10-26T05:41:00Z');

  it('keeps a record that is exactly two years old and removes one a day older', () => {
    expect(
      expired(
        [
          release('evidence/2026-10-26-2', '2026-10-26T05:41:00Z'),
          release('evidence/2026-10-25-1', '2026-10-25T05:41:00Z'),
        ],
        now,
      ).map((r) => r.tag),
    ).toEqual(['evidence/2026-10-25-1']);
  });

  it('never returns a release outside evidence/', () => {
    expect(expired([release('v1.0.0', '2020-01-01T00:00:00Z')], now)).toEqual([]);
  });

  it('returns the oldest first, with tag, deploy date and commit', () => {
    const result = expired(
      [
        release('evidence/2025-06-01-2', '2025-06-01T00:00:00Z', 'b'.repeat(40)),
        release('evidence/2025-01-01-1', '2025-01-01T00:00:00Z', 'c'.repeat(40)),
      ],
      now,
    );
    expect(result).toEqual([
      release('evidence/2025-01-01-1', '2025-01-01T00:00:00Z', 'c'.repeat(40)),
      release('evidence/2025-06-01-2', '2025-06-01T00:00:00Z', 'b'.repeat(40)),
    ]);
  });

  it('lets a leap-day record expire after 1 March two years on', () => {
    const leap = [release('evidence/2028-02-29-1', '2028-02-29T12:00:00Z')];
    expect(expired(leap, new Date('2030-02-28T23:59:59Z'))).toEqual([]);
    expect(expired(leap, new Date('2030-03-01T12:00:01Z'))).toHaveLength(1);
  });
});
