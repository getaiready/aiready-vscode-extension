/**
 * AIReady VS Code Extension
 * 
 * Provides real-time AI readiness analysis in VS Code.
 */

import * as vscode from 'vscode';
import { spawn } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

interface AIReadyIssue {
    file: string;
    line?: number;
    message: string;
    severity: 'critical' | 'major' | 'minor';
    tool: string;
}

interface ScanResult {
    score: number;
    issues: AIReadyIssue[];
    summary: {
        totalIssues: number;
        critical: number;
        major: number;
        minor: number;
    };
}

let statusBarItem: vscode.StatusBarItem;
let outputChannel: vscode.OutputChannel;
let issuesDataProvider: IssuesDataProvider;

export function activate(context: vscode.ExtensionContext) {
    console.log('AIReady extension is now active');

    // Create output channel
    outputChannel = vscode.window.createOutputChannel('AIReady');
    context.subscriptions.push(outputChannel);

    // Create status bar item
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.command = 'aiready.showReport';
    statusBarItem.text = '$(shield) AIReady';
    statusBarItem.tooltip = 'Click to show AIReady report';
    context.subscriptions.push(statusBarItem);

    // Register tree data provider
    issuesDataProvider = new IssuesDataProvider();
    const issuesView = vscode.window.createTreeView('aiready.issues', {
        treeDataProvider: issuesDataProvider
    });
    context.subscriptions.push(issuesView);

    // Register commands
    const scanCommand = vscode.commands.registerCommand('aiready.scan', () => scanWorkspace());
    const quickScanCommand = vscode.commands.registerCommand('aiready.quickScan', () => quickScanCurrentFile());
    const showReportCommand = vscode.commands.registerCommand('aiready.showReport', () => showReport());
    const openSettingsCommand = vscode.commands.registerCommand('aiready.openSettings', () => openSettings());

    context.subscriptions.push(scanCommand, quickScanCommand, showReportCommand, openSettingsCommand);

    // Auto-scan on save if enabled
    const config = vscode.workspace.getConfiguration('aiready');
    if (config.get<boolean>('autoScan')) {
        context.subscriptions.push(
            vscode.workspace.onDidSaveTextDocument(() => scanWorkspace())
        );
    }

    // Show status bar
    if (config.get<boolean>('showStatusBar')) {
        statusBarItem.show();
    }

    // Initial scan
    scanWorkspace();
}

async function scanWorkspace(): Promise<void> {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
        vscode.window.showWarningMessage('No workspace folder open');
        return;
    }

    const config = vscode.workspace.getConfiguration('aiready');
    const threshold = config.get<number>('threshold') || 70;
    const tools = config.get<string[]>('tools') || ['patterns', 'context', 'consistency'];

    statusBarItem.text = '$(sync~spin) AIReady scanning...';
    outputChannel.clear();
    outputChannel.appendLine('Starting AIReady scan...');

    try {
        const result = await runAIReadyScan(workspaceFolder.uri.fsPath, tools);
        
        // Update status bar with score
        const scoreEmoji = result.score >= threshold ? '✅' : result.score >= threshold - 20 ? '⚠️' : '❌';
        statusBarItem.text = `$(shield) AIReady: ${result.score}/100 ${scoreEmoji}`;
        statusBarItem.tooltip = `${result.summary.totalIssues} issues (${result.summary.critical} critical, ${result.summary.major} major)`;

        // Update issues view
        issuesDataProvider.updateIssues(result.issues);

        // Show summary
        outputChannel.appendLine(`\n📊 AI Readiness Score: ${result.score}/100`);
        outputChannel.appendLine(`   Issues: ${result.summary.totalIssues}`);
        outputChannel.appendLine(`   Critical: ${result.summary.critical}, Major: ${result.summary.major}, Minor: ${result.summary.minor}`);

        // Show notification if below threshold
        if (result.score < threshold) {
            const failOn = config.get<string>('failOn') || 'critical';
            if (shouldFail(result, failOn)) {
                vscode.window.showErrorMessage(
                    `AIReady check failed: Score ${result.score} below threshold ${threshold}`
                );
            }
        }
    } catch (error) {
        statusBarItem.text = '$(shield) AIReady: Error';
        outputChannel.appendLine(`Error: ${error}`);
        vscode.window.showErrorMessage(`AIReady scan failed: ${error}`);
    }
}

