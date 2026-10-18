import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";

export async function LoadCommands(DiscordClient, Directory) {

    const Files = fs.readdirSync(Directory, {withFileTypes: true})

    for(const File of Files){

        const FullPath = path.join(Directory, File.name);

        if(File.isDirectory()){

            await LoadCommands(DiscordClient, FullPath)

        } else if(File.name.endsWith(".js")) {

            const Command = await import(pathToFileURL(FullPath).href)
            DiscordClient.Commands.set(Command.commandBuilder.name, Command)

        }
    }
}
