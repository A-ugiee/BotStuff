import { Client } from "discord.js";
import { StartWebhookServer } from "../../webhook/server.js";

export const name = "clientReady";
export const once = true;

/**
 * @param {Client} DiscordClient
 */

export function execute(DiscordClient){

    const BotName = DiscordClient.user.tag;
    console.log(`${BotName} is online.`)

    // the Railway domain's port must match this one (set PORT=800 in Railway variables)
    StartWebhookServer(process.env.PORT || 800, DiscordClient);
}
