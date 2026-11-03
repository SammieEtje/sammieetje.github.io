// 016 fix: GitHub writes the release attestation shortly after publishing, so verification waits for it
import { describe, expect, it } from 'vitest';
import { retry } from '../../scripts/evidence.ts';

describe('retry', () => {
  it('returns as soon as an attempt succeeds, waiting between attempts', async () => {
    const waits: number[] = [];
    let calls = 0;
    const result = await retry(
      () => {
        calls += 1;
        if (calls < 3) throw new Error('no attestations for tag');
        return 'verified';
      },
      { attempts: 6, delayMs: 10_000, sleep: async (ms) => void waits.push(ms) },
    );
    expect(result).toBe('verified');
    expect(calls).toBe(3);
    expect(waits).toEqual([10_000, 10_000]);
  });

  it('gives up after the last attempt with the last error', async () => {
    let calls = 0;
    await expect(
      retry(
        () => {
          calls += 1;
          throw new Error(`attempt ${calls}`);
        },
        { attempts: 4, delayMs: 1, sleep: async () => undefined },
      ),
    ).rejects.toThrow('attempt 4');
    expect(calls).toBe(4);
  });
});
