'use server';

import { cookies } from 'next/headers';
import { RowDataPacket } from 'mysql2';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';
import { encrypt } from '@/lib/auth';
import { redirect } from 'next/navigation';

export async function login(formData: FormData) {
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    if (!username || !password) {
        return { error: 'Missing credentials' };
    }

    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.query<RowDataPacket[]>(`
        SELECT * FROM web_users WHERE username = ?
    `, [username]);

        const user = rows[0];

        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
            return { error: 'Invalid username or password' };
        }

        if (user.status !== 'active') {
            return { error: 'Your account has been disabled. Please contact administrator.' };
        }

        // Create session
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        const session = await encrypt({
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
                fullname: user.fullname
            }
        });

        const cookieStore = await cookies();
        cookieStore.set('auth_token', session, {
            expires,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            path: '/'
        });

    } catch (error) {
        console.error('Login error:', error);
        return { error: 'Internal server error' };
    } finally {
        connection.release();
    }

    redirect('/');
}

export async function logout() {
    const cookieStore = await cookies();
    cookieStore.delete('auth_token');
    redirect('/login');
}
