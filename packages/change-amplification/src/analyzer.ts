import * as fs from 'fs';
import * as path from 'path';
import {
  scanFiles,
  calculateChangeAmplification,
  getParser,
  Severity,
  IssueType,
} from '@aiready/core';
import type {
  ChangeAmplificationOptions,
  ChangeAmplificationReport,
  FileChangeAmplificationResult,
  ChangeAmplificationIssue,
} from './types';

export async function analyzeChangeAmplification(
  options: ChangeAmplificationOptions
): Promise<ChangeAmplificationReport> {
  // Use core scanFiles which respects .gitignore recursively
  const files = await scanFiles({
    ...options,
    include: options.include || ['**/*.{ts,tsx,js,jsx,py,go}'],
  });

  // Compute graph metrics: fanIn and fanOut
  const dependencyGraph = new Map<string, string[]>(); // key: file, value: imported files
  const reverseGraph = new Map<string, string[]>(); // key: file, value: files that import it

  // Initialize graph
  for (const file of files) {
    dependencyGraph.set(file, []);
    reverseGraph.set(file, []);
  }

  // Parse files to build dependency graph
  let processed = 0;
  for (const file of files) {
    processed++;
    if (processed % 50 === 0 || processed === files.length) {
      options.onProgress?.(
        processed,
        files.length,
        `analyzing dependencies (${processed}/${files.length})`
      );
    }

    try {
      const parser = await getParser(file);
      if (!parser) continue;

      const content = fs.readFileSync(file, 'utf8');
      const parseResult = parser.parse(content, file);
      const dependencies = parseResult.imports.map((i) => i.source);

      const extensions = ['.ts', '.tsx', '.js', '.jsx'];
      for (const dep of dependencies) {
        const depDir = path.dirname(file);
        let resolvedPath: string | undefined;

        if (dep.startsWith('.')) {
          // Relative import resolution
          const absoluteDepBase = path.resolve(depDir, dep);

          // Try extensions
          for (const ext of extensions) {
            const withExt = absoluteDepBase + ext;
            if (files.includes(withExt)) {
              resolvedPath = withExt;
              break;
            }
          }

          // Try /index variations
          if (!resolvedPath) {
            for (const ext of extensions) {
              const withIndex = path.join(absoluteDepBase, `index${ext}`);
              if (files.includes(withIndex)) {
                resolvedPath = withIndex;
                break;
              }
            }
          }
        } else {
          // Non-relative import (package or absolute)
          // Exact match or matches a file in our set (normalized)
          const depWithoutExt = dep.replace(/\.(ts|tsx|js|jsx)$/, '');
          resolvedPath = files.find((f) => {
            const fWithoutExt = f.replace(/\.(ts|tsx|js|jsx)$/, '');
            return (
              fWithoutExt === depWithoutExt ||
              fWithoutExt.endsWith(`/${depWithoutExt}`)
            );
          });
        }

        if (resolvedPath && resolvedPath !== file) {
          dependencyGraph.get(file)?.push(resolvedPath);
          reverseGraph.get(resolvedPath)?.push(file);
        }
      }
    } catch (err) {
      void err;
    }
  }

  const fileMetrics = files.map((file) => {
    const fanOut = dependencyGraph.get(file)?.length || 0;
    const fanIn = reverseGraph.get(file)?.length || 0;
    return { file, fanOut, fanIn };
  });

  const riskResult = calculateChangeAmplification({ files: fileMetrics });

  // Fallback: If score is 0 but we have files, ensure it's at least a baseline if not truly "explosive"
  let finalScore = riskResult.score;
  if (
    finalScore === 0 &&
    files.length > 0 &&
    riskResult.rating !== 'explosive'
  ) {
    finalScore = 10;
  }

  const results: FileChangeAmplificationResult[] = [];

  // Helper for severity mapping
  const getLevel = (s: any): number => {
    if (s === Severity.Critical || s === 'critical') return 4;
    if (s === Severity.Major || s === 'major') return 3;
    if (s === Severity.Minor || s === 'minor') return 2;
    if (s === Severity.Info || s === 'info') return 1;
    return 0;
  };

  for (const hotspot of riskResult.hotspots) {
    const issues: ChangeAmplificationIssue[] = [];
    if (hotspot.amplificationFactor > 20) {
      issues.push({
        type: IssueType.ChangeAmplification,
        severity:
          hotspot.amplificationFactor > 40 ? Severity.Critical : Severity.Major,
        message: `High change amplification detected (Factor: ${hotspot.amplificationFactor}). Changes here cascade heavily.`,
        location: { file: hotspot.file, line: 1 },
        suggestion: `Reduce coupling. Fan-out is ${hotspot.fanOut}, Fan-in is ${hotspot.fanIn}.`,
      });
    }

    // We only push results for files that have either high fan-in or fan-out
    if (hotspot.amplificationFactor > 5) {
      results.push({
        fileName: hotspot.file,
        issues,
        metrics: {
          aiSignalClarityScore: 100 - hotspot.amplificationFactor, // Just a rough score
        },
      });
    }
  }

  return {
    summary: {
      totalFiles: files.length,
      totalIssues: results.reduce((sum, r) => sum + r.issues.length, 0),
      criticalIssues: results.reduce(
        (sum, r) =>
          sum + r.issues.filter((i) => getLevel(i.severity) === 4).length,
        0
      ),
      majorIssues: results.reduce(
        (sum, r) =>
          sum + r.issues.filter((i) => getLevel(i.severity) === 3).length,
        0
      ),
      score: finalScore,
      rating: riskResult.rating,
      recommendations: riskResult.recommendations,
    },
    results,
  };
}
