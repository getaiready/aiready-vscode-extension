import * as vscode from 'vscode';
import { exec } from 'child_process';
import { promisify } from 'util';
import { AIReadyIssuesProvider, Issue } from '../providers/issuesProvider';
import { AIReadySummaryProvider, Summary } from '../providers/summaryProvider';
import { getMergedConfig } from '../utils/config';
import { extractJSON } from '../utils/json';

const execAsync = promisify(exec);

interface AIReadyResult {
  passed: boolean;
  score: number;
  issues: number;
  warnings: number;
  report: string;
  summary?: {
    totalIssues: number;
    toolsRun: string[];
    executionTime: number;
  };
  scoring?: {
    overallScore: number;
    breakdown?: Array<{
      toolName: string;
      score: number;
      rating: string;
    }>;
  };
  patterns?: any[];
  context?: any[];
  consistency?: any;
}

export function createScanCommands(
  outputChannel: vscode.OutputChannel,
  issuesProvider: AIReadyIssuesProvider,
  summaryProvider: AIReadySummaryProvider,
  updateStatusBar: (text: string, isError: boolean) => void,
  runVisualizer: () => Promise<void>
): {
  scanWorkspace: () => Promise<void>;
  quickScan: () => Promise<void>;
} {
  async function scanWorkspace(): Promise<void> {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
      vscode.window.showErrorMessage('No workspace folder open');
      return;
    }

    await runAIReady(workspaceFolders[0].uri.fsPath);
  }

  async function quickScan(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage('No active file');
      return;
    }

    const filePath = editor.document.uri.fsPath;
    await runAIReady(filePath, true);
  }

  async function runAIReady(path: string, quickScan = false): Promise<void> {
    const mergedConfig = getMergedConfig();
    const { threshold, tools } = mergedConfig;

    updateStatusBar('$(sync~spin) Scanning...', false);

    try {
      // Build CLI command - score is enabled by default, no flag needed
      const toolsArg = tools.join(',');
      let cmd = `npx @aiready/cli scan --output json --tools ${toolsArg}`;
      
      // Add path argument
      cmd += ` "${path}"`;
      
      outputChannel.clear();
      outputChannel.appendLine('Running AIReady scan...');
      outputChannel.appendLine(`Command: ${cmd}`);
      outputChannel.appendLine('');
      
      const { stdout, stderr } = await execAsync(cmd, {
        maxBuffer: 1024 * 1024 * 10,
        cwd: vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || process.cwd()
      });

      // Show any stderr output
      if (stderr) {
        outputChannel.appendLine(`[stderr] ${stderr}`);
      }

      // Extract JSON from potentially mixed output
      const jsonStr = extractJSON(stdout);
      
      let result: AIReadyResult;

      try {
        result = JSON.parse(jsonStr);
      } catch (parseError) {
        // If JSON parsing fails, show the raw output for debugging
        outputChannel.appendLine('Raw output:');
        outputChannel.appendLine(stdout);
        throw new Error('Failed to parse CLI output as JSON. The CLI may have output errors. Check the output panel for details.');
      }

      // Determine score - use scoring.overallScore if available, else result.score
      const score = result.scoring?.overallScore ?? result.score ?? 0;
      
      // Update status bar
      const passed = score >= threshold;
      updateStatusBar(
        `$(shield) AIReady: ${score}`,
        !passed
      );

      // Update sidebar views
      const allIssues: Issue[] = [
        ...(result.patterns?.flatMap((p: any) => p.issues || []) || []),
        ...(result.context || []),
        ...(result.consistency?.results?.flatMap((r: any) => r.issues || []) || [])
      ];
      
      issuesProvider.refresh(allIssues);
      
      const summary: Summary = {
        score,
        issues: result.issues,
        warnings: result.warnings,
        breakdown: result.scoring?.breakdown
      };
      summaryProvider.refresh(summary);

      // Show summary in output channel
      outputChannel.appendLine('═══════════════════════════════════════');
      outputChannel.appendLine('       AIReady Analysis Results        ');
      outputChannel.appendLine('═══════════════════════════════════════');
      outputChannel.appendLine('');
      
      // Show AI Readiness Score
      outputChannel.appendLine(`AI Readiness Score: ${score}/100`);
      
      // Show tool breakdown if available
      if (result.scoring?.breakdown && result.scoring.breakdown.length > 0) {
        outputChannel.appendLine('');
        outputChannel.appendLine('Tool Breakdown:');
        result.scoring.breakdown.forEach(tool => {
          outputChannel.appendLine(`  - ${tool.toolName}: ${tool.score}/100 (${tool.rating})`);
        });
      }
      
      outputChannel.appendLine('');
      outputChannel.appendLine(`Issues:   ${result.issues}`);
      outputChannel.appendLine(`Warnings: ${result.warnings}`);
      outputChannel.appendLine(`Status:   ${passed ? '✅ PASSED' : '❌ FAILED'}`);
      outputChannel.appendLine('');
      
      // Show summary if available
      if (result.summary) {
        outputChannel.appendLine(`Tools run: ${result.summary.toolsRun.join(', ')}`);
        outputChannel.appendLine(`Execution time: ${(result.summary.executionTime / 1000).toFixed(2)}s`);
        outputChannel.appendLine('');
      }
      
      if (result.report) {
        outputChannel.appendLine(result.report);
      }

      // Show notification with option to visualize
      const action = await vscode.window.showInformationMessage(
        `AIReady: Score ${score}/100 - ${result.issues} issues`,
        'Visualize',
        'View Report'
      );
      
      if (action === 'Visualize') {
        await runVisualizer();
      } else if (action === 'View Report') {
        outputChannel.show();
      }

    } catch (error) {
      updateStatusBar('$(shield) AIReady: Error', true);
      const message = error instanceof Error ? error.message : 'Unknown error';
      vscode.window.showErrorMessage(`AIReady scan failed: ${message}`);
      outputChannel.appendLine(`Error: ${message}`);
      outputChannel.show();
    }
  }

  return { scanWorkspace, quickScan };
}