import { DatabaseSync } from "node:sqlite";
import fs from "fs";
import path from "path";

let Database = null;

// A Railway volume is mounted at RAILWAY_VOLUME_MOUNT_PATH, so the file survives redeploys there
function ResolveDatabasePath(){

    if(process.env.databasePath) return process.env.databasePath;

    if(process.env.RAILWAY_VOLUME_MOUNT_PATH){

        return path.join(process.env.RAILWAY_VOLUME_MOUNT_PATH, "botstuff.db");

    }

    if(process.env.RAILWAY_ENVIRONMENT){

        console.log("WARNING: no Railway volume is attached, flag logs will be wiped on every deploy");

    }

    return path.join("data", "botstuff.db");
}

export function GetDatabase(){

    if(Database) return Database;

    const DatabasePath = ResolveDatabasePath();
    fs.mkdirSync(path.dirname(DatabasePath), {recursive: true});

    Database = new DatabaseSync(DatabasePath);

    Database.exec("PRAGMA journal_mode = WAL;");

    Database.exec(`
        CREATE TABLE IF NOT EXISTS Flags (
            ID INTEGER PRIMARY KEY AUTOINCREMENT,
            UserID INTEGER NOT NULL,
            PlayerName TEXT NOT NULL,
            CheckName TEXT NOT NULL,
            Reason TEXT NOT NULL,
            Weight REAL,
            Score REAL NOT NULL,
            KickThreshold REAL,
            JobID TEXT,
            PlaceID INTEGER,
            CreatedAt INTEGER NOT NULL
        );
    `);

    Database.exec("CREATE INDEX IF NOT EXISTS FlagsByUser ON Flags (UserID, CreatedAt);");
    Database.exec("CREATE INDEX IF NOT EXISTS FlagsByTime ON Flags (CreatedAt);");

    console.log(`Database ready at ${DatabasePath}`);

    return Database;
}

function Clamp(Text, MaxLength){

    return String(Text).slice(0, MaxLength);

}

/**
 * Stores one flag from the game. Expected data: UserID, PlayerName, CheckName, Reason, Score,
 * and optionally Weight, KickThreshold, JobID, PlaceID.
 */

export function InsertFlag(Data){

    return GetDatabase().prepare(`
        INSERT INTO Flags (UserID, PlayerName, CheckName, Reason, Weight, Score, KickThreshold, JobID, PlaceID, CreatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
        Data.UserID,
        Clamp(Data.PlayerName, 100),
        Clamp(Data.CheckName, 100),
        Clamp(Data.Reason, 1000),
        Data.Weight ?? null,
        Data.Score,
        Data.KickThreshold ?? null,
        Data.JobID ? Clamp(Data.JobID, 100) : null,
        Data.PlaceID ?? null,
        Date.now()
    );
}

/**
 * Totals for one player. Returns null when the player has no stored flags.
 * ThresholdHits counts flags where the score reached the kick threshold (10 when the game didn't send one).
 */

export function GetPlayerSummary(UserID){

    const Summary = GetDatabase().prepare(`
        SELECT
            COUNT(*) AS TotalFlags,
            SUM(CASE WHEN CreatedAt >= ? THEN 1 ELSE 0 END) AS FlagsLast24Hours,
            MAX(Score) AS HighestScore,
            SUM(CASE WHEN Score >= COALESCE(KickThreshold, 10) THEN 1 ELSE 0 END) AS ThresholdHits,
            MIN(CreatedAt) AS FirstFlag,
            MAX(CreatedAt) AS LastFlag
        FROM Flags
        WHERE UserID = ?
    `).get(Date.now() - 24 * 60 * 60 * 1000, UserID);

    if(!Summary || Summary.TotalFlags === 0) return null;

    const TopChecks = GetDatabase().prepare(`
        SELECT CheckName, COUNT(*) AS Count
        FROM Flags
        WHERE UserID = ?
        GROUP BY CheckName
        ORDER BY Count DESC
        LIMIT 5
    `).all(UserID);

    const LastName = GetDatabase().prepare(`
        SELECT PlayerName FROM Flags WHERE UserID = ? ORDER BY ID DESC LIMIT 1
    `).get(UserID);

    return {...Summary, TopChecks, LastName: LastName?.PlayerName ?? null};
}

// Newest first. CheckName is optional.
export function GetPlayerFlags(UserID, CheckName, Limit){

    if(CheckName){

        return GetDatabase().prepare(`
            SELECT * FROM Flags WHERE UserID = ? AND CheckName = ? ORDER BY ID DESC LIMIT ?
        `).all(UserID, CheckName, Limit);

    }

    return GetDatabase().prepare(`
        SELECT * FROM Flags WHERE UserID = ? ORDER BY ID DESC LIMIT ?
    `).all(UserID, Limit);
}

// Newest flags across every player
export function GetLatestFlags(Limit){

    return GetDatabase().prepare(`
        SELECT * FROM Flags ORDER BY ID DESC LIMIT ?
    `).all(Limit);
}

// Check names that contain the typed text, for command autocomplete
export function SearchCheckNames(Text){

    return GetDatabase().prepare(`
        SELECT DISTINCT CheckName FROM Flags
        WHERE instr(lower(CheckName), lower(?)) > 0
        ORDER BY CheckName
        LIMIT 25
    `).all(Text).map(Row => Row.CheckName);
}
