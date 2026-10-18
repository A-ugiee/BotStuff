# BotStuff

A Discord bot that logs a Roblox game's anticheat flags and lets moderators look players up straight from Discord.

## How it works

1. The game detects something suspicious and sends the flag to the bot.
2. The bot posts it in the staff channel and saves it to a database.
3. Moderators use `/monitor` to pull up a player's Roblox profile and everything the anticheat has recorded for them.

## Commands

`/monitor` is limited to the moderator role, and replies are only visible to whoever ran the command.

### `/monitor player <userid>`

Shows a player's Roblox profile (name, account age, ban status) next to their flag summary: total flags, flags in the last 24 hours, highest score, times they hit the kick threshold, and the checks they trip most.

### `/monitor logs <userid> [check] [count]`

Lists a player's most recent flags, newest first. `check` filters to a single check and autocompletes from checks that have been logged. `count` goes up to 25.

### `/monitor recent [count]`

Lists the latest flags across all players.

## Setup

Copy `.env.example` to `.env`, fill in your own values, then run:

```bash
npm install
npm start
```

Requires Node 22.13 or newer.
