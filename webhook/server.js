import express from "express";
import { CreateAnticheatRouter } from "./Anticheat.js";

const App = express();
App.use(express.json({limit: "50kb"}));

// Railway (or anything else) can hit this to check the bot is up
App.get("/health", (Request, Response) => {

    Response.sendStatus(200);

});

export function StartWebhookServer(Port = 800, DiscordClient){

    // anticheat routes need the Discord client to post into a channel
    if(DiscordClient){

        App.use("/anticheat", CreateAnticheatRouter(DiscordClient));

    }

    App.listen(Port, () => {

        console.log(`Webhook server listening on port ${Port}`);

    });
}
