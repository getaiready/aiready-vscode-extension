import * as vscode from 'vscode';

export interface Summary {
  score: number;
  issues: number;
  warnings: number;
  breakdown?: Array<{
    toolName: string;
    score: number;
    rating: string;
  }>;
}

// Tree item for summary view
export class AIReadySummaryProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<vscode.TreeItem | undefined | null | void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private summary: Summary | null = null;

  refresh(summary: Summary | null = null): void {
    this.summary = summary;
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: vscode.TreeItem): vscode.ProviderResult<vscode.TreeItem[]> {
    if (!element) {
      if (!this.summary) {
        return [
          {
            label: '$(play) Run Scan',
            iconPath: new vscode.ThemeIcon('play'),
            command: {
              command: 'aiready.scan',
              title: 'Run Scan'
            }
          } as vscode.TreeItem,
          {
            label: '$(graph) Run Visualizer',
            iconPath: new vscode.ThemeIcon('graph'),
            command: {
              command: 'aiready.visualize',
              title: 'Run Visualizer'
            }
          } as vscode.TreeItem,
          {
            label: '$(gear) Open Settings',
            iconPath: new vscode.ThemeIcon('gear'),
            command: {
              command: 'aiready.openSettings',
              title: 'Open Settings'
            }
          } as vscode.TreeItem
        ];
      }
      
      const items: vscode.TreeItem[] = [
        {
          label: `Score: ${this.summary.score}/100`,
          iconPath: new vscode.ThemeIcon(
            this.summary.score >= 70 ? 'check' : 
            this.summary.score >= 50 ? 'warning' : 'error'
          ),
          description: this.summary.score >= 70 ? 'Passed' : 
                       this.summary.score >= 50 ? 'Needs work' : 'Failing'
        } as vscode.TreeItem,
        {
          label: `Issues: ${this.summary.issues}`,
          iconPath: new vscode.ThemeIcon('error')
        } as vscode.TreeItem,
        {
          label: `Warnings: ${this.summary.warnings}`,
          iconPath: new vscode.ThemeIcon('warning')
        } as vscode.TreeItem,
      ];

      // Add tool breakdown
      if (this.summary.breakdown) {
        this.summary.breakdown.forEach((tool) => {
          items.push({
            label: `${tool.toolName}: ${tool.score}/100`,
            iconPath: new vscode.ThemeIcon(
              tool.score >= 70 ? 'check' : 
              tool.score >= 50 ? 'warning' : 'error'
            ),
            description: tool.rating
          } as vscode.TreeItem);
        });
      }

      // Add action buttons
      items.push({
        label: '',
        contextValue: 'separator'
      } as vscode.TreeItem);
      items.push({
        label: '$(play) Run Scan Again',
        iconPath: new vscode.ThemeIcon('play'),
        command: {
          command: 'aiready.scan',
          title: 'Run Scan'
        }
      } as vscode.TreeItem);
      items.push({
        label: '$(graph) Run Visualizer',
        iconPath: new vscode.ThemeIcon('graph'),
        command: {
          command: 'aiready.visualize',
          title: 'Run Visualizer'
        }
      } as vscode.TreeItem);

      return items;
    }
    return [];
  }
}