# Contributing to AIReady

Thank you for your interest in contributing to AIReady! This guide helps you get started.

## Quick Start

1. **Fork** the repository
2. **Clone** your fork locally
3. **Install** dependencies: `pnpm install`
4. **Create** a feature branch: `git checkout -b feature/your-feature`
5. **Make** your changes
6. **Test** your changes: `pnpm test`
7. **Commit** with a clear message
8. **Push** to your fork
9. **Submit** a pull request

## Development Setup

### Prerequisites

- Node.js 18+
- pnpm 10+
- Git

### Installation

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/aiready.git
cd aiready

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test
```

### Project Structure

```
aiready/
├── packages/           # Analysis tools (spokes)
│   ├── core/          # Shared utilities
│   ├── cli/           # Unified CLI
│   ├── pattern-detect/
│   ├── context-analyzer/
│   └── ...
├── platform/          # SaaS platform
├── clawmore/          # Managed infrastructure
├── landing/           # Marketing website
├── vscode-extension/  # VS Code extension
└── docs/             # Documentation
```

## Contribution Types

### Code Contributions

- **Bug fixes:** Fix issues reported in GitHub Issues
- **Features:** Implement new analysis tools or platform features
- **Improvements:** Enhance existing functionality
- **Tests:** Add or improve test coverage

### Documentation

- **Tutorials:** Write guides for common use cases
- **API docs:** Document public APIs and interfaces
- **Examples:** Create example projects and configurations
- **Translations:** Help translate documentation

### Community

- **Answer questions:** Help others in Discord and GitHub Discussions
- **Review PRs:** Provide constructive feedback on pull requests
- **Write content:** Create blog posts, tutorials, or videos
- **Mentor newcomers:** Help new contributors get started

## Contributor Program

### Levels

| Level           | Requirements                             | Benefits                           |
| --------------- | ---------------------------------------- | ---------------------------------- |
| **Contributor** | 1 merged PR                              | Discord role, GitHub badge         |
| **Regular**     | 5 merged PRs                             | Early access to new features       |
| **Core**        | 15+ merged PRs, consistent contributions | Advisory board access, swag        |
| **Maintainer**  | Trusted by the team                      | Commit access, release permissions |

### Recognition

- GitHub contributor graph
- Discord `@contributor` role
- Mention in release notes
- Swag for significant contributions
- LinkedIn recommendation for core contributors

## Code Standards

### Style

- Follow existing code style in each package
- Use TypeScript for type safety
- Run `pnpm lint` before committing
- Use Prettier for formatting

### Testing

- Write tests for new features
- Maintain or improve test coverage
- Run `pnpm test` before submitting PR
- Include both unit and integration tests

### Documentation

- Update README files for new features
- Add JSDoc comments for public APIs
- Include examples in documentation
- Update changelogs

## Pull Request Process

1. **Create a focused PR:** One feature or fix per PR
2. **Write a clear description:** Explain what and why
3. **Link related issues:** Use "Fixes #123" syntax
4. **Request review:** Tag relevant maintainers
5. **Respond to feedback:** Address review comments
6. **Keep it updated:** Rebase on main if needed

### PR Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Improvement
- [ ] Documentation

## Related Issues

Fixes #123

## Testing

- [ ] Tests pass locally
- [ ] New tests added
- [ ] Manual testing completed

## Screenshots

If applicable, add screenshots
```

## Issue Labels

| Label              | Meaning                    |
| ------------------ | -------------------------- |
| `good first issue` | Good for newcomers         |
| `help wanted`      | We need help with this     |
| `bug`              | Something isn't working    |
| `enhancement`      | New feature or request     |
| `documentation`    | Documentation improvements |
| `priority: high`   | Important, needs attention |
| `priority: low`    | Nice to have               |

## Getting Help

- **Discord:** Join our [community](https://discord.gg/aiready)
- **GitHub Discussions:** Ask questions in Discussions
- **Issues:** Report bugs or request features

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to AIReady!**
