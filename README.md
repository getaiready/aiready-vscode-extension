# AIReady: Infrastructure for Agentic Readiness

AIReady is a comprehensive toolkit designed to assess and optimize codebases for AI agents (Cursor, Windsurf, Claude, etc.). It identifies "AI-unfriendly" patterns, context fragmentation, and documentation drift to ensure your repository is optimized for the next generation of software development.

## 🤝 Community & Support

[![Discord](https://img.shields.io/discord/YOUR_DISCORD_ID?label=Discord&logo=discord)](https://discord.gg/invite-code)

Join our [Discord community](https://discord.gg/invite-code) to:

- Get help with AIReady tools
- Share your AI readiness improvements
- Connect with other developers
- Participate in office hours and discussions

## 🚀 Key Features

- **Semantic Duplicate Detection:** Identifies code clones that confuse LLMs and increase token waste.
- **Context Analyzer:** Measures dependency fragmentation and context window efficiency.
- **Naming Consistency:** Enforces domain-specific naming conventions across the entire project.
- **AI Signal Clarity:** Detects magic literals, boolean traps, and ambiguous symbols that lead to hallucinations.
- **Agent Grounding:** Evaluates how easily an agent can navigate and understand the repository from scratch.
- **Testability Index:** Analyzes the feedback loop friction for AI agents trying to verify changes.

## 📦 Project Structure

AIReady follows a **Hub-and-Spoke** architecture:

- **[packages/core](packages/core):** Shared utilities, base types, and scoring logic.
- **[packages/cli](packages/cli):** The unified command-line interface.
- **[packages/\* (Spokes)](packages/):** Individual analysis modules (e.g., `@aiready/pattern-detect`, `@aiready/context-analyzer`).
- **[apps/landing](apps/landing):** Marketing website and project documentation.
- **[apps/platform](apps/platform):** Backend services for the AIReady platform.

## 🛠 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- PNPM >= 8.0.0

### Installation

```bash
pnpm install
pnpm build
```

### Running a Scan

To evaluate your repository's readiness:

```bash
# From the root
pnpm exec aiready scan .
```

## 📜 Development Workflow

We use a monorepo structure managed by PNPM and Turbo.

- **Build all:** `make build` or `pnpm build`
- **Test all:** `make test` or `pnpm test`
- **Lint all:** `make lint`
- **Sync Spokes:** `make sync` (Syncs monorepo changes to standalone spoke repositories)

## 🤝 Contributing

Before contributing, please read our [CONTRIBUTING.md](CONTRIBUTING.md) (if available) and ensure all changes pass the `make pre-push` quality gate.

---

Built with ❤️ for the Agentic Era.
