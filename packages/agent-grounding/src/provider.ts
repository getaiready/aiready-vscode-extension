import {
  AnalysisResult,
  createProvider,
  ToolName,
  ScanOptions,
} from '@aiready/core';
import { analyzeAgentGrounding } from './analyzer';
import { calculateGroundingScore } from './scoring';
import { AgentGroundingOptions, AgentGroundingReport } from './types';

/**
 * Agent Grounding Tool Provider
 */
export const AgentGroundingProvider = createProvider({
  id: ToolName.AgentGrounding,
  alias: ['agent-grounding', 'grounding', 'navigation'],
  version: '0.9.5',
  defaultWeight: 10,
  async analyzeReport(options: ScanOptions) {
    return analyzeAgentGrounding(options as AgentGroundingOptions);
  },
  getResults(report): AnalysisResult[] {
    return report.issues.map((issue) => ({
      fileName: issue.location.file,
      issues: [issue],
      metrics: {
        agentGroundingScore: report.summary.score,
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
    } as AgentGroundingReport;
    return calculateGroundingScore(report);
  },
});
