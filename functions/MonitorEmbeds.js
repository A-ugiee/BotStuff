import { EmbedBuilder, escapeMarkdown } from "discord.js";

const Colors = {
    Green: 0x57F287,
    Orange: 0xF08C28,
    Red: 0xED4245,
    Gray: 0x99AAB5,
};

const MaxDescriptionLength = 4000;

function ProfileURL(UserID){

    return `https://www.roblox.com/users/${UserID}/profile`;

}

function Timestamp(Milliseconds, Style = "R"){

    return `<t:${Math.floor(Milliseconds / 1000)}:${Style}>`;

}

function Shorten(Text, MaxLength){

    return Text.length > MaxLength ? Text.slice(0, MaxLength - 3) + "..." : Text;

}

function FitLines(Lines){

    const Kept = [];
    let Length = 0;

    for(const Line of Lines){

        if(Length + Line.length + 1 > MaxDescriptionLength) break;

        Kept.push(Line);
        Length += Line.length + 1;

    }

    return Kept.join("\n");
}

export function BuildPlayerEmbed(UserID, UserInfo, AvatarURL, Summary){

    const DisplayName = UserInfo ? `${UserInfo.displayName} (@${UserInfo.name})` : (Summary?.LastName ?? `User ${UserID}`);

    const Color = !Summary ? Colors.Green
        : Summary.ThresholdHits > 0 ? Colors.Red
        : Summary.FlagsLast24Hours > 0 ? Colors.Orange
        : Colors.Gray;

    const Embed = new EmbedBuilder()
        .setTitle(Shorten(DisplayName, 256))
        .setURL(ProfileURL(UserID))
        .setColor(Color)
        .addFields({ name: "User ID", value: String(UserID), inline: true });

    if(AvatarURL) Embed.setThumbnail(AvatarURL);

    if(UserInfo){

        Embed.addFields(
            { name: "Account Created", value: Timestamp(Date.parse(UserInfo.created), "D"), inline: true },
            { name: "Banned", value: UserInfo.isBanned ? "Yes" : "No", inline: true },
        );

    } else {

        Embed.addFields({ name: "Roblox Profile", value: "Not found or Roblox is unreachable", inline: true });

    }

    if(!Summary){

        Embed.addFields({ name: "Anticheat", value: "No flags stored for this player" });
        return Embed;

    }

    Embed.addFields(
        { name: "Total Flags", value: String(Summary.TotalFlags), inline: true },
        { name: "Last 24 Hours", value: String(Summary.FlagsLast24Hours), inline: true },
        { name: "Highest Score", value: Summary.HighestScore.toFixed(1), inline: true },
        { name: "Kick Threshold Hits", value: String(Summary.ThresholdHits), inline: true },
        { name: "First Flagged", value: Timestamp(Summary.FirstFlag), inline: true },
        { name: "Last Flagged", value: Timestamp(Summary.LastFlag), inline: true },
        { name: "Top Checks", value: Summary.TopChecks.map(Row => `${escapeMarkdown(Row.CheckName)}: ${Row.Count}`).join("\n") },
    );

    return Embed;
}

export function BuildLogsEmbed(UserID, PlayerName, Rows, CheckName){

    const Embed = new EmbedBuilder()
        .setTitle(`Flags: ${PlayerName ?? `User ${UserID}`}`)
        .setURL(ProfileURL(UserID))
        .setColor(Colors.Orange);

    if(Rows.length === 0){

        Embed.setDescription(CheckName ? `No "${CheckName}" flags stored for this player.` : "No flags stored for this player.");
        return Embed;

    }

    const Lines = Rows.map(Row => {

        const Weight = Row.Weight !== null ? ` +${Row.Weight}` : "";

        return `${Timestamp(Row.CreatedAt)} **${escapeMarkdown(Row.CheckName)}**${Weight} → ${Row.Score.toFixed(1)}\n> ${escapeMarkdown(Shorten(Row.Reason, 120))}`;

    });

    Embed.setDescription(FitLines(Lines));
    Embed.setFooter({ text: CheckName ? `${Rows.length} shown, check: ${CheckName}` : `${Rows.length} shown` });

    return Embed;
}

export function BuildRecentEmbed(Rows){

    const Embed = new EmbedBuilder()
        .setTitle("Recent Flags")
        .setColor(Colors.Orange);

    if(Rows.length === 0){

        Embed.setDescription("No flags stored yet.");
        return Embed;

    }

    const Lines = Rows.map(Row => {

        return `${Timestamp(Row.CreatedAt)} [${escapeMarkdown(Row.PlayerName)}](${ProfileURL(Row.UserID)}) · **${escapeMarkdown(Row.CheckName)}** → ${Row.Score.toFixed(1)}`;

    });

    Embed.setDescription(FitLines(Lines));
    Embed.setFooter({ text: `${Rows.length} shown` });

    return Embed;
}
