import { Client } from "discord.js";
import { StartWebhookServer } from "../../webhook/server.js";

export const name = "clientReady";
export const once = true;

export function execute(DiscordClient){

    const BotName = DiscordClient.user.tag;
    console.log(`${BotName} is online.`)

    StartWebhookServer(process.env.PORT || 800, DiscordClient);
}
