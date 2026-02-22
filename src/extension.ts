import * as vscode from 'vscode';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

let statusBarItem: vscode.StatusBarItem;
let outputChannel: vscode.OutputChannel;

interface AIReadyResult {
  passed: boolean;
  score: number;
  issues: number;
  warnings: number;
  report: string;
}

export function activate(context: vscode.ExtensionContext) {
  console.log('AIReady extension is now active!');

  outputChannel = vscode.window.createOutputChannel('AIReady');

  // Create status bar item
  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBarItem.command = 'aiready.showReport';
  context.subscriptions.push(statusBarItem);

  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand('aiready.scan', scanWorkspace),
    vscode.commands.registerCommand('aiready.quickScan', quickScan),
    vscode.commands.registerCommand('aiready.showReport', showReport),
    vscode.commands.registerCommand('aiready.openSettings', openSettings)
  );

  // Show initial status
  updateStatusBar('AIReady', false);

  // Auto-scan on save if enabled
  const config = vscode.workspace.getConfiguration('aiready');
  if (config.get<boolean>('autoScan')) {
    context.subscriptions.push(
      vscode.workspace.onDidSaveTextDocument(document => {
        if (document.uri.scheme === 'file') {
          quickScan();
        }
      })
    );
  }
}

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
  const config = vscode.workspace.getConfiguration('aiready');
  const threshold = config.get<number>('threshold') || 70;
  const tools = config.get<string[]>('tools') || ['patterns', 'context', 'consistency'];

  updateStatusBar('$(sync~spin) Scanning...', false);

  try {
    const cmd = `npx @aiready/cli --output json --paths ${path}`;
    const { stdout } = await execAsync(cmd, {
      maxBuffer: 1024 * 1024 * 10
    });

    const result: AIReadyResult = JSON.parse(stdout);

    // Update status bar
    const passed = result.score >= threshold;
    updateStatusBar(
      `${passed ? '✓' : '✗'} AIReady: ${result.score}`,
      !passed
    );

    // Show summary
    outputChannel.clear();
    outputChannel.appendLine('═══════════════════════════════════════');
    outputChannel.appendLine('       AIReady Analysis Results        ');
    outputChannel.appendLine('═══════════════════════════════════════');
    outputChannel.appendLine('');
    outputChannel.appendLine(`Score:    ${result.score}/100`);
    outputChannel.appendLine(`Issues:   ${result.issues}`);
    outputChannel.appendLine(`Warnings: ${result.warnings}`);
    outputChannel.appendLine(`Status:   ${passed ? '✅ PASSED' : '❌ FAILED'}`);
    outputChannel.appendLine('');
    outputChannel.appendLine(result.report);
    outputChannel.show(true);

    // Show notification
    if (!passed) {
      vscode.window.showWarningMessage(
        `AIReady: Score ${result.score} below threshold ${threshold}`
      );
    } else {
      vscode.window.showInformationMessage(
        `AIReady: Score ${result.score}/100 - ${result.issues} issues`
      );
    }

  } catch (error) {
    updateStatusBar('AIReady: Error', true);
    const message = error instanceof Error ? error.message : 'Unknown error';
    vscode.window.showErrorMessage(`AIReady scan failed: ${message}`);
    outputChannel.appendLine(`Error: ${message}`);
    outputChannel.show();
  }
}

function showReport(): void {
  outputChannel.show();
}

function openSettings(): void {
  vscode.commands.executeCommand('workbench.action.openSettings', 'aiready');
}

function updateStatusBar(text: string, isError: boolean): void {
  statusBarItem.text = text;
  statusBarItem.tooltip = 'Click to show AIReady report';
  statusBarItem.color = isError ? new vscode.ThemeColor('errorForeground') : undefined;
  statusBarItem.show();
}

export function deactivate() {
  if (statusBarItem) {
    statusBarItem.dispose();
  }
  if (outputChannel) {
    outputChannel.dispose();
  }
}