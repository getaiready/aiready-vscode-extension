import * as vscode from 'vscode';

// We keep these for type safety but they will be erased in JS
import type { AIReadyIssuesProvider } from './providers/issuesProvider';
import type { AIReadySummaryProvider } from './providers/summaryProvider';
import type {
  AIReadyReportsProvider,
  ScanReport,
} from './providers/reportsProvider';
import type { ReportDetailView } from './providers/reportDetailView';

/**
 * Result of the extension setup.
 */
export interface SetupResult {
  issuesProvider: AIReadyIssuesProvider;
  summaryProvider: AIReadySummaryProvider;
  reportsProvider: AIReadyReportsProvider;
  reportDetailView: ReportDetailView;
  stopVisualizer: () => void;
  quickScan: () => void;
}

/**
 * Initialize all providers and register commands for the AIReady extension.
 * Using dynamic imports to drastically reduce the top-level context budget.
 */
export async function initializeExtension(
  context: vscode.ExtensionContext,
  outputChannel: vscode.OutputChannel,
  statusBarItem: vscode.StatusBarItem,
  updateStatusBar: (text: string, isError: boolean) => void
): Promise<SetupResult> {
  // 1. Dynamic Imports for heavy providers/factories
  // This effectively removes these from the static context budget of this file.
  const { AIReadyIssuesProvider } = await import('./providers/issuesProvider');
  const { AIReadySummaryProvider } = await import('./providers/summaryProvider');
  const { AIReadyReportsProvider } = await import('./providers/reportsProvider');
  const { ReportDetailView } = await import('./providers/reportDetailView');
  const { createScanCommands } = await import('./commands/scan');
  const { createVisualizeCommand } = await import('./commands/visualize');
  const { MetricsViewProvider } = await import('./providers/metricsProvider');

  // 2. Initialize Providers
  const issuesProvider = new AIReadyIssuesProvider();
  const summaryProvider = new AIReadySummaryProvider();
  const reportsProvider = new AIReadyReportsProvider();
  const reportDetailView = new ReportDetailView(context);

  // 3. Initialize Commands
  const { runVisualizer, stopVisualizer } = createVisualizeCommand(
    outputChannel,
    updateStatusBar
  );

  const { scanWorkspace, quickScan } = createScanCommands(
    outputChannel,
    issuesProvider,
    summaryProvider,
    reportsProvider,
    updateStatusBar,
    runVisualizer
  );

  // 4. Register Commands
  context.subscriptions.push(
    vscode.commands.registerCommand('aiready.scan', scanWorkspace),
    vscode.commands.registerCommand('aiready.quickScan', quickScan),
    vscode.commands.registerCommand('aiready.visualize', runVisualizer),
    vscode.commands.registerCommand('aiready.stopVisualizer', stopVisualizer),
    vscode.commands.registerCommand('aiready.showReport', () =>
      outputChannel.show()
    ),
    vscode.commands.registerCommand('aiready.openSettings', () =>
      vscode.commands.executeCommand('workbench.action.openSettings', 'aiready')
    ),
    vscode.commands.registerCommand(
      'aiready.showReportDetail',
      (report: ScanReport) => {
        reportDetailView.showReport(report);
      }
    ),
    vscode.commands.registerCommand(
      'aiready.showMetrics',
      (metricId?: string) => {
        MetricsViewProvider.show(context, metricId);
      }
    )
  );

  // Grouping & Filtering Commands
  context.subscriptions.push(
    vscode.commands.registerCommand('aiready.issues.groupBySeverity', () => {
      issuesProvider.setGroupBy('severity');
    }),
    vscode.commands.registerCommand('aiready.issues.groupByTool', () => {
      issuesProvider.setGroupBy('tool');
    }),
    vscode.commands.registerCommand('aiready.issues.groupByFile', () => {
      issuesProvider.setGroupBy('file');
    }),
    vscode.commands.registerCommand('aiready.issues.groupByNone', () => {
      issuesProvider.setGroupBy('none');
    }),
    vscode.commands.registerCommand('aiready.issues.filterAll', () => {
      issuesProvider.setSeverityFilter('all');
    }),
    vscode.commands.registerCommand('aiready.issues.filterCritical', () => {
      issuesProvider.setSeverityFilter('critical');
    }),
    vscode.commands.registerCommand('aiready.issues.filterMajor', () => {
      issuesProvider.setSeverityFilter('major');
    }),
    vscode.commands.registerCommand('aiready.issues.filterMinor', () => {
      issuesProvider.setSeverityFilter('minor');
    })
  );

  // 5. Register Tree Views
  context.subscriptions.push(
    vscode.window.createTreeView('aiready.issues', {
      treeDataProvider: issuesProvider,
      showCollapseAll: false,
    }),
    vscode.window.createTreeView('aiready.summary', {
      treeDataProvider: summaryProvider,
      showCollapseAll: false,
    }),
    vscode.window.createTreeView('aiready.reports', {
      treeDataProvider: reportsProvider,
      showCollapseAll: false,
    })
  );

  return {
    issuesProvider,
    summaryProvider,
    reportsProvider,
    reportDetailView,
    stopVisualizer,
    quickScan,
  };
}
