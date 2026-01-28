import pool from './db';
import { RowDataPacket } from 'mysql2';

interface DashboardSummary {
    activeUsers: number;
    inactiveUsers: number;
    totalUsers: number;
    activePercentage: string;
}

interface LoginTrend {
    date: string;
    count: number;
}

interface InactiveUser {
    username: string;
    firstname?: string;
    lastname?: string;
    company?: string;
    lastLogin: string | null;
    daysInactive: number | null;
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
    const connection = await pool.getConnection();
    try {
        // Total users from rm_users
        const [totalRows] = await connection.query<RowDataPacket[]>(
            'SELECT COUNT(username) as count FROM rm_users'
        );
        const totalUsers = totalRows[0].count;

        // Active users: users who have logged in within the last 90 days
        // We join rm_users to ensure we only count valid users
        const [activeRows] = await connection.query<RowDataPacket[]>(`
      SELECT COUNT(DISTINCT r.username) as count
      FROM rm_users u
      JOIN radacct r ON u.username = r.username
      WHERE r.acctstarttime >= DATE_SUB(NOW(), INTERVAL 90 DAY)
    `);
        const activeUsers = activeRows[0].count;

        const inactiveUsers = totalUsers - activeUsers;
        const activePercentage = totalUsers > 0
            ? ((activeUsers / totalUsers) * 100).toFixed(2)
            : '0.00';

        return {
            activeUsers,
            inactiveUsers,
            totalUsers,
            activePercentage,
        };
    } finally {
        connection.release();
    }
}

export async function getLoginTrends(days: number = 30): Promise<LoginTrend[]> {
    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.query<RowDataPacket[]>(`
      SELECT 
        DATE_FORMAT(acctstarttime, '%Y-%m-%d') as date,
        COUNT(DISTINCT username) as count
      FROM radacct
      WHERE acctstarttime >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY date
      ORDER BY date ASC
    `, [days]);

        return rows as LoginTrend[];
    } finally {
        connection.release();
    }
}

export async function getInactiveUsers(daysThreshold: number = 90): Promise<InactiveUser[]> {
    const connection = await pool.getConnection();
    try {
        // Strategy:
        // 1. Get last login for EVERY user
        // 2. Filter for those where last_login < threshold OR last_login is NULL
        const [rows] = await connection.query<RowDataPacket[]>(`
      SELECT 
        u.username,
        u.firstname,
        u.lastname,
        u.company,
        MAX(r.acctstarttime) as lastLogin,
        DATEDIFF(NOW(), MAX(r.acctstarttime)) as daysInactive
      FROM rm_users u
      LEFT JOIN radacct r ON u.username = r.username
      GROUP BY u.username, u.firstname, u.lastname, u.company
      HAVING lastLogin < DATE_SUB(NOW(), INTERVAL ? DAY) OR lastLogin IS NULL
      ORDER BY daysInactive DESC
    `, [daysThreshold]);

        return rows as InactiveUser[];
    } finally {
        connection.release();
    }
}

export interface DailyNetworkUsage {
    date: string;
    download: number; // in GB
    upload: number;   // in GB
}

export interface TopDataUser {
    username: string;
    firstname?: string;
    lastname?: string;
    totalDownload: number; // in GB
    totalUpload: number;   // in GB
    totalUsage: number;    // in GB
}

export async function getDailyNetworkUsage(days: number = 30): Promise<DailyNetworkUsage[]> {
    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.query<RowDataPacket[]>(`
      SELECT 
        DATE_FORMAT(acctstarttime, '%Y-%m-%d') as date,
        SUM(dlbytes) as download,
        SUM(ulbytes) as upload
      FROM rm_dailyacct
      WHERE acctstarttime >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY date
      ORDER BY date ASC
    `, [days]);

        return rows.map((row: any) => ({
            date: row.date,
            download: Number((row.download / 1073741824).toFixed(2)), // Convert Bytes to GB
            upload: Number((row.upload / 1073741824).toFixed(2))     // Convert Bytes to GB
        }));
    } finally {
        connection.release();
    }
}

export async function getTopDataUsers(limit: number = 5): Promise<TopDataUser[]> {
    const connection = await pool.getConnection();
    try {
        // We join with rm_users to get names if available
        const [rows] = await connection.query<RowDataPacket[]>(`
      SELECT 
        d.username,
        u.firstname,
        u.lastname,
        SUM(d.dlbytes) as totalDownload,
        SUM(d.ulbytes) as totalUpload,
        SUM(d.dlbytes + d.ulbytes) as totalUsage
      FROM rm_dailyacct d
      LEFT JOIN rm_users u ON d.username = u.username
      GROUP BY d.username, u.firstname, u.lastname
      ORDER BY totalUsage DESC
      LIMIT ?
    `, [limit]);

        return rows.map((row: any) => ({
            username: row.username,
            firstname: row.firstname,
            lastname: row.lastname,
            totalDownload: Number((row.totalDownload / 1073741824).toFixed(2)),
            totalUpload: Number((row.totalUpload / 1073741824).toFixed(2)),
            totalUsage: Number((row.totalUsage / 1073741824).toFixed(2))
        }));
    } finally {
        connection.release();
    }
}

