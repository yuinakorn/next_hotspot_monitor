import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import * as bcrypt from 'bcryptjs';

export async function GET() {
    console.log('Starting Setup...');
    try {
        const connection = await pool.getConnection();
        console.log('DB Connection successful');
        try {
            await connection.beginTransaction();

            // Create table
            await connection.query(`
                CREATE TABLE IF NOT EXISTS web_users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    username VARCHAR(50) NOT NULL UNIQUE,
                    password_hash VARCHAR(255) NOT NULL,
                    role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
                    fullname VARCHAR(100),
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `);
            console.log('Table created or exists');

            // Check if users exist
            const [existing]: any = await connection.query('SELECT COUNT(*) as count FROM web_users');
            if (existing[0].count === 0) {
                console.log('Seeding data...');
                const adminPass = await bcrypt.hash('password', 10);
                const userPass = await bcrypt.hash('password', 10);

                // Seed Admin
                await connection.query(`
                    INSERT INTO web_users (username, password_hash, role, fullname)
                    VALUES (?, ?, 'admin', 'System Administrator')
                `, ['admin', adminPass]);

                // Seed User
                await connection.query(`
                    INSERT INTO web_users (username, password_hash, role, fullname)
                    VALUES (?, ?, 'user', 'Normal User')
                `, ['user', userPass]);

                await connection.commit();
                console.log('Seeding complete');
                return NextResponse.json({ message: 'Table created and users seeded successfully.' });
            }

            await connection.commit();
            console.log('Already seeded');
            return NextResponse.json({ message: 'Table exists and already has data. Verification complete.' });

        } catch (error: any) {
            await connection.rollback();
            console.error('Setup Transaction Error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        } finally {
            connection.release();
        }
    } catch (err: any) {
        console.error('Setup Global Error:', err);
        return NextResponse.json({ error: 'Global Error: ' + err.message }, { status: 500 });
    }
}
