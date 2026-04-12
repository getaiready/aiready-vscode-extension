import * as vscode from 'vscode';
import { SMART_DEFAULTS } from './utils/config';

let statusBarItem: vscode.StatusBarItem;
let outputChannel: vscode.OutputChannel;
let _stopVisualizer: (() => void) | undefined;

/**
 * Update the status bar item
 */
function updateStatusBar(text: string, isError: boolean): void {
  if (!statusBarItem) return;
  statusBarItem.text = text;
  statusBarItem.tooltip = 'Click to show AIReady report';
  statusBarItem.color = isError
    ? new vscode.ThemeColor('errorForeground')
    : undefined;
  statusBarItem.show();
}

/**
 * Activate the AIReady extension.
 * Orchestrates the initialization of providers and registration of commands.
 */
export async function activate(context: vscode.ExtensionContext) {
  try {
    console.log('AIReady extension is now active!');

    // 1. Core Services Setup
    outputChannel = vscode.window.createOutputChannel('AIReady');
    context.subscriptions.push(outputChannel);

    statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      100
    );
    statusBarItem.command = 'aiready.showReport';
    context.subscriptions.push(statusBarItem);

    // 2. Dynamic Initialization to reduce Context Budget
    // By using a dynamic import, we ensure that heavy providers and commands 
    // are not part of the entry point's immediate top-level context budget.
    const { initializeExtension } = await import('./setup');
    
    const {
      issuesProvider,
      summaryProvider,
      reportsProvider,
      stopVisualizer,
      quickScan,
    } = await initializeExtension(context, outputChannel, statusBarItem, updateStatusBar);

    _stopVisualizer = stopVisualizer;

    // 3. Initialize Data & State
    issuesProvider.refresh();
    summaryProvider.refresh();
    reportsProvider.refresh();

    // 4. Register Event Listeners
    context.subscriptions.push(
      vscode.workspace.onDidChangeWorkspaceFolders(() => {
        reportsProvider.refresh();
        issuesProvider.refresh([]); // Clear issues when switching workspace
        summaryProvider.refresh(null);
      })
    );

    // Show initial status bar if enabled
    const config = vscode.workspace.getConfiguration('aiready');
    if (config.get<boolean>('showStatusBar', SMART_DEFAULTS.showStatusBar)) {
      updateStatusBar('$(shield) AIReady', false);
    }

    // Auto-scan on save if enabled
    if (config.get<boolean>('autoScan', SMART_DEFAULTS.autoScan)) {
      context.subscriptions.push(
        vscode.workspace.onDidSaveTextDocument((document) => {
          if (document.uri.scheme === 'file') {
            quickScan();
          }
        })
      );
    }
  } catch (error) {
    console.error('Failed to activate AIReady extension:', error);
    vscode.window.showErrorMessage(
      `Failed to activate AIReady extension: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Deactivate the extension.
 * Performs cleanup of resources and stops active services.
 */
export function deactivate() {
  _stopVisualizer?.();
  if (statusBarItem) {
    statusBarItem.dispose();
  }
  if (outputChannel) {
    outputChannel.dispose();
  }
}
