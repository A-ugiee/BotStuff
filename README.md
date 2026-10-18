# BotStuff

A Discord bot that sends a Roblox game's anticheat flags to a staff channel and keeps a history of them, so moderators can check on players whenever they need to.

## Features

- **Flag alerts.** Each flag is posted as an embed showing the player, the check that fired, the reason, their score, and the server it happened on.
- **Risk colors.** The embed color changes as a player's score gets closer to the kick threshold, so the serious ones stand out.
- **Flag history.** Every flag is saved, so the history is still there after a player leaves or a server shuts down.
- **Player lookup.** `/monitor player` shows a player's Roblox profile next to their flag stats: total flags, flags in the last 24 hours, highest score, and the checks they trip most.
- **Player logs.** `/monitor logs` lists a player's recent flags, and can be filtered by check.
- **Recent flags.** `/monitor recent` shows the latest flags across all players.
- **Custom embeds.** The game can post its own messages to the channel too, like server start notices.
- **Moderator only.** `/monitor` is limited to a moderator role, and replies are only visible to whoever ran the command.
- **Secure.** The game has to send a secret key with every request, otherwise the bot ignores it.

## Setup

Copy `.env.example` to `.env`, fill in your own values, then run:

```bash
npm install
npm start
```

Requires Node 22.13 or newer.