// --- User Management Types & Functions ---

export interface ServicePlan {
    srvid: number;
    srvname: string;
    unitprice?: number;
    unit?: string;
}

export interface UserManagementData {
    username: string;
    password?: string; // Only for input/display if needed, sensitive
    firstname: string;
    lastname: string;
    company: string;
    srvid: number | null;
    srvname?: string; // Display only
    created?: string;
    last_seen?: string | null;
}

export async function getAllUsers(): Promise<UserManagementData[]> {
    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.query<RowDataPacket[]>(`
            SELECT 
                u.username,
                u.firstname,
                u.lastname,
                u.company,
                u.srvid,
                u.createdon as created,
                s.srvname,
                MAX(CASE WHEN r.attribute = 'Cleartext-Password' THEN r.value END) as password,
                (SELECT MAX(acctstarttime) FROM radacct WHERE username = u.username) as last_seen
            FROM rm_users u
            LEFT JOIN rm_services s ON u.srvid = s.srvid
            LEFT JOIN radcheck r ON u.username = r.username
            GROUP BY u.username, u.firstname, u.lastname, u.company, u.srvid, u.createdon, s.srvname
            ORDER BY u.username ASC
        `);
        return rows as UserManagementData[];
    } finally {
        connection.release();
    }
}

export async function getServices(): Promise<ServicePlan[]> {
    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.query<RowDataPacket[]>('SELECT * FROM rm_services');
        return rows as ServicePlan[];
    } finally {
        connection.release();
    }
}

export async function createUser(userData: UserManagementData): Promise<void> {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Insert into rm_users
        await connection.query(`
            INSERT INTO rm_users (username, firstname, lastname, company, srvid)
            VALUES (?, ?, ?, ?, ?)
        `, [userData.username, userData.firstname, userData.lastname, userData.company, userData.srvid]);

        // 2. Insert into radcheck (Password)
        if (userData.password) {
            await connection.query(`
                INSERT INTO radcheck (username, attribute, op, value)
                VALUES (?, 'Cleartext-Password', ':=', ?)
            `, [userData.username, userData.password]);

            // Included based on common pattern in uploaded image: Simultaneous-Use := 3
            await connection.query(`
                INSERT INTO radcheck (username, attribute, op, value)
                VALUES (?, 'Simultaneous-Use', ':=', '3')
            `, [userData.username]);
        }

        await connection.commit();
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

export async function updateUser(username: string, userData: Partial<UserManagementData>): Promise<void> {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Update rm_users
        // Build dynamic query for rm_users
        const userFields: string[] = [];
        const userValues: any[] = [];

        if (userData.firstname !== undefined) { userFields.push('firstname = ?'); userValues.push(userData.firstname); }
        if (userData.lastname !== undefined) { userFields.push('lastname = ?'); userValues.push(userData.lastname); }
        if (userData.company !== undefined) { userFields.push('company = ?'); userValues.push(userData.company); }
        if (userData.srvid !== undefined) { userFields.push('srvid = ?'); userValues.push(userData.srvid); }

        if (userFields.length > 0) {
            userValues.push(username);
            await connection.query(`UPDATE rm_users SET ${userFields.join(', ')} WHERE username = ?`, userValues);
        }

        // 2. Update radcheck (Password) if provided
        if (userData.password) {
            // Check if password entry exists
            const [rows] = await connection.query<RowDataPacket[]>(
                "SELECT id FROM radcheck WHERE username = ? AND attribute = 'Cleartext-Password'",
                [username]
            );

            if (rows.length > 0) {
                await connection.query(
                    "UPDATE radcheck SET value = ? WHERE username = ? AND attribute = 'Cleartext-Password'",
                    [userData.password, username]
                );
            } else {
                await connection.query(`
                    INSERT INTO radcheck (username, attribute, op, value)
                    VALUES (?, 'Cleartext-Password', ':=', ?)
                `, [username, userData.password]);
            }
        }

        await connection.commit();
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

export async function deleteUser(username: string): Promise<void> {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        await connection.query('DELETE FROM rm_users WHERE username = ?', [username]);
        await connection.query('DELETE FROM radcheck WHERE username = ?', [username]);
        // Also clean up radacct? Maybe optional, but good for privacy/cleanup. 
        // Keeping accounting logs is usually preferred, so skipping radacct delete.

        await connection.commit();
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}
