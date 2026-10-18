--!strict

-------------------------------------------
----------------SERVICES
-------------------------------------------

--ServerScriptService/Services/AnticheatDiscordLogger (Script)
--Listens to the anticheat's flag event and forwards each flag to the bot.

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local ServerScriptService = game:GetService("ServerScriptService")

-------------------------------------------
----------------VARIABLES
-------------------------------------------

local AnticheatTypes = require(ReplicatedStorage.Types.AnticheatTypes)
local DiscordBridge = require(ServerScriptService.Services.DiscordBridge)

local BindableEvents = ReplicatedStorage:WaitForChild("Bindables"):WaitForChild("Events")
local FlagBindable : BindableEvent = BindableEvents:WaitForChild("AnticheatFlag") :: BindableEvent

local KickThreshold = 10 --Keep in sync with Config.KickThreshold in AnticheatService
local CooldownSeconds = 10 --Per player per check, stops a burst of flags from flooding the channel

local LastSent : {[Player] : {[string] : number}} = {}

-------------------------------------------
----------------FUNCTIONS
-------------------------------------------

local OnFlag : AnticheatTypes.FlagCallback = function(Player, CheckName, Reason, Weight, Score)

	local PlayerCooldowns = LastSent[Player] or {}
	LastSent[Player] = PlayerCooldowns

	local Now = os.clock()
	local OnCooldown = Now - (PlayerCooldowns[CheckName] or -math.huge) < CooldownSeconds

	--Never swallow the flag that reaches the kick threshold
	if OnCooldown and Score < KickThreshold then
		return
	end

	PlayerCooldowns[CheckName] = Now

	DiscordBridge.SendFlag({
		PlayerName = Player.Name,
		UserID = Player.UserId,
		CheckName = CheckName,
		Reason = Reason,
		Weight = Weight,
		Score = Score,
		KickThreshold = KickThreshold,
		JobID = game.JobId,
		PlaceID = game.PlaceId,
	})
end

FlagBindable.Event:Connect(OnFlag)

Players.PlayerRemoving:Connect(function(Player : Player)

	LastSent[Player] = nil

end)