async function quickScanCurrentFile(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showWarningMessage('No active file');
        return;
    }

    const document = editor.document;
    const filePath = document.uri.fsPath;

    outputChannel.clear();
    outputChannel.appendLine(`Quick scanning: ${filePath}`);

    // For quick scan, we just analyze the single file
    const issues = analyzeFile(filePath);
    issuesDataProvider.updateIssues(issues);

    if (issues.length === 0) {
        vscode.window.showInformationMessage('No issues found in current file');
    } else {
        vscode.window.showWarningMessage(`Found ${issues.length} issue(s) in current file`);
    }
}

function analyzeFile(filePath: string): AIReadyIssue[] {
    const issues: AIReadyIssue[] = [];
    const content = readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    // Simple pattern detection
    lines.forEach((line, index) => {
        // Check for long lines
        if (line.length > 200) {
            issues.push({
                file: filePath,
                line: index + 1,
                message: `Line exceeds 200 characters (${line.length} chars) - may fragment context`,
                severity: 'minor',
                tool: 'context'
            });
        }

        // Check for deeply nested conditions
        const indentMatch = line.match(/^(\s+)/);
        if (indentMatch && indentMatch[1].length > 40) {
            issues.push({
                file: filePath,
                line: index + 1,
                message: 'Deeply nested code detected - consider extracting to smaller functions',
                severity: 'major',
                tool: 'patterns'
            });
        }

        // Check for TODO/FIXME
        if (line.match(/\b(TODO|FIXME|HACK)\b/)) {
            issues.push({
                file: filePath,
                line: index + 1,
                message: 'Unresolved comment found - AI may suggest already-planned work',
                severity: 'minor',
                tool: 'consistency'
            });
        }
    });

    return issues;
}

async function runAIReadyScan(workspacePath: string, tools: string[]): Promise<ScanResult> {
    return new Promise((resolve, reject) => {
        const outputFile = join(workspacePath, '.aiready-scan-result.json');
        const args = [
            'scan',
            workspacePath,
            '--tools', tools.join(','),
            '--output', 'json',
            '--output-file', outputFile,
            '--score'
        ];

        const child = spawn('npx', ['@aiready/cli', ...args], {
            shell: true,
            cwd: workspacePath
        });

        let stdout = '';
        let stderr = '';

        child.stdout.on('data', (data) => {
            stdout += data.toString();
        });

        child.stderr.on('data', (data) => {
            stderr += data.toString();
        });

        child.on('close', (code) => {
            outputChannel.appendLine(stdout);
            if (stderr) {
                outputChannel.appendLine(`stderr: ${stderr}`);
            }

            if (existsSync(outputFile)) {
                try {
                    const result = JSON.parse(readFileSync(outputFile, 'utf-8'));
                    resolve({
                        score: result.scoring?.overallScore || 0,
                        issues: parseIssues(result),
                        summary: {
                            totalIssues: result.summary?.totalIssues || 0,
                            critical: countBySeverity(result, 'critical'),
                            major: countBySeverity(result, 'major'),
                            minor: countBySeverity(result, 'minor')
                        }
                    });
                } catch (error) {
                    reject(new Error(`Failed to parse scan results: ${error}`));
                }
            } else {
                // If no output file, return a default result
                resolve({
                    score: 0,
                    issues: [],
                    summary: { totalIssues: 0, critical: 0, major: 0, minor: 0 }
                });
            }
        });

        child.on('error', (error) => {
            reject(new Error(`Failed to run AIReady: ${error.message}`));
        });
    });
}

