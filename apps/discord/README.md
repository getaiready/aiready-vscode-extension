# AIReady Discord Server

Discord server management and bot for the AIReady community.

## Setup

### Prerequisites

1. Create a Discord application at https://discord.com/developers/applications
2. Create a bot and get the bot token
3. Create a Discord server or use an existing one
4. Get the server ID (right-click server → Copy ID, enable Developer Mode in Discord settings)

### Environment Variables

Create a `.env` file in the `apps/discord` directory:

```env
DISCORD_BOT_TOKEN=your_bot_token_here
DISCORD_SERVER_ID=your_server_id_here
```

### Installation

```bash
# From the monorepo root
pnpm install

# Or from the discord directory
cd apps/discord
pnpm install
```

## Usage

### Setup Server

Set up the Discord server with channels, roles, and permissions:

```bash
# From monorepo root
pnpm --filter @aiready/discord setup

# Or from discord directory
cd apps/discord
pnpm setup
```

### Register Commands

Register slash commands with Discord:

```bash
pnpm --filter @aiready/discord register
```

### Post Initial Content

Post welcome messages and initial content:

```bash
pnpm --filter @aiready/discord content
```

### Create Public Invite

Generate a permanent invite link for public sharing:

```bash
pnpm --filter @aiready/discord invite
```

This will:

- Create a permanent, unlimited-use invite link
- Save the invite URL to `discord-invite.txt`
- Display documentation snippets for various formats

### Run Bot

Start the Discord bot:

```bash
# Development (with auto-reload)
pnpm --filter @aiready/discord dev

# Production
pnpm --filter @aiready/discord start
```

## Making Your Discord Server Public

### Step 1: Generate Invite Link

```bash
pnpm --filter @aiready/discord invite
```

This creates a permanent invite link that never expires and has unlimited uses.

### Step 2: Enable Community Features (Optional)

To make your server discoverable in Discord's server discovery:

1. Go to **Server Settings** → **Enable Community**
2. Follow the setup wizard:
   - Set up a rules channel
   - Set up a community updates channel
   - Configure verification level
   - Set up moderation features

### Step 3: Share Your Server

Use the generated invite link in:

- **README.md**: Add a Discord badge

  ```markdown
  [![Discord](https://img.shields.io/discord/YOUR_DISCORD_ID?label=Discord&logo=discord)](YOUR_INVITE_URL)
  ```

- **Website/Landing Page**: Add a "Join Discord" button

  ```html
  <a href="YOUR_INVITE_URL">
    <img
      src="https://img.shields.io/discord/YOUR_DISCORD_ID?label=Discord&logo=discord"
      alt="Discord"
    />
  </a>
  ```

- **Social Media**: Share the invite link directly

### Step 4: Set Up Server Discovery (Optional)

After enabling Community features:

1. Go to **Server Settings** → **Enable Discovery**
2. Set up your server listing:
   - Server name and description
   - Server icon and banner
   - Primary language
   - Categories and tags
   - Server rules

## Server Structure

The server is configured with:

### Roles

- **Admin**: Full administrator permissions
- **Moderator**: Message management, member moderation
- **Contributor**: Recognition for code contributors
- **Ambassador**: Community ambassadors
- **Member**: Default role for all members

### Categories and Channels

📌 **INFORMATION**

- `#welcome` - Welcome message and server info
- `#rules` - Community guidelines
- `#announcements` - Product updates (read-only)

💬 **COMMUNITY**

- `#general` - Open conversation
- `#showcase` - Share your projects
- `#feedback` - Feature requests and bugs
- `#off-topic` - Casual chat

🛠️ **SUPPORT**

- `#help` - General help
- `#cli-support` - CLI tool support
- `#platform-support` - Platform support
- `#vscode-support` - VS Code extension support

🚀 **CLAWMORE**

- `#clawmore-general` - General discussion
- `#clawmore-support` - Support
- `#clawmore-showcase` - Share deployments

🤝 **CONTRIBUTING**

- `#contributions` - Share PRs
- `#good-first-issues` - Find issues to contribute
- `#code-review` - Request reviews

🎤 **VOICE**

- `#office-hours` - Office hours
- `#pair-programming` - Pair programming
- `#hangout` - Casual voice chat

## Bot Features

The Discord bot provides:

- Slash commands for common actions
- Automated moderation
- Welcome messages for new members
- Integration with AIReady tools

## Documentation Snippets

After running the invite script, you'll get snippets for:

- **README.md**: Discord badge with link
- **HTML/Website**: Clickable badge image
- **Markdown**: Simple link format

## Troubleshooting

### Bot Token Issues

- Ensure the bot token is correct
- Check that the bot has the necessary intents enabled
- Verify the bot is invited to your server

### Permission Issues

- Ensure the bot has Administrator permissions
- Check that role hierarchy is correct
- Verify channel permissions

### Invite Link Issues

- Make sure the bot is in the server
- Check that the welcome channel exists
- Verify the bot has "Create Invite" permission

## Support

For issues with the Discord server setup:

- Check the [AIReady Documentation](https://getaiready.dev/docs)
- Join the [AIReady Discord](https://discord.gg/invite-code)
- Open an issue on [GitHub](https://github.com/caopengau/aiready/issues)
