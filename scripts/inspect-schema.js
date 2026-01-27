const mysql = require('mysql2/promise');

async function inspectSchema() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: Number(process.env.DB_PORT),
        });

        console.log('Connected. Fetching one row from rm_users...');
        const [rows] = await connection.query('SELECT * FROM rm_users LIMIT 1');
        console.log('Row Data:', rows[0]);

        console.log('\nFetching columns information...');
        const [columns] = await connection.query('SHOW COLUMNS FROM rm_users');
        console.log('Columns:', columns.map(c => c.Field).join(', '));

        await connection.end();
    } catch (error) {
        console.error('Error:', error.message);
    }
}

inspectSchema();
