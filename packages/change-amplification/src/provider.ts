import {
  createProvider,
  ToolName,
  ScanOptions,
  buildSimpleProviderScore,
} from '@aiready/core';
import { analyzeChangeAmplification } from './analyzer';
import { ChangeAmplificationOptions } from './types';

/**
 * Change Amplification Tool Provider
 */
export const ChangeAmplificationProvider = createProvider({
  id: ToolName.ChangeAmplification,
  alias: ['change-amp', 'change-amplification', 'coupling'],
  version: '0.9.5',
  defaultWeight: 8,
  async analyzeReport(options: ScanOptions) {
    return analyzeChangeAmplification(options as ChangeAmplificationOptions);
  },
  getResults(report) {
    return report.results;
  },
  getSummary(report) {
    return report.summary;
  },
  score(output) {
    return buildSimpleProviderScore(
      ToolName.ChangeAmplification,
      output.summary
    );
  },
});
