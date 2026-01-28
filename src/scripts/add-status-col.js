const mysql = require('mysql2/promise');
require('dotenv').config();

async function main() {
    console.log('Connecting to DB...', process.env.DB_HOST);
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: Number(process.env.DB_PORT)
    });

    try {
        console.log('Connected.');

        // Add status column if not exists
        // MySQL doesn't have "ADD COLUMN IF NOT EXISTS" easily in one line without procedure for older versions,
        // but let's try a safe approach: check columns first or just try-catch the error.
        try {
            await connection.query(`
                ALTER TABLE web_users 
                ADD COLUMN status ENUM('active', 'disabled') NOT NULL DEFAULT 'active' AFTER role;
            `);
            console.log('Added status column.');
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log('Status column already exists.');
            } else {
                throw e;
            }
        }

    } catch (e) {
        console.error('Error:', e);
    } finally {
        await connection.end();
    }
}

main();
