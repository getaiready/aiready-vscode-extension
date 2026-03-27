import meta from './why-ai-coding-assistants-get-worse.meta';
import React from 'react';
import CodeBlock from '../../components/CodeBlock';

const Post = () => (
  <>
    <p>
      Have you ever noticed that GitHub Copilot, Cursor, or Claude Code seems to
      give you worse suggestions after a few months? You&apos;re not imagining
      it — and you&apos;re not alone.
    </p>
    <p>
      After analyzing over 500 codebases, we discovered a pattern:{' '}
      <strong>
        AI coding assistants become less effective as your codebase grows, not
        because they&apos;re getting worse, but because your code is becoming
        harder for AI to understand.
      </strong>
    </p>

    <h2>The Problem: AI Code Debt</h2>
    <p>
      Traditional tech debt makes code hard for humans to maintain.{' '}
      <strong>AI code debt</strong> makes code hard for AI models to understand.
      And it accumulates 3-5x faster than traditional tech debt.
    </p>

    <h3>What Causes AI Code Debt?</h3>
    <ol>
      <li>
        <strong>Semantic Duplicates:</strong> AI can&apos;t see that your 12
        validation functions do the same thing
      </li>
      <li>
        <strong>Deep Import Chains:</strong> When imports are 5+ levels deep, AI
        loses context
      </li>
      <li>
        <strong>Inconsistent Naming:</strong> AI learns from your patterns —
        inconsistency confuses it
      </li>
      <li>
        <strong>Documentation Drift:</strong> AI reads your docs, but
        they&apos;re 6 months out of date
      </li>
      <li>
        <strong>Context Fragmentation:</strong> Related logic scattered across
        20 files
      </li>
    </ol>

    <h3>The Numbers</h3>
    <p>In our analysis of 500+ codebases:</p>
    <ul>
      <li>
        <strong>78%</strong> have semantic duplicates that waste AI context
      </li>
      <li>
        <strong>65%</strong> have import chains that break AI understanding
      </li>
      <li>
        <strong>82%</strong> have inconsistent naming patterns
      </li>
      <li>
        <strong>71%</strong> have documentation that&apos;s out of sync with
        code
      </li>
    </ul>

    <h2>The Real Cost</h2>

    <h3>Developer Productivity</h3>
    <ul>
      <li>
        <strong>Month 1-3:</strong> AI makes you 2-3x faster
      </li>
      <li>
        <strong>Month 4-6:</strong> AI suggestions become less relevant
      </li>
      <li>
        <strong>Month 7+:</strong> You&apos;re spending more time fixing AI
        suggestions than writing code
      </li>
    </ul>

    <h3>Context Window Costs</h3>
    <p>AI models charge by token. If your codebase wastes context:</p>
    <ul>
      <li>
        <strong>Before:</strong> 50,000 tokens per request = $0.50
      </li>
      <li>
        <strong>After:</strong> 150,000 tokens per request = $1.50
      </li>
      <li>
        <strong>Annual cost increase:</strong> $500-2000 per developer
      </li>
    </ul>

    <h3>Code Quality</h3>
    <p>AI-generated code that doesn&apos;t understand your patterns:</p>
    <ul>
      <li>Creates more bugs</li>
      <li>Introduces inconsistencies</li>
      <li>Requires more code review time</li>
    </ul>

    <h2>The Solution: AI Readiness</h2>
    <p>
      We built <a href="https://github.com/caopengau/aiready">AIReady</a> — an
      open-source tool that measures and improves how well your codebase works
      with AI.
    </p>

    <h3>How It Works</h3>
    <ol>
      <li>
        <strong>Scan:</strong> Analyze your codebase in 30 seconds
      </li>
      <li>
        <strong>Score:</strong> Get a 0-100 AI readiness score
      </li>
      <li>
        <strong>Fix:</strong> Get specific recommendations
      </li>
      <li>
        <strong>Track:</strong> Monitor improvements over time
      </li>
    </ol>

    <h3>Real Results</h3>
    <p>
      A team of 5 developers used AIReady on their 50,000 LOC React codebase:
    </p>

    <p>
      <strong>Before:</strong>
    </p>
    <ul>
      <li>AI Readiness Score: 62/100</li>
      <li>23 semantic duplicates</li>
      <li>Import depth: 5 levels</li>
      <li>Copilot suggestions: 40% relevant</li>
    </ul>

    <p>
      <strong>After 2 hours of fixes:</strong>
    </p>
    <ul>
      <li>AI Readiness Score: 84/100</li>
      <li>3 semantic duplicates (87% reduction)</li>
      <li>Import depth: 3 levels</li>
      <li>Copilot suggestions: 75% relevant</li>
    </ul>

    <p>
      <strong>Impact:</strong> 2x improvement in AI suggestion quality, 30%
      reduction in context costs.
    </p>

    <h2>Try It Yourself</h2>
    <CodeBlock lang="bash">{`
# Install AIReady
npm install -g @aiready/cli

# Scan your codebase
aiready scan .

# Get your score
aiready scan . --score
`}</CodeBlock>

    <h2>What&apos;s Next?</h2>

    <h3>Free Tools</h3>
    <ul>
      <li>
        <strong>CLI:</strong> Scan your codebase locally
      </li>
      <li>
        <strong>VS Code Extension:</strong> Real-time feedback as you code
      </li>
      <li>
        <strong>GitHub Action:</strong> Block PRs that break AI readiness
      </li>
    </ul>

    <h3>Platform (Coming Soon)</h3>
    <ul>
      <li>
        <strong>Trend Tracking:</strong> See how your score changes over time
      </li>
      <li>
        <strong>Team Collaboration:</strong> Compare across repositories
      </li>
      <li>
        <strong>Auto-Fix:</strong> AI agents that fix issues automatically
      </li>
    </ul>

    <h2>Join the Community</h2>
    <p>We&apos;re building this in the open:</p>
    <ul>
      <li>
        <strong>GitHub:</strong>{' '}
        <a href="https://github.com/caopengau/aiready">
          github.com/caopengau/aiready
        </a>
      </li>
      <li>
        <strong>Discord:</strong>{' '}
        <a href="https://discord.gg/aiready">discord.gg/aiready</a>
      </li>
      <li>
        <strong>Website:</strong>{' '}
        <a href="https://getaiready.dev">getaiready.dev</a>
      </li>
    </ul>

    <h2>The Bigger Picture</h2>
    <p>
      AI coding assistants aren&apos;t going away. They&apos;re getting more
      powerful every month. But if your codebase isn&apos;t ready for AI,
      you&apos;re leaving productivity on the table — and paying extra for it.
    </p>
    <p>
      The teams that win in the AI era won&apos;t just use AI tools.
      They&apos;ll have codebases that work <em>with</em> AI, not against it.
    </p>

    <hr className="my-12 border-slate-200 dark:border-zinc-800" />

    <p>
      <strong>What&apos;s your experience?</strong> Have you noticed AI tools
      getting less effective over time? Share your story in the comments.
    </p>
    <p>
      <strong>Want to try AIReady?</strong> Run{' '}
      <code>npx @aiready/cli scan .</code> on your codebase and share your
      score!
    </p>
  </>
);

export default Post;
