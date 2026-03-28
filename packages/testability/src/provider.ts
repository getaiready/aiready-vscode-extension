import {
  AnalysisResult,
  createProvider,
  ToolName,
  ScanOptions,
} from '@aiready/core';
import { analyzeTestability } from './analyzer';
import { calculateTestabilityScore } from './scoring';
import { TestabilityOptions, TestabilityReport } from './types';

/**
 * Testability Tool Provider
 */
export const TestabilityProvider = createProvider({
  id: ToolName.TestabilityIndex,
  alias: ['testability', 'tests', 'verification'],
  version: '0.2.5',
  defaultWeight: 10,
  async analyzeReport(options: ScanOptions) {
    return analyzeTestability(options as TestabilityOptions);
  },
  getResults(report): AnalysisResult[] {
    return report.issues.map((issue) => ({
      fileName: issue.location.file,
      issues: [issue],
      metrics: {
        testabilityScore: report.summary.score,
      },
    }));
  },
  getSummary(report) {
    return report.summary;
  },
  getMetadata(report) {
    return { rawData: report.rawData };
  },
  score(output) {
    const report = {
      summary: output.summary,
      rawData: output.metadata?.rawData ?? {},
      recommendations: output.summary?.recommendations || [],
    } as TestabilityReport;
    return calculateTestabilityScore(report);
  },
});
