import * as vscode from 'vscode';

export interface Issue {
  message: string;
  severity: 'critical' | 'major' | 'minor' | 'info';
  location?: {
    file: string;
    line?: number;
  };
}

// Tree item for issues view
export class AIReadyIssuesProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<vscode.TreeItem | undefined | null | void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private issues: Issue[] = [];

  refresh(issues: Issue[] = []): void {
    this.issues = issues;
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: vscode.TreeItem): vscode.ProviderResult<vscode.TreeItem[]> {
    if (!element) {
      if (this.issues.length === 0) {
        return [
          {
            label: 'Run a scan to see issues',
            iconPath: new vscode.ThemeIcon('info'),
            command: {
              command: 'aiready.scan',
              title: 'Run Scan'
            }
          } as vscode.TreeItem
        ];
      }
      return this.issues.map(issue => {
        const item = new vscode.TreeItem(
          issue.message || 'Issue',
          vscode.TreeItemCollapsibleState.None
        );
        item.iconPath = new vscode.ThemeIcon(
          issue.severity === 'critical' ? 'error' :
          issue.severity === 'major' ? 'warning' : 'info'
        );
        item.description = issue.location?.file || '';
        return item;
      });
    }
    return [];
  }
}