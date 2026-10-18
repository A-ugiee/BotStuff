import express from "express";
import { RequireSecret } from "./Auth.js";
import { BuildFlagEmbed, BuildCustomEmbed } from "../functions/AnticheatEmbeds.js";
import { SendToChannel } from "../functions/SendToChannel.js";

function IsString(Value){

    return typeof Value === "string" && Value.length > 0;

}

function IsNumber(Value){

    return typeof Value === "number" && Number.isFinite(Value);

}

// returns an error message, or null when the body is valid
function ValidateFlag(Body){

    if(!Body || typeof Body !== "object") return "Body must be a JSON object";
    if(!IsString(Body.PlayerName)) return "PlayerName must be a string";
    if(!IsNumber(Body.UserID)) return "UserId must be a number";
    if(!IsString(Body.CheckName)) return "CheckName must be a string";
    if(!IsString(Body.Reason)) return "Reason must be a string";
    if(!IsNumber(Body.Score)) return "Score must be a number";
    if(Body.Weight !== undefined && !IsNumber(Body.Weight)) return "Weight must be a number";
    if(Body.KickThreshold !== undefined && (!IsNumber(Body.KickThreshold) || Body.KickThreshold <= 0)) return "KickThreshold must be a positive number";

    return null;
}

function ValidateCustomEmbed(Body){

    if(!Body || typeof Body !== "object") return "Body must be a JSON object";

    const HasContent = IsString(Body.Title) || IsString(Body.Description) || (Array.isArray(Body.Fields) && Body.Fields.length > 0);
    if(!HasContent) return "Embed needs at least a Title, Description or Fields";

    return null;
}

/**
 * Routes the game calls to post into Discord. Every route needs the
 * x-webhook-secret header. Posts go to the channel in the anticheatChannelID env var.
 */

export function CreateAnticheatRouter(DiscordClient){

    const Router = express.Router();

    Router.use(RequireSecret);

    Router.post("/flag", async (Request, Response) => {

        const ErrorMessage = ValidateFlag(Request.body);

        if(ErrorMessage){

            Response.status(400).json({error: ErrorMessage});
            return;

        }

        try {

            await SendToChannel(DiscordClient, process.env.anticheatChannelID, {embeds: [BuildFlagEmbed(Request.body)]});
            Response.sendStatus(200);

        } catch (ErrorObject) {

            console.log("Failed to send anticheat flag:", ErrorObject);
            Response.sendStatus(502);

        }
    });

    Router.post("/embed", async (Request, Response) => {

        const ErrorMessage = ValidateCustomEmbed(Request.body);

        if(ErrorMessage){

            Response.status(400).json({error: ErrorMessage});
            return;

        }

        try {

            await SendToChannel(DiscordClient, process.env.anticheatChannelID, {embeds: [BuildCustomEmbed(Request.body)]});
            Response.sendStatus(200);

        } catch (ErrorObject) {

            console.log("Failed to send custom embed:", ErrorObject);
            Response.sendStatus(502);

        }
    });

    return Router;
}
