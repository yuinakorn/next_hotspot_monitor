const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

// Manually parse .env
try {
    const envPath = path.resolve(process.cwd(), '.env');
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            process.env[key.trim()] = value.trim();
        }
    });
} catch (e) {
    console.log('Could not read .env file', e.message);
}

async function inspect() {
    console.log('Connecting...');
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: Number(process.env.DB_PORT),
        });

        const tables = ['rm_users', 'radcheck', 'rm_services'];

        for (const table of tables) {
            console.log(`\n\n--- Table: ${table} ---`);
            try {
                const [columns] = await connection.query(`SHOW COLUMNS FROM ${table}`);
                console.log('Columns:');
                columns.forEach(c => console.log(` - ${c.Field} (${c.Type})`));

                const [rows] = await connection.query(`SELECT * FROM ${table} LIMIT 3`);
                console.log('Sample Data:');
                console.dir(rows, { depth: null });
            } catch (err) {
                console.error(`Error inspecting ${table}:`, err.message);
            }
        }
        await connection.end();
    } catch (err) {
        console.error('Connection failed:', err);
    }
}

inspect();
