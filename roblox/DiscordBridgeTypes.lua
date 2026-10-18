--!strict

-------------------------------------------
----------------TYPES
-------------------------------------------

--ReplicatedStorage/Types/DiscordBridgeTypes (ModuleScript)
--Types only, nothing secret in here.

export type Config = {
	BaseURL : string,
	Secret : string,
	SendInStudio : boolean,
	MinimumSendInterval : number,
	MaxQueueSize : number,
	MaxRetries : number,
}

--Matches what the bot expects on POST /anticheat/flag
export type FlagData = {
	PlayerName : string,
	UserID : number,
	CheckName : string,
	Reason : string,
	Score : number,
	Weight : number?,
	KickThreshold : number?,
	JobID : string?,
	PlaceID : number?,
}

export type EmbedField = {
	Name : string,
	Value : string,
	Inline : boolean?,
}

--Matches what the bot expects on POST /anticheat/embed
export type EmbedData = {
	Title : string?,
	Description : string?,
	Color : (number | string)?, --Number, or "#RRGGBB"
	Fields : {EmbedField}?,
	FooterText : string?,
	ThumbnailURL : string?,
	ImageURL : string?,
	Timestamp : boolean?,
}

return {}
