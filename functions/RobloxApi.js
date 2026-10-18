const TimeoutMilliseconds = 5000;

// Public Roblox endpoints, no key needed. Returns null on any failure so callers can degrade gracefully.
async function FetchJSON(Url){

    try {

        const Response = await fetch(Url, {signal: AbortSignal.timeout(TimeoutMilliseconds)});

        if(!Response.ok) return null;

        return await Response.json();

    } catch (ErrorObject) {

        console.log(`Roblox request failed (${Url}):`, ErrorObject.message);
        return null;

    }
}

// { id, name, displayName, created, isBanned, ... } or null if the user doesn't exist
export async function GetUserInfo(UserID){

    return FetchJSON(`https://users.roblox.com/v1/users/${UserID}`);

}

// Headshot image URL, or null
export async function GetAvatarURL(UserID){

    const Result = await FetchJSON(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${UserID}&size=150x150&format=Png&isCircular=false`);
    const Entry = Result?.data?.[0];

    return Entry?.state === "Completed" ? Entry.imageUrl : null;
}
