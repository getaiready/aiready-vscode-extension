# Discord Server Setup Guide

This guide explains how to set up and manage the AIReady Discord server using Infrastructure as Code (IaC).

## Overview

The Discord server is managed programmatically using a TypeScript script (`scripts/discord-setup.ts`) that creates:
- Roles with proper permissions
- Categories and channels
- Server configuration

## Why One Server?

We use **one Discord server** for the entire AIReady ecosystem (AIReady + ClawMore):

- **Unified community:** Developers using AIReady tools may also want ClawMore
- **Cross-pollination:** Platform users discover ClawMore naturally
- **Easier management:** One server to moderate, one community to build
- **Channel separation:** Use categories to organize discussions

## Prerequisites

1. **Discord Application**
   - Go to https://discord.com/developers/applications
   - Click "New Application"
   - Name it "AIReady Bot"

2. **Bot Setup**
   - Go to "Bot" section
   - Click "Reset Token" and copy the token
   - Enable "Server Members Intent"
   - Enable "Message Content Intent"

3. **Invite Bot to Server**
   - Go to "OAuth2" > "URL Generator"
   - Select scopes: `bot`
   - Select permissions: `Administrator`
   - Copy the URL and open it in browser
   - Select your server and authorize

4. **Get Server ID**
   - Enable Developer Mode in Discord (Settings > Advanced > Developer Mode)
   - Right-click your server name
   - Click "Copy ID"

## Setup Instructions

### Option 1: Using Environment Variables

```bash
# Set environment variables
export DISCORD_BOT_TOKEN=your_bot_token_here
export DISCORD_SERVER_ID=your_server_id_here

# Run setup
pnpm discord:setup
```

### Option 2: Using .env File

Create a `.env` file in the project root:

```env
DISCORD_BOT_TOKEN=your_bot_token_here
DISCORD_SERVER_ID=your_server_id_here
```

Then run:

```bash
pnpm discord:setup
```

## Server Structure

The script creates the following structure:

### Roles

| Role | Color | Permissions |
|------|-------|-------------|
| Admin | Red | Administrator |
| Moderator | Green | Manage messages, kick, mute |
| Contributor | Blue | None (recognition only) |
| Ambassador | Orange | None (recognition only) |
| Member | Gray | Default |

### Categories & Channels

```
📌 INFORMATION
├── welcome
├── rules
└── announcements (read-only)

💬 COMMUNITY
├── general
├── showcase
├── feedback
└── off-topic

🛠️ SUPPORT
├── help
├── cli-support
├── platform-support
└── vscode-support

🚀 CLAWMORE
├── clawmore-general
├── clawmore-support
└── clawmore-showcase

🤝 CONTRIBUTING
├── contributions
├── good-first-issues
└── code-review

🎤 VOICE
├── Office Hours
├── Pair Programming
└── Hangout
```

## Customization

### Adding New Channels

Edit `scripts/discord-setup.ts` and add to the appropriate category:

```typescript
{
  name: 'new-channel',
  type: ChannelType.GuildText,
  topic: 'Description of the channel.',
}
```

### Adding New Roles

Add to the `roles` array:

```typescript
{
  name: 'New Role',
  color: 0xHEXCODE,
  permissions: [PermissionsBitField.Flags.SOME_PERMISSION],
  hoist: true,
  mentionable: true,
}
```

### Modifying Permissions

Update the `permissionOverwrites` array for specific channels:

```typescript
{
  name: 'announcements',
  type: ChannelType.GuildText,
  topic: 'Product updates.',
  permissionOverwrites: [
    {
      id: 'everyone',
      deny: [PermissionsBitField.Flags.SendMessages],
    },
    {
      id: 'Contributor',
      allow: [PermissionsBitField.Flags.SendMessages],
    },
  ],
}
```

## Updating the Server

To update the server configuration:

1. Modify `scripts/discord-setup.ts`
2. Run `pnpm discord:setup` again

The script is idempotent — it will:
- Skip existing roles and channels
- Create new ones
- Update permissions if changed

## Troubleshooting

### Bot Missing Permissions

**Error:** `Missing Permissions`

**Solution:** Ensure the bot has Administrator permissions and is higher in the role hierarchy than the roles it's trying to manage.

### Channel Creation Failed

**Error:** `Cannot create channel`

**Solution:** Check that:
- Bot has `Manage Channels` permission
- Bot role is above the channels it's creating
- Server hasn't reached channel limit (500 channels)

### Rate Limiting

**Error:** `Rate limited`

**Solution:** The Discord API has rate limits. Wait a few minutes and try again. The script handles most rate limits automatically.

## Best Practices

1. **Version Control:** Keep `scripts/discord-setup.ts` in Git
2. **Environment Variables:** Never commit tokens to Git
3. **Regular Updates:** Run the script after making changes
4. **Backup:** Export server settings manually before major changes
5. **Testing:** Test changes in a development server first

## Security

- **Bot Token:** Keep it secret, rotate regularly
- **Permissions:** Use least-privilege principle
- **Audit Logs:** Monitor Discord audit logs for changes
- **Server Backup:** Regularly backup server settings

## Related Documentation

- [Community Guidelines](./COMMUNITY-GUIDELINES.md)
- [Discord Guide](./DISCORD-GUIDE.md)
- [Organic Growth Strategy](./platform/ORGANIC-GROWTH-STRATEGY.md)
