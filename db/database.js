const Database = require("better-sqlite3");

const db = new Database("./db/stats_counters.db");

db.exec(`

    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS version (
        version     TEXT PRIMARY KEY
    );

    INSERT OR IGNORE INTO version (version) VALUES ('0.1');

    CREATE TABLE IF NOT EXISTS commands (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        command         TEXT NOT NULL UNIQUE,
        shortcut        TEXT UNIQUE,
        type            TEXT NOT NULL,
        functionName    TEXT NOT NULL,
        params          TEXT,
        description     TEXT
    );    

    CREATE TABLE IF NOT EXISTS counters (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        name        TEXT NOT NULL UNIQUE,
        shortcut    TEXT UNIQUE
    );

    CREATE TABLE IF NOT EXISTS months (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        month_label TEXT    NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
        id           INTEGER PRIMARY KEY AUTOINCREMENT,
        month_id     INTEGER NOT NULL,
        session_date TEXT    NOT NULL,
        FOREIGN KEY (month_id) REFERENCES months (id)
    );

    CREATE TABLE IF NOT EXISTS session_counters (
        session_id INTEGER NOT NULL,
        counter_id INTEGER NOT NULL,
        value      INTEGER NOT NULL,
        PRIMARY KEY (session_id, counter_id),
        FOREIGN KEY (session_id) REFERENCES sessions (id),
        FOREIGN KEY (counter_id) REFERENCES counters (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS counter_stats_monthly (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        month_id    INTEGER NOT NULL,
        counter_id  INTEGER NOT NULL,
        total       INTEGER NOT NULL DEFAULT 0,
        actual_best INTEGER NOT NULL DEFAULT 0,
        best   INTEGER NOT NULL DEFAULT 0,
        best_date   TEXT NOT NULL,
        FOREIGN KEY (month_id) REFERENCES months (id),
        FOREIGN KEY (counter_id) REFERENCES counters (id) ON DELETE CASCADE,
        UNIQUE (month_id, counter_id)
    );

    CREATE TABLE IF NOT EXISTS counter_stats_global (
        counter_id  INTEGER PRIMARY KEY,
        total       INTEGER NOT NULL DEFAULT 0,
        actual_best INTEGER NOT NULL DEFAULT 0,
        best   INTEGER NOT NULL DEFAULT 0,
        best_date   TEXT NOT NULL,
        FOREIGN KEY (counter_id) REFERENCES counters (id) ON DELETE CASCADE
    );
    
    CREATE TABLE IF NOT EXISTS timer (
        timer_id        INTEGER PRIMARY KEY AUTOINCREMENT,
        remaining_time  INTEGER NOT NULL DEFAULT 0,
        enabled         BOOLEAN NOT NULL
    );

    INSERT OR IGNORE INTO timer (remaining_time, timer_id, enabled) VALUES (0, 1, 0);

    CREATE TABLE IF NOT EXISTS timer_parameters (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        start       INTEGER NOT NULL DEFAULT 0,
        follower    INTEGER NOT NULL DEFAULT 0,
        tip         INTEGET NOT NULL DEFAULT 0        
    );

    CREATE TABLE IF NOT EXISTS timer_events (
        id                  INTEGER PRIMARY KEY AUTOINCREMENT,
        timer_id            INTEGER NOT NULL,
        followers           BOOLEAN NOT NULL,
        tips                BOOLEAN NOT NULL,
        subs                BOOLEAN NOT NULL,
        subs_only_shared    BOOLEAN NOT NULL,
        goals               BOOLEAN NOT NULL,
        counters            BOOLEAN NOT NULL,
        FOREIGN KEY (timer_id) REFERENCES timer_parameters(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS timer_subs (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        timer_id    INTEGER NOT NULL,
        sub_id      TEXT NOT NULL,
        amount      INTEGER NOT NULL,
        enabled     BOOLEAN NOT NULL,
        FOREIGN KEY (timer_id) REFERENCES timer_parameters(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS timer_goals (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        timer_id    INTEGER NOT NULL,
        goal_id     TEXT NOT NULL,
        amount      INTEGER NOT NULL,
        enabled     BOOLEAN NOT NULL,
        FOREIGN KEY (timer_id) REFERENCES timer_parameters(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS timer_counters (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        timer_id    INTEGER NOT NULL,
        counter_id  INTEGER NOT NULL,
        amount      INTEGER NOT NULL,
        enabled     BOOLEAN NOT NULL,
        FOREIGN KEY (timer_id) REFERENCES timer_parameters(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS donothon_stats (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        followers   INTEGER NOT NULL DEFAULT 0,
        tips        INTEGER NOT NULL DEFAULT 0,
        goals       INTEGET NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS donothon_subs (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        donothon_id INTEGER NOT NULL,
        sub_id      TEXT NOT NULL,
        name        TEXT NOT NULL,
        price       INTEGER NOT NULL,
        color       TEXT NOT NULL,
        amount      INTEGER NOT NULL DEFAULT 0,
        FOREIGN KEY (donothon_id) REFERENCES donothon_stats(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS donothon_counters (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        donothon_id INTEGER NOT NULL,
        counter_id  INTEGER NOT NULL,
        name        TEXT NOT NULL,
        amount      INTEGER NOT NULL DEFAULT 0,
        FOREIGN KEY (donothon_id) REFERENCES donothon_stats(id) ON DELETE CASCADE
    );

    `);

module.exports = db;
