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
