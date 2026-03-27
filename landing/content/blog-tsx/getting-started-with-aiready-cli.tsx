import meta from './getting-started-with-aiready-cli.meta';
import React from 'react';
import CodeBlock from '../../components/CodeBlock';

const Post = () => (
  <>
    <p>
      Have you ever noticed that AI coding assistants sometimes give you worse
      suggestions over time? Or that they keep suggesting code that already
      exists in your project? You&apos;re not alone — and there&apos;s a tool
      that can help.
    </p>
    <p>
      AIReady is an open-source CLI that analyzes your codebase and tells you
      exactly where AI tools struggle — and how to fix it. In this guide,
      you&apos;ll learn how to scan your codebase, understand your AI readiness
      score, and start improving in just 5 minutes.
    </p>

    <h2>What You&apos;ll Learn</h2>
    <ul>
      <li>How to install AIReady CLI</li>
      <li>How to scan your codebase</li>
      <li>How to understand your AI readiness score</li>
      <li>How to fix common issues</li>
      <li>How to track improvements over time</li>
    </ul>

    <h2>Prerequisites</h2>
    <ul>
      <li>Node.js 18 or higher</li>
      <li>
        A codebase to analyze (any TypeScript, JavaScript, Python, Java, Go, or
        C# project)
      </li>
    </ul>

    <h2>Step 1: Install AIReady CLI</h2>
    <CodeBlock lang="bash">{`
# Install globally
npm install -g @aiready/cli

# Or use npx without installing
npx @aiready/cli scan .
`}</CodeBlock>

    <h2>Step 2: Scan Your Codebase</h2>
    <p>Navigate to your project directory and run:</p>
    <CodeBlock lang="bash">{`
# Scan current directory
aiready scan .

# Or scan a specific directory
aiready scan ./src
`}</CodeBlock>

    <p>You&apos;ll see output like this:</p>
    <CodeBlock lang="text">{`
🎯 AI Readiness Score: 72/100 (Fair)

📊 Breakdown:
  • Pattern Detection:    65/100  (12 semantic duplicates found)
  • Context Analysis:     78/100  (Import depth: 4 levels)
  • Consistency:          82/100  (Naming conventions: 90% consistent)
  • Contract Enforcement: 70/100  (Type safety: Good)
  • Documentation:        68/100  (3 outdated docs found)

💡 Top Recommendations:
  1. Consolidate 12 similar validation functions
  2. Reduce import chain depth from 4 to 3 levels
  3. Update 3 documentation files that are out of sync
`}</CodeBlock>

    <h2>Step 3: Understand Your Score</h2>
    <p>
      Your AI readiness score (0-100) tells you how well AI tools will work with
      your codebase:
    </p>

    <div className="my-8 overflow-x-auto">
      <table className="min-w-full border-collapse border border-slate-200 dark:border-zinc-800">
        <thead>
          <tr className="bg-slate-50 dark:bg-zinc-900">
            <th className="border border-slate-200 dark:border-zinc-800 px-4 py-2 text-left">
              Score
            </th>
            <th className="border border-slate-200 dark:border-zinc-800 px-4 py-2 text-left">
              Rating
            </th>
            <th className="border border-slate-200 dark:border-zinc-800 px-4 py-2 text-left">
              What It Means
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-slate-200 dark:border-zinc-800 px-4 py-2">
              90-100
            </td>
            <td className="border border-slate-200 dark:border-zinc-800 px-4 py-2">
              Excellent
            </td>
            <td className="border border-slate-200 dark:border-zinc-800 px-4 py-2">
              AI works optimally
            </td>
          </tr>
          <tr>
            <td className="border border-slate-200 dark:border-zinc-800 px-4 py-2">
              75-89
            </td>
            <td className="border border-slate-200 dark:border-zinc-800 px-4 py-2">
              Good
            </td>
            <td className="border border-slate-200 dark:border-zinc-800 px-4 py-2">
              Minor improvements possible
            </td>
          </tr>
          <tr>
            <td className="border border-slate-200 dark:border-zinc-800 px-4 py-2">
              60-74
            </td>
            <td className="border border-slate-200 dark:border-zinc-800 px-4 py-2">
              Fair
            </td>
            <td className="border border-slate-200 dark:border-zinc-800 px-4 py-2">
              Noticeable AI confusion
            </td>
          </tr>
          <tr>
            <td className="border border-slate-200 dark:border-zinc-800 px-4 py-2">
              40-59
            </td>
            <td className="border border-slate-200 dark:border-zinc-800 px-4 py-2">
              Needs Work
            </td>
            <td className="border border-slate-200 dark:border-zinc-800 px-4 py-2">
              Significant AI struggles
            </td>
          </tr>
          <tr>
            <td className="border border-slate-200 dark:border-zinc-800 px-4 py-2">
              0-39
            </td>
            <td className="border border-slate-200 dark:border-zinc-800 px-4 py-2">
              Critical
            </td>
            <td className="border border-slate-200 dark:border-zinc-800 px-4 py-2">
              Major refactoring recommended
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <h2>Step 4: Fix Common Issues</h2>

    <h3>Issue 1: Semantic Duplicates</h3>
    <p>
      AI tools can&apos;t see that similar functions do the same thing. AIReady
      finds them:
    </p>
    <CodeBlock lang="bash">{`
# Find semantic duplicates
aiready patterns . --similarity 0.7
`}</CodeBlock>
    <p>
      <strong>Fix:</strong> Consolidate similar functions into a single,
      well-documented utility.
    </p>

    <h3>Issue 2: Deep Import Chains</h3>
    <p>When imports are 5+ levels deep, AI tools lose context:</p>
    <CodeBlock lang="bash">{`
# Analyze import depth
aiready context . --max-depth 3
`}</CodeBlock>
    <p>
      <strong>Fix:</strong> Flatten your module structure or use barrel exports.
    </p>

    <h3>Issue 3: Inconsistent Naming</h3>
    <p>AI tools learn from your patterns. Inconsistent naming confuses them:</p>
    <CodeBlock lang="bash">{`
# Check naming consistency
aiready consistency .
`}</CodeBlock>
    <p>
      <strong>Fix:</strong> Standardize naming conventions across your codebase.
    </p>

    <h2>Step 5: Track Improvements</h2>

    <h3>Save Your Results</h3>
    <CodeBlock lang="bash">{`
# Save results to JSON
aiready scan . --output json

# Results are saved to .aiready/ directory
`}</CodeBlock>

    <h3>Visualize Your Codebase</h3>
    <CodeBlock lang="bash">{`
# Generate interactive visualization
aiready visualise .

# Opens a force-directed graph showing relationships
`}</CodeBlock>

    <h3>Upload to Platform (Optional)</h3>
    <CodeBlock lang="bash">{`
# Create a free account at platform.getaiready.dev
# Then upload your results
aiready scan . --upload --api-key ar_your_key
`}</CodeBlock>
    <p>Track trends over time and see your improvements!</p>

    <h2>Step 6: Integrate into Your Workflow</h2>

    <h3>Add to CI/CD</h3>
    <CodeBlock lang="yaml">{`
# GitHub Actions example
- name: Check AI Readiness
  run: |
    npx @aiready/cli scan . --score --threshold 75
`}</CodeBlock>

    <h3>Pre-commit Hook</h3>
    <CodeBlock lang="json">{`
// Add to package.json
{
  "scripts": {
    "precommit": "aiready scan . --score --threshold 70"
  }
}
`}</CodeBlock>

    <h3>VS Code Extension</h3>
    <p>
      Install the{' '}
      <a href="https://marketplace.visualstudio.com/items?itemName=pengcao.aiready">
        AIReady VS Code extension
      </a>{' '}
      for real-time feedback as you code.
    </p>

    <h2>Real-World Example</h2>
    <p>Let&apos;s see how AIReady helped improve a real project:</p>

    <p>
      <strong>Before:</strong>
    </p>
    <ul>
      <li>Score: 62/100</li>
      <li>23 semantic duplicates</li>
      <li>Import depth: 5 levels</li>
      <li>8 inconsistent naming patterns</li>
    </ul>

    <p>
      <strong>After 2 hours of fixes:</strong>
    </p>
    <ul>
      <li>Score: 84/100</li>
      <li>3 semantic duplicates (87% reduction)</li>
      <li>Import depth: 3 levels</li>
      <li>1 inconsistent pattern (88% improvement)</li>
    </ul>

    <p>
      <strong>Result:</strong> AI coding assistants now give relevant
      suggestions 40% faster.
    </p>

    <h2>Next Steps</h2>
    <ol>
      <li>
        <strong>Join the community:</strong>{' '}
        <a href="https://discord.gg/aiready">Discord</a>
      </li>
      <li>
        <strong>Track trends:</strong>{' '}
        <a href="https://platform.getaiready.dev">Platform</a>
      </li>
      <li>
        <strong>Read more:</strong>{' '}
        <a href="./docs/AI_ENGINEERING_HANDBOOK.md">AI Engineering Handbook</a>
      </li>
      <li>
        <strong>Contribute:</strong>{' '}
        <a href="https://github.com/caopengau/aiready">GitHub</a>
      </li>
    </ol>

    <h2>Common Questions</h2>

    <p>
      <strong>Q: Does AIReady work with my framework?</strong>
    </p>
    <p>
      A: Yes! AIReady supports TypeScript, JavaScript, Python, Java, Go, and C#.
      It works with any framework.
    </p>

    <p>
      <strong>Q: Is it free?</strong>
    </p>
    <p>
      A: Yes! The CLI and all analysis tools are free and open source. The
      Platform has a free tier with paid plans for teams.
    </p>

    <p>
      <strong>Q: How is this different from a linter?</strong>
    </p>
    <p>
      A: Linters check code quality for humans. AIReady checks code quality for
      AI tools. They&apos;re complementary, not competing.
    </p>

    <p>
      <strong>Q: Can I use this in my company?</strong>
    </p>
    <p>A: Absolutely! AIReady is MIT licensed. Use it anywhere.</p>

    <h2>Conclusion</h2>
    <p>
      Making your codebase AI-ready isn&apos;t about perfection — it&apos;s
      about removing the friction that makes AI tools less effective. Start with
      a scan, fix the top 3 issues, and watch your AI assistants become more
      helpful.
    </p>
    <p>Ready to try it? Run this now:</p>
    <CodeBlock lang="bash">{`
npx @aiready/cli scan .
`}</CodeBlock>

    <hr className="my-12 border-slate-200 dark:border-zinc-800" />

    <p>
      <strong>Found this helpful?</strong> Share it with your team and join our{' '}
      <a href="https://discord.gg/aiready">Discord community</a> to discuss AI
      readiness strategies.
    </p>
    <p>
      <strong>Want to track improvements over time?</strong> Check out{' '}
      <a href="https://platform.getaiready.dev">AIReady Platform</a> for trend
      tracking, team collaboration, and CI/CD integration.
    </p>
  </>
);

export default Post;
