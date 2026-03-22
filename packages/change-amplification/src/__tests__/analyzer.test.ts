import { describe, it, expect, vi } from 'vitest';
import { analyzeChangeAmplification } from '../analyzer';
import * as fs from 'fs';
import { scanFiles, getParser } from '@aiready/core';

vi.mock('fs');
vi.mock('@aiready/core', async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    scanFiles: vi.fn(),
    getParser: vi.fn(),
  };
});

describe('analyzeChangeAmplification reproduction', () => {
  it('should not return 0 if there are some dependencies but not crazy', async () => {
    const files = ['src/a.ts', 'src/b.ts', 'src/c.ts'];
    (scanFiles as any).mockResolvedValue(files);
    (getParser as any).mockResolvedValue({
      initialize: vi.fn().mockResolvedValue(undefined),
      parse: (content: string) => {
        if (content.includes('import b'))
          return { imports: [{ source: './b' }], exports: [] };
        if (content.includes('import c'))
          return { imports: [{ source: './c' }], exports: [] };
        return { imports: [], exports: [] };
      },
      language: 'typescript',
    });

    (fs.readFileSync as any).mockImplementation((file: string) => {
      if (file.endsWith('a.ts')) return 'import b from "./b"';
      if (file.endsWith('b.ts')) return 'import c from "./c"';
      return '';
    });

    const result = await analyzeChangeAmplification({ rootDir: '.' });

    expect(result.summary.score).toBeGreaterThan(0);
  });

  it('should see how it gets to 0', async () => {
    // Creating a highly coupled scenario
    const files = Array.from({ length: 20 }, (_, i) => `src/file${i}.ts`);
    (scanFiles as any).mockResolvedValue(files);
    (getParser as any).mockResolvedValue({
      initialize: vi.fn().mockResolvedValue(undefined),
      parse: () => ({
        exports: [],
        imports: files.map((f) => ({ source: f })), // Everyone imports everyone
      }),
      language: 'typescript',
    });
    (fs.readFileSync as any).mockReturnValue('import everything');

    const result = await analyzeChangeAmplification({ rootDir: '.' });
    console.log('Resulting score for highly coupled:', result.summary.score);
    console.log('Rating:', result.summary.rating);
  });
});
