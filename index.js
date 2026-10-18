import { Client, GatewayIntentBits, Collection } from "discord.js";
import { LoadCommands } from "./functions/CommandHandler.js";
import { LoadEvents } from "./functions/EventHandler.js";
import { RefreshCommands } from "./functions/RefreshCommands.js";
import { GetDatabase } from "./functions/Database.js";
import dotenv from "dotenv";
dotenv.config();

GetDatabase();

const DiscordClient = new Client({intents: [GatewayIntentBits.Guilds]});
DiscordClient.Commands = new Collection();

await LoadCommands(DiscordClient, "./commands");
await LoadEvents(DiscordClient, "./events");

if(DiscordClient.Commands.size > 0){

    await RefreshCommands(DiscordClient);

}

DiscordClient.login(process.env.token)
