import * as vscode from 'vscode';
import { spawn } from 'child_process';

export function createVisualizeCommand(
  outputChannel: vscode.OutputChannel,
  updateStatusBar: (text: string, isError: boolean) => void
): () => Promise<void> {
  async function runVisualizer(): Promise<void> {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
      vscode.window.showErrorMessage('No workspace folder open');
      return;
    }

    const workspacePath = workspaceFolders[0].uri.fsPath;
    
    updateStatusBar('$(sync~spin) Starting visualizer...', false);
    
    try {
      outputChannel.clear();
      outputChannel.appendLine('═══════════════════════════════════════');
      outputChannel.appendLine('    AIReady Visualization Generator    ');
      outputChannel.appendLine('═══════════════════════════════════════');
      outputChannel.appendLine('');
      outputChannel.appendLine('Starting interactive visualization...');
      outputChannel.appendLine('');
      outputChannel.appendLine('Running: npx @aiready/cli visualize --dev');
      outputChannel.appendLine('');
      outputChannel.show();
      
      // Use spawn with pipe to capture output
      const child = spawn('npx', ['@aiready/cli', 'visualize', '--dev'], {
        cwd: workspacePath,
        shell: true,
        env: { ...process.env, FORCE_COLOR: '0' }
      });
      
      // Pipe stdout to output channel
      child.stdout?.on('data', (data: Buffer) => {
        const lines = data.toString().split('\n');
        lines.forEach((line: string) => {
          if (line.trim()) {
            outputChannel.appendLine(line);
          }
        });
      });
      
      // Pipe stderr to output channel
      child.stderr?.on('data', (data: Buffer) => {
        const lines = data.toString().split('\n');
        lines.forEach((line: string) => {
          if (line.trim()) {
            outputChannel.appendLine(`[stderr] ${line}`);
          }
        });
      });
      
      child.on('error', (error: Error) => {
        outputChannel.appendLine(`Error: ${error.message}`);
        updateStatusBar('$(shield) AIReady: Error', true);
        vscode.window.showErrorMessage(`AIReady visualizer failed: ${error.message}`);
      });
      
      child.on('close', (code: number) => {
        if (code !== 0 && code !== null) {
          outputChannel.appendLine(`Process exited with code ${code}`);
        }
      });
      
      updateStatusBar('$(graph) AIReady: Visualizer', false);
      
      vscode.window.showInformationMessage(
        'AIReady: Visualizer started. Check the output panel for the URL (usually http://localhost:5173)'
      );
      
    } catch (error) {
      updateStatusBar('$(shield) AIReady: Error', true);
      const message = error instanceof Error ? error.message : 'Unknown error';
      vscode.window.showErrorMessage(`AIReady visualizer failed: ${message}`);
      outputChannel.appendLine(`Error: ${message}`);
      outputChannel.show();
    }
  }

  return runVisualizer;
}