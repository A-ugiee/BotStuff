# BotStuff

Discord bot with a bridge from the game. The game sends anticheat flags over HTTP to this bot, and the bot posts them as embeds into a Discord channel. No slash commands yet, but the command and event loaders are in place for when you add them.

## Flow

```
Game  --HTTP POST /anticheat/flag-->  Railway (this bot)  -->  Discord channel
```

Live at `https://botstuff-production.up.railway.app`.

## Routes

| Route | Auth | Purpose |
| --- | --- | --- |
| `GET /health` | none | liveness check |
| `POST /anticheat/flag` | `x-webhook-secret` header | anticheat flag, the bot builds the embed |
| `POST /anticheat/embed` | `x-webhook-secret` header | fully custom embed |

### `/anticheat/flag` body
```json
{
  "PlayerName": "Roblox",
  "UserId": 1,
  "CheckName": "Noclip",
  "Reason": "Passed through Workspace.Wall",
  "Score": 4.0,
  "Weight": 2,
  "KickThreshold": 10,
  "JobId": "abc-123",
  "PlaceId": 123456
}
```
Required: `PlayerName`, `UserId`, `CheckName`, `Reason`, `Score`.

### `/anticheat/embed` body
All fields optional, but it needs a `Title`, `Description` or `Fields`.
```json
{
  "Title": "Server Started",
  "Description": "Ready",
  "Color": "#57F287",
  "Fields": [{ "Name": "Players", "Value": "0", "Inline": true }],
  "FooterText": "Place 123456",
  "ThumbnailUrl": "https://example.com/a.png",
  "Timestamp": true
}
```

## Railway setup

1. Service > Variables: set `token`, `anticheatChannelID`, `webhookSecret` and `PORT=800`.
2. Service > Settings > Networking: the public domain's port must be `800`, the same as `PORT`.
3. Open `https://botstuff-production.up.railway.app/health`, it should return `OK`.
4. The bot needs View Channel, Send Messages and Embed Links in the anticheat channel.

The game's URL never includes the port. Public traffic goes over HTTPS and Railway forwards it to port 800.

## Hook up the game

1. Game Settings > Security > Allow HTTP Requests.
2. Copy the files from `roblox/` into `ServerScriptService/Services`:
   - `DiscordBridge` (ModuleScript) with `BridgeConfig` (ModuleScript) as its child
   - `AnticheatDiscordLogger` (Script)
3. In `BridgeConfig`, set `Secret` to the same value as `webhookSecret`. `BaseUrl` is already set.

## Test without the game
```bash
curl -X POST https://botstuff-production.up.railway.app/anticheat/flag \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: YOUR_SECRET" \
  -d '{"PlayerName":"Test","UserId":1,"CheckName":"Noclip","Reason":"Test flag","Score":4}'
```

## Adding commands later

Drop a file in `commands/` that exports `commandBuilder` and `execute`, then set `applicationID` and `guildIDs`. Commands are only registered with Discord when at least one exists.

## Security notes
- `webhookSecret` is the only thing stopping strangers from posting into your channel. Keep it out of the repo and out of anything clients can see.
- If `webhookSecret` is missing, the anticheat routes refuse every request.
- Mentions are disabled on every message the bridge sends.
