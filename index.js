const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => res.send('System Online'));

app.listen(port, () =>
  console.log(`Your app is listening at http://localhost:${port}`)
);

const botToken = process.env['TOKEN'];
const targetBotId = process.env['TARGET_BOT_ID'];
const channelId = process.env['CHANNEL_ID'];
const guildId = process.env['GUILD_ID'];
const pingUserId = process.env['PING_USER_ID'];

const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences, // Add this intent to fetch presences
    GatewayIntentBits.GuildMessages,
  ],
});

let botOnline = false; // Track the bot's online status

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);

  const guild = client.guilds.cache.get(guildId);
  if (!guild) {
    console.error(`Unable to find guild with ID ${guildId}`);
    return;
  }

  const channel = guild.channels.cache.get(channelId);
  if (!channel) {
    console.error(`Unable to find channel with ID ${channelId}`);
    return;
  }

  // Fetch the target bot user with presences
  guild.members.fetch({ user: targetBotId, force: true }).then((bot) => {
    if (bot) {
      // Check the bot's status when the bot is first ready.
      if (bot.presence.status === 'online' && !botOnline) {
        channel.send(`The target bot is online!`);
        botOnline = true;
      }

      // Set an interval to check the bot's status.
      setInterval(() => {
        if (bot.presence.status === 'offline' && botOnline) {
          channel.send(`:warning: <@${pingUserId}> Bot is offline! :warning:`);
          botOnline = false;
        } else if (bot.presence.status === 'online' && !botOnline) {
          channel.send(`The target bot is online!`);
          botOnline = true;
        }
      }, 5000);
    } else {
      console.error(`Bot with ID ${targetBotId} is not a member of the guild.`);
    }
  }).catch((error) => {
    console.error(`Error fetching bot with ID ${targetBotId}: ${error}`);
  });
});

client.login(botToken);
