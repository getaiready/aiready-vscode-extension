# AIReady

> Explains why AI tools struggle with your codebase—and where small changes unlock outsized leverage

[![AI-Ready](https://img.shields.io/badge/AI--Ready-optimized-brightgreen)](https://getaiready.dev)
🌐 **[Visit our website](https://getaiready.dev)** | 📦 [npm](https://www.npmjs.com/package/@aiready/cli) | ⭐ [GitHub](https://github.com/caopengau/aiready) | 💬 [Discord](https://discord.gg/aiready) | ![Coverage](https://img.shields.io/badge/coverage-83%25-brightgreen)

📖 **Quick Links:** [🚀 Quick Start (5 min)](#-quick-start) | [🔐 Security](./SECURITY.md) | [🤔 Not Another Linter?](./NOT-ANOTHER-LINTER.md) | [🏢 Enterprise](./ENTERPRISE-READINESS-PLAN.md) | [🤝 Contributing](./CONTRIBUTING.md)

## 🎯 Mission

As AI becomes deeply integrated into SDLC, codebases become harder for AI models to understand due to:

- Knowledge cutoff limitations in AI models
- Different model preferences across team members
- Duplicated patterns AI doesn't recognize
- Context fragmentation that breaks AI understanding

AIReady helps teams **assess, visualize, and prepare** repositories for better AI adoption.

## 🌍 Language Support

**Currently Supported (95% market coverage):**

- ✅ **TypeScript** (`.ts`, `.tsx`)
- ✅ **JavaScript** (`.js`, `.jsx`)
- ✅ **Python** (`.py`) - PEP 8 conventions, docstrings, purity analysis
- ✅ **Java** (`.java`) - Javadoc, visibility, purity analysis
- ✅ **Go** (`.go`) - Export visibility, comments, purity analysis
- ✅ **C#** (`.cs`) - XML-Doc, property-level tracking, purity analysis

**Roadmap:**

- 🔜 **Rust** (Q4 2026) - Cargo, ownership patterns

Mixed-language projects are fully supported - the tool automatically detects and analyzes each file type appropriately.

## 📦 Packages

### Core Tools (Free)

- **[@aiready/cli](https://www.npmjs.com/package/@aiready/cli)** [![npm](https://img.shields.io/npm/v/@aiready/cli)](https://www.npmjs.com/package/@aiready/cli) - Unified CLI interface for running all analysis tools together or individually
- **[@aiready/pattern-detect](https://www.npmjs.com/package/@aiready/pattern-detect)** [![npm](https://img.shields.io/npm/v/@aiready/pattern-detect)](https://www.npmjs.com/package/@aiready/pattern-detect) - Detect semantic duplicate patterns that waste AI context window tokens
- **[@aiready/context-analyzer](https://www.npmjs.com/package/@aiready/context-analyzer)** [![npm](https://img.shields.io/npm/v/@aiready/context-analyzer)](https://www.npmjs.com/package/@aiready/context-analyzer) - Analyze context window costs, import depth, cohesion, and fragmentation
- **[@aiready/consistency](https://www.npmjs.com/package/@aiready/consistency)** [![npm](https://img.shields.io/npm/v/@aiready/consistency)](https://www.npmjs.com/package/@aiready/consistency) - Check naming conventions and pattern consistency across your codebase
- **[@aiready/contract-enforcement](https://www.npmjs.com/package/@aiready/contract-enforcement)** [![npm](https://img.shields.io/npm/v/@aiready/contract-enforcement)](https://www.npmjs.com/package/@aiready/contract-enforcement) - Measure structural type safety and boundary validation to reduce fallback cascades
- **[@aiready/ai-signal-clarity](https://www.npmjs.com/package/@aiready/ai-signal-clarity)** [![npm](https://img.shields.io/npm/v/@aiready/ai-signal-clarity)](https://www.npmjs.com/package/@aiready/ai-signal-clarity) - Detect hallucination-risk patterns like boolean traps and large file noise
- **[@aiready/change-amplification](https://www.npmjs.com/package/@aiready/change-amplification)** [![npm](https://img.shields.io/npm/v/@aiready/change-amplification)](https://www.npmjs.com/package/@aiready/change-amplification) - Analyze betweenness centrality and fan-out to assess ripple effect risks
- **[@aiready/agent-grounding](https://www.npmjs.com/package/@aiready/agent-grounding)** [![npm](https://img.shields.io/npm/v/@aiready/agent-grounding)](https://www.npmjs.com/package/@aiready/agent-grounding) - Evaluate how well codebase structure and docs aid AI agent reasoning
- **[@aiready/testability](https://www.npmjs.com/package/@aiready/testability)** [![npm](https://img.shields.io/npm/v/@aiready/testability)](https://www.npmjs.com/package/@aiready/testability) - Analyze verify-loop friction and side-effect density for autonomous agents
- **[@aiready/doc-drift](https://www.npmjs.com/package/@aiready/doc-drift)** [![npm](https://img.shields.io/npm/v/@aiready/doc-drift)](https://www.npmjs.com/package/@aiready/doc-drift) - Track documentation freshness vs code churn to identify outdated docs
- **[@aiready/deps](https://www.npmjs.com/package/@aiready/deps)** [![npm](https://img.shields.io/npm/v/@aiready/deps)](https://www.npmjs.com/package/@aiready/deps) - Analyze dependency health and detect skew against AI training-cutoff dates
- **[@aiready/visualizer](https://www.npmjs.com/package/@aiready/visualizer)** [![npm](https://img.shields.io/npm/v/@aiready/visualizer)](https://www.npmjs.com/package/@aiready/visualizer) - Interactive force-directed graph visualization of analysis results
- **[@aiready/components](https://www.npmjs.com/package/@aiready/components)** [![npm](https://img.shields.io/npm/v/@aiready/components)](https://www.npmjs.com/package/@aiready/components) - Shared UI component library (shadcn/ui based) and D3 charts

### Platform (Private SaaS)

- **[@aiready/agents](https://www.npmjs.com/package/@aiready/agents)** - Agent orchestration and task execution layer

## 🏗️ Architecture

AIReady uses a **hub-and-spoke architecture** for modularity and extensibility:

### Open Source Tools (Free)

```
                    🎯 USER
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                        🎛️  CLI (@aiready/cli)                  │
│                    Unified Interface & Orchestration            │
│  • Single command for all tools                                │
│  • Multi-language support (auto-detects files)                 │
│  • Scoring & unified reporting                                 │
└─────────────────────────────┬───────────────────────────────────┘
                              │
          ┌───────────────────┴───────────────────┐
          │                                       │
          ▼                                       ▼
   ┌─────────────┐                         ┌─────────────┐
   │🎨 VISUALIZER│                         │   ANALYSIS  │
   │             │                         │    SPOKES   │
   │ • Force graph│                        │             │
   │ • HTML reports│                       │             │
   │ ✅ Ready     │                         └──────┬──────┘
   └──────┬──────┘                                │
          │         ┌────────────┬────────────┬───┴───┬────────────┬────────────┐
          │         │            │            │       │            │            │
          │         ▼            ▼            ▼       ▼            ▼            ▼
          │   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
          │   │📊 PATTERN│ │🧠 CONTEXT│ │🔧 CONSIST│ │📝 DOC    │ │📦 DEPS   │ │🛡️ CONTRACT│
          │   │  DETECT  │ │ ANALYZER │ │  ENCY    │ │  DRIFT   │ │  HEALTH  │ │ ENFORCE  │
          │   │          │ │          │ │          │ │          │ │          │ │          │
          │   │• Semantic│ │• Context │ │• Naming  │ │• Outdated│ │• Health  │ │• Type    │
          │   │  dupes   │ │  budgets │ │  rules   │ │  docs    │ │  & Skew  │ │  safety  │
          │   │✅ Ready  │ │✅ Ready  │ │✅ Ready  │ │✅ Ready  │ │✅ Ready  │ │✅ Ready  │
          │   └─────┬────┘ └─────┬────┘ └─────┬────┘ └─────┬────┘ └─────┬────┘ └─────┬────┘
          │         │            │            │            │            │            │
          │   ┌─────┴────┐ ┌─────┴────┐ ┌─────┴────┐ ┌─────┴────┐ ┌─────┴────┐       │
          │   │🚀 CHANGE │ │🔍 SIGNAL │ │🤖 AGENT  │ │🧪 TEST   │ │...MORE   │       │
          │   │  AMPLIF  │ │  CLARITY │ │ GROUNDING│ │ ABILITY  │ │  SPOKES  │       │
          │   │          │ │          │ │          │ │          │ │          │       │
          │   │• Ripple  │ │• Hallucin│ │• Domain   │ │• Verify  │ │          │       │
          │   │  effect  │ │  risk    │ │  context  │ │  loop    │ │          │       │
          │   │✅ Ready  │ │✅ Ready  │ │✅ Ready  │ │✅ Ready  │ │          │       │
          │   └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
          │                                                                          │
          └──────────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
                    ┌─────────────────────────────────┐
                    │      🏢 HUB (@aiready/core)      │
                    │       Shared Infrastructure     │
                    │  • Multi-language parsers       │
                    │  • File scanning & utilities    │
                    │  • Common types & interfaces    │
                    │  • No dependencies on spokes    │
                    └─────────────────────────────────┘
```

### Platform (SaaS) - Coming Soon

```
┌─────────────────────────────────────────────────────────────────┐
│                    🖥️  PLATFORM (Private SaaS)                  │
│              Human-in-the-Loop Agentic Remediation              │
│                                                                  │
│  • **Upload Results**: Push local scans to the cloud (FREE tier) │
│  • **Dashboard**: Track trends, scores, and issue history        │
│  • **API Keys**: Manage programmatic access for CI/CD            │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │  Dashboard   │  │ Remediation  │  │   Expert Network     │   │
│  │  • Trends    │  │  • Auto-fix  │  │   • Human review     │   │
│  │  • Teams     │  │  • Risk mgmt │  │   • Architecture     │   │
│  │  • Billing   │  │  • PR create │  │   • Training         │   │
│  └──────────────┘  └──────────────┘  └──────────────────────┘   │
│                                                                  │
│  📖 Docs: .github/platform/README.md                            │
└─────────────────────────────────────────────────────────────────┘
```

### 🎯 Design Benefits

- **Modular**: Use individual tools or run everything together
- **Independent**: Each spoke focuses on one problem, can be updated separately
- **Extensible**: Easy to add new languages or analysis types
- **Clean**: Spokes only depend on core, not each other
- **Monetizable**: OSS detection + SaaS remediation + Expert consulting

## 📚 Resources & Learning

- 📖 **[AI Engineering Handbook](./docs/AI_ENGINEERING_HANDBOOK.md)** - A structured learning path for building AI-ready repositories.
- 🔬 **[Case Study: AIReady on AIReady](./docs/reviews/aiready-on-aiready-case-study.md)** - See how we used our own tools to improve our codebase.
- 🌐 **[Official Website](https://getaiready.dev)** - Full platform features, dashboard, and documentation.
- 🧪 **[Interactive Demo](https://getaiready.dev/demo)** - Try AIReady on your own repo in the browser.

## 🚀 Quick Start

### Using Individual Tools

```bash
# Detect semantic duplicates
npx @aiready/pattern-detect ./src

# Analyze context costs
npx @aiready/context-analyzer ./src --output json

# Or install globally
npm install -g @aiready/pattern-detect @aiready/context-analyzer
```

> **💡 Smart Defaults:** All tools automatically:
>
> - Exclude test files, build outputs, and node_modules
> - Adjust sensitivity based on codebase size (~10 most serious issues)
> - Save reports to `.aiready/` directory
>
> Use `--include-tests`, `--exclude`, or threshold options to customize behavior.

### Using Unified CLI

```bash
# Install CLI globally
npm install -g @aiready/cli

# Run unified analysis (patterns + context)
aiready scan .

# Run individual tools
aiready patterns . --similarity 0.6
aiready context . --max-depth 3

# Get JSON output (saved to .aiready/ by default)
# Specify custom output path
aiready scan . --output json --output-file custom-path.json

# 🌐 Automatic platform upload
aiready scan . --upload --api-key ar_...

# 🌐 Standalone upload
aiready upload .aiready/latest.json --api-key ar_...
```

> **📁 Note:** All output files (JSON, HTML, Markdown) are saved to the `.aiready/` directory by default unless you specify a custom path with `--output-file`.

## 📊 AI Readiness Scoring

Get a unified **0-100 score** that quantifies how well your codebase works with AI coding assistants across 10 key dimensions:

```bash
aiready scan . --score
```

**Example Output:**

```
🎯 AI Readiness Score: 78/100 (Good)

📊 Breakdown (Top 3):
  • Consistency:          85/100  (High leverage)
  • Contract Enforcement: 72/100  (New!)
  • Pattern Detection:    66/100  (Standard)
```

### Rating Scale

| Score  | Rating        | What It Means                 |
| ------ | ------------- | ----------------------------- |
| 90-100 | 🟢 Excellent  | AI works optimally            |
| 75-89  | 🟡 Good       | Minor improvements possible   |
| 60-74  | 🟠 Fair       | Noticeable AI confusion       |
| 40-59  | 🔴 Needs Work | Significant AI struggles      |
| 0-39   | 🚨 Critical   | Major refactoring recommended |

### Customize Weights

Adjust tool importance based on your priorities:

```bash
# Emphasize pattern detection (e.g., for AI code generation)
aiready scan . --score --weights patterns:50,context:30,consistency:20

# Prioritize context efficiency (e.g., for large codebases)
aiready scan . --score --weights context:50,patterns:30,consistency:20

# Balance all three equally
aiready scan . --score --weights patterns:33,context:33,consistency:34
```

### Set Quality Threshold

Fail CI builds if code doesn't meet your standards:

```bash
# Require "Good" rating or better
aiready scan . --score --threshold 75

# Custom threshold
aiready scan . --score --threshold 70
```

### Forward-Compatible & Customizable

**Forward-Compatible:**

- Scores remain comparable as we add new tools
- New tools are opt-in via `--tools` flag
- Existing scores won't change when new tools launch
- Historical trends stay valid

**Fully Customizable:**

- Adjust weights for your team's priorities
- Run scoring with any tool combination
- Override defaults via config files
- Scoring is optional (backward compatible)

**Examples:**

```bash
# Only score patterns + context (no consistency)
aiready scan . --tools patterns,context --score

# Future: When new tools are added, opt-in explicitly
aiready scan . --tools patterns,context,consistency,doc-drift --score
```

See [Scoring Algorithm Details](./.github/plans/scoring-algorithm.md) for complete methodology and future roadmap.

## ⚙️ Configuration

AIReady supports configuration files for persistent settings. Create one of these files in your project root:

- `aiready.json`
- `aiready.config.json`
- `.aiready.json`
- `.aireadyrc.json`
- `aiready.config.js`
- `.aireadyrc.js`

### Example Configuration

```json
{
  "scan": {
    "include": ["**/*.{ts,tsx,js,jsx}"],
    "exclude": ["**/node_modules/**", "**/dist/**"]
  },
  "tools": {
    "pattern-detect": {
      "minSimilarity": 0.5,
      "minLines": 8,
      "severity": "high",
      "includeTests": false,
      "maxResults": 10
    },
    "context-analyzer": {
      "maxDepth": 5,
      "maxContextBudget": 100000,
      "minCohesion": 0.7,
      "maxResults": 10
    }
  },
  "output": {
    "format": "console",
    "file": null
  }
}
```

CLI options override config file settings.

**Default Exclusions:** By default, test files are excluded from all analyses (patterns: `**/*.test.*`, `**/*.spec.*`, `**/__tests__/**`, `**/test/**`, `**/tests/**`). Use `--include-tests` flag or `"includeTests": true` in config to include them.

**Note:** Console output is limited by default to prevent overwhelming displays. Use `--max-results` to control how many items are shown, or `--output json` for complete results.

## 🏗️ Development

We use a **Makefile-based workflow** for local development. See [MAKEFILE.md](./MAKEFILE.md) for full documentation.

### Quick Commands

```bash
# See all available commands
make help

# Install dependencies
make install

# Build all packages
make build

# Run tests
make test

# Fix code issues (lint + format)
make fix

# Run all quality checks
make check

# Pre-commit checks
make pre-commit
```

### Traditional pnpm Commands (still work)

```bash
pnpm install
pnpm build
pnpm test
pnpm dev
```

## 🚧 Project Status

### Phase 1: OSS Detection Tools ✅ Complete

The open-source CLI and packages provide:

- ✅ Pattern detection and context cost analysis
- ✅ Consistency checks (naming and patterns)
- ✅ Interactive graph visualization (`aiready visualise`)
- ✅ Shared UI component library with D3 charts
- ✅ Unified CLI with JSON/console/HTML outputs
- ✅ [Public website](https://getaiready.dev) with live scan demo and docs

### Phase 2: SaaS Platform 🔜 In Planning

On the roadmap:

- ✅ **Live Dashboard** - View repository scores and trends
- ✅ **CLI Uploads** - Push results directly from your terminal or CI
- ✅ **API Key Management** - Secure programmatic access
- 🔜 **Automated Remediation** - AI agents that fix detected issues
- 🔜 **Human-in-the-Loop** - Expert review queue for complex fixes
- 🔜 **CI/CD Integration** - GitHub Actions, GitLab CI

See [Platform Documentation](./.github/platform/README.md) for details.

## 🤝 Community

Join our community of developers building AI-ready codebases:

- 💬 **[Discord](https://discord.gg/aiready)** - Ask questions, share wins, get help
- 🐛 **[GitHub Issues](https://github.com/caopengau/aiready/issues)** - Report bugs, request features
- 💡 **[GitHub Discussions](https://github.com/caopengau/aiready/discussions)** - Share ideas, ask questions
- 📝 **[Contributing](./CONTRIBUTING.md)** - Learn how to contribute to AIReady
- 📋 **[Community Guidelines](./.github/COMMUNITY-GUIDELINES.md)** - Our community standards

### Events

- **Weekly Office Hours:** Every Tuesday, 10am PST / 1pm EST / 6pm GMT
- **Monthly AI Readiness Challenge:** First Monday of each month
- **Quarterly Hack Week:** Build integrations, plugins, visualizations

### Contributors

Thank you to all our contributors! See [CONTRIBUTING.md](./CONTRIBUTING.md) to get started.

## 📚 Documentation

### Hub-and-Spoke Structure

Documentation follows the same hub-and-spoke pattern as the codebase:

| Section              | Location                          | Purpose                     |
| -------------------- | --------------------------------- | --------------------------- |
| **Hub Docs**         | `.github/copilot-instructions.md` | Core context for all tasks  |
| **OSS Spokes**       | `packages/*/README.md`            | Individual package docs     |
| **Platform**         | `.github/platform/`               | SaaS platform documentation |
| **Sub-instructions** | `.github/sub-instructions/`       | Workflow guides             |
| **Plans**            | `.github/plans/`                  | Architecture & strategy     |

### Quick Links

**For Contributors:**

- [Development Workflow](./.github/sub-instructions/development-workflow.md)
- [Adding New Tools](./.github/sub-instructions/adding-new-tool.md)
- [Git Workflow](./.github/sub-instructions/git-workflow.md)
- [DevOps Best Practices](./.github/sub-instructions/devops-best-practices.md)

**For Platform Development:**

- [Platform Overview](./.github/platform/README.md)
- [Platform Architecture](./.github/platform/architecture.md)
- [Agent System](./.github/platform/agents/README.md)

**Strategy & Planning:**

- [SaaS Architecture](./.github/plans/saas-architecture.md)
- [Monetization Strategy](./.github/plans/strategy/monetization-strategy-visualization.md)

## 📊 Stats & Analytics

Track package downloads, GitHub metrics, and growth:

```bash
# Show current stats
make stats

# Export for historical tracking
make stats-export

# Weekly report with growth tips
make stats-weekly
```

See [Tracking Stats Guide](./docs/TRACKING-STATS.md) for complete details.

## 📄 License

MIT - See LICENSE in individual packages
