import { describe, expect, it } from 'vitest';
import { countIssues } from '../report';

describe('report utils fallback scoring', () => {
  it('should derive a non-zero fallback score for large issue counts when scoring is missing', () => {
    const result = {
      summary: {
        totalIssues: 0,
        toolsRun: [],
        executionTime: 0,
      },
      patterns: [
        {
          fileName: 'a.ts',
          issues: [
            ...Array.from({ length: 3 }, (_, i) => ({
              severity: 'critical' as const,
              message: `critical-${i}`,
              location: { file: 'a.ts' },
            })),
            ...Array.from({ length: 361 }, (_, i) => ({
              severity: 'major' as const,
              message: `major-${i}`,
              location: { file: 'a.ts' },
            })),
            ...Array.from({ length: 549 }, (_, i) => ({
              severity: 'minor' as const,
              message: `minor-${i}`,
              location: { file: 'a.ts' },
            })),
            ...Array.from({ length: 2054 }, (_, i) => ({
              severity: 'info' as const,
              message: `info-${i}`,
              location: { file: 'a.ts' },
            })),
          ],
        },
      ],
    };

    const counts = countIssues(result as any);

    expect(counts.critical).toBe(3);
    expect(counts.major).toBe(361);
    expect(counts.minor).toBe(549);
    expect(counts.info).toBe(2054);
    expect(counts.score).toBeGreaterThan(0);
  });

  it('should keep perfect fallback score when there are no issues', () => {
    const result = {
      summary: {
        totalIssues: 0,
        toolsRun: [],
        executionTime: 0,
      },
      patterns: [],
      context: [],
    };

    const counts = countIssues(result as any);

    expect(counts.total).toBe(0);
    expect(counts.score).toBe(100);
    expect(counts.rating).toBe('Excellent');
  });
});
