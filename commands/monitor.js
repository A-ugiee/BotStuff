import { SlashCommandBuilder, ChatInputCommandInteraction, Client, MessageFlags, InteractionContextType } from "discord.js";
import { GetPlayerSummary, GetPlayerFlags, GetLatestFlags, SearchCheckNames } from "../functions/Database.js";
import { GetUserInfo, GetAvatarURL } from "../functions/RobloxApi.js";
import { BuildPlayerEmbed, BuildLogsEmbed, BuildRecentEmbed } from "../functions/MonitorEmbeds.js";

// only members with this role can use /monitor, set moderatorRoleID in the env to change it
const ModeratorRoleID = process.env.moderatorRoleID || "1561315326304714884";

const DefaultCount = 10;
const MaxCount = 25;

export const commandBuilder = new SlashCommandBuilder()
    .setName("monitor")
    .setDescription("Look up a player and their anticheat logs")
    .setContexts(InteractionContextType.Guild)
    .addSubcommand(Sub =>
        Sub.setName("player")
        .setDescription("Shows a player's Roblox profile and flag summary")
        .addIntegerOption(Option =>
            Option.setName("userid")
            .setDescription("Roblox User ID")
            .setMinValue(1)
            .setRequired(true)
        )
    )
    .addSubcommand(Sub =>
        Sub.setName("logs")
        .setDescription("Shows a player's most recent flags")
        .addIntegerOption(Option =>
            Option.setName("userid")
            .setDescription("Roblox User ID")
            .setMinValue(1)
            .setRequired(true)
        )
        .addStringOption(Option =>
            Option.setName("check")
            .setDescription("Only show this check")
            .setAutocomplete(true)
        )
        .addIntegerOption(Option =>
            Option.setName("count")
            .setDescription(`How many flags to show (default ${DefaultCount})`)
            .setMinValue(1)
            .setMaxValue(MaxCount)
        )
    )
    .addSubcommand(Sub =>
        Sub.setName("recent")
        .setDescription("Shows the latest flags across all players")
        .addIntegerOption(Option =>
            Option.setName("count")
            .setDescription(`How many flags to show (default ${DefaultCount})`)
            .setMinValue(1)
            .setMaxValue(MaxCount)
        )
    )

function HasModeratorRole(Interaction){

    const Roles = Interaction.member?.roles;

    if(!Roles) return false;

    // a cached member has a role manager, an uncached one has a plain array of role IDs
    return Array.isArray(Roles) ? Roles.includes(ModeratorRoleID) : Roles.cache.has(ModeratorRoleID);
}

/**
 * @param {ChatInputCommandInteraction} Interaction
 * @param {Client} DiscordClient
 */

export async function execute(Interaction, DiscordClient){

    if(!HasModeratorRole(Interaction)){

        if(Interaction.isAutocomplete()){

            await Interaction.respond([]);
            return;

        }

        await Interaction.reply({content: "You need the moderator role to use this.", flags: MessageFlags.Ephemeral});
        return;

    }

    if(Interaction.isAutocomplete()){

        await HandleAutocomplete(Interaction);
        return;

    }

    await Interaction.deferReply({flags: MessageFlags.Ephemeral});

    try {

        const Subcommand = Interaction.options.getSubcommand();

        if(Subcommand == "player"){
            await HandlePlayer(Interaction);
        }
        else if(Subcommand == "logs"){
            await HandleLogs(Interaction);
        }
        else if(Subcommand == "recent"){
            await HandleRecent(Interaction);
        }

    } catch (ErrorObject) {

        console.log("monitor command failed:", ErrorObject);
        await Interaction.editReply({content: "Something went wrong reading the logs."});

    }
}

async function HandleAutocomplete(Interaction){

    const Focused = Interaction.options.getFocused(true);

    if(Focused.name !== "check"){

        await Interaction.respond([]);
        return;

    }

    const Names = SearchCheckNames(Focused.value);
    await Interaction.respond(Names.map(Name => ({name: Name, value: Name})));
}

async function HandlePlayer(Interaction){

    const UserID = Interaction.options.getInteger("userid");

    // the database read is instant, the two Roblox calls run side by side
    const Summary = GetPlayerSummary(UserID);
    const [UserInfo, AvatarURL] = await Promise.all([GetUserInfo(UserID), GetAvatarURL(UserID)]);

    await Interaction.editReply({embeds: [BuildPlayerEmbed(UserID, UserInfo, AvatarURL, Summary)]});
}

async function HandleLogs(Interaction){

    const UserID = Interaction.options.getInteger("userid");
    const CheckName = Interaction.options.getString("check");
    const Count = Interaction.options.getInteger("count") ?? DefaultCount;

    const Rows = GetPlayerFlags(UserID, CheckName, Count);
    const PlayerName = Rows[0]?.PlayerName ?? null;

    await Interaction.editReply({embeds: [BuildLogsEmbed(UserID, PlayerName, Rows, CheckName)]});
}

async function HandleRecent(Interaction){

    const Count = Interaction.options.getInteger("count") ?? DefaultCount;

    await Interaction.editReply({embeds: [BuildRecentEmbed(GetLatestFlags(Count))]});
}
