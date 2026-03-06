/**
 * S3 Storage utilities for AIReady Platform
 *
 * Bucket: aiready-platform-analysis
 *
 * Key patterns:
 *   analyses/<userId>/<repoId>/<timestamp>.json  - Raw analysis JSON
 *   uploads/<userId>/<filename>                  - User uploads
 */

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Initialize S3 client
const s3 = new S3Client({ region: process.env.AWS_REGION || 'ap-southeast-2' });

// Type assertion for getSignedUrl compatibility
const s3Client = s3 as any;

export const getBucketName = () =>
  process.env.S3_BUCKET || 'aiready-platform-analysis';

// Types
export interface AnalysisUpload {
  userId: string;
  repoId: string;
  timestamp: string;
  data: unknown;
}

export interface AnalysisData {
  metadata: {
    repository: string;
    branch: string;
    commit: string;
    timestamp: string;
    toolVersion: string;
  };
  summary: {
    aiReadinessScore: number;
    totalFiles: number;
    totalIssues: number;
    criticalIssues: number;
    warnings: number;
  };
  breakdown: {
    semanticDuplicates: {
      score: number;
      count: number;
      details: Array<{
        type: string;
        file1: string;
        file2: string;
        similarity: number;
      }>;
    };
    contextFragmentation: {
      score: number;
      chains: Array<{
        file: string;
        chainLength: number;
        contextCost: number;
      }>;
    };
    namingConsistency: {
      score: number;
      inconsistencies: Array<{
        type: string;
        expected: string;
        actual: string;
        file: string;
      }>;
    };
    documentationHealth: {
      score: number;
      missingDocs: string[];
      outdatedDocs: string[];
    };
    dependencyHealth: {
      score: number;
      issues: any[];
    };
    aiSignalClarity: {
      score: number;
      signals: any[];
    };
    agentGrounding: {
      score: number;
      issues: any[];
    };
    testabilityIndex: {
      score: number;
      issues: any[];
    };
    changeAmplification: {
      score: number;
      issues: any[];
    };
    cognitiveLoad?: {
      score: number;
      factors: any[];
    };
    patternEntropy?: {
      score: number;
      recommendations: string[];
    };
    conceptCohesion?: {
      score: number;
      analysis: any;
    };
    docDrift?: {
      score: number;
      issues: any[];
    };
    semanticDistance?: {
      score: number;
      relationship: string;
    };
  };
  rawOutput?: unknown;
}

/**
 * Store raw analysis JSON in S3
 */
export async function storeAnalysis(analysis: AnalysisUpload): Promise<string> {
  const BUCKET_NAME = getBucketName();
  const key = `analyses/${analysis.userId}/${analysis.repoId}/${analysis.timestamp}.json`;

  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: JSON.stringify(analysis.data, null, 2),
      ContentType: 'application/json',
      Metadata: {
        userId: analysis.userId,
        repoId: analysis.repoId,
        timestamp: analysis.timestamp,
      },
    })
  );

  return key;
}

/**
 * Retrieve raw analysis JSON from S3
 */
export async function getAnalysis(key: string): Promise<AnalysisData | null> {
  const BUCKET_NAME = getBucketName();
  try {
    const result = await s3.send(
      new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      })
    );

    const body = await result.Body?.transformToString();
    if (!body) return null;

    const raw = JSON.parse(body);
    // Force re-normalization for all S3 retrievals to apply latest mapping rules
    return normalizeReport(raw, true);
  } catch (error) {
    console.error('Error fetching analysis from S3:', error);
    return null;
  }
}

/**
 * Delete analysis from S3
 */
export async function deleteAnalysis(key: string): Promise<void> {
  const BUCKET_NAME = getBucketName();
  await s3.send(
    new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    })
  );
}

/**
 * List all analyses for a repository
 */
export async function listRepositoryAnalyses(
  userId: string,
  repoId: string
): Promise<string[]> {
  const BUCKET_NAME = getBucketName();
  const prefix = `analyses/${userId}/${repoId}/`;

  const result = await s3.send(
    new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: prefix,
    })
  );

  return (result.Contents || [])
    .map((obj) => obj.Key)
    .filter((key): key is string => key !== undefined);
}

/**
 * Generate a presigned URL for downloading analysis
 */
