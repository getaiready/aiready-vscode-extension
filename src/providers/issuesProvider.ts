import * as vscode from 'vscode';

export interface Issue {
  message: string;
  severity: 'critical' | 'major' | 'minor' | 'info';
  tool?: string;
  location?: {
    file: string;
    line?: number;
  };
}

export type GroupBy = 'severity' | 'tool' | 'file' | 'none';
export type SeverityFilter = 'all' | 'critical' | 'major' | 'minor' | 'info';

// Tree item for issues view
export class AIReadyIssuesProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<vscode.TreeItem | undefined | null | void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private issues: Issue[] = [];
  private groupBy: GroupBy = 'severity';
  private severityFilter: SeverityFilter = 'all';
  private searchQuery: string = '';

  refresh(issues: Issue[] = []): void {
    this.issues = issues;
    this._onDidChangeTreeData.fire();
  }

  setGroupBy(groupBy: GroupBy): void {
    this.groupBy = groupBy;
    this._onDidChangeTreeData.fire();
  }

  setSeverityFilter(filter: SeverityFilter): void {
    this.severityFilter = filter;
    this._onDidChangeTreeData.fire();
  }

  setSearchQuery(query: string): void {
    this.searchQuery = query;
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
    return element;
  }

  private getFilteredIssues(): Issue[] {
    let filtered = [...this.issues];
    
    // Apply severity filter
    if (this.severityFilter !== 'all') {
      filtered = filtered.filter(i => i.severity === this.severityFilter);
    }
    
    // Apply search filter
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(i => 
        i.message.toLowerCase().includes(query) ||
        i.location?.file.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }

  private getSeverityIcon(severity: string): string {
    switch (severity) {
      case 'critical': return 'error';
      case 'major': return 'warning';
      case 'minor': return 'info';
      default: return 'circle-outline';
    }
  }

  private getSeverityColor(severity: string): string {
    switch (severity) {
      case 'critical': return '#f14c4c';
      case 'major': return '#cca700';
      case 'minor': return '#3794ff';
      default: return '#8a8a8a';
    }
  }

  getChildren(element?: vscode.TreeItem): vscode.ProviderResult<vscode.TreeItem[]> {
    const filteredIssues = this.getFilteredIssues();
    
    if (!element) {
      if (filteredIssues.length === 0 && this.issues.length === 0) {
        return [
          {
            label: '$(play) Run Scan',
            iconPath: new vscode.ThemeIcon('play'),
            command: {
              command: 'aiready.scan',
              title: 'Run Scan'
            }
          } as vscode.TreeItem
        ];
      }

      if (filteredIssues.length === 0) {
        return [
          {
            label: 'No issues match current filters',
            iconPath: new vscode.ThemeIcon('filter')
          } as vscode.TreeItem
        ];
      }

      // Show filter controls as first items
      const controls: vscode.TreeItem[] = [
        {
          label: `📊 ${filteredIssues.length} issues`,
          iconPath: new vscode.ThemeIcon('list-filter'),
          description: `Grouped by ${this.groupBy} | Filter: ${this.severityFilter}`,
          contextValue: 'controls'
        } as vscode.TreeItem
      ];

      // Group issues
      if (this.groupBy === 'severity') {
        const groups = this.groupBySeverity(filteredIssues);
        for (const [severity, issues] of Object.entries(groups)) {
          const groupItem = new vscode.TreeItem(
            `${this.getSeverityIcon(severity) === 'error' ? '🔴' : this.getSeverityIcon(severity) === 'warning' ? '🟡' : '🔵'} ${severity.toUpperCase()} (${issues.length})`,
            vscode.TreeItemCollapsibleState.Expanded
          );
          groupItem.iconPath = new vscode.ThemeIcon(this.getSeverityIcon(severity));
          groupItem.contextValue = 'group';
          controls.push(groupItem);
        }
      } else if (this.groupBy === 'tool') {
        const groups = this.groupByTool(filteredIssues);
        for (const [tool, issues] of Object.entries(groups)) {
          const groupItem = new vscode.TreeItem(
            `🔧 ${tool} (${issues.length})`,
            vscode.TreeItemCollapsibleState.Expanded
          );
          groupItem.iconPath = new vscode.ThemeIcon('symbol-property');
          groupItem.contextValue = 'group';
          controls.push(groupItem);
        }
      } else if (this.groupBy === 'file') {
        const groups = this.groupByFile(filteredIssues);
        for (const [file, issues] of Object.entries(groups)) {
          const shortFile = file.split('/').pop() || file;
          const groupItem = new vscode.TreeItem(
            `📁 ${shortFile} (${issues.length})`,
            vscode.TreeItemCollapsibleState.Expanded
          );
          groupItem.iconPath = new vscode.ThemeIcon('file');
          groupItem.description = file;
          groupItem.contextValue = 'group';
          controls.push(groupItem);
        }
      } else {
        // No grouping - show flat list
        return controls.concat(this.createIssueItems(filteredIssues));
      }

      return controls;
    }

    // Return issues for a group
    if (element.contextValue === 'group') {
      const label = element.label as string;
      let key = label.split(' ')[0] === '🔴' ? 'critical' : 
                 label.split(' ')[0] === '🟡' ? 'major' :
                 label.split(' ')[0] === '🔵' ? 'minor' : label;
      
      // Extract the group key from label
      if (label.includes('CRITICAL')) key = 'critical';
      else if (label.includes('MAJOR')) key = 'major';
      else if (label.includes('MINOR')) key = 'minor';
      else if (label.includes('INFO')) key = 'info';
      else key = label.replace(/^[🔴🟡🔵📁🔧]\s+/, '').split(' ')[0];

      // Check if it's a tool or file group
      if (label.startsWith('🔧')) {
        const tool = key.trim();
        return this.createIssueItems(filteredIssues.filter(i => i.tool === tool));
      } else if (label.startsWith('📁')) {
        const file = element.description || key;
        return this.createIssueItems(filteredIssues.filter(i => i.location?.file === file));
      } else {
        return this.createIssueItems(filteredIssues.filter(i => i.severity === key));
      }
    }

    return [];
  }

  private createIssueItems(issues: Issue[]): vscode.TreeItem[] {
    return issues.map(issue => {
      const location = issue.location;
      const locationStr = location ? `${location.file}${location.line ? `:${location.line}` : ''}` : '';
      
      const item = new vscode.TreeItem(
        issue.message.substring(0, 80) + (issue.message.length > 80 ? '...' : ''),
        vscode.TreeItemCollapsibleState.None
      );
      item.iconPath = new vscode.ThemeIcon(this.getSeverityIcon(issue.severity));
      item.description = locationStr;
      item.tooltip = `${issue.message}\n\n${locationStr}`;
      item.contextValue = 'issue';
      
      // Add command to jump to issue
      if (location) {
        item.command = {
          command: 'vscode.open',
          arguments: [vscode.Uri.file(location.file), { selection: new vscode.Range(
            (location.line || 1) - 1, 0, (location.line || 1) - 1, 0
          ) }],
          title: 'Go to Issue'
        };
      }
      
      return item;
    });
  }

  private groupBySeverity(issues: Issue[]): Record<string, Issue[]> {
    const groups: Record<string, Issue[]> = {
      critical: [], major: [], minor: [], info: []
    };
    issues.forEach(issue => {
      groups[issue.severity].push(issue);
    });
    // Sort by severity order
    return {
      critical: groups.critical,
      major: groups.major,
      minor: groups.minor,
      info: groups.info
    };
  }

  private groupByTool(issues: Issue[]): Record<string, Issue[]> {
    const groups: Record<string, Issue[]> = {};
    issues.forEach(issue => {
      const tool = issue.tool || 'unknown';
      if (!groups[tool]) groups[tool] = [];
      groups[tool].push(issue);
    });
    return groups;
  }

  private groupByFile(issues: Issue[]): Record<string, Issue[]> {
    const groups: Record<string, Issue[]> = {};
    issues.forEach(issue => {
      const file = issue.location?.file || 'unknown';
      if (!groups[file]) groups[file] = [];
      groups[file].push(issue);
    });
    return groups;
  }
}
