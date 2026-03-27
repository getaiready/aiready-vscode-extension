/**
 * Discord Server Setup Script
 *
 * This script sets up the AIReady Discord server with all channels,
 * roles, and permissions using discord.js.
 *
 * Usage:
 *   DISCORD_BOT_TOKEN=xxx DISCORD_SERVER_ID=xxx pnpm discord:setup
 *
 * Prerequisites:
 *   1. Create a Discord application at https://discord.com/developers/applications
 *   2. Create a Bot and copy the token
 *   3. Invite the bot to your server with Administrator permissions
 *   4. Get your server ID (right-click server > Copy ID)
 */

import {
  Client,
  GatewayIntentBits,
  ChannelType,
  PermissionsBitField,
} from 'discord.js';

interface ChannelConfig {
  name: string;
  type: ChannelType;
  topic?: string;
  parent?: string;
  permissionOverwrites?: Array<{
    id: string;
    allow?: bigint[];
    deny?: bigint[];
  }>;
}

interface RoleConfig {
  name: string;
  color?: number;
  permissions?: bigint[];
  hoist?: boolean;
  mentionable?: boolean;
}

// Server configuration
const SERVER_CONFIG = {
  name: 'AIReady',
  roles: [
    {
      name: 'Admin',
      color: 0xff0000, // Red
      permissions: [PermissionsBitField.Flags.Administrator],
      hoist: true,
      mentionable: true,
    },
    {
      name: 'Moderator',
      color: 0x00ff00, // Green
      permissions: [
        PermissionsBitField.Flags.ManageMessages,
        PermissionsBitField.Flags.KickMembers,
        PermissionsBitField.Flags.MuteMembers,
        PermissionsBitField.Flags.DeafenMembers,
        PermissionsBitField.Flags.MoveMembers,
      ],
      hoist: true,
      mentionable: true,
    },
    {
      name: 'Contributor',
      color: 0x0099ff, // Blue
      permissions: [],
      hoist: true,
      mentionable: true,
    },
    {
      name: 'Ambassador',
      color: 0xff9900, // Orange
      permissions: [],
      hoist: true,
      mentionable: true,
    },
    {
      name: 'Member',
      color: 0x99aab5, // Gray
      permissions: [],
      hoist: false,
      mentionable: false,
    },
  ] as RoleConfig[],

  categories: [
    {
      name: '📌 INFORMATION',
      channels: [
        {
          name: 'welcome',
          type: ChannelType.GuildText,
          topic: 'Welcome to AIReady! Read the rules and introduce yourself.',
        },
        {
          name: 'rules',
          type: ChannelType.GuildText,
          topic: 'Community guidelines and rules.',
        },
        {
          name: 'announcements',
          type: ChannelType.GuildText,
          topic: 'Product updates, releases, and important news.',
          permissionOverwrites: [
            {
              id: 'everyone',
              deny: [PermissionsBitField.Flags.SendMessages],
            },
          ],
        },
      ],
    },
    {
      name: '💬 COMMUNITY',
      channels: [
        {
          name: 'general',
          type: ChannelType.GuildText,
          topic: 'Open conversation about AI readiness and development.',
        },
        {
          name: 'showcase',
          type: ChannelType.GuildText,
          topic: 'Share what you built with AIReady. Include screenshots/code!',
        },
        {
          name: 'feedback',
          type: ChannelType.GuildText,
          topic: 'Feature requests, bug reports, and suggestions.',
        },
        {
          name: 'off-topic',
          type: ChannelType.GuildText,
          topic: 'Non-product discussions. Keep it friendly!',
        },
      ],
    },
    {
      name: '🛠️ SUPPORT',
      channels: [
        {
          name: 'help',
          type: ChannelType.GuildText,
          topic: 'Get help with AIReady. Search before asking!',
        },
        {
          name: 'cli-support',
          type: ChannelType.GuildText,
          topic: 'Help with the AIReady CLI tool.',
        },
        {
          name: 'platform-support',
          type: ChannelType.GuildText,
          topic: 'Help with the AIReady Platform (SaaS).',
        },
        {
          name: 'vscode-support',
          type: ChannelType.GuildText,
          topic: 'Help with the VS Code extension.',
        },
      ],
    },
    {
      name: '🚀 CLAWMORE',
      channels: [
        {
          name: 'clawmore-general',
          type: ChannelType.GuildText,
          topic: 'Discussion about ClawMore managed infrastructure.',
        },
        {
          name: 'clawmore-support',
          type: ChannelType.GuildText,
          topic: 'Get help with ClawMore.',
        },
        {
          name: 'clawmore-showcase',
          type: ChannelType.GuildText,
          topic: 'Share your ClawMore deployments and wins.',
        },
      ],
    },
    {
      name: '🤝 CONTRIBUTING',
      channels: [
        {
          name: 'contributions',
          type: ChannelType.GuildText,
          topic: 'Share your PRs, get feedback, collaborate.',
        },
        {
          name: 'good-first-issues',
          type: ChannelType.GuildText,
          topic: 'Find issues to contribute to.',
        },
        {
          name: 'code-review',
          type: ChannelType.GuildText,
          topic: 'Request and provide code reviews.',
        },
      ],
    },
    {
      name: '🎤 VOICE',
      channels: [
        {
          name: 'Office Hours',
          type: ChannelType.GuildVoice,
          topic: 'Weekly office hours - Tuesdays 10am PST',
        },
        {
          name: 'Pair Programming',
          type: ChannelType.GuildVoice,
          topic: 'Collaborate on code together.',
        },
        {
          name: 'Hangout',
          type: ChannelType.GuildVoice,
          topic: 'Casual voice chat.',
        },
      ],
    },
  ] as Array<{
    name: string;
    channels: ChannelConfig[];
  }>,
};

