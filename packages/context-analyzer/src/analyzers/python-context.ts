/**
 * Python Context Analyzer
 *
 * Analyzes Python code for:
 * - Import chain depth
 * - Context budget (tokens needed)
 * - Module cohesion
 * - Import fragmentation
 */

import { getParser, estimateTokens } from '@aiready/core';
import { resolve, relative, dirname, join } from 'path';
import fs from 'fs';
import {
  calculateImportDepthFromEdges,
  detectGraphCyclesFromFile,
} from '../utils/dependency-graph-utils';

export interface PythonContextMetrics {
  file: string;
  importDepth: number;
  contextBudget: number; // Total tokens needed (file + dependencies)
  cohesion: number; // 0-1, higher is better
  imports: PythonImportInfo[];
  exports: PythonExportInfo[];
  metrics: {
    linesOfCode: number;
    importCount: number;
    exportCount: number;
    circularDependencies: string[];
  };
}

export interface PythonImportInfo {
  source: string;
  specifiers: string[];
  isRelative: boolean;
  resolvedPath?: string;
}

export interface PythonExportInfo {
  name: string;
  type: string;
}

/**
 * Analyze Python files for context metrics
 */
export async function analyzePythonContext(
  files: string[],
  rootDir: string
): Promise<PythonContextMetrics[]> {
  const results: PythonContextMetrics[] = [];
  const parser = await getParser('dummy.py');

  if (!parser) {
    console.warn('Python parser not available');
    return results;
  }

  const pythonFiles = files.filter((f) => f.toLowerCase().endsWith('.py'));

  // Some path helpers are imported for future use; reference them to avoid lint warnings
  void relative;
  void join;

  // Build dependency graph first
  const dependencyGraph = await buildPythonDependencyGraph(
    pythonFiles,
    rootDir
  );

  for (const file of pythonFiles) {
    try {
      const code = await fs.promises.readFile(file, 'utf-8');
      const result = parser.parse(code, file);

      const imports: PythonImportInfo[] = result.imports.map((imp) => ({
        source: imp.source,
        specifiers: imp.specifiers,
        isRelative: imp.source.startsWith('.'),
        resolvedPath: resolvePythonImport(file, imp.source, rootDir),
      }));

      const exports: PythonExportInfo[] = result.exports.map((exp) => ({
        name: exp.name,
        type: exp.type,
      }));

      // Calculate metrics
      const linesOfCode = code.split('\n').length;
      const importDepth = calculateImportDepthFromEdges(
        file,
        dependencyGraph,
        new Set()
      );
      const contextBudget = estimateContextBudget(
        code,
        imports,
        dependencyGraph
      );
      const cohesion = calculatePythonCohesion(exports, imports);
      const circularDependencies = detectGraphCyclesFromFile(
        file,
        dependencyGraph
      ).map((cycle) => cycle.join(' -> '));

      results.push({
        file,
        importDepth,
        contextBudget,
        cohesion,
        imports,
        exports,
        metrics: {
          linesOfCode,
          importCount: imports.length,
          exportCount: exports.length,
          circularDependencies,
        },
      });
    } catch (error) {
      console.warn(`Failed to analyze ${file}:`, error);
    }
  }

  return results;
}

/**
 * Build dependency graph for Python files
 */
async function buildPythonDependencyGraph(
  files: string[],
  rootDir: string
): Promise<Map<string, Set<string>>> {
  const graph = new Map<string, Set<string>>();
  const parser = await getParser('dummy.py');

  if (!parser) return graph;

  for (const file of files) {
    try {
      const code = await fs.promises.readFile(file, 'utf-8');
      const result = parser.parse(code, file);

      const dependencies = new Set<string>();

      for (const imp of result.imports) {
        const resolved = resolvePythonImport(file, imp.source, rootDir);
        if (resolved && files.includes(resolved)) {
          dependencies.add(resolved);
        }
      }

      graph.set(file, dependencies);
    } catch (error) {
      void error;
      // Skip files with errors
    }
  }

  return graph;
}

/**
 * Resolve Python import to file path
 */
function resolvePythonImport(
  fromFile: string,
  importPath: string,
  rootDir: string
): string | undefined {
  const dir = dirname(fromFile);

  // Handle relative imports
  if (importPath.startsWith('.')) {
    const parts = importPath.split('.');
    let upCount = 0;
    while (parts[0] === '') {
      upCount++;
      parts.shift();
    }

    let targetDir = dir;
    for (let i = 0; i < upCount - 1; i++) {
      targetDir = dirname(targetDir);
    }

    const modulePath = parts.join('/');
    const possiblePaths = [
      resolve(targetDir, `${modulePath}.py`),
      resolve(targetDir, modulePath, '__init__.py'),
    ];

    for (const path of possiblePaths) {
      if (fs.existsSync(path)) {
        return path;
      }
    }
  } else {
    // Handle absolute imports (from project root)
    const modulePath = importPath.replace(/\./g, '/');
    const possiblePaths = [
      resolve(rootDir, `${modulePath}.py`),
      resolve(rootDir, modulePath, '__init__.py'),
    ];

    for (const path of possiblePaths) {
      if (fs.existsSync(path)) {
        return path;
      }
    }
  }

  return undefined;
}

/**
 * Estimate context budget (tokens needed for file + direct deps)
 */
function estimateContextBudget(
  code: string,
  imports: PythonImportInfo[],
  dependencyGraph: Map<string, Set<string>>
): number {
  // File tokens
  void dependencyGraph;
  let budget = estimateTokens(code);

  // Add tokens for direct dependencies (simplified)
  // In a full implementation, we'd load each dependency file
  const avgTokensPerDep = 500; // Conservative estimate
  budget += imports.length * avgTokensPerDep;

  return budget;
}

/**
 * Calculate cohesion for a Python module
 *
 * Cohesion = How related are the exports to each other?
 * Higher cohesion = better (single responsibility)
 */
function calculatePythonCohesion(
  exports: PythonExportInfo[],
  imports: PythonImportInfo[]
): number {
  if (exports.length === 0) return 1;

  // Simple heuristic: files with many exports but few imports are less cohesive
  const exportCount = exports.length;
  const importCount = imports.length;

  // Ideal: 1-5 exports per module
  let cohesion = 1;

  if (exportCount > 10) {
    cohesion *= 0.6; // Too many exports = God module
  } else if (exportCount > 5) {
    cohesion *= 0.8;
  }

  // High import-to-export ratio suggests focused module
  if (exportCount > 0) {
    const ratio = importCount / exportCount;
    if (ratio > 2) {
      cohesion *= 1.1; // Good: imports more than it exports
    } else if (ratio < 0.5) {
      cohesion *= 0.9; // Bad: exports more than it imports
    }
  }

  return Math.min(1, Math.max(0, cohesion));
}
