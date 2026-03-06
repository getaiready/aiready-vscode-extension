import { SQSEvent } from 'aws-lambda';
import * as fs from 'fs';
import * as path from 'path';
import * as git from 'isomorphic-git';
// @ts-ignore
import http from 'isomorphic-git/http/node';
import { randomUUID } from 'crypto';
import {
  normalizeReport,
  calculateAiScore,
  extractBreakdown,
  extractSummary,
  storeAnalysis,
} from '../lib/storage';
import {
  createAnalysis,
  getRepository,
  updateRepositoryScore,
  setRepositoryScanning,
} from '../lib/db';

export async function handler(event: SQSEvent) {
  for (const record of event.Records) {
    const { repoId, userId, accessToken } = JSON.parse(record.body) as {
      repoId: string;
      userId: string;
      accessToken?: string;
    };

    console.log(`[ScanWorker] Processing repo ${repoId} for user ${userId}`);

    const repo = await getRepository(repoId);
    if (!repo) {
      console.error(`[ScanWorker] Repository ${repoId} not found`);
      continue;
    }

    const tempDir = path.join('/tmp', `repo-${randomUUID()}`);

    try {
      // Clear any previous error
      await setRepositoryScanning(repoId, true);

      console.log(`[ScanWorker] Cloning ${repo.url} to ${tempDir}...`);

      await git.clone({
        fs,
        http,
        dir: tempDir,
        url: repo.url,
        singleBranch: true,
        depth: 1,
        onAuth: () => ({ username: accessToken || '', password: '' }),
      });

      // Get current commit hash
      const currentCommit = await git.resolveRef({
        fs,
        dir: tempDir,
        ref: 'HEAD',
      });

      console.log(
        `[ScanWorker] Current commit: ${currentCommit}. Last scanned: ${repo.lastCommitHash}`
      );

      if (repo.lastCommitHash === currentCommit) {
        console.log(
          `[ScanWorker] No changes detected for repo ${repoId}. Skipping scan.`
        );
        // Just clear the scanning flag
        await setRepositoryScanning(repoId, false);
        return;
      }

      console.log(`[ScanWorker] Running AIReady analysis...`);

      // Dynamic import of CLI to avoid loading it if not needed
      const cli = (await import('@aiready/cli')) as any;
      const analyzeUnified = cli.analyzeUnified || cli.default?.analyzeUnified;
      const scoreUnified = cli.scoreUnified || cli.default?.scoreUnified;

      if (
        typeof analyzeUnified !== 'function' ||
        typeof scoreUnified !== 'function'
      ) {
        throw new Error(
          `[ScanWorker] Failed to load analyzeUnified or scoreUnified from @aiready/cli. cli type: ${typeof cli}`
        );
      }

      const analysisResults = await analyzeUnified({
        rootDir: tempDir,
        tools: [
          'patterns',
          'context',
          'consistency',
          'change-amplification',
          'ai-signal-clarity',
          'agent-grounding',
          'testability',
          'doc-drift',
          'deps-health',
        ],
        progressCallback: (event: any) => {
          console.log(`[ScanWorker] Tool ${event.tool} completed`);
        },
      } as any);

      console.log(`[ScanWorker] Calculating scores...`);
      const scoring = await scoreUnified(analysisResults, {});

      const results = {
        ...analysisResults,
        scoring,
      };

      console.log(`[ScanWorker] Analysis complete. Normalizing results...`);

      const data = normalizeReport(results, false, tempDir);
      const timestamp = new Date().toISOString();
      const analysisId = randomUUID();

      // Calculate scores
      const aiScore = data.summary.aiReadinessScore;

      // Store in S3
      const rawKey = await storeAnalysis({
        userId,
        repoId,
        timestamp,
        data,
      });

      // Create record in DynamoDB
      await createAnalysis({
        id: analysisId,
        repoId,
        userId,
        timestamp,
        aiScore,
        breakdown: extractBreakdown(data),
        rawKey,
        summary: extractSummary(data),
        status: 'completed',
        createdAt: new Date().toISOString(),
      });

      // Save time-series metrics for historical trending
      await (async () => {
        const { saveMetricPoints } = await import('../lib/db/analysis');
        await saveMetricPoints({
          repoId,
          timestamp,
          metrics: {
            aiReadinessScore: aiScore,
            ...extractBreakdown(data),
          },
          runId: analysisId,
        });
      })();

      // Update repository score and clear scanning status
      await updateRepositoryScore(repoId, aiScore, currentCommit);

      console.log(
        `[ScanWorker] Successfully completed analysis ${analysisId} for repo ${repoId}`
      );
    } catch (error) {
      console.error(`[ScanWorker] Error processing repo ${repoId}:`, error);
      // Update repository status with error
      await setRepositoryScanning(
        repoId,
        false,
        error instanceof Error ? error.message : 'Unknown error'
      );
    } finally {
      // Cleanup temp directory
      try {
        if (fs.existsSync(tempDir)) {
          fs.rmSync(tempDir, { recursive: true, force: true });
        }
      } catch (cleanupError) {
        console.error(`[ScanWorker] Cleanup error:`, cleanupError);
      }
    }
  }
}
