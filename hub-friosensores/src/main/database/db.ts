import Database from 'better-sqlite3';

const isTest = process.env.NODE_ENV === 'test' ||
    process.argv.some(arg => arg.includes('vitest') || arg.includes('mocha') || arg.includes('jest')) ||
    !!process.env.VITEST;

export const db = new Database(isTest ? ':memory:' : 'hub.db');

db.exec(`
    CREATE TABLE IF NOT EXISTS sensores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        externalId INTEGER,
        nickname TEXT,
        fullName TEXT
    );

    CREATE TABLE IF NOT EXISTS registros (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sensor_id INTEGER,
        valor REAL,
        unidad TEXT,
        nivel_bateria INTEGER,
        timestamp INTEGER,
        FOREIGN KEY (sensor_id) REFERENCES sensores(id)
    );
`);
