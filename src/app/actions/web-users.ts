'use server';

import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';
import { getSession, encrypt } from '@/lib/auth';
import { cookies } from 'next/headers';

export interface WebUser {
    id: number;
    username: string;
    fullname: string;
    role: 'admin' | 'user';
    status: 'active' | 'disabled';
    created_at: string;
}

export async function getWebUsers(): Promise<WebUser[]> {
    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.query<RowDataPacket[]>('SELECT id, username, fullname, role, status, created_at FROM web_users ORDER BY id ASC');
        return rows as WebUser[];
    } finally {
        connection.release();
    }
}

export async function createWebUser(formData: FormData) {
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;
    const fullname = formData.get('fullname') as string;
    const role = formData.get('role') as string;
    const status = formData.get('status') as string;

    if (!username || !password) return { error: 'Username and password required' };

    const connection = await pool.getConnection();
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await connection.query(`
            INSERT INTO web_users (username, password_hash, fullname, role, status)
            VALUES (?, ?, ?, ?, ?)
        `, [username, hashedPassword, fullname || '', role || 'user', status || 'active']);

        revalidatePath('/settings/users');
        return { success: true };
    } catch (e: any) {
        if (e.code === 'ER_DUP_ENTRY') return { error: 'Username already exists' };
        return { error: 'Failed to create user' };
    } finally {
        connection.release();
    }
}

export async function updateWebUser(formData: FormData) {
    const id = formData.get('id');
    const fullname = formData.get('fullname') as string;
    const role = formData.get('role') as string;
    const password = formData.get('password') as string;
    const status = formData.get('status') as string;

    const connection = await pool.getConnection();
    try {
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            await connection.query(`
                UPDATE web_users SET fullname = ?, role = ?, status = ?, password_hash = ? WHERE id = ?
            `, [fullname, role, status, hashedPassword, id]);
        } else {
            await connection.query(`
                UPDATE web_users SET fullname = ?, role = ?, status = ? WHERE id = ?
            `, [fullname, role, status, id]);
        }
        revalidatePath('/settings/users');
        return { success: true };
    } catch (e) {
        return { error: 'Failed to update user' };
    } finally {
        connection.release();
    }
}

export async function deleteWebUser(id: number) {
    // Prevent deleting the main admin if wanted, but for now allow it (careful!)
    // Maybe checking if it's "admin" user specifically? 
    // Let's rely on frontend or just assume admins know what they are doing.
    const connection = await pool.getConnection();
    try {
        await connection.query('DELETE FROM web_users WHERE id = ?', [id]);
        revalidatePath('/settings/users');
        return { success: true };
    } catch (e) {
        return { error: 'Failed to delete user' };
    } finally {
        connection.release();
    }
}

export async function updateProfile(formData: FormData) {
    const session = await getSession();
    if (!session || !session.user) {
        return { error: 'Unauthorized' };
    }

    const id = session.user.id;
    const fullname = formData.get('fullname') as string;
    const password = formData.get('password') as string;

    const connection = await pool.getConnection();
    try {
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            await connection.query(`
                UPDATE web_users SET fullname = ?, password_hash = ? WHERE id = ?
            `, [fullname, hashedPassword, id]);
        } else {
            await connection.query(`
                UPDATE web_users SET fullname = ? WHERE id = ?
            `, [fullname, id]);
        }

        // Update session with new name
        const newSession = await encrypt({
            user: {
                ...session.user,
                fullname: fullname
            }
        });

        const cookieStore = await cookies();
        cookieStore.set('auth_token', newSession, {
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production' && !process.env.DISABLE_SECURE_COOKIE,
            path: '/'
        });

        revalidatePath('/settings/profile');
        return { success: true };
    } catch (e) {
        return { error: 'Failed to update profile' };
    } finally {
        connection.release();
    }
}
