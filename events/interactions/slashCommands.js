import { ChatInputCommandInteraction, Client, MessageFlags } from "discord.js";

export const name = "interactionCreate";
export const once = false;

/**
 * @param {ChatInputCommandInteraction} Interaction
 * @param {Client} DiscordClient
 */

export async function execute(Interaction, DiscordClient){

    if(Interaction.isAutocomplete()){

        const Command = DiscordClient.Commands.get(Interaction.commandName);
        if(Command) await Command.execute(Interaction, DiscordClient)
        return;

    }

    if(!Interaction.isChatInputCommand()) return;

    const Command = DiscordClient.Commands.get(Interaction.commandName);

    if(!Command){

        await Interaction.reply({content: `${Interaction.commandName} does not exist`, flags: MessageFlags.Ephemeral});
        return;

    }

    try {

        await Command.execute(Interaction, DiscordClient);

    } catch (ErrorObject) {

        console.log(ErrorObject);

    }
}
