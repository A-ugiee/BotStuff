const TimeoutMilliseconds = 5000;

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

export async function GetUserInfo(UserID){

    return FetchJSON(`https://users.roblox.com/v1/users/${UserID}`);

}

export async function GetAvatarURL(UserID){

    const Result = await FetchJSON(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${UserID}&size=150x150&format=Png&isCircular=false`);
    const Entry = Result?.data?.[0];

    return Entry?.state === "Completed" ? Entry.imageUrl : null;
}
