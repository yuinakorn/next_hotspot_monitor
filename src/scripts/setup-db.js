const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
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
        await connection.query(`
            CREATE TABLE IF NOT EXISTS web_users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) NOT NULL UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
                fullname VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Table web_users ensured.');

        const [existing] = await connection.query('SELECT COUNT(*) as count FROM web_users');
        if (existing[0].count === 0) {
            console.log('Seeding users...');
            const adminPass = await bcrypt.hash('password', 10);
            const userPass = await bcrypt.hash('password', 10);

            await connection.query(`
                INSERT INTO web_users (username, password_hash, role, fullname)
                VALUES 
                (?, ?, 'admin', 'System Administrator'),
                (?, ?, 'user', 'Normal User')
            `, ['admin', adminPass, 'user', userPass]);
            console.log('Seeded admin/password and user/password.');
        } else {
            console.log('Data already exists.');
        }

    } catch (e) {
        console.error('Error:', e);
    } finally {
        await connection.end();
    }
}

main();
