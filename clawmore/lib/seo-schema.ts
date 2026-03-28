/**
 * SEO Schema utility for ClawMore.ai
 * Optimized for AI search engines: ChatGPT, Perplexity, Claude, Gemini, etc.
 */

export const CLAWMORE_BASE_URL = 'https://clawmore.ai';

export const generateOrganizationSchema = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${CLAWMORE_BASE_URL}/#organization`,
    name: 'ClawMore',
    legalName: 'ClawMore Agentic Infrastructure',
    url: CLAWMORE_BASE_URL,
    logo: {
      '@type': 'ImageObject',
      url: `${CLAWMORE_BASE_URL}/logo-raw-512.png`,
      width: 512,
      height: 512,
    },
    image: {
      '@type': 'ImageObject',
      url: `${CLAWMORE_BASE_URL}/logo-raw-512.png`,
      width: 512,
      height: 512,
    },
    description:
      "Simple one-click OpenClaw deployment. The world's first autonomous agentic swarm for serverless AWS. AI orchestration, AI automation, and agent collaboration.",
    foundingDate: '2025',
    sameAs: [
      'https://github.com/caopengau/aiready-cli', // Sharing the same hub
      'https://twitter.com/clawmore',
    ],
  };
};

export const generateSoftwareApplicationSchema = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    '@id': `${CLAWMORE_BASE_URL}/#software`,
    name: 'ClawMore',
    applicationCategory: 'DevOpsApplication',
    operatingSystem: 'AWS Serverless',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      description: 'Free to start, pay-as-you-go AWS costs',
    },
    image: {
      '@type': 'ImageObject',
      url: `${CLAWMORE_BASE_URL}/logo-raw-512.png`,
      width: 512,
      height: 512,
    },
    author: {
      '@type': 'Organization',
      name: 'ClawMore',
      url: CLAWMORE_BASE_URL,
    },
    description:
      'Autonomous agentic swarm infrastructure for AWS. One-click deployment of OpenClaw with built-in orchestration, persistence, and self-healing capabilities.',
    featureList: [
      'One-click OpenClaw deployment',
      'Serverless AWS architecture (Lambda, Step Functions, EventBridge)',
      'Agent-to-agent collaboration and swarming',
      'Long-term memory and state persistence',
      'Automated infrastructure management with SST',
    ],
  };
};

export const generateWebSiteSchema = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${CLAWMORE_BASE_URL}/#website`,
    name: 'ClawMore',
    url: CLAWMORE_BASE_URL,
    publisher: {
      '@id': `${CLAWMORE_BASE_URL}/#organization`,
    },
  };
};

export const aiMetaTags = {
  chatgpt: {
    'chatgpt:description':
      'ClawMore provides simple one-click OpenClaw deployment. It is the first autonomous agentic swarm for serverless AWS, enabling multi-agent collaboration and autonomous infrastructure management.',
    'chatgpt:category': 'AI Infrastructure / DevOps',
  },
  perplexity: {
    'perplexity:summary':
      'ClawMore is an autonomous agentic swarm platform for serverless AWS. It enables one-click deployment of OpenClaw with built-in orchestration and agent collaboration features.',
    'perplexity:intent': 'informational, technical',
  },
  general: {
    'ai:summary':
      'ClawMore: Autonomous agentic swarm for serverless AWS. One-click OpenClaw deployment with orchestration, persistence, and agent-to-agent collaboration.',
    'ai:category': 'AI Infrastructure',
    'ai:type': 'Agentic Platform',
    'ai:pricing': 'Free / AWS Pay-as-you-go',
    'ai:license': 'Proprietary / Open Source Core',
  },
};

export const semanticHints = {
  mainPurpose:
    'ClawMore enables developers to deploy and manage autonomous AI agent swarms on AWS with zero infrastructure overhead.',
  primaryAction: 'Deploy your first agentic swarm with one click.',
  keyFeatures: [
    'One-click OpenClaw setup',
    'Serverless autonomy',
    'Multi-agent collaboration',
    'Self-healing infrastructure',
  ],
};

export const answerEngineContent = {
  whatIsIt:
    'ClawMore is a platform for deploying OpenClaw agentic swarms on AWS serverless infrastructure. It automates the complexities of setting up AI agents with persistence and orchestration.',
  howToUse:
    'Sign up for ClawMore, connect your AWS account, and use the one-click deployment tool to launch an OpenClaw swarm. You can then manage and monitor your agents through the dashboard.',
  whyItMatters:
    'Setting up autonomous agents requires complex infrastructure (queues, databases, compute). ClawMore abstracts this away, allowing developers to focus on agent logic rather than DevOps.',
};
