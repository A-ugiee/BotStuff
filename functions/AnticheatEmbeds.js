import { EmbedBuilder, escapeMarkdown } from "discord.js";

const Colors = {
    Yellow: 0xFEE75C,
    Orange: 0xF08C28,
    Red: 0xED4245,
};

const DefaultKickThreshold = 10;

// Discord rejects empty strings and over-length values, so clamp everything
function Clamp(Value, MaxLength){

    const Text = String(Value ?? "");

    if(Text.length === 0) return "​";
    if(Text.length <= MaxLength) return Text;

    return Text.slice(0, MaxLength - 3) + "...";
}

function IsHttps(Url){

    return typeof Url === "string" && Url.startsWith("https://");

}

function ParseColor(Color){

    if(typeof Color === "number") return Color;

    if(typeof Color === "string" && /^#?[0-9a-fA-F]{6}$/.test(Color)){

        return parseInt(Color.replace("#", ""), 16);

    }

    return 0x000000;
}

/**
 * Embed for a flag sent by the game's anticheat.
 * Expected data: PlayerName, UserID, CheckName, Reason, Score,
 * and optionally Weight, KickThreshold, JobID, PlaceID.
 */

export function BuildFlagEmbed(Data){

    const Threshold = Data.KickThreshold ?? DefaultKickThreshold;
    const Ratio = Data.Score / Threshold;
    const Reached = Data.Score >= Threshold;

    const Color = Ratio >= 0.8 ? Colors.Red : Ratio >= 0.5 ? Colors.Orange : Colors.Yellow;
    const ScoreText = Data.Weight !== undefined
        ? `${Data.Score.toFixed(1)} (+${Data.Weight.toFixed(1)})`
        : Data.Score.toFixed(1);

    return new EmbedBuilder()
        .setTitle(Reached ? "Anticheat Kick Threshold Reached" : "Anticheat Flag")
        .setDescription(Clamp(Data.Reason, 4096))
        .setColor(Color)
        .addFields(
            {
                name: "Player",
                value: Clamp(`[${escapeMarkdown(Data.PlayerName)}](https://www.roblox.com/users/${Data.UserID}/profile) (${Data.UserID})`, 1024),
                inline: true
            },
            { name: "Check", value: Clamp(Data.CheckName, 1024), inline: true },
            { name: "Score", value: ScoreText, inline: true },
            { name: "Server", value: Clamp(Data.JobID || "Studio", 1024) },
        )
        .setFooter({ text: `Place ${Data.PlaceID ?? "unknown"}` })
        .setTimestamp();
}

/**
 * Fully customizable embed. Every field is optional:
 * Title, Description, Color (number or "#RRGGBB"), Fields [{Name, Value, Inline}],
 * FooterText, ThumbnailURL, ImageURL, Timestamp (boolean).
 */

export function BuildCustomEmbed(Data){

    const Embed = new EmbedBuilder();

    if(Data.Title) Embed.setTitle(Clamp(Data.Title, 256));
    if(Data.Description) Embed.setDescription(Clamp(Data.Description, 4096));
    if(Data.Color !== undefined) Embed.setColor(ParseColor(Data.Color));

    const Fields = Array.isArray(Data.Fields) ? Data.Fields.slice(0, 25) : [];

    for(const Field of Fields){

        if(typeof Field !== "object" || Field === null) continue;

        Embed.addFields({
            name: Clamp(Field.Name, 256),
            value: Clamp(Field.Value, 1024),
            inline: Field.Inline === true
        });

    }

    if(Data.FooterText) Embed.setFooter({ text: Clamp(Data.FooterText, 2048) });
    if(IsHttps(Data.ThumbnailURL)) Embed.setThumbnail(Data.ThumbnailURL);
    if(IsHttps(Data.ImageURL)) Embed.setImage(Data.ImageURL);
    if(Data.Timestamp === true) Embed.setTimestamp();

    return Embed;
}
