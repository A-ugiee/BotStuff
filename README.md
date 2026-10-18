# BotStuff

discord bot for the roblox anticheat. game sends flags to the bot, bot posts them in the staff channel and saves them to a database

## how it works

game flags a player -> bot posts it + saves it -> mods use `/monitor` to check a player's profile and flag history

## commands

mod role only, replies are only visible to whoever ran it

`/monitor player <userid>` roblox profile + flag summary (total flags, last 24h, highest score, kick threshold hits, most tripped checks)

`/monitor logs <userid> [check] [count]` recent flags for a player, newest first. check filters by check name, count is up to 25

`/monitor recent [count]` latest flags across everyone
