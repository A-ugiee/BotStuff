--!strict

-------------------------------------------
----------------SERVICES
-------------------------------------------

--ServerScriptService/Services/DiscordBridge/BridgeConfig (ModuleScript)
--Server-only. Never put this in ReplicatedStorage, the secret would be visible to exploiters.

local ReplicatedStorage = game:GetService("ReplicatedStorage")

-------------------------------------------
----------------VARIABLES
-------------------------------------------

local Types = require(ReplicatedStorage.Types.DiscordBridgeTypes)

local Config : Types.Config = {
	BaseURL = "https://botstuff-production.up.railway.app", --Your Railway public URL, no trailing slash and no port
	Secret = "SAME_VALUE_AS_webhookSecret", --Must match the webhookSecret variable on Railway
	SendInStudio = false,
	MinimumSendInterval = 0.5, --Seconds between requests
	MaxQueueSize = 100, --Oldest requests are dropped past this
	MaxRetries = 3,
}

return Config
