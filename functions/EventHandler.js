import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";

export async function LoadEvents(DiscordClient, Directory){

    const Files = fs.readdirSync(Directory, {withFileTypes: true})

    for(const File of Files){

        const FullPath = path.join(Directory, File.name)

        if(File.isDirectory()){
            await LoadEvents(DiscordClient, FullPath);
            continue;
        }

        if(!File.name.endsWith(".js")) continue;

        const Event = await import(pathToFileURL(FullPath).href)

        if(Event.once){

            DiscordClient.once(Event.name, (...Args) => Event.execute(...Args, DiscordClient));

        } else {

            DiscordClient.on(Event.name, (...Args) => Event.execute(...Args, DiscordClient));

        }
    }
}
