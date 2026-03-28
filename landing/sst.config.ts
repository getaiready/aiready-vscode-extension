// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./.sst/platform/config.d.ts" />

// Suppress AWS SDK warning when both profile and static keys are set
// by prioritizing the profile (which is the project standard)
if (
  process.env.AWS_PROFILE &&
  (process.env.AWS_ACCESS_KEY_ID || process.env.AWS_SECRET_ACCESS_KEY)
) {
  delete process.env.AWS_ACCESS_KEY_ID;
  delete process.env.AWS_SECRET_ACCESS_KEY;
}

export default $config({
  app(input) {
    return {
      name: 'aiready-landing',
      removal: input?.stage === 'production' ? 'retain' : 'remove',
      home: 'aws',
    };
  },
  async run() {
    const cloudflareZoneId = '50eb7dcadc84c58ab34583742db0b671';

    // Storage for report submissions
    const submissions = new sst.aws.Bucket('Submissions', {
      public: false,
    });

    // SES domain identity is managed as infrastructure so DNS verification is reproducible.
    const domainName = 'getaiready.dev';
    const defaultSesFromEmail = `notifications@${domainName}`;
    const manageSesDomainIdentity =
      $app.stage === 'production' ||
      process.env.SES_MANAGE_DOMAIN_IDENTITY === 'true';
    const emailDomain = manageSesDomainIdentity
      ? new sst.aws.Email('NotificationEmail', {
          sender: domainName,
          dns: sst.cloudflare.dns({
            zone: cloudflareZoneId,
          }),
        })
      : undefined;

    // API Gateway HTTP API for public form submissions
    const api = new sst.aws.ApiGatewayV2('RequestApi', {
      cors: true,
    });

    api.route('POST /', {
      handler: 'api/request-report.handler',
      link: [submissions],
      environment: {
        SUBMISSIONS_BUCKET: submissions.name,
        SES_TO_EMAIL: process.env.SES_TO_EMAIL || '',
        SES_FROM_EMAIL: process.env.SES_FROM_EMAIL || defaultSesFromEmail,
        SES_CONFIGURATION_SET:
          'aiready-landing-production-notificationemailconfig-ttxwnzxe',
      },
      permissions: [
        {
          actions: ['ses:SendEmail', 'ses:SendRawEmail'],
          resources: ['*'],
        },
      ],
    });

    // Static site deployment
    const site = new sst.aws.StaticSite('AireadyLanding', {
      path: './',
      build: {
        command: 'pnpm build',
        output: 'out',
      },
      environment: {
        NEXT_PUBLIC_REQUEST_URL: api.url,
      },
      domain: {
        name:
          $app.stage === 'production'
            ? 'getaiready.dev'
            : `${$app.stage}.getaiready.dev`,
        redirects:
          $app.stage === 'production'
            ? ['www.getaiready.dev']
            : [`www.${$app.stage}.getaiready.dev`],
        dns: sst.cloudflare.dns({
          zone: cloudflareZoneId,
          proxy: true,
        }),
      },
      invalidation: {
        paths: ['/*'],
        wait: true,
      },
    });

    const siteUrl = site.url;

    return {
      site: siteUrl,
      apiUrl: api.url,
      submissionsBucket: submissions.name,
      emailDomain: emailDomain?.sender ?? domainName,
    };
  },
});
