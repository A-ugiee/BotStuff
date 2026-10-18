--!strict

-------------------------------------------
----------------SERVICES
-------------------------------------------

--ServerScriptService/Services/DiscordBridge (ModuleScript, with BridgeConfig as a child)

local HttpService = game:GetService("HttpService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local RunService = game:GetService("RunService")

-------------------------------------------
----------------VARIABLES
-------------------------------------------

local Types = require(ReplicatedStorage.Types.DiscordBridgeTypes)
local Config = require(script.BridgeConfig)

type QueuedRequest = {
	Route : string,
	Body : {[string] : any},
	Attempts : number,
}

local Queue : {QueuedRequest} = {}
local Processing = false

local DiscordBridge = {}

-------------------------------------------
----------------HELPER FUNCTIONS
-------------------------------------------

local function ProcessQueue()

	if Processing then
		return
	end

	Processing = true

	task.spawn(function()

		while #Queue > 0 do

			local Request = table.remove(Queue, 1) :: QueuedRequest
			local WaitTime = Config.MinimumSendInterval
			local ShouldRetry = false

			local Success, Response = pcall(HttpService.RequestAsync, HttpService, {
				Url = Config.BaseURL .. Request.Route, --"Url" is Roblox's own option name, keep it exactly
				Method = "POST",
				Headers = {
					["Content-Type"] = "application/json",
					["x-webhook-secret"] = Config.Secret,
				},
				Body = HttpService:JSONEncode(Request.Body),
			})

			if not Success then

				--The request never completed (HTTP disabled, bot offline, network error)
				warn(`[DiscordBridge] Request to {Request.Route} failed: {Response}`)
				ShouldRetry = true

			elseif Response.Success then

				--Delivered

			elseif Response.StatusCode == 429 or Response.StatusCode >= 500 then

				ShouldRetry = true

			else

				--400 = bad body, 401 = secret mismatch, 503 = webhookSecret not set on the bot
				warn(`[DiscordBridge] {Request.Route} rejected ({Response.StatusCode}): {Response.Body}`)

			end

			if ShouldRetry then

				Request.Attempts += 1

				if Request.Attempts < Config.MaxRetries then
					table.insert(Queue, 1, Request)
				end

				WaitTime = 2 * Request.Attempts

			end

			task.wait(WaitTime)

		end

		Processing = false

	end)
end

-------------------------------------------
----------------FUNCTIONS
-------------------------------------------

--Queues a JSON POST to a bot route, returns false if it was not queued
function DiscordBridge.Post(Route : string, Body : {[string] : any}) : boolean

	if RunService:IsStudio() and not Config.SendInStudio then
		return false
	end

	if #Queue >= Config.MaxQueueSize then

		table.remove(Queue, 1)
		warn("[DiscordBridge] Queue full, dropped the oldest request")

	end

	table.insert(Queue, {Route = Route, Body = Body, Attempts = 0})
	ProcessQueue()

	return true
end

--Anticheat flag, the bot builds the embed
function DiscordBridge.SendFlag(Data : Types.FlagData) : boolean

	return DiscordBridge.Post("/anticheat/flag", Data :: any)

end

--Fully custom embed, you decide every field
function DiscordBridge.SendEmbed(Data : Types.EmbedData) : boolean

	return DiscordBridge.Post("/anticheat/embed", Data :: any)

end

return DiscordBridge
