import { describe, it, expect } from 'vitest';
import {
  buildDependencyGraph,
  detectModuleClusters,
  calculateFragmentation,
} from '../index';

describe('fragmentation coupling discount', () => {
  it('does not apply discount when files have no shared imports', async () => {
    const files = [
      {
        file: 'src/billing/a.ts',
        content: `export const getBillingA = 1;`,
      },
      {
        file: 'src/api/billing/b.ts',
        content: `export const getBillingB = 2;`,
      },
      {
        file: 'lib/billing/c.ts',
        content: `export const getBillingC = 3;`,
      },
    ];

    const graph = await buildDependencyGraph(files);
    const clusters = detectModuleClusters(graph);
    const cluster = clusters.find((c) => c.domain === 'billing');
    expect(cluster).toBeDefined();

    const base = calculateFragmentation(
      files.map((f) => f.file),
      'billing'
    );
    // Adjusted fragmentation includes classification multiplier (0.3 for COHESIVE_MODULE)
    const expected = base * 0.3;

    // Allow small FP tolerance
    expect(cluster!.fragmentationScore).toBeCloseTo(expected, 6);
  });

  it('applies up-to-20% discount when files share identical imports', async () => {
    const files = [
      {
        file: 'src/billing/a.ts',
        content: `import { shared } from 'shared/module';\nexport const getBillingA = 1;`,
      },
      {
        file: 'src/api/billing/b.ts',
        content: `import { shared } from 'shared/module';\nexport const getBillingB = 2;`,
      },
      {
        file: 'lib/billing/c.ts',
        content: `import { shared } from 'shared/module';\nexport const getBillingC = 3;`,
      },
    ];

    const graph = await buildDependencyGraph(files);
    const clusters = detectModuleClusters(graph);
    const cluster = clusters.find((c) => c.domain === 'billing');
    expect(cluster).toBeDefined();

    const base = calculateFragmentation(
      files.map((f) => f.file),
      'billing'
    );
    const expected = base * 0.8 * 0.3; // full cohesion => 20% discount AND 0.3 classification multiplier

    // Allow small FP tolerance
    expect(cluster!.fragmentationScore).toBeCloseTo(expected, 6);
  });
});
