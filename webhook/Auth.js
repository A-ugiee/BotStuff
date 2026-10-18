import crypto from "crypto";

/**
 * Requires the x-webhook-secret header to match the webhookSecret env var.
 * Fails closed: if the env var is not set, every request is refused.
 */

export function RequireSecret(Request, Response, Next){

    const Expected = process.env.webhookSecret;

    if(!Expected){

        console.log("webhookSecret is not set, refusing request");
        Response.sendStatus(503);
        return;

    }

    const Provided = Request.get("x-webhook-secret") ?? "";

    // hash both sides so the buffers are the same length for timingSafeEqual
    const ProvidedHash = crypto.createHash("sha256").update(Provided).digest();
    const ExpectedHash = crypto.createHash("sha256").update(Expected).digest();

    if(!crypto.timingSafeEqual(ProvidedHash, ExpectedHash)){

        Response.sendStatus(401);
        return;

    }

    Next();
}
