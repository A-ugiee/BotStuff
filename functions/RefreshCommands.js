import { REST, Routes } from "discord.js";

export async function RefreshCommands(DiscordClient){

    const Rest = new REST({version: 10}).setToken(process.env.token);

    try {

        const AllCommands = DiscordClient.Commands.map((Command) => ({
            Builder: Command.commandBuilder,
            GuildIDs: Command.guildIDs || null
        }));

        const GlobalCommands = AllCommands
            .filter(Command => !Command.GuildIDs)
            .map(Command => Command.Builder);

        const GuildCommandMap = {};

        for (const Command of AllCommands.filter(Entry => Entry.GuildIDs)){

            for(const GuildID of Command.GuildIDs){

                if(!GuildCommandMap[GuildID]) GuildCommandMap[GuildID] = [];
                GuildCommandMap[GuildID].push(Command.Builder);

            }
        }

        const ApplicationID = process.env.applicationID;
        const AllGuildIDs = JSON.parse(process.env.guildIDs);

        for (const GuildID of AllGuildIDs) {

            const GuildName = DiscordClient.guilds.cache.get(GuildID)?.name || GuildID;
            console.log(`Clearing commands in ${GuildName}...`);
            await Rest.put(Routes.applicationGuildCommands(ApplicationID, GuildID),
                { body: [] }
            );
        }

        for (const GuildID of AllGuildIDs) {

            const GuildName = DiscordClient.guilds.cache.get(GuildID)?.name || GuildID;
            const GuildSpecific = GuildCommandMap[GuildID] || [];
            const Merged = [...GlobalCommands, ...GuildSpecific];

            for (const Command of Merged) {

                console.log(`Registering "${Command.name}" in ${GuildName}`);

            }

            await Rest.put(Routes.applicationGuildCommands(ApplicationID, GuildID),
                { body: Merged }
            );
        }
    } catch (ErrorObject) {

        console.log(ErrorObject);

    }
}