export async function getAnalysisDownloadUrl(
  key: string,
  expiresIn = 3600
): Promise<string> {
  const BUCKET_NAME = getBucketName();
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  return getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * Calculate AI Readiness Score from analysis data
 */
export function calculateAiScore(data: AnalysisData): number {
  const b = data.breakdown || {};

  // Weights matching packages/core/src/scoring.ts
  const weights: Record<string, number> = {
    semanticDuplicates: 22,
    contextFragmentation: 19,
    namingConsistency: 14,
    documentationHealth: 8,
    aiSignalClarity: 11,
    agentGrounding: 10,
    testabilityIndex: 10,
    dependencyHealth: 6,
    changeAmplification: 8,
    cognitiveLoad: 7,
    patternEntropy: 6,
    conceptCohesion: 6,
    semanticDistance: 5,
    docDrift: 8,
  };

  let weightedSum = 0;
  let totalWeight = 0;

  for (const [key, weight] of Object.entries(weights)) {
    const val = (b as any)[key];
    const score = typeof val === 'number' ? val : (val as any)?.score;

    if (typeof score === 'number' && score > 0) {
      weightedSum += score * weight;
      totalWeight += weight;
    }
  }

  if (totalWeight === 0) return 0;
  return Math.round(weightedSum / totalWeight);
}

/**
 * Extract summary for DynamoDB storage
 */
export function extractSummary(data: AnalysisData) {
  return {
    totalFiles: data.summary.totalFiles,
    totalIssues: data.summary.totalIssues,
    criticalIssues: data.summary.criticalIssues,
    warnings: data.summary.warnings,
  };
}

/**
 * Extract breakdown for DynamoDB storage
 */
export function extractBreakdown(data: AnalysisData) {
  const b = data.breakdown || {};

  const getScore = (key: string) => {
    const val = (b as any)[key];
    if (val === undefined || val === null) return undefined;
    const score = typeof val === 'number' ? val : (val as any)?.score;
    // Return if it's a valid number including 0
    return typeof score === 'number' && score >= 0 ? score : undefined;
  };

  const result: Record<string, number> = {};

  // All possible breakdown keys
  const keys = [
    'semanticDuplicates',
    'contextFragmentation',
    'namingConsistency',
    'documentationHealth',
    'dependencyHealth',
    'aiSignalClarity',
    'agentGrounding',
    'testabilityIndex',
    'changeAmplification',
    'cognitiveLoad',
    'patternEntropy',
    'conceptCohesion',
    'semanticDistance',
    // Fallback/Legacy keys
    'docDrift',
  ];

  for (const key of keys) {
    const score = getScore(key);
    if (score !== undefined) {
      result[key] = score;
    }
  }

  return result;
}

/**
 * Normalize raw CLI report data into AnalysisData schema
 */
/**
 * Cleans a file path by removing absolute prefixes and common temp patterns.
 */
function cleanPath(filePath: string, rootDir?: string): string {
  if (!filePath) return filePath;

  let cleaned = filePath;

  // 1. If explicit rootDir provided, strip it first
  if (rootDir && cleaned.startsWith(rootDir)) {
    cleaned = cleaned.substring(rootDir.length);
  }

  // 2. Remove common absolute prefixes used in worker/local scans
  // Patterns like /tmp/repo-uuid/
  cleaned = cleaned.replace(/^\/tmp\/repo-[^/]+\//, '');

  // 3. Remove leading slash if any
  cleaned = cleaned.replace(/^\/+/, '');

  return cleaned;
}

export function normalizeReport(
  raw: any,
  force = false,
  rootDir?: string
): AnalysisData {
  // If it's already in the target format AND has breakdown details, and we are not forcing, return as is.
  if (
    !force &&
    raw.metadata &&
    raw.summary &&
    raw.breakdown &&
    typeof raw.breakdown === 'object' &&
    !Array.isArray(raw.breakdown)
  ) {
    const values = Object.values(raw.breakdown);
    if (
      values.length > 0 &&
      typeof values[0] === 'object' &&
      values[0] !== null &&
      'details' in (values[0] as any)
    ) {
      return raw as AnalysisData;
    }
  }

  // Use rawOutput if available as the source of truth for re-normalization
  const source = raw.rawOutput || raw;
  const scoring = source.scoring || {};
  const summary = source.summary || {};
  const metadata = source.metadata || {};
  const repo = metadata.repository || source.repository || {};

  const toolMappings: Record<string, string> = {
    // CLI Keys
    'pattern-detect': 'semanticDuplicates',
    patternDetect: 'semanticDuplicates',
    patterns: 'semanticDuplicates',

    'context-analyzer': 'contextFragmentation',
    contextAnalyzer: 'contextFragmentation',
    context: 'contextFragmentation',

    'naming-consistency': 'namingConsistency',
    namingConsistency: 'namingConsistency',
    'naming-conventions': 'namingConsistency',
    consistency: 'namingConsistency',

    'doc-drift': 'documentationHealth',
    docDrift: 'documentationHealth',
    'documentation-health': 'documentationHealth',
    documentationHealth: 'documentationHealth',

    'dependency-health': 'dependencyHealth',
    dependencyHealth: 'dependencyHealth',
    'deps-health': 'dependencyHealth',

    'ai-signal-clarity': 'aiSignalClarity',
    aiSignalClarity: 'aiSignalClarity',

    'agent-grounding': 'agentGrounding',
    agentGrounding: 'agentGrounding',

    testability: 'testabilityIndex',
    'testability-index': 'testabilityIndex',
    testabilityIndex: 'testabilityIndex',

    'change-amplification': 'changeAmplification',
    changeAmplification: 'changeAmplification',

    'cognitive-load': 'cognitiveLoad',
    cognitiveLoad: 'cognitiveLoad',
    'pattern-entropy': 'patternEntropy',
    patternEntropy: 'patternEntropy',
    'concept-cohesion': 'conceptCohesion',
    conceptCohesion: 'conceptCohesion',
    'semantic-distance': 'semanticDistance',
    semanticDistance: 'semanticDistance',
  };

  const breakdown: any = {};

  // Aggressively try to find data for every platform key
  for (const [cliName, platformKey] of Object.entries(toolMappings)) {
    // Generate potential keys in the raw data
    const camelCased = cliName
      .split('-')
      .map((word: string, index: number) =>
        index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
      )
      .join('');

    // Check possible sources for this tool's data
    const toolData =
      source[camelCased] ||
      source[cliName] ||
      (source.breakdown && source.breakdown[cliName]) ||
      (source.breakdown && source.breakdown[camelCased]) ||
      (source.breakdown && source.breakdown[platformKey]);

    // Check scoring for this tool's score if not in toolData
    let toolScore = 0;
    let rawMetrics = {};
    if (Array.isArray(scoring.breakdown)) {
      const scoringItem = scoring.breakdown.find(
        (item: any) =>
          item.toolName === cliName ||
          item.toolName === camelCased ||
          item.toolName === platformKey
      );
      if (scoringItem) {
        toolScore = scoringItem.score || 0;
        rawMetrics = scoringItem.rawMetrics || {};
      }
    }

    // Try to get score from toolData itself if scoring didn't have it
    if (toolScore === 0 && toolData) {
      toolScore = toolData.score || toolData.summary?.score || 0;
    }

    let details: any[] = [];
    if (toolData) {
      const resultsArray =
        toolData.results ||
        toolData.issues ||
        (Array.isArray(toolData) ? toolData : []);
      if (Array.isArray(resultsArray)) {
        resultsArray.forEach((r: any) => {
          if (r.issues && Array.isArray(r.issues)) {
            r.issues.forEach((issue: any) => {
              const normalized =
                typeof issue === 'string'
                  ? { message: issue, severity: 'major' as const }
                  : { ...issue };

              // Relativize path
              if (normalized.location?.file) {
                normalized.location.file = cleanPath(
                  normalized.location.file,
                  rootDir
                );
              }

              if (!normalized.location?.file && r.fileName) {
                normalized.location = {
                  ...normalized.location,
                  file: cleanPath(r.fileName, rootDir),
                };
              }
              details.push(normalized);
            });
          } else {
            const normalized =
              typeof r === 'string'
                ? { message: r, severity: 'major' as const }
                : { ...r };

            // Relativize path
            if (normalized.location?.file) {
              normalized.location.file = cleanPath(
                normalized.location.file,
                rootDir
              );
            } else if (normalized.file) {
              normalized.location = {
                ...normalized.location,
                file: cleanPath(normalized.file, rootDir),
              };
            }

            details.push(normalized);
          }
        });
      }
    }

    // If we found data (even if 0 score and 0 issues), add it to the breakdown
    if (
      toolData ||
      toolScore > 0 ||
      (Array.isArray(scoring.breakdown) &&
        scoring.breakdown.some((item: any) => item.toolName === cliName))
    ) {
      const existing = breakdown[platformKey];
      if (existing) {
        // Merge
        existing.score = Math.max(existing.score, toolScore);
        if (details.length > 0) {
          existing.details = [...(existing.details || []), ...details];
          existing.count = existing.details.length;
        }
      } else {
        breakdown[platformKey] = {
          score: toolScore,
          count: details.length || (rawMetrics as any).totalIssues || 0,
          details,
        };
      }
    }
  }

  // Final fallback for missing keys: if input had a flat breakdown, preserve those values
  const inputBreakdown =
    raw.breakdown && typeof raw.breakdown === 'object' ? raw.breakdown : {};
  for (const [k, v] of Object.entries(inputBreakdown)) {
    if (!breakdown[k]) {
      if (typeof v === 'number') {
        breakdown[k] = { score: v, count: 0, details: [] };
      } else {
        breakdown[k] = v;
      }
    }
  }

  return {
    metadata: {
      repository: repo.name || 'unknown',
      branch: repo.branch || 'main',
      commit: repo.commit || 'unknown',
      timestamp: scoring.timestamp || new Date().toISOString(),
      toolVersion: repo.version || '0.1.0',
    },
    summary: {
      aiReadinessScore: scoring.overall || 0,
      totalFiles: summary.totalFiles || 0,
      totalIssues: summary.totalIssues || 0,
      criticalIssues: summary.criticalIssues || 0,
      warnings: summary.warnings || 0,
    },
    breakdown,
    rawOutput: source,
  };
}

export { s3 };
