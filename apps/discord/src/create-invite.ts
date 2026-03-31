/**
 * Discord Server Public Invite Creator
 *
 * Creates a permanent invite link for the AIReady Discord server
 * and optionally enables community features.
 *
 * Usage:
 *   pnpm --filter @aiready/discord invite
 *   or
 *   cd discord && pnpm invite
 */

import 'dotenv/config';
import { Client, GatewayIntentBits, ChannelType } from 'discord.js';

async function createPublicInvite() {
  const token = process.env.DISCORD_BOT_TOKEN;
  const serverId = process.env.DISCORD_SERVER_ID;

  if (!token) {
    console.error('❌ DISCORD_BOT_TOKEN environment variable is required');
    console.log('   Set it in discord/.env or export it');
    process.exit(1);
  }

  if (!serverId) {
    console.error('❌ DISCORD_SERVER_ID environment variable is required');
    console.log('   Set it in discord/.env or export it');
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

    // Fetch all channels first
    const channels = await guild.channels.fetch();

    // Find the welcome channel or create a dedicated invite channel
    let inviteChannel = channels.find(
      (c) => c?.name === 'welcome' && c.type === ChannelType.GuildText
    );

    if (!inviteChannel) {
      console.log(
        '⚠️  Welcome channel not found, looking for general channel...'
      );
      inviteChannel = channels.find(
        (c) => c?.name === 'general' && c.type === ChannelType.GuildText
      );
    }

    if (!inviteChannel) {
      console.error('❌ No suitable channel found for invite link');
      process.exit(1);
    }

    // Create or get existing permanent invite
    console.log(`\n🔗 Creating permanent invite for #${inviteChannel.name}...`);

    // Check for existing invites
    const existingInvites = await guild.invites.fetch();
    let permanentInvite = existingInvites.find(
      (invite) =>
        invite.maxAge === 0 && // Never expires
        invite.maxUses === 0 && // Unlimited uses
        invite.inviter?.id === client.user?.id
    );

    if (permanentInvite) {
      console.log(`✅ Using existing permanent invite: ${permanentInvite.url}`);
    } else {
      // Create new permanent invite
      const invite = await inviteChannel.createInvite({
        maxAge: 0, // Never expires
        maxUses: 0, // Unlimited uses
        unique: true,
        reason: 'Public invite link for AIReady community',
      });
      permanentInvite = invite;
      console.log(`✅ Created new permanent invite: ${invite.url}`);
    }

    // Display invite information
    console.log('\n📋 Invite Details:');
    console.log(`   URL: ${permanentInvite.url}`);
    console.log(`   Channel: #${inviteChannel.name}`);
    console.log(`   Expires: Never`);
    console.log(`   Max Uses: Unlimited`);
    console.log(`   Created: ${permanentInvite.createdAt?.toLocaleString()}`);

    // Optionally enable community features
    console.log('\n⚙️  Checking community features...');
    try {
      const features = guild.features;
      const hasCommunity = features.includes('COMMUNITY');

      if (hasCommunity) {
        console.log('✅ Community features already enabled');
      } else {
        console.log('ℹ️  Community features not enabled');
        console.log('   To enable community features:');
        console.log('   1. Go to Server Settings');
        console.log('   2. Click on "Enable Community"');
        console.log('   3. Follow the setup wizard');
        console.log(
          '   This will enable server discovery and other community features'
        );
      }
    } catch (error) {
      console.error('⚠️  Could not check community features:', error);
    }

    // Generate output for documentation
    console.log('\n📝 Documentation Snippets:');
    console.log('\n--- For README.md ---');
    console.log(
      `[![Discord](https://img.shields.io/discord/YOUR_DISCORD_ID?label=Discord&logo=discord)](${permanentInvite.url})`
    );
    console.log(`Join our Discord community: ${permanentInvite.url}`);

    console.log('\n--- For HTML/Website ---');
    console.log(`<a href="${permanentInvite.url}">`);
    console.log(
      `  <img src="https://img.shields.io/discord/YOUR_DISCORD_ID?label=Discord&logo=discord" alt="Discord">`
    );
    console.log(`</a>`);

    console.log('\n--- For Markdown ---');
    console.log(`[Join Discord Community](${permanentInvite.url})`);

    // Save invite URL to file for easy access
    const fs = await import('fs');
    const path = await import('path');
    const inviteFile = path.join(process.cwd(), 'discord-invite.txt');
    fs.writeFileSync(inviteFile, permanentInvite.url);
    console.log(`\n💾 Invite URL saved to: ${inviteFile}`);

    console.log('\n✅ Public Discord setup complete!');
    console.log('\n📝 Next steps:');
    console.log(
      '   1. Share the invite link on your website, GitHub, and social media'
    );
    console.log('   2. Add the invite link to your landing page');
    console.log('   3. Update README files with the Discord badge');
    console.log(
      '   4. Consider enabling Community features for server discovery'
    );
  } catch (error) {
    console.error('❌ Failed to create invite:', error);
    process.exit(1);
  } finally {
    client.destroy();
  }
}

// Run the invite creator
createPublicInvite();
