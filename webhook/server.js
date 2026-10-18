import express from "express";
import { CreateAnticheatRouter } from "./Anticheat.js";

const App = express();
App.use(express.json({limit: "50kb"}));

App.get("/health", (Request, Response) => {

    Response.sendStatus(200);

});

export function StartWebhookServer(Port = 800, DiscordClient){

    if(DiscordClient){

        App.use("/anticheat", CreateAnticheatRouter(DiscordClient));

    }

    App.listen(Port, () => {

        console.log(`Webhook server listening on port ${Port}`);

    });
}