function parseIssues(result: any): AIReadyIssue[] {
    const issues: AIReadyIssue[] = [];

    // Parse pattern detection issues
    if (result.patterns) {
        result.patterns.forEach((p: any) => {
            p.issues?.forEach((issue: any) => {
                issues.push({
                    file: p.file || '',
                    line: issue.line,
                    message: issue.message,
                    severity: issue.severity || 'minor',
                    tool: 'patterns'
                });
            });
        });
    }

    // Parse context issues
    if (result.context) {
        result.context.forEach((c: any) => {
            if (c.severity) {
                issues.push({
                    file: c.file || '',
                    message: c.message || 'Context issue detected',
                    severity: c.severity,
                    tool: 'context'
                });
            }
        });
    }

    // Parse consistency issues
    if (result.consistency?.results) {
        result.consistency.results.forEach((r: any) => {
            r.issues?.forEach((issue: any) => {
                issues.push({
                    file: r.file || '',
                    line: issue.line,
                    message: issue.message,
                    severity: issue.severity || 'minor',
                    tool: 'consistency'
                });
            });
        });
    }

    return issues;
}

function countBySeverity(result: any, severity: string): number {
    let count = 0;

    if (result.patterns) {
        result.patterns.forEach((p: any) => {
            p.issues?.forEach((issue: any) => {
                if (issue.severity === severity) count++;
            });
        });
    }

    if (result.context) {
        result.context.forEach((c: any) => {
            if (c.severity === severity) count++;
        });
    }

    return count;
}

function shouldFail(result: ScanResult, failOn: string): boolean {
    switch (failOn) {
        case 'critical':
            return result.summary.critical > 0;
        case 'major':
            return result.summary.critical + result.summary.major > 0;
        case 'any':
            return result.summary.totalIssues > 0;
        default:
            return false;
    }
}

function showReport(): void {
    outputChannel.show();
}

function openSettings(): void {
    vscode.commands.executeCommand('workbench.action.openSettings', 'aiready');
}

class IssuesDataProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
    private _onDidChangeTreeData = new vscode.EventEmitter<vscode.TreeItem | undefined | null | void>();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

    private issues: AIReadyIssue[] = [];

    updateIssues(issues: AIReadyIssue[]): void {
        this.issues = issues;
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: vscode.TreeItem): vscode.ProviderResult<vscode.TreeItem[]> {
        if (!element) {
            // Root level - group by file
            const files = [...new Set(this.issues.map(i => i.file))];
            return files.map(file => {
                const item = new vscode.TreeItem(file);
                item.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
                item.resourceUri = vscode.Uri.file(file);
                const fileIssues = this.issues.filter(i => i.file === file);
                item.description = `${fileIssues.length} issues`;
                return item;
            });
        } else {
            // File level - show issues
            const file = element.label as string;
            return this.issues
                .filter(i => i.file === file)
                .map(issue => {
                    const item = new vscode.TreeItem(issue.message);
                    item.description = `[${issue.tool}]`;
                    item.tooltip = `${issue.severity}: ${issue.message}`;
                    item.iconPath = getSeverityIcon(issue.severity);
                    if (issue.line) {
                        item.command = {
                            command: 'vscode.open',
                            arguments: [
                                vscode.Uri.file(issue.file),
                                { selection: new vscode.Range(issue.line! - 1, 0, issue.line! - 1, 0) }
                            ],
                            title: 'Open File'
                        };
                    }
                    return item;
                });
        }
    }
}

function getSeverityIcon(severity: string): vscode.ThemeIcon {
    switch (severity) {
        case 'critical':
            return new vscode.ThemeIcon('error', new vscode.ThemeColor('errorForeground'));
        case 'major':
            return new vscode.ThemeIcon('warning', new vscode.ThemeColor('editorWarning.foreground'));
        default:
            return new vscode.ThemeIcon('info', new vscode.ThemeColor('editorInfo.foreground'));
    }
}

export function deactivate() {
    if (statusBarItem) {
        statusBarItem.dispose();
    }
}
</task_progress>
</write_to_file>