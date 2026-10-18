# BotStuff

A Discord bot I built that connects a Roblox game's anticheat to a Discord server. When the anticheat flags a player, the bot posts an alert in a staff channel and saves it, so moderators can look back at a player's history any time.

## What it does

- **Live alerts.** Every flag shows up in Discord with the player, what they were caught doing, and how close they are to being kicked. The embed color changes as the risk goes up.
- **Saved history.** Flags are stored in a database, so nothing is lost when a player leaves or a server shuts down.
- **Moderator lookups.** The `/monitor` command lets moderators check any player's Roblox profile alongside their flag history, or browse the latest flags across everyone.

## Built with

Node.js, discord.js, SQLite, the Roblox API, and Luau on the game side. It's hosted on Railway.

## Setup

Copy `.env.example` to `.env`, fill in your own values, then run:

```bash
npm install
npm start
```

Requires Node 22.13 or newer.
