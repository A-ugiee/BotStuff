
export async function SendToChannel(DiscordClient, ChannelID, Message){

    if(!ChannelID){

        throw new Error("Channel ID is not configured");

    }

    const Channel = await DiscordClient.channels.fetch(ChannelID);

    if(!Channel || !Channel.isTextBased()){

        throw new Error(`Channel ${ChannelID} is not a text channel`);

    }

    return Channel.send({...Message, allowedMentions: {parse: []}});
}
