# Making Your AIReady Discord Server Public

This guide walks you through making your AIReady Discord server public and enabling community features.

## Prerequisites

- Discord server already set up using `pnpm --filter @aiready/discord setup`
- Bot token and server ID configured in `.env`
- Administrator permissions on the Discord server

## Step 1: Generate Public Invite Link

First, generate a permanent invite link that you can share publicly:

```bash
# From the monorepo root
pnpm --filter @aiready/discord invite

# Or from the discord directory
cd apps/discord
pnpm invite
```

This script will:

1. Create a permanent, unlimited-use invite link
2. Save the URL to `discord-invite.txt`
3. Display documentation snippets for various formats

## Step 2: Enable Community Features (Recommended)

Enabling Community features unlocks:

- Server Discovery (your server appears in Discord's search)
- Welcome screen for new members
- Server insights and analytics
- Announcement channels
- Better moderation tools

### How to Enable Community

1. **Open Server Settings**
   - Click on your server name
   - Select "Server Settings"

2. **Navigate to Enable Community**
   - In the left sidebar, click "Enable Community"
   - Click "Get Started"

3. **Complete the Setup Wizard**

   **Step 1: Safety Checks**
   - Discord will verify your server meets requirements:
     - Must have a verified email
     - Must have a rules channel
     - Must have a community updates channel
     - Verification level must be at least Medium

   **Step 2: Set Up Channels**
   - Create a `#rules` channel (if not exists)
   - Create a `#community-updates` channel (if not exists)
   - These channels will be configured automatically

   **Step 3: Configure Settings**
   - **Verification Level**: Set to "Medium" or higher
   - **Explicit Media Content Filter**: Enable for all members
   - **Default Notification Settings**: Set to "Only @mentions"

   **Step 4: Agree to Terms**
   - Read and accept Discord's Community Guidelines
   - Click "Enable Community"

### After Enabling Community

Your server now has:

- ✅ Server Discovery enabled
- ✅ Welcome screen for new members
- ✅ Announcement channels
- ✅ Server insights
- ✅ Better moderation tools

## Step 3: Set Up Server Discovery

To make your server discoverable in Discord's server browser:

1. **Go to Server Settings → Discovery**

2. **Complete Server Listing**
   - **Server Name**: AIReady
   - **Description**: "AIReady helps developers make their codebases AI-ready. Get help, share improvements, and connect with the community."
   - **Server Icon**: Upload your server icon
   - **Banner**: Upload a server banner (recommended: 960x540)
   - **Primary Language**: English
   - **Categories**:
     - Science & Tech
     - Education
     - Community
   - **Tags**: AI, Development, Tools, Open Source, Community

3. **Set Up Server Rules**
   - Go to Server Settings → Rules Screening
   - Create rules that members must accept:
     ```
     1. Be respectful and constructive
     2. No spam or self-promotion
     3. Keep discussions relevant to AIReady
     4. No harassment or discrimination
     5. Follow Discord's Terms of Service
     ```

4. **Submit for Review**
   - Discord will review your server listing
   - This usually takes 24-48 hours
   - Once approved, your server appears in Server Discovery

## Step 4: Configure Welcome Screen

Customize the welcome experience for new members:

1. **Go to Server Settings → Welcome Screen**

2. **Add Welcome Screen Items**
   - **Header**: "Welcome to AIReady!"
   - **Description**: "We help developers make their codebases AI-ready."

   **Recommended Channels to Feature:**
   - `#rules` - "Read our community guidelines"
   - `#announcements` - "Stay updated with AIReady news"
   - `#help` - "Get help with AIReady tools"
   - `#showcase` - "Share your AI readiness improvements"

3. **Save Changes**

## Step 5: Set Up Announcement Channels

Create channels for important updates:

1. **Create Announcement Channel**
   - Create a new channel called `#announcements`
   - Set channel type to "Announcement"
   - This allows members to follow the channel

2. **Configure Permissions**
   - Only Admins and Moderators can post
   - Everyone can read and follow

3. **Post First Announcement**
   - Welcome message
   - Server rules summary
   - How to get started with AIReady

## Step 6: Configure Moderation

Set up moderation tools:

1. **AutoMod Setup**
   - Go to Server Settings → AutoMod
   - Enable preset rules:
     - Block spam
     - Block mention spam
     - Block harmful links
   - Add custom rules for your community

2. **Verification Level**
   - Go to Server Settings → Safety Setup
   - Set verification level to "Medium" or "High"
   - This prevents spam bots

3. **Content Filter**
   - Enable explicit media content filter
   - Set to scan media from all members

## Step 7: Share Your Server

Now that your server is public, share it:

### Update Documentation

1. **Update README.md**
   - Replace placeholder Discord ID and invite code
   - Example:
     ```markdown
     [![Discord](https://img.shields.io/discord/123456789?label=Discord&logo=discord)](https://discord.gg/your-invite-code)
     ```

2. **Update Landing Page**
   - Add Discord button to your website
   - Include in footer or navigation

3. **Add to GitHub**
   - Add Discord badge to repository
   - Include in CONTRIBUTING.md

### Promote Your Server

- Share on social media
- Post in relevant communities
- Include in email signatures
- Add to documentation

## Step 8: Maintain and Grow

### Regular Activities

1. **Office Hours**
   - Schedule regular office hours
   - Use voice channels for live discussions

2. **Community Events**
   - Host coding challenges
   - Share tutorials and guides
   - Celebrate community wins

3. **Engagement**
   - Respond to questions promptly
   - Highlight community contributions
   - Share updates regularly

### Analytics

Monitor your server growth:

- Go to Server Settings → Server Insights
- Track:
  - Member growth
  - Message activity
  - Popular channels
  - Engagement rates

## Troubleshooting

### Server Not Appearing in Discovery

- Ensure Community features are enabled
- Complete all required fields in Discovery settings
- Wait for Discord review (24-48 hours)
- Check that server meets all requirements

### Invite Link Not Working

- Verify the bot is still in the server
- Check that the welcome channel exists
- Ensure the bot has "Create Invite" permission
- Generate a new invite link

### Community Features Not Available

- Verify you have Administrator permissions
- Check that verification level is Medium or higher
- Ensure rules and community-updates channels exist
- Complete the Community setup wizard

## Best Practices

1. **Keep Channels Organized**
   - Use clear channel names
   - Create categories for different topics
   - Archive inactive channels

2. **Moderate Actively**
   - Respond to reports quickly
   - Enforce rules consistently
   - Use AutoMod for automation

3. **Engage Community**
   - Post regular updates
   - Celebrate member achievements
   - Ask for feedback

4. **Stay Updated**
   - Keep Discord bot updated
   - Monitor for new Discord features
   - Adjust settings as needed

## Resources

- [Discord Community Guidelines](https://discord.com/guidelines)
- [Discord Server Setup Guide](https://support.discord.com/hc/en-us/articles/228383668)
- [Discord Discovery Guide](https://support.discord.com/hc/en-us/articles/360047132851)
- [AIReady Documentation](https://getaiready.dev/docs)

## Support

If you need help with Discord server setup:

- Check the [AIReady Discord README](../README.md)
- Join the [AIReady Discord](https://discord.gg/invite-code)
- Open an issue on [GitHub](https://github.com/caopengau/aiready/issues)
