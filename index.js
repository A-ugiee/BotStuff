import { Client, GatewayIntentBits, Collection } from "discord.js";
import { LoadCommands } from "./functions/CommandHandler.js";
import { LoadEvents } from "./functions/EventHandler.js";
import { RefreshCommands } from "./functions/RefreshCommands.js";
import dotenv from "dotenv";
dotenv.config();

const DiscordClient = new Client({intents: [GatewayIntentBits.Guilds]});
DiscordClient.Commands = new Collection();

await LoadCommands(DiscordClient, "./commands");
await LoadEvents(DiscordClient, "./events");

// only register slash commands once you have some, so applicationID / guildIDs aren't needed until then
if(DiscordClient.Commands.size > 0){

    await RefreshCommands(DiscordClient);

}

DiscordClient.login(process.env.token)
