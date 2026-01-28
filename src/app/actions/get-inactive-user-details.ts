'use server';

import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export interface InactiveUserDetails {
    username: string;
    firstname: string;
    lastname: string;
    company: string;
    srvname: string;
    created: string;
    totalDownload: number;
    totalUpload: number;
    lastLogin: string | null;
    lastMac: string | null;
    lastIp: string | null;
}

export async function getInactiveUserDetails(username: string): Promise<InactiveUserDetails | null> {
    const connection = await pool.getConnection();
    try {
        // Get User Profile & Service
        const [userRows] = await connection.query<RowDataPacket[]>(`
      SELECT 
        u.username, u.firstname, u.lastname, u.company, u.createdon,
        s.srvname
      FROM rm_users u
      LEFT JOIN rm_services s ON u.srvid = s.srvid
      WHERE u.username = ?
    `, [username]);

        if (userRows.length === 0) return null;
        const user = userRows[0];

        // Get Total Usage (Sum of octets)
        const [usageRows] = await connection.query<RowDataPacket[]>(`
      SELECT 
        SUM(acctinputoctets) as input,
        SUM(acctoutputoctets) as output
      FROM radacct
      WHERE username = ?
    `, [username]);

        // Get Last Session Info
        const [sessionRows] = await connection.query<RowDataPacket[]>(`
        SELECT 
            acctstarttime, 
            callingstationid, 
            framedipaddress
        FROM radacct
        WHERE username = ?
        ORDER BY acctstarttime DESC
        LIMIT 1
    `, [username]);

        const usage = usageRows[0] || { input: 0, output: 0 };
        const lastSession = sessionRows[0] || {};

        return {
            username: user.username,
            firstname: user.firstname || '',
            lastname: user.lastname || '',
            company: user.company || '',
            srvname: user.srvname || 'Unknown',
            created: user.createdon ? new Date(user.createdon).toISOString() : '',
            totalDownload: Number(usage.output || 0), // acctoutputoctets is usually download for user
            totalUpload: Number(usage.input || 0),   // acctinputoctets is usually upload for user
            lastLogin: lastSession.acctstarttime ? new Date(lastSession.acctstarttime).toISOString() : null,
            lastMac: lastSession.callingstationid || null,
            lastIp: lastSession.framedipaddress || null,
        };

    } catch (error) {
        console.error('Error fetching inactive user details:', error);
        return null;
    } finally {
        connection.release();
    }
}
