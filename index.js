const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, MessageFlags, REST, Routes } = require('discord.js');
const config = require('./local/config.json');
const { Database } = require('./db');
const logger = require('./logger');
const cron = require('node-cron');
const nhay = require('./nhay.js');

if (!config.token) {
    logger.error("No token found in config, please set it in local/config.json");
    process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.MessageContent,
  ]
});


client.commands = new Collection();
client.commands.release = new Collection();
client.commands.beta = new Collection();

const commandsRelease = [];
const commandsBeta = [];
const foldersPathRelease = path.join(__dirname, 'commands', 'release');
const commandFoldersRelease = fs.readdirSync(foldersPathRelease);
const foldersPathBeta = path.join(__dirname, 'commands', 'beta');
const commandFoldersBeta = fs.readdirSync(foldersPathBeta)

for (const folder of commandFoldersRelease) {
	const commandsPath = path.join(foldersPathRelease, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			commandsRelease.push(command.data.toJSON());
			client.commands.release.set(command.data.name, command);
		} else {
			logger.warn(`The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

for (const entry of commandFoldersBeta) {
  const entryPath = path.join(foldersPathBeta, entry);
  const stat = fs.statSync(entryPath);

  if (stat.isDirectory()) {
    // load all .js files inside the folder
    const commandFiles = fs.readdirSync(entryPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
      const filePath = path.join(entryPath, file);
      const command = require(filePath);
      if ('data' in command && 'execute' in command) {
        commandsBeta.push(command.data.toJSON());
        client.commands.beta.set(command.data.name, command);
      } else {
        logger.warn(`The command at ${filePath} is missing a required "data" or "execute" property.`);
      }
    }
  } else if (stat.isFile() && entry.endsWith('.js')) {
    // load single file directly
    const command = require(entryPath);
    if ('data' in command && 'execute' in command) {
      commandsBeta.push(command.data.toJSON());
      client.commands.beta.set(command.data.name, command);
    } else {
      logger.warn(`The command at ${entryPath} is missing a required "data" or "execute" property.`);
    }
  }
}


client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command =
        client.commands.release.get(interaction.commandName) ||
        client.commands.beta.get(interaction.commandName);

    if (!command) {
        logger.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        logger.error(`Error executing ${interaction.commandName}:`, error);
        const replyOptions = {
            content: 'There was an error while executing this command!',
            ephemeral: true
        };

        if (interaction.replied || interaction.deferred) {
            await interaction.followUp(replyOptions);
        } else {
            await interaction.reply(replyOptions);
        }
    }
});


client.once(Events.ClientReady, async readyClient => {
    logger.info(`Ready! Logged in as ${readyClient.user.tag}`);

    if (!config.db_uri || !config.db_uri.startsWith("mongodb+srv://")) {
        logger.warn("No valid database URL found in config, skipping test.");
    } else {
        const db = new Database(config.db_uri);
        logger.progress("Starting DB test...");
        db.test("test")
            .then(() => {
                logger.progress("DB test completed.");
            })
            .catch(console.error)
            .finally(() => db.close());
    }

    if (config.db_uri && config.db_uri.startsWith("mongodb+srv://") && config.cron_nhay) {
        const db = new Database(config.db_uri);
        await db.connect("BestFriendsBot");
        const collection = await db.getCollection("curse_channels");

        cron.schedule(config.cron_nhay, async () => {
            const guilds = await client.guilds.fetch();
            let guild;
            let thing;

            for (const [guildId] of guilds) {
                guild = await client.guilds.fetch(guildId).catch(() => null);
                let config = await db.getCollection("guild_config");
                configurate = await config.findOne({ guildId });
                if (!guild || configurate?.enabled === false) continue;

                const doc = await collection.findOne({ guildId });
                if (!doc || !doc.channels || doc.channels.length === 0) {
                    continue;
                } else {
                    thing = doc.channels;
                }

                for (const channelId of thing) {
                    const nhayy = new nhay();
                    const curseMessage = nhayy.readRandomLine();
                    const channel = await client.channels.fetch(channelId).catch(() => null);
                    members = await guild.members
                    .fetch()
                    .then(members => members.random().id);

                    while (members === client.user.id) {
                    members = await guild.members
                        .fetch()
                        .then(members => members.random().id);
                    }

                    if (channel && channel.isTextBased()) {
                        channel
                            .send(`<@${members}> ${curseMessage}`)
                            .catch(() => null);
                    }
                }
            }
        });
    }
    else {
        logger.warn("No valid database URL or cron_nhay found in config, skipping curses cron job.");
    }
});


logger.info('App ID:', config.app_id);      // should print the correct string
logger.info('Guild ID:', config.dev_server); // should print the correct string


const rest = new REST().setToken(config.token);
const appId = config.app_id.toString();

(async () => {
	try {
		logger.progress(`Started refreshing ${commandsRelease.length} application commands.`);

		const data = await rest.put(
			Routes.applicationCommands(appId),
			{ body: commandsRelease },
		);

		logger.progress(`Successfully reloaded ${data.length} application commands.`);
	} catch (error) {
		console.error(error);
	}
  if (!config.dev_server) {
    logger.warn("No dev_server found in config, skipping beta commands registration.");
    return;
  }
  else {
    try {
        logger.progress(`Started refreshing ${commandsBeta.length} beta application commands.`);

        const data = await rest.put(
            Routes.applicationGuildCommands(appId, config.dev_server),
            { body: commandsBeta },
        );

        logger.progress(`Successfully reloaded ${data.length} beta application commands.`);
    } catch (error) {
        logger.error(error);
    }
  }
})();

client.login(config.token);