async function setupDiscordServer() {
  const token = process.env.DISCORD_BOT_TOKEN;
  const serverId = process.env.DISCORD_SERVER_ID;

  if (!token) {
    console.error('❌ DISCORD_BOT_TOKEN environment variable is required');
    console.log(
      '   Get your token from: https://discord.com/developers/applications'
    );
    process.exit(1);
  }

  if (!serverId) {
    console.error('❌ DISCORD_SERVER_ID environment variable is required');
    console.log('   Right-click your server in Discord > Copy ID');
    process.exit(1);
  }

  const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
  });

  try {
    console.log('🚀 Connecting to Discord...');
    await client.login(token);

    const guild = await client.guilds.fetch(serverId);
    console.log(`✅ Connected to server: ${guild.name}`);

    // Create roles
    console.log('\n📋 Creating roles...');
    const roleMap: Record<string, string> = {};

    for (const roleConfig of SERVER_CONFIG.roles) {
      try {
        const existingRole = guild.roles.cache.find(
          (r) => r.name === roleConfig.name
        );
        if (existingRole) {
          console.log(`   ⏭️  Role "${roleConfig.name}" already exists`);
          roleMap[roleConfig.name] = existingRole.id;
        } else {
          const role = await guild.roles.create({
            name: roleConfig.name,
            color: roleConfig.color,
            permissions: roleConfig.permissions,
            hoist: roleConfig.hoist,
            mentionable: roleConfig.mentionable,
          });
          console.log(`   ✅ Created role: ${roleConfig.name}`);
          roleMap[roleConfig.name] = role.id;
        }
      } catch (error) {
        console.error(
          `   ❌ Failed to create role "${roleConfig.name}":`,
          error
        );
      }
    }

    // Get @everyone role ID
    const everyoneRoleId = guild.id;

    // Create categories and channels
    console.log('\n📁 Creating categories and channels...');

    for (const categoryConfig of SERVER_CONFIG.categories) {
      try {
        // Check if category exists
        let category = guild.channels.cache.find(
          (c) =>
            c.type === ChannelType.GuildCategory &&
            c.name === categoryConfig.name
        );

        if (!category) {
          category = await guild.channels.create({
            name: categoryConfig.name,
            type: ChannelType.GuildCategory,
          });
          console.log(`   ✅ Created category: ${categoryConfig.name}`);
        } else {
          console.log(
            `   ⏭️  Category "${categoryConfig.name}" already exists`
          );
        }

        // Create channels in category
        for (const channelConfig of categoryConfig.channels) {
          try {
            const existingChannel = guild.channels.cache.find(
              (c) =>
                c.name === channelConfig.name && c.parentId === category?.id
            );

            if (existingChannel) {
              console.log(
                `      ⏭️  Channel "${channelConfig.name}" already exists`
              );
              continue;
            }

            const permissionOverwrites =
              channelConfig.permissionOverwrites?.map((perm) => ({
                id:
                  perm.id === 'everyone'
                    ? everyoneRoleId
                    : roleMap[perm.id] || perm.id,
                allow: perm.allow || [],
                deny: perm.deny || [],
              })) || [];

            const channel = await guild.channels.create({
              name: channelConfig.name,
              type: channelConfig.type,
              topic: channelConfig.topic,
              parent: category?.id,
              permissionOverwrites,
            });

            console.log(`      ✅ Created channel: ${channelConfig.name}`);
          } catch (error) {
            console.error(
              `      ❌ Failed to create channel "${channelConfig.name}":`,
              error
            );
          }
        }
      } catch (error) {
        console.error(
          `   ❌ Failed to create category "${categoryConfig.name}":`,
          error
        );
      }
    }

    // Set up server settings
    console.log('\n⚙️  Configuring server settings...');
    try {
      await guild.setVerificationLevel(1); // Low verification
      console.log('   ✅ Set verification level to Low');
    } catch (error) {
      console.error('   ❌ Failed to set verification level:', error);
    }

    console.log('\n✅ Discord server setup complete!');
    console.log('\n📝 Next steps:');
    console.log('   1. Invite community members');
    console.log('   2. Post welcome message in #welcome');
    console.log('   3. Pin important rules and guidelines');
    console.log('   4. Schedule first office hours');
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  } finally {
    client.destroy();
  }
}

// Run the setup
setupDiscordServer();
