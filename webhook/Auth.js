import crypto from "crypto";

export function RequireSecret(Request, Response, Next){

    const Expected = process.env.webhookSecret;

    if(!Expected){

        console.log("webhookSecret is not set, refusing request");
        Response.sendStatus(503);
        return;

    }

    const Provided = Request.get("x-webhook-secret") ?? "";

    const ProvidedHash = crypto.createHash("sha256").update(Provided).digest();
    const ExpectedHash = crypto.createHash("sha256").update(Expected).digest();

    if(!crypto.timingSafeEqual(ProvidedHash, ExpectedHash)){

        Response.sendStatus(401);
        return;

    }

    Next();
}
