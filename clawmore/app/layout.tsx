import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Script from 'next/script';
import {
  generateOrganizationSchema,
  generateSoftwareApplicationSchema,
  generateWebSiteSchema,
  aiMetaTags,
} from '@/lib/seo-schema';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'ClawMore | OpenClaw Agentic Swarm for AWS',
    template: '%s | ClawMore',
  },
  description:
    "ClawMore: Simple one-click OpenClaw deployment. The world's first autonomous agentic swarm for serverless AWS. AI orchestration, AI automation, and agent-to-agent collaboration — enabling human-to-agent and multi-human multi-agent collaboration.",
  keywords: [
    'openclaw',
    'serverless',
    'agentic',
    'agentic swarm',
    'ai agent',
    'ai orchestration',
    'ai automation',
    'simple openclaw',
    'one click openclaw',
    'agent to agent collaboration',
    'human to agent collaboration',
    'multi human multi agent collaboration',
    'AWS',
    'Autonomous Agents',
    'Infrastructure as Code',
    'SST',
    'AI Agents',
    'Self-Healing Infrastructure',
  ],
  authors: [{ name: 'ClawMore Team' }],
  creator: 'ClawMore',
  metadataBase: new URL('https://clawmore.ai'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://clawmore.ai',
    siteName: 'ClawMore',
    title: 'ClawMore | OpenClaw Agentic Swarm for AWS',
    description:
      "Simple one-click OpenClaw deployment. The world's first autonomous agentic swarm for serverless AWS. AI orchestration, AI automation, and agent collaboration.",
    images: [
      {
        url: '/og-home.png',
        width: 1200,
        height: 630,
        alt: 'ClawMore - Autonomous Infrastructure Evolution',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ClawMore | OpenClaw Agentic Swarm for AWS',
    description:
      'Simple one-click OpenClaw deployment. Autonomous agentic swarm for serverless AWS. AI orchestration and agent collaboration.',
    creator: '@clawmore',
    images: ['/og-home.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '',
  },
  other: {
    'chatgpt:description': aiMetaTags.chatgpt['chatgpt:description'],
    'chatgpt:category': aiMetaTags.chatgpt['chatgpt:category'],
    'perplexity:summary': aiMetaTags.perplexity['perplexity:summary'],
    'perplexity:intent': aiMetaTags.perplexity['perplexity:intent'],
    'ai:summary': aiMetaTags.general['ai:summary'],
    'ai:category': aiMetaTags.general['ai:category'],
    'ai:type': aiMetaTags.general['ai:type'],
    'ai:pricing': aiMetaTags.general['ai:pricing'],
    'ai:license': aiMetaTags.general['ai:license'],
  },
  icons: {
    icon: [
      { url: '/logo-raw-512.png', sizes: '32x32', type: 'image/png' },
      { url: '/logo-raw-512.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [{ url: '/logo-raw-512.png', sizes: '180x180', type: 'image/png' }],
  },
};

import { headers } from 'next/headers';
import Providers from '../components/Providers';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headerList = await headers();
  const locale = headerList.get('X-NEXT-LOCALE') || 'en';

  return (
    <html lang={locale}>
      <head>
        <Script
          id="organization-schema-clawmore"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateOrganizationSchema()),
          }}
        />
        <Script
          id="software-schema-clawmore"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateSoftwareApplicationSchema()),
          }}
        />
        <Script
          id="website-schema-clawmore"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateWebSiteSchema()),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased text-left`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
